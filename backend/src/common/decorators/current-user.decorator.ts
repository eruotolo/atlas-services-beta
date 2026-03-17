import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { User } from '@prisma/client';

export type JwtPayload = {
    sub: string;
    email: string;
    roles: string[];
};

export type RequestWithUser = {
    user: JwtPayload & Pick<User, 'id' | 'email'> & { nombre: string };
};

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
        const request = ctx.switchToHttp().getRequest<RequestWithUser>();
        return request.user;
    },
);
