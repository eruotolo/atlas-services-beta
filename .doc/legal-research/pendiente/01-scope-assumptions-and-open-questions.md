# 01 — Alcance, supuestos y preguntas abiertas (Fase 0)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con capacidades de IA.
- **Fecha de corte / ejecución:** 2026-07-23
- **Versión:** 0.1 (borrador de descubrimiento)
- **Método:** inspección no destructiva del repositorio (`frontend/`, `backend/`, esquema Prisma, config). No se modificó código ni configuración.
- **Estado de producción:** no desplegada a producción a la fecha (declarado en `CLAUDE.md` §5).

> **Aviso.** Este documento es un expediente de investigación técnica, no asesoramiento legal. Todo borrador jurídico posterior requiere revisión de abogado habilitado por jurisdicción. Se distingue explícitamente entre **hecho confirmado** (evidencia en repo), **inferencia técnica**, **supuesto pendiente** y **obligación jurídica**. Ningún hallazgo jurídico material se cierra en este archivo: eso corresponde a las Fases 2–15.

---

## A. Ficha de producto confirmada (solo hechos verificados con evidencia)

Cada fila está respaldada por evidencia en la tabla de la sección D.

| # | Hecho confirmado | Evidencia (archivo:línea) |
|---|---|---|
| 1 | Nombre comercial del producto: **Hireeo**. | `package.json` (name `hireeo`); `backend/src/modules/ai-agents/prompts/hireeo-system.prompt.ts:2` |
| 2 | Dominio de contacto/marca: **hireeo.app**; email público **info@hireeo.app**; fundación declarada **2025** (schema Organization JSON-LD). | `frontend/src/app/layout.tsx:156-157` |
| 3 | **No existe archivo LICENSE** ni razón social / RUT / CIF / NIF / domicilio legal en el código o config. | Búsqueda negativa en `frontend/src`, `backend/src` (ver §C) |
| 4 | Roles de usuario definidos en backend: **Client, Professional (prestador), Admin, SuperAdmin**. | `backend/src/common/enums/role.enum.ts:1-6`; seed `backend/prisma/seed/roles-users/index.ts:33-53` |
| 5 | Países soportados: **cl, ar, uy, es, us** (Paraguay pendiente). | `backend/src/modules/auth/dto/register.dto.ts:11`; `frontend/src/shared/components/layout/Footer/Footer.tsx:14-20` |
| 6 | Pasarelas por país: **MercadoPago** (cl, ar, uy) y **Stripe** (es, us), resueltas en runtime. | `backend/src/modules/payments/payments.service.ts:10-13,27-52` |
| 7 | La creación de pagos está implementada como **STUB** (devuelve identificadores `pi_stub_` / `stub_`, sin cobro real). La verificación de firma de webhooks sí es código real. | `backend/src/modules/payments/gateways/stripe.gateway.ts:36-55`; `.../mercadopago.gateway.ts:29-76` |
| 8 | Existe un flujo **escrow / split payment** con un **take rate del 15%**, pero marcado explícitamente como **MOCK** (el split real no está implementado). | `backend/src/modules/escrow/escrow.service.ts:8,57-60` |
| 9 | **KYC** vía Stripe Identity: `createVerificationSession` es un **STUB**; el webhook que marca `isKycVerified` sí es código real. | `backend/src/modules/kyc/kyc.service.ts:22-28,37-47`; schema `User.isKycVerified/kycVerifiedAt` |
| 10 | **IA confirmada en el código**: dos sistemas con **Google Gemini 2.5 Flash**. (a) Agente conversacional con *tools* (`ai-agents`); (b) clasificador de categorías (`chatbot`). | `backend/src/modules/ai-agents/ai-agents.service.ts:27-52`; `backend/src/modules/chatbot/chatbot.service.ts:33,45-49` |
| 11 | Modelos de ingreso presentes en el modelo de datos: **suscripciones premium** de servicios, **sponsors/publicidad** y **comisión escrow (15%, mock)**. | schema `Subscription`, `PremiumPrice`, `Sponsor`; `escrow.service.ts:8` |
| 12 | Autenticación: **email+contraseña** (bcrypt, 12 rounds) + **OAuth Google, Apple y Microsoft/Azure AD**. | `backend/src/modules/auth/auth.service.ts:15,151-279` |
| 13 | **Analítica de terceros cargada sin gate de consentimiento**: Google Tag Manager (`GTM-PT2PFWF9`) y GA4 (`G-WREYNC9F4M`) se inyectan directamente en `<head>`/`<body>`. No se encontró banner de cookies. | `frontend/src/app/layout.tsx:170-207` |
| 14 | Credenciales de proveedores se almacenan **cifradas en la DB** (AES-256-GCM, `INTEGRATIONS_ENCRYPTION_KEY`), no en env vars del cliente. | `backend/.env.example:25-42`; schema `Integration`; `backend/src/modules/integrations/crypto.service.ts` |
| 15 | Base de datos: **PostgreSQL** (Prisma). Rate limiting global (`ThrottlerGuard`) y `ApiKeyGuard` global activos. | `backend/prisma/schema.prisma:5-7`; `backend/src/app.module.ts:40-43,70-79` |
| 16 | Subprocesadores referenciados en el código (enum `IntegrationProvider`): Stripe, MercadoPago, Stripe KYC, Firebase (push), Gemini (IA), Cloudinary (imágenes), Brevo (email), Google/Apple/Azure OAuth. | `backend/prisma/schema.prisma:51-63` |
| 17 | **No existe campo de fecha de nacimiento ni verificación de edad** en el registro ni en el modelo `User`. | Búsqueda negativa (§C); `register.dto.ts:14-40`; schema `User:139-171` |
| 18 | Geolocalización **precisa** almacenada (lat/long) en direcciones de usuario. | schema `Address.latitude/longitude:522-523` |
| 19 | Mensajería interna cliente↔prestador (chat) y tracking de interacciones (ver teléfono, llamada, WhatsApp) con `metadata` JSON. | schema `Conversation`/`Message:430-465`, `Interaction:377-392` |
| 20 | Existen páginas `/terms` y `/privacy` (contenido servido desde diccionarios i18n); el enlace "cookies" del footer apunta a `/privacy`. | `frontend/.../（estaticas)/privacy/page.tsx`, `terms/page.tsx`; `Footer.tsx:138-155` |

