import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { whereServiceCountry } from '@common/utils/where-service-country';

import { PrismaService } from '../../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { PricesService } from '../prices/prices.service';

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
        private readonly pricesService: PricesService,
        private readonly paymentsService: PaymentsService,
    ) {}

    async findAllPaginated(options: {
        page?: number;
        limit?: number;
        countryCode?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const { page = 1, limit = 10, countryCode, startDate, endDate } = options;
        const skip = (page - 1) * limit;

        // endDate inclusivo: se filtra con lt al día siguiente
        let endExclusive: Date | undefined;
        if (endDate) {
            endExclusive = new Date(endDate);
            endExclusive.setDate(endExclusive.getDate() + 1);
        }

        const where = {
            ...whereServiceCountry(countryCode),
            ...((startDate || endExclusive) && {
                createdAt: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endExclusive && { lt: endExclusive }),
                },
            }),
        };

        const [items, total, porEstado] = await Promise.all([
            this.prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    ...SUBSCRIPTION_SELECT,
                    startDate: true,
                    service: {
                        select: {
                            id: true,
                            title: true,
                            user: { select: { name: true, email: true } },
                        },
                    },
                },
            }),
            this.prisma.subscription.count({ where }),
            this.prisma.subscription.groupBy({
                by: ['paymentStatus'],
                where,
                _count: { paymentStatus: true },
                _sum: { amount: true },
            }),
        ]);

        let ingresosBrutos = 0;
        let montoPendiente = 0;
        let pendientes = 0;
        let completados = 0;
        for (const grupo of porEstado) {
            const monto = Number(grupo._sum.amount ?? 0);
            if (grupo.paymentStatus === 'completed') {
                completados = grupo._count.paymentStatus;
                ingresosBrutos = monto;
            } else if (grupo.paymentStatus === 'pending') {
                pendientes = grupo._count.paymentStatus;
                montoPendiente = monto;
            }
        }

        return {
            data: items,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            stats: { ingresosBrutos, montoPendiente, pendientes, completados, total },
        };
    }

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
        const serviceData = await this.prisma.service.findUnique({
            where: { id: dto.serviceId },
            select: { id: true, userId: true, countryId: true },
        });
        if (!serviceData) throw new NotFoundException(`Servicio ${dto.serviceId} no encontrado`);
        if (serviceData.userId !== userId) {
            throw new ForbiddenException('Solo puedes suscribir tus propios servicios');
        }

        const existing = await this.prisma.subscription.findUnique({
            where: { serviceId: dto.serviceId },
            select: { id: true, active: true, serviceId: true },
        });
        if (existing?.active) throw new ConflictException('Este servicio ya tiene una suscripción activa');

        const country = await this.prisma.country.findUnique({
            where: { id: serviceData.countryId },
            select: { id: true, code: true },
        });
        if (!country) throw new NotFoundException(`País del servicio no encontrado`);

        const price = await this.pricesService.findByCountryAndDuration(country.id, dto.durationMonths);
        if (!price) throw new NotFoundException(`No hay precio configurado para ${dto.durationMonths} meses en el país del servicio`);

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + dto.durationMonths);

        // Determinar gateway según país del servicio
        const gatewayName = this.paymentsService.resolveGatewayName(country.code);

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
