import { apiClient } from '@/shared/lib/apiClient';

export interface DetectarServicioResult {
    readonly success: boolean;
    readonly categoriaNombre?: string;
    readonly categoriaSlug?: string;
    readonly mensaje?: string;
    readonly sinProveedores?: boolean;
    readonly otrosNombre?: string;
    readonly otrosSlug?: string;
    readonly error?: string;
}

export async function detectarServicio(
    mensaje: string,
    countryCode: string,
): Promise<DetectarServicioResult> {
    try {
        return await apiClient.post<DetectarServicioResult>('/chatbot/detect', {
            mensaje,
            countryCode,
        });
    } catch {
        return { success: false, error: 'No se pudo conectar. Revisá tu conexión.' };
    }
}
