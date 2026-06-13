# Auditoría Crítica Hireeo vs. Thumbtack & Angi
## Perspectiva CPO — Junio 2026

**Metodología:** análisis verificado contra el código fuente real del repositorio (no contra documentos de producto previos). Se auditaron adicionalmente 5 repositorios de referencia del sector (clones open-source y comerciales).

> **Nota sobre el doc anterior** (`comparativo-atlas-vs-thumbtack.md`, v1.0, 12-abr-2026): está
> desactualizado y es optimista. Hay diferencias graves entre el estado que describe y lo que el
> código realmente hace. Esta auditoría toma como fuente de verdad el código, no ese documento.

---

## 0. CORRECCIONES AL MODELO MENTAL (lo que crees que tienes ≠ lo que hay)

Hechos verificados en código que contradicen el brief del producto:

| Tú dijiste | Realidad en el código | Riesgo |
|---|---|---|
| "Suscripción Pro = tarifa **recurrente**" | Es un **pago único** por destacar UN servicio durante N meses (`Subscription.serviceId @unique`, `durationMonths`). No hay recurrencia ni `cron`/renovación. | Tu MRR no existe; es revenue one-shot disfrazado de suscripción |
| "Pasarela de pago nativa (MercadoPago/Stripe)" | Ambos gateways son **STUBS**. `stripe.gateway.ts` devuelve `pi_stub_...`; MercadoPago devuelve URL `stub_...`. `verifyWebhook` retorna `{ isValid: true }` **siempre, sin verificar firma**. | No puedes cobrar un peso. Y el webhook abierto es un agujero de seguridad: cualquiera puede marcar un pago como completado |
| "RBAC: SuperAdmin, Admin de País, Proveedor, Usuario" | Solo existen **2 roles** en el seed: `SuperAdministrador` y `Usuario`. "Proveedor" es un `Usuario` con un servicio publicado (etiqueta cosmética). "Admin de país" tiene infra (`UserRole.countryId`, `country-admin.guard.ts`) pero nadie lo tiene asignado. | Tu narrativa multi-país operativa no es real todavía |
| "Perfiles con calificaciones y confianza" | `ServiceTrustCard.tsx` muestra "Identidad verificada / Background / Certificación" con **checks verdes hardcodeados desde i18n** — no leen ningún campo del backend. | **UI engañosa / riesgo legal**: prometes verificación que no ejecutaste |
| "Sistema de publicación + booking" | `ServiceBookingCard` con campo "¿Cuándo?" es un input de texto placeholder; el botón solo abre chat o `tel:`. Fecha/dirección **no se persisten**. | No hay booking; es decoración |

**Lo que SÍ está bien:** chat en tiempo real (Socket.io + JWT, `chat.gateway.ts`), reviews colectivas
por servicio con moderación (PENDING→ACTIVE) y anti-autoreseña, matchmaking IA en el hero (Gemini
`gemini-2.5-flash`, NL→categoría, con fallback por keywords), geo dinámico país→región→localidad,
multi-moneda, y sponsors por país.

---

## 1. USABILIDAD Y CAPTURA DE DEMANDA (User Journey)

### El diagnóstico brutal
Hireeo es un **directorio de oferta** (tipo Páginas Amarillas con búsqueda), no un marketplace de
demanda. Thumbtack y Angi NO son directorios: capturan **intención estructurada**.

- **Thumbtack**: el cliente describe un proyecto vía cuestionario progresivo (categoría → preguntas
  específicas del oficio → fecha → ZIP) y los pros responden con cotización. El cliente nunca "busca
  en una lista": declara una necesidad y recibe matches.
- **Angi**: combina directorio + lead form + booking pre-cotizado ("Angi Services" con precio fijo
  para tareas estándar). Reduce el "¿cuánto saldrá?" a cero antes de contactar.

### El estado de Hireeo (verificado)
Embudo actual: home → `HeroSearchBar` (texto libre + localidad + geo GPS) → `matchServiceCategory`
(Gemini traduce "se rompió un caño" → `gasfiteria`) → redirige a `/search?c=...` → lista de
servicios → click en perfil → contacto (chat/`tel:`/WhatsApp).

