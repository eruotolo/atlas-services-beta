# Plan — Evolución ChatIA con Vercel AI SDK + Gemini

Última actualización: 2026-06-20

---

## 1. Diagnóstico del estado actual

### Lo que existe hoy

```
ChatIA (FAB modal en appmobile)
  └─ Usuario escribe UN mensaje
  └─ detectarServicio() → POST /chatbot/detect
  └─ ChatbotService.detectService()
       └─ Gemini clasifica la categoría (una sola llamada, sin herramientas)
       └─ Retorna { categoriaSlug, categoriaNombre, mensaje }
  └─ Frontend navega a /(tabs)/services?category=gasfiter
```

### El problema concreto

El modelo Gemini actual **solo clasifica texto**. No busca proveedores, no conoce la localidad del usuario, no puede crear solicitudes, y no tiene memoria de la conversación. El usuario describe su problema y lo único que recibe es una redirección a una lista de filtros.

### El salto que queremos dar

```
Usuario: "Se me rompió una cañería en la cocina, se está inundando"

ChatIA v2:
  → Detecta: gasfitería, urgencia alta
  → Busca: 3 gasfíteres disponibles en Castro, CL (llama a ServicesService)
  → Muestra: tarjetas de proveedores con calificación dentro del chat
  → Usuario: "El primero me parece bien"
  → Crea: borrador de solicitud en la DB
  → Usuario: toca "Confirmar y pagar" → flujo de pago existente
```

---

## 2. Stack elegido: Vercel AI SDK + Gemini

### Por qué Vercel AI SDK sobre Antigravity SDK (Python)

| | Antigravity SDK | **Vercel AI SDK** |
|---|---|---|
| Lenguaje | Python solamente | TypeScript nativo |
| Deploy | Cloud Run separado | Dentro del NestJS existente en Vercel |
| Gemini | ✅ | ✅ (`@ai-sdk/google`) |
| Tool calling | ✅ | ✅ |
| Streaming SSE | ✅ | ✅ |
| Multi-turn | ✅ | ✅ |
| Complejidad | Microservicio nuevo | Un módulo más en backend |
| Costo infraestructura | Cloud Run extra | $0 adicional |

### Instalación

```bash
pnpm --filter backend add ai @ai-sdk/google zod
```

`ai` ya incluye: `generateText`, `streamText`, `tool`, structured output, `maxSteps` para loops.
`@ai-sdk/google` provee el modelo `google('gemini-2.5-flash')`.
`zod` ya está instalado en el backend.

---

## 3. Arquitectura del módulo `ai-agents`

### Estructura de archivos

```
backend/src/modules/ai-agents/
├── ai-agents.module.ts
├── ai-agents.controller.ts
├── ai-agents.service.ts          ← orquestador principal
├── tools/
│   ├── index.ts                  ← re-exporta todas las tools
│   ├── categories.tool.ts        ← wrappea CategoriesService
│   ├── services.tool.ts          ← wrappea ServicesService.findAll()
│   ├── geo.tool.ts               ← wrappea GeoService.findRegionsByCountry/Localities
│   └── service-requests.tool.ts  ← crea borradores vía PrismaService
├── dto/
│   ├── agent-chat.dto.ts
│   └── agent-message.dto.ts
└── prompts/
    └── hireeo-system.prompt.ts   ← system prompt centralizado
```

### `app.module.ts` — registro

```typescript
// Importar AiAgentsModule junto a ChatbotModule
imports: [
    ChatbotModule,    // sigue funcionando — no se elimina
    AiAgentsModule,   // nuevo
    // ...resto
]
```

---

## 4. Tools — wrappers sobre servicios existentes

Cada tool es un wrapper fino sobre un servicio NestJS que ya existe.
El modelo Gemini elige cuándo llamar a cada una.

### `categories.tool.ts`

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import type { CategoriesService } from '../../categories/categories.service';

export const obtenerCategorias = (categories: CategoriesService) =>
    tool({
        description: 'Lista todas las categorías de servicios disponibles en el país del usuario. Úsala cuando no estés seguro de qué categoría aplica.',
        parameters: z.object({
            countryCode: z.string().describe('Código del país: cl, ar, uy, es, us'),
        }),
        execute: async ({ countryCode }) => {
            const cats = await categories.findAll(countryCode);
            return cats.map((c) => ({ slug: c.slug, nombre: c.name }));
        },
    });
