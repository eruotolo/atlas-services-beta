# Atlas Services — Plataforma Chiloé Servicios

Plataforma hiperlocal para la Isla de Chiloé que conecta usuarios con proveedores de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas) en una comunidad de ~35,000 habitantes.

---

## Relación con el proyecto original

Este proyecto es una refactorización de [`next-chiloeservicios`](../next-chiloeservicios), el MVP original. La funcionalidad es equivalente — mismas páginas, mismos flujos, misma UX — con una diferencia arquitectónica central: **el backend fue desacoplado en un servicio NestJS independiente**.

### Diferencia central

```
next-chiloeservicios (original):
Server Action → Prisma → PostgreSQL

next-atlas-services (este proyecto):
Server Action → apiClient (HTTP) → NestJS → Prisma → PostgreSQL
```

---

## Comparativa de arquitecturas

| Aspecto | `next-chiloeservicios` | `next-atlas-services` |
|---------|------------------------|----------------------|
| **Arquitectura** | Monolito Next.js | Next.js + NestJS separado |
| **Base de datos** | Prisma directo desde Server Actions | Prisma vía API REST (NestJS) |
| **Auth** | Auth.js (NextAuth) | Auth.js (NextAuth) |
| **Pagos** | MercadoPago SDK | MercadoPago SDK |
| **Rutas** | Idénticas | Idénticas |
| **Features** | services, users, reviews, payments, sponsors... | Mismas features |
| **Tests E2E** | Playwright | Playwright (135/135 ✅) |
| **Latencia** | Cero (query directa a DB) | HTTP entre frontend → NestJS |
| **Dev server** | `pnpm dev` (1 proceso) | `pnpm dev` (2 procesos en paralelo) |
| **Escalabilidad** | Media (monolítico) | Alta (API-first) |

### ¿Por qué el desacople?

El desacople permite:
- Exponer la API a terceros (apps móviles, integraciones externas)
- Escalar frontend y backend de forma independiente
- Reutilizar el backend desde múltiples clientes

A costa de mayor complejidad operacional (2 servidores, HTTP entre capas).

---

## Stack tecnológico

### Frontend (`/frontend`)

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **Next.js** | 16.1.1 | App Router, React Server Components |
| **React** | 19.2.3 | React Compiler habilitado |
| **TypeScript** | ^5 | Strict mode |
| **Tailwind CSS** | v4 | Estilos (PostCSS integration) |
| **Auth.js (NextAuth)** | ^4.24 | Autenticación con JWT + sesiones |
| **Zod** | ^4 | Validación de schemas |
| **MercadoPago** | ^2.12 | Pagos y suscripciones |
| **Brevo** | ^3 | Email transaccional |
| **Vercel Blob** | ^2 | Almacenamiento de imágenes |
| **Google GenAI** | ^1.35 | Funcionalidades de IA |
| **Biome** | 2.2.0 | Linting |
| **Playwright** | ^1.57 | Tests E2E |

### Backend (`/backend`)

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **NestJS** | ^10.4 | Framework backend |
| **Prisma ORM** | ^7.5 | Acceso a base de datos |
| **PostgreSQL** | — | Base de datos |
| **JWT (Passport)** | ^10.2 | Autenticación de API |
| **Swagger** | ^7.4 | Documentación en `/api/docs` |
| **Helmet** | ^8 | Seguridad HTTP headers |
| **Throttler** | ^6.3 | Rate limiting |
| **bcrypt** | ^5.1 | Hash de contraseñas |
| **class-validator** | ^0.14 | Validación de DTOs |
| **Biome** | — | Linting |

---

## Estructura del monorepo

```
next-atlas-services/
├── frontend/           # Aplicación Next.js
├── backend/            # API NestJS
├── docker-database/    # Configuración PostgreSQL
├── .doc/               # Documentación y planes
├── package.json        # Scripts raíz (workspace pnpm)
└── pnpm-workspace.yaml
```

---

## Arquitectura Frontend — DDD

El frontend usa **Domain-Driven Design** para organizar el código por dominios de negocio.

