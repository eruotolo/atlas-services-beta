import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar la SDK de Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/* ------------------------------------------------------------------ */
/*  Country config for multi-country prompts                           */
/* ------------------------------------------------------------------ */

const COUNTRY_PROMPT_CONFIG: Record<string, { locale: string; systemPrompt: string }> = {
    cl: {
        locale: 'español de Chile',
        systemPrompt:
            'Eres un asistente profesional de Atlas Services para Chile. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    ar: {
        locale: 'español de Argentina',
        systemPrompt:
            'Eres un asistente profesional de Atlas Services para Argentina. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    uy: {
        locale: 'español de Uruguay',
        systemPrompt:
            'Eres un asistente profesional de Atlas Services para Uruguay. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    es: {
        locale: 'español de España',
        systemPrompt:
            'Eres un asistente profesional de Atlas Services para España. Eres amable, servicial y usas lenguaje cercano pero profesional.',
    },
    us: {
        locale: 'español para la comunidad hispana en EE.UU.',
        systemPrompt:
            'Eres un asistente profesional de Atlas Services para la comunidad hispana en Estados Unidos. Eres amable, servicial y usas lenguaje cercano pero profesional.',
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
