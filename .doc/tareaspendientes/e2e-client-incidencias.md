---
title: Incidencias — E2E Client
tags: [hireeo, testing, e2e, client, incidencias]
---

# Incidencias detectadas — plan-e2e-client.md

Referencia: [[../testingqa/plan-e2e-client]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución iniciada 2026-08-27, cuenta `client1.cl@hireeo.app`.

> [!success] Estado de resolución (remediación 2026-08-29, [[grok-e2e-incidencias]])
> - **INC-003 — RESUELTO.** Backend: `@Roles(Role.PROVIDER)` + `RolesGuard` en `GET /service-requests/available` y `GET /quotes/my-quotes` (verificado en vivo: Client → 403, Professional → 200). Frontend: guard de rol en `profile/leads/page.tsx` y `profile/services/page.tsx`, redirige a `/unauthorized` si no es Professional.
> - **INC-004 — RESUELTO.** `actualizarPassword`: `.parse()` movido dentro del try/catch, errores de Zod/API ahora legibles en vez de un genérico. Ver también F8 (patrón P1 aplicado transversalmente con `parseOrFail`).
> - **INC-004b — RESUELTO.** Política única (8+, mayúscula, minúscula, número, especial) unificada en `userSchemas.ts`, `authSchemas.ts` (registro) y `register.dto.ts` (backend). Fixture `Hireeo2026!Test` sigue siendo válido.
> - **INC-005 — RESUELTO.** `AddressForm.tsx` consume `getActiveCountries()` (público) en vez de `getAdminCountries` (admin-only) — verificado con Client real en `cl` y `es`, 200 en `GET /geo/countries` con `id` tipado en `CountryConfig`.
> - **INC-006 — RESUELTO.** `ChatMensajes.tsx` lee `session.user.backendToken` (antes leía campos inexistentes) — el socket ahora conecta de verdad.
> - **INC-007 — RESUELTO.** `handleSend` bloquea el envío con error visible si el socket no está conectado (nunca mensaje fantasma); reconciliación de ID temporal cuando llega el mensaje real por socket.
> - **INC-008 — Verificado sin regresión** tras el fix del interceptor de fechas (F1/INC-012): no se reprodujo Invalid Date/NaN en las pantallas de este plan.

## INC-003 — El dashboard de Professional (leads, servicios) no valida el rol, solo la sesión

- **Caso**: E2E-CLI-013
- **Severidad**: Media (no hay fuga de datos confirmada en el estado actual de fixtures, pero el control de acceso está roto — depende de la mitigación incidental de que un Client puro no tiene servicios activos)
- **País**: `cl` (código compartido sin lógica de país — aplica a los 5)
- **Rol**: Client autenticado (probado con `client1.cl@hireeo.app`)

**Pasos**:
1. Login como Client (`client1.cl@hireeo.app`).
2. Navegar directamente a `/cl/profile/leads`.
3. Navegar directamente a `/cl/profile/services`.

**Esperado**: E2E-CLI-013 — "Solo la transición autorizada habilita Professional; admin/config nunca accesibles." Un Client sin el rol Professional no debería poder cargar el dashboard de Professional.

**Observado**: ambas páginas **cargan completas** para el Client — "Solicitudes disponibles" (Leads) y "Mis Servicios" — sin redirect a `/unauthorized` ni ningún error. `/cl/profile/leads` muestra "0 disponibles" porque `client1.cl` no tiene servicios activos (ver causa raíz), no porque el acceso esté bloqueado.

**Causa raíz**:
- `frontend/src/app/(country)/[country]/(account)/profile/leads/page.tsx:24-27` y el equivalente en `profile/services/page.tsx` solo verifican `if (!session?.user) redirect(login)` — nunca verifican `session.user.roles.includes('Professional')`.
- Backend `GET /service-requests/available` (`backend/src/modules/service-requests/service-requests.controller.ts:26-30`) solo tiene `@UseGuards(JwtAuthGuard)` a nivel de clase — ningún guard de rol. El mismo patrón en `GET /quotes/my-quotes` (`quotes.controller.ts:27-30`).
- La única razón por la que no hay fuga de datos ajenos hoy es que `ServiceRequestsService.findAvailableForProvider` (`service-requests.service.ts:90-101`) calcula las categorías desde los `Service` activos del usuario y devuelve `[]` si no tiene ninguno — un Client puro nunca tiene servicios, así que la lista sale vacía **por casualidad de los datos**, no por control de acceso.
- La mutación real (`POST /quotes` para enviar una cotización) **sí está protegida correctamente**: `quotes.service.ts:23-25` lanza `ForbiddenException` si `roles` no incluye `PROVIDER` (ni es admin). Verificado en código — no se explotó en vivo para no ensuciar datos de fixtures.

**Impacto real**: si un usuario tuviera rol Client pero conservara (por bug de datos, migración, o cambio de rol mal revertido) al menos un `Service` activo, vería leads reales de otros usuarios (nombre, categoría, ubicación de la solicitud) sin tener el rol Professional vigente. Incluso sin ese escenario, es un control de acceso ausente que solo funciona "por defecto de datos", no por diseño — motivo suficiente para agregar el guard de rol explícito en ambos endpoints y ambas páginas.

**Nota**: `/cl/admin` y `/config` con esta misma sesión Client sí redirigen correctamente a `/cl/unauthorized` — el problema es específico a las rutas de Professional (`leads`, `services`), no una falla general de autorización.

---

## INC-004 — "Cambiar contraseña" muestra error aunque el cambio se aplicó correctamente

- **Caso**: E2E-CLI-002
- **Severidad**: Alta (confunde al usuario: cree que su contraseña sigue siendo la vieja, pero ya cambió — el siguiente intento de "cambiar de nuevo" con la vieja como "actual" fallará con "credenciales inválidas" sin explicación)
- **País**: `cl` (componente compartido, sin lógica de país — aplica a los 5)
- **Rol**: Client (probado con `client1.cl@hireeo.app`)

**Pasos**:
1. Login como Client.
2. Ir a `/cl/profile/settings`, sección "Seguridad".
3. Completar "Contraseña actual" = la real, "Nueva contraseña" = una que cumpla el schema real (8+ caracteres, 1 mayúscula, 1 carácter especial — ver INC-004b), "Confirmar nueva" = igual.
4. Enviar.

**Esperado**: E2E-CLI-002 — "contraseña anterior revocada" tras un cambio válido, con confirmación clara al usuario.

**Observado**: la UI muestra el toast **"Error al procesar la solicitud."** — pero la contraseña **sí cambió**. Verificado en dos formas independientes:
- `SELECT password, "updatedAt" FROM users WHERE email='client1.cl@hireeo.app'` mostró un hash nuevo con timestamp coincidente al intento.
- Login en un contexto de navegador completamente aislado (sin cookies previas) con la contraseña nueva funcionó y devolvió la sesión de `client1.cl` normalmente.

Además, tras el cambio, la pestaña donde se hizo el cambio (con la sesión JWT vieja aún en la cookie) entró en **`ERR_TOO_MANY_REDIRECTS`** al navegar a `/login` — consistente con que cambiar la contraseña incrementa `tokenVersion` (invalidando el JWT en curso) sin refrescar la sesión del cliente que originó el cambio, dejando esa pestaña en un estado inconsistente.

**Causa raíz probable** (no confirmada al 100% por falta de log explícito del lado servidor para esa request puntual, pero consistente con el código revisado):
- `frontend/src/features/users/components/profile/AjustesPerfilForm/AjustesPerfilForm.tsx:104-123` (`handleUpdatePassword`) envuelve la llamada a la Server Action `actualizarPassword` en un `try/catch` que muestra "Error al procesar la solicitud." ante **cualquier** excepción no capturada — incluyendo una que no es un fallo de negocio real.
- `frontend/src/features/users/actions/mutations.ts:165-184` (`actualizarPassword`) llama a `passwordUpdateSchema.parse(data)` **fuera** de su propio `try/catch` (que solo envuelve el `apiClient.patch(...)`). Un `ZodError` de esa línea se propaga como excepción no controlada de la Server Action — lo cual explica el mismo mensaje genérico para los dos primeros intentos (contraseña sin carácter especial, ver INC-004b) — pero **no explica por sí solo** el caso exitoso.
- Hipótesis más probable para el caso exitoso: al cambiar la contraseña, el backend incrementa `tokenVersion` (mismo patrón que `forgotPassword`, `auth.service.ts:298`), invalidando el JWT que la propia request de cambio de contraseña estaba usando. Si el flujo posterior (ej. una revalidación de sesión, un refresh de token, o un middleware que lee la sesión tras la mutación) se ejecuta con ese JWT ya inválido, puede lanzar una excepción que la UI interpreta como fallo de la operación completa, aunque el cambio en sí ya se persistió.

**Impacto**: cualquier Client, Professional o Admin que cambie su contraseña desde Ajustes verá un mensaje de error incorrecto tras una operación exitosa, con alta probabilidad de reintentar (fallando esta vez con "credenciales inválidas" porque su contraseña "actual" ya no es la vieja) y de terminar bloqueado de su cuenta por confusión, similar en efecto práctico a INC-002.

---

## INC-004b (menor, ligado a INC-004) — El formulario no informa el requisito real de "carácter especial" en la contraseña nueva

- **Severidad**: Baja/UX
- El copy bajo "Nueva contraseña" en `/cl/profile/settings` dice únicamente **"Mín. 8 caracteres"**. El schema real (`frontend/src/features/users/schemas/userSchemas.ts:4-8`, `passwordSchema`) exige además **1 mayúscula y 1 carácter especial** (`[!@#$%^&*(),.?":{}|<>]`).
- Al enviar una contraseña que cumple "8 caracteres + mayúscula" pero sin carácter especial (ej. `NuevaPass123`), el `ZodError` resultante no se muestra al usuario — cae en el mismo toast genérico "Error al procesar la solicitud." (ver causa raíz de INC-004), sin decirle qué falta.
- El formulario de **registro** (`/register`) sí anuncia correctamente "Mín. 8 caracteres, una mayúscula, un número" — pero ese copy tampoco menciona el carácter especial que el backend de registro no exige (`RegisterDto` solo pide `@MinLength(8)`, sin regex) mientras que el de cambio de contraseña sí lo exige vía `passwordSchema`. Es decir, **las reglas de contraseña son inconsistentes entre registro y cambio de contraseña**, y ninguno de los dos copys refleja con precisión la regla que realmente se aplica.

---

## INC-005 — "Agregar dirección" está completamente bloqueado: el selector de país está siempre vacío

- **Caso**: E2E-CLI-003
- **Severidad**: Crítica (bloquea por completo la creación de direcciones — campo requerido sin ninguna opción seleccionable)
- **País**: `cl` (componente compartido, sin lógica de país — aplica a los 5)
- **Rol**: Client (probado con `client1.cl@hireeo.app`)

**Pasos**:
1. Login como Client.
2. Ir a `/cl/profile/addresses` → "Agregar mi primera dirección".
3. Abrir el select "País \*".

**Esperado**: E2E-CLI-003 — poder crear una dirección con "Geo del país" (región → localidad dependiente).

**Observado**: el `<select>` de "País \*" solo tiene la opción placeholder **"Selecciona país"** — cero países reales cargados. Como el campo es requerido y depende de él la carga de Región/Ciudad (también vacíos), **es imposible completar el formulario y crear una dirección**. Confirmado inspeccionando el DOM directamente: `options: ["Selecciona país"]` para los tres selects (país, región, ciudad).

**Causa raíz**:
- `frontend/src/features/users/components/admin/AddressForm/AddressForm.tsx:9,262` — el formulario de direcciones usado en `/profile/addresses` (Client) importa `getAdminCountries` desde `features/configuration/countries/actions/queries.ts:8-15`, que llama a `GET /geo/admin/countries` — endpoint del backend protegido con `@Roles(Role.SUPER_ADMIN)` (`backend/src/modules/geo/geo.controller.ts:49-51`).
- Un Client (o cualquier rol que no sea SuperAdmin) recibe 403 al llamar ese endpoint. `getAdminCountries()` atrapa el error silenciosamente y devuelve `[]` (sin loguear, sin propagar el error) — el formulario nunca se entera de que la carga falló, solo ve una lista vacía.
- Ya existe el endpoint correcto para este caso: `GET /geo/countries`, marcado `@Public()` en el mismo controller (línea 41-44) — es el que debería usar cualquier formulario fuera del panel SuperAdmin.
- El nombre y ubicación del componente (`features/users/components/admin/AddressForm/`) sugiere que se construyó para el panel Admin/Config y se reutilizó tal cual en el flujo de Client sin adaptar su fuente de datos de países.

**Impacto**: ningún Client (ni, por la misma razón, Professional) puede **crear ni editar** una dirección desde `/profile/addresses` en ningún país — se confirmó que el modo edición sufre el mismo bloqueo (país/región vacíos e inválidos, el submit queda bloqueado por validación aunque el campo "Ciudad" sí trae opciones porque depende del `regionId` ya guardado, no del select de país). **Eliminar sí funciona** (usa `window.confirm`, no depende del formulario geo) — se insertó una dirección directamente por SQL para poder probar edición/eliminación por separado del bug de creación.

---

## INC-006 — El widget de chat flotante nunca envía mensajes: lee un campo de sesión que no existe

- **Caso**: E2E-CLI-007
- **Severidad**: Crítica (rompe por completo uno de los tres pilares del producto anunciados en el propio Home — "Chat directo: Mensajería 1:1 con el profesional" — para el 100% de los usuarios, sin excepción ni condición de carrera)
- **País**: `cl` (componente compartido sin lógica de país — aplica a los 5)
- **Rol**: Client (probado con `client1.cl@hireeo.app` → `pro1.cl@hireeo.app`)

**Pasos**:
1. Login como Client. Abrir una ficha de servicio (`/cl/service/servicio-prueba-1-cl-pzyz9`).
2. Click en "Chat" (widget flotante). Escribir y enviar un mensaje.
3. En otra sesión, login como el Professional dueño del servicio (`pro1.cl@hireeo.app`) y abrir la misma conversación desde `/cl/profile/messages`.

**Esperado**: E2E-CLI-007 — "Socket autenticado; mensajes ordenados/persistentes y no visibles para tercero."

**Observado**:
- Del lado del Client, el widget muestra el mensaje enviado en pantalla con hora, como si hubiera funcionado.
- Del lado del Professional, la conversación existe (nombre y avatar del Client correctos) pero dice **"Envía el primer mensaje a Cliente 1 Chile..."** — cero mensajes.
- Verificado directamente en la base de datos: `SELECT * FROM messages WHERE "conversationId" = '...'` → **0 filas**. El mensaje nunca se persistió, para nadie.

**Causa raíz** (`frontend/src/features/chat/components/ChatMensajes/ChatMensajes.tsx:37`):
```ts
const token = (session as any)?.user?.token || (session as any)?.token || null;
const { socket } = useChatSocket(token);
```
El campo real donde NextAuth expone el JWT del backend en la sesión es **`session.user.backendToken`** (`frontend/src/app/api/auth/[...nextauth]/route.ts:163`: `session.user.backendToken = token.backendToken`). `ChatMensajes.tsx` busca `session.user.token` y `session.token` — **ninguno de los dos existe**, así que `token` es siempre `null`. `useChatSocket` (`frontend/src/features/chat/hooks/useChatSocket.ts:10-11`) corta con `if (!token) return;` dentro de su `useEffect` — el socket nunca se crea, `socket` es siempre `null` para cualquier usuario.

En `handleSend()` (`ChatMensajes.tsx:132-146`), el mensaje se agrega al estado local (`setMessages`) de forma optimista **antes** de intentar enviarlo, y el envío real es `if (socket) { socket.emit('send_message', ...) }` — sin `else`, sin manejo de error, sin fallback a una llamada REST. Como `socket` es siempre `null`, esa rama nunca se ejecuta: el mensaje queda solo en el estado local del navegador que lo escribió y desaparece al recargar o cerrar el widget.

**Dato clave — el componente hermano SÍ está bien implementado**: `frontend/src/features/chat/components/ChatWindow/ChatWindow.tsx:32-33` (usado en la página completa `/profile/messages/[id]`) lee correctamente `session?.user?.backendToken` y el socket conecta sin problema ahí (se confirmó "● En línea" al entrar como Professional). El bug está aislado al **widget flotante**, que tiene su propia implementación de socket duplicada y con el nombre de campo equivocado — no es un problema de infraestructura de sockets en general.

**Impacto**: cualquier conversación iniciada desde el botón "Chat" en la ficha pública de un servicio (el punto de entrada principal para un Client que recién descubre un profesional) se pierde por completo, sin ningún aviso de error. El usuario cree que escribió y el profesional nunca lo sabe.

---

## INC-007 (menor, ligado a INC-006) — En la página completa de chat, el propio mensaje no aparece hasta recargar, y luego muestra "Invalid Date"

- **Severidad**: Media
- **País**: `cl` (componente compartido — aplica a los 5)
- A diferencia del widget (INC-006), la página completa `/profile/messages/[id]` (`ChatWindow.tsx`) sí persiste el mensaje correctamente en el backend. Pero:
  1. **El emisor no ve su propio mensaje en pantalla tras enviarlo** — `sendMessage()` (`ChatWindow.tsx:92-102`) no hace optimistic update; el mensaje solo se agrega al estado cuando llega el evento `new_message` por socket (`ChatWindow.tsx:64-69`). El backend sí hace broadcast a toda la room incluyendo al emisor (`this.server.to(room).emit(...)` en `backend/src/modules/chat/chat.gateway.ts:125-127`, correcto), así que el efecto observado es consistente con una condición de carrera entre `join_conversation` y `send_message` cuando se escribe muy rápido tras cargar la página — el mensaje se guarda pero el emisor no estaba aún unido a la room cuando el servidor hizo el broadcast. Requiere más instrumentación para confirmar al 100%; no se profundizó más por prioridad frente a INC-005/006.
  2. Tras recargar la página, el mensaje sí aparece, pero con la hora mostrada como **"Invalid Date"** en vez de la hora real. `ChatBubble.tsx:29` llama `date.toLocaleTimeString(...)` sobre un `date={new Date(msg.createdAt)}` (`ChatWindow.tsx:153`) — el wrapping es correcto en el código leído; no se identificó la causa exacta de por qué `msg.createdAt` produce una fecha inválida en este flujo (posible discrepancia de formato entre lo que devuelve el endpoint REST `GET /chat/conversations/:id/messages` y lo esperado). Pendiente de diagnóstico más profundo.

---

## Hallazgo de alcance (no es bug de código) — El "wizard de solicitud de servicio" de E2E-CLI-009 no existe en el producto

- **Caso**: E2E-CLI-009 (y por extensión, la precondición de E2E-CLI-010)
- El botón **"Solicitar este servicio"** en la ficha pública NO abre ningún wizard de `ServiceRequest` — abre el mismo widget de chat flotante que el botón "Chat" (`frontend/src/features/services/components/detail/ServiceBookingCard/ServiceBookingCard.tsx:51-52,102-106`: ambos botones llaman `chatWidgetBus.emit('open_chat', conversationId)`).
- No existe en el frontend ningún componente de formulario/wizard para crear un `ServiceRequest` (categoría, descripción, urgencia, presupuesto, ubicación) — se buscó en todo `features/services/` y solo aparecen componentes de **lectura** (`ServiceRequestCard`, para el dashboard de leads del Professional) y acciones de lectura (`getAvailableLeads`, `getMySentQuotes`). El endpoint backend `POST /service-requests` existe y funciona (probado insertando el registro directamente y viéndolo aparecer correctamente en "Leads disponibles" del Professional), pero **no hay ningún punto de entrada en la UI que lo invoque**.
- El modelo de datos tampoco soporta lo que describe el caso: `service_requests` solo tiene `categoryId`, `description`, `urgency`, `countryId` — no hay campos de presupuesto ni ubicación como anticipa el plan ("presupuesto/ubicación/campos disponibles").
- **No se trata de un bug reproducible en código roto** — es una discrepancia entre lo que describe el plan de pruebas y el flujo real del producto (que reemplazó la creación formal de una solicitud por chat directo). Se insertó un `ServiceRequest` fixture por SQL para poder probar de todas formas la aceptación de cotizaciones (E2E-CLI-010, ver estado de ejecución).
- **Resuelto (Gate `G-REQUEST`, plan canónico [[grok-e2e-incidencias]] §7, 2026-08-29): no se construye wizard.** Es una feature nueva, fuera de alcance de esta remediación — el flujo real (chat directo) queda como el comportamiento esperado. E2E-CLI-009 se actualiza a **NOT-APPLICABLE / chat-only**, no a un bug pendiente.

---

## INC-008 (menor, mismo patrón que INC-007) — "Invalid Date" / "hace NaN d" en Leads y Cotizaciones

- **Severidad**: Baja/UX, pero recurrente en varias pantallas
- En `/cl/profile/leads` (Professional), la tarjeta de un lead muestra **"hace NaN d"** en vez de la antigüedad real de la solicitud.
- En `/cl/profile/quotes` (Client), la tarjeta de la solicitud muestra **"Invalid Date"** en el mismo lugar donde debería ir la fecha.
- Mismo síntoma que INC-007.2 (chat) — sugiere un problema transversal de formateo/parseo de fechas en varios componentes del dominio de servicios/chat, no aislado a uno solo. No se investigó la causa raíz común por prioridad frente a los hallazgos críticos; recomendable una revisión puntual de todos los usos de `toLocaleDateString`/`toLocaleTimeString`/cálculo de "hace N días" en `features/services` y `features/chat`.

---

## Estado de ejecución

| Caso | Resultado | Alcance verificado |
|---|---|---|
| E2E-CLI-001 | PASS | Browser, `cl` (login, sesión persiste tras refresh, solo datos propios) |
| E2E-CLI-002 | **FAIL — INC-004/INC-004b** | Browser, `cl`. Edición de perfil (válido/inválido/persistencia) PASS; cambio de contraseña: actual incorrecta rechazada OK, pero cambio válido reporta error falso y deja la pestaña de origen en loop de redirect. Fixture restaurado (password + tokenVersion) |
| E2E-CLI-003 | **FAIL — INC-005** | Browser + código, `cl`. Crear y editar dirección bloqueados (selector de país vacío); eliminar funciona. Dirección fixture insertada por SQL para poder probar edición/eliminación por separado |
| E2E-CLI-004 | PASS | Browser, `cl` (estado vacío, agregar/quitar desde ficha, sincroniza con listado tras recarga) |
| E2E-CLI-005 | PASS (parcial) | Browser, `cl`. Estado vacío correcto; conversación aparece y es accesible. No se probó el deep-link a conversación ajena (pendiente) |
| E2E-CLI-006 | PASS | Browser, `cl` (buscar, abrir ficha, guardar/quitar favorito — mismo flujo que 004) |
| E2E-CLI-007 | **FAIL — INC-006/INC-007** | Browser, `cl` + DB, con `pro1.cl@hireeo.app` como Professional real. Widget flotante de chat: mensajes nunca se envían (INC-006, crítico). Página completa de chat: sí persiste pero no refleja el propio mensaje sin recargar, y luego muestra "Invalid Date" (INC-007, menor) |
| E2E-CLI-008 | PASS (nota UX) | Browser, `cl`. Vacío→"Selecciona una calificación", válido→queda PENDING (verificado en DB), no visible hasta moderación, duplicado rechazado ("Ya has calificado este servicio anteriormente", 1 sola fila en DB). Nota menor: el formulario no precarga la reseña existente al reabrirlo |
| E2E-CLI-009 | **NOT-APPLICABLE** (hallazgo de alcance) | Ver sección arriba — el wizard descrito no existe; "Solicitar este servicio" abre chat, no un formulario de `ServiceRequest` |
| E2E-CLI-010 | PASS (con `ServiceRequest` fixture, dado 009) | Browser, `cl`, dos sesiones reales (`client1.cl` + `pro1.cl`). Professional envía cotización desde "Leads disponibles" → Client la ve en "Mis cotizaciones" y la acepta → `service_requests.status='ACCEPTED'`, `quotes.accepted=true` verificado en DB. No se probó "rechazo de alternativas" (solo había 1 cotización) |
| E2E-CLI-011 | BLOCKED (esperado, no es bug) | Browser, `cl`. Modal de escrow con desglose correcto (comisión 15%/85%); al confirmar pago, mensaje claro "Los pagos están deshabilitados para el país CL" — configuración intencional de prelanzamiento gratuito (visible en `/cl/admin`, toggle "Pagos habilitados") |
| E2E-CLI-012 | PASS | Browser, `cl`, cuenta `client2.cl` (para no contaminar `client1.cl`). Cancelar mantiene rol Client; confirmar avisa cierre de sesión, cierra sesión, y el re-login refleja rol Professional sin duplicar filas en `user_roles` (verificado en DB). Rol revertido a Client tras la prueba |
| E2E-CLI-013 | **FAIL parcial — INC-003** | Browser + código, `cl`. `/admin` y `/config` correctamente denegados; `/profile/leads` y `/profile/services` accesibles sin rol Professional |
| E2E-CLI-014 | PASS | Browser, `cl` (URL `/ar/profile` con sesión de `cl` fuerza el país real de la sesión, no mezcla datos) |

**Alcance por país**: verificación interactiva completa en `cl`, con dos sesiones reales (Client + Professional) para los flujos que lo requerían (chat, cotizaciones, reseñas). No se replicó interactivamente en `ar`/`uy`/`es`/`us` — todos los bugs encontrados están en código compartido sin lógica de país, por lo que aplican a los 5 países, pero eso no fue confirmado país por país. E2E-CLI-005 (deep-link a conversación ajena) no se probó por prioridad frente a los hallazgos críticos.

Ejecución completa para esta ronda — pendiente de decisión de Edgardo sobre próximos pasos (fix de bugs, plan Professional, o replicar en otros países).
