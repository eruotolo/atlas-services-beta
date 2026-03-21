# CLAUDE.md ─ Reglas vivas del proyecto (actualizado por el equipo + Claude)

Última actualización: 2026-03-20
Tokens aproximados: ~2200–2600 (mantener < 3000 siempre)

## 0. Principios generales (siempre respetar)

- **Idioma**: SIEMPRE comunicarse en **español**. El código puede estar en inglés, la comunicación nunca.

- **Plan Mode primero** — Presenta un plan detallado y espera aprobación antes de implementar en estos casos:
  - Nuevo módulo o feature completo
  - Cambio de schema de Prisma
  - Nueva ruta o layout en el App Router
  - Cambio que afecte > 2 archivos no relacionados
  Termina siempre el plan con: "¿Apruebas este plan? ¿Qué cambiarías?"
  **Escape hatch**: Si el usuario incluye `"sin plan"` en su mensaje, implementa directamente.

- **Verificación obligatoria** — Después de cualquier cambio en `frontend/` o `backend/`:
  - Ejecuta `pnpm lint && pnpm build` en el área modificada
  - Nunca marques una tarea como terminada sin lint + build pasando
  - **Tests E2E (Playwright)**: Ejecutar con `pnpm test:e2e` si los cambios afectan flujos cubiertos.

- **Eficiencia** — Haz ÚNICAMENTE lo que se solicita. Sin extras, sin refactors no pedidos.

- **Subagentes cuando sea útil** — Usa subagentes para tareas paralelas.

- **Actualízame** — Si el usuario corrige un comportamiento repetido, proponer ajuste al CLAUDE.md solo cuando la regla sea reutilizable.

## 1. Uso obligatorio de Agentes por área

- `frontend/` → Skill `nextjs-ddd-expert`
- `backend/` → Skill `nestjs-architect`
- Exploración amplia → `Agent` con `subagent_type=Explore`
- Búsquedas dirigidas → `Glob` o `Grep`

## 2. Protocolo de Control y Seguridad del Agente

- **Restricción de scope**: Frontend prohibido generar lógica de DB, controladores NestJS o esquemas Prisma. Backend prohibido generar JSX/TSX o estilos Tailwind.
- **Sin código aleatorio**: Cada línea debe tener un lugar en la arquitectura DDD.
- **Scope quirúrgico**: Prohibido modificar archivos de configuración (`package.json`, `tsconfig.json`, `biome.json`, etc.) salvo solicitud explícita.
- **No reescribas archivos completos**: Si el archivo tiene > 50 líneas, entrega solo el bloque modificado.
- **DRY Enforcement**: Verificar si la lógica ya existe antes de escribir.
- **Contract-First**: Si Frontend necesita un dato del Backend inexistente, generar primero la Interface TypeScript.

## 3. Estructura del Monorepo

```
next-atlas-services/
├── frontend/src/
│   ├── app/
│   │   ├── (country)/[country]/   # RUTAS ACTIVAS (con país en URL)
│   │   │   ├── (public)/          # Home, buscar, perfil, publicar, etc.
│   │   │   └── (admin)/admin/     # Panel admin scoped al país
│   │   ├── (public)/              # LEGACY — redirects a /cl/...
│   │   ├── (admin)/               # LEGACY — re-exporters del admin
│   │   └── api/                   # Route Handlers (auth, webhooks, upload)
│   ├── features/
│   │   ├── geo/                   # Países, regiones, localidades
│   │   ├── services/              # Servicios
│   │   ├── categories/            # Categorías
│   │   ├── payments/              # Pagos y suscripciones
│   │   ├── sponsors/              # Publicidad
│   │   ├── users/                 # Usuarios y perfil
│   │   └── reviews/               # Calificaciones
│   ├── lib/
│   │   ├── api/apiClient.ts       # HTTP client con x-api-key automático
│   │   └── providers/CountryProvider.tsx
│   └── shared/
├── backend/src/
│   ├── modules/ (geo, auth, users, services, categories, prices, subscriptions, sponsors, ratings, payments, interactions)
│   └── common/ (guards, decorators, filters)
├── docker-database/
└── .doc/
```

## 4. Gestión de Paquetes

**SIEMPRE usar `pnpm`**. Nunca npm ni yarn.