**NO existe ningún modelo de demanda**: cero tablas `Job`, `Request`, `ServiceRequest`, `Lead`,
`Quote` en Prisma. El cliente nunca declara una necesidad estructurada. El brief muere en el hero:
el output de Gemini se tira a un `?c=slug` y se pierde toda la riqueza ("urgente", "fuga de agua
en cocina", foto del desperfecto).

### Fricciones concretas que matan conversión (bugs verificados)
1. `HeroCategories.tsx:23` linkea sin prefijo de país (`/search?c=` en vez de `/${country}/search`)
   → rompe ruteo multi-país.
2. Inconsistencia de parámetro de categoría: `CategoriesGridSection` usa `categoria=`, `SearchPageClient`
   lee `c=`, el backend espera `categoriaSlug`/`category`. **Clicks que no filtran nada.**
3. Filtro de "disponibilidad" (hoy/mañana/esta semana) es **UI falsa**: no filtra, no hay dato detrás.
4. `lat`/`lng` del hero (GPS del usuario) se mandan en la URL pero `services.service.ts:findAll`
   **no los consume** → el "near me" es humo.
5. Filtros de rating/precio/verificación se aplican **client-side** sobre la página ya traída → en
   cuanto haya volumen, los resultados filtrados serán inconsistentes con la paginación.

### Veredicto
Tu captura de demanda está ~2 generaciones atrás. No es "obsoleta" la búsqueda por región: es que
**no capturas la intención**. El activo más valioso de Thumbtack (el brief del cliente) lo estás
descartando con un `redirect`.

---

## 2. ARQUITECTURA DE SERVICIOS Y MODELO DE NEGOCIO

### Destrucción del modelo de "Suscripción Pro"
Tu modelo es **listing fee** (pago por destacar), peor aún, **one-shot** (no recurrente). Problemas:

1. **No alinea incentivos.** El pro paga por aparecer arriba, no por resultados. Si no le llegan
   clientes, percibe que pagó por nada → churn brutal. Thumbtack cobra **por lead/contacto**: el pro
   paga solo cuando hay valor.
2. **No escala con el valor.** Un electricista que cierra $2M/mes paga lo mismo que uno que cierra
   $0. Subsidias a los improductivos.
3. **No capturas la transacción.** El dinero del trabajo nunca pasa por Hireeo → cero take rate,
   cero datos de GMV, cero palanca para garantías ni retención.
4. **Los gateways son stubs.** Hoy no puedes cobrar la suscripción ni nada. Es el blocker #1.

### Modelo recomendado (híbrido, por madurez de mercado)
No copies pay-per-lead ciegamente (en LATAM con baja densidad de oferta, cobrar por lead ahoga la
liquidez inicial). Estrategia por fases:

- **Fase liquidez (LATAM, ahora):** listado **gratis** + **destacado pagado recurrente** + **pay-per-contact
  con créditos** opt-in. Tu propio `plan-mayo-mejoras.md` ya pide "Uruguay sin suscripciones para
  masificar registro" → monetización configurable por país (admin toggle `payments_enabled` ya
  migrado).
- **Fase transacción (US/ES, Stripe):** pago in-app del trabajo con take rate (5-15%) + **Instant
  Book pre-cotizado** (estilo Angi Services) para tareas estándar.

### Transparencia y cierre (evitar la fuga a WhatsApp)
- Thumbtack da **estimaciones de precio adelantadas** (Cost Guides + rangos por proyecto) → motor
  SEO #1 y reductor de incertidumbre #1. Hireeo no tiene Cost Guides.
- Hoy **institucionalizas la fuga**: expones teléfono/WhatsApp y hasta trackeas el click
  (`Interaction` VIEW_PHONE/WHATSAPP). Para cerrar adentro necesitas: cotización estructurada en el
  chat (hoy solo `{ text }`), pago in-app, y razón para volver (garantía/historial).

---

## 3. CONFIANZA Y SEGURIDAD (Trust & Safety)

