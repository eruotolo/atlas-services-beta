import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar la SDK de Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/* ------------------------------------------------------------------ */
/*  Chatbot category detection — types                                 */
/* ------------------------------------------------------------------ */

export interface CategoriaChatbot {
    slug: string;
    nombre: string;
}

export interface DeteccionCategoria {
    categoriaSlug: string;
    categoriaNombre: string;
    mensaje: string;
}

/* ------------------------------------------------------------------ */
/*  GeminiUnavailableError — transient error sentinel                  */
/* ------------------------------------------------------------------ */

export class GeminiUnavailableError extends Error {
    constructor() {
        super('El asistente está con mucha demanda en este momento. Intenta en unos segundos.');
        this.name = 'GeminiUnavailableError';
    }
}

const TRANSIENT_STATUSES = new Set([429, 500, 503]);
const MAX_RETRIES = 3;

async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetries(
    model: ReturnType<typeof genAI.getGenerativeModel>,
    request: Parameters<typeof model.generateContent>[0],
): Promise<string> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const result = await model.generateContent(request);
            return result.response.text();
        } catch (err: unknown) {
            lastError = err;
            const status =
                err instanceof Error && 'status' in err ? (err as { status: number }).status : 0;

            if (TRANSIENT_STATUSES.has(status)) {
                if (attempt < MAX_RETRIES) {
                    await wait(700 * attempt);
                    continue;
                }
                throw new GeminiUnavailableError();
            }

            throw err;
        }
    }

    throw lastError;
}

/* ------------------------------------------------------------------ */
/*  Chatbot category detection                                         */
/* ------------------------------------------------------------------ */

/**
 * Detecta qué categoría de servicio necesita el usuario a partir de texto
 * en lenguaje natural. Usa las categorías reales del catálogo para evitar
 * slugs inventados. Retorna null si no puede determinar la categoría.
 */
export const detectarCategoriaChatbot = async (
    mensaje: string,
    categorias: CategoriaChatbot[],
    countryCode = 'cl',
): Promise<DeteccionCategoria | null> => {
    const config = COUNTRY_PROMPT_CONFIG[countryCode] ?? DEFAULT_CONFIG;
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction:
            'Eres un asistente de Hireeo que clasifica necesidades de servicios profesionales. Respondes siempre con JSON válido.',
    });

    const listado = categorias.map((c) => `- ${c.nombre} (slug: ${c.slug})`).join('\n');

    const prompt = `Un usuario describe un problema o necesidad en ${config.locale}. Determina qué servicio profesional necesita y elige la categoría MÁS adecuada de esta lista (usa EXACTAMENTE el slug indicado):

${listado}

EJEMPLOS de interpretación (la descripción → tipo de servicio; luego busca el slug real de la lista):
- "la llave gotea / hay una filtración / no sale agua caliente / se picó la cañería" → fontanería / gasfitería
- "se cortó la luz / salta el diferencial / el enchufe hace chispas" → electricidad
- "me quedé sin llave / la cerradura está mala" → cerrajería
- "necesito pintar la casa / las paredes están peladas" → pintura
- "tengo una gotera en el techo / se llueve la habitación" → reparación de techos
- "necesito mover muebles / hacer una mudanza / un flete" → fletes y mudanzas
- "necesito arreglar un mueble / una puerta que no cierra" → carpintería
- "se rompió el vidrio de la ventana" → vidriería
- "la lavadora no funciona / el refrigerador no enfría" → reparación de electrodomésticos
- "cortar el pasto / podar árboles / jardín descuidado" → jardinería
- "hacer un aseo profundo / limpiar la casa" → limpieza

Mensaje del usuario: "${mensaje}"

Responde ÚNICAMENTE con un objeto JSON válido con esta forma exacta:
{"categoriaSlug": "<slug de la lista o null>", "categoriaNombre": "<nombre de la lista o null>", "mensaje": "<frase breve y amable en ${config.locale} confirmando qué profesional necesita>"}

Reglas:
- "categoriaSlug" DEBE ser uno de los slugs de la lista, o null si ninguno calza.
- Los ejemplos son guías de interpretación; siempre elige el slug real de la lista.
- No inventes categorías que no estén en la lista.`;

    const texto = await generateWithRetries(model, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
        },
    });

    let parsed: { categoriaSlug?: string | null; categoriaNombre?: string | null; mensaje?: string };
    try {
        parsed = JSON.parse(texto) as typeof parsed;
    } catch {
        return null;
    }

    if (!parsed.categoriaSlug) return null;

    // Validar que el slug exista en la lista real (evita alucinaciones del modelo)
    const categoriaReal = categorias.find((c) => c.slug === parsed.categoriaSlug);
    if (!categoriaReal) return null;

    return {
        categoriaSlug: categoriaReal.slug,
        categoriaNombre: categoriaReal.nombre,
        mensaje:
            parsed.mensaje?.trim() ||
            `Parece que necesitas un servicio de ${categoriaReal.nombre}.`,
    };
};

