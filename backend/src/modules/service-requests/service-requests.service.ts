import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDto: CreateServiceRequestDto) {
    this.logger.log(`Creando ServiceRequest para el usuario ${userId}`);
    
    // Verificar que la categoría exista
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: createDto.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const request = await this.prisma.serviceRequest.create({
      data: {
        userId,
        categoryId: createDto.categoryId,
        description: createDto.description,
        urgency: createDto.urgency,
        status: 'PENDING'
      },
      include: {
        category: true
      }
    });

    return request;
  }

  async findAllByUser(userId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { userId },
      include: {
        category: true,
        quotes: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        category: true,
        quotes: {
          include: {
            provider: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    if (!request) {
      throw new NotFoundException(`ServiceRequest ${id} no encontrado`);
    }

    return request;
  }

  async findAvailableForProvider(providerId: string) {
    // Obtener las categorías de los servicios activos del profesional
    const providerServices = await this.prisma.service.findMany({
      where: { userId: providerId, active: true },
      select: { categories: { select: { id: true } } }
    });

    const categoryIds = [
      ...new Set(providerServices.flatMap((s) => s.categories.map((c) => c.id)))
    ];

    // IDs de solicitudes que el pro ya cotizó (para excluirlas)
    const alreadyQuoted = await this.prisma.quote.findMany({
      where: { userId: providerId },
      select: { serviceRequestId: true }
    });
    const excludedIds = alreadyQuoted.map((q) => q.serviceRequestId);

    return this.prisma.serviceRequest.findMany({
      where: {
        ...(categoryIds.length > 0 ? { categoryId: { in: categoryIds } } : {}),
        status: { in: ['PENDING', 'QUOTED'] },
        ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
        userId: { not: providerId } // el pro no puede cotizarse a sí mismo
      },
      include: {
        category: true,
        user: { select: { id: true, name: true, avatar: true } },
        quotes: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
