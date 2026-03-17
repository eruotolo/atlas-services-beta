import type { z } from 'zod';

import type {
    paymentDataSchema,
    premiumPriceSchema,
    premiumPriceUpdateSchema,
    processPaymentSchema,
} from '../schemas/paymentSchemas';

export type PaymentDataInput = z.infer<typeof paymentDataSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type PremiumPriceInput = z.infer<typeof premiumPriceSchema>;
export type PremiumPriceUpdateInput = z.infer<typeof premiumPriceUpdateSchema>;

// Tipo de dominio para suscripciones
export interface SuscripcionWithDetails {
    id: string;
    servicioId: string;
    duracionMeses: number;
    monto: number;
    metodoPago: string;
    estadoPago: string;
    transaccionId?: string | null;
    fechaInicio: Date;
    fechaFin: Date;
    activa: boolean;
    createdAt: Date;
    updatedAt: Date;
    servicio: {
        titulo: string;
        usuario: {
            nombre: string;
            email: string;
        };
        categoria: {
            nombre: string;
        };
        categorias?: Array<{
            categoria: {
                nombre: string;
            };
        }>;
    };
}

export interface PrecioPremium {
    id: string;
    descripcion: string;
    precio: number;
    duracionMeses: number;
    activo: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
