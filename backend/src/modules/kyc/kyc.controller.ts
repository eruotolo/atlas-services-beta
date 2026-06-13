import { Controller, Post, Headers, UseGuards, Request, RawBodyRequest, Req } from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('session')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar URL para que el proveedor escanee su documento de identidad' })
  createSession(@Request() req: any) {
    return this.kycService.createVerificationSession(req.user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Recibir notificaciones asíncronas de Stripe Identity' })
  handleWebhook(
    @Req() req: RawBodyRequest<Request>, 
    @Headers('stripe-signature') signature: string
  ) {
    // req.rawBody se requiere habilitar en el main.ts (app.useBodyParser('raw'))
    // Para simplificar, se asume que req.body llega como buffer si se configura el middleware
    // o se pasa directamente en caso de mock.
    const payload = req.rawBody || JSON.stringify(req.body);
    const safeSignature = signature || 'mock_signature';
    return this.kycService.handleWebhook(payload as any, safeSignature);
  }
}
