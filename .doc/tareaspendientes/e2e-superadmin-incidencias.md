---
title: Incidencias — E2E SuperAdmin
tags: [hireeo, testing, e2e, superadmin, incidencias]
---

# Incidencias detectadas — plan-e2e-superadmin.md

Referencia: [[../testingqa/plan-e2e-superadmin]]. Entorno: frontend `http://localhost:3334`, backend `http://localhost:4445/api/v1`, DB local (`docker-database`, puerto 5435). Ejecución 2026-08-29, cuenta `superadmin.test@hireeo.app` (fixture dedicada, `countryId=NULL`, ver [[../testingqa/README]]) — nunca se usaron ni modificaron las 3 cuentas SuperAdmin reales preexistentes (`edgardoruotolo@gmail.com`, `luisnuy@gmail.com`, `nluis@outlook.com`), visibles en el listado pero intocadas.

**Fixtures usados y limpiados al cierre**: país `zz` ("E2E Test Country ZZ Editado", creado/editado/activado/desactivado para probar E2E-SUP-002, eliminado de DB al final — no existe endpoint de eliminación de países en la UI), usuario `e2e-supadmin-test-admin-cl@example.test` (creado con rol Admin/Chile para probar E2E-SUP-004, ascendido a SuperAdmin, eliminado desde la UI), precio premium de 1 mes para `zz` (creado para probar E2E-SUP-006, eliminado desde la UI). Verificado al cierre: `countries` (5 filas, solo los reales), `users` (36, igual que al inicio), `premium_prices` (20, igual que al inicio).

> [!success] Estado de resolución (remediación 2026-08-29, [[grok-e2e-incidencias]])
> - **INC-016 — RESUELTO** (ver detalle en [[e2e-admin-incidencias]]).
> - **INC-018 — RESUELTO** (ver detalle en [[e2e-admin-incidencias]]).
> - **INC-019 — MITIGADO (Gate `G-COUNTRY`, no modo completo).** Inventario formal de 17 puntos hardcodeados (`.doc/testingqa/informe-inventario-paises-t7.1.md`) supera el corte de 15 del plan y toca lógica de negocio real (pasarela de pago, registry legal) — no se implementa fuente única de países dinámicos como parte de esta remediación. Sí se aplicó: UI honesta en `/config/countries` (el toggle "Activo" ahora aclara que no implica mercado operativo) y `crearUsuario` propaga el error real del backend en vez de "el email puede estar en uso" fijo. Modo completo queda como plan propio futuro.
> - **INC-020 — RESUELTO.** Backend: asignar el rol SuperAdmin con `countryCode` en el payload ahora devuelve 400 explícito. Frontend: el form de asignación de roles deja de enviar `countryCode` al elegir SuperAdmin.
> - **INC-021 — Verificado sin staleness real.** El fetch de precios premium ya usa `revalidate: 0` + `revalidatePath` + reload tras mutación; no se reprodujo el conteo desactualizado.
> - **INC-022 — RESUELTO.** `getDashboardStats` ahora pasa `countryCode` a `getAdminUsers`/`getAdminServices`/`getInteraccionesMetricas` — verificado en vivo: `/ar/admin` y `/cl/admin` muestran conteos distintos y acotados a cada país, no los globales.

## INC-019 — El módulo "Países" de SuperAdmin es solo un editor de metadatos: crear un país nuevo no lo hace operativo en ningún flujo real, y el error al intentar asignarle un Admin es totalmente engañoso

- **Caso**: E2E-SUP-002
- **Severidad**: Alta (la única superficie de UI para "agregar un país" a la plataforma no cumple su función; cualquier SuperAdmin que la use para lanzar un país nuevo — ej. Paraguay, ya mencionado como pendiente — creerá que funcionó y descubrirá el problema solo al intentar que alguien lo use)
- **País**: global (afecta la arquitectura de los 5 países existentes también, no solo países nuevos)
- **Rol**: SuperAdmin

