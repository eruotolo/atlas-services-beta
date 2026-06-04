import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * Guard que verifica si el usuario autenticado tiene rol de admin
 * en el país especificado en el parámetro de ruta `:countryCode`.
 *
 * Se usa en combinación con JwtAuthGuard — este guard asume que
 * request.user ya está poblado por el JWT strategy.
 *
 * El JWT emite `roles` (string[]) y `adminCountries` (string[]).
 * SuperAdministrador tiene acceso a todos los países.
 * Admin de país tiene acceso solo si su countryCode está en adminCountries.
 */
@Injectable()
export class CountryAdminGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request & { user?: JwtUserPayload }>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Se requiere autenticación');
        }

        // SuperAdministrador: acceso a todos los países
        if (user.roles?.includes('SuperAdministrador')) {
            return true;
        }

        const countryCode = request.params['countryCode'] ?? request.params['code'];

        if (!countryCode) {
            throw new ForbiddenException('Se requiere código de país en la ruta');
        }

        const code = (Array.isArray(countryCode) ? countryCode[0] : countryCode).toLowerCase();

        // Admin de país específico: valida que el countryCode esté en adminCountries del JWT
        // Maneja tanto el caso donde viene como array de strings (['cl']) o array de objetos ([{ code: 'cl' }])
        const adminCountries = user.adminCountries || [];
        const hasCountryAccess = adminCountries.some((country: any) => {
            if (typeof country === 'string') {
                return country.toLowerCase() === code;
            }
            // En caso de que el JWT traiga la relación directa del ORM
            const countryCode = country?.code || country?.countryCode || country?.id;
            return typeof countryCode === 'string' && countryCode.toLowerCase() === code;
        });

        if (!hasCountryAccess) {
            throw new ForbiddenException(
                `No tienes permisos de administrador para el país: ${code}`,
            );
        }

        return true;
    }
}

interface JwtUserPayload {
    sub: string;
    email: string;
    roles?: string[];
    adminCountries?: string[];
}
