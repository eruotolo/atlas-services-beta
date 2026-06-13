import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(providerId: string, createDto: CreateQuoteDto) {
    this.logger.log(`Proveedor ${providerId} creando cotización para ServiceRequest ${createDto.serviceRequestId}`);

    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id: createDto.serviceRequestId }
    });

    if (!serviceRequest) {
      throw new NotFoundException('ServiceRequest no encontrado');
    }

    if (serviceRequest.status === 'ACCEPTED' || serviceRequest.status === 'COMPLETED' || serviceRequest.status === 'CANCELLED') {
      throw new BadRequestException(`No se pueden enviar cotizaciones a un ServiceRequest en estado ${serviceRequest.status}`);
    }

    const quote = await this.prisma.quote.create({
      data: {
        userId: providerId,
        serviceRequestId: createDto.serviceRequestId,
        price: createDto.price,
        message: createDto.message,
        accepted: false
      }
    });

    // Actualizamos el estado del request a QUOTED si estaba en PENDING
    if (serviceRequest.status === 'PENDING') {
      await this.prisma.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: { status: 'QUOTED' }
      });
    }

    return quote;
  }

  async findAllByServiceRequest(serviceRequestId: string) {
    return this.prisma.quote.findMany({
      where: { serviceRequestId },
      include: {
        provider: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { price: 'asc' }
    });
  }

  async findAllByProvider(providerId: string) {
    return this.prisma.quote.findMany({
      where: { userId: providerId },
      include: {
        serviceRequest: {
          include: {
            category: true,
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async acceptQuote(clientId: string, quoteId: string) {
    this.logger.log(`Cliente ${clientId} aceptando la cotización ${quoteId}`);

    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { serviceRequest: true }
    });

    if (!quote) {
      throw new NotFoundException('Cotización no encontrada');
    }

    if (quote.serviceRequest.userId !== clientId) {
      throw new BadRequestException('No tienes permisos para aceptar esta cotización');
    }

    if (quote.accepted) {
      throw new BadRequestException('Esta cotización ya fue aceptada');
    }

    // Usamos una transacción para asegurar integridad de datos
    const [updatedQuote, updatedRequest] = await this.prisma.$transaction([
      this.prisma.quote.update({
        where: { id: quoteId },
        data: { accepted: true }
      }),
      this.prisma.serviceRequest.update({
        where: { id: quote.serviceRequestId },
        data: { status: 'ACCEPTED' }
      })
    ]);

    return { updatedQuote, updatedRequest };
  }
}
