import { z } from 'zod';

const estadoComentarioValues = ['PENDIENTE', 'ACTIVO', 'ELIMINADO'] as const;

export const reviewCreateSchema = z.object({
    servicioId: z.string().min(1, 'El servicio es requerido'),
    rating: z.number().min(1).max(5),
    comment: z.string().min(3, 'El comentario debe tener al menos 3 caracteres'),
    // Solo para invitados
    name: z.string().min(2, 'El nombre es requerido').optional(),
    email: z.string().email('Email inválido').optional(),
});

export const reviewUpdateSchema = z.object({
    id: z.string().min(1),
    estado: z.enum(estadoComentarioValues).optional(),
    comentario: z.string().min(3).optional(),
    estrellas: z.number().min(1).max(5).optional(),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
