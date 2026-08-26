# 00 — Inventario de Repositorio y Auditoría de Código (FASE 1.1)

> **Proyecto:** Hireeo — Marketplace multi-país de servicios manuales con capacidades de IA.
> **Fecha de corte:** 2026-07-23
> **Alcance:** Auditoría técnica de **solo lectura** (no se modificó ningún archivo de código). Cubre arquitectura, rutas/APIs, modelo de datos, integraciones de terceros y hallazgos de seguridad/privacidad clasificados por severidad.
> **Método:** Inspección directa de `frontend/` (Next.js 16, submódulo `hireeo-front`), `backend/` (NestJS 10 + Prisma 7, submódulo `hireeo-back`) y `appmobile/` (Expo SDK 54, submódulo `hireeo-mobile`).
> **Limitaciones:** No se ejecutó SBOM transitivo ni escaneo dinámico (SAST/DAST). Las licencias reportadas son de dependencias **directas**. No se auditó la configuración de producción (no desplegada). Nada de esto constituye asesoramiento jurídico.

## Convención de severidad

| Nivel | Significado |
|-------|-------------|
| `CRITICAL` | Explotable de forma directa con impacto grave (fuga masiva de PII, RCE, bypass total de auth) o incumplimiento legal seguro con sanción alta. |
| `HIGH` | Vulnerabilidad seria o incumplimiento probable que debe resolverse antes del lanzamiento. |
| `MEDIUM` | Debilidad relevante o carencia de control esperado; remediar en el corto plazo. |
| `LOW` | Buena práctica no cumplida; riesgo acotado. |
| `INFO` | Observación / control correcto / contexto. |

> Se distingue **vulnerabilidad técnica** (defecto de seguridad en el código) de **incumplimiento jurídico potencial** (obligación legal no soportada por el código). Muchos hallazgos son ambos.

---

## 1. Perfil de producto confirmado (desde el código)

- **Naturaleza:** marketplace/intermediario que conecta clientes con prestadores de servicios manuales. Publicación de servicios, búsqueda geográfica, perfiles, mensajería (chat cliente↔prestador), calificaciones/reseñas moderadas, solicitudes de servicio + cotizaciones (quotes), suscripciones premium, publicidad (sponsors) y funciones de IA.
- **Países activos en código:** Chile (`cl`), Argentina (`ar`), Uruguay (`uy`), España (`es`), Estados Unidos (`us`). Detección de país en `frontend/src/proxy.ts:8` (`SUPPORTED_COUNTRIES`).
- **Dominio único** con subpaths por país (`/cl`, `/ar`, …). Producción **no desplegada** aún.
- **Roles:** `Client`, `Professional`, `Admin`, `SuperAdmin` — `backend/src/common/enums/role.enum.ts:1-6`.
- **Modelo de ingreso (desde schema/módulos):** suscripción premium por servicio (`Subscription`, `PremiumPrice`), destacados/publicidad (`Sponsor`). Comisiones/escrow: ver módulo `escrow` (pendiente confirmar si funcional o stub — sección hallazgos).

### 1.1 Superficie de módulos backend (`backend/src/modules/`)

`ai-agents`, `auth`, `categories`, `chat`, `chatbot`, `crm`, `email`, `escrow`, `favorites`, `geo`, `integrations`, `interactions`, `kyc`, `notifications`, `payments`, `prices`, `quotes`, `ratings`, `service-requests`, `services`, `sponsors`, `subscriptions`, `upload`, `users`.

> Nota: la superficie real (KYC, escrow, chatbot, ai-agents, crm, integrations) es **más amplia** que la descrita en `CLAUDE.md`. Esto es material para el mapa de datos y la clasificación de IA.

### 1.2 Route Handlers frontend (`frontend/src/app/api/`)

| Ruta | Archivo | Función |
|------|---------|---------|
| `/api/auth/[...nextauth]` | `frontend/src/app/api/auth/[...nextauth]/route.ts` | Auth.js v4 (Credentials + Google/Apple/Azure) |
| `/api/upload` | `frontend/src/app/api/upload/route.ts` | Subida de archivos (Cloudinary) |
| `/api/revalidate` | `frontend/src/app/api/revalidate/route.ts` | Revalidación ISR |
| `/api/payments/stripe-session` | `frontend/src/app/api/payments/stripe-session/route.ts` | Crea sesión de checkout Stripe |
| `/api/webhooks/stripe` | `frontend/src/app/api/webhooks/stripe/route.ts` | Webhook Stripe |
| `/api/webhooks/mercadopago` | `frontend/src/app/api/webhooks/mercadopago/route.ts` | Webhook MercadoPago |

### 1.3 Aplicación móvil (`appmobile/`)

