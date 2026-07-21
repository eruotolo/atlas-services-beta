# Hireeo — Marketplace Multi-País de Servicios

## 📌 General

- **Repositorio:** `https://github.com/eruotolo/atlas-services-beta`
- **Nombre interno:** `hireeo` / `next-atlas-services`
- **Dominio oficial:** `hireeo.app` (subpaths por país: `/cl`, `/ar`, `/uy`, `/es`, `/us`)
- **Estado:** Beta — producción aún no desplegada
- **Versión actual:** `1.1.9`
- **Stack:** Monorepo pnpm workspaces (`/frontend` + `/backend`)
- **Node:** `>=22 <23` (`.nvmrc` con node 22)
- **Package manager:** `pnpm@10.33.2` — NUNCA npm ni yarn

---

## 🧱 Stack Técnico

### Frontend (`/frontend`)
| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.1.1 (App Router) |
| UI | React 19.2.3 + React Compiler habilitado |
| Tipos | TypeScript strict |
| Estilos | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Formularios | React Hook Form + Zod v4 |
| Tablas | TanStack React Table |
| Auth | NextAuth.js v4 |
| Pagos | MercadoPago SDK + Stripe |
| Storage | Cloudinary |
| Email | Brevo (Sendinblue) |
| IA | Google Gemini (`@google/genai`) |
| Realtime | Socket.io Client |
| Charts | Recharts |
| Linting | Biome 2.2.0 |
| Formato | Prettier (print width 100, tab 4, single quotes) |
| Tests E2E | Playwright |
| Deploy | Vercel |

### Backend (`/backend`)
| Capa | Tecnología |
|---|---|
| Framework | NestJS 10 (TypeScript strict) |
| ORM | Prisma 7.5 (client-js) |
| Base de datos | PostgreSQL |
| Auth | Passport.js (JWT + Local) + bcrypt |
| OAuth | Google, Apple, Microsoft (Azure AD) |
| Pagos | Stripe + MercadoPago |
| Realtime | Socket.io (`@nestjs/websockets`) |
| Push | Firebase Admin (FCM) |
| Rate limiting | `@nestjs/throttler` |
| Seguridad | Helmet |
| Docs | Swagger (`@nestjs/swagger`) |
| Linting | Biome |
| Puerto | `4000` |

---

## 🌍 Arquitectura Multi-País

### Países activos
| Código | País | Moneda | Pasarela |
|---|---|---|---|
| `cl` | Chile | CLP | MercadoPago |
| `ar` | Argentina | ARS | MercadoPago |
| `uy` | Uruguay | UYU | MercadoPago |
| `es` | España | EUR | Stripe |
| `us` | Estados Unidos | USD | Stripe |

> Paraguay (`py`) está pendiente para incorporar en el futuro.

### Detección de país
```
proxy.ts → cookie `hireeo_country` > CF header > Vercel header > Accept-Language > fallback `cl`
```

### Navegación con país
```typescript
// Client Components
const link = useCountryLink();      // features/geo/hooks/useCountryLink.ts
link('/buscar')                     // → '/cl/buscar'

// Server Components
countryLink('cl', '/buscar')        // → '/cl/buscar'
```

### CountryProvider
`lib/providers/CountryProvider.tsx` — provee via context: `country`, `currency`, `gateway`, `regionLabel`, `localityLabel`. Hook: `useCountry()`.

---

## 🗂️ Estructura del Monorepo

