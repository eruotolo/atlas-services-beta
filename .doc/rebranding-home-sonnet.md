# Plan — Rebranding Home `/[country]` (Hireeo)

**Fecha:** 21-07-2026
**Alcance:** `frontend/src/app/(country)/[country]/(public)/page.tsx` y `frontend/src/features/home/components/`
**Modalidad:** Plan de diseño/UX + estructura. No incluye implementación — este documento es la base para aprobar antes de tocar código.
**Origen:** Sesión de análisis comparando Hireeo contra MercadoLibre Chile y Amazon (revisión visual vía devtools) + validación de patrones con skill `ui-ux-pro-max`.

---

## 1. Resumen ejecutivo

La home actual (`page.tsx`) mezcla dos lenguajes visuales distintos:

- **Retail/marketplace** (Hero con búsqueda, grid de categorías) — correcto y alineado al patrón esperado.
- **Corporativo/SaaS** (features "por qué elegirnos", stats abstractas, pricing tiers, CTA genérico) — domina la mitad inferior de la página y desplaza lo que debería ser el corazón de un marketplace: **la vitrina de servicios/profesionales reales**.

Hallazgo concreto: `page.tsx` ya pide `getPublicFeaturedServices(country)` y arma `previewServices`, pero ese dato **nunca se renderiza** — se pasa a `HeroHireeoSection` como prop y queda sin usar en el JSX. El fetch se ejecuta en cada carga de home sin ningún efecto visible.

Además, los tres bloques superiores (`HeroHireeoSection`, `FeaturesGridSection`, `CategoriesGridSection`) comparten el mismo fondo plano blanco (`var(--bg)`) separado solo por líneas de 1px, y el Hero usa un canvas de partículas conectado + grid de puntos — un patrón visual muy reconocible como "plantilla SaaS/IA genérica", sin ningún elemento que hable del rubro (oficios, servicios manuales).

Este documento propone: (1) reordenar/completar la estructura siguiendo el patrón canónico de marketplace, (2) dar de baja o reubicar el contenido institucional que no aporta a la conversión del visitante que busca contratar, (3) rediseñar los fondos de Hero/Features/Categories para salir del molde genérico.

---

## 2. Diagnóstico detallado

### 2.1 Patrón canónico de marketplace (validado con `ui-ux-pro-max`, dominio `landing`)

```
1. Hero (search-focused)
2. Categories
3. Featured Listings   ← FALTA en Hireeo
4. Trust/Safety
5. CTA (become seller/professional)
```

### 2.2 Estructura actual vs rol real

| Sección actual | Rol real | ¿Encaja en el patrón retail? |
|---|---|---|
| `HeroHireeoSection` | Search + tabs de categorías | Sí — Hero |
| `FeaturesGridSection` | 6 tiles "por qué elegirnos" (numeradas 01-06) | No — landing de producto/SaaS |
| `CategoriesGridSection` | Grid de 12 categorías (solo icono vectorial) | Sí — Categories, pero sin imagen real |
| `StatsSection` | 4 métricas abstractas | Parcial — podría ser Trust, pero es un bloque aislado y genérico |
| `PricingSection` | Tiers Personas/Pro/Empresas hardcodeados | No — es monetización B2B2C para profesionales, no contenido para el visitante que busca un servicio |
| `FinalCtaSection` | CTA genérico (buscar / cómo funciona) | Sí — cierre |
| `ChatIA` | Widget flotante | N/A |

**Falta por completo el bloque 3 (Featured Listings)** y sobran tres bloques corporativos compitiendo por jerarquía antes del cierre.

### 2.3 Redundancia detectada — Pricing

`src/app/(country)/[country]/(public)/pricing/page.tsx` (347 líneas) **ya existe** como página completa y funcional: usa `obtenerPreciosPremiumActivos()` (datos reales, no hardcodeados) y su propio `PlanCard`, con metadata SEO propia ("Hireeo Pro · Para los que viven del oficio"). La `PricingSection` de home es una versión hardcodeada y redundante de esto mismo. No hay contenido que "mover" — simplemente sobra en home y ya tiene destino propio en `/pricing`.

