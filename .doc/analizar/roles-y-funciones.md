# Hireeo — Roles y Funciones por Usuario

**Actualizado:** 2026-06-12  
**Versión:** 2.2

---

## Resumen de roles

| Rol | Scope | Descripción |
|---|---|---|
| `SuperAdmin` | Global (todos los países) | Control total del sistema. Bypasa todos los guards. |
| `Admin` | Scoped por país | Gestión operativa de contenido en su(s) país(es) asignado(s). |
| `Professional` | Propio perfil y servicios | Publica servicios, gestiona suscripciones, atiende leads. |
| `Client` | Propio perfil | Busca y contrata profesionales. |
| _(público)_ | Sin cuenta | Solo lectura de contenido público. |

---

## 1. SuperAdmin

> Acceso irrestricto. El `RolesGuard` hace bypass total cuando el usuario tiene este rol.

### Secciones frontend

| Sección | Ruta |
|---|---|
| Panel de configuración global | `/config` |
| Gestión de países | `/config/countries` |
| Gestión de categorías | `/config/categories` |
| Gestión de usuarios | `/config/users` |
| Gestión de sponsors | `/config/sponsors` |
| Gestión de reseñas | `/config/ratings` |
| Gestión de servicios | `/config/services` |
| Precios premium | `/config/premium-prices` |
| Pagos y suscripciones | `/config/payments` |
| Interacciones | `/config/interactions` |
| Panel admin por país | `/{country}/admin/*` |

### Funciones exclusivas (solo SuperAdmin)

| Función | Endpoint backend |
|---|---|
| Crear / editar países | `POST /geo/countries`, `PATCH /geo/countries/:code` |
| Ver países con datos sensibles | `GET /geo/admin/countries` |
| Crear / editar / eliminar precios premium | `POST /prices`, `PATCH /prices/:id`, `DELETE /prices/:id` |
| Asignar roles a usuarios | `PUT /users/:id/roles` |

### Funciones compartidas con Admin

Ver sección Admin — el SuperAdmin accede a todo lo de Admin sin restricción de país.

---

## 2. Admin (Country Admin)

> Gestiona el contenido de su(s) país(es) asignado(s). No puede tocar configuración global ni precios.

### Secciones frontend

| Sección | Ruta |
|---|---|
| Panel admin del país | `/{country}/admin` |
| Categorías del país | `/{country}/admin/categories` |
| Reseñas | `/{country}/admin/ratings` |
| Servicios publicados | `/{country}/admin/services` |
| Sponsors | `/{country}/admin/sponsors` |
| Suscripciones y pagos | `/{country}/admin/payments` |
| Precios premium (lectura) | `/{country}/admin/premium-prices` |
| Interacciones | `/{country}/admin/interactions` |
| Usuarios | `/{country}/admin/users` |

### Funciones

| Función | Endpoint backend |
|---|---|
| Listar todas las categorías (vista admin) | `GET /categories/admin` |
| Crear / editar / eliminar categorías | `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id` |
| Listar todas las reseñas | `GET /ratings` |
| Moderar reseñas (cambiar estado PENDING → ACTIVE → DELETED) | `PATCH /ratings/:id` |
| Listar todos los sponsors | `GET /sponsors` (público) |
| Crear / editar / eliminar sponsors | `POST /sponsors`, `PATCH /sponsors/:id`, `DELETE /sponsors/:id` |
| Activar / desactivar servicios | `PATCH /services/:id/active` |
| Marcar servicio como destacado | `PATCH /services/:id/featured` |
| Listar todas las suscripciones (con stats) | `GET /subscriptions` |
| Ver listado de interacciones | `GET /interactions` |
| Ver métricas de interacciones | `GET /interactions/metrics` |

---

## 3. Professional (Prestador de Servicio)

> Publica y gestiona sus propios servicios. Gestiona su relación con clientes: leads, cotizaciones, mensajes.

### Secciones frontend

| Sección | Ruta |
|---|---|
| Publicar / editar servicio | `/{country}/publish` |
| Mi perfil (resumen) | `/{country}/profile` |
| Mis servicios | `/{country}/profile` (tab) |
| Leads (mini-CRM) | `/{country}/profile/leads` |
| Cotizaciones | `/{country}/profile/cotizaciones` |
| Mensajes | `/{country}/profile/mensajes` |
| Verificación de identidad (KYC) | `/{country}/profile/verificacion` |
| Ajustes de cuenta | `/{country}/profile/ajustes` |

### Funciones

| Función | Endpoint backend |
|---|---|
| Crear servicio | `POST /services` |
| Editar servicio propio | `PATCH /services/:id` |
| Activar / desactivar servicio propio | `PATCH /services/:id/toggle-owner` |
| Eliminar servicio propio | `DELETE /services/:id` |
| Suscribir servicio a plan Premium | `POST /subscriptions` |
| Ver suscripción propia | `GET /subscriptions/:id` |
| Responder reseñas de su servicio | `PATCH /services/:serviceId/ratings/:ratingId/reply` |
| Ver estadísticas de contacto de su servicio | `GET /services/:serviceId/stats` |
| Ver dashboard de leads (Kanban) | `GET /crm/dashboard` |
| Ver y responder cotizaciones | `GET/POST /quotes` |
| Ver mensajes (chat) | WebSocket |
| Actualizar perfil | `PATCH /users/:id` |
| Cambiar contraseña | `PATCH /users/me/password` |

