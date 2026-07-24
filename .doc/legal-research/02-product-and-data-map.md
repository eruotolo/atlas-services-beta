# 02 — Mapa de producto y de datos (Fase 1.2)

- **Fecha:** 2026-07-23
- **Alcance:** inventario de datos basado en el esquema Prisma real (`backend/prisma/schema.prisma`) y en los módulos que los producen/consumen. No se exponen datos reales; los ejemplos son ficticios.
- **Advertencia:** las columnas "base jurídica candidata", "retención" y "transferencias" son **propuestas condicionadas** a los supuestos pendientes (ver `01-scope-assumptions-and-open-questions.md` §B y §E). No constituyen determinación jurídica.

---

## 1. Diagrama textual del flujo de producto

```
VISITANTE (anónimo)
   │  navega Home / búsqueda / perfiles públicos de servicios
   │  [GTM + GA4 activos sin consentimiento — layout.tsx:170-207]
   ▼
REGISTRO  ──►  User{email, password(bcrypt), name, phone?, country}   (auth.service.ts:50-80)
   │            rol por defecto: Client. OAuth: Google/Apple/Microsoft
   ▼
CLIENTE                                   PRESTADOR (Professional)
   │  busca por categoría/región/localidad     │  publica Service{title, desc, price,
   │  (geo cargado de DB)                       │     images(Cloudinary), contact*, socialMedia}
   │                                            │  (opcional) KYC Stripe Identity [STUB]
   │  ── Asistente IA (Gemini) ──► buscarProveedores / crearBorradorSolicitud
   │                                            │
   ▼                                            ▼
CONTACTO / INTERACCIÓN                     SUSCRIPCIÓN PREMIUM (PremiumPrice)
   Interaction{VIEW_PHONE, CALL, WHATSAPP}     Sponsor (publicidad)
   │
   ▼
MENSAJERÍA  Conversation ↔ Message (cliente↔prestador)
   │
   ▼
SOLICITUD/COTIZACIÓN  ServiceRequest ──► Quote{price, message, accepted}
   │
   ▼
PAGO (escrow, 15% fee) ─── [STUB / MOCK: no cobra fondos reales]
   │
   ▼
RESEÑA  Rating{stars, comment, status: PENDING→ACTIVE}  (moderación SuperAdmin)
   │
   ▼
NOTIFICACIONES  push (Firebase) / email (Brevo)
```

**Eliminación de cuenta:** el modelo usa `onDelete: Cascade` desde `User` hacia servicios, ratings, favoritos, conversaciones, solicitudes, cotizaciones, direcciones y device tokens (`schema.prisma:192,267,303,416,440-441,479,500,528,547`). **No se localizó un endpoint de auto-borrado por el titular** (pendiente de verificar en Fase 4/11).

---

## 2. Estado del ciclo de vida de datos (evaluación técnica)

| Principio | Observación en código | Evidencia |
|---|---|---|
| Minimización | Registro pide solo lo necesario (name, email, pass, phone?, country). Consultas usan `select` de campos acotados. | `register.dto.ts:14-40`; `auth.service.ts:26-40` |
| Limitación de finalidad | No hay declaración de finalidades en código; se infieren por uso. | — |
| Precisión | Reseñas con estado; sin proceso de rectificación por titular visible. | `schema.prisma:297` |
| Separación de entornos | `.env.local`/`.env`/`.env.production` distintos; hay seeds de datos de prueba. | `backend/prisma/seed/test-users.ts` |
| Seudonimización | Identificadores UUID; contraseñas con bcrypt(12); credenciales de proveedor cifradas AES-256-GCM. | `auth.service.ts:15`; `integrations/crypto.service.ts` |
| Retención / destrucción | **No hay periodos de retención ni jobs de borrado definidos** en el repo. | Ausencia (§C de doc 01) |

---

## 3. Inventario de datos por categoría

> Rol de Hireeo: **[R]** responsable/controlador (candidato), **[E]** encargado/procesador (candidato). Marcado como *candidato* porque el rol de tratamiento no está confirmado (Q3, BLOCKING).

### 3.1 Datos de cuenta y autenticación

