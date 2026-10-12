# Diagnóstico de DDD y DRY de hireeo, con la componentización de ChiloéServicios como modelo

Fecha: 2026-10-11. Tarjeta CA-179 (padre CA-178). Autor: Diego Fuentes (Arquitectura y Backend, sector Desarrollo). Solo diagnóstico: no se cambió código en ningún repo, no hay commit, push, rama ni worktree. Este es el único archivo nuevo. El hunk sin commitear de `AGENTS.md` del padre no se tocó.

**Convención de lectura.** **Hecho** es lo comprobado en archivos o en la salida de un comando, con ruta (y línea si aplica). **Opinión** es recomendación, prioridad, costo o diseño propuesto, y no autoriza ningún cambio por sí sola. Cada sección separa las dos cosas. Las rutas del frontend son relativas a `frontend/src/`, las del backend a `backend/src/`, y las de ChiloéServicios llevan el prefijo `chiloe:`.

Escala de costo (**opinión**, orden de magnitud): **S** = un primitivo o un bloque de CSS, 1–2 jornadas; **M** = varios call sites o un contrato, 3–7 jornadas; **L** = modelo nuevo, migración o cambio de negocio, semanas.

## 0. Resumen ejecutivo

**Hechos.**

1. El frontend (`frontend/src`, 238 `.tsx`, 17 `features/`, 300 archivos `.ts/.tsx` en `features/`) respeta bien la separación `app/` → `features/` → `shared/`: `app/` no contiene componentes sueltos (solo `robots.ts` y `sitemap.ts` fuera del routing) y entre features solo hay un ciclo (`services` ↔ `reviews`). Lo que rompe el modelo está en tres capas: `authOptions` vive dentro de un Route Handler y lo importan 30 archivos (8 de `features/` y 2 de `shared/`); `shared/` y `lib/` dependen de `features/geo`, `features/legal` y `features/auth`; y `features/geo` funciona como infraestructura de país (12 features más `shared/` importan `countryUtils`) mezclada con el dominio geográfico (§3.2–3.3).
2. El backend (28 módulos NestJS) no tiene ciclos de módulos ni `forwardRef`, y ningún controller toca Prisma. Pero `PrismaModule` es `@Global` y 18 de 28 módulos consultan tablas de otro dominio directamente, hay 6 copias de la regla «país efectivo del solicitante», la paginación `(page-1)*limit` está escrita a mano en 6 services (15 sitios) y `services.service.ts` (652 líneas) y `auth.service.ts` (636) concentran varias responsabilidades (§3.4–3.5).
3. La duplicación del frontend es de adopción, no de falta de componentes: existen `Btn` (139 usos de `<Btn`), `Field`, `Input`, `Select`, `Pill`, `Avatar`, `DataTable`, `Dialog`, `notify`, `useZodForm`, `countryUtils.formatPrice`, pero conviven con 98 `<button>` a mano en 47 archivos, 343 `style={{…}}` en 84 archivos, 476 `text-[Npx]` en 121 archivos, 13 `confirm(` nativos en 12 archivos (más 1 `alert(`), 19 `window.location.reload()` en 6 archivos y 12 de 21 formularios sin React Hook Form (§4).
4. La fuente de verdad del país está repartida: la tabla `Country` del backend (`backend/prisma/schema.prisma:132`) guarda moneda, locale, huso, pasarela y etiquetas, el frontend las repite en `COUNTRY_CONFIG` (`features/geo/lib/countryUtils.ts:23`) y la lista `['cl','ar','uy','es','us']` está escrita en otros 6 sitios, más el grupo MercadoPago `['cl','ar','uy']` en otros 5 (§3.6). Sumar Paraguay hoy exige revisar más de 10 lugares.
5. ChiloéServicios ya resolvió, para su monolito, casi todas las familias de duplicación que aquí aparecen: un `Btn` con `loading`/`iconOnly`/`link`, `Field` + `Input`/`Select`/`Textarea`/`Checkbox`, `ConfirmDialog`, `useServerAction`, `ActionResult`, `useCrudModals`, `useUrlParams`, guards únicos y un chequeo anti-regresión. hireeo puede tomar el **patrón**, no el archivo, porque su backend es NestJS, su país viene en la URL y su i18n es por diccionario (§5).
6. Línea base: el `build` del frontend pasa y el `lint` de ambos paquetes pasa con advertencias (48 y 10); fallan `tsc`, `test` y `build` del backend, `format:check` de ambos y `tsc` del frontend en frío. Casi todo es **entorno desincronizado** (Prisma Client generado antes del último schema, `ioredis` declarado pero no instalado, `prettier` sin parser de decoradores). Hay una excepción real, de código: `backend/src/modules/upload/upload.service.spec.ts:72` contradice a `upload.service.ts:46-55` (§2.2).

**Opinión.** El orden de consolidación que sostiene este diagnóstico (§6) es: (F0) devolver la línea base a verde y fijar decisiones; (F1) mover infraestructura mal ubicada sin cambio visual (`authOptions`, `countryUtils`, país único); (F2) tokens y primitivos aditivos (U-01…U-08 de la auditoría CA-177); (F3) adopción por familias, empezando por formularios y tablas CRUD (P-01); (F4) backend: helpers de país, paginación y límites de dominio (P-07, P-11); (F5) contenido, SEO y reglas anti-regresión (P-03, P-04, P-10, P-12). Las decisiones de producto P-02, P-05, P-06, P-08, P-09 y U-21 quedan fuera de este plan.

| Criterio de la tarjeta | Dónde está |
| --- | --- |
| 1. Mapa de dominios (frontend y backend), dependencias y violaciones con ruta | §3 |
| 2. Inventario de duplicaciones con ruta y el componente/función único que las reemplaza | §4 |
| 3. Comparación con ChiloéServicios, qué se toma y cómo se generaliza | §5 |
| 4. Plan de consolidación ordenado, cruzado con U-xx/P-xx y con «no debe perder» | §6 |
| 5. Documento fechado en `.doc/`, commit local lo hace el jefe | este archivo |

## 1. Alcance, método y límites

**Hechos.**

- Repos y commits leídos el 2026-10-11:

| Repo | SHA | Nota |
| --- | --- | --- |
| next-atlas-services (padre) | `b48d1b16653f8a686616ac1073765d2bde58a044` | Solo `AGENTS.md` aparece modificado (ajeno). |
| submódulo `frontend` | `d8d8fec273af8de467d1a18fd3a559390f096476` | Sin cambios sin commitear. |
| submódulo `backend` | `fbe918e261616cc54f05a6ce74fc16d16ee6bb8a` | Sin cambios sin commitear. |
| next-chiloeservicios (solo lectura) | `87f5ddbb277adce4c584e38f2b6aab9b471bdca7` | Con su `SearchPageClient.tsx` modificado y archivos sin seguimiento ajenos a esta tarjeta; no se tocó. |

- Método: lectura estática y conteos con `rg`/`grep`; un script de Node (apéndice A) resuelve los `import` de `frontend/src` (alias `@/` y relativos) y produce el grafo capa→capa y feature→feature; un segundo script marca archivos sin importadores. El mapa del backend lo levantó un agente de exploración de solo lectura; antes de usarlo verifiqué por muestreo más de 20 de sus afirmaciones contra el código (todas coincidieron). El resto del backend queda como «reportado por el agente, no re-verificado línea a línea».
- Las auditorías previas (CA-177 `.doc/2026-10-11-brechas-de-hireeo-respecto-de-chiloeservicios.md` y su inventario en `chiloe:.doc/2026-10-11-auditoria-componentes-chiloeservicios-vs-atlas-hireeo.md`) **no se rehicieron**: este documento las cita por ID (U-xx, P-xx) y agrega el eje que ellas no cubrieron: dominios, dependencias y duplicación de lógica entre capas.
- Los docs de Chiloé leídos: `AGENTS.md`, `.doc/plan/01-dry-audit.md`, `02-component-consolidation.md`, `03-ui-and-design-system.md`, `06-nextjs-and-architecture.md`, `07-refactor-roadmap.md`, `.doc/realizados/homologacion-formularios.md` y `dry-homologacion-admin-perfil.md`. Los conteos de esos planes son de 2026-09-09/10 (HEAD anterior); lo que Chiloé tiene **hoy** lo comprobé en su `src/` (§5.1).

**Límites (hechos).** No se renderizó ninguna pantalla ni se consultó producción. No se ejecutaron los tests E2E de Playwright (requieren frontend y backend levantados). No se auditó el cumplimiento jurídico ni el rendimiento. Los conteos de `style={{`, `text-[Npx]` y colores excluyen `app/design-system/**` (página de documentación) salvo que se diga lo contrario. `app/design-system` tiene 11 archivos.

**Incidente de entorno (hecho).** Al correr `pnpm exec tsc --noEmit` dentro de `frontend/`, pnpm sincronizó `node_modules` por su verificación previa a la ejecución (`+19 −18` paquetes: `next` 16.1.1→16.3.3, `next-auth` 4.24.15→4.24.13, `vercel` 54.21.1→54.14.2, se quitó `react-icons`). `frontend/package.json:42-43` declara `next` `16.3.3` y `next-auth` `^4.24.13`, así que `node_modules` estaba desfasado del `package.json` antes de mi corrida. No cambió ningún archivo versionado (`git status` limpio en los tres repos salvo `AGENTS.md`). Los demás comandos corrieron sobre ese estado. Queda registrado como decisión en la tarjeta.

## 2. Línea base de verificación (sin cambiar código)

Orden pedido: type-check → test → lint → format:check → build. Salida completa en el scratchpad de la sesión; aquí el resultado tal cual.

### 2.1 Frontend (`frontend/`)

| Script | Existe | Resultado (hecho) |
| --- | --- | --- |
| type-check | No hay script. Se usó `pnpm exec tsc --noEmit` | 1.ª corrida: exit 2, 4 errores TS2307 en `.next/types/validator.ts` (líneas 152, 323, 458, 566) que apuntan a páginas que ya no existen: `config/sponsors`, `admin/sponsors`, `contact`, `api/payments/stripe-session`. Tras `pnpm build`, 2.ª corrida: exit 0, 0 errores. |
| test | No hay `test`. Solo `test:e2e` y variantes (Playwright, 8 specs en `frontend/tests/e2e/`) | No ejecutado: necesita frontend y backend levantados. |
| lint | `biome check src/` | exit 0, 48 advertencias, 0 errores. El log muestra 20 y omite 28 («Diagnostics not shown: 28»). Ejemplos: `tienePremium` sin uso en `app/(country)/[country]/(account)/profile/favorites/page.tsx:39` y `profile/leads/page.tsx:45`; `<svg>` sin título en `profile/leads/page.tsx:191`. |
| format:check | `prettier --check .` | exit 1: `sh: prettier: command not found`. `prettier` existe en `node_modules/.bin/` del raíz del monorepo pero no en el de `frontend/`. No se verificó formato. |
| build | `pnpm clean && next build` | exit 0, `✓ Compiled successfully in 3.9s`, 67 rutas. El log trae ruido: `fetch failed` (backend apagado) y `Dynamic server usage: Route /[country]/admin couldn't be rendered statically because it used headers` impreso por los `catch` de las queries («Error fetching admin services», «Error al obtener usuarios paginados», «Error obteniendo interacciones»). |

### 2.2 Backend (`backend/`)

| Script | Existe | Resultado (hecho) |
| --- | --- | --- |
| type-check | No hay script. Se usó `pnpm exec tsc --noEmit -p tsconfig.json` | exit 2, 88 errores. Concentrados en `modules/auth/auth.service.ts` (22), `kyc.service.ts` (12), `moderation.service.ts` (9), `data-subject-requests.service.ts` (6), `subscriptions.service.ts` (5), `professional-credentials.service.ts` (5), `jwt.strategy.ts` (4). |
| test | `node --test … 'src/modules/**/*.spec.ts' 'src/common/guards/**/*.spec.ts'` | exit 1: 325 pruebas, 312 pasan, 13 fallan. 12 archivos de spec no compilan (`Unable to compile TypeScript` ×12: `ai-agents`, `auth`, `escrow`, `interactions`, `kyc` ×2, `quotes`, `ratings`, `service-requests`, `services`, `subscriptions`, `users`) y 1 falla por aserción: `modules/upload/upload.service.spec.ts:72` («rechaza un mimetype de documento aunque el tamaño sea válido») espera un rechazo, pero `modules/upload/upload.service.ts:46-55` acepta PDF (`isPdf`, límite propio). **Este último es un fallo real, no de entorno**: spec y código divergen (el módulo `professional-credentials` incorporó PDFs en `d35fb18`); no se determinó cuál de los dos está desactualizado. |
| lint | `biome check src/` | exit 0, 10 advertencias (`noNonNullAssertion` ×4, `noInferrableTypes` ×4, `noConsole`, `useNumberNamespace`, `useNodejsImportProtocol`). |
| format:check | `prettier --check "src/**/*.{ts,json}"` | exit 2: «Error occurred when checking code style in 160 files». Cada error es `SyntaxError: This experimental syntax requires enabling one of the following parser plugin(s): "decorators", "decorators-legacy"`. |
| build | `nest build && tsc-alias …` | exit 1, 86 errores de TypeScript (los mismos del type-check). |