### 2.4 Fondos genéricos (visual)

- `HeroHireeoSection`: `ParticleBackground` (canvas de partículas conectadas, reactivo al mouse) + overlay de grid de puntos con máscara de fade — patrón muy repetido en plantillas SaaS/IA, no comunica nada del rubro.
- `FeaturesGridSection` y `CategoriesGridSection`: fondo blanco plano (`var(--bg)`), separación solo por bordes hairline `var(--line)` (`#ebebeb`). Sin variación tonal entre secciones ni imágenes reales — los iconos de categoría son vectores genéricos en cajas monocromas, mientras que MercadoLibre/Amazon usan fotografía real de producto para anclar la vitrina.
- El token `--tint-warm` (`#fafaf8`, definido en `globals.css`) ya existe pero no se usa en ninguna de estas tres secciones — solo `StatsSection` usa `var(--tint)`.
- Paleta actual: `--accent: #2d4e8f` (azul desaturado) sobre blanco — sin ningún acento cálido que sugiera "oficio/urgencia", indistinguible de cualquier landing SaaS.

Referencia de paleta validada (`ui-ux-pro-max`, dominio `color`, "Home Services / Plumber-Electrician"): Primary `#1E40AF` + **Accent `#EA580C` (naranja)** — ese acento cálido es lo que falta para diferenciar del azul-sobre-blanco genérico.

---

## 3. Estructura propuesta de la home

```
1. HeroHireeoSection        (mantener, rediseñar background)
2. CategoriesGridSection    (mantener, agregar imagen real por categoría, alternar fondo con --tint-warm)
3. FeaturedServicesSection  (NUEVO — vitrina de servicios/profesionales reales)
4. TrustStripSection        (NUEVO, liviano — reemplaza StatsSection + recorte de FeaturesGridSection)
5. FinalCtaSection          (mantener)
```

Se elimina de home: `PricingSection` completa (ya vive en `/pricing`), `FeaturesGridSection` completa en su forma actual de 6 tiles (se recorta a franja de confianza o se reubica).

`ChatIA` se mantiene sin cambios (widget flotante, no forma parte del flujo de secciones).

---

## 4. Detalle por sección

### 4.1 `FeaturedServicesSection` — NUEVA

**Objetivo:** cerrar el hueco de "Featured Listings" reusando el fetch que ya existe y hoy se desperdicia.

- **Ubicación:** `frontend/src/features/home/components/FeaturedServicesSection/index.tsx`
- **Props:** `{ country: string; dict: Dictionary; services: readonly Service[] }` — recibe `previewServices` que `page.tsx` ya calcula (hoy pasado sin uso a `HeroHireeoSection`; se retira de ahí y se pasa acá).
- **Componente de card:** no existe un `ServiceCard` de grid vertical reusable hoy. Lo más cercano es `ProviderRow` (`src/features/services/components/search/ProviderRow/index.tsx`), pensado para listado horizontal de búsqueda (grid `56px 1fr 180px 140px`) — no sirve tal cual para un grid de vitrina. Se necesita un componente nuevo, ej. `ServiceCard` en `src/features/services/components/` (reusable entre home y otras vitrinas), con: imagen del servicio (`service.image`), `title`, `price`, `rating`/`reviewsCount`, `userName`, badge si `isPremium`.
- **Datos disponibles en `Service`** (`src/shared/types/common.ts`): `id, slug, userId, userName, title, category, categoryId, categories?, description, price, commune, countryCode, rating, reviewsCount, image, isPremium`. Suficiente para una card de grid sin cambios de tipo.
- **CTA de sección:** "Ver todos los servicios" → `/${country}/search`, mismo patrón que `CategoriesGridSection.viewAll`.
- **i18n:** nuevas keys bajo `home.featuredServices` siguiendo el patrón existente de `categories2` (`eyebrow, title, viewAll`) — ej.: `eyebrow, title, subtitle, viewAll, emptyState`.
- **Fallback:** reusar la misma lógica ya presente en `page.tsx` (si `realFeaturedServices.length < 3`, usar `mockServices.slice(0,3)`), pero evaluar si tiene sentido subir el mínimo a 4-6 para que la vitrina no se vea pobre en países/categorías con poca data real aún.

