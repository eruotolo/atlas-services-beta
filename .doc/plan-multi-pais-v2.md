# Plan Multi-Pais v2 — Atlas Services

**Fecha:** 2026-03-19
**Version:** 2.0
**Estado:** Pendiente de aprobacion
**Basado en:** Investigacion exhaustiva del codigo + research de apps reales multi-pais
**Continuable por cualquier IA:** Si

---

## 1. Investigacion: Como lo hacen las apps reales

### 1.1 Patrones de URL por empresa

| App | Patron URL | Ejemplo |
|-----|-----------|---------|
| **Uber** | Path prefix `/{country}/{lang}/` | `uber.com/cl/es/ride` |
| **Airbnb** | ccTLDs (dominios por pais) | `airbnb.cl`, `airbnb.com.ar` |
| **MercadoLibre** | ccTLDs completamente separados | `mercadolibre.cl`, `mercadolibre.com.ar` |
| **Booking.com** | Dominio unico + cookies/params | `booking.com?currency=CLP` |
| **Tinder** | App nativa, sin URL por pais | GPS automatico |

**Conclusion para Atlas:** El patron **path prefix** (`/cl/`, `/ar/`) es el recomendado para startups. Consolida backlinks en un solo dominio, facil de implementar con proxy.ts, buen SEO. Los ccTLDs son para empresas con presupuesto grande. **Atlas ya usa este patron.**

**Fuentes:** Uber Developer Docs (localization), Yoast (domain structures for international SEO), Digidop (SEO international URL strategies), Next.js docs (internationalization).

### 1.2 Deteccion de pais (cascada de prioridad real)

| Prioridad | Metodo | Precision | Quien lo usa |
|-----------|--------|-----------|-------------|
| 1 | Cookie/preferencia guardada | 100% | Todos |
| 2 | GPS (mobile) | Alta | Uber, Tinder |
| 3 | Cloudflare `CF-IPCountry` header | Alta | Apps en Cloudflare |
| 4 | Vercel `x-vercel-ip-country` header | Alta | Apps en Vercel |
| 5 | IP geolocation | Media-Alta | Airbnb, Booking |
| 6 | `Accept-Language` header | Media | Fallback comun |
| 7 | Default hardcoded | 100% | Ultimo recurso |

**Atlas ya implementa esta cascada** en `proxy.ts` (cookie > CF header > Vercel header > Accept-Language > default `cl`). Esto es correcto.

**Patron clave:** El redirect por IP solo ocurre **una vez** (primera visita). Despues, la cookie `atlas_country` persiste la preferencia. El usuario navega libremente sin re-deteccion.

**Fuente:** Cloudflare IP Geolocation docs, Vercel Edge Geolocation template.

### 1.3 Scoping de datos: como asocian servicios/productos a paises

| App | Estrategia | Detalle |
|-----|-----------|---------|
| **MercadoLibre** | **Aislamiento total por pais** | Producto en MLA (Argentina) NO aparece en MLC (Chile). IDs tienen prefijo del site. Para vender cross-country usan "Global Selling" que crea copias del listing. |
| **Airbnb** | **Datos globales + ubicacion geografica** | Los listings son globales. Se filtran por lat/lng y proximidad, no por `country_id`. Desde Chile puedes buscar en Tokyo. |
| **Booking** | **Datos globales + pais del alojamiento** | Listings asociados al pais donde se ubica el hotel. Busqueda global cross-country. |
| **Uber** | **Aislamiento por ciudad** | Conductores y tarifas son locales a la ciudad. GPS determina en que ciudad estas. |

**Conclusion para Atlas:** Atlas es un marketplace de servicios locales (como MercadoLibre, no como Airbnb). Un electricista en Castro, Chile, no presta servicios en Buenos Aires. El modelo correcto es **aislamiento por pais**: los servicios pertenecen a UN pais y solo se muestran ahi.

**Fuente:** MercadoLibre API docs (sites, items-and-searches), MercadoLibre Global Selling devsite.

### 1.4 Usuarios multi-pais

