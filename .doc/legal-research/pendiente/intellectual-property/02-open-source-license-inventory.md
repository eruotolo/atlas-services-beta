# 02 — Inventario de licencias open source (Fase 9)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA.
- **Fecha:** 2026-07-23
- **Versión:** 0.1
- **Alcance:** dependencias **directas** de `frontend/package.json`, `backend/package.json` y `appmobile/package.json`. Objetivo: detectar copyleft fuerte con implicaciones de distribución y recomendar un proceso de aprobación de licencias.

> **Limitación crítica (honestidad metodológica).** Este inventario **no** proviene de un escáner SBOM real ni resuelve el árbol **transitivo** de dependencias. Las licencias indicadas se basan en el conocimiento general de paquetes npm conocidos y en el `package.json` observado, **no** en la lectura del campo `license` de cada `node_modules/<pkg>/package.json` ni de sus archivos `LICENSE`. Una licencia concreta **puede cambiar entre versiones** y el grueso del riesgo de copyleft suele estar en dependencias transitivas. Ninguna conclusión de compatibilidad debe tratarse como definitiva sin un escaneo SBOM (CycloneDX/SPDX) sobre el `pnpm-lock.yaml` real. Donde no se puede verificar, se marca `[VERIFICAR]`.

---

## A. Conclusión

- **No se detectó copyleft fuerte (GPL / AGPL / SSPL) entre las dependencias DIRECTAS** de los tres paquetes. Predominan MIT, Apache-2.0, BSD e ISC — licencias permisivas compatibles con software propietario, con obligación principal de **conservar avisos de copyright y de licencia** (relevante al distribuir la app móvil).
- **Dos dependencias directas requieren verificación explícita de licencia**: `gsap` (frontend) y `sileo` (frontend). Ver §C.
- El único `LICENSE` presente en el repo (`appmobile/LICENSE`) es el **MIT de la plantilla Expo** (copyright 650 Industries), no un otorgamiento de Hireeo (ver [`01`](./01-ip-ownership-and-licensing.md) IP-05).
- **Riesgo residual en transitivas: no evaluado.** Es la brecha material de este archivo.

---

## B. Dependencias directas y licencia probable

> Columna "Licencia (conocimiento general)" = licencia habitual del paquete según su publicación npm típica; **no verificada contra el lockfile**. "Copyleft" = implicación de distribución.

### B.1 Backend (`backend/package.json`)

| Paquete | Licencia (conocimiento general) | Copyleft | Nota |
|---|---|---|---|
| `@nestjs/*` (common, core, jwt, config, passport, platform-express, swagger, throttler, websockets, mapped-types, platform-socket.io) | MIT | No | — |
| `@prisma/client`, `prisma`, `@prisma/adapter-pg` | Apache-2.0 | No | Apache exige conservar `NOTICE` si el upstream lo incluye. |
| `@ai-sdk/google`, `ai` (Vercel AI SDK) | Apache-2.0 | No | [VERIFICAR] versión. |
| `@google/generative-ai` | Apache-2.0 | No | SDK oficial Google Gemini. |
| `bcrypt` | MIT | No | — |
| `class-transformer`, `class-validator` | MIT | No | — |
| `cloudinary` | MIT | No | — |
| `firebase-admin` | Apache-2.0 | No | — |
| `helmet` | MIT | No | — |
| `jose` | MIT | No | — |
| `passport`, `passport-jwt`, `passport-local` | MIT | No | — |
| `pg` | MIT | No | — |
| `reflect-metadata` | Apache-2.0 | No | — |
| `rxjs` | Apache-2.0 | No | — |
| `socket.io` | MIT | No | — |
| `stripe` | MIT | No | SDK oficial. |
| `zod` | MIT | No | — |

### B.2 Frontend (`frontend/package.json`)

