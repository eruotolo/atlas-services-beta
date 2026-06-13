'use server';

import { revalidatePath } from 'next/cache';

import { apiClient } from '@/lib/api/apiClient';
import { getAuthToken } from '@/shared/lib/auth/getAuthToken';

import { sponsorSchema, sponsorUpdateSchema } from '../schemas/sponsorSchemas';
import type { SponsorInput, SponsorUpdateInput } from '../types/sponsorTypes';

export async function crearSponsor(data: SponsorInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    const validated = sponsorSchema.parse(data);

    try {
        const sponsor = await apiClient.post(
            '/sponsors',
            {
                nombre: validated.nombre,
                imagenUrl: validated.imagenUrl,
                linkExterno: validated.linkExterno,
                descripcion: validated.descripcion,
                nivel: validated.nivel,
                fechaInicio: validated.fechaInicio,
                fechaFin: validated.fechaFin,
                activo: validated.activo,
                countryCode: validated.countryCode ?? null,
            },
            { token },
        );

        revalidatePath('/admin/sponsors');
        return { success: true, sponsor };
    } catch (error) {
        console.error('Error al crear sponsor:', error);
        return { error: 'Error al crear sponsor' };
    }
}

export async function actualizarSponsor(data: SponsorUpdateInput) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    const validated = sponsorUpdateSchema.parse(data);

    try {
        const sponsor = await apiClient.patch(
            `/sponsors/${validated.id}`,
            {
                nombre: validated.nombre,
                imagenUrl: validated.imagenUrl,
                linkExterno: validated.linkExterno,
                descripcion: validated.descripcion,
                nivel: validated.nivel,
                fechaInicio: validated.fechaInicio,
                fechaFin: validated.fechaFin,
                activo: validated.activo,
                countryCode: validated.countryCode ?? null,
            },
            { token },
        );

        revalidatePath('/admin/sponsors');
        return { success: true, sponsor };
    } catch (error) {
        console.error('Error al actualizar sponsor:', error);
        return { error: 'Error al actualizar sponsor' };
    }
}

export async function eliminarSponsor(id: string) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    try {
        await apiClient.delete(`/sponsors/${id}`, { token });
        revalidatePath('/admin/sponsors');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar sponsor:', error);
        return { error: 'Error al eliminar sponsor' };
    }
}

export async function toggleActivoSponsor(id: string, activo: boolean) {
    const token = await getAuthToken();
    if (!token) return { error: 'No autorizado' };

    try {
        await apiClient.patch(`/sponsors/${id}`, { activo }, { token });

        revalidatePath('/admin/sponsors');
        return { success: true };
    } catch (error) {
        console.error('Error al cambiar estado del sponsor:', error);
        return { error: 'Error al cambiar estado del sponsor' };
    }
}