| Atributo | Detalle |
|---|---|
| Origen | Formulario de registro / OAuth (Google, Apple, Microsoft) |
| Titular | Cliente, Prestador, Admin |
| Campos (ejemplo NO real) | `email` (juan@example.com), `password` (hash bcrypt), `name` ("Juan Pérez"), `phone?` (+56900000000), `avatar?`, `googleId/appleId/microsoftId` |
| Finalidad | Crear y autenticar la cuenta |
| Base jurídica candidata | Ejecución de contrato (términos de uso) |
| Rol Hireeo | [R] |
| Destinatarios | Proveedores OAuth (Google/Apple/Microsoft) al validar tokens |
| Ubicación | PostgreSQL (región **no confirmada** — Q5) |
| Transferencias | Validación de tokens OAuth (endpoints Google/Apple/Microsoft) — potencial transferencia internacional |
| Retención | **No definida** (Q10) |
| Mecanismo de eliminación | Cascade al borrar `User`; sin flujo self-service confirmado |
| Acceso | Titular; Admin/SuperAdmin (guards de rol) |
| Seguridad | bcrypt 12 rounds; JWT access 15m + refresh 30d |
| Derechos | No implementados como flujo (pendiente Fase 4) |
| Evidencia | `schema.prisma:139-171`; `auth.service.ts:50-80,151-279` |

### 3.2 Perfil profesional / anuncios de servicio

| Atributo | Detalle |
|---|---|
| Origen | Prestador (publicación de servicio) |
| Titular | Prestador (y datos de contacto que expone públicamente) |
| Campos | `title`, `description`, `price`, `commune`, `contactName/Email/Phone`, `mainImage`, `images[]`, `socialMedia[]`, `level` (BASIC/PREMIUM), `featured` |
| Finalidad | Publicar y descubrir servicios |
| Base jurídica candidata | Ejecución de contrato + interés legítimo (visibilidad) |
| Rol Hireeo | [R] del listado; el prestador es responsable del contenido publicado |
| Destinatarios | Público (perfiles públicos), Cloudinary (imágenes) |
| Ubicación | PostgreSQL + Cloudinary (región no confirmada) |
| Transferencias | Cloudinary (CDN, ubicación por confirmar — Q5/Q9) |
| Retención | Ligada a `endDate` de servicio/suscripción; sin política formal |
| Eliminación | Cascade con `User`/`Service` |
| Seguridad | Upload validado (MIME imagen, 4MB) |
| Evidencia | `schema.prisma:241-289,394-406`; `upload.service.ts:14-62` |

### 3.3 Datos de verificación (KYC)

| Atributo | Detalle |
|---|---|
| Origen | Stripe Identity (webhook) |
| Titular | Prestador (típicamente) |
| Campos en Hireeo | `isKycVerified` (bool), `kycVerifiedAt` (fecha). **Los documentos de identidad NO se almacenan en Hireeo**; los procesa Stripe. |
| Finalidad | Verificar identidad del prestador |
| Base jurídica candidata | Obligación legal (AML si aplica) / interés legítimo (fraude) — **condicionado** |
| Rol Hireeo | [R] del flag; Stripe = responsable/encargado del dato biométrico/identidad |
| Destinatarios | Stripe (Identity) |
| Ubicación | Stripe (fuera de Hireeo) |
| Transferencias | A Stripe (US/EU) — datos de identidad, potencialmente sensibles |
| Estado | `createVerificationSession` es **STUB**; webhook real | 
| Evidencia | `schema.prisma:165-166`; `kyc.service.ts:22-47` |

### 3.4 Geolocalización y direcciones

| Atributo | Detalle |
|---|---|
| Origen | Usuario (alta de dirección) |
| Titular | Cliente/Prestador |
| Campos | `street`, `number`, `apartment?`, `zipCode?`, `reference?`, **`latitude`/`longitude` (precisos)**, `countryId/regionId/localityId` |
| Finalidad | Ubicación del servicio / matching geográfico |
| Base jurídica candidata | Ejecución de contrato |
| Sensibilidad | **Geolocalización precisa** — categoría de mayor riesgo (US "sensitive data", ubicación exacta) |
| Retención | No definida |
| Evidencia | `schema.prisma:507-538` |

### 3.5 Comunicaciones (mensajería) y contenido

| Atributo | Detalle |
|---|---|
| Origen | Cliente y Prestador |
| Campos | `Conversation{clientId, providerId, serviceId}`, `Message{senderType, text, read}` |
| Finalidad | Comunicación para contratar el servicio |
| Base jurídica candidata | Ejecución de contrato |
| Rol Hireeo | [R] (aloja comunicaciones privadas entre usuarios) |
| Sensibilidad | Comunicaciones privadas; pueden contener datos de terceros subidos por usuarios |
| Retención | No definida |
| Evidencia | `schema.prisma:425-465` |

### 3.6 Reseñas, calificaciones y moderación

| Atributo | Detalle |
|---|---|
| Campos | `Rating{stars, comment, status: PENDING/ACTIVE/DELETED, ownerResponse}` |
| Finalidad | Confianza/reputación del marketplace |
| Moderación | Estado inicial `PENDING`; transición a `ACTIVE` (moderación por SuperAdmin, según memoria de producto) |
| Regla de negocio | Un rating por (servicio, usuario) — `@@unique([serviceId, userId])` |
| Evidencia | `schema.prisma:291-310` |

