# Arquitectura actual

Estado actual (AS-IS) del sistema al commit `bc57586`. Diagrama completo en [`diagramas/arquitectura-actual.mmd`](./diagramas/arquitectura-actual.mmd).

## Visión general

Monorepo con 3 aplicaciones + 1 servicio de base de datos local. **No hay producción desplegada verificable**; la arquitectura cloud предполагada es Vercel (serverless) para frontend y backend, Neon/Supabase para PostgreSQL (no confirmado), Cloudinary para imágenes, y EAS para mobile.

```
                 ┌─────────────────────────────────────┐
                 │         Cliente final               │
                 │  Web (Next.js) · App (Expo)         │
                 └────────────────┬────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
       (HTTPS, SSR)        (HTTPS, CSR)            (WSS / socket.io)
            │                     │                     │
   ┌────────▼─────────┐  ┌────────▼─────────┐   ┌───────▼────────┐
   │  Vercel Edge     │  │   Vercel Node    │   │  Vercel Node   │
   │  (proxy.ts)      │  │   (Next.js SSR)  │   │  (Socket.io?)  │
   └────────┬─────────┘  └────────┬─────────┘   └───────┬────────┘
            │                     │                     │
            │      /api/* (Next)  │  fetch (SSR)        │
            │                     │  + x-api-key        │
            │             ┌───────▼──────────┐          │
            │             │  Backend NestJS  │◄─────────┘
            │             │  (Vercel Node)   │  (chat.gateway)
            │             │  /api/v1/*       │
            │             └───┬───────┬──────┘
            │                 │       │
            │       ┌─────────┘       └──────────┐
            │       │                            │
            │       ▼                            ▼
            │  PostgreSQL                  Servicios externos
            │  (Neon/Supabase?)            (Stripe, MercadoPago,
            │                              Cloudinary, Firebase,
            │                              Brevo, Gemini AI)
            │
            ▼
       Cloudinary (imágenes)  ←── (upload.controller)
```

## Componentes

### 1. Frontend (Next.js 16.1.1)
- **Hosting supuesto**: Vercel.
- **Entry points**: `app/layout.tsx` (root), `proxy.ts` (middleware de routing multi-país).
- **46 páginas** en `app/`, organizadas en route groups `(country)/[country]/(public)`, `(country)/[country]/(admin)`, y legacy `(public)`, `(auth)`, `(config)`.
- **35 server action files** en `features/*/actions/`.
- **18 features** en `features/`: auth, services, users, payments, geo, categories, sponsors, reviews, sponsors, configuration, chat, contact, analytics, home, legal, search, notifications.
- **Auth**: NextAuth v4 con estrategia JWT, callbacks a backend para login/refresh.
- **API client**: `lib/api/apiClient.ts` con inyección de `x-api-key` solo en SSR.
- **Webhooks**: 2 route handlers (`/api/webhooks/stripe`, `/api/webhooks/mercadopago`).

### 2. Backend (NestJS 10)
- **Hosting supuesto**: Vercel serverless (`api/` index, handler default export, `cachedServer`).
- **Entry**: `src/main.ts` con `bootstrap()` + `handler` para Vercel.
- **24 módulos**: ai-agents, auth, categories, chat, chatbot, crm, email, escrow, favorites, geo, integrations, interactions, kyc, notifications, payments, prices, quotes, ratings, service-requests, services, sponsors, subscriptions, upload, users.
- **Common**: guards (ApiKey, JwtAuth, Roles, ServiceToken, Webhook-no-usado), decorators, filters (PrismaException), interceptors (Serialize), utils (timing-safe, crypto).
- **DB**: PostgreSQL con Prisma 7.5, 22 modelos (ver `schema.prisma`).
- **Auth**: JWT (access 15m + refresh 30d stateless) + OAuth Google/Apple/Microsoft.
- **Pago**: Stripe + MercadoPago (gateways) con verificación de firma, pero `createPayment` es stub.
- **Chat**: socket.io gateway con auth JWT al conectar (CORS wildcard).
- **AI**: ai-agents module con Gemini (Google AI SDK + Vercel AI SDK).
- **Cifrado**: AES-256-GCM para credenciales de integraciones en DB.

### 3. Mobile (Expo SDK 54)
- **Entry**: `expo-router/entry`.
- **Estructura**: `app/` (con `(tabs)`, `(auth)`, `chat`, `profile`, `publish`, `service`, `notifications`), `features/`, `shared/`, `types/`.
- **State**: React Query v5.
- **Auth**: `AuthContext` con `expo-secure-store`.
- **API**: `shared/lib/apiClient.ts` (sin `x-api-key` — bug crítico MOB-001).
- **Chat**: `SocketContext` con `socket.io-client` (URL hardcodeada — MOB-002).
- **Nativo**: `android/` (prebuild), sin `ios/`.
- **Build**: EAS (`eas.json`).