| App | Modelo |
|-----|--------|
| **MercadoLibre** | "Global User" con token maestro + "Marketplace Users" hijos por pais. Cada marketplace user tiene config propia. |
| **Airbnb** | Cuenta global. Un host puede tener listings en multiples paises. |
| **Uber** | Cuenta global. La app se adapta automaticamente al pais donde estas (GPS). |

**Conclusion para Atlas:** El usuario es **global** (una cuenta, un login). Sus servicios estan asociados a un pais especifico. Un usuario PUEDE tener servicios en multiples paises (ej: un electricista que trabaja en Chile y Argentina). El pais del contexto de navegacion (`/cl/`, `/ar/`) determina que ve.

### 1.5 Admin multi-pais

| Patron | Descripcion | Cuando usarlo |
|--------|-------------|--------------|
| **Centralizado con filtro** | Un solo panel, filtro por pais en la UI | Equipos pequenos |
| **Descentralizado** | Panel separado por pais | Operaciones grandes con equipos locales |

**Conclusion para Atlas:** Panel centralizado. SuperAdmin ve todo con filtro opcional. Admin por pais ve solo su pais (sin filtro, el pais viene del URL y del JWT `adminCountries`).

**Fuente:** Curity (Managing User Access in Multi-Region Deployments).

### 1.6 Moneda y precios

| App | Estrategia |
|-----|-----------|
| **Airbnb** | Precios almacenados en USD internamente, conversion dinamica a la moneda del usuario. Fee del 3% por conversion. |
| **MercadoLibre** | Precios en moneda local del pais. Global Selling calcula precios automaticamente por pais. |
| **Booking** | Moneda detectada por IP, cambiable por el usuario. |

**Conclusion para Atlas:** Precios en **moneda local del pais** (como MercadoLibre). No hay conversion. Cada pais tiene sus propios precios en la tabla `PremiumPrice`.

---

## 2. Diagnostico Real del Codigo

### Backend: ~75% listo

| Modulo | Estado | Bug/Falta |
|--------|--------|-----------|
| Schema Prisma | OK | — |
| Geo (countries/regions/localities) | OK | — |
| Services (CRUD con countryCode) | OK | — |
| Payments (gateway pattern) | OK | — |
| Auth/JWT (adminCountries) | OK | — |
| **CountryAdminGuard** | **BUG** | Espera `countryRoles` (objetos) pero JWT envia `adminCountries` (strings) |
| **Subscriptions** | **BUG** | `findByDuracion()` no filtra por pais = precio incorrecto cross-country |
| **Prices seed** | **BUG** | Solo Chile tiene precios. Los otros 4 paises crashean |
| **Categories service** | **Parcial** | `findAll()` no acepta filtro countryCode |
| **Sponsors service** | **Parcial** | `findAll()` no acepta filtro countryId |

### Frontend: ~25% listo

| Area | Estado | Problema |
|------|--------|---------|
| Routing `[country]` + proxy.ts | OK | Funcional |
| CountryProvider + useCountry | OK | Con fallback |
| LocalitySelect (geo feature) | OK | Dinamico desde API |
| **Navbar** | **ROTO** | 6+ hrefs sin prefijo country (`/buscar`, `/publicar`, `/login`, etc.) |
| **Footer** | **ROTO** | 8+ hrefs sin prefijo + textos "archipielago", "Isla Grande" |
| **HomeHeroSection** | **ROTO** | Texto "Chiloe", comunas hardcodeadas (Castro, Ancud, Quellon, Dalcahue, Chonchi), `router.push('/buscar')` sin country |
| **SearchPageClient** | **ROTO** | Filtro usa `Object.values(Comuna)` = 10 comunas Chiloe |
| **Paso2TuOficio** | **ROTO** | Select con `COMUNAS_CHILOE` hardcodeado |
| **ServicioFormBase** | **ROTO** | Importa `COMUNAS_CHILOE` para select de comuna |
| **suscripcion-pro** | **ROTO** | Textos "Chiloe", "la isla", precios sin moneda dinamica |
| **registro** | **ROTO** | Texto "comunidad de Chiloe Servicios" |
| **perfil** | **ROTO** | Texto "Proveedor Chilote", links sin country |
| **publicar metadata** | **ROTO** | "Publica tu servicio profesional en Chiloe" |
| **buscar metadata** | **ROTO** | "Isla de Chiloe", "Castro, Ancud y alrededores" |
| **Logout buttons** | **ROTO** | `signOut({ callbackUrl: '/login' })` sin country |
| **Links internos** | **ROTO** | 50+ links sin prefijo `/[country]` en toda la app |
| **Admin** | **Sin cambios** | No filtra por pais, no hay columna pais, no respeta scope |
| **Actions (fetch al backend)** | **Parcial** | Muchas no envian `countryCode` al backend |

