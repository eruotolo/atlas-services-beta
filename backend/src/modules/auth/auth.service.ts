import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { PrismaService } from '@prisma/prisma.service';

import type { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;

const APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));

const PROVIDER_ROLE_SELECT = {
    select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        roles: {
            select: {
                role: { select: { name: true } },
                country: { select: { code: true } },
            },
        },
    },
} as const;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
            select: { id: true },
        });
        if (exists) throw new ConflictException('El email ya está registrado');

        const hash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

        const user = await this.prisma.user.create({
            data: {
                name: dto.nombre,
                email: dto.email,
                password: hash,
                phone: dto.telefono,
                roles: { create: { role: { connect: { name: 'Client' } } } },
            },
            select: { id: true, email: true, name: true, avatar: true, createdAt: true },
        });

        const tokens = this.buildTokens(user.id, user.email, ['Client'], [], []);
        return { ...tokens, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } };
    }

    async validateCredentials(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                password: true,
                roles: {
                    select: {
                        role: { select: { name: true } },
                        country: { select: { code: true } },
                    },
                },
            },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const roles = user.roles.map((r) => r.role.name);
        const adminCountries = user.roles
            .filter((r) => r.role.name === 'Admin' && r.country !== null)
            .map((r) => r.country!.code);
        const providerCountries = user.roles
            .filter((r) => r.role.name === 'Professional' && r.country !== null)
            .map((r) => r.country!.code);
        return { id: user.id, email: user.email, nombre: user.name, avatar: user.avatar, roles, adminCountries, providerCountries };
    }

    async login(userId: string, email: string, roles: string[], adminCountries: string[], providerCountries: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, avatar: true, phone: true },
        });
        if (!user) throw new UnauthorizedException('Usuario no encontrado');
        const tokens = this.buildTokens(userId, email, roles, adminCountries, providerCountries);
        return { ...tokens, user: { ...user, roles, adminCountries, providerCountries } };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwt.verify<{ sub: string; email: string }>(
                refreshToken,
                { secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET') },
            );

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    roles: {
                        select: {
                            role: { select: { name: true } },
                            country: { select: { code: true } },
                        },
                    },
                },
            });

            if (!user) throw new UnauthorizedException();

            const roles = user.roles.map((r) => r.role.name);
            const adminCountries = user.roles
                .filter((r) => r.role.name === 'Admin' && r.country !== null)
                .map((r) => r.country!.code);
            const providerCountries = user.roles
                .filter((r) => r.role.name === 'Professional' && r.country !== null)
                .map((r) => r.country!.code);
            return this.buildTokens(user.id, user.email, roles, adminCountries, providerCountries);
        } catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
    }

    async googleLogin(idToken: string) {
        const googleRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        );

        if (!googleRes.ok) {
            throw new UnauthorizedException('Token de Google inválido');
        }

        const googleUser = (await googleRes.json()) as {
            sub: string;
            email: string;
            name: string;
            picture?: string;
        };

        if (!googleUser.email) {
            throw new UnauthorizedException('No se pudo obtener el email de Google');
        }

        const user = await this.prisma.user.upsert({
            where: { email: googleUser.email },
            update: {
                name: googleUser.name || undefined,
                avatar: googleUser.picture || undefined,
                googleId: googleUser.sub || undefined,
            },
            create: {
                email: googleUser.email,
                googleId: googleUser.sub || null,
                name: googleUser.name || 'Usuario Google',
                avatar: googleUser.picture || null,
                password: '',
                roles: { create: { role: { connect: { name: 'Client' } } } },
            },
            ...PROVIDER_ROLE_SELECT,
        });

        return this.buildUserResponse(user);
    }

    async appleLogin(idToken: string) {
        let applePayload: { sub?: unknown; email?: unknown };

        try {
            const { payload } = await jwtVerify(idToken, APPLE_JWKS, {
                issuer: 'https://appleid.apple.com',
                audience: this.config.getOrThrow<string>('APPLE_CLIENT_ID'),
            });
            applePayload = payload as { sub?: unknown; email?: unknown };
        } catch {
            throw new UnauthorizedException('Token de Apple inválido');
        }

        const appleId = typeof applePayload.sub === 'string' ? applePayload.sub : null;
        const email = typeof applePayload.email === 'string' ? applePayload.email : null;

        if (!appleId) {
            throw new UnauthorizedException('Token de Apple sin identificador de usuario');
        }

        // Try to find by appleId first (covers re-logins where Apple hides the email)
        const existing = await this.prisma.user.findUnique({
            where: { appleId },
            ...PROVIDER_ROLE_SELECT,
        });

        if (existing) return this.buildUserResponse(existing);

        // First login: email is present — upsert by email and bind appleId
        if (!email) {
            throw new UnauthorizedException('Apple no proporcionó email en el primer inicio de sesión');
        }

        const user = await this.prisma.user.upsert({
            where: { email },
            update: { appleId },
            create: {
                email,
                appleId,
                name: email.split('@')[0] ?? 'Usuario Apple',
                password: '',
                roles: { create: { role: { connect: { name: 'Client' } } } },
            },
            ...PROVIDER_ROLE_SELECT,
        });

        return this.buildUserResponse(user);
    }

    async microsoftLogin(accessToken: string) {
        const msRes = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!msRes.ok) {
            throw new UnauthorizedException('Token de Microsoft inválido');
        }

        const msUser = (await msRes.json()) as {
            id: string;
            displayName: string;
            mail?: string;
            userPrincipalName?: string;
        };

        const email = msUser.mail ?? msUser.userPrincipalName;
        if (!email) {
            throw new UnauthorizedException('No se pudo obtener el email de Microsoft');
        }

        const user = await this.prisma.user.upsert({
            where: { email },
            update: {
                name: msUser.displayName || undefined,
                microsoftId: msUser.id || undefined,
            },
            create: {
                email,
                microsoftId: msUser.id,
                name: msUser.displayName || 'Usuario Microsoft',
                password: '',
                roles: { create: { role: { connect: { name: 'Client' } } } },
            },
            ...PROVIDER_ROLE_SELECT,
        });

        return this.buildUserResponse(user);
    }

    private buildUserResponse(user: {
        id: string;
        email: string;
        name: string;
        avatar: string | null;
        phone: string | null;
        roles: { role: { name: string }; country: { code: string } | null }[];
    }) {
        const roles = user.roles.map((r) => r.role.name);
        const adminCountries = user.roles
            .filter((r) => r.role.name === 'Admin' && r.country !== null)
            .map((r) => r.country!.code);
        const providerCountries = user.roles
            .filter((r) => r.role.name === 'Professional' && r.country !== null)
            .map((r) => r.country!.code);
        const tokens = this.buildTokens(user.id, user.email, roles, adminCountries, providerCountries);
        return { ...tokens, user: { ...user, roles, adminCountries, providerCountries } };
    }

    private buildTokens(sub: string, email: string, roles: string[], adminCountries: string[], providerCountries: string[]) {
        const payload = { sub, email, roles, adminCountries, providerCountries };

        const accessToken = this.jwt.sign(payload, {
            secret: this.config.getOrThrow<string>('JWT_SECRET'),
            expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '30d'),
        });

        const refreshToken = this.jwt.sign(
            { sub, email },
            {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
            },
        );

        return { accessToken, refreshToken };
    }
}