**Causa de los fallos de TypeScript del backend (hecho).** `backend/prisma/schema.prisma:215` define `tokenVersion` y existe la migración `prisma/migrations/20260824145431_add_user_token_version`, pero el Prisma Client generado en `node_modules/.pnpm/@prisma+client@7.9.0…/node_modules/.prisma/client/index.d.ts` no contiene `tokenVersion` (0 coincidencias) ni exporta `KycStatus`; los errores piden también `emailVerified`, `escrowStatus`, `transactionId`, `countryId` y `countryId_slug`. Además `backend/package.json:51` declara `ioredis` `^6.0.0` y `src/common/throttler/redis-throttler.storage.ts:3` lo importa, pero el módulo no está instalado. Es decir: el cliente generado y las dependencias son anteriores al código.

**Opinión.** Esto no se arregla en esta tarjeta (no se toca código ni entorno), pero es el **primer paso de cualquier tarjeta siguiente**: `pnpm install` desde la raíz del monorepo (nunca dentro de `frontend/` ni `backend/`) y `pnpm db:generate`; luego repetir esta tabla. Los fallos de `format:check` son de configuración (Prettier sin parser de decoradores en el backend; `prettier` fuera del `PATH` del workspace del frontend) y conviene tratarlos como un hallazgo propio, no como deuda de formato del código. Que `lint` pase con 48 y 10 advertencias y `tsc` falle indica que Biome no está haciendo de red de seguridad de tipos.

**Otros hallazgos menores de higiene (hechos).** Archivos sueltos versionados en la raíz de los submódulos: `frontend/migrate_buttons.js`, `frontend/migrate_links.js`, `frontend/server.log`; `backend/check-countries.ts`, `backend/find_images.js`, `backend/generate_image_map.ts`, `backend/test-prod.ts`, `backend/unsplash_results.json` (`git ls-files`).

## 3. Mapa de dominios y violaciones (criterio 1)

### 3.1 Frontend: estructura y reglas

**Hechos.**

- Capas: `app/` (routing), `features/<dominio>/` (17), `shared/` (`components`, `lib`, `schemas`, `types`), `lib/` (`api`, `i18n`, `providers`) y `proxy.ts`.
- Convención `Componente/Componente.tsx`: se cumple en `features/` y `shared/` salvo 3 archivos: `shared/components/icons/index.tsx` (barrel permitido), `shared/components/ui/checkbox/Checkbox.tsx` y `shared/components/ui/table/Table.tsx`. Hay un solo `index.tsx` en todo `src/`.
- Cada feature con datos usa `actions/{queries,mutations}.ts` y 38 archivos llevan `'use server'`. Los Route Handlers son 5: `app/api/upload`, `revalidate`, `auth/[...nextauth]`, `webhooks/mercadopago`, `webhooks/stripe`.
- Archivos sin ningún importador (segundo script, incluye cadenas de archivos solo importados por muertos): 3, `features/users/components/account/UserShell/UserShell.tsx`, `features/configuration/countries/actions/index.ts` y `features/contact/actions/index.ts`.
- Reglas del proyecto que el código incumple a gran escala: «imports absolutos, evitar `../` múltiples» (98 imports con `../../` o más en 80 archivos) y «NUNCA `any`» (20 usos de `any`, 48 `biome-ignore`).

### 3.2 Frontend: mapa de features y dependencias

Aristas = sentencias `import` de un feature hacia otro (script del apéndice A). «Archivos» cuenta `.ts/.tsx`.

| Feature | Archivos | Depende de (imports) | Lo usan (features) | Imports desde `app/` |
| --- | ---: | --- | --- | ---: |
| `geo` | 8 | — | 11 features + `shared/` | 25 |
| `services` | 65 | geo 22, contact 3, reviews 2, favorites 2, payments 2, analytics 1, auth 1, categories 1, chat 1, legal 1 | home, reviews, users | 23 |
| `users` | 28 | geo 4, services 2, contact 1 | admin | 35 |
| `legal` | 79 | geo 2 | chatbot, configuration, home, integrations, services | 46 |
| `payments` | 18 | geo 6, configuration 1 | services | 11 |
| `auth` | 21 | geo 2 | services | 12 |
| `configuration` | 10 | geo 5, legal 4 | payments | 14 |
| `home` | 11 | geo 5, categories 2, services 1, legal 1 | — | 3 |
| `categories` | 8 | geo 1 | chatbot, home, services | 10 |
| `chat` | 8 | geo 2, contact 1 | services | 8 |
| `admin` | 6 | users 4, geo 3 | — | 7 |
| `analytics` | 9 | — | services | 13 |
| `integrations` | 9 | legal 2 | — | 2 |
| `reviews` | 8 | services 1 | services | 4 |
| `contact` | 5 | geo 1 | chat, services, users | 2 |
| `chatbot` | 4 | categories 1, legal 1 | — | 1 |
| `favorites` | 3 | — | services | 2 |

**Hechos sobre el grafo.**

- `geo` es el hub: `features/geo/lib/countryUtils` lo importan `admin`, `auth`, `categories`, `chat`, `configuration`, `contact`, `home`, `legal`, `payments`, `services`, `users` y `shared/`; `features/geo/hooks/useCountryLink` lo importan `chat`, `home`, `legal`, `services`, `users` y `shared/`. `features/geo/actions`, `LocalitySelect`, `geoTypes` y `postalCodes` son los consumos de dominio geográfico propiamente dicho.
- Único ciclo: `services` → `reviews` → `services`. Aristas: `features/services/components/detail/ReviewToggleForm/ReviewToggleForm.tsx` → `reviews/actions`; `features/services/components/detail/ServiceReviewsList/ServiceReviewsList.tsx` → `reviews/components/OwnerReplyForm/OwnerReplyForm`; `features/reviews/components/admin/CalificacionForm/CalificacionForm.tsx` → `services/actions`.
- `services` es un hub de saliente: compone UI y acciones de 10 features (el wizard `features/services/publish/` importa `payments/components/PaymentBrickWrapper`, `payments/actions`, `categories/actions` y `auth/components/OAuthBrandIcons`).

### 3.3 Frontend: violaciones de dominio y de capa

| ID | Hecho (con ruta) | Regla o contrato que rompe |
| --- | --- | --- |
| DV-F01 | `authOptions` se define en `app/api/auth/[...nextauth]/route.ts:194` (el handler son 259 líneas) y lo importan **30 archivos**: 20 de `app/`, 8 de `features/` (`analytics/actions/mutations.ts`, `auth/actions/queries.ts`, `configuration/legal-documents/actions/mutations.ts`, `contact/actions/mutations.ts`, `integrations/actions/mutations.ts`, `integrations/actions/queries.ts`, `services/publish/actions/mutations.ts`, `users/actions/mutations.ts`) y 2 de `shared/` (`shared/lib/auth/getAuthToken.ts:3`, `shared/types/auth.d.ts`). | Un Route Handler no debería exportar configuración que importan features; `features/` y `shared/` no deben depender de `app/`. |
| DV-F02 | 11 sitios de `features/*/actions` (más 20 archivos de `app/`) llaman `getServerSession(authOptions)` directo (p. ej. `features/integrations/actions/queries.ts:12,34`, `features/auth/actions/queries.ts:11,19`, `features/users/actions/mutations.ts:40`, `features/services/publish/actions/mutations.ts:90,152`) mientras otros 27 archivos de acciones usan `getAuthToken()` (`shared/lib/auth/getAuthToken.ts`). | Dos formas de leer la sesión en el mismo tipo de archivo. |
| DV-F03 | `shared/` depende de `features/` y de `app/`: `shared/components/layout/Navbar/Navbar.tsx` y `Footer/Footer.tsx` y `shared/components/CookieConsent/CookieConsent.tsx` → `features/geo/hooks/useCountryLink`; `Navbar.tsx` y `shared/lib/utils.ts` → `features/geo/lib/countryUtils`; `shared/lib/ai/geminiService.ts` → `features/legal/lib/aiTransparency`; `shared/lib/auth/getAuthToken.ts` → `app/api/auth/...`. Además `lib/providers/Providers.tsx` → `features/auth/components/SessionGuard`. | «`shared/` reutilizable, CERO lógica de dominio» (`~/.claude/rules/nextjs.md`). |
| DV-F04 | Lógica de dominio dentro de `shared/lib`: `shared/lib/utils.ts:10-17` `calcularIngresoNeto` aplica una comisión de MercadoPago de 3,19 % (y 19 % de IVA si `countryCode === 'cl'`) para todos los países, aunque `es` y `us` cobran por Stripe; el propio comentario dice «el resto de países queda pendiente de cálculo backend». `shared/lib/ai/geminiService.ts` es el cliente de los endpoints de IA y lo consumen solo `chatbot` y `services/publish`. | Regla de cobro/comisión en el frontend; IA es dominio de `chatbot`/`services`. |
| DV-F05 | `features/geo` mezcla infraestructura de país (`lib/countryUtils.ts`, `hooks/useCountryLink.ts`: moneda, locale, huso, enlaces, SEO) con dominio geográfico (`actions/queries.ts`, `LocalitySelect`, `types/geoTypes.ts`, `lib/postalCodes.ts`). 12 features + `shared/` importan solo la parte de infraestructura. | Es infraestructura transversal, no un dominio de negocio. |
| DV-F06 | `features/payments/actions/queries.ts` importa `features/configuration/countries/actions/queries`: los pagos leen países desde la sub-área de administración de configuración, no desde `geo`. Además `features/configuration` agrupa `countries` y `legal-documents`, que son administración de dos dominios (`geo`/`legal`), no un dominio propio. | Un dominio lee el CRUD de administración de otro. |
| DV-F07 | `features/users/actions/privacyRequests.ts` importa `features/contact/schemas/contactSchemas`; `features/chat/components/ChatWindow/ChatWindow.tsx` y 3 componentes de `services/components/detail/*` importan `features/contact/lib/reportLink`. El flujo de privacidad y denuncia está repartido entre `users`, `contact` y `legal`. | Un dominio (derechos del titular, denuncia) sin dueño único; el backend sí lo tiene (`modules/data-subject-requests`, `modules/moderation`). |
| DV-F08 | `features/users/components/account/` repite el shell de cuenta (`UserSidebar` 344 líneas, `UserShell` 27) y `features/admin/components/AdminSidebar` (332 líneas) hace lo propio con la misma estructura (menú de cuenta con `useRef` + `mousedown`, `signOut`, ítems con `isActiveLink`). `UserShell` no tiene importadores (script del apéndice A). | Dos shells casi iguales; código muerto. |
| DV-F09 | `app/` casi limpio, con matices: `app/(country)/[country]/(public)/(estaticas)/how-it-works/page.tsx` (248 líneas) define 4 componentes locales y `…/(account)/profile/verification/page.tsx` (412 líneas) define 2. | «`app/` SOLO routing». Es leve. |
| DV-F10 | Modelo de dominio con dos idiomas: `shared/types/common.ts` declara `User.role: 'usuario' \| 'proveedor' \| 'admin'` y `Service` con campos mezclados (`comuna` marcado `@deprecated`, `commune`, `redesSociales`, `nombreContacto`) mientras el backend usa `roles`, `commune`, `socialNetworks`, `contactName`. 43 de 84 funciones exportadas en `features/*/actions` tienen prefijo verbal en español (`crearCalificacion`, `actualizarPerfil`, `eliminarUsuario`…). Cuenta solo `export function`; las `export const … = cache(…)` no entran. | El código va en inglés (`~/.claude/CLAUDE.md`). |
| DV-F11 | El contrato con el backend se mantiene a mano: `lib/api/backendTypes.ts` (152 líneas) y 511 líneas en `features/*/types/`, mientras el backend ya publica Swagger (`backend/src/main.ts:4,80-82`). Cada feature remapea el DTO a su modelo (`mapServiceDto`/`mapServiceDetailDto` en `features/services/actions/queries.ts:34,67`, `redesSociales` remapeado en `:59`, `:81`, `:250` y en `features/users/actions/queries.ts:166`; `isPremium: s.featured && s.level === 'PREMIUM'` en `services/actions/queries.ts:54` y `favorites/actions/queries.ts:63`). | Regla «Contract-First» del `CLAUDE.md` del proyecto. |

