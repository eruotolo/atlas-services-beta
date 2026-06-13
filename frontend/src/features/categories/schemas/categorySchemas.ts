import { z } from 'zod';

export const categorySchema = z.object({
    nombre: z.string().min(2, 'El nombre es requerido'),
    nombreEn: z.string().optional().nullable(),
    icono: z.string().optional().nullable(),
    orden: z.coerce.number().int().default(0),
    activo: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.extend({
    id: z.string().min(1, 'ID es requerido'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
