# cookies/cookie-and-tracker-audit — Auditoría de cookies, trackers y SDKs (Fase 5)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales/profesionales.
- **Fecha de corte / ejecución:** 2026-07-23
- **Versión:** 0.1 (inventario verificado sobre código real).
- **Método:** grep exhaustivo y lectura directa de `frontend/src/` y `appmobile/src/` (solo lectura, sin modificar código). Búsquedas: `gtag`, `GTM-`, `G-########`, `googletagmanager`, `google-analytics`, `dataLayer`, `consent`, `fbq`, `hotjar`, `posthog`, `mixpanel`, `segment`, `clarity`, `sentry`, `datadog`, `amplitude`, `vercel/analytics`, `speed-insights`, `tiktok`, `linkedin`, `pinterest`, `snapchat`, `criteo`, `doubleclick`, `adroll`, `matomo`, `plausible`, `fullstory`, `logrocket`, `document.cookie`, `localStorage`, `sessionStorage`, `navigator.geolocation`, `nominatim`, `next/script`, `next/font`.
- **Insumos previos:** `../01-scope-assumptions-and-open-questions.md`, `../02-product-and-data-map.md`, `../code-audit/00-repository-inventory.md` §5.5, `../country-analysis/{spain-eu,argentina,uruguay,united-states-federal,united-states-state-local-matrix}.md`.

> **Aviso.** Documento de investigación técnico-jurídica, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción antes de cualquier uso público. Marcadores: **[HECHO]** (evidencia archivo:línea), **[INFERENCIA]** técnica, **[SUPUESTO]** pendiente, **[OBLIGACIÓN]** vigente, **[FUTURO]** con fecha posterior, **[GUÍA]** no vinculante. No se copian secretos ni datos personales reales.

---

## 0. Resumen ejecutivo

**Confirmado en código: hoy cargan 2 sistemas de tracking de terceros (Google Tag Manager y Google Analytics 4) de forma incondicional, en el `<head>` del layout raíz, ANTES de cualquier interacción y SIN ningún gate de consentimiento, CMP ni Consent Mode.** A ello se suman 3 destinatarios de terceros que reciben datos del usuario en runtime sin aviso (OpenStreetMap Nominatim, tiles de OpenStreetMap y CDN de Cloudflare, estos dos últimos solo en el panel admin). No existe banner de cookies, ni centro de preferencias, ni modelo de registro de consentimiento en la base de datos.

- **Providers de terceros que reciben datos antes del consentimiento: 3** — Google (GTM + GA4, en todo el sitio), OpenStreetMap (geocoding + tiles), Cloudflare (iconos de mapa). Google es el único que **coloca identificadores/cookies** (`_ga`, `_ga_*`, `_gid`, `_gat`) sin base válida.
- **GTM es un multiplicador de riesgo:** un contenedor de Tag Manager puede inyectar en runtime tags adicionales de terceros (Google Ads, Floodlight, Meta, etc.) que **no son verificables desde el código** — solo desde la consola del contenedor `GTM-PT2PFWF9`. **[SUPUESTO — verificar contenido del contenedor].**
- **Cookies/almacenamiento propios (first-party): 3**, todos de categoría **necesaria/funcional** — cookie `hireeo_country`, cookie de sesión NextAuth y una clave de `sessionStorage`. La cookie `hireeo_country` **carece del flag `Secure`**.
- **Marketing:** hoy **no hay** email comercial, SMS ni llamadas implementados. Brevo se usa **solo para correo transaccional**; el push (FCM) es transaccional. **No existe** mecanismo de opt-out/baja porque no existe el canal de marketing. **[HECHO — ausencia].**
- **Fuentes tipográficas:** `next/font/google` **auto-hospeda** las fuentes en build (Geist, Geist Mono, Instrument Serif); **no** genera peticiones a `fonts.gstatic.com` en runtime → no es un tracker. **[HECHO].**

La brecha de consentimiento en `layout.tsx:170-207` es el incumplimiento más claro y sancionable del expediente para España/UE (art. 22.2 LSSI-CE + Guía AEPD 2024 + GDPR), y también relevante para el opt-out estatal de EE. UU. y el estándar de finalidad/consentimiento en Chile (Ley 21.719, vigente 2026-12-01), Argentina y Uruguay.