**Positivos (hechos).** `app/` no contiene componentes de dominio sueltos; el grafo entre features es casi un DAG (un ciclo); los 17 features siguen el patrón `actions`/`components`/`schemas`/`types`; la sesión se valida server-side y el API key no sale al navegador (`lib/api/apiClient.ts`, `API_KEY` solo `typeof window === 'undefined'`); `apiClient` ya reintenta solo errores transitorios y nunca mutaciones (AUD-30).

**Opinión.** DV-F01 es la violación de mayor palanca y menor costo: mover `authOptions` a `features/auth/lib/` y dejar el handler en `NextAuth(authOptions)`, como hizo Chiloé (`chiloe:AGENTS.md` sección «Autenticación»: «`authOptions` vive en `src/features/auth/lib/auth.ts`»). DV-F05 se resuelve sacando `countryUtils` y `useCountryLink` a `lib/country/` (infraestructura, junto a `lib/providers/CountryProvider`) y dejando en `features/geo` solo regiones, localidades, geocodificación y selects. DV-F04 pertenece al backend (comisión y neto por pasarela y país). DV-F07 se ordena asignando `privacy` y `reports` a un dominio con nombre. DV-F06 se corrige leyendo países desde `geo`.

### 3.4 Backend: mapa de módulos y dependencias

**Hechos** (agente de exploración, con muestreo verificado; rutas relativas a `backend/src`).

- 28 módulos en `modules/`. `prisma/prisma.module.ts:5` es `@Global`, por lo que cualquier módulo inyecta `PrismaService` sin importarlo. No hay `forwardRef` ni ciclos: es un DAG.
- Aristas entre módulos (de `imports: [...]`): `ai-agents` → categories, services, geo, integrations; `auth` → email, integrations; `chatbot` → categories, integrations; `data-subject-requests` → email; `email` → integrations; `escrow` → payments; `interactions` → services; `kyc` → integrations; `notifications` → integrations; `payments` → integrations; `ratings` → services; `subscriptions` → services, prices, payments; `upload` → integrations. Sumideros: `integrations`, `geo`, `categories`, `prices`, `services`.
- Tamaño (LOC sin spec): `integrations` 1572, `services` 996, `users` 926, `auth` 894, `geo` 836, `subscriptions` 715, `payments` 680, `chatbot` 529, `kyc` 498, `categories` 462.
- Acoplamiento que no figura en `imports`: `subscriptions/subscriptions.service.ts:17` importa `QUOTE_REFERENCE_PREFIX` de `escrow/escrow.service.ts:7`; `subscriptions.service.ts:460-479` (`applyQuoteEscrowEvent`) actualiza `quote` directamente (lógica de escrow dentro de suscripciones).
- Tests: 34 specs bajo `modules/` más 6 en `common/`; todos son de service o gateway; no hay specs de controller ni e2e. Sin ningún spec: `data-subject-requests`, `fiscal-profiles`, `legal-document-reviews`, `moderation`, `professional-credentials`. `payments.service.ts`, `kyc.policy.ts`, `chat.gateway.ts` y `auth/strategies/*` tampoco tienen spec propio (no hay `*.e2e-spec.ts` ni `test/`).

### 3.5 Backend: violaciones de dominio y de capa

| ID | Hecho (ruta:línea) | Regla que rompe |
| --- | --- | --- |
| DV-B01 | 18 de 28 módulos consultan Prisma sobre modelos de otro dominio en vez de pasar por el service dueño. Ejemplos: `modules/ai-agents/tools/service-requests.tool.ts:19-38` (crea `serviceRequest` y `quote`, lee `serviceCategory`, `country`, `service`); `crm/crm.service.ts:14,30,46` (solo `quote` y `serviceRequest`, sin modelo propio); `escrow/escrow.service.ts:22,53,83,96` (`quote`, `country`); `moderation/moderation.service.ts:193,200,207` (`service`, `rating`, `message`); `users/users.service.ts:153,353,465` (`service`, `country`, `deviceToken`); `subscriptions/subscriptions.service.ts:204,219,430,467,479` (`service`, `country`, `quote`); `kyc/kyc.service.ts:92,120,138,195,222` y `auth/auth.service.ts` (19 accesos) sobre `user`. `deviceToken` lo escribe `users/users.service.ts:465` y lo lee y borra `notifications/notifications.service.ts:44,102`: no tiene dueño único. | «Todo acceso a DB en el Service del dominio» y un dominio no debe tocar tablas ajenas. |
| DV-B02 | Accesos a Prisma fuera de un service: `chat/chat.gateway.ts:41,57` y `auth/strategies/jwt.strategy.ts:13,23` (`prisma.user.findUnique`). Controllers con Prisma: ninguno. | Menor; gateway y estrategia son infraestructura. |
| DV-B03 | `process.env` fuera de `config/`: `modules/chat/chat.gateway.ts:25` (`process.env.FRONTEND_URL` en el decorador `@WebSocketGateway`), `modules/integrations/env-fallback.ts:9-51` (~25 lecturas de claves de proveedores) y `main.ts:17,28,101` (`NODE_ENV`, `VERCEL`). | «NUNCA `process.env` directamente — usar `ConfigService`». `main.ts:9` ya usa `resolveFrontendUrl`, que `chat.gateway.ts` no usa. |
| DV-B04 | Services con varias responsabilidades: `services/services.service.ts` (652 líneas) = slugify (`:20`), búsqueda por radio con SQL crudo (`:42`, `:573`), listado público, detalle, listado admin, resolución de región/localidad (`:361`), CRUD y ownership, recálculo de calificaciones (dominio `ratings`, `:572`), toggles y fechas; `auth/auth.service.ts` (636) = registro, login, refresh, olvido de contraseña con envío de email, login social ×3 y verificación de JWT de Microsoft. Cerca del límite: `users/users.service.ts` (543), `subscriptions/subscriptions.service.ts` (536). | Un service = un dominio y una responsabilidad; funciones pequeñas. |
| DV-B05 | Lógica en controllers: `geo/geo.controller.ts:134-135` (chequeo de rol y país con `ForbiddenException`), `upload/upload.controller.ts:37-51` (validación, sanitización de `folder` con regex y orquestación), parseo de paginación con clamp a 100 y defaults distintos en 6 controllers (`interactions.controller.ts:53-54`, `chat.controller.ts:45-46`, `subscriptions.controller.ts:42-43`, `users.controller.ts:61-62`, `categories.controller.ts:55-56`, `services.controller.ts:51-52`). | «Controllers delgados, DTO con class-validator». |
| DV-B06 | Dominio en `common/`: `common/utils/resolve-provider-country.ts:15` consulta `prisma.service` y la usan `quotes` y `escrow`; `common/utils/where-service-country.ts` es un filtro específico de `ratings`, `interactions` y `subscriptions`. `common/guards/upload-throttler.guard.ts` solo lo usa `upload.module.ts:13`. | `common/` debe ser transversal. |
| DV-B07 | Subsistema de país duplicado en servicios: el lookup «país por código + 404» está escrito en 10 sitios (`geo/geo.service.ts:41-54,111`, `geo/location-resolver.service.ts:58-62`, `services/services.service.ts:395-400`, `service-requests/service-requests.service.ts:23-28`, `categories/categories.service.ts:256-261`, `users/users.service.ts:353-361`, `prices/prices.service.ts:45`, `ai-agents/tools/service-requests.tool.ts:22`, `escrow/escrow.service.ts:53`, `subscriptions/subscriptions.service.ts:219`) con 4 mensajes distintos, aunque `GeoService` ya expone el lookup (`geo/geo.service.ts:41-54`). | Dueño único del dominio país: `geo`. |

**Opinión.** El backend está mejor ordenado que el frontend en dependencias (DAG sin ciclos), pero el `@Global` de Prisma convierte en invisible el acoplamiento por tablas: DV-B01 es el síntoma. Para un marketplace multi-país el dominio `country` debería tener un único dueño (`geo`), con `requireCountry()` y `assertPaymentsEnabled()` como API; `services` debería ceder `ratings` y dejar de recalcular calificaciones. No recomiendo una capa «repository» ni partir en microservicios (YAGNI): basta con rutas de lectura nombradas en el service dueño y un `PaginationQueryDto`.

### 3.6 Fuentes de verdad de país (transversal frontend + backend)

**Hechos.**

| Dato | Dónde está | Ruta |
| --- | --- | --- |
| País con moneda, locale, huso, pasarela, etiquetas, `active`, `paymentsEnabled` | Tabla `Country` | `backend/prisma/schema.prisma:132-157` |
| Lo mismo, hardcodeado | `COUNTRY_CONFIG` (5 países) y `COUNTRY_SEO_CONFIG` | `frontend/src/features/geo/lib/countryUtils.ts:23`, `:81` |
| Lectura desde DB con respaldo hardcodeado | `getCountryConfig` + `FALLBACK_CONFIGS` | `frontend/src/features/geo/actions/queries.ts:9,25-33` |
| Respaldo de CL duplicado | `FALLBACK_CONFIG` | `frontend/src/features/admin/components/CountryScopeSelector/CountryScopeSelector.tsx:28-38` |
| `formatPrice`/`formatDate` usan solo el hardcodeado (`COUNTRY_CONFIG[code] ?? COUNTRY_CONFIG.cl`) | `countryUtils.ts:135`, `:145` | — |
| Lista `['cl','ar','uy','es','us']` | `proxy.ts:8`; `app/page.tsx:4`; `features/auth/lib/detectCountryHeaders.ts:3`; `features/auth/schemas/authSchemas.ts:3`; `app/api/webhooks/stripe/route.ts:7`; `backend/src/modules/auth/dto/register.dto.ts:12` | — |
| Grupo MercadoPago `['cl','ar','uy']` | `backend/src/modules/payments/payments.service.ts:17`; `payments/gateways/mercadopago.gateway.ts:20`; `integrations/providers/integration-providers.ts:43,55`; `frontend/src/features/payments/components/PaymentBrick/PaymentBrick.tsx:24` (`MP_LOCALES`) | — |
| Prefijos telefónicos por país | `frontend/src/shared/components/ui/PhoneInput/PhoneInput.tsx:7` (5 países) y `countryUtils.ts` (`phonePlaceholder`) | — |

**Opinión.** El `CLAUDE.md` del proyecto anota Paraguay (`py`) como pendiente. Con el estado actual, agregarlo implica revisar más de 10 lugares y varios son lógica (proxy, pasarela, esquema de registro, teléfono). La corrección de fondo es **una** fuente (la tabla `Country`, expuesta por `GET /geo/countries`) y un único helper de lectura en el frontend, con `COUNTRY_CONFIG` reducido a respaldo de arranque. Esto es lo que habilita la generalización que pide la visión de Edgardo (§5.3).

## 4. Inventario de duplicaciones (criterio 2)

Cada fila es un **hecho** con ruta y, a la derecha, el **reemplazo único** que se propone (**opinión**) con su ruta destino. IDs: `DUP-C` componentes, `DUP-L` lógica, `DUP-S` estilos, `DUP-B` backend. La columna «CA-177» enlaza con las brechas U-xx / P-xx que ya existen; «nueva» indica que la auditoría CA-177 no la había listado.

### 4.1 Componentes

