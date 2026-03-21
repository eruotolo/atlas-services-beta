# Atlas Services — Plataforma Multi-País de Servicios (Beta)

Plataforma que conecta usuarios con proveedores de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas). Soporta múltiples países con routing, moneda y pasarela de pago por país.

**Países activos:** Chile (`cl`), Argentina (`ar`), Uruguay (`uy`), España (`es`), Estados Unidos (`us`)

---

## Arquitectura general

```
next-atlas-services/
├── frontend/           # Next.js 16.1 + React 19
├── backend/            # NestJS 10.4 + Prisma v7
├── docker-database/    # PostgreSQL (desarrollo local)
├── .doc/               # Documentación y planes de implementación
├── package.json        # Scripts raíz (workspace pnpm)
└── pnpm-workspace.yaml
```

### Flujo de capas

```
Browser → proxy.ts → Next.js (RSC + Server Actions) → apiClient (HTTP + x-api-key) → NestJS → Prisma → PostgreSQL
```

---

## Sistema Multi-País

### Routing por país

Toda la aplicación vive bajo el prefijo `/{country}/`. Ejemplos:

| URL | Descripción |
|-----|-------------|
| `/cl` | Home de Chile |
| `/cl/buscar?region=LL&locality=castro` | Búsqueda en Los Lagos, Castro |
| `/cl/admin` | Panel admin de Chile |
| `/ar/buscar` | Búsqueda en Argentina |
| `/es/suscripcion-pro` | Planes premium en España (EUR) |

### Detección automática de país (`proxy.ts`)

En cada visita, `proxy.ts` ejecuta esta cascada de prioridad:

```
1. Cookie `atlas_country` (preferencia guardada del usuario)
2. Header `CF-IPCountry` (Cloudflare)
3. Header `x-vercel-ip-country` (Vercel)
4. Header `Accept-Language` (navegador)
5. Default: `cl`
```

El redirect ocurre **una sola vez** (primera visita). Luego la cookie persiste la preferencia.

### Estructura de rutas App Router

```
app/
├── (country)/[country]/
│   ├── (public)/          # Rutas públicas con contexto de país
│   │   ├── page.tsx       # Home: /cl, /ar, /es, ...
│   │   ├── buscar/        # Búsqueda con filtros geo dinámicos
│   │   ├── servicio/[slug]/
│   │   ├── perfil/
│   │   ├── publicar/
│   │   ├── registro/
│   │   ├── login/
│   │   └── suscripcion-pro/
│   └── (admin)/           # Panel admin con scope de país
│       └── admin/
│           ├── page.tsx   # Dashboard
│           ├── servicios/
│           ├── usuarios/
│           ├── categorias/
│           ├── precios-premium/
│           ├── sponsors/
│           ├── calificaciones/
│           ├── pagos/
│           └── interacciones/
│
├── (public)/              # LEGACY — solo redirects a /cl/...
├── (admin)/               # LEGACY — re-exporters para admin
└── api/                   # Route Handlers (auth, webhooks, upload)
```

> **Regla:** Las páginas activas son las de `(country)/[country]/`. Las de `(public)/` sin prefijo de país son redirects de fallback a `/cl/`.

### Geo: países, regiones y localidades

Los datos geográficos viven en la base de datos (no hardcodeados):

```
Country → GeoRegion[] → GeoLocality[]
   cl   →   LL (Los Lagos)  →  castro, ancud, quellon, ...
   ar   →   BA (Buenos Aires) →  mar-del-plata, la-plata, ...
```

**Frontend:** `features/geo/actions/queries.ts` — `getRegionsByCountry(code)`, `getLocalitiesByRegion(regionId)`

**Backend:** `GeoModule` expone `/geo/countries/:code/regions` y `/geo/regions/:regionId/localities`

> ⚠️ Las actions de geo deben usar `apiClient` (incluye `x-api-key`), no `fetch` directo.

### Moneda y pasarela por país

| País | Moneda | Pasarela |
|------|--------|----------|
| Chile (`cl`) | CLP | MercadoPago |
| Argentina (`ar`) | ARS | MercadoPago |
| Uruguay (`uy`) | UYU | MercadoPago |
| España (`es`) | EUR | Stripe |
| Estados Unidos (`us`) | USD | Stripe |

Los precios premium se almacenan en moneda local por país en la tabla `PremiumPrice`.

---

## Stack tecnológico

### Frontend (`/frontend`)

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **Next.js** | 16.1.1 | App Router, React Server Components |
| **React** | 19.2.3 | React Compiler habilitado |
| **TypeScript** | ^5 | Strict mode |
| **Tailwind CSS** | v4 | Estilos (PostCSS) |
| **Auth.js (NextAuth)** | ^4.24 | JWT + sesiones |
| **Zod** | ^4 | Validación |
| **MercadoPago SDK** | ^2.12 | Pagos CL/AR/UY |
| **Stripe SDK** | — | Pagos ES/US |
| **Brevo** | ^3 | Email transaccional |
| **Vercel Blob** | ^2 | Almacenamiento de imágenes |
| **Biome** | 2.2.0 | Linting |
| **Playwright** | ^1.57 | Tests E2E |

### Backend (`/backend`)

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **NestJS** | ^10.4 | Framework |
| **Prisma ORM** | ^7.5 | Acceso a base de datos |
| **PostgreSQL** | — | Base de datos |
| **JWT (Passport)** | ^10.2 | Auth de API |
| **Swagger** | ^7.4 | Docs en `/api/docs` |
| **Helmet** | ^8 | Headers HTTP seguros |
| **Throttler** | ^6.3 | Rate limiting |

