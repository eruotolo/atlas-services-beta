import { getCategorias } from '@/features/categories/actions';

/**
 * Genera keywords dinámicas para SEO basadas en:
 * - País del usuario (multi-país)
 * - Categorías activas en la base de datos
 * - Long-tail keywords automáticas
 */

const COUNTRY_CONFIG: Record<string, { name: string; regions: string[] }> = {
    cl: {
        name: 'Chile',
        regions: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Temuco'],
    },
    ar: {
        name: 'Argentina',
        regions: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Tucumán'],
    },
    uy: {
        name: 'Uruguay',
        regions: ['Montevideo', 'Punta del Este', 'Salto', 'Colonia', 'Rivera'],
    },
    es: {
        name: 'España',
        regions: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
    },
    us: {
        name: 'Estados Unidos',
        regions: ['Miami', 'Houston', 'Los Angeles', 'New York', 'Chicago'],
    },
};

export async function generateDynamicKeywords(countryCode = 'cl'): Promise<string[]> {
    try {
        const keywords: string[] = [];
        const config = COUNTRY_CONFIG[countryCode] ?? COUNTRY_CONFIG.cl;

        // 1. Keywords base (siempre presentes)
        const baseKeywords = [
            'Atlas Services',
            `Directorio de servicios ${config.name}`,
            `Profesionales en ${config.name}`,
            `Servicios hogar ${config.name}`,
            'Encontrar profesionales',
            'Directorio profesional',
        ];
        keywords.push(...baseKeywords);

        // 2. Obtener categorías activas desde la API
        const categorias = await getCategorias(countryCode);

        // 3. Keywords de categorías (oficios principales)
        for (const categoria of categorias) {
            keywords.push(categoria.nombre);
            keywords.push(`${categoria.nombre} a domicilio`);
            keywords.push(`${categoria.nombre} en ${config.name}`);
            keywords.push(`${categoria.nombre} profesional`);
        }

        // 4. Regiones principales para combinaciones
        const topCategorias = categorias.slice(0, 10);
        for (const categoria of topCategorias) {
            for (const region of config.regions.slice(0, 3)) {
                keywords.push(`${categoria.nombre} en ${region}`);
                keywords.push(`${categoria.nombre} ${region}`);
            }
        }

        // 5. Keywords de ubicación
        for (const region of config.regions) {
            keywords.push(`Servicios en ${region}`);
        }

        // 6. Keywords de intención/urgencia
        const intencionKeywords = [
            'Profesionales urgentes 24 horas',
            'Emergencias eléctricas',
            'Gasfitería de urgencia',
            'Presupuestos gratis',
            'Mano de obra calificada',
            'Servicios a domicilio',
            'Profesionales verificados',
        ];
        keywords.push(...intencionKeywords);

        // 7. Long-tail keywords específicas
        const specificKeywords = [
            'Reparación de calefont e instalaciones',
            'Destape de alcantarillado y desagües',
            'Instalación eléctrica domiciliaria',
            'Arreglo de techos y goteras',
            'Construcción y ampliaciones',
            'Mantenimiento general de viviendas',
            'Corte de pasto y paisajismo',
        ];
        keywords.push(...specificKeywords);

        // 8. Eliminar duplicados y retornar
        return Array.from(new Set(keywords));
    } catch (error) {
        console.error('Error generating dynamic keywords:', error);

        // Fallback a keywords estáticas básicas en caso de error
        return [
            'Atlas Services',
            'Directorio de servicios profesionales',
            'Profesionales verificados',
            'Gasfíter',
            'Electricista',
            'Carpintero',
            'Servicios a domicilio',
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
        `${categoryName} profesional`,
        `${categoryName} ${comuna}`,
        'servicios profesionales',
        'Atlas Services',
        `${categoryName} a domicilio`,
        `${categoryName} verificado`,
    ];
}

/**
 * Genera keywords para página de categoría (multi-país)
 */
export function generateCategoryPageKeywords(
    categoryName: string,
    countryCode = 'cl',
): string[] {
    const config = COUNTRY_CONFIG[countryCode] ?? COUNTRY_CONFIG.cl;

    return [
        categoryName,
        `${categoryName} en ${config.name}`,
        `${categoryName} profesional`,
        `${categoryName} a domicilio`,
        `Directorio ${categoryName}`,
        ...config.regions.map((region) => `${categoryName} en ${region}`),
        `Encontrar ${categoryName}`,
        `Contratar ${categoryName}`,
        `${categoryName} verificado`,
        `${categoryName} con reseñas`,
    ];
}