/* ------------------------------------------------------------------ */
/*  Country config for multi-country prompts                           */
/* ------------------------------------------------------------------ */

const COUNTRY_PROMPT_CONFIG: Record<string, { locale: string; systemPrompt: string }> = {
    cl: {
        locale: 'español de Chile',
        systemPrompt:
            'Eres un asistente profesional de Hireeo para Chile. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    ar: {
        locale: 'español de Argentina',
        systemPrompt:
            'Eres un asistente profesional de Hireeo para Argentina. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    uy: {
        locale: 'español de Uruguay',
        systemPrompt:
            'Eres un asistente profesional de Hireeo para Uruguay. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    es: {
        locale: 'español de España',
        systemPrompt:
            'Eres un asistente profesional de Hireeo para España. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    us: {
        locale: 'español para la comunidad hispana en EE.UU.',
        systemPrompt:
            'Eres un asistente profesional de Hireeo para la comunidad hispana en Estados Unidos. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
};

const DEFAULT_CONFIG = COUNTRY_PROMPT_CONFIG.cl;

/* ------------------------------------------------------------------ */
/*  Smart service suggestion (search assistant)                        */
/* ------------------------------------------------------------------ */

export const getSmartServiceSuggestion = async (query: string, countryCode = 'cl') => {
    try {
        const config = COUNTRY_PROMPT_CONFIG[countryCode] ?? DEFAULT_CONFIG;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Ayuda a un usuario a encontrar el servicio correcto. El usuario dice: "${query}". Responde brevemente en ${config.locale} sugiriendo qué tipo de profesional necesita (Gasfíter, Electricista, Carpintero, Flete, Mudanza, etc.) y un consejo rápido.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
            },
            systemInstruction: config.systemPrompt,
        });

        return result.response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        return 'No pude conectar con el asistente AI, ¡pero igual puedes buscar manualmente!';
    }
};

/* ------------------------------------------------------------------ */
/*  Service description generator                                      */
/* ------------------------------------------------------------------ */

/**
 * Genera una descripción profesional para un servicio basado en título y categorías
 */
export const generateServiceDescription = async (
    titulo: string,
    categorias: string[],
    countryCode = 'cl',
): Promise<string | null> => {
    try {
        const config = COUNTRY_PROMPT_CONFIG[countryCode] ?? DEFAULT_CONFIG;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const categoriasTexto = categorias.join(', ');

        const prompt = `Actúa como un redactor experto en marketing digital y SEO. Tu tarea es crear una descripción de servicio EXTENSA, COMPLETA y DETALLADA para un profesional.

Título del servicio: "${titulo}"
Categorías: ${categoriasTexto}
País del servicio: ${config.locale}

OBJETIVO: Generar un texto de MÍNIMO 200 PALABRAS (aprox. 1200-1500 caracteres).

ESTRUCTURA OBLIGATORIA:
1.  **Introducción (Párrafo largo):** Contextualiza la necesidad de este servicio. ¿Por qué es importante para los habitantes locales?
2.  **Detalles del Servicio (Párrafo muy detallado):** Describe a fondo qué incluye el servicio. No hagas listas, narra los procesos, las herramientas y la metodología. Explayate en la calidad.
3.  **Valor Diferencial y Cobertura (Párrafo medio):** Habla sobre la cobertura, la puntualidad, la seriedad y el trato cercano.
4.  **Cierre (Párrafo corto):** Un llamado a la acción claro y amable.

REGLAS DE ORO:
- NO dejes oraciones incompletas. El texto debe tener un final claro.
- NO repitas el título del servicio al principio.
- Usa lenguaje profesional pero cercano (${config.locale}).
- Enfócate en transmitir confianza y experiencia.

IMPORTANTE: Si el texto es corto, no sirve. Necesitamos profundidad y detalle para mejorar el SEO.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 2500,
                topP: 0.95,
            },
            systemInstruction:
                'Eres un asistente de redacción experto. Tu prioridad es generar contenido extenso, rico en detalles y perfectamente redactado hasta el final.',
        });

        const textoGenerado = result.response.text()?.trim();

        if (!textoGenerado || textoGenerado.length < 50) {
            console.warn('Gemini retornó texto muy corto o vacío');
            return null;
        }

        return textoGenerado;
    } catch (error) {
        console.error('Error al generar descripción con Gemini:', error);

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return null;
    }
};
