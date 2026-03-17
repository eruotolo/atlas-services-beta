import { getCategorias } from '@/features/categories/actions';

/**
 * Genera keywords dinámicas para SEO basadas en:
 * - Categorías activas en la base de datos
 * - Long-tail keywords automáticas
 */
export async function generateDynamicKeywords(): Promise<string[]> {
    try {
        const keywords: string[] = [];

        // 1. Keywords base (siempre presentes)
        const baseKeywords = [
            'Chiloé Servicios',
            'Directorio de servicios Chiloé',
            'Profesionales en Chiloé',
            'Servicios hogar Chiloé',
            'Datos de maestros Chiloé',
            'Isla de Chiloé',
            'Región de Los Lagos',
        ];
        keywords.push(...baseKeywords);

        // 2. Obtener categorías activas desde la API
        const categorias = await getCategorias();

        // 3. Keywords de categorías (oficios principales)
        for (const categoria of categorias) {
            keywords.push(categoria.nombre);
            keywords.push(`${categoria.nombre} a domicilio`);
            keywords.push(`${categoria.nombre} en Chiloé`);
            keywords.push(`${categoria.nombre} profesional`);
        }

        // 4. Comunas principales para combinaciones (Castro, Ancud, Quellón)
        const comunasPrincipales = ['Castro', 'Ancud', 'Quellón', 'Dalcahue', 'Chonchi', 'Achao', 'Queilen', 'Quemchi', 'Curaco de Vélez', 'Puqueldón'];

        // Generar combinaciones de las primeras 10 categorías (como top categorías)
        const topCategorias = categorias.slice(0, 10);
        for (const categoria of topCategorias) {
            for (const comuna of ['Castro', 'Ancud', 'Quellón']) {
                keywords.push(`${categoria.nombre} en ${comuna}`);
                keywords.push(`${categoria.nombre} ${comuna}`);
            }
        }

        // 6. Keywords de ubicación (geolocalización)
        for (const comuna of comunasPrincipales) {
            keywords.push(`Servicios en ${comuna}`);
        }

        // 7. Keywords de intención/urgencia
        const intencionKeywords = [
            'Maestros urgentes 24 horas',
            'Emergencias eléctricas',
            'Gasfitería de urgencia',
            'Presupuestos gratis construcción',
            'Mano de obra calificada',
            'Servicios a domicilio',
            'Profesionales verificados',
        ];
        keywords.push(...intencionKeywords);

        // 8. Long-tail keywords específicas
        const specificKeywords = [
            'Reparación de calefont e instalaciones',
            'Destape de alcantarillado y desagües',
            'Instalación eléctrica domiciliaria',
            'Arreglo de techos y goteras',
            'Limpieza de caños y estufas a pellet',
            'Construcción de cabañas y ampliaciones',
            'Mantenimiento general de viviendas',
            'Corte de pasto y limpieza de parcelas',
        ];
        keywords.push(...specificKeywords);

        // 9. Eliminar duplicados y retornar
        return Array.from(new Set(keywords));
    } catch (error) {
        console.error('Error generating dynamic keywords:', error);

        // Fallback a keywords estáticas básicas en caso de error
        return [
            'Chiloé Servicios',
            'Directorio de servicios Chiloé',
            'Profesionales en Chiloé',
            'Gasfíter',
            'Electricista',
            'Carpintero',
            'Servicios en Castro',
            'Servicios en Ancud',
        ];
    }
}

/**
 * Genera keywords específicas para una página de servicio individual
 */
export function generateServiceKeywords(
    categoryName: string,
    comuna: string,
    title: string,
): string[] {
    return [
        categoryName,
        comuna,
        title,
        `${categoryName} en ${comuna}`,
        `${categoryName} Chiloé`,
        `${categoryName} ${comuna}`,
        'servicios profesionales',
        'Isla de Chiloé',
        `${categoryName} a domicilio`,
        `${categoryName} verificado`,
    ];
}

/**
 * Genera keywords para página de categoría
 */
export function generateCategoryPageKeywords(categoryName: string): string[] {
    const comunas = ['Castro', 'Ancud', 'Quellón', 'Dalcahue', 'Chonchi'];

    return [
        categoryName,
        `${categoryName} en Chiloé`,
        `${categoryName} profesional`,
        `${categoryName} a domicilio`,
        `Directorio ${categoryName}`,
        ...comunas.map((comuna) => `${categoryName} en ${comuna}`),
        `Encontrar ${categoryName}`,
        `Contratar ${categoryName}`,
        `${categoryName} verificado`,
        `${categoryName} con reseñas`,
    ];
}
