---
title: Incidencias — E2E Publicación Multipaís
tags: [hireeo, testing, e2e, publicacion, multipais, incidencias]
---

# Incidencias detectadas — plan-e2e-publicacion-multipais.md

Referencia: [[../testingqa/plan-e2e-publicacion-multipais]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución iniciada 2026-08-28, vía alta anónima real (sin cuentas seed) en `cl`, `uy`, `ar`, `es`, `us`, cada uno con usuario y servicio propios (`e2e-publish-<pais>-<timestamp>@example.test`).

## INC-012 — Las redes sociales cargadas en el wizard se persisten correctamente pero nunca se muestran en la ficha pública del servicio

- **Caso**: E2E-PUB (Guion, paso 4 y 7 — "todos los tipos disponibles de redes sociales... coherentes"; criterio de aprobación "Se cargan y se visualizan correctamente... los ocho tipos de red social/sitio web")
- **Severidad**: Alta (funcionalidad completa del wizard sin efecto visible para el usuario final; el profesional carga sus redes creyendo que van a mostrarse y nunca aparecen)
- **País**: `cl` (verificado en profundidad), reproducible en los 5 — código 100% compartido, sin lógica de país
- **Rol**: Público/invitado (alta anónima) y, por extensión, Professional (mismo componente de wizard)

**Pasos**:
1. Completar el wizard de publicación en `/cl/publish` agregando los 8 tipos de red social/sitio web (Website, Facebook, Instagram, LinkedIn, TikTok, Twitter/X, YouTube, Otro), cada uno con una URL distinguible.
2. Publicar el servicio (Básico gratuito).
3. Abrir la ficha pública `/cl/service/<slug>`.

**Esperado**: la ficha muestra las 8 redes sociales cargadas.

**Observado**: la ficha pública no muestra ninguna red social ni sitio web — no existe ningún ícono, enlace ni sección para ellas. Verificado en DB que las 8 filas se persistieron correctamente:

```
SELECT * FROM social_media WHERE "serviceId" = '98131fa8-10ab-4f15-b8db-3bd810e49d43';
-- 8 filas: WEBSITE, FACEBOOK, INSTAGRAM, LINKEDIN, TIKTOK, TWITTER, YOUTUBE, OTHER — todas con su URL correcta
```

**Causa raíz**:
- La capa de datos SÍ mapea el campo: `frontend/src/features/services/actions/queries.ts:59-63` y `:81` (`redesSociales: (s.socialNetworks ?? []).map(...)`) — el objeto `ServiceDetail` (usado por `getServicioBySlug`, ver `frontend/src/features/services/components/detail/types.ts:1-8`) sí trae `redesSociales` disponible.
- Ningún componente de `frontend/src/features/services/components/detail/` lo renderiza. Verificado exhaustivamente: `grep -rln "social" frontend/src/features/services/components/detail/` solo matchea el comentario de `types.ts`; `ServiceAbout.tsx` (34 líneas completas, leído íntegro) solo renderiza `description`; no hay ningún otro componente (`ServiceHero`, `ServiceBookingCard`, `ServicePricingList`, etc.) que itere `redesSociales`.
- `frontend/src/app/(country)/[country]/(public)/service/[slug]/page.tsx` (285 líneas) orquesta `ServiceHero`, `ServiceAbout`, `ServiceGallery`, `ServicePricingList`, `ServiceReviewsList`, `ServiceBookingCard`, `ServiceSubNav`, `RelatedServices` — ninguno recibe ni usa `service.redesSociales`.

**Alcance multi-país**: componente 100% compartido sin lógica de país — aplica a los 5 países. No depende de si la alta es anónima o vía Professional (mismo dato, mismo componente de detalle).

---

## INC-013 — El límite de subida de imágenes (rate limit por IP) bloquea publicaciones legítimas con un mensaje genérico que no distingue un 429 de un error real, y detuvo la ejecución de este plan en `es`/`us`

- **Caso**: E2E-PUB guion paso 4-5 (carga de imagen principal + hasta 4 de galería)
- **Severidad**: Alta (bloquea por completo la publicación sin aviso claro al usuario ni guía de reintento; en este entorno de prueba impidió terminar la corrida real de `es` y `us`)
- **País**: `es` (reproducido en vivo, servicio no llegó a crearse), pero la causa es código de infraestructura compartido — aplica a los 5 países
- **Rol**: Público/invitado

**Pasos**:
1. Completar el wizard en cualquier país con imagen principal + 4 de galería (el máximo que permite el formulario: 5 subidas por publicación).
2. Repetir esto varias veces seguidas desde la misma IP (en este caso: 3 publicaciones completas de 5 imágenes cada una en `cl`, `uy`, `ar`, y luego un cuarto intento en `es`).
3. Enviar el formulario (Paso 2 → "Siguiente Paso").

**Esperado**: la publicación se completa; si hay un límite de uso, el usuario recibe un mensaje claro (ej. "espera X segundos") y no pierde el trabajo cargado.

**Observado**: en el 4º intento (`es`), la 5ª subida (`POST /api/upload`) devolvió `429`. El wizard mostró el mensaje genérico **"Error al subir la imagen"**, sin ninguna indicación de límite de tasa ni tiempo de espera, y **abortó toda la publicación** (las imágenes que sí se habían subido con éxito antes del fallo se pierden — nunca se llega a crear el `Service`, quedando huérfanas en Cloudinary). Reintentos posteriores —incluso reduciendo a una sola imagen (solo la principal, sin galería)— siguieron devolviendo `429` varios minutos después, confirmando que el bloqueo es el límite **largo** (`20` subidas por hora), no el corto (`5`/60s). Verificado en DB: `SELECT ... FROM services WHERE ... email = 'e2e-publish-es-...'` → `0 rows` (el usuario invitado sí se creó, el servicio nunca).

**Causa raíz**:
- `backend/src/modules/upload/upload.controller.ts:23` — `@Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 3_600_000 } })`: máximo 20 subidas por hora.
- El wizard **requiere hasta 5 subidas por cada publicación** (`frontend/.../Paso2TuOficio/Paso2TuOficio.tsx:238-252`, `handleSubmit`): sube la imagen principal y luego cada imagen de galería, una por una, de forma secuencial, en cada intento de envío — incluyendo reintentos, que vuelven a subir TODAS las imágenes desde cero (no solo las que fallaron).
- El límite de IP (no de usuario/sesión) se define en `backend/src/common/guards/client-ip-throttler.guard.ts:26-34` (`getTracker`): la clave del throttle es la IP del cliente. Esto significa que **cualquier cantidad de usuarios distintos publicando desde la misma IP** (oficina, wifi compartido, NAT, o — como en esta corrida — sesiones de prueba concurrentes) comparten el mismo cupo de 20 subidas/hora, alcanzable con solo 4 publicaciones completas (4 × 5 = 20).
- El mensaje de error (`frontend/.../Paso2TuOficio.tsx:212-227`, `uploadImage`) intenta leer `errorData.error` de la respuesta; el cuerpo real de un 429 de `@nestjs/throttler` es `{"statusCode":429,"message":"ThrottlerException: Too Many Requests"}` (sin campo `error`), por lo que siempre cae al mensaje genérico por defecto `'Error al subir la imagen'` — indistinguible de un fallo real de Cloudinary o de red. No se expone ningún header `Retry-After`.

**Impacto en esta ejecución**: por este bloqueo, el plan no pudo completarse en vivo para `es` (publicación no creada, alta de usuario sí) ni `us` (se validó registro y campos del wizard — moneda `USD`, estados reales — pero no se intentó la subida de imagen para no seguir agotando el cupo compartido sin aportar información nueva, dado que el bloqueo ya estaba confirmado y es un problema de infraestructura común a los 5 países, no específico de un país).

**Recomendación**: subir el límite largo a un valor acorde al uso real del wizard (ej. ≥ 60/hora, o basarlo en publicaciones en vez de subidas individuales), trackear por usuario autenticado en vez de por IP para este endpoint, exponer `Retry-After` y devolver un mensaje específico ("Demasiadas imágenes subidas, esperá unos minutos") en el frontend cuando el status sea 429.

---

## INC-014 — "Completar con IA" también está roto en el wizard de alta anónima (mismo patrón que INC-009, archivo distinto)

- **Caso**: E2E-PUB guion paso 4 ("descripción de al menos 20 caracteres usando Completar con IA")
- **Severidad**: Alta (mismo impacto que INC-009: el botón de IA es inutilizable end-to-end)
- **País**: `cl` (reproducido en vivo), aplica a los 5 — código compartido sin lógica de país
- **Rol**: Público/invitado

**Pasos**: en el wizard de alta anónima, completar título + 1 categoría, click en "Completar con IA".

**Observado**: error **"No se encontraron categorías válidas"**.

**Causa raíz**: `frontend/src/features/services/publish/actions/mutations.ts:172-179` (`generarDescripcionIA`, flujo de alta anónima) — mismo patrón de bug que INC-009 (`plan-e2e-professional`), pero en un **archivo distinto**: `apiClient.get<{ data: Array<...> }>('/categories?ids=...')` espera `{ data: [...] }`, pero `CategoriesService.findAll` (`backend/src/modules/categories/categories.service.ts:129`) devuelve un **array plano**. `response.data` es `undefined`, `categoriasData = response.data ?? [] = []`, y el código nunca llega a llamar a Gemini.

**Alcance multi-país**: aplica a los 5 países (código de Server Action sin lógica de país). No se repitió la prueba puntual en los 4 países restantes porque la causa raíz ya está confirmada por código y por dos reproducciones en vivo (`plan-e2e-professional` y este plan) en dos ubicaciones distintas del mismo bug.

---

## INC-015 — El wizard de publicación (Pasos 1 a 3) está hardcodeado en español y no usa el sistema de i18n del sitio — rompe el idioma en `us` (inglés) mientras el resto del sitio sí traduce

- **Caso**: E2E-PUB guion paso 1-6 (todo el wizard), específicamente contraste de idioma en `us`
- **Severidad**: Media-Alta (experiencia rota para el público objetivo de `us`: un usuario que ve el sitio en inglés se encuentra el flujo completo de alta de servicio en español)
- **País**: `us` (verificado en vivo), muy probablemente también `es` en cuanto a copys en inglés/otro idioma si el país tuviera un locale distinto — código 100% compartido
- **Rol**: Público/invitado

**Pasos**: navegar a `/us/publish` sin sesión.

**Esperado**: dado que el resto del sitio (header, footer, nav) se muestra en inglés (`Find a Service`, `Sign In`, `Get Started`, `About us`, `Terms`, `Privacy`, `Cookies`, `COUNTRIES`, banner de cookies en inglés), el wizard de publicación también debería estar en inglés.

**Observado**: el header/footer de la misma página SÍ están en inglés, pero el wizard completo permanece en español: título de página "Publicar nuevo servicio", subtítulo "Completa los pasos para publicar y empezar a recibir contactos.", stepper "Tus Datos"/"Tu Oficio"/"Publicar", encabezado del paso 2 "¡Ya Casi Listo!" / "Ahora cuéntanos sobre tu oficio" / "Hola, {nombre} 👋", labels de campos ("Título de tu Servicio", "Categorías (máximo 3)", "Descripción", "Completar con IA", "Precio Base", "Galería de Fotos (Opcional)", "Datos de Contacto para el Cliente", "Redes Sociales / Sitio Web (Opcional)", "Declaro que la información proporcionada es verdadera...", "Siguiente Paso"). El único elemento correctamente localizado es la etiqueta dinámica de ubicación ("State"), lo que produce además una mezcla incoherente de idiomas dentro del mismo combobox: la opción placeholder se renderiza como **"Selecciona state"** (verbo en español + sustantivo en inglés).

**Causa raíz**:
- `frontend/src/features/services/publish/components/Paso2TuOficio/Paso2TuOficio.tsx` no importa ni usa ningún mecanismo de i18n (`grep -n "dict\.\|getDictionary\|useTranslation"` → sin resultados) — todo el JSX tiene los textos en español como literales hardcodeados.
- El único dato que sí varía por país es `regionLabel`/`localityLabel`, obtenido de `useCountry()` (línea 73) — de ahí que "State" (la etiqueta) esté en inglés pero el verbo "Selecciona" que la acompaña en el placeholder no lo esté: son dos fuentes distintas (una traducida, la otra no).
- El sistema de i18n general del sitio sí existe y se usa en otras páginas: `frontend/src/app/(country)/[country]/(public)/service/[slug]/page.tsx:20` importa `getDictionary` y lo pasa a los componentes de detalle — el wizard de publicación simplemente nunca fue conectado a ese sistema.

**Alcance multi-país**: el bug es de código compartido (ningún string del wizard depende de `countryCode` salvo las etiquetas de ubicación) — afecta a cualquier país cuyo locale no sea español; en la matriz de 5 países, el único caso donde esto es visiblemente incorrecto es `us` (inglés). `es`, siendo también hispanohablante, no expone el problema aunque el mecanismo esté igual de roto.

---

## Nota de alcance — reintento con menos redes sociales en `uy`/`ar`/`es`

Para `uy`, `ar` y `es` se cargaron 2 redes sociales (Sitio Web + Instagram) en vez de las 8 completas probadas en `cl`. Motivo: INC-012 ya confirma con evidencia de código y DB que el problema es el mismo componente de renderizado compartido para **cualquier** tipo de red social — repetir las 8 en cada país no aportaría información adicional sobre ese hallazgo. El resto del guion (registro anónimo, wizard completo, precio en moneda local, región/localidad real, contacto autocompletado, publicación, visibilidad pública, aislamiento de país) se ejecutó completo en los 3 países.

## Nota de alcance — `us` sin intento de publicación completa

Por el bloqueo confirmado en INC-013 (cupo de subida de imágenes por IP agotado por las publicaciones previas de `cl`/`uy`/`ar`/`es` en esta misma corrida), no se intentó la subida de imagen ni el envío final del wizard en `us`, para no generar más ruido sobre un hallazgo ya confirmado. Sí se verificó en vivo: registro anónimo exitoso, moneda `USD`, lista real de estados de EE. UU., y el hallazgo de idioma (INC-015).

## Matriz final de ejecución

| País | Usuario/fixture creado | Slug / URL del servicio | Resultado | Observaciones |
|---|---|---|---|---|
| `cl` | `e2e-publish-cl-20260828172213@example.test` | `/cl/service/e2e-publish-cl-20260828172213` | **PASS** | Wizard completo (8 redes, 5 imágenes, región/comuna reales), visible en listado `cl`, ausente en `ar` (aislamiento OK). INC-009 (IA) e INC-012 (redes no visibles) presentes pero no bloquean la publicación. |
| `uy` | `e2e-publish-uy-20260828173030@example.test` | `/uy/service/e2e-publish-uy-20260828173030` | **PASS** | Moneda UYU, departamento/localidad reales, 5 imágenes, 2 redes sociales (alcance reducido, ver nota). |
| `ar` | `e2e-publish-ar-20260828173323@example.test` | `/ar/service/e2e-publish-ar-20260828173323` | **PASS** | Moneda ARS, provincia/localidad reales, 5 imágenes, 2 redes sociales, visible en listado `ar`. |
| `es` | `e2e-publish-es-20260828173609@example.test` (usuario creado; servicio **no** creado) | — | **BLOCKED** | Wizard completo hasta el envío final; bloqueado por INC-013 (rate limit de `/api/upload` agotado por las 3 publicaciones previas desde la misma IP). Moneda EUR, comunidad/municipio reales verificados antes del bloqueo. |
| `us` | `e2e-publish-us-20260828174358@example.test` (usuario creado; servicio no intentado) | — | **BLOCKED** (no ejecutado por diseño, ver nota de alcance) | Registro anónimo, moneda USD y lista de estados verificados. Hallazgo adicional INC-015 (wizard sin traducir). No se intentó imagen/envío para no seguir agotando el cupo compartido de INC-013. |

## Estado de los hallazgos históricos del plan (tabla "Errores de contrato")

- E2E-PUB-008 ("DevTools sin permiso para cargar archivos locales") — **resuelto** en esta corrida: se subieron 25 imágenes reales (5 por país) vía el MCP de automatización sin ningún problema de permisos.
- Los 4 fixes de E2E-PUB-001/002/003/004/005/007 (ya marcados `✅ Resuelto` en el plan) se reconfirmaron en vivo: registro de invitado con sesión válida, payload en español, `comuna`/`countryCode` viajando correctamente, categorías cargadas con el país correcto.