### Naturaleza de la relación (confirmado + inferencia técnica)

- **Confirmado:** el modelo de datos y los flujos existentes describen un **intermediario/marketplace de descubrimiento**: publica perfiles de servicios (`Service`), permite búsqueda, contacto (ver teléfono / WhatsApp / email, registrados en `Interaction`), mensajería, solicitudes (`ServiceRequest`) y cotizaciones (`Quote`).
- **Confirmado (parcial):** existe infraestructura para **intermediación de pagos con comisión** (escrow 15%), pero está en estado *stub/mock*; hoy el código **no cobra ni retiene fondos reales**.
- **Inferencia técnica:** los servicios son mayormente **presenciales** (electricistas, carpinteros, gásfiter, fletes — `CLAUDE.md` §5), lo que activa reglas de consumo/contratación a distancia y responsabilidad off-platform. **Pendiente de confirmación de negocio.**

---

## B. Supuestos pendientes de confirmar (NO verificados en código)

Estos supuestos se usan para no detener la auditoría, pero deben confirmarse antes de cualquier documento legal publicable.

| # | Supuesto (marcado) | Por qué no se puede verificar en código | Prioridad |
|---|---|---|---|
| S1 | Existe una entidad legal constituida que opera Hireeo (país de constitución, domicilio, representante). | No hay razón social, LICENSE, ni domicilio en el repo. | BLOCKING |
| S2 | El operador es el **merchant of record** y quien cobrará la comisión cuando los pagos salgan de *stub*. | Flujo de pago es mock; no hay contrato de PSP ni definición de MoR en código. | BLOCKING |
| S3 | Hireeo será **responsable/controlador** de los datos de cuenta y **encargado/procesador** en algún tratamiento B2B. | El rol de tratamiento no está documentado; se infiere del código. | HIGH |
| S4 | Los servicios ofertados **no** incluyen categorías reguladas/de alto riesgo sin control (salud, financieros, menores, seguridad). | Categorías se cargan por seed/DB; no hay whitelist/prohibiciones en código. | HIGH |
| S5 | El público objetivo son **adultos** (18+). | No hay verificación de edad ni fecha de nacimiento. | HIGH |
| S6 | El hosting/región de datos (p. ej. Vercel + DB gestionada) y la ubicación física de PostgreSQL/backups. | No hay IaC ni región declarada en el repo. | HIGH |
| S7 | Existen DPA/SCC firmados con Stripe, MercadoPago, Google (Gemini), Cloudinary, Brevo, Firebase. | Solo hay integración técnica; no hay contratos en el repo. | HIGH |
| S8 | El proveedor de IA (Google Gemini) **no** usa inputs/outputs para entrenamiento. | Depende del contrato del proveedor, no del código. | HIGH |

