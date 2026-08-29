---
title: Incidencias — E2E Professional
tags: [hireeo, testing, e2e, professional, incidencias]
---

# Incidencias detectadas — plan-e2e-professional.md

Referencia: [[../testingqa/plan-e2e-professional]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución iniciada 2026-08-28, cuentas `pro1.cl@hireeo.app` / `pro2.cl@hireeo.app` / `client1.cl@hireeo.app` (contraseña estándar reseteada, ver [[../testingqa/README]]), con verificación puntual de geo/moneda en `pro1.ar@hireeo.app` y `pro1.es@hireeo.app`.

**Ronda 2 (2026-08-29)** — se completaron los casos pendientes de la ronda 1: E2E-PRO-011 (reseñas, antes NOT-TESTADO), re-test interactivo de E2E-PRO-007 y E2E-PRO-010, y verificación puntual de wizard en `pro1.uy@hireeo.app` y `pro1.us@hireeo.app`. Para E2E-PRO-011 se aprovechó una reseña `ACTIVE` de `client1.cl@hireeo.app` ya existente en DB desde la ronda 1 (no se creó ninguna reseña nueva); esa reseña no se veía en la ficha pública al inicio de la sesión por staleness de caché de 60s (ver INC-011), y quedó visible correctamente ("4.0 (1)") al re-consultarla más tarde. Durante el re-test de cambio de contraseña se cambió temporalmente la contraseña de `pro1.cl@hireeo.app` a un valor de prueba y se revirtió a la estándar (`Hireeo2026!Test`) al finalizar — confirmado con login exitoso.

## INC-009 — "Completar con IA" (generar descripción) está roto para el 100% de los Professionals, en los 5 países

- **Caso**: E2E-PRO-002
- **Severidad**: Alta (una de las funciones anunciadas del wizard de publicación nunca funciona, para nadie, en ningún país — código 100% compartido sin lógica de país)
- **País**: `cl` (código compartido — aplica a los 5)
- **Rol**: Professional (probado con `pro1.cl@hireeo.app`)

**Pasos**:
1. Login como Professional. Ir a `/cl/publish` (Paso 2 — Tu Oficio).
2. Completar "Título de tu Servicio" y seleccionar al menos 1 categoría válida (ej. "Electricidad").
3. Click en "Completar con IA".

**Esperado**: E2E-PRO-002 — "IA opcional revisada" debe generar una descripción profesional a partir del título y las categorías.

**Observado**: siempre aparece el error **"No se encontraron categorías válidas"**, sin importar que la categoría seleccionada exista y esté activa. Verificado que la categoría es real: `GET /categories?ids=<id-de-Electricidad>` contra el backend devuelve el registro correctamente (`curl` directo con `x-api-key`, 200 OK, array con 1 elemento).

**Causa raíz** (`frontend/src/features/services/publish/actions/mutations.ts:172-179`, función `generarDescripcionIA`):
```ts
const response = await apiClient.get<{ data: Array<{ id: string; name: string }> }>(
    `/categories?ids=${categorias.map(encodeURIComponent).join(',')}`,
);
const categoriasData = response.data ?? [];
if (categoriasData.length === 0) {
    return { error: 'No se encontraron categorías válidas' };
}
```
- `apiClient.get<T>` (`frontend/src/lib/api/apiClient.ts`) devuelve exactamente el JSON parseado de la respuesta — nunca envuelve el resultado en `{ data: ... }`. El endpoint `GET /categories` (`backend/src/modules/categories/categories.controller.ts:33-34`) responde un **array plano** de categorías, no `{ data: [...] }` — se confirma que en el resto del código base (`frontend/src/features/categories/actions/queries.ts:88`, `getCategorias`) el mismo endpoint se consume correctamente con `Array.isArray(response) ? response : []`, tratando la respuesta como el array directo.
- Como `response` ES el array y no tiene una propiedad `.data`, `response.data` es siempre `undefined` → `categoriasData` es siempre `[]` → el error se dispara **siempre**, sin importar cuántas categorías válidas se hayan seleccionado.

**Impacto**: ningún Professional, en ningún país, puede usar "Completar con IA" para generar la descripción del servicio. El usuario debe escribirla manualmente siempre — la feature de IA anunciada en el propio formulario ("💡 Tip: ... luego usa el botón de IA...") es inutilizable. No se pudo verificar el resto de la integración (`geminiService`) porque el código nunca llega a invocarla.

---

## INC-010 — Editar un servicio propio sin teléfono de contacto falla con un JSON crudo de Zod expuesto al usuario, y la validación es inconsistente entre creación y edición

- **Caso**: E2E-PRO-004
- **Severidad**: Alta (bloquea la edición de cualquier servicio creado sin teléfono, con un mensaje de error ilegible que no explica el problema real)
- **País**: `cl` (componente y Server Action compartidos, sin lógica de país — aplica a los 5)
- **Rol**: Professional (probado con `pro1.cl@hireeo.app`)

**Pasos**:
1. Login como Professional. Publicar un servicio nuevo desde `/cl/publish` **sin completar el campo "Teléfono / WhatsApp"** (el wizard de creación lo permite: el campo no es obligatorio ahí).
2. Ir a "Mis servicios" → "Editar" sobre ese mismo servicio.
3. Cambiar cualquier campo (ej. precio o región) y hacer click en "Actualizar Servicio", **sin tocar el teléfono** (sigue vacío, como quedó en la creación).

**Esperado**: E2E-PRO-004 — "Solo modifica el servicio propio, sin perder datos ni país", con validaciones comprensibles.

**Observado**: el toast de error muestra el **JSON crudo del arreglo de errores de Zod**, sin ningún formateo:
```
[ { "origin": "string", "code": "too_small", "minimum": 1, "inclusive": true, "path": [ "telefonoContacto" ], "message": "El teléfono de contacto es requerido" } ]
```
Al completar el teléfono y reintentar, la actualización se guarda correctamente (verificado en DB: precio, región, comuna y teléfono persistidos bien).

**Causa raíz**:
- **Inconsistencia de validación** — `frontend/src/features/services/schemas/serviceSchemas.ts`: `servicioCreateSchema.telefonoContacto` es `z.string().optional()` (línea 24), pero `ownServiceSchema`/`ownServiceUpdateSchema` (usados en edición, línea 61-69) lo redefinen como `z.string().min(1, 'El teléfono de contacto es requerido')` (línea 64). Un servicio creado válidamente sin teléfono queda en un estado que **nunca más se puede editar** hasta que el profesional agregue un teléfono — sin que nada en el wizard de creación advierta esta trampa futura.
- **El error nunca se formatea, se propaga crudo** — `frontend/src/features/services/actions/mutations.ts:170-174` (`actualizarServicioPropio`):
  ```ts
  export async function actualizarServicioPropio(data: OwnServiceUpdateInput) {
      const token = await getAuthToken();
      if (!token) return { error: 'No has iniciado sesión' };
      const validated = ownServiceUpdateSchema.parse(data);   // ← fuera del try/catch
      try { ... }
  ```
  `ownServiceUpdateSchema.parse(data)` está **fuera** del `try/catch` que empieza en la línea 176 — el mismo patrón exacto ya documentado en [[e2e-client-incidencias#INC-004]] para el cambio de contraseña. Cuando `.parse()` lanza un `ZodError`, la excepción no es capturada por esta función; se propaga como error no controlado de la Server Action, y Next.js serializa su `.message` (que en Zod es el JSON stringificado del arreglo de issues) hacia el cliente.
  - `frontend/src/features/services/components/forms/base/ServicioFormBase/ServicioFormBase.tsx:241-245` captura ese error genérico y lo muestra tal cual: `notify.error({ title: 'Error', description: message })`, sin ningún parseo — de ahí el JSON crudo visible al usuario.

**Impacto**: cualquier servicio (de cualquier Professional, en cualquier país) creado sin teléfono de contacto queda en un estado en el que **toda futura edición falla** con un mensaje incomprensible, hasta que el dueño complete el teléfono — algo que la UI nunca le indica explícitamente como requisito para poder seguir editando.

---

## INC-011 — La ficha pública de un servicio puede mostrar datos desactualizados (o un servicio ya desactivado) hasta 60 segundos después de editarlo o desactivarlo

- **Caso**: E2E-PRO-005
- **Severidad**: Media (ventana acotada a 60s, no es staleness indefinida, pero viola el criterio explícito "Estado público cambia" de forma inmediata)
- **País**: `cl` (código compartido — aplica a los 5)
- **Rol**: Professional (probado con `pro1.cl@hireeo.app`), verificado también desde una sesión anónima

**Pasos**:
1. Login como Professional. Editar un servicio propio (precio y ubicación) y luego desactivarlo desde "Mis servicios" ("Desactivar").
2. Confirmar en DB que el cambio se aplicó (`active=false`, precio/ubicación nuevos).
3. Abrir en una sesión anónima (sin login) `/cl/service/<slug>` del mismo servicio, poco después de la edición/desactivación.

**Esperado**: E2E-PRO-005 — "Estado público cambia; eliminación exige confirmación y no afecta servicios ajenos."

**Observado**: la ficha pública siguió mostrando el servicio **completamente activo y reservable** ("Solicitar este servicio" y "Chat" habilitados), con el **precio y la localidad anteriores** a la edición (`Las Condes` / `$25.000` en vez de `Viña del Mar` / `$30.000`, ya persistidos en DB) — a pesar de que el servicio ya estaba `active=false`. Un `reload` forzando bypass de caché del navegador, unos minutos más tarde, sí mostró correctamente `404` (el servicio ya no existía tras la eliminación posterior de la prueba). Esto es consistente con una ventana de caché de servidor de ~60s, no con un problema permanente.

**Causa raíz**:
- `frontend/src/features/services/actions/queries.ts:184-199` (`getServicioBySlug`) usa `apiClient.get(..., { revalidate: 60, tags: ['servicio-slug-${countryCode}-${slug}'] })` — cachea la respuesta hasta 60 segundos o hasta que se invalide el tag.
- Ninguna de las Server Actions que mutan un servicio propio (`actualizarServicioPropio`, `toggleActivoServicioPropio`, `eliminarServicioPropio` en `frontend/src/features/services/actions/mutations.ts:170-232`) llama `revalidateTag('servicio-slug-...')` — solo hacen `revalidatePath('/[country]/profile', 'page')`. La ficha pública del servicio nunca se invalida explícitamente; depende únicamente del vencimiento pasivo de los 60s.

**Impacto**: durante hasta 60 segundos después de que un Professional edite el precio/ubicación de un servicio o lo desactive, un cliente real que visite la ficha pública puede ver datos incorrectos, o incluso contactar/reservar un servicio que el profesional ya desactivó.

---

## INC-012 — La página de mensajes (`/{country}/profile/messages`) se cae por completo (500) para cualquier conversación con al menos un mensaje, por un bug del interceptor global de serialización que convierte toda fecha `Date` en `{}`

- **Caso**: E2E-PRO-010
- **Severidad**: Crítica (la bandeja de mensajes es 100% inaccesible en cuanto existe una conversación con mensajes; el bug es del interceptor HTTP global, no de esta feature — riesgo latente para cualquier otro endpoint del backend)
- **País**: `cl` (interceptor global sin lógica de país — aplica a los 5)
- **Rol**: Professional (probado con `pro1.cl@hireeo.app`, conversación real con `client1.cl@hireeo.app`)

**Pasos**:
1. Login como Professional. Ir a "Mensajes" (`/cl/profile/messages`), con al menos una conversación que tenga un mensaje real.

**Esperado**: E2E-PRO-010 — "Socket y persistencia correctos; URL ajena denegada."

**Observado**: la página nunca renderiza — Next.js muestra "This page couldn't load" con un error de React ("Encountered a script tag while rendering React component... at Providers.tsx"). Ese mensaje es un síntoma engañoso; la causa real, visible en el stacktrace de servidor (dev overlay), es:
```
RangeError: Invalid time value
    at formatDate (frontend/src/features/geo/lib/countryUtils.ts:152)
    at ConversationList (frontend/src/features/chat/components/ConversationList/ConversationList.tsx:73)
```

**Causa raíz**:
- `GET /chat/conversations` devuelve, para la única conversación de prueba, `"lastMessage":{"date":{}}` y `"lastMessageAt":{}` — objetos `Date` de Prisma serializados como **objeto vacío**, verificado con `curl` directo al backend (200 OK, JSON con `date: {}`), aunque en DB el valor es una fecha perfectamente válida (`messages.createdAt = 2026-08-27 18:17:05.431`). El dato nunca estuvo corrupto — se corrompe en tránsito.
- `backend/src/common/interceptors/serialize.interceptor.ts:18-29` (`stripSensitiveFields`, aplicado globalmente en `main.ts:51` vía `app.useGlobalInterceptors`): la función recorre recursivamente cualquier valor `typeof === 'object'` con `Object.entries(obj)` para filtrar campos sensibles. Un objeto `Date` de JS **es** `typeof 'object'` pero no tiene propiedades enumerables propias, así que `Object.entries(date)` devuelve `[]` y `Object.fromEntries([])` devuelve `{}` — la fecha se pierde por completo. Solo hay un guard explícito para `Prisma.Decimal` (línea 20); no hay ninguno para `Date`.
- `backend/src/modules/chat/chat.service.ts:89-90` (`getConversaciones`) devuelve `date: lastMessage.createdAt` y `lastMessageAt: c.lastMessageAt` como objetos `Date` crudos de Prisma, sin convertir a `.toISOString()` antes de responder — a diferencia de otros endpoints ya auditados (ej. `services.service.ts:251`, `date: r.createdAt.toISOString()`) que sí hacen la conversión manual y por eso no se ven afectados.
- `frontend/src/features/geo/lib/countryUtils.ts:145-153` (`formatDate`) tampoco valida el input antes de `new Date(date)` / `Intl.DateTimeFormat.format()`, así que cuando llega `{}` en vez de un string ISO, lanza `RangeError: Invalid time value` sin ningún catch, tumbando el Server Component completo (`ConversationList` se renderiza en SSR).

**Impacto**: cualquier Professional o Client con al menos una conversación con mensajes no puede abrir su bandeja de mensajes en ningún país — error 500 total, sin mensaje de error legible para el usuario ("This page couldn't load"). Además, el defecto del interceptor (`stripSensitiveFields` sin guard para `Date`) es estructural: **cualquier endpoint futuro que devuelva un campo `Date` de Prisma sin convertirlo manualmente a string quedará roto de la misma forma**, silenciosamente, hasta que algo intente parsear esa fecha en el frontend.

---

## INC-013 — El contador "Reseñas" del resumen del dashboard Professional está hardcodeado en 0 y nunca refleja las reseñas reales

- **Caso**: E2E-PRO-011
- **Severidad**: Alta (dato de negocio visible y prometido en el propio dashboard, siempre incorrecto)
- **País**: `cl` (código compartido — aplica a los 5)
- **Rol**: Professional (`pro1.cl@hireeo.app`, con 1 reseña `ACTIVE` real)

**Pasos**:
1. Login como Professional con un servicio que tenga al menos 1 reseña `ACTIVE`. Ir a "Resumen" (`/cl/profile`).

**Esperado**: E2E-PRO-011 — "leer, responder reseña propia y verificar métricas" (las métricas deben reflejar las reseñas reales).

**Observado**: el resumen muestra siempre "0 reseñas" / "RESEÑAS: 0 recibidas", incluso con 1 reseña `ACTIVE` confirmada en DB y visible correctamente en la ficha pública del servicio ("4.0 (1)").

**Causa raíz** (`frontend/src/features/users/actions/queries.ts:183-187`, función `getProfilePageData`):
```ts
stats: {
    totalServicios: services.length,
    totalCalificaciones: 0,          // ← nunca calculado
    premiumCount: services.filter((s) => s.level === 'PREMIUM').length,
},
```
`totalCalificaciones` está hardcodeado en `0` — un placeholder que nunca se completó. `services` (obtenido de `GET /users/:id/services`) sí trae el campo `totalRatings` por cada servicio (mismo `BackendServiceDto` usado en `services/actions/queries.ts:52`, `reviewsCount: s.totalRatings`), pero esta función nunca lo suma. La lógica correcta sería `services.reduce((sum, s) => sum + (s.totalRatings ?? 0), 0)`.

**Impacto**: todo Professional, en cualquier país, ve permanentemente "0 reseñas" en su resumen sin importar cuántas reseñas reales tenga aprobadas — un dato de negocio visible en la primera pantalla del dashboard, siempre falso.

---

## INC-014 — Cambiar la contraseña invalida la sesión activa sin avisar ni renovarla, dejando al usuario en un loop de redirección hasta que cierra sesión manualmente; y ningún error de validación del formulario de contraseña llega nunca al usuario con un mensaje específico

- **Caso**: E2E-PRO-007
- **Severidad**: Alta (el propio flujo de "cambiar tu contraseña" te bloquea de tu cuenta en la pestaña activa, sin ningún aviso ni recuperación posible salvo cerrar sesión y volver a loguearse)
- **País**: `cl` (componente y Server Action compartidos, sin lógica de país — aplica a los 5)
- **Rol**: Professional (`pro1.cl@hireeo.app`)

**Pasos (parte A — sesión rota)**:
1. Login como Professional. Ir a Ajustes (`/cl/profile/settings`) → "Seguridad".
2. Cambiar la contraseña con datos válidos (actual correcta, nueva ≥8 caracteres, coincide con confirmación). El cambio se confirma exitoso (`{"success":true}` en la respuesta de la Server Action).
3. En la misma pestaña, navegar a cualquier otra página o intentar revertir la contraseña de nuevo.

**Esperado**: E2E-PRO-007 — "Persistencia propia y sesión válida tras cambios."

**Observado**: tras el cambio exitoso, cualquier navegación posterior en la misma pestaña entra en un loop infinito de redirección (`ERR_TOO_MANY_REDIRECTS`) entre la página protegida y `/login`, incluyendo intentar ir a `/login` directamente. El único remedio encontrado fue abrir una pestaña con contexto de navegador limpio (sin las cookies de la sesión rota) y volver a loguearse manualmente con la nueva contraseña — no hay ningún mensaje que le explique esto al usuario ni redirección automática a un logout limpio.

**Causa raíz (hipótesis, no confirmada a nivel de código en esta ronda)**: consistente con que el cambio de contraseña incremente `tokenVersion` del usuario en el backend (mismo mecanismo documentado en `reference_backend_env_local`/README para el reseteo masivo de contraseñas: "El reseteo también incrementó `tokenVersion` de cada cuenta, invalidando cualquier sesión JWT previa"), invalidando el JWT embebido en la cookie `next-auth.session-token` de la sesión activa. El frontend (`next-auth`) nunca refresca ni invalida esa cookie tras el cambio exitoso, así que cualquier request subsecuente que dependa de sesión entra en un estado inconsistente que el proxy/middleware resuelve con un loop de redirect en vez de forzar un logout limpio.

**Pasos (parte B — mensajes de error genéricos)**:
1. En el mismo formulario, intentar cambiar la contraseña con una nueva contraseña de menos de 8 caracteres (el input HTML solo tiene `required`, sin `minLength` ni validación Zod en cliente).

**Observado**: toast genérico "Error al procesar la solicitud." — nunca dice cuál fue el problema real (contraseña muy corta, no coinciden, o actual incorrecta; este último caso muestra el también-genérico "Error al cambiar contraseña").

**Causa raíz** (`frontend/src/features/users/actions/mutations.ts:165-186`, `actualizarPassword`): `passwordUpdateSchema.parse(data)` (línea 169) está fuera del `try/catch` que empieza en la línea 171 — mismo patrón exacto ya documentado en [[e2e-client-incidencias#INC-004]] y en [[#INC-010]] de este mismo plan. La excepción de Zod se propaga como error no controlado de la Server Action; a diferencia de `ServicioFormBase` (que mostraba el JSON crudo), aquí `AjustesPerfilForm.tsx:120-121` sí tiene un `catch` genérico (`notify.error({ title: 'Error al procesar la solicitud.' })`) que oculta el detalle real en vez de exponerlo crudo — mejor para el usuario que ver JSON, pero sigue sin decirle qué corregir. El formulario tampoco valida nada en el cliente (`FormEvent` + `FormData` nativo, sin React Hook Form ni Zod resolver), así que ningún caso de error específico llega nunca al usuario con un mensaje accionable.

**Impacto**: cualquier Professional o Client, en cualquier país, que cambie su contraseña exitosamente queda con su sesión de navegador rota en la pestaña activa sin explicación (debe cerrar sesión y volver a entrar manualmente); y cualquier error de validación al cambiar contraseña (muy corta, no coincide, actual incorrecta) es indistinguible para el usuario — siempre ve un mensaje genérico sin saber qué corregir.

---

## Nota de alcance (no es bug) — E2E-PRO-003 (Wizard Premium) es NOT-APPLICABLE en los 5 países por decisión de producto

- El paso 3 del wizard de publicación ("Elige el Nivel de tu Servicio") **solo muestra la opción Básico** — no existe ninguna tarjeta ni opción Premium (1/3/6/9/12 meses) en la UI.
- Confirmado en DB: `SELECT code, "paymentsEnabled" FROM countries` devuelve `false` para los 5 países (`cl`, `ar`, `uy`, `es`, `us`). Esto es coherente con la misma constatación ya documentada para el rol Client ([[e2e-client-incidencias#E2E-CLI-011]]) — lanzamiento con capa gratuita, pagos deshabilitados intencionalmente en preproducción, no una deuda técnica.
- E2E-PRO-003 queda **NOT-APPLICABLE** en los 5 países hasta que `paymentsEnabled` se active para al menos uno.

---

## Estado de ejecución

| Caso | Resultado | Alcance verificado |
|---|---|---|
| E2E-PRO-001 | PASS | Browser, `cl`. El wizard omite el Paso 1 ("Tus Datos") y arranca directo en Paso 2 ("Tu Oficio") para el dueño autenticado |
| E2E-PRO-002 | **FAIL parcial — INC-009** | Browser + código, `cl`. Wizard completo (categorías, título, descripción manual, imagen principal, precio, región/comuna, contacto, términos) publica correctamente y aparece en ficha/listado con los datos correctos (verificado en DB). "Completar con IA" nunca funciona (INC-009) |
| E2E-PRO-003 | **NOT-APPLICABLE** (nota de alcance) | DB, 5 países. `paymentsEnabled=false` en los 5 países — ninguna opción Premium visible en la UI, por diseño de prelanzamiento gratuito |
| E2E-PRO-004 | **FAIL parcial — INC-010** | Browser + DB, `cl`. Edición de título/precio/región/comuna/contacto persiste correctamente una vez agregado el teléfono; sin teléfono, la edición queda bloqueada con un error JSON crudo (INC-010) |
| E2E-PRO-005 | **FAIL parcial — INC-011** | Browser + DB + sesión anónima, `cl`. Activar/Desactivar y Eliminar cambian el estado correctamente en DB y no afectan servicios ajenos (verificado con el servicio de Plomería intacto); la ficha pública puede tardar hasta 60s en reflejar el cambio (INC-011). Eliminar exige `window.confirm` y no deja rastro del servicio |
| E2E-PRO-006 | PASS (parcial) | Browser, `cl`. Doble submit bloqueado por `disabled={loading}` en el botón de publicar (verificado en código). Validación de campo requerido (ej. descripción vacía) bloquea el submit con mensaje nativo del navegador. No se probó explícitamente upload fallido de imagen ni geo ausente por prioridad frente a los hallazgos ya confirmados |
| E2E-PRO-007 | **FAIL — INC-014** | Browser + network, `cl`. Actualizar nombre/teléfono en "Información general" persiste correctamente. Cambiar contraseña con datos válidos SÍ persiste (`{"success":true}` confirmado por network + re-login), pero invalida la sesión activa sin avisar, dejando un loop de redirección (INC-014 parte A); cualquier error de validación (contraseña corta, no coincide, actual incorrecta) muestra siempre un mensaje genérico sin causa real (INC-014 parte B). Contraseña de `pro1.cl` revertida y verificada al finalizar |
| E2E-PRO-008 | PASS | Browser + DB + fixture SQL, `cl`. Lead nuevo (`ServiceRequest` de categoría Plomería) aparece correctamente en "Leads disponibles" solo por coincidencia de categoría/país; contador Disponibles/Enviadas/Ganados correcto. Reproduce el bug de fecha ya documentado ("hace NaN d", mismo patrón que [[e2e-client-incidencias#INC-008]]) |
| E2E-PRO-009 | PASS | Browser + DB, `cl`, dos sesiones reales (`pro1.cl` + `client1.cl`). Validación nativa bloquea precio inválido (min 1); cotización válida se crea, mueve el lead de "Disponibles" a "Enviadas", es visible para el Client con nombre/precio/mensaje correctos, y el Client la acepta correctamente (verificado en DB: `quotes.accepted=true`, `service_requests.status` actualizado). No se intentó una segunda cotización sobre la misma solicitud porque la UI ya no la ofrece una vez enviada — confirma "cotización única" por diseño de flujo, no se probó el rechazo directo del backend |
| E2E-PRO-010 | **FAIL crítico — INC-012** | Browser + network + código, `cl`. La página de mensajes (`/cl/profile/messages`) se cae con 500 en cuanto hay una conversación con al menos un mensaje real — causa raíz identificada en el interceptor global de serialización (`Date` → `{}`), no en el chat en sí. El caso previamente documentado como "widget flotante roto, página completa funcional" queda superado: ahora la página completa tampoco funciona |
| E2E-PRO-011 | **PASS (con hallazgo — INC-013)** | Browser + DB, `cl`. Reseña `ACTIVE` ya existente de `client1.cl` (fixture de ronda 1, antes oculta por staleness de caché); dueño (`pro1.cl`) ve el formulario "Responder a esta reseña", publica la respuesta, persiste en DB (`ownerResponse` + `respondedAt`) y el botón desaparece tras responder. Aislamiento confirmado por código (`replyToRating` exige ownership, 409 si ya se respondió). El contador "0 reseñas" del resumen del dashboard nunca se actualiza — hardcodeado (INC-013), aunque la ficha pública sí muestra "4.0 (1)" correctamente |
| E2E-PRO-012 | PASS | Browser, `cl`. Estado inicial "PENDIENTE" correcto; al iniciar verificación, se muestra de forma transparente `Integration "Stripe KYC" not configured` sin simular un flujo falso ni cambiar el estado — comportamiento `BLOCKED` esperado por falta de credenciales sandbox, tal como pide el caso |
| Aislamiento (servicios) | PASS | Código, `cl`. `services.service.ts`: `update`, `delete` y `toggleActiveOwner` verifican `service.userId === requesterId` y lanzan `ForbiddenException` si no coincide (ni es admin); confirmado además que un Professional no puede ni siquiera abrir `/cl/publish/<slug-ajeno>` (404) |
| Aislamiento (cotizaciones/reseñas/stats) | PASS | Código, `cl`. `quotes.service.ts` exige rol PROVIDER; `ratings.service.ts:replyToRating` exige ser dueño del servicio; `interactions.service.ts:estadisticas` exige ser dueño o admin — los tres lanzan `ForbiddenException` en caso contrario |
| Ciclo completo Client→Professional | PASS (sin pago, ver E2E-PRO-003) | Browser + DB, `cl`. Client crea solicitud (fixture SQL, ver nota de alcance de [[e2e-client-incidencias#E2E-CLI-009]] — no existe wizard de solicitud en la UI) → Professional cotiza → Client acepta. Pago sandbox NOT-APPLICABLE (pagos deshabilitados) |
| Multi-país (geo/moneda) | PASS | Browser, `ar` y `es`. Wizard de publicación de `pro1.ar` muestra "Provincia" y moneda ARS correctas; el de `pro1.es` muestra "Comunidad Autónoma" y moneda EUR correctas, prefijo telefónico (+54 / +34) correcto, y el dueño y textos localizados correctos ("Profesional 1 Argentina/España", testimonio con país correcto en Home) |

**Alcance por país**: ejecución interactiva completa (los 12 casos + aislamiento + ciclo Client↔Professional) en `cl`. Para `ar`, `es`, `uy` y `us` se verificó puntualmente el wizard de publicación (Paso 2: label de región/departamento/state, moneda, prefijo telefónico, textos localizados) como representativos de cada variante geo/moneda — no se repitió el resto de los 12 casos porque todo el código de dashboard/publicación es compartido sin lógica de país, y los seis hallazgos (INC-009 a INC-014) están en Server Actions, schemas e interceptores globales sin ninguna rama por país. `uy` mostró "Departamento" + UYU + prefijo +598 correctos; `us` mostró "State" (50 estados) + USD + prefijo +1 correctos, con una **observación menor de i18n** (no bloqueante): el layout externo (nav/footer) de `us` está en inglés pero el wizard de publicación interno permanece íntegramente en español ("Publicar nuevo servicio", "¡Ya Casi Listo!") — mezcla de idiomas dentro de la misma sesión de usuario en EE.UU.

**Ronda 2 — casos completados**: E2E-PRO-011 (antes NOT-TESTADO, ahora PASS con hallazgo INC-013), E2E-PRO-007 (antes NOT RE-TESTADO, ahora FAIL con INC-014) y E2E-PRO-010 (antes NOT RE-TESTADO asumiendo el mismo estado que Client, ahora FAIL crítico con INC-012 — la situación real es peor que la asumida: la página completa de mensajes está rota, no solo el widget flotante). Los tres casos previamente marcados "NOT RE-TESTADO por asunción de paridad con Client" quedan cerrados con evidencia propia de Professional.