| Paquete | Licencia (conocimiento general) | Copyleft | Nota |
|---|---|---|---|
| `next` (16.1.1) | MIT | No | — |
| `react`, `react-dom` (19.2.3) | MIT | No | — |
| `next-auth` | ISC | No | — |
| `next-themes` | MIT | No | — |
| `@radix-ui/*` (checkbox, dialog, dropdown-menu, slot) | MIT | No | — |
| `@tanstack/react-table` | MIT | No | — |
| `@hookform/resolvers`, `react-hook-form` | MIT | No | — |
| `@google/genai` | Apache-2.0 | No | SDK Gemini (frontend). |
| `@mercadopago/sdk-react`, `mercadopago` | MIT | No | [VERIFICAR] SDK oficial MP. |
| `stripe` | MIT | No | — |
| `class-variance-authority`, `clsx`, `tailwind-merge` | MIT | No | — |
| `leaflet` | BSD-2-Clause | No | Conservar aviso BSD. Tiles/datos OSM = **ODbL** (dato, no software) — ver §D. |
| `react-leaflet` | Hippocratic / MIT [VERIFICAR] | **[VERIFICAR]** | Algunas versiones de `react-leaflet` se publicaron bajo variantes; confirmar la de `^5.0.0`. |
| `react-dropzone`, `react-easy-crop` | MIT | No | — |
| `react-icons` | MIT (el paquete) | No | Los **sets de iconos** empaquetados tienen licencias propias (MIT/Apache/CC/SIL OFL según set). Además contradice la regla `CLAUDE.md` de usar solo MCP `icons0` (gobernanza interna, no legal). |
| `recharts` | MIT | No | — |
| `socket.io-client` | MIT | No | — |
| `gsap` (^3.15.0) | **[VERIFICAR]** — históricamente "GreenSock Standard License" (propietaria no-charge); desde 2024 (Webflow) se distribuye libre | **Potencialmente propietaria** | Ver §C.1. |
| `sileo` (^0.1.5) | **[VERIFICAR]** — paquete poco conocido, versión temprana | Desconocida | Ver §C.2 (también riesgo de cadena de suministro). |
| `zod` | MIT | No | — |

### B.3 App móvil (`appmobile/package.json`)

| Paquete | Licencia (conocimiento general) | Copyleft | Nota |
|---|---|---|---|
| `expo` y `expo-*` (constants, device, font, image, image-picker, linking, localization, location, notifications, router, secure-store, splash-screen, status-bar, symbols, system-ui, web-browser) | MIT | No | Plantilla Expo trae `appmobile/LICENSE` MIT (Expo). |
| `@expo/metro-runtime` | MIT | No | — |
| `@react-navigation/native` | MIT | No | — |
| `@tanstack/react-query` | MIT | No | — |
| `react`, `react-dom`, `react-native` | MIT | No | — |
| `react-native-*` (gesture-handler, reanimated, safe-area-context, screens, svg, web, css-interop) | MIT | No | — |
| `nativewind` | MIT | No | — |
| `i18n-js` | MIT | No | — |
| `socket.io-client` | MIT | No | — |
| `tailwindcss` (dev) | MIT | No | — |

> **Obligación de distribución (app móvil):** al publicar el binario en App Store / Play Store se **distribuye** software de terceros. MIT/BSD/Apache-2.0/ISC obligan a **conservar y reproducir los avisos de copyright y de licencia** (típicamente en una pantalla "Licencias / Atribuciones" dentro de la app). Hoy **no existe** esa pantalla ni un `NOTICE` agregado. → **[[DECISION REQUIRED]]** generar y embeber las atribuciones open source antes de publicar la app.

---

## C. Dependencias que requieren verificación explícita

### C.1 `gsap@^3.15.0` (frontend)

