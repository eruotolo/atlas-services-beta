import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { CategoriesService } from '../categories/categories.service';
import type { DetectServiceDto } from './dto/detect-service.dto';

export interface DetectServiceResult {
    success: boolean;
    categoriaNombre?: string;
    categoriaSlug?: string;
    mensaje?: string;
    sinProveedores?: boolean;
    otrosNombre?: string;
    otrosSlug?: string;
    error?: string;
}

interface GeminiResponse {
    categoriaSlug?: string | null;
    categoriaNombre?: string | null;
    mensaje?: string;
}

@Injectable()
export class ChatbotService {
    private readonly genAI: GoogleGenerativeAI;

    constructor(
        private readonly config: ConfigService,
        private readonly categories: CategoriesService,
    ) {
        const apiKey = this.config.get<string>('GEMINI_API_KEY', '');
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async detectService(dto: DetectServiceDto): Promise<DetectServiceResult> {
        const { mensaje, countryCode } = dto;

        const categorias = await this.categories.findAll(countryCode);
        if (categorias.length === 0) {
            return { success: false, error: 'No hay servicios disponibles por ahora.' };
        }

        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction:
                'Eres un asistente de Hireeo que clasifica necesidades de servicios profesionales. Respondes siempre con JSON válido.',
        });

        const listado = categorias.map((c) => `- ${c.name} (slug: ${c.slug})`).join('\n');
        const prompt = `Un usuario describe un problema o necesidad. Determina qué servicio profesional necesita y elige la categoría MÁS adecuada de esta lista (usa EXACTAMENTE el slug indicado):

${listado}

Mensaje del usuario: "${mensaje}"

Responde ÚNICAMENTE con un objeto JSON válido con esta forma exacta:
{"categoriaSlug": "<slug de la lista o null>", "categoriaNombre": "<nombre o null>", "mensaje": "<frase breve y amable confirmando qué profesional necesita>"}

Reglas:
- "categoriaSlug" DEBE ser uno de los slugs de la lista, o null si ninguno calza.
- No inventes categorías que no estén en la lista.`;

        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
            });

            let parsed: GeminiResponse;
            try {
                parsed = JSON.parse(result.response.text()) as GeminiResponse;
            } catch {
                return { success: false, error: 'No pude identificar el servicio. Intenta de nuevo.' };
            }

            if (!parsed.categoriaSlug) {
                return {
                    success: false,
                    error: 'No logré identificar el servicio. ¿Podés describirlo de otra manera?',
                };
            }

            const categoriaReal = categorias.find((c) => c.slug === parsed.categoriaSlug);
            if (!categoriaReal) {
                return { success: false, error: 'No pudimos encontrar esa categoría. Intenta de nuevo.' };
            }

            const sinProveedores = (categoriaReal.serviceCount ?? 0) === 0;
            const catOtros = categorias.find(
                (c) => c.slug === 'otros' || c.name.toLowerCase() === 'otros',
            );

            return {
                success: true,
                categoriaNombre: categoriaReal.name,
                categoriaSlug: categoriaReal.slug,
                mensaje:
                    parsed.mensaje?.trim() ??
                    `Parece que necesitas un servicio de ${categoriaReal.name}.`,
                sinProveedores,
                otrosNombre: sinProveedores && catOtros ? catOtros.name : undefined,
                otrosSlug: sinProveedores && catOtros ? catOtros.slug : undefined,
            };
        } catch {
            return {
                success: false,
                error: 'El asistente está ocupado en este momento. Intenta en unos segundos.',
            };
        }
    }
}