| ID | Hecho (ruta:línea) | Reemplazo único | CA-177 |
| --- | --- | --- | --- |
| DUP-C01 | **Botones a mano.** 98 `<button` en 47 archivos (sin contar `hireeo/` ni `design-system`) frente a 139 `<Btn`. Mayores: `features/chat/components/ChatMensajes/ChatMensajes.tsx` (6), `features/services/components/search/FiltersSidebar/FiltersSidebar.tsx` (5), `features/payments/premium/components/PreciosPorDuracion/PreciosPorDuracion.tsx` (5), `ServiciosTable.tsx` (4), `HeroSearchBar.tsx` (4), `CategoriaForm.tsx` (4), `AdminSidebar.tsx` (4). `Btn` (`shared/components/hireeo/Btn/Btn.tsx`) no tiene `loading`, `iconOnly` ni `link`. | `Btn` ampliado de forma aditiva con `loading` (`aria-busy`), `iconOnly` (con `aria-label` obligatorio en el tipo) y `variant="link"`; el spinner con SVG propio de `hireeo/Icon`. Los controles que no son botones de acción (tabs, ítems de menú, triggers de desplegable) se quedan como `<button>`; esa clasificación es la primera tarea de la migración. | U-02 |
| DUP-C02 | **Campos crudos.** `<input` en 22 archivos fuera de `shared/` (algunos `checkbox`/`file`/`hidden`); `<select` en `features/services/components/forms/shared/SocialNetworksInput/SocialNetworksInput.tsx:66`, `search/SearchHeader/SearchHeader.tsx:77,91`, `search/ResultsHeader/ResultsHeader.tsx:160`, `publish/components/Paso2TuOficio/Paso2TuOficio.tsx:675`; `<textarea` en `OwnerReplyForm.tsx:51`, `CalificacionForm.tsx:174`, `Paso2TuOficio.tsx:440`, `ChatWindow.tsx:165`, `ServicioFormBase.tsx:362`, `ReviewToggleForm.tsx:223`, `ChatIA.tsx:91`. No existe `Textarea` en `hireeo/`. | `Field` + `Input`/`Select` (ya existen) + `Textarea` nuevo en `shared/components/hireeo/Textarea/Textarea.tsx`; variantes ligadas a RHF en `shared/components/Form/Form.tsx` (`FormTextarea` ya existe en `:100`). | U-11, P-01 |
| DUP-C03 | **Formularios sin React Hook Form.** De 21 archivos con `<form>` fuera de `Form.tsx`, 9 usan `useZodForm` (`LoginPage`, `RegisterPage`, `CountryForm`, `SupportRequestForm`, `IntegrationForm`, `QuoteForm`, `AddressForm`, `PrivacyCenter`, `AdminPasswordForm`) y 12 no: `AdminProfileForm`, `ForgotPasswordForm`, `CategoriaForm`, `ChatMensajes`, `PrecioPremiumForm`, `CalificacionForm`, `Paso1DatosUsuario`, `Paso2TuOficio`, `UsuarioForm`, `AjustesPerfilForm`, `FiscalDataForm`, `LicenseCredentialsForm`. | `useZodForm` + `Form` + `FormInput/FormTextarea/FormSelect/FormToggle` (`shared/components/Form/Form.tsx:25,43,69,100,151,200`). | P-01 |
| DUP-C04 | **Checkbox ×3 y Términos ×3.** `shared/components/ui/checkbox/Checkbox.tsx` (Radix, un solo consumidor: `DataTable.tsx`); `features/auth/components/CheckboxInk/CheckboxInk.tsx` (un solo consumidor: `RegisterPage.tsx`); `<input type="checkbox">` crudo en `AddressForm.tsx`, `Paso1DatosUsuario.tsx`, `Paso2TuOficio.tsx`, `ServicioFormBase.tsx`. El «Acepto los Términos» está escrito en `Paso1DatosUsuario.tsx:286-302` (con diccionario `t.terms*`), `Paso2TuOficio.tsx:734` y `RegisterPage.tsx:213-217` (texto fijo «Términos»). | Un `Checkbox` con `label`/`description`/`error` sobre Radix y un `TermsCheckbox` (texto y enlace por país desde el diccionario). | U-11, P-12 |
| DUP-C05 | **Dos envoltorios de Radix Dialog.** `shared/components/admin/Modal/Modal.tsx` (50 líneas, `z-[100]`, `max-w-4xl` fijo, 11 importadores) y `shared/components/Dialog/Dialog.tsx` (con `size`, 3 importadores: `CookieConsent`, `AdminCrudTable`, `IntegrationCard`); además `fixed inset-0` propio en `features/services/components/search/SearchPageClient/SearchPageClient.tsx`. | `Dialog` con `size` como único; `Modal` queda como alias fino (decisión). Añadir `ConfirmDialog`/`useConfirm` encima. | U-07, U-20 |
| DUP-C06 | **Confirmaciones nativas.** 12 `confirm(` en 11 archivos: `CalificacionesTable.tsx:80`, `CalificacionForm.tsx:75`, `PreciosPorDuracion.tsx:443,473`, `PreciosPremiumTable.tsx:115`, `CategoriasTable.tsx:77`, `IntegrationCard.tsx:85`, `ServiciosTable.tsx:108`, `MisServicios.tsx:218`, `MyAddresses.tsx:36`, `UsuariosTable.tsx:91`, `UserAddressesModal.tsx:45`; más `window.confirm` y `alert(` en `features/services/components/profile/MyServiceItem/MyServiceItem.tsx:30,43`. Textos fijos en español. | `ConfirmDialog` + `useConfirm()` sobre `Dialog`, con título y mensaje desde el diccionario. | U-07 |
| DUP-C07 | **Esqueleto CRUD de tablas.** 6 tablas repiten el trío `isCreateModalOpen/isEditModalOpen/selected` + `handleDelete` (`confirm → setIsDeleting → try/catch → notify → window.location.reload()`) + `handleToggleActivo` + `handleSuccess`: `CategoriasTable.tsx:55-118`, `ServiciosTable.tsx:94-161`, `UsuariosTable.tsx:78-115`, `PreciosPremiumTable.tsx:107-153`, `CalificacionesTable.tsx`, `MisServicios.tsx`. 19 `window.location.reload()` en `ServiciosTable` (4), `CategoriasTable` (3), `PreciosPorDuracion` (4), `PreciosPremiumTable` (3), `UsuariosTable` (2), `CountriesTable` (3: `:82`, `:104`, `:160`). Hay además `shared/components/admin/AdminCrudTable/AdminCrudTable.tsx` (152 líneas, 1 consumidor: `CountriesTable`) que pagina en cliente, mientras `DataTable` pagina por URL (`useDataTable.ts`). | `useCrudModals<T>()` + `useServerAction(action, { refresh: true })` + `ConfirmDialog`; `DataTable` como única tabla. No se recomienda ampliar `AdminCrudTable` (§5.2). | P-01 (adopción), U-07 |
| DUP-C08 | **Click-afuera ×6.** `shared/components/ui/PhoneInput/PhoneInput.tsx:76-77`, `shared/components/ui/ShareButton/ShareButton.tsx:32-33`, `features/admin/components/AdminScopeSwitcher/AdminScopeSwitcher.tsx:42-43`, `features/admin/components/AdminSidebar/AdminSidebar.tsx:134-135`, `features/users/components/account/UserSidebar/UserSidebar.tsx:250-251`, `features/services/publish/components/CategoriaMultiSelect/CategoriaMultiSelect.tsx:48-49` (cada uno un `useEffect` con `mousedown`). Ya existe `shared/components/DropdownMenu/DropdownMenu.tsx` (Radix). | Radix `DropdownMenu` para los menús de cuenta y de alcance; `useClickOutside` (nuevo, `shared/hooks/`) para el resto. | nueva (≈ DRY-015 de Chiloé) |
| DUP-C09 | **Dos shells de panel.** `AdminSidebar` (332 líneas) y `UserSidebar` (344) repiten menú de cuenta, `signOut`, ítem activo y modal de perfil; `UserShell` (27 líneas) no tiene importadores; `ConfigPageHeader` (98 líneas, `features/admin/components/ConfigPageHeader/ConfigPageHeader.tsx:14`) lleva un `ROUTE_MAP` de 12 títulos y subtítulos **en español fijo**, mientras `AdminSidebar` ya recibe `dictionary`. | Un `AccountMenu` compartido y títulos derivados de la configuración de navegación + diccionario. | U-21 (parcial), P-12 |
| DUP-C10 | **`PageHeader` ×3.** `shared/components/hireeo/PageHeader/PageHeader.tsx` (66 líneas, usa `style={{ height: 100, … }}`), `features/users/components/account/PageHeader/PageHeader.tsx` (1 línea: re-exporta el anterior; 4 páginas de perfil lo importan) y `ConfigPageHeader` (DUP-C09). | Importar el de `hireeo` y borrar el alias. | nueva |
| DUP-C11 | **Estrellas editables ×2.** `features/services/components/detail/ReviewToggleForm/ReviewToggleForm.tsx:32` (`StarPicker` local) y `features/reviews/components/admin/CalificacionForm/CalificacionForm.tsx:154-161` (carácter `★` en un `<button>`); `hireeo/Stars` no tiene `onChange`. | `Stars` con `value`/`onChange` accesible. | U-05 |
| DUP-C12 | **Login y OAuth repetidos.** `features/services/publish/components/Paso1DatosUsuario/Paso1DatosUsuario.tsx:49-70` reimplementa los 3 `signIn('google'\|'apple'\|'azure-ad')` y `:107` el `signIn('credentials')`, aunque `features/auth/hooks/useOAuthSignIn.ts` existe y solo lo usa `LoginPage`. `OAuthBrandIcons` (de `auth`) se importa desde `services`. | `useOAuthSignIn` consumido por `LoginPage` y `Paso1`; `OAuthBrandIcons` a `shared/components/icons/`. | nueva |
| DUP-C13 | **Formularios de servicio.** `ServicioFormBase.tsx` (555 líneas; usa `Btn`, `Field`, `Input`, `Select`) y `Paso2TuOficio.tsx` (751 líneas; importa solo `Btn` de `hireeo`) comparten `CategoriaMultiSelect`, `GaleriaUpload`, `LocalitySelect`, `PhoneInput`, `ImageDropzone` y `useCountry`. `AdminServicioForm` (71), `UserServicioForm` (50) y `EditServiceForm` (33) envuelven al primero. | Una sola pieza de formulario de servicio con modo (`admin` \| `owner` \| `publish`), tras unificar schema (DUP-L09). Es el cambio de mayor riesgo. | P-01 |
| DUP-C14 | **Tipos de red social ×4.** `features/services/lib/constants.ts:1` (`TIPOS_RED_SOCIAL`), `features/services/publish/components/Paso2TuOficio/Paso2TuOficio.tsx:62` (copia local), `app/(country)/[country]/(public)/publish/[slug]/page.tsx:11` (`SOCIAL_NETWORK_TYPES`), `shared/schemas/socialNetworkSchemas.ts` (`TipoRedSocialEnum`). | Derivar todo del `z.enum` de `shared/schemas/socialNetworkSchemas.ts`. | nueva |
| DUP-C15 | **Pantallas de éxito del wizard.** `Paso6Exito.tsx` (70 líneas) y `PasoExitoBasico.tsx` (93): un `diff` entre ambas marca 61 líneas distintas, o sea solapamiento parcial. | `WizardSuccessScreen` solo si una tarjeta posterior toca el wizard; no es prioridad. | nueva (parcial) |

**Hechos de contraste (adopción alta, no es el foco).** `Pill` se usa en 33 archivos (y en las 9 tablas con `DataTable`/`AdminCrudTable`), `Avatar` en 19, `SectionLabel` en 33, `Card` en 15, `Btn` en 70 e `Icon` en 66 (conteo de archivos con `<Componente`). Los `Record<…, string>` de las tablas son etiquetas (`ServiceRequestCard.tsx:16`, `CountriesTable.tsx:18`), no mapas de clases. Seis tablas conservan 1 a 4 clases de la paleta por defecto cada una (`PagosTable.tsx` 4, `ServiciosTable.tsx` 3); no se revisó si son estados o acciones. A diferencia de lo que `chiloe:.doc/plan/01-dry-audit.md` (DRY-005) describía para Chiloé el 2026-09-10 (`Pill` sin uso en tablas), en hireeo la adopción de esos primitivos ya existe y no es prioridad.

### 4.2 Lógica y datos

