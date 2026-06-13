import { z } from 'zod';

export const paymentDataSchema = z.object({
    token: z.string(),
    payment_method_id: z.string(),
    issuer_id: z.string().optional(),
    installments: z.number().int().min(1),
    payer: z.object({
        email: z.string().email(),
        identification: z.object({
            type: z.string(),
            number: z.string(),
        }),
    }),
});

export const processPaymentSchema = z.object({
    servicioId: z.string().min(1),
    duracionMeses: z.number().int().min(1),
});

export const premiumPriceSchema = z.object({
    countryId: z.string().uuid('País requerido'),
    duracionMeses: z.coerce.number().int().min(1),
    precio: z.coerce.number().min(0),
    currency: z.string().min(1),
    descripcion: z.string().optional().nullable(),
});

export const premiumPriceUpdateSchema = premiumPriceSchema.partial().extend({
    id: z.string().min(1),
});
