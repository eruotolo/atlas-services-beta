import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { PricesService } from '../prices/prices.service';
import { ServicesService } from '../services/services.service';

import type { CreateSubscriptionDto } from './dto/create-subscription.dto';

const SUBSCRIPTION_SELECT = {
    id: true,
    durationMonths: true,
    amount: true,
    currency: true,
    paymentGateway: true,
    paymentMethod: true,
    paymentStatus: true,
    transactionId: true,
    active: true,
    endDate: true,
    createdAt: true,
    service: { select: { id: true, title: true, userId: true } },
} as const;

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly servicesService: ServicesService,
        private readonly pricesService: PricesService,
        private readonly paymentsService: PaymentsService,
    ) {}

    async findById(id: string, requesterId: string, requesterRoles: string[]) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id },
            select: SUBSCRIPTION_SELECT,
        });
        if (!subscription) throw new NotFoundException(`Suscripción ${id} no encontrada`);

        const isAdmin = requesterRoles.includes('admin');
        if (subscription.service.userId !== requesterId && !isAdmin) {
            throw new ForbiddenException('No tienes acceso a esta suscripción');
        }

        return subscription;
    }

    async create(dto: CreateSubscriptionDto, userId: string) {
        const service = await this.servicesService.findById(dto.serviceId);
        if (!service) throw new NotFoundException(`Servicio ${dto.serviceId} no encontrado`);
        if (service.userId !== userId) {
            throw new ForbiddenException('Solo puedes suscribir tus propios servicios');
        }

        const existing = await this.prisma.subscription.findUnique({
            where: { serviceId: dto.serviceId },
            select: { id: true, active: true, serviceId: true },
        });
        if (existing?.active) throw new ConflictException('Este servicio ya tiene una suscripción activa');

        const country = await this.prisma.country.findUnique({
            where: { code: dto.countryCode.toLowerCase() },
            select: { id: true },
        });
        if (!country) throw new NotFoundException(`País no encontrado: ${dto.countryCode}`);

        const price = await this.pricesService.findByCountryAndDuration(country.id, dto.durationMonths);
        if (!price) throw new NotFoundException(`No hay precio configurado para ${dto.durationMonths} meses en ${dto.countryCode}`);

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + dto.durationMonths);

        // Determinar gateway según país
        const gatewayName = this.paymentsService.resolveGatewayName(dto.countryCode);

        return this.prisma.subscription.create({
            data: {
                durationMonths: dto.durationMonths,
                amount: price.price,
                currency: price.currency ?? 'CLP',
                paymentGateway: gatewayName,
                paymentMethod: dto.paymentMethod,
                paymentStatus: 'pending',
                endDate,
                service: { connect: { id: dto.serviceId } },
            },
            select: SUBSCRIPTION_SELECT,
        });
    }

    async actualizarEstadoPago(id: string, paymentStatus: string, transactionId?: string) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id },
            select: SUBSCRIPTION_SELECT,
        });
        if (!subscription) throw new NotFoundException(`Suscripción ${id} no encontrada`);

        const active = paymentStatus === 'completed';
        await this.prisma.subscription.update({
            where: { id },
            data: { paymentStatus, transactionId, active },
        });

        if (active) {
            await this.prisma.service.update({
                where: { id: subscription.service.id },
                data: { level: 'PREMIUM', featured: true },
            });
        }

        return this.prisma.subscription.findUnique({ where: { id }, select: SUBSCRIPTION_SELECT });
    }
}