| ID | Hecho (ruta:línea) | Reemplazo único | CA-177 |
| --- | --- | --- | --- |
| DUP-L01 | **Moneda ×6.** Canónico: `features/geo/lib/countryUtils.ts:135` (`formatPrice`). Copias: `shared/lib/utils.ts:19` (`formatCurrency`, alias con otro nombre), `features/payments/premium/components/PreciosPorDuracion/PreciosPorDuracion.tsx:38-44` (default `'CLP'`, `'es-CL'`), `features/services/publish/components/Paso4SeleccionarDuracion/Paso4SeleccionarDuracion.tsx:27-33`, `features/payments/components/PaymentBrick/PaymentBrick.tsx:240-246`, `features/users/components/profile/MisServicios/MisServicios.tsx:150` y `features/services/components/admin/ServiciosTable/ServiciosTable.tsx:218` (`$${…toLocaleString('es-CL')}`); más fallbacks `'CLP'` en `PrecioPremiumForm.tsx:64` y `PreciosPorDuracion.tsx:94`. Además `formatPrice` decide los decimales con `countryCode === 'cl' ? 0 : 2` (`countryUtils.ts:140-141`) y cae a Chile si el código no existe (`:136`). | Un único `formatPrice(amount, currency, locale)` en `lib/country/format.ts` que reciba moneda y locale del país (la tabla `Country`) y deje que `Intl` decida los decimales; borrar `formatCurrency`. | U-14, P-12 |
| DUP-L02 | **Fecha, hora y números ×≥10.** Canónico: `countryUtils.ts:145` (`formatDate`, 3 consumidores: `ConversationList`, `PagosTable`, `KycStatusBanner`). Con `es-CL` fijo: `features/analytics/components/admin/RecentActivity/RecentActivity.tsx:122`, `InteraccionesTable.tsx:92`, `features/chat/components/ChatBubble/ChatBubble.tsx:29`, `MisServicios.tsx:89`, `features/services/components/quotes/ServiceRequestCard/ServiceRequestCard.tsx:45`; con `'es'` fijo: `LegalDocumentReviewsTable.tsx:63`; sin locale: `ChatMensajes.tsx:234,276`; números sin locale: `app/(config)/config/page.tsx:77-95`, `app/(config)/config/interactions/page.tsx:56-71`, `ProviderStatsCard.tsx:102,125`, `DashboardCharts.tsx:74,150` (en `app/(country)/[country]/(admin)/admin/page.tsx:84-96` sí pasan `locale`). `formatDate` fija `month: 'long'` y no ofrece hora. | `formatDate`/`formatDateTime`/`formatNumber` en `lib/country/format.ts`, todos con país y huso. | P-12 |
| DUP-L03 | **Escalera de errores en acciones.** 12 `instanceof ZodError` en 6 archivos (`reviews/actions/mutations.ts:40,77`, `services/actions/mutations.ts:39`, `users/actions/mutations.ts:69,102,175,203`, `categories/actions/mutations.ts:43,77`, `configuration/countries/actions/mutations.ts:37,57`, `contact/actions/mutations.ts:74`) y `instanceof ApiError` en 14; resultados `return { error:` ×113 y `return { success:` ×73, un `ActionResult<T>` local en `features/payments/actions/mutations.ts:16` y un `Result` en `features/services/types/shared.ts:59`; 28 mensajes «No autorizado/No autenticado/Debes iniciar sesión» repartidos. | `ActionResult<T>` y `runAction(label, fn)` en `shared/lib/` adaptados a `ApiError` (§5.2). | P-12 |
| DUP-L04 | **Estado «cargando» a mano.** 79 `useState(false\|true)` en `features/` (no todos son «cargando»: también hay abrir/cerrar) frente a `useTransition`/`useActionState` en 9 archivos; `setIsDeleting` en 8 archivos. | `useServerAction` (`{ run, isPending, error, data }`). | nueva |
| DUP-L05 | **Query-string y URL de búsqueda.** `new URLSearchParams` en `features/{reviews,analytics,users,payments,categories,geo}/actions/queries.ts`, `buildQueryString` privado en `features/services/actions/queries.ts:26`, y la URL de `/search` armada en `SearchPageClient.tsx:210,240` y `HeroSearchBar.tsx:220`. `useDataTable` (`shared/components/DataTable/useDataTable.ts`) ya implementa «actualizar un parámetro y reiniciar `page`». | `buildQuery(params)` en `lib/api/`; `useUrlParams` (extraído de `useDataTable`); `buildSearchUrl`/`parseSearchParams` en `features/services/lib/`. | P-02 (parcial) |
| DUP-L06 | **Mapeo DTO→modelo e imagen.** `mapServiceDto` y `mapServiceDetailDto` (`features/services/actions/queries.ts:34,67`), `redesSociales` remapeado en `:59`, `:81`, `:250` y en `features/users/actions/queries.ts:166`, `isPremium` en `services/actions/queries.ts:54` y `favorites/actions/queries.ts:63`, y `PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/3B82F6/FFFFFF?text=Sin+Imagen'` en `features/services/actions/queries.ts:13` y `features/favorites/actions/queries.ts:33`. | `features/services/lib/mappers.ts` único y `resolveServiceImage()` con imagen local neutra. | P-04 |
| DUP-L07 | **Política de contraseña ×5.** Frontend: `features/auth/schemas/authSchemas.ts:13-18` y `features/users/schemas/userSchemas.ts:4-10` (este se declara «política canónica» pero `authSchemas` no lo importa). Backend: `modules/auth/dto/register.dto.ts:28-33` exige mayúscula, minúscula, número y especial (`@Matches`); `users/dto/update-password.dto.ts:11` y `users/dto/update-user.dto.ts:17-21` solo exigen `@MinLength(8)`. | `passwordSchema` único en `shared/schemas/` y un decorador único en `common/decorators/` del backend. | nueva |
| DUP-L08 | **Primitivas Zod.** `z.string().email(` ×15 en 8 archivos con 4 textos distintos («Email inválido», «Email de contacto inválido», «Invalid email» en `integrations/schemas/integrationSchemas.ts:40`, «El correo electrónico no es válido» en `contact/schemas/contactSchemas.ts:57`) y 2 sin texto en `payments/schemas/paymentSchemas.ts:9,36`; teléfono con regex solo en `authSchemas.ts:22-23`. Mezcla de tuteo y voseo en el mismo schema: `authSchemas.ts` dice «Debes confirmar que tenés 18 años». | `emailSchema`, `phoneSchema` (E.164) en `shared/schemas/primitives.ts` con mensajes desde el diccionario. | P-12 |
| DUP-L09 | **Schemas de servicio.** `features/services/schemas/serviceSchemas.ts` (3 variantes: `emailContacto` en `:23`, `:43`, `:63`) y `features/services/publish/schemas/publishSchemas.ts` (`email` en `:13`, `emailContacto` en `:42`) validan la misma entidad con reglas que se solapan. | `serviceBaseSchema` + `extend`/`omit` por modo. | P-01 |
| DUP-L10 | **País y sesión.** Listas de países y de pasarelas (ver §3.6) y lectura de sesión (DV-F02). | `lib/country/` con la tabla `Country` como fuente; `getSession()`/`requireSession()` en `features/auth/lib/`. | U-14, P-12 |
| DUP-L11 | **i18n a medias.** Solo 25 de 238 `.tsx` usan `useDictionary`/`getDictionary`. `lib/i18n/locales/cl.json` tiene 16 secciones (`publishWizard` 96 claves, `search` 74, `serviceDetail` 43); comparado con `cl`, `uy`, `es` y `us` faltan 37 claves cada uno y traen 9, 26 y 9 claves de más; `ar` coincide. `getDictionary` cae a `cl` (`lib/i18n/getDictionary.ts`). Mensajes de Zod y de `notify` en español fijo. | Completar claves en lugar de agregar otra librería; una prueba que compare las claves de los 5 JSON. | P-12, U-16 |

**Opinión.** El grupo de mayor retorno es DUP-L01/L02/L10 (país y formatos) porque habilita la generalización internacional con un único cambio y no depende de decisiones de diseño. DUP-L03/L04 y DUP-C06/C07 se resuelven juntos (acciones con contrato + hook + confirmación + tabla CRUD) y eliminan los 19 `reload` y los 13 `confirm`. DUP-C13 es el más grande y debe ir último: necesita DUP-L09 y DUP-L07 resueltos antes.

### 4.3 Estilos

| ID | Hecho (ruta) | Reemplazo único | CA-177 |
| --- | --- | --- | --- |
| DUP-S01 | **`style={{…}}` con variables CSS.** 343 ocurrencias en 84 archivos (sin `design-system`). Patrones más repetidos: `color: 'var(--muted)', letterSpacing` ×8, `color: 'var(--accent)'` ×8, `color: 'var(--sub)', lineHeight` ×6, `color: 'var(--danger)'` ×6, `background: 'var(--bg)', color: 'var(--ink)'` ×6. Archivos con más: `features/services/components/quotes/CheckoutModal/CheckoutModal.tsx` (37), `app/(country)/[country]/(account)/profile/verification/page.tsx` (19), `profile/page.tsx` (17), `features/legal/components/LegalDocument/LegalDocument.tsx` (16), `pricing/page.tsx` (15). Los tokens ya existen como utilidades (`app/globals.css:3-46`: `--color-ink`, `--color-sub`, `--color-line`, …). | Clases `text-ink`, `text-sub`, `border-line`, `bg-bg`, `tracking-*`; los primitivos (`PageHeader`, `Card`, `SectionLabel`) primero para cortar la fuente. | nueva (≈ DRY-024) |
| DUP-S02 | **Tipografía arbitraria.** 476 `text-[Npx]` en 121 archivos: `13px` ×94, `11px` ×72, `12px` ×68, `14px` ×53, `10px` ×34, `12.5px` ×33, `15px` ×22, `10.5px` ×20. `app/globals.css` no define `--text-*`. | Escala `--text-*` en `@theme` (U-01) y migración por lotes. | U-01 |
| DUP-S03 | **Radios.** `rounded-xl` ×140, `rounded-2xl` ×71, `rounded-lg` ×55, `rounded-md` ×35 y arbitrarios `rounded-[2rem]` ×9, `[14px]` ×6, `[10px]` ×5, `[7px]` ×4, `[11px]` ×4. No hay `--radius-*` en `globals.css`. | `--radius-control/card/sheet` y `rounded-control/card/sheet`. | U-01 |
| DUP-S04 | **Colores fuera de token.** 40 hex `#rrggbb` en `features/`, `shared/` y `app/`; 222 usos de la paleta por defecto de Tailwind (`text-red-600` ×35, `bg-red-50` ×34, `text-green-600` ×11, …) en 45 archivos, en vez de `danger`/`success`/`warning` (y sus `-soft`). | Tokens existentes; `--warning-ink` y variantes `.dark` de éxito/aviso/peligro. | U-17 |
| DUP-S05 | **Clases `form-*` huérfanas.** `app/globals.css` define `.form-input`, `.form-select`, `.form-label`, `.form-phone-input` (`h-[50px]`) y solo 10 usos en `.tsx` (7 `form-input`); el `Input` de `hireeo` no las usa. | Un alto de control único `--control-height` aplicado por `Input`/`Select`/`PhoneInput`. | U-01, U-15 |
| DUP-S06 | **Sin base de cursor ni foco global.** `globals.css` no tiene regla `button { cursor: pointer }` (Tailwind v4 la quitó del preflight; solo hay un `cursor: pointer` dentro de una clase en `:325`) ni `:focus-visible` global; `prefers-reduced-motion` solo anula unas pocas clases (`:401`). | Un bloque `@layer base` (mismo diagnóstico que `chiloe:.doc/plan/03-ui-and-design-system.md` §1 y §7). | U-03 |

### 4.4 Backend