---

## C. Búsquedas negativas registradas (ausencia = hallazgo)

| Búsqueda | Resultado | Conclusión limitada |
|---|---|---|
| Razón social / RUT / CIF / NIF / domicilio legal en `frontend/src`, `backend/src` | Sin coincidencias | No hay entidad legal declarada en código (BLOCKING para documentos legales). |
| `LICENSE*` en raíz, `backend/`, `frontend/` | No existe | Titularidad del software no formalizada en repo (ver Fase 9). |
| `birthdate` / `fechaNacimiento` / `dateOfBirth` / verificación de edad | Sin coincidencias | No hay mecanismo de edad/menores (HIGH; ver Fase 13). |
| Banner/gestor de consentimiento de cookies (`cookieconsent`, `consent`, CMP) | Sin coincidencias funcionales; GTM/GA4 cargan siempre | No hay control de consentimiento previo (HIGH; ver Fase 5). |

> Nota metodológica: las búsquedas se ejecutaron con `grep -rniE` sobre `.ts`/`.tsx`. Un resultado vacío indica ausencia en el código inspeccionado a la fecha, no imposibilidad absoluta.

---

## D. Tabla de evidencia (fuente primaria del repositorio)

| ID | Archivo:línea | Fragmento / observación | Conclusión limitada |
|---|---|---|---|
| E-01 | `frontend/src/app/layout.tsx:156-157` | `email: 'info@hireeo.app'`, `foundingDate: '2025'` | Contacto y marca; no razón social. |
| E-02 | `frontend/src/app/layout.tsx:170-207` | GTM `GTM-PT2PFWF9` + GA4 `G-WREYNC9F4M` inyectados en `<head>`/`<noscript>` sin condicional de consentimiento | Tracking sin consentimiento previo. |
| E-03 | `backend/src/common/enums/role.enum.ts:1-6` | `CLIENT='Client', PROVIDER='Professional', ADMIN='Admin', SUPER_ADMIN='SuperAdmin'` | 4 roles; sin moderador/afiliado dedicados. |
| E-04 | `backend/prisma/seed/roles-users/index.ts:33-53` | upsert de roles SuperAdmin/Admin/Professional/Client | Roles efectivamente creados. |
| E-05 | `backend/src/modules/auth/dto/register.dto.ts:11-40` | Campos: nombre, email, password(≥8), telefono?, country∈{cl,ar,uy,es,us} | Datos de alta; sin edad. |
| E-06 | `backend/src/modules/auth/auth.service.ts:15,57,151-279` | bcrypt 12 rounds; Google/Apple/Microsoft login | Auth confirmada. |
| E-07 | `backend/src/modules/payments/payments.service.ts:10-52` | Sets `MERCADOPAGO_COUNTRIES={cl,ar,uy}`, `STRIPE_COUNTRIES={es,us}`; `resolveGateway` | Mapeo país→pasarela. |
| E-08 | `backend/src/modules/payments/gateways/stripe.gateway.ts:36-42` | `clientSecret: pi_stub_...` | Cobro Stripe no implementado (stub). |
| E-09 | `backend/src/modules/payments/gateways/mercadopago.gateway.ts:29-35` | `checkoutUrl: .../stub_...` | Cobro MP no implementado (stub). |
| E-10 | `backend/src/modules/escrow/escrow.service.ts:8,57-60` | `PLATFORM_FEE_PERCENTAGE=0.15`; comentario `MOCK`/split payment pendiente | Comisión 15% definida, no operativa. |
| E-11 | `backend/src/modules/kyc/kyc.service.ts:22-47` | `createVerificationSession` stub; webhook actualiza `isKycVerified` | KYC parcial (stub + webhook real). |
| E-12 | `backend/src/modules/ai-agents/ai-agents.service.ts:27-52` | `gemini-2.5-flash` vía `@ai-sdk/google`, key desde DB, tools + `maxSteps:5` | Agente IA con acciones. |
| E-13 | `backend/src/modules/ai-agents/prompts/hireeo-system.prompt.ts:1-19` | System prompt; "NUNCA inventes proveedores/calificaciones" | Diseño anti-alucinación. |
| E-14 | `backend/src/modules/chatbot/chatbot.service.ts:33,45-49` | `GEMINI_API_KEY` env + `gemini-2.5-flash` clasificador | Segundo uso de IA (inconsistencia de gestión de credenciales). |
| E-15 | `backend/prisma/schema.prisma:51-63` | enum `IntegrationProvider` (Stripe, MP, KYC, Firebase, Gemini, Cloudinary, Brevo, OAuth) | Inventario de subprocesadores técnicos. |
| E-16 | `backend/prisma/schema.prisma:522-523` | `Address.latitude/longitude Decimal` | Geolocalización precisa. |
| E-17 | `backend/prisma/schema.prisma:377-392` | `Interaction` (VIEW_PHONE, CALL, WHATSAPP, `metadata Json`) | Tracking de contacto off-platform. |
| E-18 | `backend/src/modules/upload/upload.service.ts:14-15,45-62` | Cloudinary, MIME img, 4MB, `format:webp` | Almacenamiento de imágenes en tercero. |
| E-19 | `backend/src/modules/email/email.service.ts:13,21-40` | Brevo REST `smtp/email` | Email transaccional en tercero. |
| E-20 | `backend/src/modules/notifications/notifications.service.ts:1-45` | Firebase Admin Messaging; `DeviceToken` | Push notifications. |
| E-21 | `backend/src/app.module.ts:40-43,70-79` | `ThrottlerModule` (10/s, 100/min) + `ApiKeyGuard` global | Controles de seguridad presentes. |
| E-22 | `frontend/src/shared/components/layout/Footer/Footer.tsx:91,138-155` | Cookie `hireeo_country`; links terms/privacy/cookies(→privacy) | Cookie de preferencia de país; sin política de cookies dedicada. |

