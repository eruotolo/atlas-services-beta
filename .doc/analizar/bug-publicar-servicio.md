# Bug: el flujo de "Publicar Servicio" está roto (Paso 2 del wizard)

> Documento generado el 2026-07-28 tras auditar el flujo completo de `/publish` a nivel de usuario.
> Objetivo: dejar diagnosticado el problema para resolverlo en una sesión futura. **No se aplicó ningún fix todavía.**
> Referencia cruzada: `.doc/analizar/deuda-tecnica.md` (DT-29, DT-30, DT-31, DT-32).

---

## Resumen ejecutivo

El wizard de publicación (`/{country}/publish`) permite completar los 6 pasos sin error visible en el navegador, pero el `POST /services` que dispara el Paso 2 **falla siempre** para usuarios sin sesión de NextAuth activa, y probablemente también para usuarios logueados, por 3 causas independientes:

1. El campo de ubicación nunca llega al backend con el nombre que la Server Action espera → dispara el error genérico "Todos los campos son requeridos".
2. El payload que arma la Server Action usa nombres de campo en **inglés**, pero el DTO real del backend espera **español** → con `forbidNonWhitelisted: true` el backend rechaza el request con 400.
3. El registro de "invitado" (Paso 1, sin OAuth) no crea sesión de NextAuth, por lo que no hay `backendToken` disponible → el `POST /services` (protegido con `JwtAuthGuard`) falla con 401.

Además, un problema menor no bloqueante: categorías y precios premium ignoran el país activo del usuario.

---

## Flujo documentado (para contexto — ver detalle completo en la conversación previa)

`/{country}/publish` → wizard de 6 pasos:

1. **Datos de usuario** (solo si no hay sesión) — OAuth o registro email/password como invitado
2. **Tu Oficio** — formulario del servicio (título, categorías, descripción, imagen, precio, ubicación, galería, contacto, redes)
3. **Nivel de servicio** — Básico (gratis, inmediato) o Premium (sigue a pago)
4. **Duración** (solo Premium) — planes 1/3/6/12 meses
5. **Pago** — Mercado Pago Payment Brick
6. **Éxito** — confirmación y redirección

La publicación **no tiene moderación de admin**: el servicio queda `active: true` desde que se crea en el Paso 2. El pago solo hace upgrade a premium, no condiciona la publicación.

---

## Hallazgo 1 — Campo `comuna` nunca se setea (bloqueante)

- **Frontend**: `frontend/src/features/services/publish/components/Paso2TuOficio/Paso2TuOficio.tsx:275-276` — el formulario setea `formData.set('regionCode', ...)` y `formData.set('localitySlug', ...)`.
- **Server Action**: `frontend/src/features/services/publish/actions/mutations.ts:72` (aprox.) — lee `formData.get('comuna')`.
- **Efecto**: `comuna` es siempre `null`. La validación manual de la línea ~80 de `mutations.ts` exige `comuna` como uno de los campos requeridos → dispara el error genérico **"Todos los campos son requeridos"**, incluso si el usuario completó la ubicación correctamente.

## Hallazgo 2 — Mismatch de nombres de campo con el DTO del backend (bloqueante)

- **Frontend** (`mutations.ts`, función `publicarServicioPublico`): arma el payload con claves en inglés: `title`, `description`, `price`, `commune`, `categoryIds`, `socialNetworks: [{type, url}]`.
- **Backend**: `backend/src/modules/services/dto/create-service.dto.ts` espera claves en español: `titulo`, `descripcion`, `precio`, `comuna`, `categoriaIds`, `redesSociales`.
- **Efecto**: `ValidationPipe` global tiene `whitelist: true, forbidNonWhitelisted: true` (`backend/src/main.ts:51-52`) → cualquier campo no declarado en el DTO hace que Nest rechace el request completo con `400 Bad Request`.
- **Nota**: `deuda-tecnica.md` marca `DT-11` (validación estricta de DTOs) como revisado y "OK, DTOs y backend alineados (2026-06-21)". Esa revisión no cubrió este endpoint específico — es una regresión o un caso no contemplado en esa pasada.

