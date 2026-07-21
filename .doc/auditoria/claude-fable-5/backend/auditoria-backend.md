# Auditoría Backend

**Stack:** NestJS 10.4, Prisma 7.5 (adapter-pg), PostgreSQL 16, JWT+Passport, socket.io, Swagger, class-validator, Helmet. 142 archivos TS, 26 módulos. Build ✅, typecheck ✅, lint ❌ (17 err/40 warn, fuera del pipeline).

## Arquitectura
- **Monolito modular** por dominio (auth, users, geo, services, categories, prices, subscriptions, sponsors, ratings, payments, interactions, favorites, chat, service-requests, quotes, crm, notifications, escrow, kyc, integrations, email, upload, chatbot, ai-agents). Cohesión alta.
- **Controllers delgados, services con la lógica, DTOs con class-validator, guards reutilizables.** Cumple las guías NestJS.
- **Es la arquitectura correcta** para el tamaño y para escalar. No se recomienda microservicios.

## API
- Prefijo `api/v1` con versionado por URI. Swagger solo en dev (correcto).
- `ValidationPipe` global estricto (`whitelist + forbidNonWhitelisted + transform`).
- Paginación presente en listados (users, subscriptions). Códigos HTTP y excepciones Nest correctos.
- **Falta:** rate limiting efectivo en multi-instancia (throttler en memoria), idempotencia explícita en webhooks, correlation IDs/trazabilidad.

## Seguridad
- **BE-05 (Alta):** `GET /users` sin RolesGuard → PII expuesta con api-key compartida.
- **BE-03 (Alta):** WebSocket CORS `origin:'*'`.
- **TR-09 (Alta):** refresh tokens 30d no revocables.
- **Positivo:** bcrypt 12 rounds, comparaciones en tiempo constante, AES-256-GCM para credenciales, validación server-side de OAuth (Google/Apple/Microsoft), firma de webhooks (Stripe `constructEvent`, MP HMAC), ownership en chat, serialización que elimina `password`.
- **Enumeración de usuarios:** `register`/`login` revelan existencia de email (mensajes específicos).

## Base de datos
- **24 modelos, 7 migraciones versionadas** (regla del proyecto: siempre migrate, nunca push — cumplida).
- **Índices razonables**, incluido compuesto `Service(countryId, level, featured, endDate)`.
- `onDelete: Cascade` en Service→User. Decimales correctos para precios/ratings.
- **A revisar a escala:** N+1 potenciales en listados con relaciones (el chat `handleSendMessage` llama `getConversationsByUser` completo por mensaje — ineficiente), retención/archivado de mensajes e interacciones, réplica de lectura.

## Rendimiento y escalabilidad
- **BE-04 (Alta):** desplegado como función serverless en Vercel → WebSocket persistente y throttler en memoria no funcionan correctamente.
- `handleSendMessage` recalcula todas las conversaciones del usuario por cada mensaje (`chat.gateway.ts`): O(conversaciones) por envío. Optimizar con consulta puntual.
- Sin caché (Redis) para lecturas calientes (geo, categorías).
- Sin health/readiness/liveness endpoints (el handler serverless no los expone).

## Módulos incompletos (stubs)
- **payments gateways:** `createPayment` retorna datos falsos (TR-01).
- **subscriptions webhook:** mapeo evento→suscripción "pendiente Fase 2.1".
- **kyc:** `vi_stub_...` (TR-14).
- `escrow`: presente, sin lógica de retención real verificada.

## Testing
- **0 tests** (`*.spec.ts` = 0). Riesgo alto para módulos de dinero y permisos.

## Recomendaciones priorizadas
1. RolesGuard en `/users` (BE-05); CORS del gateway (BE-03).
2. Implementar pagos reales + mapeo webhook (TR-01).
3. Rotación/revocación de refresh (TR-09).
4. Migrar a runtime long-running + Redis (BE-04/BE-16).
5. Optimizar `handleSendMessage`; añadir health checks; tests de dominio.
6. Lint en CI; resolver 17 errores.