| ID | Hecho (ruta:línea, reportado por el agente y verificado por muestreo) | Reemplazo único | CA-177 |
| --- | --- | --- | --- |
| DUP-B01 | **País efectivo del solicitante ×6.** `const effectiveCountryCode = isSuperAdmin(requester.roles) ? … : requester.country ?? undefined` en `interactions/interactions.service.ts:39`, `ratings/ratings.service.ts:29`, `subscriptions/subscriptions.service.ts:113`, `users/users.service.ts:107`, `categories/categories.service.ts:194`, `services/services.service.ts:282`; el `where` equivalente en `data-subject-requests/data-subject-requests.service.ts:87-89` y `moderation/moderation.service.ts:87-89`; chequeo inline donde existe `assertCountryScope` (`common/utils/authorization.util.ts:15`): `geo/geo.controller.ts:134`, `users/users.service.ts:526-538`, `categories/categories.service.ts:273-281`. | `resolveEffectiveCountry(requester, requested)` y `whereCountryScope(requester)` junto a `assertCountryScope`. | P-07 |
| DUP-B02 | **Paginación ×6 services + 6 controllers.** `(page-1)*limit` y `{ total, page, limit, totalPages }` en `interactions.service.ts:42,75`, `chat.service.ts:99,119`, `ratings.service.ts:32,63`, `subscriptions.service.ts:116,179`, `users.service.ts:111,125`, `categories.service.ts:197,224`, `services.service.ts:81,160,285,352`; `users.service.ts:125` devuelve `items` y el resto `data`/`meta`. El parseo con clamp a 100 está en 6 controllers con defaults distintos. Solo `ratings/dto/query-ratings.dto.ts` y `services/dto/query-services.dto.ts` tienen DTO de paginación. | `paginate()` y `PaginationQueryDto` en `common/utils/pagination.ts` y `common/dto/`. | nueva |
| DUP-B03 | **Ownership ×9 con excepciones distintas.** `x.userId !== requesterId && !isAdmin(roles)` en `interactions.service.ts:133,158`, `ratings.service.ts:171`, `subscriptions.service.ts:191`, `services.service.ts:473,554`, `users.service.ts:206,384,511-515`, `quotes.service.ts:91`, `service-requests.service.ts:83`; `escrow.service.ts:31` lanza `BadRequestException` y los demás `ForbiddenException`. | `assertOwnerOrAdmin(ownerId, requester)` en `common/utils/authorization.util.ts`. | nueva |
| DUP-B04 | **Lookup de país ×10 y de servicio ×6.** Ver DV-B07; `service.findUnique` + 404 en `chat.service.ts:11`, `favorites.service.ts:11`, `ratings.service.ts:86,197`, `subscriptions.service.ts:204`, `moderation.service.ts:193`, `ai-agents/tools/service-requests.tool.ts:36`. | `GeoService.requireCountry()` y `ServicesService.assertExists()`. | P-07 |
| DUP-B05 | **`paymentsEnabled` ×2.** `escrow/escrow.service.ts:53-66` y `subscriptions/subscriptions.service.ts:219-232` repiten «país + `paymentsEnabled` + `ForbiddenException`». | `assertPaymentsEnabled(country)` en `payments`. | P-11 |
| DUP-B06 | **Login social ×3.** `auth/auth.service.ts:384-410`, `:459-491`, `:527-551` repiten `findUnique` → `update`/`create` con `role: { connect: { name: 'Client' } }`; literales `'Client'`/`'SuperAdmin'` en `auth.service.ts:178,186,189,410,491,551` e `integrations/integrations.controller.ts:28` aunque existe `common/enums/role.enum.ts`. | `upsertSocialUser(provider, claims)` privado y `Role.*`. | nueva |
| DUP-B07 | **Helpers repetidos.** `escapeHtml` idéntico en `auth.service.ts:96-101` y `data-subject-requests.service.ts:24-29`; `slugify` en `geo/location-resolver.service.ts:21` y `services/services.service.ts:20` (implementaciones distintas); primera URL de `FRONTEND_URL` con trim en `payments.service.ts:117-124`, `kyc.service.ts:231`, `integrations/integration-health.service.ts:177-180` y `chat.gateway.ts:25-27`; `setMonth(getMonth()+N)` en `subscriptions.service.ts:241,426` y `services.service.ts:391,641`; credenciales y modelo `'gemini-2.5-flash'` en `chatbot.service.ts:37`, `chatbot-ai.service.ts:20`, `ai-agents.service.ts:31`; decoradores de `countryCode` divergentes en 5 DTOs (`MinLength/MaxLength(2)` en 3, `MaxLength(10)` en `services/dto/create-service.dto.ts:100`, solo `@IsString()` en `subscriptions/dto/create-subscription.dto.ts:22`). | `common/utils/{escape-html,slugify,date}.ts`, `firstFrontendUrl()` en `config/frontend-url.util.ts` (ya existe `resolveFrontendUrl`), un cliente Gemini único en `integrations` y `@IsCountryCode()` en `common/decorators/`. | nueva |

**Hecho positivo.** El mapeo de errores de Prisma ya está centralizado en `common/filters/prisma-exception.filter.ts:40-55`; no hay duplicación ahí.

## 5. Comparación con ChiloéServicios (criterio 3)

### 5.1 Qué hace Chiloé hoy

**Hechos** (lectura de `next-chiloeservicios` en `87f5ddb`, solo lectura; rutas con prefijo `chiloe:src/`).

- **Un componente por función, y los demás lo envuelven.** `shared/components/hireeo/index.ts` agrupa 25 carpetas de componentes (más `icons.ts`): `Btn`, `Field`, `Input`, `Select`, `Textarea`, `Checkbox`, `RadioPillGroup`, `FileDropzone`, `FieldTrigger`, `Banner`, `EmptyState`, `Skeleton*`, `ConfirmDialog`/`useConfirm`, `Toast*`, `Modal`, `Pill`, `Avatar`, `Card`, `Stat`, `Stars`, etc. La regla está escrita en `chiloe:AGENTS.md` («Campos de formulario — usar `hireeo/`, no clases sueltas»: cada campo se declara con un primitivo, **envuelto en `Field`** para label, hint y error; cero `<select>` nativo) y en la tabla «Esto ya existe, reutilizá — no crear una nueva implementación» (16 filas: botón, tabla, badge, avatar, checkbox, stat, card, estado vacío, banner, modal, fecha/moneda, sesión/rol, resultado de acción, listado paginado, parámetros de URL, rutas).
- **`Btn` único.** `shared/components/hireeo/Btn/Btn.tsx`: `variant` (`primary|secondary|ghost|accent|danger|dangerSolid|link`), `size`, `icon`, `iconRight`, `loading`, `href`, y `iconOnly` que **exige `aria-label` en el tipo**. Importa `Loader2` de `lucide-react`.
- **Hooks de feedback y de estado.** `shared/hooks/useServerAction.ts` (`{ run, isPending, error, data }`, `router.refresh()` opcional, toast), `useCrudModals.ts` (el trío `isCreateModalOpen/isEditModalOpen/selectedItem`), `useUrlParams.ts`, `useClickOutside.ts`, `useDialogBehavior.ts`.
- **Contrato de acciones.** `shared/types/actions.ts` (`ActionResult<T> = { ok: true; data } | { ok: false; error }`, `UnauthorizedError`), `shared/lib/runAction.ts` (`runAction(label, fn)` loguea y devuelve `ActionResult`), `shared/lib/messages.ts` (`GENERIC_ERROR`, `INVALID_DATA`, `AUTH_REQUIRED`, `FORBIDDEN`, `NOT_FOUND(entity)`), `shared/types/pagination.ts` (`Paginated<T>`).
- **Auth en un solo módulo.** `features/auth/lib/{auth,guards,roles,loginUrl}.ts`; `authOptions` ya no vive en el Route Handler.
- **Regresión.** `chiloe:.github/scripts/dry-check.sh` + `dry-check-baseline.json`: cuenta archivos por anti-patrón (`window.location.reload`, `window.confirm`, `style={{…var(--`, `text-[Npx]`, `react-icons`, `getServerSession(` fuera de `features/auth`) y **falla solo si el número crece**; al limpiar archivos se baja el baseline en el mismo commit.
- **Qué NO es** (hecho): `shared/lib/date.ts` formatea fijo `dd-mm-aaaa` sin locale; `shared/lib/utils.ts` formatea solo CLP; `Field` repite «opcional» en español; los guards consultan la sesión del monolito y Prisma.

### 5.2 Qué se toma, cómo se generaliza y qué no

**Opinión** salvo la columna «hireeo hoy», que es hecho. Rutas destino relativas a `frontend/src/`.

| Pieza de Chiloé | hireeo hoy | Se toma | Cómo se generaliza (i18n, moneda, país/región/ciudad, formatos) | No se toma |
| --- | --- | --- | --- | --- |
| `Btn` con `loading`/`iconOnly`/`link` | `Btn` sin esas tres (U-02) | La API de props, el `aria-label` obligatorio en el tipo | Spinner con SVG propio de `hireeo/Icon` (no Lucide); texto accesible por prop/diccionario | `lucide-react`, acento azul |
| `Field` + primitivos (`Input`, `Select`, `Textarea`, `Checkbox`, `RadioPillGroup`, `FileDropzone`) | `Field` (con `htmlFor`/`aria-*`), `Input`, `Select` nativo, `Toggle`; `Form.tsx` con `FormInput/FormTextarea/FormSelect/FormToggle` sobre RHF | El principio «un control por función, envuelto en `Field`». Falta `Textarea`, `Checkbox` con etiqueta, `RadioPillGroup`, `FileDropzone` y su `Form*` (U-11, U-12) | «opcional», placeholders y errores desde el diccionario; etiquetas de región y ciudad desde `Country.regionLabel/localityLabel` vía `useCountry()`; teléfono E.164 con `defaultCountryCode` del país de la URL | El `Field` de Chiloé (`span` sin asociación al control); el checkbox casero en lugar de Radix |
| `Select` con búsqueda (`options`) | `<select>` nativo; `LocalitySelect` carga región y localidad por API | Condicional (U-09, P2): solo si una lista de ciudades lo exige | `searchPlaceholder` del diccionario; opciones desde la API geo, nunca comunas | Listado de comunas, `FieldTrigger` copiado |
| `ConfirmDialog` + `useConfirm` | 13 `confirm(` nativos (DUP-C06) | El patrón sobre el `Dialog` Radix que ya existe | Título y mensaje por prop o clave de diccionario | El `Modal` casero de Chiloé |
| `Toast*` | `shared/lib/notify.ts` sobre Sileo, usado en todo el frontend | **Nada**: hireeo ya lo resolvió | `useServerAction` llama a `notify` | `ToastProvider` de Chiloé |
| `ActionResult<T>` + `runAction` + `messages` | `{ error }` ×113, `{ success }` ×73, `ActionResult` local en `payments` | La forma discriminada y la función envoltorio | `runAction` traduce `ApiError` (estado HTTP → mensaje) y `ZodError`; mensajes por clave de diccionario; el 401 apunta a `/{country}/login` | `UnauthorizedError` ligado a Prisma; mensajes fijos en español |
| `useServerAction`, `useCrudModals`, `useUrlParams`, `useClickOutside`, `useDialogBehavior` | `useDataTable` ya implementa «parámetro + reiniciar `page`»; click-afuera ×6 | Los cinco hooks, agnósticos del negocio, en `shared/hooks/` (carpeta nueva) | `useServerAction` combina `revalidatePath('/[country]/…', 'page')` del lado servidor con `router.refresh()`; sin estado global | — |
| Guards `requireSession/requireAdmin/requireSuperAdmin` y `roles.ts` | Sesión leída directo en 11+20 sitios; roles validados por los guards de NestJS | El **módulo único** (`features/auth/lib/{auth,guards,roles}.ts`) y mover `authOptions` | En hireeo el dueño del permiso es el backend (`JwtAuthGuard`, `Role`); el frontend solo exige sesión y reenvía el token, y `roles.ts` lee el enum del backend | Prisma en el guard; el literal `'SuperAdministrador'` |
| `date.ts` y `formatCurrency` | `countryUtils.formatPrice/formatDate` ya reciben país, pero caen a `cl` | La idea de **un solo formateador** y la distinción fecha civil (`formatIsoDate`) vs instante | `lib/country/format.ts` con `{ currency, locale, timeZone }` del país; decimales los decide `Intl`; fecha de contenido en ISO | `dd-mm-aaaa`, CLP fijo, `calcularIngresoNeto` |
| `siteConfig`, `routes.ts`, `supportWhatsapp` | `COUNTRY_SEO_CONFIG` con `NEXT_PUBLIC_APP_URL_xx` y `countryLink` | Un `siteConfig` exportado por país | Origen por país (ya hay variables por país); soporte solo si el país tiene número | El número de WhatsApp local, el dominio de Chiloé |
| `DataTable` + `useCrudModals` | `DataTable` con paginación por URL; `AdminCrudTable` (cliente, 1 consumidor) | Mantener `DataTable`; sumar `useCrudModals` | La paginación por URL ya soporta `page` y `q` por país | Ampliar `AdminCrudTable` ni crear una tabla CRUD genérica: Chiloé lo descarta (`chiloe:.doc/plan/07-refactor-roadmap.md`, «Qué NO refactorizar», punto 12) |
| Tokens `--text-*`, `--radius-*`, `--control-height`, `--focus` | No existen (DUP-S02, S03, S05) | La técnica: variables en `@theme` que generan `text-*`/`rounded-*` | Valores propios de hireeo; foco con `--accent #2d4e8f` | Paleta `#3B82F6`/`#10B981` |
| `dry-check.sh` con baseline | Sin guarda; `ci.yml` del padre corre build y tests del backend y build del frontend (no `lint`, no `type-check`, aunque el job se llama «lint + build + tests») | El mecanismo (contar y no dejar crecer) | Anti-patrones propios de hireeo (§6 T-51), incl. literales de país y moneda | Los guards de Prisma de Chiloé |
| Tabla «Esto ya existe» en `AGENTS.md` | `AGENTS.md` sección 8 con paleta desfasada (U-08) | El formato de tabla «necesito → usar → no crear» | Filas para `formatPrice`, `useCountry`, `notify`, `Form*`, `getDictionary` | — |