```bash
pnpm dev              # Frontend + Backend en paralelo
pnpm dev:backend      # Solo NestJS (puerto 4000)
pnpm dev:frontend     # Solo Next.js (puerto 3000)
pnpm --filter frontend add <paquete>
pnpm --filter backend add <paquete>
pnpm --filter backend db:seed   # Poblar DB (geo + roles + categorías + precios)
```

## 5. Información del Proyecto

> **Atlas Services (Beta)** — Marketplace multi-país de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas).
> Países: Chile (`cl`), Argentina (`ar`), Uruguay (`uy`), España (`es`), Estados Unidos (`us`).
> **URL de producción:** No definida. El proyecto NO está desplegado.

## 6. Arquitectura Multi-País

### Routing
- Todas las rutas activas tienen prefijo `/{country}/` (ej: `/cl/buscar`, `/ar/perfil`)
- `proxy.ts` detecta país: cookie `atlas_country` > CF header > Vercel header > Accept-Language > `cl`
- Las páginas en `(public)/` sin prefijo son **redirects de fallback** a `/cl/...`

### Navegación con país
```typescript
// Client Components
const link = useCountryLink();   // hook de features/geo/hooks/useCountryLink.ts
link('/buscar')                  // → '/cl/buscar'

// Server Components
countryLink('cl', '/buscar')     // → '/cl/buscar'
```

### Geo (regiones y localidades)
- Datos en la DB, NO hardcodeados
- `getRegionsByCountry(code)` → regiones del país
- `getLocalitiesByRegion(regionId)` → localidades de una región
- En `SearchPageClient`: al seleccionar región, se cargan localidades dinámicamente

### Moneda y pasarela
| País | Moneda | Pasarela |
|------|--------|----------|
| cl, ar, uy | CLP / ARS / UYU | MercadoPago |
| es, us | EUR / USD | Stripe |

### CountryProvider
`lib/providers/CountryProvider.tsx` provee via context: `country`, `currency`, `gateway`, `regionLabel`, `localityLabel`. Acceder con `useCountry()` en Client Components.

## 7. Configuración Técnica (Frontend)

- **Next.js 16.1**, React 19, React Compiler habilitado
- **TypeScript** strict mode, ES2017, JSX: `react-jsx`
- **Tailwind CSS v4** con PostCSS
- **Biome** para linting, **Prettier** para formateo
- Path alias: `@/*` → `./src/*`
- Complejidad cognitiva máxima: **15**
- Prettier: print width 100, tab 4 espacios, single quotes, trailing commas

### Comandos de base de datos (desde `/backend`)

```bash
pnpm db:generate      # Regenera cliente Prisma
pnpm db:migrate       # Crea y ejecuta migración (desarrollo)
pnpm db:studio        # GUI de Prisma
pnpm db:seed          # Pobla geo + roles + categorías + precios (5 países)
```

**Regla Prisma**: Nunca `prisma db push`. Siempre migraciones versionadas.

## 8. Guías de Desarrollo

- **Server Components por defecto**; `'use client'` solo con interactividad real
- **Server Actions** para mutaciones; no crear API routes separadas
- **Imágenes**: siempre `next/image`
- **Validación**: Zod en Server Actions
- **Auth.js**: Email/Password + Google OAuth

### Diseño y UX
- Mobile-first
- Paleta: fondo `bg-white`, cards `bg-gray-50`, accent `bg-blue-600`, éxito `bg-green-500`
- Textos: genéricos (no hardcodeados a Chiloé ni a ningún país específico)
- Los filtros de ubicación se cargan dinámicamente desde la API geo (no hardcodeados)

## 9. Errores ya corregidos (no repetir)

- **Geo actions deben usar `apiClient`**: Las funciones en `features/geo/actions/queries.ts` deben usar `apiClient.get()` (no `fetch` directo). El backend tiene `ApiKeyGuard` global — `fetch` sin el header `x-api-key` recibe 401 silencioso y retorna `[]`.
- **Cognitive complexity > 15**: Si Biome rechaza por complejidad, extraer funciones puras o subcomponentes fuera del componente principal. Usar `biome-ignore` solo como último recurso con justificación.
- **Seed obligatorio para geo**: Sin ejecutar `pnpm --filter backend db:seed`, los filtros de región y ciudad no aparecen (la tabla `GeoRegion` está vacía).
