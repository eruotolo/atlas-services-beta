# Roadmap Definitivo de Consolidación y Crecimiento: Hireeo (Junio 2026)

**Origen:** Merge absoluto y exhaustivo de `analisis-claude-junio.md` (Auditoría Forense Técnica) y `analisis-gemini-junio.md` (Visión UX y Negocio).

Este documento es el plano maestro arquitectónico completo. Aquí no hay "cuentagotas". Detalla **el 100% de las tareas necesarias** para llevar a Hireeo de ser un directorio estático a un Marketplace transaccional masivo estilo Thumbtack/Angi.

Para lograr una velocidad de desarrollo irreal, todo el trabajo está **estrictamente dividido** entre dos Inteligencias Artificiales operando en paralelo sin colisión de código:
*   **🟢 GEMINI 3.1 (Liderazgo Backend):** Dueño absoluto de `/backend`, `schema.prisma`, NestJS, pasarelas de pago, algoritmos de match y APIs de terceros.
*   **🟣 CLAUDE CODE (Liderazgo Frontend):** Dueño absoluto de `/frontend`, Next.js, React, UI/UX, Estado global y, a futuro, la aplicación móvil en React Native.

---

## ✅ CHECKLIST DE ESTADO DE EJECUCIÓN (Live)
*Actualicen este checklist manualmente conforme vayan subiendo el código.*

### 🟢 Tareas para Gemini 3.1 (Líder Backend)
**Fase 1 & 2:**
- [x] Crear el documento unificado `analisis-junio.md` con roadmap completo.
- [x] **Hotfix Stripe:** Implementar verificación criptográfica `constructEvent` en webhooks.
- [x] **Hotfix MercadoPago:** Implementar validación HMAC `x-signature` en webhooks.
- [x] **Transaccionalidad DB:** Modificar `schema.prisma` agregando tablas `ServiceRequest` y `Quote`.
- [x] **Migración BD:** Aplicar `prisma migrate dev` para sincronizar PostgreSQL.
- [x] **Endpoints del Wizard:** Programar módulo `ServiceRequests` (Controlador y Servicio) para recibir POST de datos.

**Fase 3 & 4 (Próximamente):**
- [x] Endpoints de `Quotes` (Cotizaciones) y lógica de estado (PENDING -> ACCEPTED).
- [x] APIs analíticas para el Mini-CRM del proveedor.
- [x] Integración Push Notifications con Firebase (FCM).
- [x] Integración pasarela de pagos Escrow (Split Payments).
- [x] Webhook de validación automática de identidad KYC (Jumio/Stripe Identity).

### 🟣 Tareas para Claude Code (Líder Frontend)
**Fase 1 & 2:**
- [x] **Control de Daños:** Borrar componentes falsos (`ServiceTrustCard`, `ServiceBookingCard`).
- [x] **UI Project Wizard:** Desarrollar el asistente interactivo de 3 pasos (Qué, Cuándo, Dónde).
- [x] **Server Actions:** Crear estructura base de integraciones con degradación elegante.
- [x] **Conexión Real:** Reemplazar el mock del Server Action con un `fetch` real hacia `POST /api/v1/service-requests` (Endpoint de Gemini listo).

**Fase 3 & 4 (Próximamente):**
- [x] Crear Vistas de Paneles de Cotización para el cliente.
- [x] Construir Dashboard CRM (Kanban) para los profesionales. *(descartado — reemplazado por Vista de Leads)*
- [x] Flujo visual de carga de documentos KYC.
- [x] Implementar el Modal de Checkout para el pago Escrow en Next.js.
- [ ] ~~Iniciar la arquitectura de la App Móvil en Flutter o React Native/Expo.~~ *(descartado por decisión del producto)*

---

## 🛠️ FASE 1: Control de Daños y Verdad Técnica (Semana 1)
*Objetivo: Extirpar mentiras legales del frontend y agujeros de seguridad del backend.*

