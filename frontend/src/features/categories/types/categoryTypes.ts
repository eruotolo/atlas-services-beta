import type { z } from 'zod';

import type { categorySchema, categoryUpdateSchema } from '../schemas/categorySchemas';

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

// Tipo de dominio (independiente de Prisma)
export interface CategoriaServicio {
    id: string;
    nombre: string;
    slug: string;
    icono?: string | null;
    orden: number;
    activo: boolean;
}

// Tipos para formularios
export interface CrearCategoriaInput {
    nombre: string;
    icono?: string | null;
    orden?: number;
}

export interface ActualizarCategoriaInput {
    id: string;
    nombre: string;
    icono?: string | null;
    orden?: number;
}