---

## 1. Inventario COMPLETO y verificado (tabla maestra)

> Columnas por elemento: **Proveedor · Nombre · Finalidad · Datos · Inicio (dónde) · Duración · Categoría · País/Transferencia · ¿Antes o después del consentimiento? · Documentación del proveedor · Corrección requerida.** Categorías: **N** necesaria, **P** preferencias, **A** analítica, **M** marketing.

### 1.1 Scripts y cookies de terceros (browser)

| # | Proveedor | Nombre / ID | Finalidad | Datos | Inicio (evidencia) | Duración | Cat. | País / Transferencia | ¿Antes del consentimiento? | Doc. proveedor | Corrección requerida |
|---|---|---|---|---|---|---|---|---|---|---|---|
| T-1 | Google (Google Tag Manager) | `GTM-PT2PFWF9` (script inline + `<noscript>` iframe) | Contenedor de tags; orquesta la carga de otros scripts/píxeles en runtime | Todo lo que los tags del contenedor decidan leer (identificadores, eventos, IP, referrer); `dataLayer` | `frontend/src/app/layout.tsx:175-183` (head) y `:199-207` (`<noscript>` en body) | El contenedor no fija cookies propias; su duración depende de los tags que cargue | **A/M** (según contenedor) | Google LLC (EE. UU.) — **transferencia internacional** | **SÍ — carga incondicional** [HECHO] | [G-COOKIES], [G-GTM] | Mover a carga condicionada por consentimiento; auditar el contenido real del contenedor y clasificar cada tag |
| T-2 | Google (Analytics 4) | `gtag.js` — property `G-WREYNC9F4M` | Analítica de audiencia y comportamiento | Cliente ID, IP, eventos de página, user-agent, referrer | `frontend/src/app/layout.tsx:185-196` (`<script async>` + `gtag('config',…)`) | ver cookies T-2a…T-2d | **A** | Google LLC (EE. UU.) — **transferencia internacional** | **SÍ — carga incondicional; sin Consent Mode** [HECHO] | [G-GA4], [G-COOKIES] | Bloquear hasta consentimiento; implementar **Consent Mode v2** (`analytics_storage=denied` por defecto) |
| T-2a | Google GA4 | cookie `_ga` | Distinguir usuarios | ID de cliente pseudonimizado | Fijada por gtag.js (T-2) | **2 años** | **A** | Google (EE. UU.) | SÍ | [G-COOKIES] | No fijar antes de consentir |
| T-2b | Google GA4 | cookie `_ga_<container-id>` | Persistir estado de sesión GA4 | ID de sesión/estado | gtag.js (T-2) | **2 años** | **A** | Google (EE. UU.) | SÍ | [G-COOKIES] | No fijar antes de consentir |
| T-2c | Google GA4/UA | cookie `_gid` | Distinguir usuarios | ID de cliente | gtag.js (T-2) | **24 horas** | **A** | Google (EE. UU.) | SÍ | [G-COOKIES] | No fijar antes de consentir |
| T-2d | Google GA4/UA | cookie `_gat` / `_gat_gtag_*` | Limitar tasa de peticiones | — (throttling) | gtag.js (T-2) | **~1 minuto** | **A** | Google (EE. UU.) | SÍ | [G-COOKIES] | No fijar antes de consentir |
| T-3 | Google | `preconnect` / `dns-prefetch` a `googletagmanager.com`, `google-analytics.com` | Optimización de red para T-1/T-2 | Ninguna cookie; sí una conexión temprana que revela IP a Google | `frontend/src/app/layout.tsx:170-171` | N/A (hint de red) | **A** (accesorio) | Google (EE. UU.) | SÍ | — | Retirar los hints si se difiere GTM/GA4 hasta consentir |
| T-4 | OpenStreetMap Foundation (Nominatim) | `nominatim.openstreetmap.org/reverse` y `/search` | Geocodificación (coordenadas ↔ dirección) | **lat/long** y **IP** del cliente; en cliente son coords **precisas** | Cliente: `frontend/src/features/home/components/HeroSearchBar/HeroSearchBar.tsx:105`, `shared/components/hireeo/ui/ChatIA/ChatIA.tsx:263`, `features/users/components/admin/AddressForm/AddressForm.tsx:139`. Servidor (coords redondeadas): `app/(country)/[country]/(public)/search/page.tsx:19` | Sin cookie; transferencia puntual por request | **N/funcional** (si el usuario pide geolocalizar) pero implica dato de mayor riesgo | UE (servidores OSMF) + posible CDN | Client-side: **SÍ, tras acción del usuario** (permiso del navegador), **sin aviso de tercero** | [OSM-PRIV] | Aviso de tercero + minimización (redondear coords también en cliente); base y transparencia |
| T-5 | OpenStreetMap (tiles) | `tile.openstreetmap.org` | Render de mapa (Leaflet) | **IP** del cliente, viewport | `frontend/src/features/users/components/admin/MapPicker/MapPicker.tsx:65` | Caché de tiles del navegador | **N/funcional** (solo panel admin) | UE (OSMF) | Al abrir el mapa en admin | [OSM-PRIV] | Ámbito admin; aviso interno; considerar tiles propios/self-host |
| T-6 | Cloudflare (cdnjs) | `cdnjs.cloudflare.com/.../leaflet/1.7.1/images/marker-*.png` | Iconos del marcador de Leaflet | **IP** del cliente | `frontend/src/features/users/components/admin/MapPicker/MapPicker.tsx:11-13` | Caché del navegador | **N/funcional** (solo panel admin) | Cloudflare (EE. UU./global) — **transferencia** | Al abrir el mapa en admin | [CF-PRIV] | **Self-host** de los iconos (elimina la transferencia trivialmente) |

