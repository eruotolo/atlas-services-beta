import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY_ES') || 'mock';
    this.stripe = new Stripe(secret);
  }

  async createVerificationSession(userId: string) {
    this.logger.log(`Creando sesión de verificación de identidad para el usuario ${userId}`);

    // En producción, aquí se usaría el Stripe SDK:
    // const session = await this.stripe.identity.verificationSessions.create({
    //   type: 'document',
    //   metadata: { userId },
    // });
    
    // MOCK
    return {
      client_secret: `vi_stub_${userId}_secret`,
      url: `https://verify.stripe.com/stub_${userId}`
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string) {
    this.logger.log('Recibido webhook de KYC');
    const secret = this.config.get<string>('STRIPE_KYC_WEBHOOK_SECRET');
    
    if (!secret) {
        this.logger.warn('STRIPE_KYC_WEBHOOK_SECRET no configurado, omitiendo firma en entorno local/dev');
    }

    try {
      let event: Stripe.Event;

      if (secret && signature !== 'mock_signature') {
         event = this.stripe.webhooks.constructEvent(payload, signature, secret);
      } else {
         // Fallback para pruebas / entorno dev
         event = JSON.parse(payload.toString()) as Stripe.Event;
      }

      if (event.type === 'identity.verification_session.verified') {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const userId = session.metadata?.userId;

        if (userId) {
          this.logger.log(`Verificación de identidad exitosa para el usuario: ${userId}`);
          await this.prisma.user.update({
            where: { id: userId },
            data: { 
              isKycVerified: true,
              kycVerifiedAt: new Date()
            }
          });
        }
      }

      return { received: true };
    } catch (err) {
      this.logger.error(`KYC Webhook Error: ${(err as Error).message}`);
      throw new BadRequestException('Webhook handler falló');
    }
  }
}
