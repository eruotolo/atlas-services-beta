'use server';

import { getCategorias } from '@/features/categories/actions';
import {
    detectarCategoriaChatbot,
    GeminiUnavailableError,
} from '@/shared/lib/ai/geminiService';

import { detectInputSchema } from '../schemas/chatbotSchemas';

export interface DetectarServicioResult {
    success?: boolean;
    categoriaNombre?: string;
    mensaje?: string;
    sinProveedores?: boolean;
    otrosNombre?: string;
    error?: string;
}

export async function detectarServicio(
    mensaje: string,
    countryCode = 'cl',
): Promise<DetectarServicioResult> {
    const parsed = detectInputSchema.safeParse({ mensaje });
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? 'Mensaje no válido.' };
    }

    try {
        const categorias = await getCategorias(countryCode);

        if (categorias.length === 0) {
            return { error: 'No hay servicios disponibles por ahora.' };
        }

        const deteccion = await detectarCategoriaChatbot(
            parsed.data.mensaje,
            categorias.map((c) => ({ slug: c.slug, nombre: c.nombre })),
            countryCode,
        );

        if (!deteccion) {
            return {
                error: 'No logré identificar el servicio que necesitas. ¿Podés describirlo de otra manera?',
            };
        }

        // Buscar la categoría real para obtener serviceCount
        const categoriaReal = categorias.find((c) => c.slug === deteccion.categoriaSlug);
        if (!categoriaReal) {
            return { error: 'No pudimos encontrar esa categoría. Intenta de nuevo.' };
        }

        const sinProveedores = (categoriaReal.serviceCount ?? 0) === 0;

        // Buscar categoría "otros" para fallback cuando no hay proveedores
        const catOtros = categorias.find(
            (c) => c.slug === 'otros' || c.nombre.toLowerCase() === 'otros',
        );

        return {
            success: true,
            categoriaNombre: categoriaReal.nombre,
            mensaje: deteccion.mensaje,
            sinProveedores,
            otrosNombre: sinProveedores && catOtros ? catOtros.nombre : undefined,
        };
    } catch (err: unknown) {
        if (err instanceof GeminiUnavailableError) {
            return {
                error: 'El asistente está con mucha demanda en este momento. Intenta en unos segundos.',
            };
        }
        console.error('detectarServicio error:', err);
        return { error: 'Ocurrió un problema. Intenta nuevamente.' };
    }
}