Permisos declarados en `appmobile/app.json`:
- **Ubicación** (foreground; background deshabilitado) — `app.json:19-24` (`expo-location`).
- **Fotos / Cámara** (foto de perfil) — `app.json:30-31` (`expo-image-picker`).
- **Notificaciones push** — `app.json:35` (`expo-notifications` → tokens en modelo `DeviceToken`).
- Almacenamiento seguro de tokens: `expo-secure-store` (`appmobile/package.json`). `expo-device` recoge info de dispositivo.

---

## 2. Modelo de datos (Prisma) — categorías de datos personales

Fuente: `backend/prisma/schema.prisma`. Se listan solo los modelos con datos personales (PII) o relevantes a cumplimiento.

| Modelo | Campos PII / sensibles | Línea | Notas de privacidad |
|--------|------------------------|-------|---------------------|
| `User` | `email` (único), `password` (nullable), `name`, `phone`, `avatar`, `googleId`/`appleId`/`microsoftId`, `isKycVerified`, `kycVerifiedAt` | `schema.prisma:139-171` | Sin `emailVerified`, sin campos de MFA, sin tokens de reset. |
| `Address` | `street`, `number`, `apartment`, `zipCode`, `reference`, `latitude`/`longitude` (Decimal 10,8 / 11,8 = **geolocalización precisa**) | `schema.prisma:507-538` | Geolocalización precisa = dato sensible en varias jurisdicciones (US state laws). |
| `Service` | `contactName`, `contactEmail`, `contactPhone`, `images[]` | `schema.prisma:241-289` | Datos de contacto del prestador expuestos públicamente. |
| `Rating` | `comment`, `ownerResponse`, `status` (PENDING/ACTIVE/DELETED) | `schema.prisma:291-310` | Contenido generado por usuario, moderado. |
| `Message` / `Conversation` | `text` (comunicaciones privadas cliente↔prestador, en claro) | `schema.prisma:430-465` | Comunicaciones privadas sin cifrado a nivel de aplicación. |
| `ServiceRequest` / `Quote` | `description`, `message`, `price` | `schema.prisma:469-505` | Datos transaccionales. |
| `Interaction` | `type` (VIEW_PHONE/VIEW_EMAIL/CALL/WHATSAPP), `userId?`, `metadata` (Json) | `schema.prisma:377-392` | Telemetría de comportamiento; `metadata` es Json libre. No se detectó captura server-side de IP/User-Agent. |
| `DeviceToken` | `token`, `platform` | `schema.prisma:540-552` | Tokens push (FCM). |
| `Subscription` | `paymentMethod`, `paymentStatus`, `transactionId` | `schema.prisma:312-334` | **No** almacena PAN/CVV; referencia a transacción del PSP. |
| `Integration` | `credentials` (string cifrado AES-256-GCM) | `schema.prisma:556-570` | Credenciales de TODOS los proveedores cifradas en DB. |
| `IntegrationAuditLog` | `userId`, `action`, `provider`, `metadata` | `schema.prisma:572-586` | Auditoría de cambios de integraciones (control positivo). |

**Ausencias notables en el modelo de datos (incumplimiento potencial de privacidad):**
- No hay modelo de **registro de consentimiento** (cookies/marketing) — relevante GDPR/ePrivacy, ley 19.628 CL, LPDP UY/AR.
- No hay modelo de **solicitudes de derechos** (acceso/borrado/portabilidad) ni **retención**/soft-delete de cuenta.
- No hay `emailVerified` ni verificación de identidad de email.

---

## 3. Infraestructura y configuración de seguridad

- **Backend NestJS** (`backend/src/main.ts`):
  - `helmet()` activo — `main.ts:26` (cabeceras HTTP seguras en la API).
  - **CORS** con orígenes desde `FRONTEND_URL` (lista separada por coma), `credentials: true` — `main.ts:29-34`.
  - `ValidationPipe` global con `whitelist: true, forbidNonWhitelisted: true, transform: true` — `main.ts:49-58` (control positivo: rechaza campos no declarados en DTO).
  - Filtro global `PrismaExceptionFilter` (`main.ts:43`) e interceptor `SerializeInterceptor` (`main.ts:46`).
  - Swagger **solo fuera de producción** — `main.ts:63`.
  - Desplegado como **función serverless en Vercel** — `main.ts:86-93`; `backend/vercel.json` reescribe todo a `/api`.
