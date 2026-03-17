import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = ['password', 'refreshToken', 'passwordHash'];

function stripSensitiveFields(obj: unknown): unknown {
    if (Array.isArray(obj)) return obj.map(stripSensitiveFields);
    if (obj instanceof Prisma.Decimal) return obj.toNumber();
    if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj as Record<string, unknown>)
                .filter(([key]) => !SENSITIVE_FIELDS.includes(key))
                .map(([key, value]) => [key, stripSensitiveFields(value)]),
        );
    }
    return obj;
}

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(map(stripSensitiveFields));
    }
}
