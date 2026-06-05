import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EXPOSE_TOKENS_KEY } from '@common/decorators/expose-tokens.decorator';

const SENSITIVE_FIELDS = ['password', 'refreshToken', 'passwordHash'];
// Campos que se filtran siempre, incluso en handlers con @ExposeTokens()
const ALWAYS_SENSITIVE_FIELDS = ['password', 'passwordHash'];

function stripSensitiveFields(obj: unknown, fields: string[]): unknown {
    if (Array.isArray(obj)) return obj.map((item) => stripSensitiveFields(item, fields));
    if (obj instanceof Prisma.Decimal) return obj.toNumber();
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj as Record<string, unknown>)
                .filter(([key]) => !fields.includes(key))
                .map(([key, value]) => [key, stripSensitiveFields(value, fields)]),
        );
    }
    return obj;
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const exposeTokens = this.reflector.getAllAndOverride<boolean>(EXPOSE_TOKENS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const fields = exposeTokens ? ALWAYS_SENSITIVE_FIELDS : SENSITIVE_FIELDS;
        return next.handle().pipe(map((data) => stripSensitiveFields(data, fields)));
    }
}