```

### `services.tool.ts`

```typescript
export const buscarProveedores = (services: ServicesService) =>
    tool({
        description: 'Busca proveedores activos filtrados por categoría, localidad y urgencia. Devuelve hasta 3 resultados ordenados por calificación. Úsala una vez que sepas la categoría y la ubicación.',
        parameters: z.object({
            categoriaSlug: z.string().describe('Slug exacto de la categoría'),
            countryCode: z.string(),
            localitySlug: z.string().optional().describe('Slug de la localidad. Opcional si el usuario no lo indicó.'),
            urgency: z.enum(['urgent', 'this_week', 'whenever']).optional(),
        }),
        execute: async ({ categoriaSlug, countryCode, localitySlug }) => {
            const result = await services.findAll({
                categoriaSlug,
                countryCode,
                localitySlug,
                limit: 3,
                page: 1,
            });
            return result.items.map((s) => ({
                id: s.id,
                titulo: s.title,
                slug: s.slug,
                calificacion: s.averageRating,
                reseñas: s.ratingCount,
                localidad: s.locality?.name,
                disponible: true,
            }));
        },
    });
```

### `geo.tool.ts`

```typescript
export const buscarLocalidad = (geo: GeoService) =>
    tool({
        description: 'Busca el slug exacto de una localidad dado su nombre. Úsala cuando el usuario mencione una ciudad o pueblo para obtener el localitySlug correcto.',
        parameters: z.object({
            nombre: z.string().describe('Nombre de la ciudad o localidad mencionada por el usuario'),
            countryCode: z.string(),
        }),
        execute: async ({ nombre, countryCode }) => {
            const regiones = await geo.findRegionsByCountry(countryCode);
            for (const region of regiones) {
                const localidades = await geo.findLocalitiesByRegion(region.id);
                const match = localidades.find(
                    (l) => l.name.toLowerCase().includes(nombre.toLowerCase()),
                );
                if (match) return { slug: match.slug, nombre: match.name, regionId: region.id };
            }
            return null;
        },
    });
```

### `service-requests.tool.ts`

```typescript
export const crearBorradorSolicitud = (prisma: PrismaService) =>
    tool({
        description: 'Crea un borrador de solicitud de servicio SOLO cuando el usuario haya confirmado explícitamente que quiere continuar con un proveedor específico. NO llamar sin confirmación.',
        parameters: z.object({
            userId: z.string(),
            serviceId: z.string().describe('ID del proveedor elegido por el usuario'),
            categoriaSlug: z.string(),
            descripcion: z.string().describe('Descripción del problema en palabras del usuario'),
            countryCode: z.string(),
            localitySlug: z.string().optional(),
            urgency: z.enum(['urgent', 'this_week', 'whenever']),
        }),
        execute: async ({ userId, serviceId, descripcion, categoriaSlug, countryCode, urgency }) => {
            const draft = await prisma.serviceRequest.create({
                data: {
                    userId,
                    serviceId,
                    description: descripcion,
                    categorySlug: categoriaSlug,
                    countryCode,
                    urgency,
                    status: 'DRAFT',
                },
            });
            return { id: draft.id, status: 'DRAFT' };
        },
    });
```

---

## 5. Sistema de conversación multi-turno

### Historial de mensajes

El historial de la conversación viaja en el request del frontend:

```typescript
// dto/agent-chat.dto.ts
export class AgentMessageDto {
    @IsString() role!: 'user' | 'assistant';
    @IsString() content!: string;
}

export class AgentChatDto {
    @IsString()
    @MinLength(3)
    @MaxLength(500)
    mensaje!: string;

    @IsString()
    countryCode: string = 'cl';

    @IsString()
    @IsOptional()
    localitySlug?: string;

    @IsString()
    @IsOptional()
    userId?: string;

    @IsArray()
    @IsOptional()
    historial?: AgentMessageDto[];
}
```

### `ai-agents.service.ts` — núcleo

```typescript
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

@Injectable()
export class AiAgentsService {
    constructor(
        private readonly config: ConfigService,
        private readonly categories: CategoriesService,
        private readonly services: ServicesService,
        private readonly geo: GeoService,
        private readonly prisma: PrismaService,
    ) {}