---

## 3. Arquitectura Objetivo

### Flujo de un usuario nuevo

```
1. Usuario visita atlasservicios.cl (o la URL que sea)
2. proxy.ts detecta pais por IP header -> cookie "atlas_country=cl"
3. Redirect 302 a /cl
4. /cl carga: layout con CountryProvider(config de Chile)
5. Home muestra: regiones de Chile en filtro, servicios de Chile, sponsors de Chile
6. Usuario busca: /cl/buscar?q=electricista&region=LL -> servicios en Los Lagos, Chile
7. Usuario se registra en /cl/registro -> cuenta global, navega en contexto Chile
8. Usuario publica en /cl/publicar -> servicio asociado a Chile + region + localidad
9. Si viaja a Argentina, va a /ar -> ve servicios de Argentina
```

### Flujo de un admin por pais

```
1. Admin de Chile hace login en /cl/login
2. JWT contiene: roles=["Administrador"], adminCountries=["cl"]
3. proxy.ts permite acceso a /cl/admin (country "cl" esta en adminCountries)
4. proxy.ts BLOQUEA acceso a /ar/admin (country "ar" NO esta en adminCountries)
5. Admin ve: servicios de Chile, usuarios con servicios en Chile, precios CLP
```

### Flujo del SuperAdministrador

```
1. SuperAdmin hace login en /cl/login (o cualquier pais)
2. JWT contiene: roles=["SuperAdministrador"], adminCountries=[]
3. proxy.ts permite acceso a CUALQUIER /[country]/admin
4. SuperAdmin ve: filtro de pais en el dashboard, puede cambiar entre paises
5. Puede gestionar: servicios, usuarios, precios, sponsors de TODOS los paises
```

### Principio de datos

```
Tabla          | Scoped a pais? | Como?
---------------|----------------|------
Service        | SI             | countryId FK (obligatorio)
PremiumPrice   | SI             | countryId FK (obligatorio)
Subscription   | SI             | currency + paymentGateway del pais
Sponsor        | OPCIONAL       | countryId FK nullable (null = global)
Category       | OPCIONAL       | countryCode nullable (null = global)
User           | NO             | Cuenta global, sin countryId
UserRole       | OPCIONAL       | countryId para admin por pais
Rating         | HERENCIA       | Via Service.countryId
Interaction    | HERENCIA       | Via Service.countryId
GeoRegion      | SI             | countryId FK
GeoLocality    | SI             | Via GeoRegion.countryId
```

---

## 4. Fases de Implementacion

### FASE 1 — Backend: Fixes criticos (3 bugs bloqueantes)

**Objetivo:** El backend debe funcionar correctamente para multiples paises antes de tocar el frontend.

#### F1.1 Fix CountryAdminGuard

**Archivo:** `backend/src/common/guards/country-admin.guard.ts`
**Problema:** Interface espera `user.countryRoles` (array de objetos `{role, countryCode}`) pero el JWT provee `user.adminCountries` (array de strings `["cl"]`).
**Fix:** Reescribir el guard para usar `adminCountries` del JWT payload.

#### F1.2 Fix SubscriptionsService: precio por pais