```
next-atlas-services/
├── frontend/src/
│   ├── app/
│   │   ├── (country)/[country]/
│   │   │   ├── (public)/          ← rutas públicas activas
│   │   │   │   ├── page.tsx       ← Home
│   │   │   │   ├── search/        ← Búsqueda de servicios
│   │   │   │   ├── service/       ← Detalle de servicio
│   │   │   │   ├── pricing/       ← Planes y precios
│   │   │   │   └── unauthorized/
│   │   │   └── (admin)/admin/     ← Panel admin scoped al país
│   │   │       ├── categories/
│   │   │       ├── services/
│   │   │       ├── users/
│   │   │       ├── sponsors/
│   │   │       ├── ratings/
│   │   │       ├── payments/
│   │   │       ├── premium-prices/
│   │   │       └── interactions/
│   │   ├── (config)/              ← Rutas de configuración de usuario
│   │   └── api/                   ← Route Handlers (auth, webhooks, upload)
│   ├── features/
│   │   ├── admin/         analytics, configuration, contact, auth admin
│   │   ├── auth/          login, register, OAuth
│   │   ├── categories/    CRUD + acciones de categorías
│   │   ├── chat/          mensajería realtime (Socket.io)
│   │   ├── chatbot/       IA (Gemini)
│   │   ├── favorites/     favoritos de usuarios
│   │   ├── geo/           países, regiones, localidades
│   │   ├── payments/      MercadoPago + Stripe
│   │   ├── reviews/       calificaciones y reseñas
│   │   ├── services/      publicación y búsqueda de servicios
│   │   ├── sponsors/      publicidad
│   │   └── users/         perfil de usuario
│   ├── lib/
│   │   ├── api/apiClient.ts       ← HTTP client (x-api-key automático)
│   │   ├── api/backendTypes.ts    ← Contratos DTO del backend
│   │   └── providers/CountryProvider.tsx
│   └── shared/
│       ├── components/    ← componentes reutilizables (sin lógica de dominio)
│       ├── lib/
│       ├── types/
│       └── schemas/
├── backend/src/
│   ├── modules/
│   │   ├── auth/          JWT + OAuth (Google, Apple, Microsoft)
│   │   ├── users/         gestión de usuarios
│   │   ├── services/      publicaciones
│   │   ├── categories/    categorías por país
│   │   ├── geo/           países, regiones, localidades
│   │   ├── ratings/       calificaciones
│   │   ├── subscriptions/ suscripciones premium
│   │   ├── payments/      Stripe + MercadoPago gateways
│   │   ├── prices/        precios premium por país
│   │   ├── sponsors/      anunciantes
│   │   ├── interactions/  VIEW_PHONE, VIEW_EMAIL, CALL, WHATSAPP
│   │   ├── chat/          Socket.io WebSocket
│   │   ├── crm/           dashboard de leads para profesionales
│   │   ├── escrow/        pagos retenidos (Fase 4)
│   │   ├── favorites/     favoritos
│   │   ├── kyc/           verificación de identidad
│   │   ├── notifications/ Firebase Push (FCM)
│   │   ├── quotes/        cotizaciones de profesionales
│   │   └── service-requests/ solicitudes de clientes (Wizard)
│   └── common/
│       ├── guards/        RolesGuard, ApiKeyGuard, JwtAuthGuard
│       ├── decorators/    @CurrentUser, @Roles
│       └── filters/       exception filters
├── backend/prisma/
│   ├── schema.prisma
│   └── seed/              geo + roles + categorías + precios (5 países)
├── docker-database/       PostgreSQL local con Docker
└── .doc/                  documentación interna
```

---

## 🗄️ Esquema de Base de Datos (Prisma)

### Modelos principales
| Modelo | Descripción |
|---|---|
| `Country` | Países con moneda, gateway, labels de región/localidad |
| `GeoRegion` | Regiones por país |
| `GeoLocality` | Localidades por región |
| `User` | Usuarios (email/password + Google/Apple/Microsoft OAuth) |
| `Role` / `UserRole` | Roles con scope por país (ADMIN, SUPER_ADMIN, PROVIDER, USER) |
| `ServiceCategory` | Categorías con soporte i18n (name/nameEn) |
| `Service` | Publicaciones de servicios (nivel BASIC/PREMIUM) |
| `Rating` | Calificaciones (estado PENDING/ACTIVE/DELETED, respuesta del dueño) |
| `Subscription` | Suscripciones premium con gateway |
| `PremiumPrice` | Precios por país y duración |
| `Sponsor` | Anunciantes (STANDARD/PREMIUM/SENIOR) |
| `Interaction` | Eventos: VIEW_PHONE, VIEW_EMAIL, CALL, WHATSAPP |
| `SocialMedia` | Redes sociales del servicio |
| `Favorite` | Favoritos usuario ↔ servicio |
| `Conversation` / `Message` | Chat in-app cliente ↔ proveedor |
| `ServiceRequest` | Solicitudes del cliente (wizard) — PENDING/QUOTED/ACCEPTED/COMPLETED/CANCELLED |
| `Quote` | Cotizaciones del profesional en respuesta a un ServiceRequest |

---

## 🔐 Variables de Entorno