**Pasos**:
1. Login como SuperAdmin, ir a `/config/countries` → "Nuevo País". Completar código `zz`, nombre, moneda, locale, timezone, gateway, labels región/localidad; dejar "Pagos habilitados" en `false`. Crear.
2. Verificar en DB: el país se crea correctamente con todos los campos (`SELECT * FROM countries WHERE code='zz'` — persistencia perfecta).
3. Intentar abrir `/zz` (ficha pública) con el país recién creado en estado `active=true`.
4. Ir a "Usuarios Admin" → "Nuevo Usuario", rol Admin, país "E2E Test Country ZZ Editado" (aparece en el selector, viene de la tabla `countries`). Crear.

**Esperado**: E2E-SUP-002 — "Configuración persiste y afecta sólo los flujos previstos." Un país creado y activado por el SuperAdmin debería, como mínimo, ser navegable públicamente y permitir asignarle un Admin.

**Observado**:
- `/zz` devuelve **404 siempre**, tanto con el país `active=false` como `active=true` — la tabla `countries` es irrelevante para esta decisión.
- Crear el usuario Admin con país `zz` falla con el toast **"Error al crear usuario. El email puede estar en uso."** — mensaje falso: el email no existía (`SELECT * FROM users WHERE email=...` → 0 filas antes del intento). Repetido el mismo formulario con país "Chile" (uno de los 5 reales), el usuario se creó sin problema con el mismo email base — confirma que la causa es el país, no el email.

**Causa raíz**: la lista de "países soportados" está **hardcodeada de forma independiente en al menos 9 lugares del código**, ninguno de los cuales consulta la tabla `countries`:
- Frontend: `src/proxy.ts:8`, `src/app/page.tsx:4`, `src/app/(country)/[country]/layout.tsx:9` (este último hace `if (!VALID_COUNTRIES.includes(country)) notFound()` **antes** de siquiera intentar `getCountryConfig(country)` — de ahí el 404 de `/zz`), `src/app/api/webhooks/mercadopago/route.ts:8`, `src/app/api/webhooks/stripe/route.ts:7`.
- Backend: `backend/src/modules/auth/dto/register.dto.ts:11,35` — `export const SUPPORTED_COUNTRIES = ['cl','ar','uy','es','us'] as const` con `@IsIn(SUPPORTED_COUNTRIES)` en el campo `country` de `RegisterDto`. class-validator **rechaza la request con 400** si el código no está en esa lista — antes de que el controller/service lleguen siquiera a intentar `prisma.user.create()`. También usado 3 veces más en `auth.service.ts` (líneas 367, 412, 490, con fallback silencioso a `DEFAULT_COUNTRY` en flujos de Google OAuth).
- El error real (400 por `@IsIn`) se pierde en el catch genérico de `frontend/src/features/users/actions/mutations.ts:64-66` (`crearUsuario`), que siempre muestra "El email puede estar en uso" sin importar la causa real — mismo patrón de mensajes de error genéricos que oculta el problema real, ya documentado en otros planes.

**Impacto**: el módulo "Países" de `/config` da la impresión de control total (crear, editar, activar/desactivar, asignar Admin) pero en la práctica **solo permite editar los metadatos** (moneda, gateway, labels, `paymentsEnabled`) de los 5 países que ya existen en el código — nunca agregar un sexto país operativo. Hacerlo requiere que un desarrollador modifique y redeploye al menos 9 archivos. Ningún mensaje en la UI advierte esta limitación; el SuperAdmin descubre el problema recién al intentar usar el país recién "creado".

**Alcance**: verificado en el entorno local; no depende de país específico — aplica a cualquier intento de agregar un sexto país.

---

## INC-020 — Cambiar el rol de un usuario de Admin a SuperAdmin no limpia el país asignado: queda un `UserRole` con `role=SuperAdmin` y `countryId` no nulo

- **Caso**: E2E-SUP-004
- **Severidad**: Media (no se observó impacto funcional en el caso probado — el usuario igual accedió globalmente a `/config` — pero es una invariante de datos rota que otras partes del sistema podrían asumir como imposible)
- **País**: global (rol/país es un concepto cross-país)
- **Rol**: SuperAdmin

**Pasos**:
1. Como SuperAdmin, crear un usuario fixture con rol Admin y país Chile (`e2e-supadmin-test-admin-cl@example.test`).
2. Editar ese mismo usuario, cambiar el Rol de "Admin" a "SuperAdmin" (el selector de país desaparece correctamente de la UI al cambiar a SuperAdmin). Guardar.
3. Verificar en DB: `SELECT r.name, c.code FROM user_roles ur JOIN roles r ... JOIN countries c ...`.

