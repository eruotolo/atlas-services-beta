import type { z } from 'zod';

import type { sponsorSchema, sponsorUpdateSchema } from '../schemas/sponsorSchemas';

export type SponsorInput = z.infer<typeof sponsorSchema>;
export type SponsorUpdateInput = z.infer<typeof sponsorUpdateSchema>;

export type CategoriaSponsor = 'STANDARD' | 'PREMIUM' | 'SENIOR';

// Tipo de dominio (independiente de Prisma)
export interface Sponsor {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
    nivel: CategoriaSponsor;
    activo: boolean;
    fechaInicio: Date;
    fechaFin: Date;
}

// Tipos legacy/compatibilidad
export interface CrearSponsorInput {
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
    nivel: CategoriaSponsor;
    fechaInicio: Date;
    fechaFin: Date;
}

export interface ActualizarSponsorInput {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion?: string | null;
    nivel: CategoriaSponsor;
    fechaInicio: Date;
    fechaFin: Date;
}

// Tipo para sponsors públicos (sin datos sensibles)
export interface SponsorPublico {
    id: string;
    nombre: string;
    imagenUrl: string;
    linkExterno: string;
    descripcion: string | null;
}