### 4. Infraestructura
- **DB local**: `docker-database/docker-compose.yml` con Postgres 16-alpine + Adminer.
- **CI/CD**: **NINGUNO** (no `.github/workflows/`).
- **IaC**: **NINGUNA** (no Terraform/Pulumi).
- **Observabilidad**: **NINGUNA** (no Sentry, Datadog, ni APM configurado en código).
- **Secretos**: `.env*` locales + Vercel env vars (supuesto).

## Flujos críticos

### Flujo 1 — Registro/Login con OAuth
1. Usuario envía credentials / OAuth idToken al backend `/auth/login` o `/auth/google`.
2. Backend emite access (15m) + refresh (30d) JWT.
3. Frontend los guarda en NextAuth JWT cookie (httpOnly).
4. Mobile los guarda en `expo-secure-store`.

**Puntos críticos**: BE-SEC-002 (refresh no revocable), FE-SEC-008 (tokens expuestos en `session.user`).

### Flujo 2 — Publicar servicio
1. Form en `/publish` → server action `publicarServicioPublico`.
2. Server action llama a `POST /services` con `x-api-key` + JWT.
3. Backend valida DTO + crea `Service`.

**Puntos críticos**: FE-SEC-001 (IDOR `usuarioId` del form), BE-SEC-012 (sin rol Professional).

### Flujo 3 — Pago de suscripción premium (Stripe)
1. Usuario click "Pagar premium" → `POST /api/payments/stripe-session` (frontend).
2. Frontend crea Stripe Checkout Session.
3. Usuario paga → Stripe webhook a `POST /api/webhooks/stripe` (frontend).
4. Frontend fetch a `POST /api/v1/subscriptions/activate` (backend).

**Puntos críticos**: FE-SEC-007 (precio client-side), FE-PAY-001 (sin `x-api-key` en paso 4), FE-PAY-002 (MP stub).

### Flujo 4 — Chat cliente-proveedor
1. Cliente inicia conversación desde página de servicio.
2. `POST /conversations` → backend crea Conversation.
3. Ambos se conectan via socket.io `/chat`.
4. `POST /messages` + emit `new_message` a room `conversation:<id>`.

**Puntos críticos**: BE-SEC-004 (IDOR join_conversation), BE-PAY-002 (CORS wildcard WS).

### Flujo 5 — Multi-país routing
1. Request llega → `proxy.ts`.
2. Detecta país (cookie → CF → Vercel → Accept-Language → `cl`).
3. Si legacy path, redirect 301 a `/{country}{path}`.
4. Si `/admin` o `/profile`, valida sesión + país.

**Puntos críticos**: Bien implementado; sin open redirect.

## Dependencias entre componentes

- **Frontend → Backend**: vía `apiClient` (fetch SSR) + webhooks Next.
- **Mobile → Backend**: vía `apiClient` mobile (fetch CSR) + socket.io-client.
- **Backend → DB**: Prisma ORM.
- **Backend → Cloudinary**: `upload.service.ts`.
- **Backend → Stripe/MP**: `payments/gateways/*`.
- **Backend → Firebase**: `notifications.service.ts` (FCM).
- **Backend → Brevo**: `email.service.ts`.
- **Backend → Gemini**: `chatbot.service.ts`, `ai-agents.service.ts`.
- **Frontend → Stripe/MP**: client-side SDKs (`@mercadopago/sdk-react`, `stripe` lazy).

## Puntos únicos de fallo (SPOF)

1. **Backend serverless en Vercel**: un solo deployment; si Vercel cae, todo cae.
2. **PostgreSQL**: una sola instancia (sin réplicas confirmadas).
3. **Cloudinary**: si cae, las imágenes no cargan (pero la app funciona).
4. **Socket.io en serverless**: ineficiente; **no funciona bien** sin servidor persistente. Esto es un SPOF arquitectónico — el chat se romperá al escalar.
5. **Vercel env vars**: si se borran, configuración perdida sin IaC.

## Acoplamiento y cohesión

- **Backend**: módulos bien cohesionados (cada uno su dominio). Algunas dependencias cruzadas innecesarias (ej. `ai-agents` importa de `service-requests`).
- **Frontend**: features aisladas; `shared/` contiene algunos componentes que deberían ser de dominio (FE-ARCH-001, FE-ARCH-002).
- **Mobile**: features aisladas; pero **contrato desincronizado con backend** (MOB-003, MOB-004, MOB-005, MOB-010 — DTOs/rutas en desacuerdo).

## Riesgos de crecimiento

1. **Base de datos**: sin archivado ni soft-delete; `services`, `messages`, `interactions` crecen sin límite.
2. **WebSocket chat**: socket.io no escala en serverless puro; necesitará servicio dedicado.
3. **Webhooks sin idempotencia**: a escala, duplicaciones se multiplican.
4. **Sin caché distribuida**: cada request hitting DB.
5. **Sin colas**: notificaciones push y emails son sincrónicos.
6. **Multi-tenancy débil**: país no validado en guards de forma consistente.
7. **Sin observabilidad**: a escala, imposible diagnosticar incidents sin trazas.
