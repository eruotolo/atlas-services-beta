import type { z } from 'zod';

import type { servicioCreateSchema, servicioUpdateSchema } from '../schemas/servicioSchemas';

export type ServicioCreateInput = z.infer<typeof servicioCreateSchema>;
export type ServicioUpdateInput = z.infer<typeof servicioUpdateSchema>;

export interface ServicioFilters {
    categoriaId?: string; // Mantener para compatibilidad con búsquedas por una sola categoría
    comuna?: string;
    precioMin?: number;
    precioMax?: number;
    search?: string;
}