- **Rate limiting global:** `ThrottlerModule` (short 10 req/1s, long 100 req/60s) + `ThrottlerGuard` global — `backend/src/app.module.ts:40-43,70-74`.
- **Guards globales:** `ThrottlerGuard` + `ApiKeyGuard` — `app.module.ts:70-78`.
- **Frontend Next.js** (`frontend/next.config.ts`): **no define cabeceras de seguridad** (`headers()` ausente → sin CSP, HSTS, X-Frame-Options, Referrer-Policy propios). `remotePatterns` permite imágenes de `res.cloudinary.com`, `images.unsplash.com`, `placehold.co`, `*.googleusercontent.com`, `loremflickr.com`, `*.public.blob.vercel-storage.com`.
- **`proxy.ts`** (edge): detección de país por cookie `hireeo_country` > CF/Vercel geo header > Accept-Language > `cl` (`proxy.ts:35-53`); autorización admin en edge (`proxy.ts:75-107`); protección de **open redirect** en callbackUrl (solo rutas relativas, `proxy.ts:129-131`). Solo añade header `x-hireeo-lang` (`proxy.ts:154`).

---

## 4. Dependencias directas y licencias (revisión preliminar)

Fuente: `backend/package.json`, `frontend/package.json`.

- **Sin copyleft fuerte (AGPL/GPL) detectado entre dependencias directas.** Predominan MIT / Apache-2.0 / BSD (NestJS, Next.js, React, Prisma, class-validator, helmet, bcrypt, stripe, cloudinary, firebase-admin, socket.io, zod, leaflet/BSD-2).
- **Proveedores de IA (directas):** `@google/generative-ai`, `@ai-sdk/google`, `ai` (Vercel AI SDK), `@google/genai` (frontend) → **Google Gemini**.
- **A verificar (INFO):**
  - `gsap@^3.15.0` — históricamente licencia propietaria "no-charge"; desde 2024 es libre bajo Webflow, pero conviene confirmar la licencia efectiva de la versión fijada.
  - `sileo@^0.1.5` (frontend) — paquete poco conocido/versión temprana → **riesgo de cadena de suministro** y licencia a verificar.
  - `react-icons@^5.5.0` presente pese a la regla de `CLAUDE.md` de usar solo el MCP `icons0` (nota de gobernanza interna, no legal).
- **No existe archivo `LICENSE`/`NOTICE` ni SBOM** en el repo raíz ni en submódulos → pendiente para due diligence de IP (FASE 9). Falta escaneo de licencias **transitivas**.

---

## 5. Hallazgos de seguridad y privacidad

> Cada hallazgo: `[SEVERIDAD] Título — archivo:línea`. Se indica si es **vulnerabilidad técnica (VT)**, **incumplimiento jurídico potencial (IJ)** o ambos, y obligación/riesgo.

### 5.1 Autenticación y autorización

**[HIGH · VT/IJ] Tokens de backend expuestos al cliente en el payload de sesión** — `frontend/src/app/api/auth/[...nextauth]/route.ts:138-139`
El callback `session` copia `backendToken` y `backendRefreshToken` (refresh de 30 días) al objeto de sesión, legible vía `useSession()` / `GET /api/auth/session` desde JS del navegador. Anula la protección httpOnly. **Riesgo:** robo de tokens vía XSS → suplantación prolongada. **Obligación:** seguridad de credenciales (GDPR art. 32; deber de seguridad ley 19.628 CL, LPDP UY/AR).

**[HIGH · VT/IJ] `GET /users` sin autenticación ni control de rol — enumeración masiva de PII** — `backend/src/modules/users/users.controller.ts:34-50` → `users.service.ts:22-37`
Lista todos los usuarios con `email` y `phone`, protegido solo por el `ApiKeyGuard` global. Cualquier request con la API key (la del propio frontend) enumera todos los usuarios y su PII. **Riesgo:** brecha de datos personales a escala. 

**[HIGH · VT/IJ] IDOR en direcciones de usuario** — `backend/src/modules/users/users.controller.ts:135-169` → `users.service.ts:241-295`
Los endpoints de direcciones usan el `:id` de la URL como `userId` sin contrastarlo con el JWT. `getAddresses` (`:241-251`) permite listar direcciones (calle, localidad, geolocalización) de cualquier usuario; `createAddress` (`:253-266`) crear a nombre de otro; `update/delete` (`:268-295`) validan `address.userId === :id` pero `:id` lo controla el atacante. Contrasta con `update`/`delete` de usuario que sí atan al requester (`:130-131`, `:230-233`). **Riesgo:** fuga y manipulación de datos de ubicación (dato sensible).

**[HIGH · VT/IJ] Google OAuth no valida `aud` (client ID) del id_token** — `backend/src/modules/auth/auth.service.ts:151-166`
Verifica el token contra `tokeninfo` pero no comprueba la audiencia. Un id_token emitido para OTRA app sería aceptado (confused deputy / token reuse). Apple sí valida `audience` (`:198`); Microsoft tampoco valida audiencia/tenant (`:241-257`, MEDIUM/HIGH). **Riesgo:** bypass de autenticación / apropiación de cuenta.