### 1.2 Cookies y almacenamiento propios (first-party) — no requieren consentimiento pero sí higiene/divulgación

| # | Proveedor | Nombre | Finalidad | Datos | Inicio (evidencia) | Duración | Cat. | ¿Consentimiento? | Corrección requerida |
|---|---|---|---|---|---|---|---|---|---|
| F-1 | Hireeo | cookie `hireeo_country` | Recordar el país elegido (routing multi-país) | Código de país (`cl`/`ar`/`uy`/`es`/`us`) | `frontend/src/features/home/components/HeroCountrySelector/HeroCountrySelector.tsx:26`; `shared/components/layout/Footer/Footer.tsx:91` | **1 año** (`max-age=31536000`) | **N/preferencias** | No requiere (funcional) | **Añadir flag `Secure`** (hoy `SameSite=Lax`, sin `Secure`, no httpOnly por diseño). Ref. `00-repository-inventory.md` §5.5 LOW |
| F-2 | Hireeo (NextAuth) | cookie de sesión `next-auth.session-token` / `__Secure-next-auth.session-token` | Autenticación de sesión (JWT) | Token de sesión JWT | `frontend/src/app/api/auth/[...nextauth]/route.ts:174` (`session: { strategy:'jwt', maxAge: 30d }`) | **30 días** | **N** (estrictamente necesaria) | No requiere (esencial) | Correcta: httpOnly/SameSite=Lax/Secure por defecto en prod (control positivo) |
| F-3 | Hireeo | `sessionStorage` clave intro-seen | No repetir la animación de intro del home | Flag `'1'` | `frontend/src/features/home/components/HeroScrollIntro/HeroScrollIntro.tsx:18-26` | Sesión del navegador | **N/preferencias** | No requiere (funcional) | Declararla en la política de cookies (transparencia) |

### 1.3 Telemetría first-party (no es cookie de terceros, sí requiere divulgación)

| # | Proveedor | Nombre | Finalidad | Datos | Inicio (evidencia) | Cat. | ¿Consentimiento? | Corrección requerida |
|---|---|---|---|---|---|---|---|---|
| FP-1 | Hireeo (backend propio) | `POST /interactions` | Métricas de contacto/valor del anuncio (ver teléfono, WhatsApp, etc.) | `serviceId`, `type`, `userId?` (si hay sesión) | `frontend/src/features/analytics/actions/mutations.ts:10-24` → backend `Interaction` | **A first-party** | No es consentimiento de cookies de terceros; sí **divulgación** en política de privacidad | Documentar finalidad y base; el `metadata` Json del modelo `Interaction` debe minimizarse (`02` §3.7) |