**Esperado**: E2E-SUP-004 — "Roles y redirección/scope resultantes son exactos; no dejar privilegios residuales."

**Observado**: la tabla `ACCIONES` del listado siguió mostrando `PAÍS: CL · Chile` para el usuario incluso después de guardarlo como SuperAdmin. Confirmado en DB: el único `UserRole` del usuario tiene `role=SuperAdmin` pero `countryId` apunta a Chile (debería ser `NULL`, como las otras 3 cuentas SuperAdmin reales que sí muestran `PAÍS: —`). Al loguear con esa cuenta, el acceso a `/config` funcionó con normalidad (KPIs globales correctos) — el bypass de scope para SuperAdmin no parece leer este campo, pero el dato queda inconsistente.

**Causa raíz**: no confirmada a nivel de código en esta ronda (no se ubicó el endpoint `PUT /users/:id/roles` en el tiempo disponible); el síntoma es consistente con un `update` que solo cambia el `roleId` de la fila existente sin resetear `countryId` a `NULL` cuando el nuevo rol es SuperAdmin.

**Impacto**: cualquier promoción de Admin→SuperAdmin (o degradación posterior) deja un registro con una combinación de datos que nunca debería ocurrir por el flujo normal — riesgo de comportamiento sutil e impredecible en cualquier código futuro que asuma "SuperAdmin implica `countryId IS NULL`".

---

## INC-021 — Tras crear un precio premium para un país nuevo, la vista agrupada de "Precios Premium" muestra momentáneamente 2 países como "no configurados" en las duraciones no tocadas, hasta un refresh manual

- **Caso**: E2E-SUP-006
- **Severidad**: Media (alarmante para el usuario — parece pérdida de datos — pero no lo es; se resuelve solo con un reload)
- **País**: global
- **Rol**: SuperAdmin

**Pasos**:
1. En `/config/premium-prices`, expandir "1 mes" → "Agregar país para 1 mes" → seleccionar un país recién creado (`zz`), precio 999, crear.
2. Sin recargar la página, observar los contadores de "2 meses", "6 meses", "12 meses" (duraciones no tocadas por esta mutación).

**Esperado**: E2E-SUP-006 — "Precio de servidor se muestra sólo donde corresponde."

**Observado**: inmediatamente tras crear el precio, "1 mes" pasó de "5 de 6" a "**4** de 6 países configurados" (mostrando solo 🇦🇷🇨🇱🇿🇿🇪🇸, sin 🇺🇸 ni 🇺🇾), y "3/6/12 meses" (que no se tocaron) pasaron de "5 de 6" a "**3** de 6 países configurados" (🇦🇷🇨🇱🇪🇸, sin 🇺🇸 ni 🇺🇾). Verificado en DB inmediatamente después: los 20 registros originales seguían intactos + el nuevo de `zz` = 21 filas correctas, ningún dato perdido. Tras un `reload` manual de la página, la vista mostró los conteos correctos ("6 de 6" para 1 mes, "5 de 6" para el resto).

**Causa raíz**: no confirmada a nivel de código (no se ubicó el componente de agrupación en el tiempo disponible); consistente con un problema de revalidación de caché de Next.js tras la Server Action de creación — el `revalidatePath`/`revalidateTag` no fuerza un re-fetch completo de los 4 grupos de duración, dejando 3 de ellos con datos stale de una versión anterior en memoria/caché del cliente.

**Impacto**: un SuperAdmin que cree un precio y mire inmediatamente el resto de duraciones puede creer erróneamente que perdió la configuración de otros países, sin haber perdido nada — genera desconfianza en el panel sin causa real.

---

## INC-022 — El "Resumen" del dashboard Admin de país muestra KPIs globales en vez de scoped al país de la URL cuando accede un SuperAdmin (bypass de rol)

- **Caso**: E2E-SUP-008
- **Severidad**: Alta (el criterio explícito del plan — "cada vista muestra sólo el país URL/contexto" — se viola en la primera pantalla que ve cualquier SuperAdmin al inspeccionar un país específico)
- **País**: `ar` (probado); código compartido sin lógica de país — aplica a los 5
- **Rol**: SuperAdmin (bypass)

