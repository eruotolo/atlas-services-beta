import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import type { RequestWithUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const { user } = context.switchToHttp().getRequest<RequestWithUser>();
        
        // Mapeo de roles en base de datos a roles requeridos por controladores
        const normalizedUserRoles = user?.roles?.flatMap((role) => {
            if (role === 'SuperAdministrador') return ['SuperAdministrador', 'admin', 'superadmin'];
            if (role === 'Administrador') return ['Administrador', 'admin'];
            return [role];
        }) || [];

        return requiredRoles.some((role) => normalizedUserRoles.includes(role));
    }
}
