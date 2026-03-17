import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WebhookGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const secret = req.headers['x-webhook-secret'];
        if (!secret || secret !== process.env.WEBHOOK_SECRET) {
            throw new UnauthorizedException('Invalid webhook secret');
        }
        return true;
    }
}