    async chat(dto: AgentChatDto): Promise<AgentChatResponse> {
        const { mensaje, countryCode, localitySlug, userId, historial = [] } = dto;

        const { text, steps } = await generateText({
            model: google('gemini-2.5-flash'),
            system: HIREEO_SYSTEM_PROMPT(countryCode, localitySlug),
            messages: [
                ...historial,
                { role: 'user', content: mensaje },
            ],
            tools: {
                obtenerCategorias: obtenerCategorias(this.categories),
                buscarProveedores: buscarProveedores(this.services),
                buscarLocalidad: buscarLocalidad(this.geo),
                crearBorradorSolicitud: userId
                    ? crearBorradorSolicitud(this.prisma)
                    : undefined,
            },
            maxSteps: 5,        // el agente puede hacer hasta 5 tool calls por respuesta
            temperature: 0.4,
        });

        // Extraer proveedores si el agente los buscó
        const proveedoresStep = steps.find(
            (s) => s.toolCalls?.some((t) => t.toolName === 'buscarProveedores'),
        );
        const proveedores = proveedoresStep?.toolResults?.[0]?.result ?? [];

        // Detectar si se creó un borrador
        const borradorStep = steps.find(
            (s) => s.toolCalls?.some((t) => t.toolName === 'crearBorradorSolicitud'),
        );
        const borradorId = borradorStep?.toolResults?.[0]?.result?.id;

        return {
            mensaje: text,
            proveedores,
            borradorId,
            accion: this.inferirAccion(text, proveedores, borradorId),
        };
    }

    private inferirAccion(
        text: string,
        proveedores: unknown[],
        borradorId?: string,
    ): AgentAccion {
        if (borradorId) return 'confirmar_solicitud';
        if (proveedores.length > 0) return 'mostrar_proveedores';
        return 'conversacion';
    }
}
```

### System prompt centralizado

```typescript
// prompts/hireeo-system.prompt.ts
export const HIREEO_SYSTEM_PROMPT = (countryCode: string, localitySlug?: string) => `
Eres el asistente de Hireeo, el marketplace de servicios manuales para ${countryCode.toUpperCase()}.
Tu objetivo es ayudar al usuario a encontrar el profesional correcto lo más rápido posible.

Contexto del usuario:
- País: ${countryCode}
${localitySlug ? `- Localidad actual: ${localitySlug}` : '- Localidad: no especificada (puedes preguntar si es necesario)'}

Instrucciones:
1. Si el usuario describe un problema, usa obtenerCategorias para identificar la categoría exacta.
2. Una vez que tengas categoría y localidad, llama a buscarProveedores inmediatamente.
3. Presenta los resultados de forma natural, con nombre y calificación.
4. Si el usuario elige un proveedor, confirma antes de crear el borrador.
5. Usa crearBorradorSolicitud SOLO tras confirmación explícita del usuario.
6. Sé empático, breve y directo. Máximo 2-3 oraciones por respuesta.
7. Si no hay proveedores, ofrece alternativas (buscar en categoría "otros", ampliar zona).

NUNCA inventes proveedores. NUNCA inventes calificaciones. Usa solo los datos de las tools.
`;
```

---

## 6. Endpoint y respuesta tipada

### Controller

```typescript
// ai-agents.controller.ts
@Controller('ai-agents')
export class AiAgentsController {
    constructor(private readonly aiAgents: AiAgentsService) {}

    @Post('chat')
    @HttpCode(200)
    chat(@Body() dto: AgentChatDto): Promise<AgentChatResponse> {
        return this.aiAgents.chat(dto);
    }
}
```

### Tipos de respuesta compartidos (interface TypeScript)

```typescript
// dto/agent-response.dto.ts

export interface ProveedorCard {
    id: string;
    titulo: string;
    slug: string;
    calificacion: number;
    reseñas: number;
    localidad?: string;
}

export type AgentAccion =
    | 'conversacion'           // respuesta de texto, sin acción especial
    | 'mostrar_proveedores'    // mostrar tarjetas de proveedores
    | 'confirmar_solicitud'    // mostrar botón "Confirmar y pagar"
    | 'pedir_ubicacion';       // el agente no sabe la localidad, pedir al usuario

export interface AgentChatResponse {
    mensaje: string;
    accion: AgentAccion;
    proveedores: ProveedorCard[];
    borradorId?: string;
}
```

---

## 7. Evolución de la UI en appmobile

### Estado actual: 2 pasos estáticos

```
[inicio]       → usuario escribe un mensaje → navega a /servicios
[sinProveedores] → estado de error, navegar a "otros"
```

### Estado evolucionado: chat real con burbujas

```typescript
// Nuevos estados del ChatIA v2
type Paso =
    | 'chat'               // burbujas de conversación activas
    | 'sinProveedores';    // sin resultado (mantener para fallback)