## Hallazgo 3 — Usuario invitado sin token de sesión (bloqueante)

- **Frontend**: `verificarOCrearUsuario` (`mutations.ts:12`) llama a `POST /auth/register` en el backend con `isGuest: true`, pero **no** llama a `signIn('credentials', ...)` de NextAuth después.
- **Efecto**: tras el registro de invitado, `session?.user?.backendToken` es `undefined`. El endpoint `POST /services` requiere `JwtAuthGuard` (bearer token) → falla con `401 Unauthorized` para cualquier usuario que se registró en el Paso 1 sin usar OAuth.

## Hallazgo 4 — Categorías y precios premium ignoran el país activo (no bloqueante, funcional pero incorrecto)

- `getCategorias()` en `Paso2TuOficio.tsx:187` y `obtenerPreciosPremiumActivos()` (`frontend/src/features/payments/actions/queries.ts:155`) se llaman **sin pasar `countryCode`**.
- **Efecto**: ambos caen al default `'cl'` sin importar si el usuario está publicando desde `/ar`, `/uy`, `/es` o `/us`. Un usuario en Argentina vería categorías/precios de Chile.

---

## Impacto

Con los Hallazgos 1 y 2 activos simultáneamente, **ningún usuario puede publicar un servicio** hoy en día a través de este wizard, sin importar si tiene sesión o no — el POST falla antes de llegar al backend (Hallazgo 1, validación client-side manual) o es rechazado por el backend (Hallazgo 2, si se corrigiera el 1 primero). El Hallazgo 3 bloquea específicamente a los usuarios que se registran como invitados sin OAuth.

---

## Líneas de investigación para la solución (no implementado)

No se propone código todavía — esto queda para la sesión de fix. Puntos a decidir con Edgardo antes de tocar código:

1. **Nombres de campo**: ¿se homologa `publicarServicioPublico` para mandar las claves en español que el DTO ya usa, o se traduce el DTO del backend a inglés? Cambiar el backend tiene mayor blast radius (afecta otros consumidores de `POST /services`). Lo más quirúrgico es corregir el payload en `mutations.ts`.
2. **Campo ubicación**: decidir si el backend espera `comuna` como slug de localidad o como algún otro identificador — revisar `create-service.dto.ts` y el modelo `Service` en `schema.prisma` para saber qué dato exacto corresponde (¿nombre de la comuna, slug, o id de `GeoLocality`?).
3. **Sesión de invitado**: decidir si tras `verificarOCrearUsuario` conviene disparar `signIn('credentials', ...)` automáticamente, o si el `usuarioId` + password temporal deben usarse para autenticar antes de continuar al Paso 2. Revisar si el backend devuelve el JWT directamente en la respuesta de `/auth/register` para evitar un segundo roundtrip de login.
4. **`countryCode` en categorías/precios**: pasar el `countryCode` disponible en el wizard (viene de la ruta `[country]`) a `getCategorias()` y `obtenerPreciosPremiumActivos()`.

## Archivos involucrados

- `frontend/src/features/services/publish/components/Paso2TuOficio/Paso2TuOficio.tsx` (líneas 187, 275-276)
- `frontend/src/features/services/publish/actions/mutations.ts` (líneas 12, 54, ~72-80)
- `frontend/src/features/payments/actions/queries.ts:155`
- `backend/src/modules/services/dto/create-service.dto.ts`
- `backend/src/modules/services/services.controller.ts:34` (endpoint `POST /services`)
- `backend/src/main.ts:51-52` (`ValidationPipe` global)
- `backend/prisma/schema.prisma` (modelo `Service`, modelo `GeoLocality`)

---

*Generado por auditoría de flujo de usuario, 2026-07-28.*