### 1.4 App móvil (`appmobile/`)

| # | Elemento | Evidencia | Observación |
|---|---|---|---|
| M-1 | `expo-secure-store` (nativo) / `localStorage` (fallback web) para tokens, locale y país | `appmobile/src/shared/lib/storage.ts:2-23`; `features/i18n/context/LocaleContext.tsx`; `features/country/context/CountryContext.tsx` | Almacenamiento de auth/preferencias, no tracking. **[HECHO]** El fallback a `localStorage` en web expone tokens a XSS (`00-repository-inventory.md` §5.5 HIGH). |
| M-2 | Push (Firebase FCM) vía `DeviceToken` | `backend/.../notifications.service.ts` | Notificaciones transaccionales. Sin SDK de analítica móvil. |
| M-3 | **Ausentes:** Firebase Analytics, `gtag`, AppTrackingTransparency/IDFA, cualquier CMP | Búsqueda negativa en `appmobile/src` | No hay tracking de terceros en la app móvil hoy. **[HECHO — ausencia].** |

---

## 2. Terceros buscados y NO presentes (búsquedas negativas)

Confirmado por grep (resultado vacío = ausencia en el código a la fecha):

`Facebook Pixel/fbq`, `Meta Conversions API`, `Hotjar`, `PostHog`, `Mixpanel`, `Segment`, `Microsoft Clarity`, `Sentry`, `Datadog`, `Amplitude`, `@vercel/analytics`, `@vercel/speed-insights`, `FullStory`, `LogRocket`, `Smartlook`, `Matomo`, `Plausible`, `TikTok Pixel`, `LinkedIn Insight Tag`, `Pinterest Tag`, `Snapchat Pixel`, `Criteo`, `DoubleClick`, `AdRoll`, `Google Maps JS API`, `Mapbox`.

> Nota: las apariciones de `FACEBOOK`/`LINKEDIN`/`TIKTOK` en el código son **valores de enum de redes sociales del prestador** (`features/services/schemas/serviceSchemas.ts`, etc.), **no** píxeles de tracking. **[HECHO].**

---

## 3. Hallazgos de implementación real (qué carga sin consentimiento, qué falta)

| ID | Hallazgo | Evidencia | Severidad | Norma tocada |
|---|---|---|---|---|
| C-01 | **GTM + GA4 se cargan incondicionalmente en `<head>`/`<body>` sin gate de consentimiento** | `layout.tsx:170-207` | **CRITICAL (IJ)** | LSSI-CE art. 22.2 + Guía AEPD 2024 + GDPR 6.1.a (ES/UE); opt-out estatal US; finalidad/consentimiento CL/AR/UY |
| C-02 | **No existe Consent Mode v2** (`gtag('consent','default',{…denied})` ausente; grep solo devuelve las líneas `config`) | `layout.tsx:185-196` | **HIGH (IJ)** | GDPR/ePrivacy; señales de consentimiento de Google |
| C-03 | **No existe CMP ni banner de cookies** en `frontend/src` ni `appmobile/src` | Búsqueda negativa; `00-repository-inventory.md` §5.5 HIGH | **HIGH (IJ)** | Consentimiento previo, granular, revocable (ES/UE); UOOM/GPC (US) |
| C-04 | **No existe modelo de registro de consentimiento** en la base de datos (no hay prueba de consentimiento) | `00-repository-inventory.md` §2 "Ausencias notables" | **HIGH (IJ)** | GDPR (prueba del consentimiento, art. 7.1); accountability |
| C-05 | **El enlace "cookies" del footer apunta a `/privacy`**; no hay política de cookies dedicada | `Footer.tsx:138-155`; `01` E-22 | **MEDIUM (IJ)** | Deber de información específica sobre cookies (Guía AEPD) |
| C-06 | **Transferencia a Google (EE. UU.) al cargar la página**, sin base ni aviso | `layout.tsx:170-196` | **HIGH (IJ)** | GDPR 44-49 (transferencias); depende de DPF/SCC — Q9 |
| C-07 | **GTM puede inyectar tags de terceros no auditables desde el código** | `layout.tsx:175-183` (contenedor `GTM-PT2PFWF9`) | **HIGH (IJ) — [SUPUESTO]** | El alcance real depende del contenido del contenedor |
| C-08 | **Geolocalización precisa enviada a OSM Nominatim sin aviso de tercero** | `HeroSearchBar.tsx:96-110`, `ChatIA.tsx:263` | **MEDIUM (IJ)** | Transparencia; dato de mayor riesgo (geo precisa) |
| C-09 | **Iconos de mapa desde Cloudflare cdnjs** (transferencia trivialmente evitable) | `MapPicker.tsx:11-13` (admin) | **LOW (IJ)** | Transferencia + defensa en profundidad (self-host) |
| C-10 | **Cookie `hireeo_country` sin flag `Secure`** | `HeroCountrySelector.tsx:26`, `Footer.tsx:91` | **LOW (VT)** | Buena práctica; endurecer atributos de cookie |
| C-11 | **Ausencia total de mecanismo de opt-out/baja de marketing** porque no hay canal de marketing implementado (Brevo = solo transaccional; FCM = transaccional) | Búsqueda negativa `unsubscribe/newsletter/marketing/campaign` en `backend/src`; `email.service.ts:13,21` | **INFO / CONDITIONAL** | Se activa CAN-SPAM/TCPA (US), art. 27 Ley 25.326 + No Llame (AR), ePrivacy/LSSI (ES) **antes de la primera campaña** |

