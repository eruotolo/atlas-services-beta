import type { z } from 'zod';

import type { reviewCreateSchema, reviewUpdateSchema } from '../schemas/reviewSchemas';

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;

export interface ReviewWithDetails {
    id: string;
    usuarioId: string;
    servicioId: string;
    estrellas: number;
    comentario?: string | null;
    estado: string;
    createdAt: Date;
    updatedAt: Date;
    usuario: {
        nombre: string;
        email: string;
        avatar: string | null;
    };
    servicio: {
        titulo: string;
        id: string;
    };
}