**[HIGH · IJ] Scoping por país no validado en `RolesGuard`** — `backend/src/common/guards/roles.guard.ts:12-25`
El guard solo comprueba pertenencia de rol; ignora el `country` del token/recurso (presente en el JWT, `current-user.decorator.ts:8`). Un `Admin` de un país puede operar sobre recursos de otro donde el endpoint solo exija `@Roles(Role.ADMIN)`. `RolesGuard` **no es global** (solo donde se declara), por lo que endpoints que lo omitan quedan sin control de rol. **Riesgo:** acceso administrativo transfronterizo indebido.

**[MEDIUM · VT/IJ] Ausencia de verificación de email y de recuperación de contraseña** — schema `User` sin `emailVerified`; sin endpoint de forgot/reset (`frontend` solo tiene label i18n `"forgotPassword"`)
Permite registrar cuentas con emails ajenos y deja un enlace muerto de recuperación. Sin MFA/2FA (búsqueda: 0 resultados). **Riesgo:** apropiación de identidad, imposibilidad de recuperar cuenta.

**[MEDIUM · VT] Enumeración de usuarios en registro** — `backend/src/modules/auth/auth.service.ts:55`
Responde `409 'El email ya está registrado'`, revelando existencia del email (login sí usa mensaje genérico, correcto). **[MEDIUM/HIGH · IJ]** `GET /users/:id` "perfil público" devuelve email y teléfono (`users.controller.ts:74-78`).

**[LOW · VT]** Algoritmo JWT no fijado (`algorithms` no restringido) — `backend/src/modules/auth/jwt.strategy.ts:15-19`. **[LOW]** `GET /users/roles` sin guard (`users.controller.ts:52-55`). **[LOW]** `API_KEY` global compartida, no rota por cliente.

**[INFO · positivo]** bcrypt 12 rondas (`auth.service.ts:15,57,102`); `ApiKeyGuard`/`ServiceTokenGuard` con comparación en tiempo constante (`common/utils/timing-safe.ts:8-14`); `SerializeInterceptor` elimina `password`/`refreshToken` salvo `@ExposeTokens()` (`serialize.interceptor.ts:14-16`); sin tokens en logs; protección de open redirect en `proxy.ts:129-131`; NextAuth sesión JWT con cookies default httpOnly/lax/secure.

### 5.2 Funciones de IA (Google Gemini `gemini-2.5-flash`)

> Contexto: **3 SDKs distintos** para Gemini — backend `ai-agents` (`@ai-sdk/google`, `ai-agents.service.ts:27-30`), backend `chatbot` (`@google/generative-ai`, `chatbot.service.ts:27-35`), frontend (`@google/genai`, `geminiService.ts:4`, `matchmaking.ts:6`). 6 casos de uso reales (no stubs): agente conversacional con tool-calling que puede escribir en DB, clasificación de categoría, matchmaking (decide qué proveedores ve el usuario), sugerencia de búsqueda, generación de descripciones SEO, y creación de borrador de solicitud.

**[HIGH · VT] Sin defensa contra prompt injection** — `chatbot.service.ts:56`, `geminiService.ts:103,187`, `matchmaking.ts:39`
El texto libre del usuario se concatena crudo en el prompt sin sanitización ni delimitación. Mitigante parcial: la clasificación valida el slug de salida contra el catálogo real, pero el asistente conversacional y `getSmartServiceSuggestion` (salida de texto libre mostrada al usuario) quedan expuestos.

**[HIGH · VT/IJ] Server Actions de IA sin autenticación ni throttling** — `frontend/src/features/services/actions/matchmaking.ts`, `frontend/src/shared/lib/ai/geminiService.ts`
Invocables por cualquiera; llaman a Gemini con input de usuario. Contrastan con los endpoints backend que sí tienen `JwtAuthGuard` + throttling. **Riesgo:** abuso de cuota/coste de la API key de Gemini, DoS económico.

**[HIGH · VT/IJ] Ausencia total de moderación de output y de `safetySettings`** — búsqueda `safetySetting|HarmCategory|moderation` = 0 resultados
Ninguna de las 6 funciones filtra contenido de entrada/salida. Texto generado se muestra/almacena sin revisión. **Riesgo:** contenido dañino/ilícito generado; relevante consumidores/publicidad engañosa.

**[MEDIUM · IJ] Decisión automatizada sin supervisión humana ni disclaimer de IA** — `frontend/src/features/home/components/HeroSearchBar/HeroSearchBar.tsx:72`; `ai-agents/tools/services.tool.ts:5-32`
El matchmaking decide la categoría de resultados y la IA elige los 3 prestadores presentados. No hay disclaimer "generado por IA / puede contener errores" en la UI. **Obligación:** transparencia EU AI Act art. 50; GDPR art. 22 (decisiones automatizadas).

