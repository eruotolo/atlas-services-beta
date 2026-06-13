import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { CreateEscrowPaymentDto } from './dto/create-escrow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Escrow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Generar link de pago Escrow (Split Payment) para una Cotización' })
  createCheckout(@Request() req: any, @Body() dto: CreateEscrowPaymentDto) {
    return this.escrowService.generateCheckoutLink(req.user.id, dto.quoteId);
  }
}