### 3.7 Interacciones y analítica de contacto

| Atributo | Detalle |
|---|---|
| Campos | `Interaction{type: VIEW_PHONE/VIEW_EMAIL/CALL/WHATSAPP, userId?, metadata: Json}` |
| Finalidad | Métricas de contacto / valor del anuncio |
| Sensibilidad | `metadata` JSON sin esquema — riesgo de sobre-recolección (verificar qué se guarda) |
| Evidencia | `schema.prisma:377-392` |

### 3.8 Datos transaccionales / pagos

| Atributo | Detalle |
|---|---|
| Campos | `Subscription{amount, currency, paymentGateway, paymentMethod?, paymentStatus, transactionId?}`; `Quote{price, accepted}`; escrow (fee 15%) |
| Estado | Pagos en **STUB**; no se procesan cobros reales ni se almacenan datos PCI a la fecha |
| Destinatarios (futuro) | Stripe / MercadoPago |
| Rol Hireeo | Por definir (MoR? agregador? — Q2 BLOCKING) |
| Evidencia | `schema.prisma:312-334,489-505`; `escrow.service.ts:8`; gateways (stubs) |

### 3.9 Identificadores en línea / analítica web

| Atributo | Detalle |
|---|---|
| Origen | Navegador del visitante |
| Elementos | GTM `GTM-PT2PFWF9`, GA4 `G-WREYNC9F4M` (cookies `_ga`, `_gid`, etc.), cookie propia `hireeo_country` |
| Consentimiento | **Ausente**: scripts cargan antes de cualquier consentimiento |
| Destinatarios | Google (Analytics/Tag Manager) — transferencia internacional |
| Base jurídica | Requiere consentimiento (ePrivacy/LSSI/AEPD; opt-out en US) — **no cumplido hoy** |
| Evidencia | `layout.tsx:170-207`; `Footer.tsx:91` |

### 3.10 Notificaciones (push / email)

| Atributo | Detalle |
|---|---|
| Campos | `DeviceToken{token, platform}` (push); email vía Brevo |
| Destinatarios | Firebase Cloud Messaging (Google), Brevo (Sendinblue) |
| Transferencias | Google (FCM), Brevo (UE) |
| Evidencia | `schema.prisma:540-552`; `notifications.service.ts:1-45`; `email.service.ts:13-40` |

### 3.11 Logs, auditoría y administración

| Atributo | Detalle |
|---|---|
| Campos | `IntegrationAuditLog{userId, action, provider, metadata: Json}` |
| Finalidad | Auditoría de cambios en integraciones (acción admin) |
| Acceso | Admin/SuperAdmin |
| Evidencia | `schema.prisma:572-586` |

### 3.12 Datos / telemetría de IA

| Atributo | Detalle |
|---|---|
| Inputs | Mensaje libre del usuario + país + localidad (agente); descripción de necesidad (chatbot) |
| Outputs | Texto del asistente, proveedores sugeridos, borrador de solicitud |
| Proveedor | Google Gemini 2.5 Flash |
| Persistencia | El agente puede crear `ServiceRequest` (borrador) en DB si el usuario confirma; no se observa almacenamiento de prompts/embeddings propio |
| Entrenamiento por proveedor | **No confirmado** (Q4 BLOCKING) |
| Evidencia | `ai-agents.service.ts:41-70`; `chatbot.service.ts:37-112`; `hireeo-system.prompt.ts` |

---

## 4. Subprocesadores / destinatarios (resumen)

| Proveedor | Servicio | Datos implicados | Transferencia intl. probable | Evidencia |
|---|---|---|---|---|
| Google (Gemini) | IA generativa | Texto libre del usuario, contexto de país | Sí | `ai-agents.service.ts:29`; `chatbot.service.ts:33` |
| Google (GTM/GA4) | Analítica web | Identificadores, IP, eventos | Sí | `layout.tsx:170-207` |
| Google/Apple/Microsoft | OAuth login | email, id de proveedor, nombre, avatar | Sí | `auth.service.ts:151-279` |
| Stripe | Pagos (es/us) + KYC | Datos de pago, identidad | Sí | `stripe.gateway.ts`; `kyc.service.ts` |
| MercadoPago | Pagos (cl/ar/uy) | Datos de pago | Regional | `mercadopago.gateway.ts` |
| Cloudinary | Almacenamiento de imágenes | Imágenes de servicios/avatars | Sí | `upload.service.ts:23-62` |
| Brevo | Email transaccional | email, nombre, contenido | UE | `email.service.ts:13-40` |
| Firebase | Push notifications | device token, mensaje | Sí | `notifications.service.ts:1-45` |

> Todos requieren confirmación de DPA/SCC y región (Q5, Q9 — HIGH).