**[MEDIUM · IJ] Envío de datos personales al modelo (Google) sin aviso ni base documentada** — `ai-agents.service.ts:48,78`; DTOs solo limitan longitud (`agent-chat.dto.ts:11-13`)
El input libre puede contener nombre/dirección/teléfono; se propaga `userId` e historial. No hay minimización ni aviso de subprocesamiento por Google. Sin DPA evidenciado. **[MEDIUM · VT]** La tool `crearBorradorSolicitud` (`service-requests.tool.ts:17-46`) crea registros en DB; la "confirmación del usuario" solo se pide por instrucción en el prompt (`hireeo-system.prompt.ts:14`), no se valida en código.

**[LOW]** Sin logging/retención de prompts-outputs (bueno para privacidad, malo para accountability AI Act); `@ts-nocheck` en ruta IA (`ai-agents.service.ts:1`, `services.tool.ts:1`, `service-requests.tool.ts:1`).

**[INFO · positivo]** Throttling en endpoints backend IA (`ai-agents.controller.ts:15`, `chatbot.controller.ts:13`); `JwtAuthGuard` en ambos controllers; reglas anti-alucinación en system prompt (`hireeo-system.prompt.ts:18`) + validación de slug contra catálogo.

### 5.3 Pagos, escrow, KYC, AML/fiscal

> **Estado general: pre-producción/demo.** La arquitectura (multi-país, gateways por país, verificación de firma, cifrado de credenciales) está bien planteada, pero el **núcleo de cobro (`createPayment`), el escrow y el onboarding KYC son stubs**.

**[CRITICAL · IJ] Escrow es un placeholder — no retiene ni liquida fondos** — `backend/src/modules/escrow/escrow.service.ts:8,32-33,57-67`
Comentarios literales `// MOCK: Generar Preference con Split Payment`; no hay Stripe Connect ni MP Marketplace, ni modelo `Escrow` en la DB. Take rate `PLATFORM_FEE_PERCENTAGE = 0.15` es solo aritmética en memoria. El gateway devuelve una **URL de pago falsa** (`stripe.gateway.ts:36-42` `pi_stub_...`; `mercadopago.gateway.ts:29-35` `preference_id=stub_...`). **Riesgo legal:** publicitar un servicio de custodia/comisión inexistente = práctica potencialmente engañosa.

**[CRITICAL · VT] Webhook MercadoPago (frontend) sin verificación de firma** — `frontend/src/app/api/webhooks/mercadopago/route.ts:14-61`
No valida `x-signature`; confía en un `GET` del pago a MP. El backend sí valida firma (HMAC timing-safe, `mercadopago.gateway.ts:37-76`). **Riesgo:** disparo no autorizado del handler.

**[CRITICAL · IJ] Sin screening AML/OFAC/sanciones/PEP** — búsqueda `ofac|sanction|aml|watchlist|pep` = 0 resultados en lógica
Ninguna integración de screening. **Obligación condicional:** se activa si el flujo de pagos/escrow se vuelve funcional (transmisión de dinero, marketplace payments).

**[HIGH]** Webhook backend valida firma pero **no procesa** (`subscriptions.service.ts:222-232,261-273`, MP nunca activa suscripción, "Fase 2.1"); webhook Stripe frontend llama a `/subscriptions/activate` **inexistente** (`webhooks/stripe/route.ts:37`); `acceptQuote` marca aceptado **sin pago** y desconectado del escrow (`quotes.service.ts:74-102` vs `escrow.service.ts:28`); KYC create-session es **stub** (`kyc.service.ts:22-28`, no llama a Stripe Identity real); **sin facturación ni cálculo de IVA/impuestos** (`stripe-session/route.ts:45-67` sin `automatic_tax`; sin modelo `Invoice`). **Obligación fiscal** condicional a cobro real (IVA digital CL/UY/AR/ES; DAC7 UE).

**[MEDIUM]** KYC solo persiste booleano `isKycVerified`/`kycVerifiedAt` (`kyc.service.ts:42-45`), sin evidencia de identidad local auditable; antifraude solo el nativo del brick MP (`PaymentBrick.tsx:43`), sin Radar ni reglas propias; suscripción premium con CRUD/precios reales pero cobro stub.

**[INFO · positivo · PCI]** No se almacenan datos de tarjeta (PAN/CVV) en DB; MercadoPago tokeniza client-side (`PaymentBrick.tsx:68-89`, solo llega `token` — **nota:** sí se transmite número de documento del pagador, dato personal/AML); Stripe usa Checkout hospedado (`stripe-session/route.ts:45-67`, SAQ-A). Verificación de firma Stripe/MP/KYC en backend es correcta y fail-closed.

### 5.4 Gestión de secretos e integraciones

> Diseño: **almacén cifrado en DB** (`Integration`, AES-256-GCM) + **fallback a `process.env`**. Cifrado correcto: `crypto.service.ts` (AES-256-GCM, IV aleatorio 12B, auth tag 16B, clave `INTEGRATIONS_ENCRYPTION_KEY` validada a 32B al arranque).

