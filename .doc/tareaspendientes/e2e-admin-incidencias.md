---
title: Incidencias — E2E Admin
tags: [hireeo, testing, e2e, admin, incidencias]
---

# Incidencias detectadas — plan-e2e-admin.md

Referencia: [[../testingqa/plan-e2e-admin]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución 2026-08-28, cuentas `admin.{cl,ar,uy,es,us}@hireeo.app`. Recorrido completo e interactivo en `cl`; pase focalizado (scope, aislamiento cruzado, moneda) en `ar`, `uy`, `es`, `us` — el dashboard admin es 100% componente compartido (confirmado por revisión de código y por los planes anteriores), así que no se repitieron los 11 casos completos x 5 países.

**Ronda 2 (2026-08-29)** — se completó lo pendiente: se resolvió el gap de E2E-ADM-007 (la sección "Precios Premium" del Admin **sí existe** y funciona, ver INC-018 más abajo sobre por qué no se había visto), se re-confirmó por código que INC-016 sigue vigente, se ejecutó el recorrido interactivo completo (E2E-ADM-003/004/005/006/007/009/011) en `ar` como segundo país (no solo `cl`), y se completó E2E-ADM-008 con las combinaciones de país que faltaban (`uy→us`, `us→cl`, además de las ya probadas `cl→ar`/`es→us`).

> [!success] Estado de resolución (remediación 2026-08-29, [[grok-e2e-incidencias]])
> - **INC-016 — RESUELTO.** Backend: `POST /categories` ahora recibe `@CurrentUser()` y fuerza `countryCode` del Admin (ignora el body); SuperAdmin puede crear global o scoped. Verificado en vivo: Admin `cl` intentando forzar `countryCode:"ar"` termina scoped a `cl`; SuperAdmin sin código → global; con código inválido → 400. Frontend: `CategoriaForm` oculta el selector de país a Admin de país (solo SuperAdmin lo ve), padre siempre visible.
> - **INC-017 — RESUELTO.** `CategoriasTable` deshabilita editar/eliminar/toggle-activo cuando la categoría es global (`countryCode === null`) y el usuario no es SuperAdmin, con tooltip persistente ("Solo SuperAdmin puede modificar categorías globales").
> - **INC-018 — RESUELTO.** `getAdminPreciosPremium`: el parámetro de búsqueda (antes `_search`, ignorado) ahora filtra de verdad contra país/moneda/duración/precio/estado; la paginación hace `.slice()` real sobre el resultado filtrado (antes siempre devolvía todo sin paginar).

## INC-016 — Un Admin de país puede crear categorías GLOBALES que quedan visibles y usables en los 5 países, sin poder revertirlo él mismo

- **Caso**: E2E-ADM-002
- **Severidad**: Alta (escalación de scope: el único CRUD de categorías al que un Admin de país tiene acceso solo puede crear registros que rompen el aislamiento entre países, y ni siquiera el propio Admin puede deshacerlo después)
- **País**: `cl` (probado con `admin.cl`); confirmado por código que aplica a los 5 — verificado en vivo también contra `ar` (ver "Observado")
- **Rol**: Admin

**Pasos**:
1. Login como `admin.cl@hireeo.app`, ir a `/cl/admin/categories`.
2. Click "Nueva Categoría", completar solo "Nombre (Español)" = `E2E ADM Test Categoria CL` (el formulario no ofrece selector de país ni de categoría padre), click "Crear".
3. Verificar en DB: `SELECT "countryCode" FROM service_categories WHERE name = 'E2E ADM Test Categoria CL'`.
4. Verificar cross-país: `curl http://localhost:4445/api/v1/categories?countryCode=ar` y buscar el nombre creado.
5. Login como `admin.ar@hireeo.app`, abrir `/ar/admin/categories`: el contador pasa de 77 a 78.
6. Intentar editar/desactivar/eliminar la categoría recién creada desde `admin.cl` (el mismo Admin que la creó).

**Esperado**: según E2E-ADM-002, "CRUD scoped al país; no modifica categorías de otro país" — un Admin de Chile no debería poder crear contenido de catálogo que aparezca o afecte a los otros 4 países.

**Observado**: la categoría se crea con `countryCode = NULL` (global) y `parentId = NULL` (categoría raíz, "Nivel superior") sin excepción — el formulario de creación no tiene ningún campo para especificar país ni categoría padre. Confirmado que aparece de inmediato en `GET /categories?countryCode=ar` (endpoint público que alimenta selectores de publicación de servicio) y en `/ar/admin/categories` (77 → 78). Al intentar editarla/eliminarla/desactivarla desde el mismo `admin.cl` que la creó, la acción es rechazada silenciosamente por el backend (ver INC-017) — es decir, el único Admin que "sabe" que esa categoría es un error de scope no tiene forma de corregirlo; solo un SuperAdmin puede.

**Causa raíz** (`backend/src/modules/categories/categories.controller.ts:62-69` y `categories.service.ts:143-159`):
- El endpoint `POST /categories` (`create()`) no recibe `@CurrentUser()` en absoluto — no hay ningún contexto de requester disponible para aplicar scope.
- `CreateCategoryDto` (`dto/create-category.dto.ts`) no tiene campo `countryCode`, y `CategoriesService.create()` nunca setea `countryCode` en el `prisma.serviceCategory.create()` — el campo queda en su default de schema (`null`), es decir, SIEMPRE global, sin importar quién llame al endpoint.
- Por contraste, `update()` y `delete()` sí llaman `assertAdminCanManageCategory()`, que bloquea correctamente a un Admin no-SuperAdmin de tocar `countryCode: null` (comentario `AUD-18` en el código, ya endurecido en una auditoría previa) — el gap quedó únicamente en `create`, que la auditoría AUD-18 no cubrió.
- El formulario del frontend (`frontend/src/features/categories/components/admin/CategoriaForm/CategoriaForm.tsx`, modal "Crear Nueva Categoría") tampoco ofrece selector de país ni de categoría padre, así que ni siquiera hay forma de que el Admin intente crear una subcategoría de su propio país — toda creación desde el dashboard Admin es, hoy, necesariamente global y raíz.

**Impacto real**: cualquier Admin de cualquiera de los 5 países puede inyectar categorías en la taxonomía global que ven y usan TODOS los países al publicar servicios, sin que un SuperAdmin lo apruebe primero. Con 77/77 categorías actuales siendo globales (`countryCode` nulo en el 100% de las filas), esta es además la única vía de creación de categorías que un Admin de país tiene disponible — y produce el resultado opuesto al que el propio código de `update`/`delete` protege.

**Alcance multi-país**: código 100% compartido — no depende del país del Admin que crea la categoría. No se repitió la creación en `uy`/`es`/`us` para no seguir ensuciando la taxonomía global; el hallazgo en `cl` + la verificación cruzada contra `ar` (login real + conteo 77→78) son evidencia suficiente.

**Limpieza**: la categoría de fixture (`e2e-adm-test-categoria-cl`, id `f8b1cf8a-5a40-489c-97f8-0599dc8656f0`) fue eliminada directamente en DB al cerrar esta corrida (no había servicios asociados).

---

## INC-017 (menor, ligado a INC-016) — Editar/desactivar/eliminar una categoría global falla en silencio, sin feedback visible al Admin

- **Caso**: E2E-ADM-002
- **Severidad**: Baja (no es un problema de seguridad — el backend protege correctamente; es un problema de UX/confianza en el dato)
- **País**: `cl` (componente compartido, aplica a los 5)
- **Rol**: Admin

**Pasos**:
1. Como `admin.cl`, en `/cl/admin/categories`, click en el toggle "Activa" de cualquier categoría de nivel superior (todas son globales, ver INC-016).
2. Observar el resultado en la fila y en pantalla.

**Esperado**: si la acción está prohibida para este rol/scope, la UI debería comunicarlo con claridad (deshabilitar el control, o al menos un mensaje de error persistente y visible).

**Observado**: el botón permanece habilitado para las 77 filas (ninguna es editable/eliminable por un Admin de país, ya que el 100% son globales). Al hacer click, el estado de la fila no cambia (confirmado en DB: `active` no se modifica) y no quedó ningún toast visible en el snapshot tomado inmediatamente después — el componente sí llama a `notify.error(...)` en el código (`CategoriasTable.tsx:84-85`) cuando `result.error` viene seteado, por lo que el toast probablemente apareció y se autodescartó antes de la siguiente captura, pero no hay ninguna marca persistente en la fila (badge, tooltip, ícono deshabilitado) que le indique al Admin de antemano que esa acción nunca va a funcionar para esa fila.

**Causa raíz**: `frontend/src/features/categories/components/admin/CategoriasTable/CategoriasTable.tsx` no lee el campo `countryCode` de la categoría para deshabilitar condicionalmente los botones "Editar"/"Eliminar"/toggle cuando la fila es global y el usuario actual no es SuperAdmin — deja que el usuario intente la acción y descubra el rechazo solo vía un toast efímero.

**Alcance multi-país**: mismo componente compartido, aplica a los 5 países.

---

## INC-018 — El buscador de "Precios Premium" (Admin) no filtra nunca: el parámetro de búsqueda se recibe pero se ignora por completo

- **Caso**: E2E-ADM-007
- **Severidad**: Baja (feature de conveniencia rota, no afecta seguridad ni scope — con solo 4 registros por país el impacto práctico es mínimo, pero crecería si se agregan más duraciones/monedas)
- **País**: `cl` (código compartido — aplica a los 5)
- **Rol**: Admin (`admin.cl@hireeo.app`)

**Nota de alcance previa**: la ronda 1 documentó "el dashboard Admin no tiene ninguna sección de precios — parece reservado a `/config` (SuperAdmin)". Esto era **incorrecto**: la ruta `/{country}/admin/premium-prices` existe, es funcional, y está scoped correctamente por país (verificado: `admin.cl` ve exactamente las 4 filas de Chile — CLP $9.990/$27.990/$54.990/$99.990 — de un total de 20 filas en DB, 4 por cada uno de los 5 países). Lo que ocurrió es que el link del sidebar (`AdminSidebar.tsx:64-71`, sección `buildMonetizationItems`) solo se agrega **si `paymentsEnabled === true`** para el país — como los 5 países tienen `paymentsEnabled=false` (decisión de producto ya documentada), el link nunca aparece en el menú de ningún Admin, aunque la ruta sigue siendo 100% accesible por URL directa, incluyendo crear/editar/eliminar precios reales. Esto no es un bug de seguridad (el acceso cross-país a esta ruta sí está correctamente bloqueado, confirmado con `admin.cl` → `/ar/admin/premium-prices` → `unauthorized`), pero es una superficie "oculta pero editable" que ningún Admin descubre por la UI normal.

**Pasos**:
1. Login como `admin.cl@hireeo.app`, navegar directamente a `/cl/admin/premium-prices` (no hay link en el sidebar).
2. Escribir cualquier texto en "Buscar precio..." — primero `6` (que debería matchear "6 meses de servicio premium"), luego `zzznomatch99` (que no debería matchear nada).

**Esperado**: E2E-ADM-007 — "consultar filtros, paginación y métricas."

**Observado**: en ambos casos, la tabla sigue mostrando las 4 filas completas sin ningún filtrado ("Precios Premium(4)" no cambia), aunque la URL sí se actualiza correctamente (`?page=1&q=zzznomatch99`) — el input y el routing funcionan, pero el resultado nunca se filtra. Por contraste, el mismo patrón de búsqueda en "Usuarios" (`/cl/admin/users?q=zzznomatch99`) sí filtra correctamente ("No se encontraron resultados", 0/6) — el bug es específico de esta sección, no del componente de tabla genérico.

**Causa raíz** (`frontend/src/features/payments/actions/queries.ts:185-186`, `getAdminPreciosPremium`):
```ts
export const getAdminPreciosPremium = cache(
    async (page = 1, limit = 10, _search?: string, countryCode?: string) => {
```
El parámetro se recibe con prefijo `_` (convención de "intencionalmente sin usar") y, en efecto, nunca se usa dentro del cuerpo de la función: no se agrega a la query string del `GET /prices` (línea 189, solo incluye `countryCode`) ni se aplica como `.filter()` sobre `data` antes de devolver el resultado. Además, la paginación tampoco es real: se traen **todos** los precios del país en una sola llamada y se calcula `totalPages = Math.ceil(data.length / limit)`, pero nunca se hace `slice` del array por `page` — con solo 4 registros por país esto no se nota (todo cabe en una página), pero quedaría roto en cuanto un país tuviera más de `limit` precios.

**Impacto**: el Admin no puede buscar un precio específico por duración/descripción — el campo de búsqueda es puramente decorativo. Bajo impacto hoy (4 filas por país, todas visibles de un vistazo), pero la paginación fake se rompería con más registros.

---

## Estado de ejecución por caso

| Caso | `cl` | `ar` | `uy` | `es` | `us` | Observación |
|---|---|---|---|---|---|---|
| E2E-ADM-001 (Dashboard/KPIs) | PASS | PASS | PASS | PASS | PASS | KPIs verificados contra DB en los 5 países (servicios activos y usuarios coinciden exactamente) |
| E2E-ADM-002 (Categorías) | FAIL | FAIL (confirmado cruzado) | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | INC-016 + INC-017; código compartido, no hace falta repetir la creación en más países. **Re-confirmado por código en ronda 2**: `categories.controller.ts` — `create()` sigue sin `@CurrentUser()` ni scope de país, INC-016 sigue vigente |
| E2E-ADM-003 (Usuarios) | PASS | PASS | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | Listado scoped correcto (6/6 usuarios `cl`; 6/6 en `ar`, todos AR); modal de edición no expone rol SuperAdmin. Buscador (`?q=zzznomatch99`) sí filtra correctamente en `ar` (0/6, "No se encontraron resultados") — descarta que INC-018 sea un problema genérico del componente de tabla |
| E2E-ADM-004 (Servicios) | PASS | PASS | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | "Destacar" probado y revertido sobre fixture propio en `cl` y en `ar` (3/3 servicios AR, scope correcto), persistencia verificada en ambos |
| E2E-ADM-005 (Reseñas) | PASS | PASS (vacío) | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | Reseña `PENDING` existente (fixture del plan Client) aprobada → `ACTIVE` en `cl`. `ar` no tiene reseñas aún (0/0, sin error) |
| E2E-ADM-006 (Pagos) | PASS (vacío) | PASS (vacío) | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | Sin transacciones en `cl` ni `ar` — coherente con `paymentsEnabled=false` en los 5 países (decisión de producto ya documentada) |
| E2E-ADM-007 (Precios/Interacciones) | **FAIL parcial — INC-018** | PASS (parcial) | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | **Gap de ronda 1 resuelto**: la sección "Precios Premium" (`/{country}/admin/premium-prices`) sí existe y está scoped correctamente por país (4/4 en `cl`, en CLP) — solo no aparece en el sidebar porque el link es condicional a `paymentsEnabled=true` (falso en los 5 países). El buscador no filtra (INC-018). Interacciones: vacío en `cl` y `ar`, sin errores |
| E2E-ADM-008 (URL a otro país) | PASS (destino) | PASS (destino) | PASS (origen) | PASS (origen) | PASS (origen + destino) | Combinaciones probadas: `cl→ar` (MercadoPago), `es→us` (Stripe), `uy→us` (ronda 2), `us→cl` (ronda 2) y `admin.cl→/ar/admin/premium-prices` (ronda 2, sección nueva). Las 5 cuentas Admin quedaron cubiertas como origen o destino de al menos un intento cruzado; todas redirigen a `/{país}/unauthorized` sin llamada a datos de admin |
| E2E-ADM-009 (`/config/*`) | PASS | PASS | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | `admin.cl` y `admin.ar` navegando a `/config` → redirige a `/{país}/unauthorized` en ambos casos |
| E2E-ADM-010 (IDs de otro país) | PASS (por código) | — | — | — | — | No se pudo probar por fetch directo desde el browser (el backend exige `x-api-key` global, no disponible del lado cliente — correcto por diseño). Verificado por código: `services.service.ts` (`toggleActive`, `toggleFeatured`, `delete`) y `users.service.ts` (`update`) llaman `assertCountryScope`/`assertAdminCanManageTarget` en todas las mutaciones cross-entidad revisadas |
| E2E-ADM-011 (Logout + acceso directo) | PASS | PASS | NOT-EXECUTED | NOT-EXECUTED | NOT-EXECUTED | Tras "Cerrar sesión" en `cl` y en `ar`, `/{país}/admin` redirige a `/login` en ambos |

**Nota sobre alcance reducido**: dado que el dashboard Admin es un único conjunto de componentes/endpoints compartido entre los 5 países (sin lógica condicional por país salvo el filtro de datos), y que `ar` (recorrido interactivo completo en ronda 2) confirmó el mismo patrón de scope correcto que `cl` en todos los puntos verificados (KPIs, usuarios, servicios, reseñas, pagos, precios premium, `/config`, logout), no se repitieron mecánicamente los casos restantes en `uy`/`es`/`us` más allá del aislamiento cruzado (E2E-ADM-008, ya cubierto en las 5 cuentas). `uy` y `us` solo se validaron por login + KPIs scoped + aislamiento cruzado, sin recorrido completo de las demás secciones — suficiente dado que ningún hallazgo de `cl`/`ar` tiene rama de código condicional por país.