### 4.2 `CategoriesGridSection` — modificar

- Reemplazar el icono vectorial en caja mono (`Icon` dentro de `bg-tint`) por una imagen/thumbnail real por categoría (foto representativa del oficio), manteniendo el número de orden (`01, 02...`) que ya existe.
- Alternar el fondo de sección a `var(--tint-warm)` en vez de `var(--bg)` para crear ritmo visual respecto al Hero y a `FeaturedServicesSection`.
- Requiere: definir de dónde sale la imagen por categoría (¿campo nuevo en `GeoRegion`/`Category` del backend, o set estático de assets en frontend mapeado por `slug`?) — **pendiente de decisión**, ver sección 7.

### 4.3 `TrustStripSection` — NUEVA (reemplaza `StatsSection` + `FeaturesGridSection`)

- Franja compacta, no una sección completa de 6 tiles. Combina: 2-3 métricas de `StatsSection` (ej. `proCount`, `rating`) con 2-3 value props cortos de `FeaturesGridSection` (ej. "pago seguro", "profesionales verificados") en una sola fila con iconos, sin la grilla de bordes hairline actual.
- El contenido completo de "por qué elegirnos" (los 6 items con descripción larga) se reubica en `about-us` o `how-it-works` (ambas rutas ya existen: `src/app/(country)/[country]/(public)/(estaticas)/about-us/page.tsx` y `how-it-works`), donde sí tiene sentido el formato narrativo largo.
- i18n: reusa `home.stats.*` y una selección de `home.features.f{n}Title/Desc` recortada; no requiere keys nuevas si se reutilizan las existentes.

### 4.4 `HeroHireeoSection` — modificar (solo background/visual, la lógica de búsqueda y tabs de categorías se mantiene intacta)

- Retirar el prop `previewServices` (no se usa acá; pasa a ser consumido en `FeaturedServicesSection`).
- Reemplazar `ParticleBackground` (canvas neuronal reactivo al mouse) por un tratamiento visual grounded al rubro:
  - Opción A: imagen real con tratamiento duotono (electricista/gásfiter/carpintero trabajando) de fondo, con overlay de color para mantener contraste de texto.
  - Opción B: mesh-gradient suave usando `--accent` + nuevo acento cálido (ver 5), con parallax sutil (`yPercent ~10`, scroll-scrub, según preset validado en `ui-ux-pro-max` dominio `gsap`) en vez de partículas mouse-reactivas.
- Mantener `HeroSearchBar`, `HomeCategories` (tabs) y el CTA "publicar como profesional" sin cambios funcionales.

---

## 5. Paleta — acento cálido propuesto

Validado con `ui-ux-pro-max` (dominio `color`, categoría "Home Services"):

| Token actual | Valor actual | Propuesta |
|---|---|---|
| `--accent` | `#2d4e8f` | mantener (identidad de marca ya establecida) |
| *(nuevo)* `--accent-warm` | — | `#EA580C` (naranja), ajustar tono exacto para cumplir contraste WCAG AA sobre `--bg` y `--ink` |

Uso del nuevo acento: CTAs secundarios de urgencia ("contactar ahora"), badges de categoría destacada, detalles en `FeaturedServicesSection` (precio o badge premium) — no reemplaza el azul de marca, lo complementa para dar variación y evitar el monocromo azul-sobre-blanco.