### Flujo de monetización (actual — Fases 1–3)

```
Publica servicio (BASIC, gratuito)
  → Suscribe a plan PREMIUM (MercadoPago / Stripe)
    → Servicio marcado PREMIUM + featured=true
      → Mayor visibilidad en búsquedas
```

---

## 4. Client (Cliente)

> Busca profesionales, toma contacto, puede dejar reseñas y guardar favoritos.

### Secciones frontend

| Sección | Ruta |
|---|---|
| Búsqueda de servicios | `/{country}/search` |
| Detalle de servicio | `/{country}/service/[slug]` |
| Favoritos | `/{country}/profile/favoritos` |
| Mensajes | `/{country}/profile/mensajes` |
| Cotizaciones recibidas | `/{country}/profile/cotizaciones` |
| Ajustes de cuenta | `/{country}/profile/ajustes` |

### Funciones

| Función | Endpoint backend |
|---|---|
| Buscar servicios (filtros: país, región, localidad, categoría, nivel) | `GET /services` |
| Ver detalle de servicio | `GET /services/:slug` |
| Dejar reseña en un servicio | `POST /services/:serviceId/ratings` |
| Ver reseñas de un servicio | `GET /services/:serviceId/ratings` |
| Guardar / quitar favorito | `POST/DELETE /favorites` |
| Crear solicitud de servicio (wizard) | `POST /service-requests` |
| Ver cotizaciones de profesionales | `GET /quotes` |
| Enviar mensaje (chat) | WebSocket |
| Registrar interacción (ver teléfono, email, WhatsApp) | `POST /interactions` (público, sin auth) |
| Actualizar perfil | `PATCH /users/:id` |
| Cambiar contraseña | `PATCH /users/me/password` |

---

## 5. Público (sin cuenta)

> Solo puede leer. No requiere autenticación.

### Secciones accesibles

| Sección | Ruta |
|---|---|
| Home | `/{country}` |
| Búsqueda de servicios | `/{country}/search` |
| Detalle de servicio | `/{country}/service/[slug]` |
| Planes y precios | `/{country}/pricing` |
| Cómo funciona | `/{country}/how-it-works` |
| Sobre nosotros | `/{country}/about-us` |
| Contacto | `/{country}/contact` |
| Ayuda | `/{country}/help` |
| Términos y privacidad | `/{country}/terms`, `/{country}/privacy` |
| Login / Registro | `/{country}/login`, `/{country}/register` |

### Funciones

| Función | Detalle |
|---|---|
| Ver servicios publicados | Búsqueda con filtros geográficos y por categoría |
| Ver perfil de profesionales | Detalle de servicio con reseñas activas |
| Ver precios de planes | Tabla de planes por país |
| Registrar interacción de contacto | `POST /interactions` — no requiere auth (telemetría de clics) |

---

## Matriz de acceso rápida

| Módulo / Acción | Público | Client | Professional | Admin | SuperAdmin |
|---|:---:|:---:|:---:|:---:|:---:|
| Ver servicios | ✅ | ✅ | ✅ | ✅ | ✅ |
| Publicar servicio | — | — | ✅ | — | ✅ |
| Activar/desactivar servicio (admin) | — | — | — | ✅ | ✅ |
| Dejar reseña | — | ✅ | — | — | ✅ |
| Responder reseña | — | — | ✅ (propia) | — | ✅ |
| Moderar reseñas | — | — | — | ✅ | ✅ |
| Favoritos | — | ✅ | ✅ | — | ✅ |
| Solicitar servicio (wizard) | — | ✅ | — | — | ✅ |
| Ver leads (CRM) | — | — | ✅ | — | ✅ |
| Suscripción Premium | — | — | ✅ | — | ✅ |
| Gestionar categorías | — | — | — | ✅ | ✅ |
| Gestionar sponsors | — | — | — | ✅ | ✅ |
| Ver suscripciones (todas) | — | — | — | ✅ | ✅ |
| Ver interacciones (métricas) | — | — | — | ✅ | ✅ |
| Gestionar precios premium | — | — | — | — | ✅ |
| Gestionar países | — | — | — | — | ✅ |
| Asignar roles a usuarios | — | — | — | — | ✅ |
| Chat en tiempo real | — | ✅ | ✅ | — | ✅ |

---

## Notas técnicas

- **Asignación inicial de rol:** Todo usuario nuevo (registro, Google, Apple, Microsoft) recibe automáticamente el rol `Client`.
- **Cambio de rol a Professional:** Se hace manualmente desde el panel admin (`PUT /users/:id/roles`), o en el futuro mediante flujo de onboarding de profesional.
- **Scope de Admin por país:** El campo `adminCountries` en el JWT contiene los códigos ISO2 de países asignados. El guard no filtra por país automáticamente — es responsabilidad del service validarlo.
- **SuperAdmin bypass:** El `RolesGuard` devuelve `true` directamente si el usuario tiene el rol `SuperAdmin`, sin evaluar los `@Roles()` declarados en el endpoint.