**Archivo:** `backend/src/modules/subscriptions/subscriptions.service.ts`
**Problema:** Linea ~67 llama `findByDuracion(dto.durationMonths)` que retorna el primer precio activo de CUALQUIER pais.
**Fix:** Resolver `dto.countryCode` -> `countryId`, luego usar `findByCountryAndDuration(countryId, durationMonths)` que ya existe en PricesService.

#### F1.3 Seeds de precios para los 5 paises

**Archivo:** `backend/prisma/seed/prices/index.ts`
**Problema:** Solo crea precios para Chile. AR/UY/ES/US no tienen precios -> crash.
**Fix:** Iterar sobre los 5 paises con precios en moneda local.

#### F1.4 Categories y Sponsors: filtro por pais

**Archivos:**
- `backend/src/modules/categories/categories.service.ts` + controller
- `backend/src/modules/sponsors/sponsors.service.ts` + controller

**Problema:** `findAll()` retorna todo sin filtrar por pais.
**Fix:** Agregar param opcional `countryCode`. Retornar items donde `countryCode IS NULL OR countryCode = :code`.

**Verificacion:** `pnpm lint && pnpm build` en backend.

---

### FASE 2 — Frontend: Infraestructura global

**Objetivo:** Resolver el problema de los 50+ links rotos y los componentes compartidos (Navbar, Footer) que no saben en que pais estan.

#### F2.1 Hook `useCountryLink` + helper `countryLink`

**Archivo NUEVO:** `frontend/src/features/geo/hooks/useCountryLink.ts`

Dos funciones:
- `useCountryLink()` — hook para Client Components, extrae country de `useParams()`
- `countryLink(country, path)` — funcion pura para Server Components

#### F2.2 Root Layout: extraer country del pathname y pasarlo como prop

**Archivo:** `frontend/src/app/layout.tsx`

**Problema:** Navbar y Footer son renderizados en el root layout, que no tiene acceso al param `[country]`. Necesitan saber el pais para armar los links.

**Solucion:** Usar `headers()` de Next.js para leer el pathname actual en el server, extraer el segmento de pais, y pasarlo como prop a Navbar y Footer.

Alternativa: Convertir Navbar y Footer a Client Components que lean `useParams()` o `usePathname()`.

#### F2.3 Navbar: links dinamicos

**Archivo:** `frontend/src/shared/components/layout/Navbar.tsx`

**Cambios:**
- Recibir `country` como prop (o extraerlo del pathname)
- Reemplazar cada `href="/ruta"` por `href="/{country}/ruta"`
- **NO agregar CountrySwitcher** (no fue pedido)
- **NO agregar boton registrar** (no fue pedido)
- Links a fix: `/buscar`, `/publicar`, `/admin`, `/perfil`, `/login`

#### F2.4 Footer: links y textos

**Archivo:** `frontend/src/shared/components/layout/Footer.tsx`

**Cambios:**
- Recibir `country` como prop
- Reemplazar textos "archipielago", "Isla Grande" por texto generico
- Reemplazar cada `href="/ruta"` por `href="/{country}/ruta"`
- Links a fix: `/publicar`, `/suscripcion-pro`, `/quienes-somos`, `/como-funciona`, `/ayuda`, `/terminos`, `/privacidad`, `/contacto`

#### F2.5 Logout redirects

**Archivos:**
- `frontend/src/shared/components/admin/AdminHeader.tsx`
- `frontend/src/features/users/components/profile/LogoutButton.tsx`

**Cambio:** `signOut({ callbackUrl: '/login' })` -> debe incluir country del contexto actual.

#### F2.6 Actions: pasar countryCode al backend

**Archivos a modificar:**
- `frontend/src/features/services/actions/index.ts` — `getFilteredServices()` debe enviar `countryCode`
- `frontend/src/features/categories/actions/index.ts` — `getCategorias()` debe enviar `countryCode`
- `frontend/src/features/sponsors/actions/index.ts` — `getSponsorsSenior()`, `getSponsorsPremium()` deben enviar `countryCode`
- `frontend/src/features/services/actions/index.ts` — `getPublicFeaturedServices()` debe enviar `countryCode`

