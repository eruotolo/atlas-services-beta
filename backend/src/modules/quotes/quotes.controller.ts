import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar una cotización a un Service Request' })
  create(@Request() req: any, @Body() createQuoteDto: CreateQuoteDto) {
    // req.user.id es el ID del profesional
    return this.quotesService.create(req.user.id, createQuoteDto);
  }

  @Get('my-quotes')
  @ApiOperation({ summary: 'Listar las cotizaciones enviadas por el profesional autenticado' })
  findMyQuotes(@Request() req: any) {
    return this.quotesService.findAllByProvider(req.user.id);
  }

  @Get('request/:serviceRequestId')
  @ApiOperation({ summary: 'Ver todas las cotizaciones de un Service Request específico' })
  findByRequest(@Param('serviceRequestId') serviceRequestId: string) {
    return this.quotesService.findAllByServiceRequest(serviceRequestId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'El cliente acepta una cotización específica' })
  acceptQuote(@Request() req: any, @Param('id') id: string) {
    // req.user.id es el ID del cliente
    return this.quotesService.acceptQuote(req.user.id, id);
  }
}
