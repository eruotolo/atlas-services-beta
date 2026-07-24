# Borrador de Registro de Actividades de Tratamiento (ROPA) — Hireeo

- **Fecha:** 2026-07-23
- **Versión:** 0.1 — **BORRADOR INCOMPLETO**
- **Estado:** ⚠️ Este ROPA **NO está finalizado**. Faltan hechos de negocio bloqueantes (entidad legal, rol de tratamiento, ubicación de datos, DPA/SCC, retención). Ver `../01-scope-assumptions-and-open-questions.md`. No debe usarse como registro oficial ni presentarse a una autoridad sin completar los campos marcados `[POR CONFIRMAR]`.

Base normativa de referencia (a desarrollar en Fase 4): GDPR Art. 30 / LOPDGDD (España); Ley 19.628 y Ley 21.719 (Chile); Ley 25.326 (Argentina); Ley 18.331 (Uruguay); leyes estatales US aplicables por umbral.

---

## Datos del responsable (POR CONFIRMAR — BLOCKING)

| Campo | Valor |
|---|---|
| Responsable / Controlador | `[POR CONFIRMAR]` — no hay entidad legal en el repo (Q1) |
| Razón social / forma jurídica | `[POR CONFIRMAR]` |
| Domicilio | `[POR CONFIRMAR]` |
| Contacto | info@hireeo.app (confirmado — `layout.tsx:156`) |
| DPO / representante UE | `[POR CONFIRMAR]` (evaluar necesidad en Fase 4) |

---

## Actividades de tratamiento

> Leyenda: base jurídica y retención son **propuestas condicionadas**, no determinaciones. "Evidencia" cita el código que demuestra el tratamiento.

### AT-01 — Gestión de cuentas y autenticación
- **Finalidad:** registro, login y gestión de la cuenta.
- **Categorías de titulares:** clientes, prestadores, administradores.
- **Categorías de datos:** identificativos (nombre, email), contacto (teléfono opc.), credenciales (hash bcrypt), IDs de OAuth (Google/Apple/Microsoft), avatar.
- **Base jurídica candidata:** ejecución de contrato.
- **Destinatarios / encargados:** proveedores OAuth (validación de token).
- **Transferencias internacionales:** sí (endpoints OAuth) — `[SCC/medidas POR CONFIRMAR]`.
- **Plazo de conservación:** `[POR CONFIRMAR]` (Q10).
- **Medidas de seguridad:** bcrypt(12), JWT (access 15m / refresh 30d), rate limiting, API key guard.
- **Evidencia:** `auth.service.ts:15,50-80,151-279`; `schema.prisma:139-171`; `app.module.ts:40-43`.

### AT-02 — Publicación y descubrimiento de servicios
- **Finalidad:** publicar anuncios y permitir su búsqueda.
- **Titulares:** prestadores (y datos de contacto expuestos).
- **Datos:** título, descripción, precio, comuna/región/localidad, datos de contacto, imágenes, redes sociales, nivel/destacado.
- **Base jurídica candidata:** ejecución de contrato + interés legítimo (visibilidad).
- **Encargados:** Cloudinary (imágenes).
- **Transferencias:** Cloudinary `[región POR CONFIRMAR]`.
- **Retención:** ligada a `endDate` del servicio; `[política formal POR CONFIRMAR]`.
- **Evidencia:** `schema.prisma:241-289,394-406`; `upload.service.ts:14-62`.

### AT-03 — Verificación de identidad (KYC)
- **Finalidad:** verificar identidad del prestador / prevención de fraude.
- **Datos en Hireeo:** `isKycVerified`, `kycVerifiedAt` (los documentos de identidad los procesa Stripe, no Hireeo).
- **Base jurídica candidata:** obligación legal (AML si aplica) / interés legítimo — `[POR CONFIRMAR]`.
- **Encargado:** Stripe Identity.
- **Estado:** parcial (`createVerificationSession` es STUB; webhook real).
- **Evidencia:** `kyc.service.ts:22-47`; `schema.prisma:165-166`.

### AT-04 — Mensajería entre usuarios
- **Finalidad:** comunicación cliente↔prestador para contratar.
- **Datos:** contenido de mensajes, remitente, marca de lectura; posibles datos de terceros incluidos por los usuarios.
- **Base jurídica candidata:** ejecución de contrato.
- **Retención:** `[POR CONFIRMAR]`.
- **Evidencia:** `schema.prisma:425-465`.

### AT-05 — Reseñas y moderación
- **Finalidad:** reputación y confianza; moderación de contenido.
- **Datos:** estrellas, comentario, estado (PENDING/ACTIVE/DELETED), respuesta del prestador.
- **Base jurídica candidata:** interés legítimo (integridad del marketplace).
- **Evidencia:** `schema.prisma:291-310`.

