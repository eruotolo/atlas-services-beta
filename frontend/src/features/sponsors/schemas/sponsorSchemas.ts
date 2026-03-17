import { z } from 'zod';

const categoriaSponsorValues = ['STANDARD', 'PREMIUM', 'SENIOR'] as const;

export const sponsorSchema = z.object({
    nombre: z.string().min(2, 'El nombre es requerido'),
    imagenUrl: z.string().url('URL de imagen inválida'),
    linkExterno: z.string().url('URL de link inválida'),
    descripcion: z.string().optional().nullable(),
    nivel: z.enum(categoriaSponsorValues),
    fechaInicio: z.date(),
    fechaFin: z.date(),
    activo: z.boolean().default(true),
});

export const sponsorUpdateSchema = sponsorSchema.extend({
    id: z.string().min(1, 'ID es requerido'),
});

export type SponsorInput = z.infer<typeof sponsorSchema>;
export type SponsorUpdateInput = z.infer<typeof sponsorUpdateSchema>;
