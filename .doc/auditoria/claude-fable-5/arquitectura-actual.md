# Arquitectura actual

## Visión general

Monorepo pnpm (`hireeo` v1.1.9) con tres unidades como submódulos git independientes:

- **frontend** — Next.js 16.1.1, React 19, App Router, TypeScript strict, Tailwind v4, next-auth v4, React Compiler. Despliegue Vercel.
- **backend** — NestJS 10, Prisma 7 (adapter-pg), PostgreSQL 16, JWT + Passport, socket.io, Swagger. Despliegue Vercel serverless.
- **appmobile** — Expo SDK 54, React Native 0.81.5, expo-router 6, NativeWind v4, React Query, SecureStore.

Diagrama: `diagramas/arquitectura-actual.mmd`.

## Inventario técnico

### Lenguajes y frameworks
TypeScript en las 3 capas · NestJS 10 · Next.js 16 · Expo/React Native · Prisma 7 ORM.

### Datos
- **PostgreSQL 16** (docker local en `docker-database/`, puerto 5433; Adminer en 8080).
- **24 modelos Prisma** con 8 enums. Modelos núcleo: `User`, `Role`/`UserRole` (RBAC multi-país), `Service`, `ServiceCategory`, `Rating`, `Subscription`, `Sponsor`, `PremiumPrice`, `Conversation`/`Message`, `ServiceRequest`/`Quote`, `Integration`/`IntegrationAuditLog`, `Country`/`GeoRegion`/`GeoLocality`, `Address`, `DeviceToken`, `Favorite`.
- **7 migraciones** versionadas (última: `add_integrations`).
- **Índices razonables**, incluido un compuesto en `Service(countryId, level, featured, endDate)` para el listado premium.

### Servicios de terceros
MercadoPago (cl/ar/uy) · Stripe (es/us) · Cloudinary (imágenes) · Google Gemini (AI agents + chatbot) · Firebase Admin (push) · OAuth Google/Apple/Microsoft.

### Autenticación
- **Backend:** JWT propio (access 15m / refresh 30d), Passport (jwt + local), guards `ApiKeyGuard` (global), `JwtAuthGuard`, `RolesGuard`, `WebhookGuard`, `ServiceTokenGuard`.
- **Frontend:** next-auth v4 con estrategia JWT; envuelve el JWT del backend (`backendToken`/`backendRefreshToken`) y lo refresca en el callback `jwt`.
- **Mobile:** JWT del backend en SecureStore, refresh coordinado con cola en `apiClient`.

### Multi-país
`proxy.ts` (renombrado de middleware en Next 16) detecta país por cookie > CF header > Vercel header > Accept-Language > `cl`. Rutas activas bajo `/[country]/...`. Gateway de pago resuelto en runtime por país.

### Observabilidad / CI / IaC
- **CI/CD:** no hay workflows (`.github/workflows` ausente). Deploy vía Vercel (git push).
- **Observabilidad:** solo `console.*` y `Logger` de Nest; sin APM, sin error tracking, sin logs estructurados centralizados.
- **IaC:** solo `docker-compose` de la base de datos local; sin Terraform/K8s.

## Puntos de entrada

- Frontend: rutas App Router `(country)/[country]/(public|admin|account)`, rutas legacy con redirect, y `app/api/*` (auth, webhooks, upload, revalidate, stripe-session).
- Backend: `api/v1/*` (26 módulos), WebSocket `/chat`.
- Mobile: expo-router (`(auth)`, `(tabs)`, chat, profile, publish, service, notifications).

## Flujos críticos

1. **Registro/Login** → next-auth (web) / authService (mobile) → backend `/auth/*` → JWT.
2. **Publicar servicio** (wizard multi-paso) → upload a Cloudinary vía proxy → creación de Service.
3. **Buscar servicios** (Server Component) → backend geo + services con filtros dinámicos.
4. **Chat en tiempo real** → socket.io `/chat`.
5. **Pago premium** → gateway por país → webhook → activación de suscripción. **(hoy stub, ver TR-01)**.

## Puntos únicos de fallo (SPOF)

- **Backend serverless en Vercel** como único runtime: incompatible con WebSocket persistente y throttler en memoria (BE-04).
- **Api-key global única** (`API_KEY`): compromiso = acceso a endpoints protegidos solo por ella (p. ej. `/users`).
- **`INTEGRATIONS_ENCRYPTION_KEY`**: su pérdida hace irrecuperables todas las credenciales de pasarelas; su filtración las expone todas.
- **PostgreSQL única instancia** sin réplica documentada.

## Acoplamiento y cohesión

- **Backend:** buena modularidad NestJS (26 módulos por dominio), servicios delgados, DTOs con class-validator, guards reutilizables. Cohesión alta.
- **Frontend:** organización DDD por `features/` con carpeta por componente (regla del proyecto). Server Components por defecto + Server Actions. Coherente.
- **Acoplamiento problemático:** lógica de pago **duplicada** entre frontend (`app/api/webhooks`, `stripe-session`) y backend (`payments`/`subscriptions`), con validaciones divergentes (FE-10).
- **Contrato Front/Back/Mobile:** sin contrato compartido (OpenAPI/tipos generados); cada capa redefine sus tipos → riesgo de deriva. El backend expone Swagger solo en dev.

## Riesgos de crecimiento

- Sin CI ni tests: la velocidad de cambio caerá al crecer el equipo.
- Sin observabilidad: diagnosticar producción será lento.
- Serverless + WebSocket: el chat no escala en la topología actual.
- Contratos no versionados: un cambio en backend puede romper web/mobile en silencio.