// Nuevo estado
interface MensajeChat {
    id: string;
    rol: 'user' | 'assistant';
    texto: string;
    proveedores?: ProveedorCard[];   // tarjetas embebidas en el mensaje
    borradorId?: string;             // botón "Confirmar" embebido
}
```

### Flujo de pantalla evolucionado

```
┌─────────────────────────────────────────────────┐
│  ✦ Asistente Hireeo                         [X] │
├─────────────────────────────────────────────────┤
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │ Se me rompió una cañería en la cocina    │  │  ← burbuja usuario
│   └──────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ ✦ Entendido, es una urgencia de gasfitería.││  ← burbuja agente
│  │   Encontré 3 disponibles en Castro:        ││
│  │                                            ││
│  │  ┌──────────────────────────────────────┐ ││  ← tarjeta proveedor
│  │  │ ⭐ 4.9 · Juan Pérez · Gasfíter       │ ││
│  │  │ 31 reseñas · Castro                  │ ││
│  │  │              [Ver perfil] [Elegir →]  │ ││
│  │  └──────────────────────────────────────┘ ││
│  │  ┌──────────────────────────────────────┐ ││
│  │  │ ⭐ 4.7 · María González · Gasfíter   │ ││
│  │  └──────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│   ┌──────────────────────────────────────────┐  │
│   │ El primero me parece bien                │  │  ← burbuja usuario
│   └──────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │ ✦ Perfecto. Armé la solicitud para Juan.   ││
│  │   ¿La confirmamos ahora?                   ││
│  │                                            ││
│  │      [ ✅ Confirmar y pagar ]              ││  ← botón acción
│  └─────────────────────────────────────────────┘│
│                                                  │
├─────────────────────────────────────────────────┤
│  [ Escribí tu problema...            ] [Enviar] │
└─────────────────────────────────────────────────┘
```

### Nueva action en appmobile

```typescript
// features/chatbot/actions/chatConAgente.ts

export interface AgentChatResponse {
    readonly mensaje: string;
    readonly accion: 'conversacion' | 'mostrar_proveedores' | 'confirmar_solicitud' | 'pedir_ubicacion';
    readonly proveedores: ProveedorCard[];
    readonly borradorId?: string;
}