---

## E. Cuestionario Fase 0 — preguntas abiertas (con prioridad)

| ID | Área | Pregunta concreta | Riesgo de seguir sin respuesta | Prioridad |
|---|---|---|---|---|
| Q1 | Entidad legal | ¿Cuál es la razón social, país de constitución, domicilio y representante legal del operador de Hireeo? | Imposible redactar Términos, Política de Privacidad ni identificar al responsable/controlador. | **BLOCKING** |
| Q2 | Pagos / MoR | Cuando los pagos salgan de *stub*, ¿quién es merchant of record, quién liquida al prestador y quién retiene la comisión del 15%? | Determina licencias de dinero, PCI, DAC7/IVA y responsabilidad de consumo. | **BLOCKING** |
| Q3 | Rol de datos | ¿Hireeo es responsable/controlador, encargado o corresponsable en cada tratamiento (cuenta, mensajería, pagos, IA)? | Define bases jurídicas, DPA, ROPA y avisos. | **BLOCKING** |
| Q4 | IA / proveedor | ¿El contrato con Google (Gemini) prohíbe el entrenamiento con inputs/outputs y define ubicación de datos y subprocesadores? | Afecta GDPR, transferencias y EU AI Act. | **BLOCKING** |
| Q5 | Ubicación de datos | ¿Dónde se alojan PostgreSQL, backups y Cloudinary (región)? ¿Hay transferencias fuera de UE/LatAm? | Bloquea análisis de transferencias internacionales (SCC/TIA). | **BLOCKING** |
| Q6 | Menores | ¿Cuál es la edad mínima y cómo se verifica? Hoy no hay control. | Riesgo COPPA/GDPR-menores/consumo. | HIGH |
| Q7 | Categorías reguladas | ¿Se permitirán servicios regulados/de alto riesgo (salud, financiero, seguridad, transporte)? | Activa obligaciones sectoriales y de verificación de credenciales. | HIGH |
| Q8 | Consentimiento cookies | ¿Se implementará CMP antes de GTM/GA4? Hoy cargan sin consentimiento. | Incumplimiento ePrivacy/LSSI/AEPD y leyes US de tracking. | HIGH |
| Q9 | Subprocesadores | ¿Existen DPA/SCC firmados con Stripe, MP, Cloudinary, Brevo, Firebase, Google? | Sin base contractual para transferencias/encargo. | HIGH |
| Q10 | Retención | ¿Cuáles son los periodos de retención por categoría (cuentas inactivas, mensajería, logs, transacciones, IA)? | No hay retención definida en código. | HIGH |
| Q11 | Verificación de prestadores | Más allá del KYC stub, ¿se verifican licencias/seguros/credenciales profesionales? | Responsabilidad del marketplace por prestadores. | HIGH |
| Q12 | Moderación / reseñas | ¿Cómo se modera contenido/reseñas (hoy `CommentStatus PENDING→ACTIVE`) y hay proceso de reporte y apelación? | Obligaciones DSA/consumo y reseñas falsas. | MEDIUM |
| Q13 | Seguridad | ¿Hay MFA, logging de accesos admin, política de incidentes y backups probados? | Preparación enterprise y notificación de brechas. | MEDIUM |
| Q14 | Contratos existentes | ¿Existen ToS/Política actuales publicados, contratos de proveedores, pólizas de seguro? | Punto de partida para gap analysis. | MEDIUM |
| Q15 | Marketing | ¿Se enviarán comunicaciones comerciales (email/SMS/push) y cómo se recoge consentimiento y opt-out? | CAN-SPAM/TCPA, ePrivacy, ley LatAm. | MEDIUM |
| Q16 | Analítica GA4 | ¿Está activada IP anonymization / Google Consent Mode y cuál es la retención en GA4? | Configuración fuera del repo. | LOW |
| Q17 | Idiomas | ¿Qué idiomas oficiales tendrá la plataforma por país (i18n presente)? | Avisos legales por idioma. | LOW |

---

## F. Inconsistencias detectadas entre documentación y código

| Doc dice | Código muestra | Evidencia |
|---|---|---|
| `CLAUDE.md` §8: "Auth.js: Email/Password + Google OAuth" | Además hay **Apple** y **Microsoft/Azure AD** OAuth | `auth.service.ts:192-279` |
| `CLAUDE.md` §3: módulos backend limitados | Existen módulos adicionales: `ai-agents`, `chatbot`, `chat`, `crm`, `escrow`, `kyc`, `quotes`, `service-requests`, `notifications`, `email`, `upload`, `integrations` | `backend/src/app.module.ts:8-32` |
| `CLAUDE.md`: sin mención de IA | Hay **dos** integraciones de IA (Gemini) operativas en código | `ai-agents.service.ts`, `chatbot.service.ts` |
| Gestión de credenciales unificada en DB (`.env.example`) | `chatbot.service.ts` aún lee `GEMINI_API_KEY` de env | `chatbot.service.ts:33` |

Estas diferencias se resuelven **priorizando la evidencia del código** sobre la documentación, según el estándar del megaprompt.