### El problema más grave de todos
`ServiceTrustCard.tsx` muestra **"Identidad verificada ✓ / Background check ✓ / Certificación ✓"**
con texto estático del diccionario i18n. **No hay un solo campo de verificación en el modelo `User`**
(`email, password, name, phone, avatar`). Se está **mintiendo al usuario** sobre verificaciones que
no se hicieron. En servicios que entran a la casa:
- Es un riesgo legal/reputacional gigante (si un pro "verificado" comete un delito).
- Destruye la confianza que se intenta construir cuando se descubre.

**Acción inmediata:** o se cablean badges reales, o se quitan. No puede quedar como está.

### Comparación con la industria
- **Angi**: background checks (vía Checkr), verificación de licencia estatal, "Angi Certified",
  garantía monetaria (Happiness Guarantee / cobertura de daños). Confianza corporativa, no social.
- **Thumbtack**: verificación de identidad, "Top Pro" (~4% de pros, recalculado trimestral),
  Thumbtack Guarantee.
- **Hireeo**: solo reviews (bien hechas: colectivas, moderadas, anti-autoreseña, con respuesta del
  dueño). Pero reviews ≠ verificación. Un pro nuevo sin reviews es indistinguible de un estafador.

### Lo que falta construir (en orden de viabilidad)
1. **Verificación de contacto** (email + teléfono OTP) → badge real. Hoy ni eso existe.
2. **Verificación de identidad / KYC** por tiers: subir cédula/DNI + selfie, validación admin manual
   al inicio, luego API por país (en US/ES hay; en LATAM, manual o partners locales).
3. **Carga de licencias/certificados** con verificación admin → badge "Profesional certificado".
4. **Sistema de tiers de confianza** real. Separar **pagó por destacar** de **está verificado** —
   el `isPremium` actual mezcla ambos, lo cual es venenoso.
5. **Garantía** (largo plazo): empezar con "garantía de satisfacción" operativa (mediación + reembolso
   del fee) antes que cobertura monetaria real.

---

## 4. RETENCIÓN Y ENGAGEMENT (ciclo post-servicio)

### La realidad de la categoría
Contratar electricista/mudanza es **baja frecuencia** (1-2/año). Sin features de retención → app de
un solo uso → desinstalan → la próxima vez van directo al WhatsApp del pro que ya conocen.

### Lo que hacen los líderes
- **Recordatorios de mantenimiento** (Angi/Thumbtack: "tu caldera necesita revisión anual") → crean
  ocasiones de uso recurrente artificialmente.
- **Pago in-app** → el historial/recibos anclan al usuario a la plataforma.
- **Verticalización de frecuencia**: `plan-mayo-mejoras.md` ya lo intuye → LawnStarter
  (jardinería/piscina = recurrente semanal) y Care.com (cuidado de adultos/niños = relación continua).
  **Estas verticales resuelven el problema estructural de retención.** Es la apuesta estratégica más
  interesante de las notas de producto.

### Estado de Hireeo
- **Cero notificaciones** (push, in-app, email de re-engagement). Ningún gancho de retorno.
- **Cero pago in-app** → no hay historial de transacciones que ancle al usuario.
- **Cero recordatorios** ni concepto de servicio recurrente en el modelo de dominio.
- El chat existe pero no genera notificación fuera de la sesión activa → mensajes que no se ven.

### Veredicto
Hoy la retención depende 100% de que el usuario recuerde el dominio y vuelva por su cuenta. La fuga
a WhatsApp no es un bug: es la consecuencia lógica de no dar ninguna razón para volver.

---

## 5. EXPERIENCIA DEL PROFESIONAL (panel del proveedor)

### Diagnóstico
Se le da al pro un **escaparate**, no un **negocio**. Si solo se cobra "Pro" para aparecer arriba y
no hay herramientas operativas, no hay lock-in: el día que deje de pagar, no pierde nada porque
nunca movió su operación dentro de Hireeo.