---

## 4. Reglas de consentimiento por jurisdicción (estándar aplicable a Hireeo)

> El estándar más protector (ES/UE) marca el diseño global; las particularidades locales se anotan. Detalle y citas en los archivos `country-analysis/`.

| Jurisdicción | Estándar de consentimiento para cookies/tracking no esencial | Marketing (email/SMS/push) | Fuente |
|---|---|---|---|
| **España / UE** | **Consentimiento previo, granular, informado, libre y revocable**; rechazar tan fácil como aceptar; **sin casillas premarcadas**; no cargar identificadores no funcionales antes de consentir; conservar prueba; re-consentir periódicamente. Consent Mode como control técnico. | Opt-in (LSSI arts. 20-21); separar transaccional de comercial | GDPR 6.1.a/7; ePrivacy 5(3); LSSI-CE 22.2; Guía AEPD ene-2024; CEPD "consent or pay" abr-2024 — `country-analysis/spain-eu.md` §4.4, §14 |
| **Chile** | **Ley 21.719 (vigente 2026-12-01):** consentimiento **libre, informado, específico e inequívoco**; **derecho a revocar** en cualquier momento con la **misma facilidad** con que se otorgó; banner de cookies **opt-in** y **privacidad por defecto** conforme a recomendaciones del **SERNAC**. Hoy (Ley 19.628) rige consentimiento previo; el estándar sube el 2026-12-01. | Consentimiento + baja efectiva | Ley 21.719 (pub. 2024-12-13, vigencia 2026-12-01) — [CL-21719-1], [CL-21719-2] |
| **Argentina** | Ley 25.326 **no tiene regla nacional de cookies equivalente a ePrivacy**; rigen **información + consentimiento cuando corresponda + finalidad + derechos**. Control prudente: **CMP y bloqueo previo de trackers no esenciales**; validar interpretación AAIP local. | Toda comunicación promocional debe permitir **retiro/bloqueo** y revelar responsable; **No Llame** cada 30 días para telefonía | Ley 25.326 arts. 5-6, 27; Dec. 1558/2001; Ley 26.951 — `country-analysis/argentina.md` §"Datos, cookies, IA y comunicaciones" |
| **Uruguay** | Ley 18.331 cubre **finalidad/consentimiento y derecho de supresión**; **no** se localizó regla específica de cookies. Control prudente: **deshabilitar GTM/GA4 hasta que el usuario elija** la categoría no esencial; conservar prueba y permitir retirarla. | Consentimiento o base válida + baja efectiva + lista de supresión; separar transaccional/comercial | Ley 18.331 arts. 5, 9, 13, 16 — `country-analysis/uruguay.md` §"Privacidad, IA y comunicaciones" |
| **EE. UU. (estatal)** | No hay "consentimiento previo" tipo UE, pero: **honrar GPC / Universal Opt-Out (UOOM)** donde aplique (CO, CT desde 2024-07-01; otros), ofrecer **"Do Not Sell/Share"** y **opt-out de targeted advertising/profiling** si GA4/GTM constituye "sale"/"share"; **consentimiento para sensitive data** (geolocalización precisa). Aplicabilidad por umbral. | **CAN-SPAM**: baja en ≤10 días hábiles; **TCPA**: consentimiento antes de SMS/llamadas automáticas | `country-analysis/united-states-state-local-matrix.md` §17-19, 92; `united-states-federal.md` §CAN-SPAM/TCPA |

