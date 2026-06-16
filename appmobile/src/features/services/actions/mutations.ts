import { apiClient } from '@/shared/lib/apiClient';
import type { ServiceDetailFull } from '../types';

export interface PublishServiceInput {
    readonly title: string;
    readonly description: string;
    readonly price: number;
    readonly commune: string;
    readonly categoryIds: readonly string[];
    readonly mainImage?: string | null;
    readonly images?: readonly string[];
    readonly socialNetworks?: ReadonlyArray<{ readonly type: string; readonly url: string }>;
    readonly contactName?: string | null;
    readonly contactPhone?: string | null;
}

export interface PublishedServiceResult {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
}

export async function publishService(data: PublishServiceInput): Promise<PublishedServiceResult> {
    return apiClient.post<PublishedServiceResult>('/services', {
        title: data.title,
        description: data.description,
        price: data.price,
        commune: data.commune,
        categoryIds: data.categoryIds,
        mainImage: data.mainImage ?? null,
        images: data.images ?? [],
        socialNetworks: data.socialNetworks ?? [],
        contactName: data.contactName ?? null,
        contactPhone: data.contactPhone ?? null,
    });
}

export interface ServicioCreateInput {
    titulo: string;
    descripcion: string;
    precio: number;
    comuna: string;
    categoriasIds: string[];
    imagenPrincipal?: string;
    imagenes?: string[];
    nombreContacto?: string;
    emailContacto?: string;
    telefonoContacto?: string;
    redesSociales?: any;
}

export interface ServicioUpdateInput extends Partial<ServicioCreateInput> {
    id: string;
}

export async function createService(data: ServicioCreateInput): Promise<{ success: boolean; servicio?: ServiceDetailFull; error?: string }> {
    try {
        const result = await apiClient.post<ServiceDetailFull>('/services', data);
        return { success: true, servicio: result };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al crear servicio' };
    }
}

export async function updateService(data: ServicioUpdateInput): Promise<{ success: boolean; servicio?: ServiceDetailFull; error?: string }> {
    try {
        const result = await apiClient.patch<ServiceDetailFull>(`/services/${data.id}`, data);
        return { success: true, servicio: result };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al actualizar servicio' };
    }
}

export async function deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.delete(`/services/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al eliminar servicio' };
    }
}

export async function toggleServiceActive(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await apiClient.patch(`/services/${id}/active`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error?.message || 'Error al cambiar estado' };
    }
}