export async function chatConAgente(
    mensaje: string,
    countryCode: string,
    historial: MensajeChat[],
    localitySlug?: string,
    userId?: string,
): Promise<AgentChatResponse> {
    try {
        return await apiClient.post<AgentChatResponse>('/ai-agents/chat', {
            mensaje,
            countryCode,
            localitySlug,
            userId,
            historial: historial.map((m) => ({ role: m.rol, content: m.texto })),
        });
    } catch {
        return {
            mensaje: 'El asistente está ocupado. Intentá en unos segundos.',
            accion: 'conversacion',
            proveedores: [],
        };
    }
}
```

---

## 8. Fases de implementación

### Fase 0 — Preparar prerequisitos en Prisma/NestJS
**Responsable**: Claude Code

- [ ] Verificar que `ServicesService.findAll()` admite `localitySlug` como filtro (ya parece que sí — `localitySlug` en `QueryServicesDto`)
- [ ] Agregar `status DRAFT` al enum `ServiceRequestStatus` en `schema.prisma`
- [ ] Crear migración: `pnpm --filter backend db:migrate`
- [ ] Verificar que `GeoService` tiene `findLocalitiesByRegion(regionId)` (ya existe)

### Fase 1 — Instalar Vercel AI SDK en backend
**Responsable**: Claude Code

```bash
pnpm --filter backend add ai @ai-sdk/google
```

- [ ] Verificar que `zod` ya está instalado en backend (`pnpm --filter backend list zod`)
- [ ] Confirmar que `GEMINI_API_KEY` está en `.env` y en Vercel dashboard del backend

### Fase 2 — Crear módulo `ai-agents` (backend)
**Responsable**: Claude Code

Archivos a crear:
- [ ] `backend/src/modules/ai-agents/prompts/hireeo-system.prompt.ts`
- [ ] `backend/src/modules/ai-agents/tools/categories.tool.ts`
- [ ] `backend/src/modules/ai-agents/tools/services.tool.ts`
- [ ] `backend/src/modules/ai-agents/tools/geo.tool.ts`
- [ ] `backend/src/modules/ai-agents/tools/service-requests.tool.ts`
- [ ] `backend/src/modules/ai-agents/tools/index.ts`
- [ ] `backend/src/modules/ai-agents/dto/agent-chat.dto.ts`
- [ ] `backend/src/modules/ai-agents/dto/agent-response.dto.ts`
- [ ] `backend/src/modules/ai-agents/ai-agents.service.ts`
- [ ] `backend/src/modules/ai-agents/ai-agents.controller.ts`
- [ ] `backend/src/modules/ai-agents/ai-agents.module.ts`
- [ ] Registrar `AiAgentsModule` en `app.module.ts`

### Fase 3 — Evolucionar ChatIA en appmobile
**Responsable**: Claude Code

- [ ] Crear `features/chatbot/actions/chatConAgente.ts`
- [ ] Crear componente `features/chatbot/components/ProveedorCard/index.tsx`
- [ ] Refactorizar `ChatIA/index.tsx`:
  - Estado: array de `MensajeChat[]` en lugar de `paso: string`
  - UI: lista de burbujas scrollable
  - Renderizar `ProveedorCard` embebido cuando `accion === 'mostrar_proveedores'`
  - Renderizar botón "Confirmar y pagar" cuando `accion === 'confirmar_solicitud'`
- [ ] Mantener `/chatbot/detect` como fallback (no eliminar)

### Fase 4 — ChatIA en Next.js (frontend web)
**Responsable**: Claude Code (si se prioriza)

- [ ] Crear `features/chatbot/components/ChatIAWidget/index.tsx` en frontend
- [ ] Mismo flujo que appmobile, adaptado a desktop/mobile web
- [ ] Posible ubicación: botón flotante en `/cl/buscar` y en home

### Fase 5 — Streaming (mejora de UX)
**Responsable**: Claude Code

Cambiar `generateText` → `streamText` en el service.
Requiere endpoint con `Content-Type: text/event-stream`.

```typescript
// En el controller, endpoint /ai-agents/chat/stream
@Get('chat/stream')
async chatStream(@Query() dto: AgentChatDto, @Res() res: Response): Promise<void> {
    const stream = await this.aiAgents.chatStream(dto);
    res.setHeader('Content-Type', 'text/event-stream');
    for await (const chunk of stream.textStream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.end();
}
```

En appmobile y Next.js: usar `EventSource` o `fetch` con `ReadableStream`.

---

## 9. Seguridad

```
POST /api/v1/ai-agents/chat
  └─ ApiKeyGuard (x-api-key) — ya global en el backend
  └─ ThrottlerGuard — ya registrado como APP_GUARD
       └─ Limitar a 10 requests/minuto por IP (ajustar según uso)
  └─ crearBorradorSolicitud se inyecta SOLO si userId está presente y autenticado
  └─ ValidationPipe — whitelist: true, forbidNonWhitelisted: true
```

Agregar en `app.module.ts` un rate limit específico para ai-agents:
```typescript
@Throttle({ 'ai-agents': { limit: 10, ttl: 60000 } })
@Controller('ai-agents')
```

---

## 10. Variables de entorno

No se agregan variables nuevas. Se reutiliza la existente:

```
GEMINI_API_KEY=<ya configurada en Vercel backend>
```

---

## 11. Lo que NO cambia

- `ChatbotModule` y `/chatbot/detect` **siguen intactos** — son el fallback
- `ApiKeyGuard` protege todo sin excepciones
- El flujo de pago existente (Stripe / MercadoPago) se activa desde el `borradorId`
- El agente **no puede pagar** — solo crea el borrador. El usuario confirma y paga desde la UI

---

## 12. Resumen de archivos nuevos / modificados

### Backend (NestJS)
```
NUEVO   backend/src/modules/ai-agents/  (módulo completo)
MODIFY  backend/src/app.module.ts       (registrar AiAgentsModule)
MODIFY  prisma/schema.prisma            (agregar DRAFT a ServiceRequestStatus)
MODIFY  backend/package.json            (ai + @ai-sdk/google)
```

### appmobile (React Native)
```
NUEVO   src/features/chatbot/actions/chatConAgente.ts
NUEVO   src/features/chatbot/components/ProveedorCard/index.tsx
MODIFY  src/features/chatbot/components/ChatIA/index.tsx  (refactor completo)
```

### Opcional (Next.js)
```
NUEVO   src/features/chatbot/components/ChatIAWidget/index.tsx
```


## 13. QA Recomendado

**NOTA**: Se recomienda fuertemente que otra IA (como Claude) realice un proceso exhaustivo de Quality Assurance (QA) sobre todo lo implementado en las Fases 0, 1, 2 y 3. Esto debe incluir la revisión estricta de tipos en TypeScript, la estabilidad del chat multi-turno en React Native, y los posibles casos borde al crear los borradores en Prisma.