**Pasos**:
1. Login como SuperAdmin. Navegar directamente a `/ar/admin` (dashboard nacional de Argentina, bypass de rol — el SuperAdmin no tiene rol Admin de Argentina, solo SuperAdmin global).
2. Comparar los KPIs de "Resumen" ("Servicios publicados", "Usuarios registrados") contra los que ve `admin.ar@hireeo.app` (Admin real de Argentina) en la misma URL.

**Esperado**: E2E-SUP-008 — "Bypass de rol permite acceso, pero cada vista muestra sólo el país URL/contexto."

**Observado**: el Resumen de `/ar/admin` mostró **"SERVICIOS PUBLICADOS: 13"** y **"USUARIOS REGISTRADOS: 36"** — los totales **globales** de toda la plataforma (idénticos a los KPIs de `/config`), no los de Argentina (que son 3 servicios y 6 usuarios, confirmado tanto en DB como en la sesión real de `admin.ar` de la ronda anterior). Las **subsecciones** del mismo dashboard (`/ar/admin/services` → "Servicios Publicados(3)", todos AR) sí filtran correctamente — el bug es específico de la página de Resumen.

**Causa raíz** (`frontend/src/app/(country)/[country]/(admin)/admin/page.tsx:26-32`, función `getDashboardStats`):
```ts
async function getDashboardStats(countryCode: string): Promise<DashboardStats> {
    const [usersData, servicesData, metricas] = await Promise.all([
        getAdminUsers(1, 1),          // ← countryCode nunca se pasa
        getAdminServices(1, 1),       // ← countryCode nunca se pasa
        getInteraccionesMetricas(),
    ]);
```
`getDashboardStats` recibe `countryCode` (el país de la URL, `params.country`) pero **solo lo usa para `formatPrice(0, countryCode)`** — nunca se lo pasa a `getAdminUsers`/`getAdminServices`, que sí soportan un parámetro de país explícito (usado correctamente en otras páginas del mismo dashboard, ej. `admin/users/page.tsx:22`: `getUsers(page, 9, search, undefined, country)`). Sin ese parámetro, ambas queries dependen del país de la **sesión** del usuario autenticado para hacer su propio scope interno — que para un Admin normal es su país asignado (funciona bien), pero para un SuperAdmin es `NULL` (sin país), lo que el filtro interpreta como "sin restricción" y devuelve los totales de los 5 países.

**Impacto**: cualquier SuperAdmin que use el bypass de rol para inspeccionar rápidamente el estado de un país específico ve, en la primera pantalla del dashboard, cifras que en realidad son globales — puede llevar a conclusiones erróneas sobre el volumen real de actividad de ese país sin que nada en la UI lo advierta (no hay ninguna marca de "estos datos son globales").

---

## Nota (ya documentado en el plan Admin) — El buscador de "Países" en `/config/countries` tampoco filtra, mismo patrón que INC-018

