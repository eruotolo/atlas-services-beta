import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getKanbanDashboard(providerId: string) {
    this.logger.log(`Obteniendo dashboard Kanban para el proveedor ${providerId}`);

    // 1. Cotizaciones Enviadas (Pendientes de aceptación)
    const activeQuotes = await this.prisma.quote.findMany({
      where: {
        userId: providerId,
        accepted: false,
        serviceRequest: {
          status: { in: ['PENDING', 'QUOTED'] }
        }
      },
      include: {
        serviceRequest: {
          include: { category: true, user: { select: { name: true } } }
        }
      }
    });

    // 2. Trabajos Ganados (Cotizaciones aceptadas)
    const wonJobs = await this.prisma.quote.findMany({
      where: {
        userId: providerId,
        accepted: true,
      },
      include: {
        serviceRequest: {
          include: { category: true, user: { select: { name: true, phone: true, email: true } } }
        }
      }
    });

    // 3. Nuevos Leads (ServiceRequests en categorías del proveedor sin cotizar por este proveedor)
    // Para simplificar, buscamos los roles/categorías del proveedor.
    // Asumiremos que el proveedor puede cotizar en cualquier solicitud pendiente por ahora,
    // o filtramos por solicitudes PENDING.
    const newLeads = await this.prisma.serviceRequest.findMany({
      where: {
        status: { in: ['PENDING', 'QUOTED'] },
        quotes: {
          none: { userId: providerId }
        }
      },
      include: {
        category: true,
        user: { select: { name: true } }
      },
      take: 20, // Limite de leads mostrados
      orderBy: { createdAt: 'desc' }
    });

    return {
      newLeads,
      activeQuotes,
      wonJobs,
      stats: {
        totalLeads: newLeads.length,
        totalActiveQuotes: activeQuotes.length,
        totalWonJobs: wonJobs.length
      }
    };
  }
}
