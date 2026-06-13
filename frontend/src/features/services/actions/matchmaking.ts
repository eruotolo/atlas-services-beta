'use server';

import { GoogleGenAI } from '@google/genai';

// Instanciamos el cliente (puede fallar si la clave es "test" o es inválida)
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Categorías conocidas para el mock (Batería expandida de casos de uso)
const CATEGORY_MAP: Record<string, string[]> = {
    'gasfiteria': ['caño', 'agua', 'fuga', 'tubo', 'plomero', 'gotera', 'baño', 'inodoro', 'cañeria', 'desague', 'gasfiter', 'fontanero', 'pileta', 'filtracion'],
    'electricidad': ['luz', 'enchufe', 'cable', 'corto', 'chispa', 'electricista', 'foco', 'iluminacion', 'tablero', 'cortocircuito', 'apagon', 'lampara'],
    'limpieza-hogar': ['limpiar', 'sucio', 'aseo', 'casa', 'polvo', 'barrer', 'trapear', 'limpieza', 'mancha', 'desinfeccion', 'ordenar'],
    'jardineria': ['pasto', 'cesped', 'jardin', 'plantas', 'tierra', 'arbol', 'podar', 'hojas', 'riego', 'jardinero', 'malezas', 'paisajismo', 'patio'],
    'nineras': ['niño', 'bebe', 'cuidar', 'niñera', 'hijo', 'nanny', 'infantil', 'babysitter', 'guarderia'],
    'cerrajeria': ['llave', 'puerta', 'chapa', 'candado', 'cerrajero', 'abrir', 'cerradura', 'trancado', 'perdi las llaves'],
    'mascotas': ['perro', 'gato', 'pasear', 'veterinario', 'bañar', 'mascota', 'peluqueria canina', 'cuidador de perros', 'pet', 'animal'],
    'mudanzas': ['mudanza', 'flete', 'cajas', 'traslado', 'camion', 'muebles', 'llevar', 'transportar', 'mudarse'],
    'techos': ['techo', 'tejas', 'llueve adentro', 'chapa', 'humedad', 'cielo raso', 'aislacion'],
    'pintura': ['pintar', 'pintor', 'pared', 'brocha', 'rodillo', 'color', 'descascarado', 'barniz', 'pintura'],
    'linea-blanca': ['lavadora', 'refrigerador', 'heladera', 'microondas', 'horno', 'lavarropas', 'electrodomestico', 'televisor', 'no prende', 'se rompio'],
    'cuidado-adultos': ['abuelo', 'anciano', 'adulto mayor', 'enfermera', 'acompañante', 'cuidado', 'tercera edad'],
    'climatizacion': ['aire acondicionado', 'calefaccion', 'estufa', 'caldera', 'frio', 'calor', 'climatizador', 'ac', 'split'],
    'corte-cesped': ['cortar el pasto', 'cortacesped', 'maquina de cortar', 'pasto alto'],
    'mantenimiento-patios': ['patio', 'limpiar patio', 'escombros', 'hojas secas', 'jardin descuidado']
};

export async function matchServiceCategory(userQuery: string): Promise<string> {
    const queryLower = userQuery.toLowerCase();

    try {
        if (!ai || process.env.GEMINI_API_KEY === 'test') {
            throw new Error('API Key mock o inválida');
        }

        // Prompt para Gemini
        const prompt = `
            Eres un asistente de matchmaking para una app de servicios.
            Tengo las siguientes categorías (slugs): gasfiteria, electricidad, limpieza-hogar, jardineria, nineras, cerrajeria, mascotas, mudanzas.
            El usuario dice: "${userQuery}".
            Devuelve ÚNICAMENTE el slug de la categoría que mejor coincida. No des explicaciones, solo el slug.
            Si no estás seguro, devuelve "otros".
        `;

        // Timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout de Gemini')), 6000);
        });

        const response = await Promise.race([
            ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            }),
            timeoutPromise
        ]);

        const slug = response.text?.trim().toLowerCase() || 'otros';
        return slug;

    } catch (error) {
        console.warn('⚠️ Gemini no configurado o falló. Usando mock local de Matchmaking IA.');
        
        // Mock de palabras clave
        for (const [slug, keywords] of Object.entries(CATEGORY_MAP)) {
            if (keywords.some(kw => queryLower.includes(kw))) {
                return slug;
            }
        }
        
        return 'otros';
    }
}