- **Hecho:** GSAP tuvo históricamente la "GreenSock Standard License" (uso gratuito para la mayoría de casos, pero **propietaria**, con restricciones para productos donde el usuario final paga por acceder a las animaciones). En 2024, tras la adquisición por Webflow, GSAP (incluidos plugins) se anunció como **gratuito**, migrando hacia licencia más abierta.
- **Riesgo:** Hireeo es un producto **comercial** (planes Premium). Si la versión fijada quedara bajo la licencia propietaria antigua, ciertos usos comerciales podrían requerir una membresía "Business Green". Uso de GSAP visto en repo: animaciones de UI (ver `project_gsap_scrolltrigger_unmount`).
- **[VERIFICAR] / [[DECISION REQUIRED]]:** confirmar el archivo `LICENSE` real dentro de `node_modules/gsap` para la versión `3.15.0` resuelta en el lockfile, y si se usan plugins "de club" (ScrollTrigger es gratuito; SplitText/otros históricamente eran de pago).

### C.2 `sileo@^0.1.5` (frontend)

- **Hecho:** paquete poco conocido, versión `0.x` temprana. No se puede afirmar su licencia desde el `package.json` del proyecto.
- **Riesgo doble:** (a) **licencia desconocida** — no evaluable la compatibilidad; (b) **cadena de suministro** — un paquete `0.1.5` de baja adopción amplía el riesgo de código malicioso/typosquatting o de abandono.
- **[[DECISION REQUIRED]]:** identificar qué provee `sileo`, verificar su licencia y su mantenimiento; evaluar reemplazo o fijado + auditoría.

---

## D. Datos y contenidos con licencia (no software)

| Recurso | Licencia | Implicación | Evidencia |
|---|---|---|---|
| OpenStreetMap (tiles + Nominatim geocoding) | **ODbL** (base de datos) + atribución "© OpenStreetMap contributors" | Requiere **atribución visible**; el mapa admin ya la incluye. El uso de tiles públicos de OSM tiene **política de uso justo** (no apto para producción de alto volumen sin proveedor de tiles propio). | `MapPicker.tsx:64` (atribución presente); `HeroSearchBar.tsx:96-110` (Nominatim, **sin atribución en esa ruta**) |
| Imágenes de placeholder (`images.unsplash.com`, `placehold.co`, `loremflickr.com`) | Variadas (Unsplash License / dominio público / CC) | No apto para producción sin verificar cada imagen; retirar del `remotePatterns`. | `frontend/next.config.ts` (`00-repository-inventory.md §3`) |
| Sets de iconos vía `react-icons` | Por set (MIT/Apache/CC-BY/SIL OFL) | Algunos (CC-BY, OFL) exigen atribución. | `frontend/package.json:50` |

---

## E. Recomendación de proceso (SBOM / NOTICE / aprobación)

Ver detalle en [`01-ip-ownership-and-licensing.md §E`](./01-ip-ownership-and-licensing.md). En síntesis, **antes del lanzamiento**:

1. Generar **SBOM transitivo** (CycloneDX o SPDX) sobre `pnpm-lock.yaml` de los tres paquetes en CI.
2. Escáner de licencias con **denylist** (AGPL/GPL/SSPL/copyleft de red → aprobación explícita) y **allowlist** (MIT/Apache-2.0/BSD/ISC).
3. **`NOTICE` agregado** + pantalla de atribuciones en la app móvil (obligación de distribución MIT/BSD/Apache).
4. **Gate en CI**: dependencia nueva ⇒ revisión de licencia antes de merge. Propietario: Engineering + Legal.

> Criterio de aceptación verificable: SBOM publicado en cada build + política de licencias escrita + pantalla de atribuciones en la app. **Ninguno existe hoy.**

---

## F. Revisión pendiente

Este inventario es **preliminar y no exhaustivo**. Requiere un escaneo SBOM real para confirmar licencias exactas (incluidas transitivas) y para cerrar `gsap`, `sileo`, `react-leaflet` y los sets de `react-icons`. No debe usarse como base de una declaración pública de cumplimiento de licencias.
