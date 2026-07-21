# Arquitectura objetivo

Propuesta de arquitectura objetivo **incremental** para Hireeo, evolucionando desde el estado actual hacia soporte de gran escala. **No se recomienda reescritura**; los cambios son incrementales y justificados por impacto/costo.

Diagrama objetivo en [`diagramas/arquitectura-objetivo.mmd`](./diagramas/arquitectura-objetivo.mmd).

## Principios

1. **Monolito modular primero**: NO migrar a microservicios salvo evidencia técnica suficiente. El módulo NestJS actual es la base correcta.
2. **Contrato primero**: compartir tipos entre frontend/backend/mobile vía OpenAPI o paquete de tipos compartido.
3. **Serverless para edge + API, pero persistente para chat/colas**: extraer WebSocket y jobs a servicios especializados cuando el tráfico lo justifique.
4. **Seguridad por defecto**: JwtAuthGuard global, rate limiting por endpoint, observabilidad de seguridad.
5. **Zero-downtime**: migraciones compatibles hacia atrás, feature flags para rollouts.

## Estado objetivo por ventanas

### Corto plazo (0-30 días) — Estabilización

**Mantener**:
- NestJS modular monolith en Vercel.
- Next.js App Router en Vercel.
- PostgreSQL en Neon/Supabase (gestionado).
- Prisma ORM.
- Expo + EAS para mobile.

**Refactorizar**:
- Backend: hacer `JwtAuthGuard` global, arreglar IDORs, refresh token rotation.
- Frontend: arreglar webhooks de pago, añadir error boundaries, mover tokens a cookies httpOnly.
- Mobile: añadir `x-api-key`, `SOCKET_URL` desde env, fix `applicationId`/`app_name`.

**Añadir**:
- CI/CD GitHub Actions (lint, typecheck, test, audit, build).
- Sentry para error tracking (frontend + backend + mobile).
- Logger estructurado en backend (pino + correlation IDs).
- Tests unitarios mínimos en servicios críticos (auth, payments, services).
- Healthcheck endpoint (`/health` y `/ready`).

### Mediano plazo (30-90 días) — Escalabilidad inicial

**Añadir**:
- **Redis** (Upstash) para:
  - Rate limiting distribuido (ThrottlerModule con storage Redis).
  - Caché de queries caras (TopPro, listings con filtros).
  - Refresh token denylist (BE-SEC-002 fix persistente).
  - Idempotencia de webhooks.
- **BullMQ** + worker persistente (Vercel no soporta long-running workers):
  - Notificaciones push asíncronas.
  - Emails transaccionales.
  - Webhooks de pago procesados fuera del handler HTTP.
- **Servicio de chat dedicado** (Pusher, Ably, o un small VM con Socket.io) — extraer del serverless.
- **Pino + OpenTelemetry** para logs y trazas distribuidas.
- **OpenAPI spec** generada desde NestJS + cliente TypeScript generado para frontend y mobile.
- **Paquete `@hireeo/contracts`** con tipos compartidos (build local, no publicado).

**Refactorizar**:
- Schema Prisma: añadir `deletedAt` (soft-delete) en `Service`, `User`, `Message`.
- Schema Prisma: añadir `RefreshToken` model (rotación).
- Schema Prisma: añadir `ProcessedWebhook` model (idempotencia).
- Frontend: `next/dynamic` para bundles pesados (leaflet, recharts, MP SDK).
- Mobile: migrar a `expo-image`.

### Largo plazo (90+ días) — Escala grande

**Considerar (solo si hay métricas que lo justifiquen)**:
- **Read replicas** de PostgreSQL para listings (search) cuando QPS > 500.
- **CDN edge para API pública** (Cloudflare Workers) si latencia global es problema.
- **Multi-región**: solo si el mercado US o ES despega y la latencia cross-atlantic es perceptible.
- **Event sourcing / outbox pattern** para integraciones críticas (pagos, KYC) si la consistencia es problema.
- **Sharding por país** solo si un país (ej. US) supera 10M usuarios.

**NO hacer todavía**:
- Migrar a microservicios (la modularidad actual de NestJS es suficiente).
- Cambiar DB (PostgreSQL es correcto).
- Cambiar ORM (Prisma es correcto).
- Migrar auth a Cognito/Auth0 (NextAuth + custom JWT es flexible y suficiente).
- Adoptar GraphQL (REST + OpenAPI es más simple y suficiente para el dominio).

## Componentes a mantener

- **NestJS modular monolith**: la base es correcta.
- **Prisma + PostgreSQL**: stack correcto.
- **Next.js App Router**: stack correcto.
- **Expo SDK 54 + EAS**: stack mobile correcto.
- **NextAuth v4**: stack correcto (considerar v5 solo al estabilizar).
- **Cloudinary**: servicio correcto para imágenes.
- **Stripe + MercadoPago**: pasarelas correctas para los países.

## Componentes a refactorizar

| Componente | Cambio | Justificación |
|---|---|---|
| Backend auth | JwtAuthGuard global + refresh rotation | Seguridad crítica (BE-SEC-002, 005) |
| Backend controllers | Ownership checks uniformes | IDOR (BE-SEC-001, 004, 011) |
| Frontend webhooks | Mover handlers al backend | Simplifica auth + idempotencia (FE-PAY-001, 002) |
| Frontend session | Tokens en cookies httpOnly separadas | XSS (FE-SEC-008) |
| Mobile apiClient | Añadir `x-api-key` + timeout | Contrato roto (MOB-001) |
| Mobile ident | `app.hireeo` + "Hireeo" | Release (MOB-004, 005) |
| Mobile chat | SOCKET_URL desde env | Producción (MOB-002) |
| CI | GitHub Actions | Sin pipelines hoy (TRANSV-002) |