### Frontend (`.env.local`)
```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_API_KEY=""

# Auth (NextAuth.js v4) — generar con: openssl rand -base64 32
AUTH_SECRET=""
AUTH_URL="http://localhost:3333"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Apple Sign In
APPLE_ID=""
APPLE_SECRET=""

# Microsoft / Azure AD
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID="common"

# MercadoPago
NEXT_PUBLIC_MP_PUBLIC_KEY="APP_USR-..."
MP_ACCESS_TOKEN="APP_USR-..."

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (Brevo)
BREVO_API_KEY="xkeysib-..."
BREVO_SENDER_EMAIL=""
BREVO_SENDER_NAME=""
CONTACT_EMAIL=""

# Google Gemini AI
GEMINI_API_KEY=""

# SEO / Sitemap
NEXT_PUBLIC_APP_URL="http://localhost:3333"
```

### Backend (`.env`)
```env
NODE_ENV=development
PORT=4000

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
DIRECT_DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# JWT — generar con: openssl rand -base64 64
JWT_SECRET=""
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET=""
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
FRONTEND_URL="http://localhost:3333"

# API Key global — generar con: openssl rand -hex 32
API_KEY=""

# OAuth (validación de tokens en el backend)
APPLE_CLIENT_ID=""
```

---

## 🛠️ Comandos Frecuentes

### Desde la raíz del monorepo
```bash
pnpm dev                    # Frontend + Backend en paralelo
pnpm dev:frontend           # Solo Next.js (puerto 3333)
pnpm dev:backend            # Solo NestJS (puerto 4000)
pnpm db:seed                # Poblar DB (geo + roles + categorías + precios)
```

### Frontend (`cd frontend`)
```bash
pnpm dev                    # Desarrollo
pnpm build                  # Build producción (incluye clean .next)
pnpm lint                   # Biome check
pnpm format                 # Prettier write
pnpm test:e2e               # Playwright (todos los tests)
pnpm test:e2e:ui            # Playwright con UI
pnpm test:security          # Test de seguridad
pnpm test:admin             # Test del panel admin
```

### Backend (`cd backend`)
```bash
pnpm dev                    # NestJS con watch
pnpm build                  # Compilar
pnpm start                  # Producción (node dist/main)
pnpm lint                   # Biome check src/
pnpm db:generate            # Regenera cliente Prisma
pnpm db:migrate             # Crea y ejecuta migración (desarrollo)
pnpm db:migrate:deploy      # Ejecuta migraciones en producción
pnpm db:studio              # GUI de Prisma
pnpm db:seed                # Seed completo (geo + roles + categorías)
```

### Docker (base de datos local)
```bash
# Desde docker-database/
docker-compose up -d        # Levantar PostgreSQL
docker-compose down         # Bajar (preserva volumen)
docker-compose down -v      # Bajar + eliminar volumen
docker-compose logs -f db   # Ver logs de la DB
```

---

## 🔑 Autenticación y Roles

### Proveedores OAuth
- Google (frontend + backend)
- Apple (frontend + backend)
- Microsoft / Azure AD (frontend)
- Email + Password (bcrypt)

### Roles del sistema
| Rol | Descripción |
|---|---|
| `SUPER_ADMIN` | Acceso total sin restricción de país |
| `COUNTRY_ADMIN` | Admin scoped a uno o varios países |
| `PROVIDER` | Profesional que publica servicios |
| `USER` | Cliente que busca servicios |

### Flujo JWT
- Access token: `15m` (enviado como Bearer)
- Refresh token: `30d`
- Guard global `ApiKeyGuard` — todas las rutas del backend requieren header `x-api-key`. El `apiClient` del frontend lo inyecta automáticamente.

---

## 💳 Pasarelas de Pago

| Pasarela | Países | Tipo de integración |
|---|---|---|
| MercadoPago | cl, ar, uy | SDK React + REST API (webhooks con HMAC `x-signature`) |
| Stripe | es, us | SDK Node + Stripe Elements (webhooks con `constructEvent`) |

**Modelo de monetización actual:** Suscripción plana BASIC/PREMIUM.  
**Modelo objetivo (Fase 4):** Listar gratis + comisión 15% al ganar un trabajo (Split Payments / Escrow).

---

## 🔗 API Backend — Endpoints por módulo

Base URL: `http://localhost:4000/api/v1`

