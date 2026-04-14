import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@prisma/prisma.service';

import type { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;

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
            },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        return this.buildTokens(user.id, user.email, [], []);
    }

    async validateCredentials(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
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
            .filter((r) => r.country !== null)
            .map((r) => r.country!.code);
        return { id: user.id, email: user.email, nombre: user.name, roles, adminCountries };
    }

    async login(userId: string, email: string, roles: string[], adminCountries: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, phone: true },
        });
        if (!user) throw new UnauthorizedException('Usuario no encontrado');
        const tokens = this.buildTokens(userId, email, roles, adminCountries);
        return { ...tokens, user: { ...user, roles, adminCountries } };
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
                .filter((r) => r.country !== null)
                .map((r) => r.country!.code);
            return this.buildTokens(user.id, user.email, roles, adminCountries);
        } catch {
            throw new UnauthorizedException('Refresh token inválido o expirado');
        }
    }

    async googleLogin(idToken: string) {
        // Validate token with Google
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

        // Upsert: create user if doesn't exist, otherwise update name/avatar
        const user = await this.prisma.user.upsert({
            where: { email: googleUser.email },
            update: {
                name: googleUser.name || undefined,
                avatar: googleUser.picture || undefined,
            },
            create: {
                email: googleUser.email,
                name: googleUser.name || 'Usuario Google',
                avatar: googleUser.picture || null,
                password: '', // No password for Google users
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                roles: {
                    select: {
                        role: { select: { name: true } },
                        country: { select: { code: true } },
                    },
                },
            },
        });

        const roles = user.roles.map((r) => r.role.name);
        const adminCountries = user.roles
            .filter((r) => r.country !== null)
            .map((r) => r.country!.code);

        const tokens = this.buildTokens(user.id, user.email, roles, adminCountries);
        return { ...tokens, user: { ...user, roles, adminCountries } };
    }

    private buildTokens(sub: string, email: string, roles: string[], adminCountries: string[]) {
        const payload = { sub, email, roles, adminCountries };

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