**Conclusión transversal:** aunque solo España/UE exige un "consentimiento previo" estricto para cookies, **el diseño de una CMP con bloqueo previo de trackers no esenciales satisface simultáneamente** el estándar UE, el opt-out/GPC de EE. UU. y el criterio prudente de finalidad/consentimiento de Chile (2026-12-01), Argentina y Uruguay. Es la solución técnica única y más eficiente.

---

## 5. Comunicaciones: transaccionales vs. comerciales (estado actual)

| Canal | Estado en código | Naturaleza | Obligación aplicable si se activa marketing |
|---|---|---|---|
| **Email (Brevo)** | Implementado **solo transaccional** (`/v3/smtp/email`, envío por-mensaje con `subject`/`html`) — `email.service.ts:13,21-40`. Sin endpoint de listas/campañas/newsletter. | Transaccional | Antes de comercial: opt-in (ES/CL/UY), art. 27+opt-out (AR), CAN-SPAM (US). Contratar Brevo **no** transfiere la responsabilidad |
| **Push (FCM)** | `DeviceToken` + envío transaccional — `notifications.service.ts` | Transaccional | Consentimiento del canal push para promocional; opt-out por preferencia |
| **SMS / llamadas** | **No implementado** (búsqueda negativa) | — | TCPA (US), No Llame (AR) antes de cualquier campaña |
| **WhatsApp** | Solo como **acción de contacto entre usuarios** (`Interaction` VIEW/WHATSAPP), no campaña de la plataforma | No es marketing de Hireeo | — |

> **[HECHO — ausencia]:** no existe hoy ningún flujo de marketing masivo ni, por tanto, mecanismo de baja/supresión. Esto **no es una brecha vigente**, pero es un **prerrequisito CONDITIONAL** antes de la primera campaña (registrar consentimiento, centro de preferencias, lista de supresión, doble opt-in donde aplique).

---

## 6. Matriz: obligación → evidencia → propietario → prioridad → fecha objetivo

| # | Obligación | Norma | Evidencia repo | Brecha | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|---|---|---|
| 1 | Consentimiento previo + CMP con bloqueo de trackers no esenciales | LSSI 22.2 + Guía AEPD 2024 + GDPR 6.1.a; UOOM/GPC US; Ley 21.719 CL | `layout.tsx:170-207` (C-01) | Total | Engineering + Legal | **P0 — bloqueador de lanzamiento** | Pre-lanzamiento `/es` |
| 2 | Google Consent Mode v2 (`denied` por defecto) | GDPR/ePrivacy | `layout.tsx:185-196` (C-02) | Total | Engineering | **P0** | Con la CMP |
| 3 | Registro/prueba de consentimiento (modelo en DB) | GDPR art. 7.1 | Ausencia (C-04) | Total | Engineering + Legal | P1 | Con la CMP |
| 4 | Política de cookies dedicada + relink del footer | Guía AEPD | `Footer.tsx:138-155` (C-05) | Alta | Legal | P1 | Pre-lanzamiento |
| 5 | Aviso de tercero + minimización en geocoding (Nominatim) | Transparencia GDPR/ley local | `HeroSearchBar.tsx:96-110` (C-08) | Media | Product + Eng | P2 | Pre-lanzamiento |
| 6 | Self-host de iconos de mapa (Cloudflare) | Transferencia/def. en profundidad | `MapPicker.tsx:11-13` (C-09) | Baja | Engineering | P3 | Continuo |
| 7 | Flag `Secure` en `hireeo_country` | Buena práctica | `HeroCountrySelector.tsx:26` (C-10) | Baja | Engineering | P3 | Con la CMP |
| 8 | Centro de preferencias + opt-out/baja **antes de** activar marketing | CAN-SPAM/TCPA; art.27 AR; ePrivacy | Ausencia (C-11) | Condicional | Marketing + Eng + Legal | P1 (antes de campaña) | Antes de 1ª campaña |
| 9 | Verificar contenido real del contenedor GTM y clasificar cada tag | ePrivacy/GDPR | `layout.tsx:175-183` (C-07) | Por auditar | Marketing + Eng | P0 | Con la CMP |