| Módulo | Prefijo | Descripción |
|---|---|---|
| Auth | `/auth` | Login, register, refresh, OAuth |
| Users | `/users` | CRUD usuarios, perfil, KYC |
| Services | `/services` | Publicaciones, search, CRUD |
| Categories | `/categories` | Por país, admin CRUD |
| Geo | `/geo` | Países, regiones, localidades |
| Ratings | `/ratings` | Calificaciones + respuesta del dueño |
| Subscriptions | `/subscriptions` | Alta, renovación, estado |
| Payments | `/payments` | Checkout, webhooks Stripe/MP |
| Prices | `/prices` | Precios premium por país |
| Sponsors | `/sponsors` | Anunciantes por país |
| Interactions | `/interactions` | Registro de eventos de contacto |
| Service Requests | `/service-requests` | Solicitudes del wizard del cliente |
| Quotes | `/quotes` | Cotizaciones de profesionales |
| Chat | WebSocket | Conversaciones realtime |
| CRM | `/crm` | Dashboard de leads para proveedores |
| Favorites | `/favorites` | Servicios guardados |
| Notifications | `/notifications` | Firebase Push (FCM) |

---

## 🚨 Gotchas y Reglas Críticas

1. **ApiKeyGuard global**: El backend rechaza con 401 cualquier request sin `x-api-key`. Usar siempre `apiClient.get/post()` del frontend — nunca `fetch` directo.
2. **Prisma: nunca `db push`**: Siempre `prisma migrate dev` para migraciones versionadas. `db push` está prohibido.
3. **Seed obligatorio**: Sin `pnpm db:seed`, las tablas `GeoRegion` y `GeoLocality` quedan vacías y los filtros de búsqueda no funcionan.
4. **Complejidad cognitiva ≤ 15**: Biome rechaza funciones que superen este límite. Extraer funciones puras o subcomponentes.
5. **Iconos — solo icons0 MCP**: Está prohibido usar Lucide React, Heroicons o FontAwesome. Consultar el MCP `icons0` antes de usar cualquier ícono.
6. **DTOs estrictos**: `forbidNonWhitelisted: true` en el backend — campos extra en el body son rechazados. El frontend debe enviar exactamente los campos del DTO.
7. **`pnpm lint` del backend roto**: El script `biome check src/` del backend no funciona correctamente al momento de esta documentación.
8. **Componentes en su propia carpeta**: `AdminSidebar` → `features/admin/components/AdminSidebar/index.tsx`. Nunca `AdminSidebar.tsx` suelto.
9. **proxy.ts (no middleware)**: La detección de país usa `proxy.ts`, NO el middleware de Next.js.
10. **Categorías en inglés para `us`**: El country `us` usa `nameEn` en lugar de `name` para las categorías.

---

## 🗺️ Roadmap (Junio 2026 — `analisis-junio.md`)

| Fase | Estado | Descripción |
|---|---|---|
| Fase 1 — Control de daños | ✅ Completa | Hotfix webhooks Stripe/MP, eliminación de UI engañosa, ServiceRequest+Quote en schema |
| Fase 2 — Marketplace | ✅ Completa | Project Wizard (3 pasos), paneles de cotización, endpoints `/service-requests` y `/quotes` |
| Fase 3 — Confianza | ✅ Completa | Mini-CRM (vista de leads), flujo KYC, badges dinámicos, Firebase Push |
| Fase 4 — Escrow | 🔴 Pendiente | Split Payments, Escrow, comisión 15%, retargeting email (Brevo CronJobs) |

**Arquitectura de trabajo AI paralela:**
- **Gemini 3.1** → dueño de `/backend`, Prisma, NestJS, pasarelas, APIs de terceros
- **Claude Code** → dueño de `/frontend`, Next.js, React, UI/UX

---

## 📝 DevLog

- **2026-05-15:** Migración multi-país — monolito Chiloé → Atlas. País de origen (`cl`) mapeado automáticamente.
- **2026-06-05:** Agregado `.nvmrc` (node 22), `packageManager pnpm`, migración `payments_enabled`, documentación Vercel multi-cuenta.
- **2026-06-09:** Reestructura de módulos backend, limpieza de seed, refactor de guards (eliminado `country-admin.guard.ts`), refactor de auth, geo, ratings, sponsors, subscriptions y payments. Actualización de contratos DTO en frontend.
- **2026-06-12:** Documento de proyecto generado.
