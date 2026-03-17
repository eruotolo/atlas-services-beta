import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar la SDK de Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getSmartServiceSuggestion = async (query: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Ayuda a un usuario de Chiloé a encontrar el servicio correcto. El usuario dice: "${query}". Responde brevemente en español chileno sugiriendo qué tipo de profesional necesita (Gásfiter, Electricista, Carpintero, Flete, o Mudanza) y un consejo rápido.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
            },
            systemInstruction:
                'Eres un asistente local chileno de la Isla de Chiloé. Eres amable, servicial y usas modismos locales leves pero profesionales.',
        });

        return result.response.text();
    } catch (error) {
        console.error('Gemini Error:', error);
        return 'No pude conectar con el asistente AI, ¡pero igual puedes buscar manualmente!';
    }
};

/**
 * Genera una descripción profesional para un servicio basado en título y categorías
 */
export const generateServiceDescription = async (
    titulo: string,
    categorias: string[],
): Promise<string | null> => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const categoriasTexto = categorias.join(', ');

        const prompt = `Actúa como un redactor experto en marketing digital y SEO. Tu tarea es crear una descripción de servicio EXTENSA, COMPLETA y DETALLADA para un profesional en la Isla de Chiloé, Chile.

Título del servicio: "${titulo}"
Categorías: ${categoriasTexto}

OBJETIVO: Generar un texto de MÍNIMO 200 PALABRAS (aprox. 1200-1500 caracteres).

ESTRUCTURA OBLIGATORIA:
1.  **Introducción (Párrafo largo):** Contextualiza la necesidad de este servicio en Chiloé. ¿Por qué es importante para los habitantes locales?
2.  **Detalles del Servicio (Párrafo muy detallado):** Describe a fondo qué incluye el servicio. No hagas listas, narra los procesos, las herramientas y la metodología. Explayate en la calidad.
3.  **Valor Diferencial y Cobertura (Párrafo medio):** Habla sobre la cobertura (Castro, Ancud, etc.), la puntualidad, la seriedad y el trato cercano sureño.
4.  **Cierre (Párrafo corto):** Un llamado a la acción claro y amable.

REGLAS DE ORO:
- NO dejes oraciones incompletas. El texto debe tener un final claro.
- NO repitas el título del servicio al principio.
- Usa lenguaje profesional pero cercano (español de Chile).
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