---

## Arquitectura Frontend — DDD

```
frontend/src/
├── app/                         # Next.js App Router (Presentation)
│   ├── (country)/[country]/    # Rutas activas multi-país
│   ├── (public)/               # Legacy redirects
│   └── api/                    # Route Handlers
│
├── features/                   # DOMINIOS DE NEGOCIO
│   ├── geo/                   # Países, regiones, localidades
│   │   ├── actions/           # getRegionsByCountry, getLocalitiesByRegion
│   │   ├── components/        # LocalitySelect (cascading region→locality)
│   │   ├── hooks/             # useCountryLink()
│   │   ├── lib/               # countryUtils, countryLink()
│   │   └── types/             # GeoRegion, GeoLocality, Country
│   ├── services/              # Servicios ofertados
│   ├── categories/            # Categorías
│   ├── payments/              # Pagos y suscripciones
│   ├── sponsors/              # Espacios publicitarios
│   ├── users/                 # Perfil y gestión de usuarios
│   └── reviews/               # Calificaciones
│
├── lib/
│   ├── api/apiClient.ts       # HTTP client (agrega x-api-key automáticamente)
│   └── providers/
│       └── CountryProvider.tsx  # Context: country, currency, gateway, labels
│
└── shared/
    ├── components/layout/     # Navbar, Footer, HomeHeroSection
    └── types/common.ts        # Service, User, CategoriaServicio, etc.
```

### Hooks y helpers de navegación

```typescript
// Client Components — lee country de useParams()
const link = useCountryLink();
link('/buscar') // → '/cl/buscar'

// Server Components — función pura
countryLink('cl', '/buscar') // → '/cl/buscar'

// Datos del país actual (client)
const { country, currency, gateway, regionLabel } = useCountry();
```

---

## Arquitectura Backend — Módulos NestJS

```
backend/src/modules/
├── geo/           # Países, regiones, localidades (GET público)
├── auth/          # Login, registro, JWT, refresh token
├── users/         # CRUD usuarios (cuenta global)
├── services/      # CRUD servicios (scoped por countryCode)
├── categories/    # Categorías (globales o por país)
├── prices/        # Precios premium por país y duración
├── subscriptions/ # Suscripciones (usa precio del país del usuario)
├── sponsors/      # Sponsors (globales o por país)
├── ratings/       # Calificaciones y reseñas
├── payments/      # Gateway pattern: MercadoPago | Stripe
└── interactions/  # Clicks y contactos (analítica)
```

### Seguridad

- `ApiKeyGuard` — guard global: **todas** las rutas requieren `x-api-key` en el header
- `JwtAuthGuard` — rutas autenticadas
- `RolesGuard` — RBAC: `Usuario`, `Proveedor`, `Administrador`, `SuperAdministrador`
- `CountryAdminGuard` — los admin solo acceden a datos de sus países asignados (`adminCountries[]` en JWT)
- Helmet, CORS, Throttler configurados globalmente

### Scoping de datos por país

| Tabla | Scoped a país | Campo |
|-------|--------------|-------|
| `Service` | Sí | `countryId` (FK obligatorio) |
| `PremiumPrice` | Sí | `countryId` (FK obligatorio) |
| `GeoRegion` | Sí | `countryId` |
| `GeoLocality` | Sí | via `GeoRegion.countryId` |
| `Sponsor` | Opcional | `countryId` nullable (null = global) |
| `Category` | Opcional | `countryCode` nullable (null = global) |
| `User` | No | Cuenta global (sin countryId) |

---

## Base de datos — Seed inicial

El seed puebla en orden: geo → roles/usuarios → categorías → precios.

```bash
# 1. Crear/aplicar migraciones
pnpm --filter backend db:migrate

# 2. Poblar datos iniciales (geo + roles + categorías + precios para los 5 países)
pnpm --filter backend db:seed
```

| Comando | Cuándo |
|---------|--------|
| `pnpm --filter backend db:migrate` | Nueva migración en desarrollo |
| `pnpm --filter backend db:migrate:deploy` | Producción |
| `pnpm --filter backend db:generate` | Regenerar cliente Prisma |
| `pnpm --filter backend db:studio` | GUI explorar datos |
| `pnpm --filter backend db:seed` | Poblar datos iniciales |

> **Regla:** Nunca usar `prisma db push`. Siempre migraciones versionadas.

---

## Comandos de desarrollo

```bash
pnpm dev            # Frontend + Backend en paralelo
pnpm dev:frontend   # Solo Next.js (puerto 3000)
pnpm dev:backend    # Solo NestJS (puerto 4000)
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 → redirige a http://localhost:3000/cl |
| Backend API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |

---

## Tests E2E

```bash
pnpm test:e2e        # Suite completa
pnpm test:security   # Seguridad de rutas y roles
pnpm test:admin      # CRUD administrador
pnpm test:user       # CRUD usuario autenticado
pnpm test:guest      # Funcionalidad pública
```

---

## Variables de entorno

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_API_KEY="..."        # Mismo valor que API_KEY del backend
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_MP_PUBLIC_KEY="..."  # MercadoPago (CL/AR/UY)
MP_ACCESS_TOKEN="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BREVO_API_KEY="..."
```

### Backend (`.env.local`)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="..."
API_KEY="..."                    # Mismo valor que NEXT_PUBLIC_API_KEY del frontend
FRONTEND_URL="http://localhost:3000"
```

---

## Gestión de paquetes

Siempre `pnpm`. Nunca `npm` ni `yarn`.

```bash
pnpm --filter frontend add <paquete>
pnpm --filter backend add <paquete>
```
