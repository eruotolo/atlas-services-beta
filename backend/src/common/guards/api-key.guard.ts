import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly config: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'];
        const validKey = this.config.getOrThrow<string>('API_KEY');

        if (!apiKey || apiKey !== validKey) {
            throw new UnauthorizedException('API Key inválida');
        }

        return true;
    }
}