### AT-06 — Métricas de interacción/contacto
- **Finalidad:** medición del valor del anuncio (ver teléfono, llamada, WhatsApp).
- **Datos:** tipo de interacción, `userId?`, `metadata` (JSON — **esquema no acotado, riesgo de sobre-recolección**).
- **Base jurídica candidata:** interés legítimo — `[revisar contenido de metadata]`.
- **Evidencia:** `schema.prisma:377-392`.

### AT-07 — Direcciones y geolocalización precisa
- **Finalidad:** ubicación del servicio / matching.
- **Datos:** dirección postal + **latitud/longitud precisas** (dato de mayor riesgo).
- **Base jurídica candidata:** ejecución de contrato.
- **Evidencia:** `schema.prisma:507-538`.

### AT-08 — Pagos y facturación (FUTURO / no operativo)
- **Finalidad:** cobro de servicios / suscripciones / comisión (15%).
- **Estado:** **STUB** — no se procesan cobros reales ni se almacenan datos PCI hoy.
- **Encargados (futuro):** Stripe (es/us), MercadoPago (cl/ar/uy).
- **Rol de Hireeo:** `[POR CONFIRMAR — MoR? agregador? Q2 BLOCKING]`.
- **Evidencia:** `schema.prisma:312-334,489-505`; gateways (stubs); `escrow.service.ts:8`.

### AT-09 — Analítica web y trackers
- **Finalidad:** medición de uso.
- **Datos:** identificadores online, IP, eventos (cookies `_ga`, etc.); cookie propia `hireeo_country`.
- **Encargados:** Google (GTM `GTM-PT2PFWF9`, GA4 `G-WREYNC9F4M`).
- **Base jurídica:** **consentimiento requerido — NO recabado** (los scripts cargan sin gate). Hallazgo de incumplimiento (Fase 5).
- **Transferencias:** Google (US) — `[medidas POR CONFIRMAR]`.
- **Evidencia:** `layout.tsx:170-207`; `Footer.tsx:91`.

### AT-10 — Notificaciones (email / push)
- **Finalidad:** comunicaciones transaccionales / avisos.
- **Datos:** email + nombre (Brevo); `DeviceToken` + plataforma (Firebase).
- **Encargados:** Brevo (email), Firebase/Google (push).
- **Base jurídica candidata:** ejecución de contrato (transaccional); consentimiento si hay marketing.
- **Evidencia:** `email.service.ts:13-40`; `notifications.service.ts:1-45`; `schema.prisma:540-552`.

### AT-11 — IA (asistente y clasificador)
- **Finalidad:** ayudar a encontrar prestadores / clasificar necesidades.
- **Datos:** texto libre del usuario, país, localidad; puede crear borrador de solicitud.
- **Proveedor:** Google Gemini 2.5 Flash.
- **Entrenamiento por el proveedor:** `[POR CONFIRMAR — Q4 BLOCKING]`.
- **Transferencias:** Google — `[POR CONFIRMAR]`.
- **Evidencia:** `ai-agents.service.ts:27-70`; `chatbot.service.ts:33,45-112`; `hireeo-system.prompt.ts`.

### AT-12 — Auditoría de administración
- **Finalidad:** trazabilidad de acciones admin sobre integraciones.
- **Datos:** `userId`, acción, proveedor, `metadata`.
- **Base jurídica candidata:** interés legítimo / obligación de seguridad.
- **Evidencia:** `schema.prisma:572-586`.

---

## Campos transversales pendientes (aplican a todo el ROPA)

| Campo | Estado |
|---|---|
| Ubicación física de datos (PostgreSQL, backups, Cloudinary) | `[POR CONFIRMAR]` — Q5 BLOCKING |
| Inventario y garantías de transferencias internacionales (SCC/TIA) | `[POR CONFIRMAR]` — Q5/Q9 |
| DPA firmados con cada encargado | `[POR CONFIRMAR]` — Q9 |
| Periodos de retención por categoría | `[POR CONFIRMAR]` — Q10 (no hay retención en código) |
| Procedimiento de derechos de titulares (acceso/rectificación/supresión/portabilidad/oposición) | **No implementado como flujo** — a diseñar en Fase 4 |
| Medidas de seudonimización/cifrado en reposo de PII (más allá de credenciales de proveedor) | `[POR CONFIRMAR]` |
| Tratamiento de menores | Sin control de edad — `[POR CONFIRMAR]` Q6 |

> **Siguiente paso:** completar este ROPA en la Fase 4 una vez respondidas las preguntas BLOCKING Q1–Q5 y Q9–Q10. Requiere validación de abogado local por jurisdicción antes de considerarse oficial.