**Patron:** Las server actions reciben `countryCode` como parametro. Las paginas lo extraen de `params.country` y lo pasan.

**Verificacion:** `pnpm lint && pnpm build` en frontend.

---

### FASE 3 — Frontend: Paginas publicas

**Objetivo:** Cada pagina publica debe adaptarse al pais del URL. Sin textos hardcodeados a Chiloe. Filtros dinamicos desde la DB.

#### F3.1 HomeHeroSection: dinamico por pais

**Archivo:** `frontend/src/shared/components/layout/HomeHeroSection.tsx`

**Estado actual (hardcodeado):**
- Titulo: "Soluciones rapidas para tu hogar en Chiloe"
- Subtitulo: "Encuentra expertos locales verificados en Castro, Ancud, Quellon y alrededores"
- Selector ubicacion: dropdown con 5 comunas de Chiloe (Castro, Ancud, Quellon, Dalcahue, Chonchi)
- Boton buscar: `router.push('/buscar?q=...')` sin country

**Cambios:**
1. Recibir `country`, `countryName`, `regions` como props desde la pagina padre
2. Titulo generico: "Encuentra profesionales cerca de ti"
3. Subtitulo dinamico: "Servicios en {countryName}" (ej: "Servicios en Chile")
4. Selector de ubicacion: reemplazar comunas por `regions` del pais (cargadas desde API geo)
5. Boton buscar: `router.push('/{country}/buscar?q=...&region=...')`

**La pagina padre** (`[country]/(public)/page.tsx`) carga las regiones:
```
const regions = await getRegionsByCountry(country);
<HomeHeroSection country={country} countryName={config.name} regions={regions} />
```

#### F3.2 Buscar: filtros completamente dinamicos

**Archivos:**
- `frontend/src/app/(country)/[country]/(public)/buscar/page.tsx`
- `frontend/src/app/(public)/buscar/components/SearchPageClient.tsx`

**Estado actual (hardcodeado):**
- Filtro de ubicacion: `Object.values(Comuna)` = 10 comunas de Chiloe
- Metadata: "Isla de Chiloe", "Castro, Ancud y alrededores"
- Query al backend: `comuna=Castro` (string libre)

**Cambios:**
1. `buscar/page.tsx` (server): carga regiones del pais via `getRegionsByCountry(country)`. Pasa `regions` y `country` como props.
2. `SearchPageClient` (client):
   - Reemplazar filtro de comunas por filtro de regiones (desde props)
   - Opcionalmente: al seleccionar region, cargar localidades con `getLocalitiesByRegion(regionId)` (segundo nivel de filtro)
   - Query al backend usa `countryCode`, `regionCode`, `localitySlug` en lugar de `comuna`
3. Metadata dinamica: "Buscar servicios en {countryName}"
4. Links de busqueda: `/{country}/buscar?q=...&region=LL&localidad=castro`

**Cambio en query params:**
```
ANTES:  /buscar?q=electricista&c=Electricidad&comuna=Castro
AHORA:  /cl/buscar?q=electricista&c=Electricidad&region=LL&localidad=castro
```

#### F3.3 Publicar: formularios con LocalitySelect

**Archivos:**
- `frontend/src/features/services/publish/components/Paso2TuOficio.tsx`
- `frontend/src/features/services/components/forms/base/ServicioFormBase.tsx`

**Estado actual:**
- `Paso2TuOficio`: select con `COMUNAS_CHILOE` (array de 10 strings)
- `ServicioFormBase`: importa `COMUNAS_CHILOE` para el select de comuna

**Cambios:**
1. Reemplazar el `<select>` de comunas por el componente `LocalitySelect` (ya existe en `features/geo/components/`)
2. `LocalitySelect` lee el `countryCode` del `CountryProvider` (ya inyectado por el layout)
3. Carga regiones automaticamente al montar, luego localidades al seleccionar region
4. El formulario envia `countryCode`, `regionCode`, `localitySlug` al backend
5. Eliminar `COMUNAS_CHILOE` de las importaciones
6. Metadata de `/publicar`: eliminar "Chiloe", usar texto generico