**Decisión pendiente de Edgardo:** confirmar si se agrega este segundo acento a `globals.css` (afecta `light` y `dark` mode, líneas ~74-76 y ~98-100) o si se prefiere resolver la diferenciación solo con imágenes/fotografía sin tocar la paleta.

---

## 6. Checklist de archivos a tocar (implementación futura, NO ejecutado en este plan)

- [ ] `frontend/src/app/(country)/[country]/(public)/page.tsx` — reordenar composición de secciones, quitar `PricingSection`, pasar `previewServices` a `FeaturedServicesSection` en vez de `HeroHireeoSection`.
- [ ] `frontend/src/features/home/components/FeaturedServicesSection/index.tsx` — nuevo.
- [ ] `frontend/src/features/services/components/ServiceCard/index.tsx` — nuevo (o evaluar adaptar `ProviderRow` a modo grid antes de crear uno nuevo, para no duplicar lógica de precio/rating/badge premium).
- [ ] `frontend/src/features/home/components/TrustStripSection/index.tsx` — nuevo, reemplaza el uso de `StatsSection` en home.
- [ ] `frontend/src/features/home/components/HeroHireeoSection/index.tsx` — quitar `ParticleBackground`, nuevo tratamiento visual, quitar prop `previewServices` no usado.
- [ ] `frontend/src/features/home/components/CategoriesGridSection/index.tsx` — imagen real por categoría, fondo `--tint-warm`.
- [ ] `frontend/src/features/home/components/FeaturesGridSection/index.tsx` y `StatsSection/index.tsx` — dejar de usarse en home; evaluar si el contenido completo de features se traslada a `about-us`/`how-it-works` o si esos componentes quedan huérfanos y se eliminan (regla del proyecto: eliminar huérfanos tras la migración).
- [ ] `frontend/src/app/(country)/[country]/(public)/(estaticas)/about-us/page.tsx` — si se decide alojar ahí el contenido completo de "por qué elegirnos".
- [ ] `frontend/src/lib/i18n/locales/es.json` (y demás locales) — nuevas keys `home.featuredServices.*`, ajuste de `home.stats`/`home.features` si se recortan para `TrustStripSection`.
- [ ] `frontend/src/app/globals.css` — si se aprueba el acento `--accent-warm` (líneas ~74-76 light, ~98-100 dark).

---

## 7. Decisiones pendientes (requieren tu confirmación antes de implementar)

1. **Imagen por categoría**: ¿viene de un campo nuevo en el backend (`Category.imagenUrl` o similar, requeriría migración Prisma) o se resuelve con un set estático de assets en frontend mapeado por `slug` (como ya se hace con `CATEGORY_ICON_MAP`)? La segunda opción es más rápida pero no escala si se agregan categorías sin actualizar el mapa.
2. **Fondo del Hero**: ¿fotografía real (duotono) o mesh-gradient sin imagen? Fotografía pide banco de imágenes/licencias; mesh-gradient es más rápido y no depende de assets externos.
3. **Acento cálido `--accent-warm`**: ¿se suma a la paleta global o se resuelve solo con imágenes/composición sin nuevo token de color?
4. **Contenido de `FeaturesGridSection` (6 items completos)**: ¿se traslada a `about-us`, a `how-it-works`, o se elimina directamente si se considera contenido redundante con lo que ya dice el Hero/TrustStrip?
5. **Umbral de fallback en `FeaturedServicesSection`**: mantener el mismo mínimo de 3 servicios reales que usa hoy `page.tsx`, o subirlo para que la vitrina luzca más poblada en países con poca data.

---

## 8. Verificación post-implementación (cuando se ejecute)

Según protocolo del proyecto: `pnpm lint && pnpm build` en `frontend/` tras cada cambio, y revisión visual en browser (mobile-first, light/dark) antes de dar por cerrada cualquiera de las secciones nuevas. Sin este plan aprobado, no se debe iniciar implementación.
