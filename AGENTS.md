# CLAUDE.md

Este archivo proporciona instrucciones permanentes a Claude Code cuando trabaja en este repositorio.

## ⚠️ INSTRUCCIONES CRÍTICAS (NO NEGOCIABLES - Alta Prioridad)

- **SIEMPRE comunicarse en ESPAÑOL**. El código puede estar en inglés, la comunicación nunca.
- Cuando des una ORDEN clara, obedécela literalmente sin reinterpretar ni agregar cosas extras.
- **NO hacer cambios en archivos** sin autorización explícita del usuario (excepto si dice textualmente “Haz todos los cambios” o “Puedes modificar directamente”).
- Enfocarte solo en lo solicitado. No agregar mejoras, refactorizaciones ni optimizaciones no pedidas.
- No asumir contexto de chats anteriores.
- **Plan Mode primero** — Presenta un plan detallado y espera aprobación antes de implementar. Termina siempre el plan con: “¿Apruebas este plan? ¿Qué cambiarías?”
- **Verificación obligatoria** — Después de cualquier cambio en `frontend/` o `backend/`: Ejecuta `pnpm lint && pnpm build`. Nunca marques una tarea como terminada sin lint + build pasando.

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

### 🗂️ Organización de Componentes — REGLA DE ORO (NO NEGOCIABLE)

#### Componentes únicos → `features/`

Un componente único pertenece a un dominio específico y no se reutiliza en otros dominios.

```
features/
└── <dominio>/               # admin, auth, services, users, payments…
    ├── actions/             # Server Actions y llamadas a API
    ├── components/
    │   └── <NombreComponente>/   # ← carpeta obligatoria por componente
    │       └── <NombreComponente>.tsx   # archivo con el nombre del componente, NUNCA index.tsx
    ├── lib/                 # helpers y utilidades del dominio
    ├── schemas/             # schemas Zod del dominio
    └── types/               # tipos TypeScript del dominio
```

Ejemplos:
- `AdminSidebar` → `features/admin/components/AdminSidebar/AdminSidebar.tsx`
- `ConfigPageHeader` → `features/admin/components/ConfigPageHeader/ConfigPageHeader.tsx`
- `ServiceCard` → `features/services/components/ServiceCard/ServiceCard.tsx`

#### Componentes reutilizables → `shared/`

Un componente shared no tiene lógica de dominio y puede usarse en cualquier feature sin modificación.

```
shared/
├── components/
│   └── <NombreComponente>/   # ← carpeta obligatoria por componente
│       └── <NombreComponente>.tsx   # archivo con el nombre del componente, NUNCA index.tsx
├── lib/                     # utils globales (formatCurrency, cn, etc.)
├── types/                   # tipos globales del proyecto
└── schemas/                 # schemas Zod reutilizables
```

Ejemplos:
- `PageHeader` → `shared/components/PageHeader/PageHeader.tsx`
- `Avatar` → `shared/components/Avatar/Avatar.tsx`
- `Icon`, `Mono` → `shared/components/Icon/Icon.tsx`, etc.

#### Reglas de aplicación

- **NUNCA** usar `index.tsx` como nombre de archivo del componente — el archivo debe llamarse igual que el componente (`Footer/Footer.tsx`, no `Footer/index.tsx`).
- **EXCEPCIÓN**: los `index.ts`/`index.tsx` que actúan como *barrel* de una carpeta agrupadora (ej. `features/home/components/index.ts`, `shared/components/hireeo/index.ts`, `shared/components/icons/index.tsx`) no son un componente único y sí pueden llamarse `index`.
- **NUNCA** crear un archivo de componente plano (`ComponenteName.tsx`) fuera de su carpeta propia.
- **NUNCA** mover un componente de `features/` a `shared/` por conveniencia. Si dos features necesitan algo en común, crear un componente shared *nuevo* sin lógica de dominio.
- **NUNCA** poner componentes que pertenezcan a un dominio (ej. `Home`, `Legal`, `Admin`) dentro de `shared/components/`. Deben ir a su respectiva carpeta en `features/` (ej. `features/home/components/HeroSection`).
- La misma regla de carpetas aplica a `lib/`, `types/` y `schemas/` dentro de `shared/` si crecen en complejidad.

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
├── appmobile/               # Expo SDK 54, React Native 0.81.5, expo-router 6
└── .doc/
```

## 3b. Configuración Técnica (appmobile)

- **CSS / estilos**: **NativeWind v4** (`nativewind@4.2.5`) — usa `className` en lugar de `StyleSheet.create`. **NUNCA** agregar `StyleSheet` a archivos de `appmobile/src/`.
- NativeWind v4 usa **Tailwind CSS v3** internamente (≠ Tailwind v4). El config es `appmobile/tailwind.config.js`.
- Tokens de color: `src/shared/constants/colors.ts` es la única fuente de verdad; `tailwind.config.js` los replica (mantener sincronizados manualmente si se agregan tokens).
- Excepciones donde se mantiene `style={{...}}` inline: sombras/elevation, valores calculados en runtime, animaciones de Animated/Reanimated, callbacks de `Pressable` `({ pressed }) =>`.
- `contentContainerClassName` en `ScrollView` en lugar de `contentContainerStyle` para estilos estáticos.

## 4. Gestión de Paquetes
**SIEMPRE usar `pnpm`**. Nunca npm ni yarn.
```bash
pnpm dev              # Frontend + Backend en paralelo
pnpm dev:backend      # Solo NestJS (puerto 4000)
pnpm dev:frontend     # Solo Next.js (puerto 3333)
pnpm --filter frontend add <paquete>
pnpm --filter backend add <paquete>
pnpm --filter backend db:seed   # Poblar DB (geo + roles + categorías + precios)
```

## 5. Información del Proyecto
> **Hireeo (Beta)** — Marketplace multi-país de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas).
> Países: Chile (`cl`), Argentina (`ar`), Uruguay (`uy`), España (`es`), Estados Unidos (`us`). **(Nota: Pendiente incorporar Paraguay (`py`) en el futuro).**
> **Dominio oficial:** `hireeo.app` (un solo dominio con subpaths por país: `/cl`, `/ar`, `/uy`, `/es`, `/us`, y futuramente `/py`). Producción aún no desplegada.

## 6. Arquitectura Multi-País

### Routing
- Todas las rutas activas tienen prefijo `/{country}/` (ej: `/cl/buscar`, `/ar/perfil`)
- `proxy.ts` detecta país: cookie `hireeo_country` > CF header > Vercel header > Accept-Language > `cl`
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
- **`index.tsx` en componentes → corregido (2026-07-22)**: 136 componentes usaban `NombreComponente/index.tsx` a pesar de que la regla ya estaba escrita. Ahora el archivo SIEMPRE se llama igual que el componente (`Footer/Footer.tsx`). Excepción: barrels de carpetas agrupadoras (`hireeo/index.ts`, `icons/index.tsx`, `home/components/index.ts`, etc.) sí pueden llamarse `index`.


---

## Documentación en Obsidian

La documentación de este proyecto vive en el vault **SitesDoc**. Al iniciar cualquier sesión de trabajo, leer la nota:

```bash
cat "/Users/edgardoruotolo/SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md"
```

Al finalizar cambios relevantes (nueva feature, bug crítico, decisión de arquitectura), actualizar la nota **automáticamente** con:

```bash
cat >> "/Users/edgardoruotolo/SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md" << 'EOF'

### $(date +%Y-%m-%d) — TÍTULO DEL CAMBIO
- Descripción del cambio realizado
EOF
```

**Importante:** Ejecutar este append siempre al terminar una tarea, sin esperar que el usuario lo pida.