#### F3.4 Suscripcion Pro: precios por pais

**Archivo:** `frontend/src/app/(country)/[country]/(public)/suscripcion-pro/page.tsx`

**Estado actual:**
- Textos: "Destaca tu servicio en Chiloe", "disenados para la isla"
- Precios: se cargan sin filtro de pais (o hardcodeados CLP)

**Cambios:**
1. Cargar precios con `countryCode`: la action `getPreciosPremium(countryCode)` pasa el country del URL al backend
2. Formatear con `formatPrice(amount, countryCode)` que usa Intl.NumberFormat
3. Textos genericos: "Destaca tu servicio", "Planes profesionales"
4. PaymentRouter (ya existe): selecciona MercadoPago o Stripe segun `gateway` del CountryProvider

**Verificacion:** `pnpm lint && pnpm build` en frontend.

---

### FASE 4 — Frontend: Perfil, Auth, Registro

**Objetivo:** El usuario navega y se registra en el contexto de un pais. Su cuenta es global pero su experiencia es local.

#### F4.1 Registro

**Archivo:** `frontend/src/app/(country)/[country]/(public)/registro/page.tsx`

**Cambios:**
- Eliminar "Unete a la comunidad de Chiloe Servicios"
- Texto generico: "Crea tu cuenta en Atlas Servicios"
- Links: `/terminos`, `/privacidad` con prefijo country

**Nota sobre modelo de datos:** El `User` NO tiene `countryId` (es global, como en Airbnb/Uber). El pais se asocia a los **servicios** que publica, no al usuario. Cuando un usuario navega `/ar/`, ve contenido de Argentina independientemente de donde se registro.

#### F4.2 Perfil

**Archivo:** `frontend/src/app/(country)/[country]/(public)/perfil/page.tsx`

**Cambios:**
- Eliminar "Proveedor Chilote"
- Mostrar servicios del usuario (todos los paises, o filtrado por el pais actual del URL)
- Links: `/suscripcion-pro`, `/publicar` con prefijo country

#### F4.3 Login y callbacks

**Cambios:**
- `callbackUrl` en next-auth debe incluir country: `/{country}/perfil`
- Redireccion post-login: `/{country}/perfil` o `/{country}/admin`

**Verificacion:** `pnpm lint && pnpm build` en frontend.

---

### FASE 5 — Frontend: Admin multi-pais

**Objetivo:** El admin por pais solo ve datos de su pais. El SuperAdmin ve todo.

#### F5.1 Admin Dashboard

**Archivo:** `frontend/src/app/(country)/[country]/(admin)/admin/page.tsx`

**Cambios:**
- Las stats del dashboard se cargan con `countryCode` del URL
- Si es SuperAdmin y esta en `/cl/admin`, ve stats de Chile
- Si navega a `/ar/admin`, ve stats de Argentina
- SuperAdmin puede tener un selector de pais para cambiar rapido (si se desea, sujeto a aprobacion)

#### F5.2 Admin Servicios

**Cambios:**
- Query incluye `countryCode` -> solo servicios del pais del URL
- Agregar columna "Region" y "Localidad" en la tabla (reemplaza "Comuna" hardcodeada)
- SuperAdmin: puede ver todos los paises (si cambia el URL o usa selector)

#### F5.3 Admin Usuarios

**Cambios:**
- Admin por pais: ve usuarios que tienen servicios en su pais
- SuperAdmin: ve todos los usuarios
- Agregar indicador de pais(es) donde cada usuario tiene servicios

#### F5.4 Admin Precios Premium

**Cambios:**
- Mostrar precios del pais actual (del URL)
- Admin por pais: solo puede editar precios de su pais
- SuperAdmin: puede editar precios de cualquier pais

#### F5.5 Admin Sponsors

**Cambios:**
- Filtro por pais del URL
- Sponsors globales (countryId = null) visibles para SuperAdmin

#### F5.6 Admin Calificaciones e Interacciones

**Cambios:**
- Filtro por countryCode (herencia via Service.countryId)
- Admin por pais: ve solo calificaciones/interacciones de servicios de su pais