### 🟣 Tareas para Claude Code (Frontend)
1.  **Eliminación de UI Engañosa:** Borrar los badges hardcodeados de "Identidad Verificada" y "Antecedentes" en `ServiceTrustCard.tsx`.
2.  **Limpieza de Booking Fake:** Quitar inputs de fechas que no se guardan en `ServiceBookingCard.tsx`. Dejar solo el CTA real "Solicitar Cotización".
3.  **Reparación de Routing:** Arreglar inconsistencias de queries (`?c=slug` vs `?categoria=slug`) en los componentes de categorías.

### 🟢 Tareas para Gemini 3.1 (Backend)
1.  **Seguridad Webhooks:** Destruir los stubs falsos (`isValid: true`) en `stripe.gateway.ts` y `mercadopago.gateway.ts` e implementar las validaciones criptográficas de los SDKs oficiales usando secretos de entorno por país.
2.  **Sanear Coordenadas:** Asegurar que los repositorios de Prisma consuman los parámetros `lat` y `lng` recibidos para que el filtro "Cerca de mí" funcione de verdad.

---

## 🚀 FASE 2: Pivote de "Directorio" a "Marketplace" (Mes 1)
*Objetivo: Capturar la intención del usuario y retener la negociación dentro de la plataforma.*

### 🟣 Tareas para Claude Code (Frontend)
1.  **El "Project Wizard":** Destruir la barra de búsqueda clásica. Construir un asistente paso a paso en React (¿Qué necesitas? -> ¿Cuándo? -> ¿Dónde?).
2.  **Paneles de Cotización:** Crear la UI para que el usuario pueda ver las "Ofertas" (Quotes) que le llegan de los profesionales en respuesta a su solicitud.
3.  **Conexión Real Backend:** Consumir los endpoints de `ServiceRequests` desarrollados por Gemini.

### 🟢 Tareas para Gemini 3.1 (Backend)
1.  **Estructura Transaccional:** Modificar `schema.prisma` agregando los modelos `ServiceRequest` (el problema del cliente) y `Quote` (la propuesta del pro) con la máquina de estados enum (`PENDING`, `QUOTED`, `ACCEPTED`).
2.  **Endpoints Core:** Programar los controladores y servicios en NestJS (`POST /service-requests`, `POST /quotes`, `PATCH /quotes/:id/accept`) con sus respectivos DTOs y validaciones para que el Wizard de Claude pueda guardar los datos.
3.  **Matchmaking IA:** Integrar la descripción en lenguaje natural del cliente con un LLM en el backend para pre-asignar la categoría técnica correcta automáticamente y notificar a los profesionales relevantes.

---

## 🏗️ FASE 3: Confianza Real (Trust & Safety) y Mini-CRM (Mes 2-3)
*Objetivo: Darle al profesional un software que no pueda abandonar (Lock-in) y al cliente seguridad total.*

### 🟣 Tareas para Claude Code (Frontend)
1.  **Mini-CRM del Profesional:** Construir un Dashboard en Next.js donde el pro vea un tablero Kanban con sus "Nuevos Leads", "Cotizaciones Enviadas" y "Trabajos Ganados".
2.  **Flujo de KYC (Know Your Customer):** UI para que los profesionales suban fotos de su documento de identidad y licencias comerciales al registrarse.
3.  **Badges Dinámicos:** Volver a implementar la UI de `ServiceTrustCard.tsx`, pero esta vez leyendo banderas reales del backend (`isKycVerified`, `licenseApprovedAt`).
4.  **App Móvil (React Native/Expo):** Iniciar un sub-proyecto móvil paralelo. Construir la app exclusiva para proveedores que reciba **Notificaciones Push** instantáneas cuando caiga un nuevo lead en su zona.

### 🟢 Tareas para Gemini 3.1 (Backend)
1.  **Endpoints del CRM:** Crear APIs complejas de agregación y estadística para alimentar el Dashboard Kanban del profesional.
2.  **Integración de Stripe Identity / Jumio:** Conectar APIs de verificación de identidad de terceros. Crear el endpoint de webhook donde el proveedor KYC notifique a Hireeo si el documento de identidad es real o falso, y actualizar la tabla `User`.
3.  **Servidor de Push Notifications:** Integrar Firebase Cloud Messaging (FCM) en NestJS para disparar notificaciones masivas a los teléfonos de los profesionales en el radio geográfico de un nuevo `ServiceRequest`.

---

