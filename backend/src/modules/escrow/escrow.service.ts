import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly PLATFORM_FEE_PERCENTAGE = 0.15; // 15% Take Rate

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService
  ) {}

  async generateCheckoutLink(clientId: string, quoteId: string) {
    this.logger.log(`Generando link de pago Escrow para la cotización ${quoteId}`);

    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { 
        serviceRequest: { include: { user: true } },
        provider: true
      }
    });

    if (!quote) throw new NotFoundException('Cotización no encontrada');
    if (quote.serviceRequest.userId !== clientId) throw new BadRequestException('No tienes permiso para pagar esta cotización');
    if (quote.accepted) throw new BadRequestException('Esta cotización ya está pagada o aceptada');

    const amountStr = quote.price.toString();
    const amount = parseFloat(amountStr);
    const platformFee = amount * this.PLATFORM_FEE_PERCENTAGE;
    const providerAmount = amount - platformFee;

    // Asumiremos país 'es' por defecto si no hay país explícito para usar Stripe
    const countryCode = 'es'; 
    const gateway = this.paymentsService.resolveGateway(countryCode);

    // MOCK: Generar Preference con Split Payment
    // En producción, aquí se pasaría `application_fee_amount` en Stripe 
    // o `marketplace_fee` en MercadoPago.
    this.logger.log(`Split Payment: Total ${amount} | Provider ${providerAmount} | Platform Fee ${platformFee}`);

    const paymentResult = await gateway.createPayment({
      amount: amount,
      currency: 'EUR',
      description: `Pago por servicio: ${quote.serviceRequest.description.substring(0, 30)}...`,
      externalReference: `quote_${quote.id}`
    });

    return {
      quoteId: quote.id,
      amount,
      platformFee,
      providerAmount,
      paymentUrl: paymentResult.checkoutUrl || paymentResult.clientSecret
    };
  }
}