### 5.3 Reglas de generalización (internacional)

**Opinión, con apoyo en hechos de §3.6 y §4.**

1. **i18n sin librería nueva.** El texto visible de un primitivo llega por prop o por clave del diccionario (`lib/i18n/locales/*.json`, 5 archivos y `getDictionary`). Hoy 25 de 238 `.tsx` lo usan y 3 de 5 JSON difieren de `cl` en 37 claves: antes de agregar texto hay que completar claves y sumar una prueba de paridad. Un país desconocido no debe convertirse en `cl` en silencio (`getDictionary.ts`, `countryUtils.ts:136`): se decide si es 404 o un idioma por defecto explícito. Mensajes de Zod: claves de error traducidas en el cliente, no frases fijas (hoy mezclan «Debes» y «tenés»).
2. **Moneda.** La moneda y el locale salen de `Country` (`useCountry()` o el dato del servicio), no de `if (countryCode === 'cl')`. `formatPrice(amount, { currency, locale })` y decimales por `Intl`. Las comisiones, el IVA y el neto por pasarela son del backend (DV-F04).
3. **País, región y ciudad.** `countryUtils` y `useCountryLink` pasan a `lib/country/` (infraestructura); `features/geo` queda para regiones, localidades, radio y geocodificación. Las etiquetas (`Comuna`, `State`) vienen de `Country.regionLabel/localityLabel`. La selección geográfica se valida en el servidor (P-07). Agregar `py` debe ser una fila en la tabla `Country` y no un cambio de código.
4. **Formatos.** Dato en ISO 8601 y teléfono E.164; presentación por país con `formatDate`/`formatDateTime`/`formatNumber` y huso del país (cuidado con `us`, que hoy tiene un único huso: `America/New_York`). Fecha civil como texto, instante como `Date`.

### 5.4 «Componentes que exportan componentes reutilizables» en hireeo

**Hecho.** hireeo ya tiene la estructura: un barrel (`shared/components/hireeo/index.ts`, 14 componentes) y `shared/components/Form/Form.tsx`, que envuelve los primitivos con `Field` y React Hook Form (`FormInput`, `FormTextarea`, `FormSelect`, `FormToggle`, `FormError`). **Opinión.** El patrón de tres capas a mantener es: (1) primitivo sin estado de formulario (`Input`), (2) `Field` que lo envuelve (label, hint, error), (3) `Form*` que lo conecta con RHF. Cada primitivo nuevo (`Textarea`, `Checkbox`, `FileDropzone`) debe entrar con su fila en la tabla de `AGENTS.md` y con su `Form*`. Un feature no escribe `<input>`, `<select>`, `<textarea>` ni `<button>` fuera de `shared/` (y el ratchet de T-51 lo cuenta).

## 6. Plan de consolidación ordenado (criterio 4)

**Opinión** en todo el plan; los hechos que lo sustentan están en §2–§5. Tarea = `T-nn`. El plan **no incluye ninguna decisión de producto** (las deja en §7) y no autoriza cambios: es el insumo de las tarjetas siguientes.

Reglas para cada tarea (derivadas de `AGENTS.md` y de §2):

- Antes de empezar: línea base en verde (T-01). Si sigue en rojo, cada tarea debe comparar contra la tabla de §2.
- Después de cada cambio, en este orden: type-check → test → lint → format:check → build; revisión visual en claro y oscuro, en dos países (`cl` y `us`) y con una cadena larga; `pnpm install` solo desde la raíz del monorepo.
- Una tarea toca un primitivo **o** migra consumidores, no ambas cosas (evita conflictos entre workers); archivos disjuntos pueden ir en paralelo.
- Sin `pnpm build` mientras `pnpm dev` está activo.

### 6.1 Fases y tareas

| Fase | Tarea | Qué reemplaza (hechos de este documento) | Brechas CA-177 | Depende de | Costo |
| --- | --- | --- | --- | --- | --- |
| **F0** Base y decisiones | **T-01** Línea base verde: `pnpm install` desde la raíz, `pnpm db:generate`, scripts `type-check` en ambos paquetes, Prettier del backend con soporte de decoradores, `prettier` visible desde `frontend/`, limpiar los archivos sueltos de §2 | §2 completo | P-10 | — | S |
| | **T-02** Decisiones registradas con fecha en `~/SitesDoc/decisiones/` (§7): política de contraseña, país desconocido, escala tipográfica y radios, `Modal`/`Dialog`, destino de `AdminCrudTable`, tipos desde OpenAPI | DUP-L07, DUP-S02, DUP-S03, DUP-C05 | U-01, U-20 | — | S |
| **F1** Infraestructura, sin cambio visual | **T-10** `authOptions` a `features/auth/lib/auth.ts`, `getSession()/requireSession()` único; redirigir 30 imports y los 11 `getServerSession` de acciones | DV-F01, DV-F02, DV-F03 (parte `app`) | P-10 | T-01 | M |
| | **T-11** `lib/country/`: `countryUtils` y `useCountryLink` fuera de `features/geo`; `format.ts` (`formatPrice`, `formatDate`, `formatDateTime`, `formatNumber`); lista de países desde `Country` con respaldo; quitar los literales de §3.6; `PhoneInput` y diccionario sin `cl` implícito | DV-F03, DV-F05, DV-F06, DUP-L01, DUP-L02, DUP-L10, §3.6 | U-14, U-15, U-16, P-12 | T-01, T-02 | M |
| | **T-12** Contrato compartido: `ActionResult<T>`, `runAction`, mensajes por clave; `buildQuery`; `mappers.ts` de servicio y `resolveServiceImage` (imagen local neutra); `passwordSchema`, `emailSchema`, `phoneSchema` en `shared/schemas/primitives.ts` | DUP-L03, DUP-L05, DUP-L06, DUP-L07, DUP-L08, DUP-C14 | P-04, P-12 | T-10 | M |
| **F2** Tokens y primitivos, aditivos | **T-20** Guía y tokens: `--text-*`, `--radius-*`, `--control-height`, `--focus`, foco global, `cursor: pointer` en botones, movimiento reducido, modo oscuro de estados; corregir la paleta de `AGENTS.md` | DUP-S02, S03, S05, S06 (definición) | U-01, U-03, U-08, U-17 | T-02 | S |
| | **T-21** Primitivos en `shared/components/hireeo/`: `Btn` (`loading`, `iconOnly`, `link`), `Textarea`, `Checkbox`, `RadioPillGroup`, `FileDropzone`, `EmptyState`, `Banner`, `Skeleton*`, `Stars` editable, `Input passwordToggle`, `Card` variantes, `Stat` con `href`; su `Form*` | DUP-C01, C02, C04, C11 (primitivos) | U-02, U-04, U-05, U-06, U-10, U-11, U-12, U-13 | T-20 | M |
| | **T-22** `shared/hooks/` (`useServerAction`, `useCrudModals`, `useUrlParams`, `useClickOutside`, `useDialogBehavior`) y `ConfirmDialog`/`useConfirm` sobre `Dialog` | DUP-C05, C06, C08 (hooks), DUP-L04, DUP-L05 | U-07, U-20 | T-12, T-21 | M |
| **F3** Adopción por familias | **T-30** Tablas CRUD: 6 tablas con `useCrudModals` + `useServerAction({ refresh: true })` + `ConfirmDialog`; fuera 19 `reload` y 13 `confirm` | DUP-C06, DUP-C07 | U-07, P-01 | T-22 | M–L |
| | **T-31** Formularios sin RHF → `useZodForm` + `Form*`, de menor a mayor riesgo (`AdminProfileForm`, `ForgotPasswordForm`, `PrecioPremiumForm`, `CategoriaForm`, `FiscalDataForm`, `LicenseCredentialsForm`, `UsuarioForm`, `AjustesPerfilForm`; después `CalificacionForm`, `ChatMensajes`) | DUP-C03, DUP-C02 | P-01, U-16 | T-21, T-12 | M–L |
| | **T-32** Controles crudos restantes: `<select` ×5, `<textarea` ×8, checkbox y Términos, estrellas, click-afuera ×6, alias `PageHeader`, `UserShell` y barrels sin importadores, `OAuthBrandIcons` a `shared` | DUP-C02, C04, C08, C10, C11, DV-F08 | U-05, U-11, P-12 | T-21, T-22 | M |
| | **T-33** Estilos por lotes: `style={{…}}` → clases (primitivos primero), `text-[Npx]` y `rounded-*` a tokens, colores fuera de token | DUP-S01…S04 | U-01, U-17 | T-20, T-21 | L (en paralelo, archivos disjuntos) |
| | **T-34** Wizard y formularios de servicio: `Paso1` con `useOAuthSignIn`; un esquema de servicio por modo; `Paso2TuOficio` sobre el formulario base | DUP-C12, C13, C14, C15, DUP-L09 | P-01 | T-12, T-31, e2e | L (riesgo alto) |
| **F4** Backend y dominio | **T-40** `common/utils`: `resolveEffectiveCountry`, `whereCountryScope`, `assertOwnerOrAdmin`, `paginate` + `PaginationQueryDto`, `escapeHtml`, `slugify`, `addMonths`, `@IsCountryCode`, `@IsStrongPassword`; con tests | DUP-B01, B02, B03, B07, DUP-L07 | P-07 | T-01 | M |
| | **T-41** `GeoService.requireCountry()`/`assertPaymentsEnabled()` y validación de región/ciudad que **rechace** lo inválido | DUP-B04, B05, DV-B07 | P-07, P-11 | T-40 | M |
| | **T-42** Límites de dominio: `deviceToken` a `notifications`; recálculo de calificaciones a `ratings`; `resolve-provider-country` y `where-service-country` fuera de `common/`; `QUOTE_REFERENCE_PREFIX` y la actualización de `quote` a `escrow`; `FRONTEND_URL` por `ConfigService`; `upsertSocialUser`; partir `services.service` y `auth.service` | DV-B01…B06, DUP-B06 | P-11 (parcial) | T-40, T-44 | M–L |
| | **T-43** Contrato: comisión y neto por pasarela en el backend (quitar `calcularIngresoNeto` del frontend); decidir tipos generados desde Swagger | DV-F04, DV-F11 | P-11 | T-02 | M |
| | **T-44** Specs para `moderation`, `data-subject-requests`, `professional-credentials`, `fiscal-profiles`, `legal-document-reviews` antes de tocar sus límites; resolver la divergencia `upload.service.spec.ts:72` vs `upload.service.ts:46-55` | §2.2, §3.4 | P-10 | T-01 | S–M |
| **F5** Contenido, SEO y regresión | **T-50** i18n: completar 37 claves, prueba de paridad, textos de Zod y de `notify` por clave, ficha y mensajes por idioma, `lastModified` real en el sitemap | DUP-L11, §3.6 | P-03, P-12, U-16 | T-11 | M |
| | **T-51** Ratchet adaptado: script con baseline que cuenta `window.location.reload`, `confirm(`, `<button`/`<input`/`<select`/`<textarea` fuera de `shared/`, `style={{…var(--`, `text-[Npx]`, `getServerSession(` fuera de `features/auth`, literales de país y de `'es-CL'`/`'CLP'` fuera de `lib/country`; pasos de `lint` y `type-check` en `.github/workflows/ci.yml` | DUP-S01, S02, C01, C06, C07, DUP-L10 | P-10 | T-30…T-33 | M |
| | **T-52** `AGENTS.md`: tabla «Esto ya existe» y paleta real, sin tocar el hunk ajeno hasta resolverlo; `.doc/README.md` al agregar documentos | U-08 | U-08 | T-21 | S |