**[HIGH · VT] Concentración de exposición en `GET /integrations/runtime/:provider`** — `backend/src/modules/integrations/integration-runtime.controller.ts:15-21`
Devuelve TODAS las credenciales de un proveedor en **texto plano**. Única barrera: dos secretos estáticos de proceso (`API_KEY` + `INTERNAL_SERVICE_TOKEN`), de larga vida, sin rotación evidente, y ambos presentes juntos en el entorno del frontend. Fuga de cualquiera → extracción en claro de Stripe/MP/OAuth/Firebase/Cloudinary/Brevo. **Mitigar:** scoping por provider, rotación, separación de tokens.

**[MEDIUM]** Doble fuente de verdad de secretos (DB cifrada + `ENV_FALLBACK_MAP`, `integration-config.service.ts:13-58`; frontend lee Stripe/MP directo de env) dificulta rotación/revocación coherente. Secretos server-side alojados en `frontend/.env.local` (`CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_SECRET`, `MP_ACCESS_TOKEN`, `BREVO_API_KEY`, `GEMINI_API_KEY`) amplían el radio de impacto. `NEXT_PUBLIC_API_KEY` y `NEXT_PUBLIC_CLOUDINARY_API_KEY` definidas en `.env.local` (sin uso hoy) — riesgo latente de embeber una key en el bundle.

**[LOW]** Contraseñas de superadmin en env (`SEED_SUPERADMIN_PASSWORD_*`, seed `roles-users/index.ts:20`).

**[INFO · positivo]** Ningún `.env` trackeado en git ni en historial; sin secretos hardcodeados (los matches `sk_live`/`AIza` son placeholders de UI); auditoría (`integrationAuditLog`) en toda mutación de integraciones; el listado solo expone `hasSecret` (bool); `API_KEY` en frontend solo se lee con `typeof window === 'undefined'`.

### 5.5 Cookies, tracking, consentimiento y cabeceras (frontend)

**[CRITICAL · IJ] Google Analytics 4 + Google Tag Manager cargados incondicionalmente, sin consentimiento previo** — `frontend/src/app/layout.tsx:170-207`
GTM (`GTM-PT2PFWF9`, inline `:178-182` + `<noscript>` `:199-207`) y GA4 (`gtag.js`, ID `G-WREYNC9F4M`, `:185-196`) se inyectan en el `<head>` del layout raíz, antes de cualquier interacción y sin gate de consentimiento. **No hay Consent Mode** (`gtag('consent','default',{denied})` ausente). GTM puede cargar tags de terceros arbitrarios en runtime. Con `es` (UE) soportado, esto infringe ePrivacy art. 5(3) + GDPR (cookies `_ga`/`_gid` sin consentimiento). También relevante para leyes de privacidad de estados de EE.UU. (opt-out de venta/compartición) y régimen CL/AR/UY.

**[HIGH · IJ] No existe banner de consentimiento ni CMP** — búsqueda `consent|cookie banner|gdpr|onetrust|cookiebot|iubenda` = solo texto legal i18n
No hay ningún gestor de consentimiento en `frontend/src` ni `appmobile/src`. Combinado con 5.5-CRITICAL, es incumplimiento directo de la obligación de consentimiento previo, granular y revocable.

**[HIGH · VT] Tokens de auth en `localStorage` en la variante web de la app móvil** — `appmobile/src/shared/lib/storage.ts:5-16`; `appmobile/src/features/auth/services/authService.ts:6-19`
El wrapper usa `SecureStore` en nativo (correcto) pero cae a `localStorage` cuando `Platform.OS === 'web'`, guardando `hireeo.access_token`/`hireeo.refresh_token`/`hireeo.user` → exfiltrables por XSS.

**[HIGH · VT] Sin cabeceras de seguridad en frontend (no CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)** — `frontend/next.config.ts:5-54` (sin `headers()`); `proxy.ts:154` solo fija `x-hireeo-lang`
Agravante: uso de `dangerouslySetInnerHTML` para GTM/GA y JSON-LD (`layout.tsx`, `service/[slug]/page.tsx:172`). Sin CSP no hay defensa en profundidad contra XSS/clickjacking.

**[MEDIUM · IJ] Geolocalización web enviada a tercero (OSM Nominatim) sin aviso** — `frontend/src/features/home/components/HeroSearchBar/HeroSearchBar.tsx:96-110`; `shared/components/hireeo/ui/ChatIA/ChatIA.tsx:263`
`navigator.geolocation` → envío de lat/lng en claro a `nominatim.openstreetmap.org`. Se comparte ubicación precisa + IP con un tercero sin consentimiento. **[MEDIUM]** Mapa Leaflet carga tiles de OSM e iconos de Cloudflare CDN (`MapPicker.tsx:4-13,63-67`, panel admin).