**Verificacion:** `pnpm lint && pnpm build` en frontend.

---

### FASE 6 — Limpieza de codigo legacy

**Objetivo:** Eliminar todo el codigo hardcodeado a Chiloe que fue reemplazado.

#### F6.1 Constantes y enums a eliminar

| Archivo | Que eliminar |
|---------|-------------|
| `frontend/src/features/services/lib/constants.ts` | `COMUNAS_CHILOE` (reemplazado por LocalitySelect) |
| `frontend/src/shared/types/common.ts` | Enum `Comuna` (reemplazado por datos dinamicos) |
| `frontend/src/shared/constants/locations.ts` | Archivo completo (reemplazado por API geo) |

#### F6.2 Paginas legacy

Las paginas en `(public)/` y `(admin)/` sin prefijo country deben convertirse en simples redirects a su equivalente `(country)/[country]/`. El proxy.ts ya maneja los redirects 301, pero las paginas legacy aun renderizan contenido duplicado.

**Opcion A (recomendada):** Convertir cada pagina legacy en un `redirect('/{default_country}/ruta')`.
**Opcion B:** Eliminar las carpetas legacy y depender solo del proxy.ts para los redirects.

**Verificacion final:** `pnpm lint && pnpm build` en frontend y backend.

---

## 5. Inventario Completo de Archivos

### Backend — MODIFICAR (Fase 1)

| Archivo | Cambio |
|---------|--------|
| `common/guards/country-admin.guard.ts` | Reescribir para usar `adminCountries` (strings) del JWT |
| `modules/subscriptions/subscriptions.service.ts` | Usar `findByCountryAndDuration()` en lugar de `findByDuracion()` |
| `prisma/seed/prices/index.ts` | Crear precios para 5 paises con monedas correctas |
| `modules/categories/categories.service.ts` | Agregar param `countryCode?` a findAll |
| `modules/categories/categories.controller.ts` | Aceptar query param `countryCode` |
| `modules/sponsors/sponsors.service.ts` | Agregar param `countryCode?` a queries publicas |
| `modules/sponsors/sponsors.controller.ts` | Aceptar query param `countryCode` |

### Frontend — CREAR (Fase 2)

| Archivo | Descripcion |
|---------|-------------|
| `features/geo/hooks/useCountryLink.ts` | Hook (client) + helper (server) para prefijo country en links |

### Frontend — MODIFICAR (Fase 2: Infraestructura)

| Archivo | Cambio |
|---------|--------|
| `app/layout.tsx` | Extraer country del pathname, pasarlo a Navbar y Footer |
| `shared/components/layout/Navbar.tsx` | Links dinamicos con prefijo country |
| `shared/components/layout/Footer.tsx` | Links dinamicos + textos genericos (sin Chiloe) |
| `shared/components/admin/AdminHeader.tsx` | Logout redirect con country |
| `features/users/components/profile/LogoutButton.tsx` | Logout redirect con country |
| `features/services/actions/index.ts` | Agregar `countryCode` a getFilteredServices, getPublicFeaturedServices |
| `features/categories/actions/index.ts` | Agregar `countryCode` a getCategorias |
| `features/sponsors/actions/index.ts` | Agregar `countryCode` a getSponsorsSenior, getSponsorsPremium |

### Frontend — MODIFICAR (Fase 3: Paginas publicas)

| Archivo | Cambio |
|---------|--------|
| `shared/components/layout/HomeHeroSection.tsx` | Props dinamicas (country, regions), eliminar hardcoded Chiloe |
| `app/(country)/[country]/(public)/page.tsx` | Cargar regiones, pasarlas a HomeHeroSection |
| `app/(country)/[country]/(public)/buscar/page.tsx` | Cargar regiones, pasar country a SearchPageClient |
| `app/(public)/buscar/components/SearchPageClient.tsx` | Filtros dinamicos por regiones/localidades |
| `features/services/publish/components/Paso2TuOficio.tsx` | Usar LocalitySelect en vez de COMUNAS_CHILOE |
| `features/services/components/forms/base/ServicioFormBase.tsx` | Usar LocalitySelect en vez de COMUNAS_CHILOE |
| `app/(country)/[country]/(public)/suscripcion-pro/page.tsx` | Precios dinamicos con formatPrice() |
| `app/(country)/[country]/(public)/publicar/page.tsx` | Metadata generica (sin Chiloe) |