---

## 7. Registro de fuentes (acceso 2026-07-23)

> Fuentes primarias **[P]**; secundarias/orientativas **[S]**. Las normas UE/AR/UY/US citadas se registran en detalle en los respectivos `country-analysis/*`. Aquí se añaden las fuentes de proveedor y de Chile.

- **[S/P]** [G-COOKIES] Google — «Uso de cookies de Google Analytics/gtag.js y sus duraciones» — developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage (nombres/duraciones `_ga`/`_gid`/`_gat`).
- **[S/P]** [G-GA4] Google — Google Analytics 4 / gtag.js docs — developers.google.com/analytics/devguides/collection/ga4.
- **[S/P]** [G-GTM] Google — Google Tag Manager docs — developers.google.com/tag-platform/tag-manager.
- **[S/P]** [G-CONSENT] Google — Consent Mode v2 — developers.google.com/tag-platform/security/guides/consent.
- **[S]** [OSM-PRIV] OpenStreetMap Foundation — Privacy Policy / Nominatim Usage Policy — osmfoundation.org/wiki/Privacy_Policy; operations.osmfoundation.org/policies/nominatim.
- **[S]** [CF-PRIV] Cloudflare — cdnjs (servido por Cloudflare) — cdnjs.com; cloudflare.com/privacypolicy.
- **[P/S]** [CL-21719-1] Chile — Ley 21.719 (pub. Diario Oficial 2024-12-13; vigencia **2026-12-01**), reforma de protección de datos personales. Verificar texto en bcn.cl/leychile antes de publicar.
- **[S]** [CL-21719-2] Guías divulgativas Ley 21.719 (consentimiento libre/informado/específico/inequívoco; revocación; banner opt-in con recomendaciones SERNAC) — preyproject.com/es/blog/ley-de-proteccion-de-datos-en-chile; lawwwing.com; anami.cl. **Secundarias — validar contra fuente primaria y con abogado chileno.**

> **Pendiente Fase 3:** no existe `country-analysis/chile.md`. El estándar chileno aquí resumido es preliminar (fuentes secundarias) y debe consolidarse en ese archivo con fuente primaria (BCN/LeyChile) y confirmar el estándar exacto de cookies bajo la nueva Agencia de Protección de Datos.

---

## 8. Revisión por abogado local pendiente / hechos a confirmar

- Contenido real del contenedor **GTM `GTM-PT2PFWF9`** (qué tags/píxeles carga) — **[SUPUESTO C-07]**.
- Certificación **DPF** de Google/Stripe y **DPA/SCC** firmados (Q9) para legitimar la transferencia a EE. UU. — `country-analysis/spain-eu.md` §4.4.
- Configuración fuera del repo de **GA4** (IP anonymization, retención, Consent Mode) — Q16 de `01`.
- Estándar chileno definitivo de cookies bajo **Ley 21.719** (fuente primaria + Agencia) y su interacción con recomendaciones SERNAC.
- Si en el futuro GA4/GTM constituye **"sale"/"share"/targeted advertising** bajo leyes estatales de EE. UU. (activa Do Not Sell/Share y GPC).
- Base y proceso de **opt-out** antes de habilitar cualquier canal de marketing (email/SMS/push).