**[LOW · IJ] Cookie `hireeo_country` sin flag `Secure`** — `HeroCountrySelector.tsx:26`, `Footer.tsx:91` (`max-age=31536000; SameSite=Lax`, sin `Secure`, no httpOnly por diseño). Cookie funcional; defendible sin consentimiento pero debe llevar `Secure`.

**[INFO · positivo]** Cookie de sesión NextAuth con defaults correctos (httpOnly, sameSite lax, secure en prod) (`route.ts:174`); `features/analytics` es telemetría **first-party** al backend propio (`POST /interactions`), no terceros (`analytics/actions/mutations.ts:10-24`) — vinculada a `userId`, requiere divulgación pero no consentimiento de cookies de terceros; permisos móviles bien declarados con propósito (`app.json:19-35`).

> **Terceros buscados y NO presentes:** Facebook Pixel/`fbq`, Hotjar, PostHog, Mixpanel, Segment, Microsoft Clarity, Sentry, Datadog, `@vercel/analytics`, `@vercel/speed-insights`, Amplitude, Mapbox, Google Maps JS API.

### 5.6 Derechos de titulares, moderación y validación

**[HIGH · IJ] Portabilidad/exportación de datos personales AUSENTE** — no existe endpoint ni acción (búsqueda `export data|portability|arco` sin resultados). No hay forma de cumplir el derecho de acceso estructurado / portabilidad (GDPR art. 15/20; ARCO en LatAm).

**[HIGH · IJ] Sin mecanismo de reporte/denuncia de contenido ilícito (notice-and-action)** — no existe canal para denunciar reseñas, servicios o usuarios (única mención = texto en `CalificacionForm.tsx:211`, panel admin). Incumple obligaciones de plataformas (DSA en UE; deberes de diligencia en otras jurisdicciones).

**[MEDIUM · IJ/VT] Eliminación de cuenta: hard delete sin anonimización y sin UI de autoservicio** — `users.service.ts:230-237` (`prisma.user.delete`, permite si `id === requesterId` o admin); el formulario de ajustes del usuario (`AjustesPerfilForm.tsx`) **no ofrece** borrar la cuenta (solo el panel admin, `UsuariosTable.tsx`). Hard delete puede chocar con retención legal (pagos/facturas) y romper integridad.

**[MEDIUM · VT/IJ] Chat sin moderación, sin reporte, sin cifrado; `send_message` sin límite de longitud; CORS WebSocket `*`** — `chat.service.ts:130-166`; `chat.gateway.ts:20-25` (`cors:{origin:'*'}`), `:88-100`; `schema.prisma:456` (`text` en claro). El JWT mitiga el CORS abierto, pero contrasta con el CORS restringido del HTTP (`main.ts:29-34`); `text` sin límite → riesgo de DoS/almacenamiento.

**[MEDIUM · VT] `POST /auth/refresh` sin `@Throttle` específico** — `auth.controller.ts:41-48` (solo límite global; login sí tiene 5/60s). **[MEDIUM · VT]** Upload valida el MIME **declarado por el cliente**, no magic-bytes — `upload.service.ts:35-43` (mitigado por re-encoding de Cloudinary a webp, `:50`). Cualquier usuario autenticado puede subir hasta 10 archivos (`upload.controller.ts:16-22`).

**[LOW/MEDIUM · IJ] Email del destinatario registrado en logs** — `email.service.ts:50` (PII en logs de aplicación). **[LOW/MEDIUM · VT]** No hay filtro catch-all de excepciones (solo `PrismaExceptionFilter`); `logger: ['error','warn','log','debug']` siempre activo, incluso en producción (`main.ts:17,43`).

**[LOW]** Endpoints OAuth/refresh y `chat.createConversation` con `@Body('x')` string sin DTO validado (`auth.controller.ts:46,56,66,76`; `chat.controller.ts:24`); webhooks `@Public` sin throttle propio (protegidos por firma); `WebhookGuard` definido pero **sin usar** (`webhook.guard.ts:8`, código muerto); moderación de reseñas manual por ADMIN sin trazabilidad del acto (`ratings.controller.ts:48-55`).

**[INFO · positivo]** Moderación **previa** de reseñas: nacen `PENDING` (`schema.prisma:297`), solo `ACTIVE` es visible públicamente (`ratings.service.ts:61-78`), aprobación por rol `ADMIN` (`ratings.controller.ts:48-55`); `ValidationPipe` global estricto; DTOs con class-validator (`register.dto.ts`, `create-rating.dto.ts:6-14`, etc.); Zod en Server Actions del frontend (`users/actions/mutations.ts:40,71,122`); `SerializeInterceptor` (`serialize.interceptor.ts:14-16`) — nota: lista fija, no cubre nombres como `otp`/`secret`/`apiKey`; errores Prisma sin stack trace al cliente (`prisma-exception.filter.ts:20-62`).

