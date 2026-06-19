import { z } from 'zod';

export const countryCreateSchema = z.object({
    code: z
        .string()
        .length(2, 'El código debe ser de 2 caracteres')
        .regex(/^[a-z]{2}$/, 'El código debe ser ISO2 en minúsculas (ej: cl, ar)'),
    name: z.string().min(2, 'El nombre es requerido'),
    currency: z
        .string()
        .min(3, 'La moneda es requerida')
        .max(4, 'Código de moneda inválido')
        .regex(/^[A-Z]{3,4}$/, 'Debe ser código ISO 4217 en mayúsculas (ej: CLP, USD)'),
    locale: z
        .string()
        .min(2, 'El locale es requerido')
        .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Formato inválido (ej: es-CL, en-US)'),
    timezone: z.string().min(2, 'La zona horaria es requerida'),
    gateway: z.enum(['MERCADOPAGO', 'STRIPE']),
    regionLabel: z.string().min(1, 'La etiqueta de región es requerida'),
    localityLabel: z.string().min(1, 'La etiqueta de localidad es requerida'),
    paymentsEnabled: z.boolean().default(true),
    active: z.boolean().default(true),
});

export const countryUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    currency: z
        .string()
        .regex(/^[A-Z]{3,4}$/, 'Debe ser código ISO 4217 en mayúsculas')
        .optional(),
    locale: z
        .string()
        .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Formato inválido (ej: es-CL, en-US)')
        .optional(),
    timezone: z.string().min(2).optional(),
    gateway: z.enum(['MERCADOPAGO', 'STRIPE']).optional(),
    regionLabel: z.string().min(1).optional(),
    localityLabel: z.string().min(1).optional(),
    paymentsEnabled: z.boolean().optional(),
    active: z.boolean().optional(),
});

export type CountryCreateInput = z.infer<typeof countryCreateSchema>;
export type CountryUpdateInput = z.infer<typeof countryUpdateSchema>;