### Lo que tiene hoy (verificado)
- Stats por servicio (vistas/contactos/conversiones — `ProviderStatsCard`).
- Gestión de servicios propios (`MisServicios`, publicar/editar con wizard).
- Chat en tiempo real, favoritos, ajustes de perfil, upsell a Pro.

### Lo que NO tiene (y Angi/Thumbtack ofrecen como SaaS al pro)
- **CRM de leads / pipeline** (nuevo → contactado → cotizado → ganado/perdido).
- **Agenda / calendario** real con disponibilidad (el "¿Cuándo?" actual es fake, no se persiste).
- **Cotizador / presupuestos** estructurados (enviar quote tipado en el chat, cliente acepta/rechaza).
- **Facturación** (boleta/factura, registro de cobros).
- **Notificaciones** de nuevos leads (hoy si el pro no está en la app activa, no se entera).

### La tesis de lock-in
Thumbtack/Angi hacen al pro **dependiente** porque su agenda, sus clientes, sus cobros y sus reseñas
viven ahí. Mover eso = perder el negocio. En Hireeo, el pro no tiene nada que perder al irse.
**El cotizador-en-chat + agenda + pago in-app son los tres que crean dependencia real.**

---

## 6. BENCHMARKING DE REPOSITORIOS DE REFERENCIA (clones open-source y comerciales)

Se auditaron 5 repos para contrastar arquitectura. Conclusión global: **ninguno está al nivel del
stack de Hireeo** (Next.js 16 + NestJS + Prisma); son útiles solo como referencia de **flujo de
producto** y como **checklist de features de mercado**, no de ingeniería.

| Repo | Stack real | Valor para Hireeo | Veredicto |
|---|---|---|---|
| **yonureker/TaskRubyt** | Rails + PostgreSQL + React/Redux, Google Places API, Heroku | **El más útil.** Tiene el flujo de booking que falta en Hireeo: auth → crear tarea → **seleccionar trabajador disponible** → **confirmar reserva** → ver tareas → cancelar. Es exactamente el embudo de demanda (CD1) + agenda (CD3). | Referencia de **flujo**, no de código |
| **chingu-voyage6/Geckos-Team-04** | React + styled-components, Jest, Travis CI, Heroku (clon Thumbtack) | Solo frontend. README pobre. Sirve para mirar componentes UI de búsqueda/perfil/carousel. Sin backend ni modelo de datos documentado. | Referencia visual marginal |
| **samuelvidhyasagar/taskrabbit-clone** | React Native (iOS/Android) + PHP | Showcase comercial de `nanlogical.com`. README sin sustancia técnica. Único valor: confirma que **app móvil nativa** es esperada en este vertical. | Promo, ignorar código |
| **appkodes/taskrabbit-clone** | — | **404 — el repositorio no existe.** | No evaluable |
| **zipprrofficial/taskrabbit-clone** | PHP/Laravel/MySQL (declarado; inconsistente con su propio README) | README **publicitario** de Zipprr (3 commits, página de venta). Sin código real. Su lista de features es un checklist de lo que el mercado considera "tabla rasa". | Marketing, útil como checklist |