## 💰 FASE 4: Cierre Financiero y Nuevo Modelo de Negocio (Mes 4-6)
*Objetivo: Evitar la fuga a WhatsApp, retener el dinero in-app y pivotar la monetización.*

### 🟣 Tareas para Claude Code (Frontend)
1.  **UI de Checkout (Escrow):** Crear el flujo de pago donde el usuario ingresa su tarjeta de crédito dentro de la plataforma (Integrando Stripe Elements o MP Checkout Pro) al aceptar una cotización.
2.  **Chat Enriquecido:** Reemplazar el chat de texto plano por un chat donde los mensajes puedan ser "Componentes de Cotización" interactivos (botones de "Pagar ahora", "Solicitar revisión").

### 🟢 Tareas para Gemini 3.1 (Backend)
1.  **Orquestación de Pagos Divididos (Split Payments):** Configurar Stripe Connect Custom Accounts o MercadoPago Marketplace. Cuando el usuario paga, el dinero queda retenido en *Escrow*.
2.  **Take Rate (Comisión):** Programar la lógica en NestJS para que, al finalizar el trabajo, el 85% del dinero vaya al profesional y el 15% quede para Hireeo.
3.  **Transición de Suscripciones:** Crear los scripts de base de datos para migrar a los usuarios del viejo modelo ineficaz de "Suscripción Plana" al nuevo modelo de "Listar es gratis, pero paga comisión al ganar el trabajo".
4.  **Motor de Retargeting:** Crear *CronJobs* en NestJS que envíen correos (vía Brevo) a clientes recomendando mantenciones recurrentes basadas en sus trabajos pasados.

---

## 📊 REFERENCIA: Benchmark de Features vs. Repositorios de la Industria

*Verificado en código — junio 2026. Fuentes: `yonureker/TaskRubyt` (Rails+React), `chingu-voyage6/Geckos-Team-04` (Node+MongoDB), `zipprrofficial/taskrabbit-clone` (README declarado).*

| Feature | TaskRubyt | Geckos-Team-04 | Zipprr (declarado) | Hireeo actual |
|---|---|---|---|---|
| Booking con fecha/hora persistida | ✅ real (`task_date`, `task_start_time`) | — | ✅ | ❌ fake (input no se guarda) |
| GPS / Places Autocomplete real | ✅ Google Places API | ✅ `/near-me/:locationId` | ✅ | ❌ `lat`/`lng` ignorados en backend |
| Estado del trabajo (`completed`) | ✅ boolean en DB | contratos ref | ✅ | ❌ no existe |
| Ver mis reservas activas | ✅ `/mytasks` | — | ✅ | ❌ no existe |
| Cancelar/eliminar reserva | ✅ `destroy` controller | — | ✅ | ❌ no existe |
| Mensajería in-app | — | ✅ `message` model + route | ✅ | ✅ (Socket.io + JWT) |
| Pagos escrow / split | ❌ no implementado | — | ✅ | ❌ stubs (`pi_stub_...`) |
| Trust badge real (verificación KYC) | ❌ también hardcodeado | — | ✅ | ❌ hardcodeado (`i18n` estático) |
| App móvil nativa (pro) | — | — | ✅ | ❌ pendiente |
| CRM / pipeline de leads | — | — | ✅ | ❌ no existe |
| Notificaciones push | — | — | ✅ | ❌ no existe |
| Modelo `ServiceRequest` / `Job` | ✅ tabla `tasks` | `contracts[]` en `Professional` | ✅ | ❌ no existe en Prisma |

### Notas de arquitectura (TaskRubyt)

Schema mínimo viable para `ServiceRequest` (mapeado desde `tasks` en Rails):
```
user_id        → cliente
tasker_id      → pro seleccionado
category_id
description    TEXT
location       STRING (Google Places result)
task_date      DATE
task_start_time TIME
completed      BOOLEAN  default: false
vehicle_required BOOLEAN default: false
```

Estado entre pasos del wizard: Redux (equivalente Hireeo → Zustand o `ServiceWizardProvider` con React Context).

> **Anti-patrón confirmado:** tanto TaskRubyt como Hireeo hardcodean el trust badge. Es un problema generalizado del sector — construirlo real en Hireeo es diferenciador competitivo real.