### Frontend — MODIFICAR (Fase 4: Auth/Perfil)

| Archivo | Cambio |
|---------|--------|
| `app/(country)/[country]/(public)/registro/page.tsx` | Textos genericos, links con country |
| `app/(country)/[country]/(public)/perfil/page.tsx` | Eliminar "Proveedor Chilote", links con country |
| `app/(country)/[country]/(public)/login/page.tsx` | callbackUrl con country |
| `features/users/components/profile/MisServicios.tsx` | Links con country |
| `features/users/components/profile/AjustesPerfilForm.tsx` | Links con country |

### Frontend — MODIFICAR (Fase 5: Admin)

| Archivo | Cambio |
|---------|--------|
| `app/(country)/[country]/(admin)/admin/page.tsx` | Stats filtradas por country |
| `app/(country)/[country]/(admin)/admin/servicios/page.tsx` | Query con countryCode, columna region/localidad |
| `app/(country)/[country]/(admin)/admin/usuarios/page.tsx` | Filtro por country |
| `app/(country)/[country]/(admin)/admin/precios-premium/page.tsx` | Precios del pais del URL |
| `app/(country)/[country]/(admin)/admin/sponsors/page.tsx` | Filtro por country |
| `app/(country)/[country]/(admin)/admin/calificaciones/page.tsx` | Filtro por country |
| `app/(country)/[country]/(admin)/admin/interacciones/page.tsx` | Filtro por country |
| `app/(country)/[country]/(admin)/admin/categorias/page.tsx` | Filtro por country |
| `app/(country)/[country]/(admin)/admin/pagos/page.tsx` | Filtro por country |

### Frontend — ELIMINAR (Fase 6)

| Archivo | Razon |
|---------|-------|
| `shared/constants/locations.ts` | Reemplazado por API geo |
| Enum `Comuna` en `shared/types/common.ts` | Reemplazado por datos dinamicos |
| `COMUNAS_CHILOE` en `features/services/lib/constants.ts` | Reemplazado por LocalitySelect |

---

## 6. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigacion |
|--------|---------|-----------|
| Navbar/Footer no tienen acceso a params `[country]` | Alto | Extraer country del pathname en root layout via `headers()` |
| Eliminar paginas legacy rompe bookmarks/SEO | Alto | proxy.ts ya redirige 301; Google reindexara |
| Links en 50+ archivos deben actualizarse | Alto | Hook centralizado `useCountryLink`; buscar y reemplazar sistematico |
| Admin por pais ve datos de otro pais si cambia URL manualmente | Medio | CountryAdminGuard en backend bloquea la API; frontend es defensa secundaria |
| Precios en multiples monedas causan confusion | Medio | `formatPrice()` siempre muestra simbolo de moneda |
| SearchPageClient es un componente complejo con mucha logica | Alto | Modificar incrementalmente: primero reemplazar el filtro, luego los queries |
| Regresiones en paginas que no se tocan explicitamente | Medio | Lint + build despues de cada fase como gate de calidad |

---

## 7. Preguntas para el usuario

1. Los precios de la tabla (F1.3) son orientativos o hay precios reales definidos para cada pais?
2. Las categorias deben ser las mismas para todos los paises (globales), o cada pais puede tener categorias propias?
3. En el admin, el SuperAdministrador necesita un selector rapido de pais en el header del panel? O simplemente cambia el URL manualmente (/cl/admin -> /ar/admin)?
4. Las paginas estaticas (quienes-somos, como-funciona, terminos, privacidad, etc.) deben tener contenido diferente por pais, o el mismo contenido para todos?

---

**Apruebas este plan? Que cambiarias?**