### Checklist de features que estos clones dan por sentadas y Hireeo no tiene
1. **Booking con time slots / disponibilidad** — TaskRubyt ("seleccionar trabajador disponible + confirmar
   reserva"); Zipprr ("instantly book tasks and choose from available time slots"). El `ServiceBookingCard`
   de Hireeo es fake. **Refuerza CD3.**
2. **Gestión de la reserva post-contratación** (ver tareas, cancelar) — cero en Hireeo. **Refuerza §4 retención.**
3. **GPS preciso "near me"** — TaskRubyt usa Google Places. Hireeo manda `lat`/`lng` pero el backend los
   ignora. **Refuerza QW1.**
4. **App móvil nativa** — gap conocido; la apuesta razonable a corto plazo es PWA completa.
5. **Video en listings** — Zipprr lo anuncia; Hireeo tiene galería de imágenes, te falta video.

### Lección estratégica del benchmarking
TaskRubyt, con un stack inferior al de Hireeo, **modela el negocio mejor**: su entidad central es la
**tarea/reserva**, no el "servicio listado". Hireeo tiene el mejor stack del grupo pero el **peor
modelo de dominio** (directorio vs. marketplace transaccional). Confirma que CD1 (Request→Quote) y
CD3 (booking) no son opcionales.

---

## 7. ROADMAP DE ACCIÓN TÁCTICA

### 🟢 3 Quick Wins (este mes)

| # | Quick win | Por qué | Esfuerzo |
|---|---|---|---|
| QW1 | **Arreglar el embudo roto + eliminar TrustCard falso** — corregir `HeroCategories` link sin prefijo de país, unificar param de categoría a `c=`, quitar filtro de disponibilidad falso de la UI, y eliminar/cablear los badges de verificación hardcodeados. | Sangrado de conversión + riesgo legal activo, gratis de arreglar. | Bajo |
| QW2 | **Google OAuth** (NextAuth ya soporta el provider) → registro en 1 clic. | -30-50% de fricción en signup. La barrera de cuenta es el mayor punto de fuga del embudo. | Bajo |
| QW3 | **Persistir el brief del hero** — en vez de tirar el output de Gemini a `?c=slug`, pasar la descripción completa + localidad al primer mensaje del chat al contactar un proveedor (pre-rellenado). | Convierte el matchmaking IA de adorno a captura de intención real, sin construir el modelo Job todavía. | Bajo-Medio |

### 🔴 3 Core Differentiators (3-6 meses)

| # | Diferenciador | Qué construir | Por qué es el correcto |
|---|---|---|---|
| CD1 | **Embudo de demanda (Request → Quote)** | Modelos Prisma `ServiceRequest` (brief estructurado: categoría, preguntas por oficio, fecha, ubicación, fotos, urgencia) y `Quote` (mensajes tipados en el chat existente). Cliente publica necesidad → pros cotizan. Reutiliza `Conversation`/`Message` + matchmaking Gemini. | Es el salto de directorio a marketplace. Captura el activo de Thumbtack (el brief), habilita pay-per-lead, mantiene la negociación adentro. Todo lo demás depende de esto. |
| CD2 | **Cobro real + transacción in-app** | (a) Implementar `stripe.gateway.ts` y `mercadopago.gateway.ts` con verificación de firma real en webhooks. (b) Monetización configurable por país (`payments_enabled` toggle ya migrado). (c) Suscripción recurrente real + pay-per-contact con créditos + (US/ES) pago del trabajo con take rate. **Requiere `/cso` — zona de pagos.** | Hoy no se puede cobrar (stubs) y el webhook es un agujero de seguridad. Es el blocker #1 absoluto. |
| CD3 | **Capa de confianza + agenda del pro** | (a) Verificación por tiers (contacto OTP → KYC → licencia) con badges reales separados de `isPremium`. (b) Modelo `Availability`/calendario + Instant Book pre-cotizado para tareas estándar. (c) Notificaciones in-app/push para leads y mensajes. | Cierra el gap de confianza (§3), crea lock-in del pro (§5) y da ganchos de retención (§4). |

### ⭐ Apuesta estratégica (alto upside a 12+ meses)
**Verticalizar a una categoría de alta frecuencia** (jardinería/piscina tipo LawnStarter, o cuidado
tipo Care.com). Resuelve el problema estructural de retención de baja frecuencia que Thumbtack/Angi
nunca resolvieron del todo. Es el mayor diferenciador potencial, no solo "alcanzar" a los gigantes.

---

## Secuencia de ejecución recomendada
1. **QW1 + QW2 + QW3** (semana 1-3) — detener el sangrado de conversión y la UI engañosa.
2. **CD2** (cobro real + toggle por país) — desbloquear monetización antes que nada más.
3. **CD1** (Request→Quote) — el pivote de modelo de directorio a marketplace.
4. **CD3** (confianza + agenda + notificaciones) — lock-in y retención.

---

*Auditoría generada: junio 2026. Fuente de verdad: código fuente del repositorio + 5 repos de
referencia del sector (TaskRubyt, Geckos-Team-04, samuelvidhyasagar, appkodes, zipprrofficial).*
