# 15 — DPA / Anexo de Tratamiento de Datos para clientes empresariales y proveedores/subencargados

**Audiencia:** clientes empresariales (B2B) que requieran un DPA de Hireeo, y contraparte de cada proveedor/subencargado.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador.
**Estado:** 🟡 borrador — **no declara que existen DPA/SCC firmados**; ninguno está confirmado contractualmente a la fecha de este informe (`vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §2).

## 0. Advertencia de alcance — hecho confirmado

Este documento es una **plantilla y checklist**, no la confirmación de que Hireeo tiene DPA firmados con sus proveedores. `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §2 concluyó explícitamente: **"Ninguno está confirmado contractualmente con la evidencia de código disponible."** Cualquier versión pública de este documento debe reflejar únicamente los DPA que Legal confirme como firmados, no la lista completa de proveedores detectados en el código.

## 1. Partes y roles (según `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md`)

| Rol | Quién |
|---|---|
| Responsable/Controlador | Hireeo (respecto de los datos de sus usuarios) |
| Encargado/Procesador (de Hireeo hacia el cliente empresarial que firma este DPA) | Hireeo, cuando presta servicios a una empresa que a su vez es responsable de los datos de sus propios usuarios/empleados |
| Subencargados de Hireeo | Stripe, MercadoPago, Google (Gemini, OAuth, Analytics, Firebase/FCM), Cloudinary, Brevo, Vercel, proveedor de PostgreSQL — **lista sujeta a actualización**; ver inventario completo en `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §1 |

## 2. Cláusulas mínimas exigidas (checklist — heredado de `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §3.1, no reinventado)

- [ ] Objeto, naturaleza y finalidad del tratamiento.
- [ ] Instrucciones documentadas del responsable.
- [ ] Confidencialidad del personal autorizado.
- [ ] Medidas de seguridad (referencia a `security/security-and-privacy-controls-gap.md`).
- [ ] Identificación de subencargados y derecho de objeción.
- [ ] Asistencia en el ejercicio de derechos de titulares (referencia a `privacy/rights-request-protocol.md`).
- [ ] Compromiso de notificación de brechas y plazos (referencia a `privacy/breach-notification-protocol.md` y documento 14 de esta misma carpeta).
- [ ] Devolución/eliminación de datos al término del servicio.
- [ ] Derecho de auditoría/evidencia de certificaciones.

## 3. Anexo de transferencias internacionales

Basado en `privacy/international-transfers-inventory.md` (verificado contra EUR-Lex):

| Transferencia | Base legal | Estado |
|---|---|---|
| UE/EEE → Uruguay | Decisión de Ejecución 2012/484/UE (adecuación) | Vigente — sin SCC necesarias |
| UE/EEE → Argentina | Decisión 2003/490/CE (adecuación) | Vigente — sin SCC necesarias |
| UE/EEE → Chile | Sin decisión de adecuación | **Requiere SCC u otro mecanismo del art. 46 GDPR** — `[[DECISION REQUIRED: no hay SCC firmadas hoy]]` |
| UE/EEE → Estados Unidos | Decisión de Ejecución (UE) 2023/1795 (EU-US DPF) | Vigente **solo si el proveedor está autocertificado en el DPF** — `[[DECISION REQUIRED: confirmar certificación DPF de cada proveedor con sede en EE.UU. — Stripe, Google, Cloudinary, Brevo si aplica, Vercel]]` |

**No se debe declarar en ninguna versión pública de este anexo que existen SCC implementadas** sin el contrato firmado — regla explícita del encargo original (Fase 12).

## 4. Anexo de subencargados — estado real (no confirmado contractualmente)

| Proveedor | Servicio | ¿DPA confirmado? |
|---|---|---|
| Stripe | Pagos + KYC Identity | `[[DECISION REQUIRED]]` |
| MercadoPago | Pagos (CL/AR/UY) | `[[DECISION REQUIRED]]` |
| Google Gemini | IA (matchmaking, chatbot) | `[[DECISION REQUIRED]]` — adicionalmente: confirmar por contrato que el input no se usa para entrenamiento (no asumirlo, ver `vendors-and-transfers/...` §3.3) |
| Cloudinary | Almacenamiento de imágenes | `[[DECISION REQUIRED]]` |
| Brevo | Email transaccional | `[[DECISION REQUIRED]]` |
| Firebase/FCM (Google) | Notificaciones push | `[[DECISION REQUIRED]]` |
| Google/Apple/Azure OAuth | Login social | `[[DECISION REQUIRED]]` |
| Vercel | Hosting | `[[DECISION REQUIRED]]` |
| Proveedor de PostgreSQL | Base de datos primaria | `[[DECISION REQUIRED: proveedor y región no confirmados — BLOCKING]]` |

## 5. Brecha crítica adicional (heredada, no nueva)

`vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` señala que Google Analytics 4 y Google Tag Manager cargan **sin mecanismo de consentimiento previo** (`frontend/src/app/layout.tsx:174-207`) — esto es una brecha de cumplimiento de cookies/ePrivacy, no de este DPA, pero debe resolverse antes de que este anexo pueda considerarse completo para clientes empresariales en la UE.

## 6. Revisión por abogado local pendiente

Ningún proveedor de este anexo tiene DPA confirmado contractualmente a la fecha de este informe. Este documento es una plantilla a completar por Legal a medida que se firmen los contratos reales — no debe usarse frente a un cliente empresarial como evidencia de cumplimiento actual.