- **Caso**: E2E-SUP-002
- Confirmado el mismo defecto ya documentado como [[e2e-admin-incidencias#INC-018]] (buscador de "Precios Premium"): `getAdminCountries()` (`frontend/src/features/configuration/countries/actions/queries.ts:8`) no recibe ningún parámetro de búsqueda, y `ConfigPaisesPage` (`src/app/(config)/config/countries/page.tsx`) tampoco lee `searchParams` en absoluto. Con `?q=zzznomatch99` la tabla sigue mostrando los 5/5 países sin filtrar. No se abre como incidencia nueva — es el mismo patrón, ampliado a una tercera sección.

---

## Hallazgos positivos (no son bugs, criterios explícitos del plan verificados)

- **E2E-SUP-007 (credenciales)**: el modal de edición de integraciones (probado con "Gemini AI", activo vía variable de entorno) **nunca expone el valor real de la API key** — el campo llega vacío con el texto "Deja vacío para conservar el valor actual." Ninguna clave se enmascara con asteriscos porque ninguna se envía al cliente en absoluto — la práctica más segura posible. PASS.
- **E2E-SUP-010 (diálogos destructivos)**: eliminar un usuario y eliminar un precio premium disparan un `window.confirm` nativo con texto explícito ("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.") — el diálogo bloquea la acción hasta confirmación explícita. PASS.
- **Aislamiento de scope ya confirmado en la ronda Admin**: acceso cross-país a rutas de Admin (incluida la nueva `/admin/premium-prices`) sigue correctamente bloqueado a nivel de página (`unauthorized`) para cuentas Admin normales — el bug de INC-022 es specific al *bypass* de SuperAdmin, no una regresión del aislamiento entre Admins de distinto país.

---

## Estado de ejecución

| Caso | Resultado | Observación |
|---|---|---|
| E2E-SUP-001 (Login + `/config`) | PASS | Acceso global inmediato tras login, sin redirect incorrecto. KPIs verificados contra DB: 13 servicios, 36 usuarios, 5 países activos — exactos |
| E2E-SUP-002 (Países) | **FAIL — INC-019** | Crear/editar/activar/desactivar país persiste correctamente en DB, pero el país nunca es operativo (404 público permanente, imposible asignarle un Admin) — lista de 5 países hardcodeada en 9+ lugares independientes de la tabla `countries` |
| E2E-SUP-003 (Categorías) | FAIL (mismo INC-016 del plan Admin) | Confirmado que ni siquiera el SuperAdmin puede asignar país o categoría padre desde ningún modal (crear ni editar) — el CRUD de categorías está limitado a nombre ES/EN, icono y orden en ambos roles |
| E2E-SUP-004 (Usuarios/roles) | **FAIL parcial — INC-020** | Crear usuario Admin con país válido: PASS. Cambiar rol Admin→SuperAdmin: el rol cambia correctamente y el acceso global funciona, pero `countryId` queda residual en DB (INC-020). Eliminar usuario: PASS, con diálogo de confirmación |
| E2E-SUP-005 (Servicios/reseñas globales) | PASS | Filtro "País de trabajo" (Todos los países / específico) funciona en Servicios (13/13) y Calificaciones (scoped por país, 1/1 en Chile) |
| E2E-SUP-006 (Precios Premium) | **FAIL parcial — INC-021** | Vista agrupada por duración con banderas por país; scope de lectura correcto (persistencia en DB verificada en cada paso); crear/eliminar precio de fixture funciona, pero la vista queda con conteos incorrectos en las duraciones no tocadas hasta un reload manual |
| E2E-SUP-007 (Pagos/interacciones/integraciones) | PASS | Pagos e interacciones vacíos, coherente con `paymentsEnabled=false`. Integraciones: credenciales nunca expuestas al frontend (ver hallazgo positivo) |
| E2E-SUP-008 (Dashboards nacionales, bypass) | **FAIL — INC-022** | El Resumen de `/ar/admin` (bypass SuperAdmin) muestra KPIs globales (13/36) en vez de scoped a Argentina (3/6); las subsecciones (Servicios, etc.) sí filtran correctamente |
| E2E-SUP-009 (Cambiar entre `/config` y países, refrescar, deep links) | PASS | Navegación fluida entre `/config`, `/ar/admin`, `/ar/admin/services`, etc. sin contaminación de contexto observada más allá del bug ya aislado en INC-022 |
| E2E-SUP-010 (Cancelar destructive, restaurar estado) | PASS | Diálogos de confirmación nativos bloquean hasta aceptar/cancelar explícitamente; los 3 fixtures creados (país `zz`, usuario Admin/SuperAdmin de prueba, precio premium `zz`) fueron eliminados y verificados al cierre — DB vuelve exactamente al estado inicial (36 usuarios, 20 precios, 5 países) |

**Alcance**: ejecución interactiva completa de los 10 casos con la cuenta SuperAdmin de fixture. No se repitió el smoke completo de E2E-SUP-008 en los 5 países porque el código de la página de Resumen (causa de INC-022) es 100% compartido sin ninguna rama por país — el bug aplica igual a `cl`, `uy`, `es`, `us`. Las reglas de seguridad del plan se respetaron: no se desactivó ningún país real, no se tocaron las 3 cuentas SuperAdmin reales, y toda prueba de activación/creación se hizo sobre el país fixture `zz` (eliminado al cierre).
