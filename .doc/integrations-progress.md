# Integrations — Progress Checklist

> Fuente de verdad del estado de ejecución. Actualizar inmediatamente al completar cada tarea.
> LLM ejecutor: **Claude Code** (todas las zonas — Claude + Gemini + Claude)

## Leyenda
- ✅ Completo (lint + build pasando, commiteado)
- 🔄 En progreso
- ⬜ Pendiente
- ❌ Bloqueado (describir motivo)

---

## Wave 0a — Schema
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T0.1 | Prisma schema: enum + modelos + relaciones | Claude | ✅ | b749b58 |
| T0.2 | Migración `add_integrations` | Claude | ✅ | b749b58 |

## Wave 0b — Crypto + Providers
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T1.1 | `CryptoService` AES-256-GCM | Claude | ✅ | 185df8b |
| T1.2 | `integration-providers.ts` + `provider-schemas.ts` | Gemini | ✅ | 185df8b |

## Wave 0c — Config Service
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T1.3 | `IntegrationConfigService` (cache + fallback) | Claude | ✅ | 185df8b |

## Wave 0d — CRUD + Runtime
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T1.4 | `IntegrationsService` + DTOs | Claude | ✅ | 185df8b |
| T1.5 | `IntegrationsController` SuperAdmin | Claude | ✅ | 185df8b |
| T1.6 | `IntegrationRuntimeController` + `ServiceTokenGuard` | Gemini | ✅ | 185df8b |

## Wave 0e — Module
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T1.7 | `IntegrationsModule` + registro en `app.module.ts` | Claude | ✅ | 185df8b |

## Wave 1 — Consumers + Frontend base + Migration script
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T2.1 | `StripeGateway` → `IntegrationConfigService` | Claude | ✅ | 25420ec |
| T2.2 | `MercadoPagoGateway` → `IntegrationConfigService` | Claude | ✅ | 25420ec |
| T2.3 | `KycService` → `IntegrationConfigService` + elimina `mock_signature` | Claude | ✅ | 25420ec |
| T2.4 | `NotificationsService` (Firebase lazy) | Claude | ✅ | 25420ec |
| T2.5 | `AiAgentsService` → `createGoogleGenerativeAI` | Claude | ✅ | 25420ec |
| T2.6 | Seed Cloudinary → `IntegrationConfigService` | Claude | ⬜ skipped — seed es one-shot, mantiene env var |
| T3.1 | Frontend: types + schemas espejo | Claude | ✅ | cb8dbc2 |
| T3.2 | Frontend: Server Actions (queries + mutations) | Claude | ✅ | cb8dbc2 |
| T3.3 | Frontend: componentes UI (List, Card, Form, Matrix) | Claude | ✅ | cb8dbc2 |
| T3.4 | Frontend: página `/config/integrations` | Claude | ✅ | cb8dbc2 |
| T3.5 | Frontend: AdminSidebar + ConfigPageHeader | Claude | ✅ | cb8dbc2 |
| T6.1 | Script migración env vars → DB (one-shot) | Claude | ✅ | ac8e77c |

## Wave 2 — Brevo + Cloudinary al backend
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T4.1 | Módulo `email` backend (Brevo) | Claude | ✅ | 40e0673 |
| T4.2 | Migrar `email.ts` frontend → server action | Claude | ✅ | 614a6db |
| T4.3 | Módulo `upload` backend (Cloudinary) | Claude | ✅ | fc54540 |
| T4.4 | Proxy `/api/upload` → backend + migrar callers | Claude | ✅ | 5229d93 |

## Wave 3 — OAuth a DB
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T5.1 | `oauth-credentials.ts` helper (frontend server-side) | Claude | ✅ | 68d903d |
| T5.2 | `authOptions` async con providers dinámicos | Claude | ✅ | 68d903d |
| T5.3 | Eliminar env vars OAuth del frontend | Claude | ✅ | (ya estaba en .env.example) |

## Wave 4 — Limpieza env vars
| ID | Descripción | LLM orig | Estado | Commit |
|----|-------------|----------|--------|--------|
| T6.2 | Limpiar env vars proveedores de `backend/.env.*` | Claude | ✅ | 3a4aba6 |

---

## Estado final: ✅ TODAS LAS TAREAS COMPLETADAS

---

## Notas técnicas
- **Quirk Prisma v7**: compound unique nullable → `findFirst` para reads, cast `unknown as string` para writes con `provider_countryId`
- **AiAgentsService**: mantiene `@ts-nocheck` — errores son pre-existentes del AI SDK, scope separado
- **T2.6 (seed Cloudinary)**: skipped — corre fuera de contexto Nest, mantiene env var (one-shot válido)
- **T4.4**: `/api/upload` NO eliminado — convertido a proxy que llama backend con `backendToken` de sesión. Misma interfaz para browser clients.
- **T5.3**: `.env.example` frontend ya estaba limpio (pre-existente de sesión anterior)
- `INTEGRATIONS_ENCRYPTION_KEY`: 32 bytes base64 → `openssl rand -base64 32`
- `INTERNAL_SERVICE_TOKEN`: hex 32 bytes → `openssl rand -hex 32`
- Migración env vars → DB: `pnpm tsx prisma/seed/migrate-integrations.ts`