```
frontend/src/
├── app/                    # Next.js App Router (Presentation Layer)
│   ├── (admin)/           # Rutas administrativas
│   ├── (public)/          # Rutas públicas
│   └── (auth)/            # Rutas de autenticación
│
├── features/               # DOMINIOS DEL NEGOCIO
│   ├── services/          # Servicios ofertados
│   │   ├── actions/       # Server Actions (queries + mutations)
│   │   ├── components/    # UI del dominio (cards, forms, admin)
│   │   ├── hooks/         # Custom hooks
│   │   ├── schemas/       # Validación Zod
│   │   └── types/         # Tipos TypeScript
│   ├── users/             # Gestión de usuarios y proveedores
│   ├── categories/        # Categorías de servicios
│   ├── reviews/           # Calificaciones y reseñas
│   └── payments/          # Pagos y suscripciones
│
└── shared/                 # Shared Kernel (código entre dominios)
    ├── components/        # Navbar, Footer, Modal
    ├── lib/               # Utilidades globales
    └── types/             # Tipos compartidos
```

> Ver `frontend/README.md` para documentación completa de la arquitectura DDD, patrones aplicados y procedimiento de migraciones de base de datos.

---

## Arquitectura Backend — Módulos NestJS

```
backend/src/
├── modules/
│   ├── auth/              # Autenticación (login, registro, JWT, refresh)
│   ├── users/             # CRUD de usuarios
│   ├── services/          # CRUD de servicios (con filtros y paginación)
│   ├── categories/        # Categorías de servicios
│   ├── ratings/           # Calificaciones y reseñas
│   ├── subscriptions/     # Suscripciones premium
│   ├── sponsors/          # Espacios publicitarios
│   ├── prices/            # Gestión de precios
│   └── interactions/      # Registro de interacciones (clicks, contactos)
│
├── common/
│   ├── guards/            # JwtAuthGuard, RolesGuard, ApiKeyGuard, WebhookGuard
│   ├── decorators/        # @CurrentUser(), @Roles()
│   ├── filters/           # PrismaExceptionFilter
│   └── interceptors/      # SerializeInterceptor (elimina campos sensibles)
│
└── prisma/                # PrismaModule + PrismaService (singleton)
```

### Seguridad del backend

- **Helmet**: Headers HTTP seguros en todas las respuestas
- **CORS**: Solo acepta origen del frontend (`FRONTEND_URL`)
- **Rate limiting**: Throttler global para prevenir abuso
- **API Key**: Guard para rutas internas (Server Actions del frontend)
- **JWT**: Autenticación stateless para usuarios
- **Roles**: Guard RBAC para rutas administrativas
- **Swagger**: Solo disponible en entorno `development`

---

## Comandos de desarrollo

```bash
# Levantar todo (frontend + backend en paralelo)
pnpm dev

# Solo frontend
pnpm dev:frontend

# Solo backend
pnpm dev:backend
```

### URLs en desarrollo

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api/v1 |
| Swagger docs | http://localhost:4000/api/docs |

---

## Tests E2E

```bash
# Ejecutar suite completa (135 tests)
pnpm test:e2e

# Por categoría
pnpm test:security   # Seguridad de rutas y roles
pnpm test:admin      # CRUD administrador
pnpm test:user       # CRUD usuario autenticado
pnpm test:guest      # Funcionalidad pública
```

**Cobertura:** formularios públicos y privados, CRUD admin, pagos, login/logout/registro y permisos por roles.

---

## Base de datos

### Comandos (desde `/backend` o `/frontend`)

| Comando | Cuándo usarlo | Dónde |
|---------|---------------|-------|
| `pnpm db:migrate` | Crear nueva migración | **Local** |
| `pnpm db:migrate:deploy` | Aplicar migraciones existentes | **Producción** |
| `pnpm db:generate` | Regenerar cliente Prisma | Local y Prod |
| `pnpm db:studio` | Explorar datos con GUI | **Local** |
| `pnpm db:seed` | Poblar datos iniciales | **Local** |

> **Regla de oro:** Nunca usar `db:push` en producción con datos reales.

---

## Variables de entorno

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_API_KEY="..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_MP_PUBLIC_KEY="..."
MP_ACCESS_TOKEN="..."
BREVO_API_KEY="..."
```

### Backend (`.env.local`)

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
API_KEY="..."
FRONTEND_URL="http://localhost:3000"
```

---

## Gestión de paquetes

Siempre usar `pnpm`. Nunca `npm` ni `yarn`.

```bash
# Instalar dependencia en frontend
pnpm --filter frontend add <paquete>

# Instalar dependencia en backend
pnpm --filter backend add <paquete>
```