## Componentes a reemplazar

| Componente | Actual | Objetivo | Justificación |
|---|---|---|---|
| Socket.io en Vercel | Inestable en serverless | Pusher / Ably / VM dedicado | Solo cuando el chat se use activamente (>100 conexiones concurrentes) |
| `console.log/error` en frontend | 30+ sin estructura | Logger con nivel + sampling | Observabilidad |
| `Logger` NestJS default | Texto plano | pino + request IDs | Observabilidad |
| `Math.random` para passwords | Crypto-inseguro | `crypto.randomBytes` / server-side | FE-SEC-009 |
| `Image` RN | Sin cache | `expo-image` | MOB-009 |

## Nuevos componentes necesarios

1. **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) con jobs paralelos por capa.
2. **Sentry**: error tracking para las 3 capas.
3. **Logger estructurado**: `pino-http` + `request-context` para correlation IDs.
4. **Health endpoints**: `/health` (liveness), `/ready` (readiness) en backend.
5. **OpenAPI**: publicar `swagger.json` + generar cliente TS.
6. **Paquete de tipos compartidos**: `@hireeo/contracts` (workspace interno).
7. **Redis (Upstash)**: rate limiting, caché, denylist, idempotencia.
8. **BullMQ worker**: jobs asíncronos (notifs, emails, webhooks).
9. **Tests**: Jest en backend, Vitest/Playwright en frontend, Jest+RNTL en mobile.

## Cambios que todavía NO deben realizarse

| Cambio | Por qué no ahora | Cuándo sí |
|---|---|---|
| Microservicios | Modularidad NestJS actual es suficiente | Cuando un módulo (ej. chat) tenga requerimientos de escala/cambio radicalmente distintos |
| GraphQL | REST + OpenAPI es más simple | Solo si el frontend necesita queries muy flexibles |
| Multi-región | Sin latencia medida | Cuando US/ES tengan >10K usuarios activos |
| Read replicas | Sin cuello medido en DB | Cuando QPS > 500 |
| Event sourcing | Complejidad innecesaria hoy | Solo si consistencia distribuida es crítica |
| Migrar a Auth0/Cognito | NextAuth funciona | Solo si se necesita MFA empresarial o SSO B2B |
| Sharding por país | Sin volumen | Solo si un país supera 10M usuarios |
| iOS native build | No hay `ios/` carpeta | Cuando Android esté estable en producción |

## Señales/métricas que justificarían futuros cambios

| Métrica | Umbral | Acción |
|---|---|---|
| P95 de `/services` (search) | > 500ms | Añadir Redis cache + índices compuestos |
| DB connections saturadas | > 80% pool | PgBouncer + read replicas |
| Webhooks duplicados procesados | > 1% | Idempotencia obligatoria |
| Chat connections concurrentes | > 100 | Extraer a servicio dedicado |
| Push notifications demora | > 30s | BullMQ worker dedicado |
| Errores 5xx | > 0.1% | APM + alerting |
| Mobile crash-free users | < 99.5% | Crash reporting + stabilización |
| Tiempo onboarding dev | > 4h | Mejorar docs + devcontainer |

## Arquitectura objetivo visual (descripción textual)

```
                      ┌──────────────────────┐
                      │     Cliente Web      │
                      │   (Next.js, Vercel)  │
                      └──────────┬───────────┘
                                 │
                      ┌──────────┴───────────┐
                      │                      │
                ┌─────▼──────┐        ┌──────▼───────┐
                │  Frontend  │        │   Backend    │
                │  (Edge)    │        │   (Node)     │
                │  proxy.ts  │        │   NestJS     │
                └─────┬──────┘        └──────┬───────┘
                      │                      │
                      │      /api webhooks   │
                      │  (Stripe/MP)         │
                      │                      │
                      │              ┌───────▼────────┐
                      │              │  OpenAPI spec  │
                      │              │  (cliente TS)  │
                      │              └───────┬────────┘
                      │                      │
                ┌─────▼──────────────────────▼─────┐
                │           PostgreSQL              │
                │   (Neon/Supabase + read replica)  │
                └────────────────┬──────────────────┘
                                 │
                ┌────────────────┼────────────────────┐
                │                │                    │
        ┌───────▼───────┐  ┌─────▼─────┐  ┌───────────▼──────────┐
        │     Redis     │  │  BullMQ   │  │  Chat service        │
        │  (Upstash)    │  │  workers  │  │  (Pusher/Ably/VM)    │
        │               │  │           │  │                      │
        │ - rate limit  │  │ - emails  │  │                      │
        │ - cache       │  │ - push    │  │                      │
        │ - denylist    │  │ - webhooks│  │                      │
        │ - idempotency │  │           │  │                      │
        └───────────────┘  └───────────┘  └──────────────────────┘

                ┌─────────────────────────────┐
                │   Observabilidad            │
                │  Sentry + pino + OTel       │
                │  + Grafana / Datadog        │
                └─────────────────────────────┘

                ┌─────────────────────────────┐
                │      Mobile (EAS)           │
                │  Expo + @hireeo/contracts   │
                └─────────────────────────────┘
```