---

## 6. Integraciones de terceros detectadas (resumen)

| Proveedor | Uso | Rol probable (privacidad) | Evidencia |
|-----------|-----|---------------------------|-----------|
| **Stripe** | Pagos (es/us) + KYC (Stripe Identity) | Encargado / sub-encargado | `stripe-session/route.ts:24-30`; `integration-config.service.ts:14-28`; `kyc.service.ts` |
| **MercadoPago** | Pagos (cl/ar/uy) | Encargado / sub-encargado | `PaymentBrick.tsx:33`; `webhooks/mercadopago/route.ts:20-22` |
| **Google Gemini** (Google AI) | IA: matchmaking, chatbot, generación de texto | Sub-encargado (recibe input de usuario) | `matchmaking.ts:6`; `geminiService.ts:4`; `ai-agents.service.ts:27-30` |
| **Cloudinary** | Almacenamiento/entrega de imágenes | Encargado | `upload.service.ts:4,23-32` |
| **Brevo** (Sendinblue) | Email transaccional | Encargado | `email.service.ts:13,33-39` |
| **Firebase Admin (FCM)** | Push notifications | Encargado / sub-encargado (Google) | `notifications.service.ts:2-3,24-26` |
| **Google / Apple / Azure AD OAuth** | Login social | Fuente de identidad / co-recepción | `[...nextauth]/route.ts:190-200` |
| **Google Analytics 4 + GTM** | Analítica / tracking | Corresponsable probable (GA) | `layout.tsx:174-207` |
| **OpenStreetMap Nominatim + tiles** | Geocoding y mapas | Recipiente (IP + geo) | `HeroSearchBar.tsx:96-110`; `MapPicker.tsx:63-67` |
| **Cloudflare CDN** | Iconos de Leaflet | Recipiente (IP) | `MapPicker.tsx:4-13` |
| **PostgreSQL (Neon/pooled)** | Base de datos | Alojamiento de datos | `prisma.config.ts:8-11` |
| **Vercel** | Hosting (frontend + backend serverless) | Encargado / alojamiento | `backend/vercel.json`; `main.ts:86-93` |

> Detalle completo, datos procesados y checklist de DPA en `../vendors-and-transfers/vendor-inventory-and-dpa-checklist.md`.

---

## 7. Resumen consolidado de severidad

| Severidad | Nº | Hallazgos (referencia sección) |
|-----------|----|--------------------------------|
| **CRITICAL** | 4 | Escrow es stub sin custodia real de fondos (5.3); webhook MercadoPago frontend sin verificación de firma (5.3); sin screening AML/OFAC (5.3, condicional a cobro funcional); GA4+GTM sin consentimiento con UE en alcance (5.5) |
| **HIGH** | 13 | Tokens backend expuestos al cliente (5.1); `GET /users` sin authz — PII (5.1); IDOR direcciones (5.1); Google OAuth sin validar `aud` (5.1); scoping por país no validado (5.1); prompt injection (5.2); Server Actions IA sin auth (5.2); sin moderación de output IA/`safetySettings` (5.2); webhooks de pago rotos/no procesan (5.3); exposición en `/integrations/runtime` (5.4); sin CMP (5.5); tokens en localStorage web mobile (5.5); sin CSP/HSTS (5.5); portabilidad ausente (5.6); notice-and-action ausente (5.6) |
| **MEDIUM** | ~14 | Sin verificación email/reset/MFA (5.1); enumeración en registro (5.1); decisión automatizada sin supervisión/disclaimer IA (5.2); PII a Gemini sin aviso (5.2); KYC solo booleano + sin facturación/IVA (5.3); doble fuente de secretos (5.4); geolocalización a Nominatim (5.5); hard delete de cuenta sin autoservicio (5.6); chat sin moderación/reporte + CORS WS `*` (5.6); `/auth/refresh` sin throttle (5.6); upload MIME declarado (5.6) |
| **LOW** | ~10 | Algoritmo JWT no fijado; API_KEY global; superadmin passwords en env; cookie país sin Secure; email en logs; sin catch-all filter; DTOs faltantes en OAuth/chat; webhooks sin throttle propio; `WebhookGuard` muerto; moderación sin trazabilidad |
| **INFO** | — | Controles positivos: bcrypt 12, timing-safe, AES-256-GCM, ValidationPipe, Zod, SerializeInterceptor, moderación previa de reseñas, PCI (sin PAN/CVV), firma de webhooks backend, higiene de git |

> **Nota metodológica:** severidades **propuestas** por análisis estático de solo lectura; requieren validación de la configuración de producción (no desplegada) y revisión por abogado habilitado en cada jurisdicción. La distinción vulnerabilidad técnica vs. incumplimiento jurídico se anota por hallazgo (VT/IJ).