**Orden recomendado (opinión).** T-01 → T-02 → {T-10, T-11, T-40} en paralelo (repos y archivos disjuntos) → T-12 → T-20 → T-21 → T-22 → {T-30, T-31, T-32, T-33, T-41} en paralelo → T-44 → T-42/T-43 → T-34 → T-50 → T-51 → T-52. T-34 va al final del frontend porque cambia el flujo de mayor valor del producto y exige pruebas E2E previas.

**Por qué este orden.** (a) Sin línea base verde no se puede distinguir una regresión de un fallo de entorno. (b) `lib/country` y el contrato de acciones se usan en todo lo demás y no tienen decisión de diseño pendiente. (c) Los primitivos son aditivos: no rompen a los 139 `<Btn` existentes. (d) La adopción por familias es lo que quita la duplicación, y se hace después de que exista la pieza única. (e) El ratchet cierra la fase cuando los números ya bajaron, igual que hizo Chiloé (`chiloe:.github/scripts/dry-check.sh`).

### 6.2 Cruce con las brechas U-xx y P-xx de CA-177

| Brecha | Tarea | Nota |
| --- | --- | --- |
| U-01, U-03, U-17 | T-20 (definición), T-33 (migración) | Anillo y acento con `#2d4e8f`. |
| U-02 | T-21 | Spinner con SVG propio. |
| U-04 | T-21 | `eyeOff` sumado al mapa propio (U-19 parcial). |
| U-05 | T-21, T-32 | Sustituye `StarPicker` y el `★` (DUP-C11). |
| U-06, U-10, U-12, U-13 | T-21 | Textos por prop. |
| U-07 | T-22, T-30 | Sobre `Dialog`; 13 `confirm(`. |
| U-08 | T-20, T-52 | No toca el hunk ajeno de `AGENTS.md` hasta que se resuelva. |
| U-09 | Condicional | Solo si una lista de ciudades lo pide (§5.2). |
| U-11 | T-21, T-32 | Checkbox sobre Radix. |
| U-14, U-15 | T-11 | Sin fallback silencioso a Chile. |
| U-16 | T-31, T-50 | «opcional» y «Selecciona {label}» desde el diccionario. |
| U-18, U-19 (resto), U-20, U-21 | Fuera de este plan | U-20 se decide en T-02; U-21 se toca solo en DV-F08 (T-32). |
| P-01 | T-30, T-31, T-34 | Sin perder RHF ni `Field`. |
| P-03 | T-50 | `lastModified` real. |
| P-04 | T-12 | Imagen local neutra. |
| P-07 | T-40, T-41 | Rechazar lo inválido en el servidor. |
| P-10 | T-01, T-51 | Ratchet y CI. |
| P-11 | T-41, T-43 | Solo la parte de refactor; la política de vigencia es decisión (§7). |
| P-12 | T-11, T-50 | Diccionario y `Intl` que ya existen. |
| P-02, P-05, P-06, P-08, P-09 | Fuera | Decisiones de producto o de larga duración. |

### 6.3 Lo que hireeo ya resuelve mejor y el plan no debe perder

Fuente: sección «Lo que hireeo ya resuelve mejor y no debe perder» de `.doc/2026-10-11-brechas-de-hireeo-respecto-de-chiloeservicios.md`. **Opinión** sobre cómo el plan lo protege.

| No debe perder | Cómo lo protege el plan | Verificación sugerida |
| --- | --- | --- |
| `Field` con `htmlFor`, `aria-invalid`, `aria-describedby` | T-21 amplía `hireeo/` sobre ese `Field`; no se porta el de Chiloé | Revisión del markup de un formulario por país |
| React Hook Form y Zod (`Form.tsx`) | T-31 migra **hacia** `useZodForm`; T-21 agrega `Form*` | Cuenta de formularios sin RHF (12 → 0) |
| Radix (`Dialog`, `DropdownMenu`, checkbox, `Modal` de admin) | T-22 y T-21 envuelven Radix; `ConfirmDialog` usa `Dialog` | Foco y `Escape` en cada diálogo |
| `/design-system` | T-20 vuelca a CSS lo que la página documenta; la página se queda y pierde el demo en CLP | La ruta sigue renderizando |
| Instrument Serif | No se toca (T-20 no la quita) | `app/layout.tsx` sigue cargándola |
| Iconos SVG propios con fallback a `alert` | T-21 suma iconos al mapa propio, no Lucide | `rg "from 'lucide-react'"` sigue en 0 |
| País en la URL, moneda, huso, etiquetas, pasarela | T-11 los centraliza en `lib/country/` desde la tabla `Country` | Mismo `formatPrice` para `cl` y `us` en dos pantallas |
| `defaultCountryCode` del teléfono | T-11 lo alimenta con el país de la ruta | Alta de teléfono en `ar` y `us` |
| Diccionarios `cl`/`ar`/`uy`/`es`/`us` | T-50 los completa; no se instala otra librería | Prueba de paridad de claves |
| Legales por país (`features/legal/content`, `getLegalDocument.ts`) | No se pegan textos de Chiloé; `legal` se mantiene como dominio | Los documentos por país siguen resolviendo |
| Backend NestJS, Prisma y PostgreSQL con guards y país en el dato | F4 refuerza el backend como dueño de la regla (T-40 a T-43) | `pnpm test` del backend en verde |
| Región, localidad, radio y geocodificación | T-41 los valida en servidor sin aplanar a comunas | Búsqueda por región y radio |
| Mercado Pago y Stripe por grupo de países, cobro en transacción | T-43 mueve la comisión al backend sin quitar pasarelas | Webhooks en sandbox |
| Chat en tiempo real | Fuera del plan; no se elimina | `modules/chat` intacto |
| Moderación, cotizaciones, solicitudes, escrow, KYC, derechos, credenciales | T-44 agrega specs **antes** de tocar sus límites (T-42) | Specs nuevos en verde |
| Brevo (`modules/email`) | No se cambia el transporte | Un correo de prueba en sandbox |
| Convención `Componente/Componente.tsx` | Todo componente nuevo la sigue; los 3 archivos planos de §3.1 se ordenan en T-32 | Script de §3.1 |
| App móvil (`appmobile/`) | Fuera de alcance | — |
| Accent navy `#2d4e8f` | T-20 lo usa para el anillo de foco | No cambia `--accent` |

## 7. Decisiones abiertas y fuera de alcance

**Para el jefe o para Edgardo** (ninguna está tomada ni aplicada; no se abrieron tarjetas).

1. **Política de contraseña única** (DUP-L07): hoy el registro exige complejidad en el frontend y en `register.dto.ts`, pero `update-password.dto.ts` y `update-user.dto.ts` solo piden 8 caracteres. ¿Se exige la misma en los cinco sitios?
2. **País desconocido:** ¿404 o idioma por defecto explícito? Hoy cae a Chile en `getDictionary.ts` y `countryUtils.ts:136`.
3. **Escala tipográfica y radios** (U-01): los valores de facto (`13/11/12/14 px`, `rounded-xl` ×140 y `2xl` ×71) condicionan T-33; hay que fijar la escala antes de migrar.
4. **`Modal` vs `Dialog`** (U-20) y **`AdminCrudTable`** (1 consumidor): ¿alias o se conservan los dos?
5. **Tipos desde Swagger** (DV-F11): ¿se generan los tipos del frontend desde `api/docs` o se sigue a mano? Afecta a T-43.
6. **Reubicación de `features/configuration`** (DV-F06) y de privacidad/denuncia (DV-F07): ¿dónde viven `countries`, `legal-documents` y `privacy`/`reports`?
7. **Nombres en español** (DV-F10): 43 funciones de acciones y tipos como `User.role: 'usuario'`; ¿se renombran por lote al tocar cada feature o se acepta la convivencia?
8. **Paraguay** (`py`): con T-11 es una fila en `Country`; sin ella, más de 10 lugares (§3.6). Decidir si T-11 va antes de incorporarlo.
9. **Vigencia de la ficha y premium** (P-11), **URL pública** (P-02), **reseña de invitado** (P-05), **visitas** (P-06), **búsqueda tolerante** (P-08), **reclamar ficha** (P-09), **shell de dashboard** (U-21): fuera de este plan.
10. **Si T-01 corresponde a esta línea de trabajo** o a una tarjeta de entorno: el diagnóstico solo la señala.

**Fuera de alcance de esta tarjeta (hechos).** Cualquier cambio de código, el entorno, la app móvil, el cumplimiento jurídico, el rendimiento, producción y los tests E2E.

## Apéndice A. Cómo reproducir los conteos

Comandos (desde la raíz del monorepo; usar `/usr/bin/grep` si `grep` está aliasado a `ugrep`):

```bash
# Capas y violaciones: script de Node que resuelve imports (@/ y relativos) de frontend/src
node grafo.mjs frontend/src detalle.json      # imprime "n capa -> capa"; detalle.json lista archivo => destino

# Importadores de authOptions
rg -l 'app/api/auth/\[...nextauth\]/route' frontend/src | wc -l      # 30

# Estilos (excluyen app/design-system)
rg -c "style=\{\{" frontend/src -g '!app/design-system/**'            # 343 en 84 archivos
rg -o "text-\[[0-9.]+px\]" frontend/src -N -g '!app/design-system/**' # 476

# Botones, confirmaciones y recargas
rg -o "<button\b" frontend/src/features frontend/src/app frontend/src/shared -g '*.tsx' -g '!shared/components/hireeo/**' -g '!app/design-system/**' | wc -l   # 98
rg -n "(^|[^.a-zA-Z])confirm\(" frontend/src/features frontend/src/app frontend/src/shared   # 12
rg -n "location\.reload" frontend/src/features                                                 # 19

# i18n: paridad de claves entre locales (script de Node que aplana los JSON de lib/i18n/locales)

# Línea base (cwd frontend/ y backend/)
pnpm exec tsc --noEmit ; pnpm test ; pnpm lint ; pnpm format:check ; pnpm build
```

Núcleo del script del grafo (resuelve `import`/`export … from`/`import()` y agrupa por `app`, `shared`, `lib` o `features/<x>`):

```js
import fs from 'node:fs'; import path from 'node:path';
const root = process.argv[2]; const files = [];
(function walk(d){ for (const e of fs.readdirSync(d,{withFileTypes:true})) { const p=path.join(d,e.name);
  if (e.isDirectory()) { if (e.name!=='node_modules') walk(p); } else if (/\.(ts|tsx)$/.test(e.name)) files.push(p); } })(root);
const layer = f => { const r = path.relative(root,f).split(path.sep);
  return r[0]==='features' ? 'features/'+r[1] : ['shared','lib','app'].includes(r[0]) ? r[0] : r[0]; };
const edges = {};
for (const f of files) {
  const src = fs.readFileSync(f,'utf8'); const re = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g; let m;
  while ((m = re.exec(src))) { const spec = m[1]||m[2];
    const target = spec.startsWith('@/') ? spec.slice(2) : spec.startsWith('.') ? path.relative(root, path.resolve(path.dirname(f), spec)) : null;
    if (!target) continue; const t = target.split('/');
    const tl = t[0]==='features' ? 'features/'+t[1] : ['shared','lib','app'].includes(t[0]) ? t[0] : null;
    if (!tl || tl===layer(f)) continue; const k = layer(f)+' -> '+tl; edges[k] = (edges[k]||0)+1; }
}
for (const [k,v] of Object.entries(edges).sort()) console.log(String(v).padStart(4), k);
```

## Apéndice B. Registro de la sesión

- Reclamo con la clave `diego-ca179-relevo-1` (relevo del worker anterior, que agotó su límite de uso): no había reserva vigente, checkpoint previo ni documento.
- El mapa del backend se delegó a un agente de exploración de solo lectura; sus afirmaciones se muestrearon (más de 20 verificaciones, sin discrepancias) antes de usarlas.
- No se ejecutaron tests E2E ni se tocó ningún archivo versionado fuera de este documento.
- `.doc/README.md` no se actualizó: la tarjeta pide un único archivo nuevo, aunque el `CLAUDE.md` del proyecto pide mantener ese índice al agregar archivos a `.doc/`. Queda como decisión del jefe al commitear.
- Los artefactos de la verificación (`.next/`, `backend/dist/`, `tsconfig.tsbuildinfo`) están en `.gitignore`; `git status` de los tres repos solo muestra el `AGENTS.md` ajeno y este documento.
