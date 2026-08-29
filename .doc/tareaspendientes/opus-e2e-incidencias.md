---
title: Super plan de remediación E2E — orquestado con Orca
tags: [hireeo, testing, e2e, incidencias, remediacion, orquestacion, orca]
fecha: 2026-08-29
estado: propuesto
---

# Super plan de remediación E2E — orquestado con Orca

Plan maestro para remediar las **25 incidencias** detectadas en las 6 corridas E2E documentadas en `.doc/tareaspendientes/`. Diseñado para ejecución **autónoma** por agentes coordinados con Orca orchestration, con fases síncronas o asíncronas según la naturaleza real de cada tarea (dependencia técnica, riesgo y colisión de archivos).

**Fuentes**: [[e2e-publico-incidencias]] · [[e2e-client-incidencias]] · [[e2e-professional-incidencias]] · [[e2e-admin-incidencias]] · [[e2e-superadmin-incidencias]] · [[e2e-publicacion-multipais-incidencias]]
**Planes de prueba**: [[../testingqa/README]]

---

## 0. Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Incidencias únicas | **25** (tras deduplicar y resolver colisión de IDs) |
| Críticas | 4 — INC-002, INC-005, INC-006, INC-012 |
| Altas | 12 |
| Medias | 5 |
| Bajas / UX | 4 |
| Fases | 9 (F0 → F8) |
| Tareas orquestadas | 24 |
| Workers concurrentes máximos | 4 |
| Worktrees adicionales | 1 (solo F6, por conflicto real de arquitectura) |
| Duración estimada | 3–5 jornadas de agente |

### Hallazgos del análisis previo (no estaban en los documentos originales)

1. **INC-014 del plan multipaís NO es un bug distinto de INC-009.** El documento afirma "archivo distinto", pero ambos citan `frontend/src/features/services/publish/actions/mutations.ts:172-179` y la verificación en vivo confirma **una única ocurrencia** del literal `'No se encontraron categorías válidas'` en todo el frontend. **Un solo fix cierra las dos incidencias.**
2. **Colisión de numeración**: los planes Professional y Publicación-Multipaís asignaron ambos los IDs INC-012, INC-013 e INC-014 a bugs distintos. Se renumeran los del plan multipaís (ver §1).
3. **INC-007.2 e INC-008 son casi con seguridad síntomas de INC-012**, no bugs independientes: el interceptor global convierte todo `Date` de Prisma en `{}`. Confirmado por lectura del código: `stripSensitiveFields` solo tiene guard para `Prisma.Decimal`, ninguno para `Date`. **Se valida la hipótesis en F1 antes de gastar trabajo en fixes de formateo cosmético.**
4. **La superficie del patrón `Schema.parse()` fuera de try/catch está acotada**: exactamente 7 archivos de Server Actions (`configuration/countries`, `payments/premium`, `contact`, `users`, `categories`, `services`, `reviews`). Es una auditoría cerrada, no una búsqueda abierta.
5. **INC-018 tiene un segundo defecto no titulado**: la paginación de `getAdminPreciosPremium` es falsa (calcula `totalPages` pero nunca hace `slice`). Se remedia junto al buscador.

---

## 1. Registro canónico de incidencias

Los IDs originales se conservan para trazabilidad con los documentos de origen. Solo se renumera lo estrictamente colisionado.

### Resolución de colisiones

| ID original | Documento | Nuevo ID canónico | Motivo |
|---|---|---|---|
| INC-012 | publicación multipaís (redes sociales) | **INC-023** | Colisiona con INC-012 (Professional, interceptor `Date`) |
| INC-013 | publicación multipaís (rate limit upload) | **INC-024** | Colisiona con INC-013 (Professional, contador reseñas) |
| INC-014 | publicación multipaís (IA) | **cerrada como duplicado de INC-009** | Mismo archivo, misma línea, mismo fix |
| INC-015 | publicación multipaís (i18n wizard) | **INC-015** (sin cambio) | No colisiona — ningún otro plan usó ese ID |

### Tabla maestra

| ID | Título corto | Sev. | Capa | Archivo principal | Fase |
|---|---|---|---|---|---|
| INC-001 | Buscador Home manda ubicación como `q` + slugs `CATEGORY_MAP` inexistentes | Alta | FE | `features/home/components/HeroSearchBar/HeroSearchBar.tsx`, `features/services/actions/matchmaking.ts` | F5 |
| INC-002 | `forgotPassword` persiste el password antes de enviar el email → cuenta bloqueada | **Crítica** | BE | `modules/auth/auth.service.ts:282-309` | F1 |
| INC-003 | `/profile/leads` y `/profile/services` sin guard de rol Professional | Media | FS | `service-requests.controller.ts`, `quotes.controller.ts`, `(account)/profile/leads/page.tsx` | F1 + F2 |
| INC-004 | Cambio de contraseña exitoso reporta error falso | Alta | FE | `features/users/actions/mutations.ts:165-186` | F3 |
| INC-004b | Copy de requisitos de contraseña inconsistente registro vs. cambio | Baja | FS | `features/users/schemas/userSchemas.ts`, `auth/dto/register.dto.ts` | F3 |
| INC-005 | `AddressForm` usa endpoint SuperAdmin → selector de país vacío, no se puede crear dirección | **Crítica** | FE | `features/users/components/admin/AddressForm/AddressForm.tsx:9,262` | F2 |
| INC-006 | Widget de chat lee `session.user.token` (no existe) → socket nulo, mensajes nunca se envían | **Crítica** | FE | `features/chat/components/ChatMensajes/ChatMensajes.tsx:37` | F2 |
| INC-007 | `ChatWindow` sin optimistic update + "Invalid Date" | Media | FE | `features/chat/components/ChatWindow/ChatWindow.tsx` | F2 |
| INC-008 | "Invalid Date" / "hace NaN d" en Leads y Cotizaciones | Baja | FE | `features/services/components/**`, `features/geo/lib/countryUtils.ts` | F5 (dep. F1) |
| INC-009 | "Completar con IA": contrato `{data:[]}` vs. array plano → siempre falla (**cierra también INC-014/MP**) | Alta | FE | `features/services/publish/actions/mutations.ts:172-179` | F2 |
| INC-010 | Editar servicio sin teléfono → JSON crudo de Zod; schema create ≠ update | Alta | FE | `features/services/schemas/serviceSchemas.ts:24,61-69`, `features/services/actions/mutations.ts:170-174` | F2 |
| INC-011 | Ficha pública stale hasta 60s tras editar/desactivar (falta `revalidateTag`) | Media | FE | `features/services/actions/mutations.ts:170-232` | F2 |
| INC-012 | Interceptor global convierte todo `Date` en `{}` → `/profile/messages` cae con 500 | **Crítica** | BE | `common/interceptors/serialize.interceptor.ts:18-29` | F1 |
| INC-013 | `totalCalificaciones` hardcodeado en 0 en el resumen del dashboard | Alta | FE | `features/users/actions/queries.ts:183-187` | F4 |
| INC-014 | Cambiar contraseña rompe la sesión activa (loop de redirect) + errores genéricos | Alta | FS | `features/users/actions/mutations.ts`, `app/api/auth/[...nextauth]/route.ts` | F3 |
| INC-015 | Wizard de publicación hardcodeado en español, sin i18n → roto en `us` | Media-Alta | FE | `features/services/publish/components/Paso2TuOficio/Paso2TuOficio.tsx` | F5 |
| INC-016 | Un Admin de país crea categorías **globales** (`create` sin `@CurrentUser` ni `countryCode`) | Alta | FS | `modules/categories/categories.controller.ts:62-69`, `categories.service.ts:143-159` | F4 |
| INC-017 | Editar/desactivar categoría global falla en silencio; la UI no deshabilita el control | Baja | FE | `features/categories/components/admin/CategoriasTable/CategoriasTable.tsx` | F4 |
| INC-018 | Buscador de Precios Premium no filtra + paginación falsa (**y el de Países en `/config`**) | Baja | FE | `features/payments/actions/queries.ts:185-186`, `features/configuration/countries/actions/queries.ts:8` | F5 |
| INC-019 | Países hardcodeados en 9+ lugares → `/config/countries` es solo un editor de metadatos | Alta | FS | `proxy.ts:8`, `[country]/layout.tsx:9`, `auth/dto/register.dto.ts:11,35` (+6) | **F6** |
| INC-020 | Admin→SuperAdmin deja `countryId` residual en `user_roles` | Media | BE | `modules/users/*` (endpoint de roles) | F1 |
| INC-021 | Precios Premium: conteos stale en duraciones no tocadas hasta refresh manual | Media | FE | `app/(config)/config/premium-prices/*` | F4 |
| INC-022 | Resumen de `/{country}/admin` muestra KPIs **globales** para SuperAdmin | Alta | FE | `app/(country)/[country]/(admin)/admin/page.tsx:26-32` | F4 |
| INC-023 | Redes sociales se persisten pero nunca se renderizan en la ficha pública | Alta | FE | `features/services/components/detail/**` | F2 |
| INC-024 | Rate limit de upload por IP (20/h) bloquea publicaciones con mensaje genérico | Alta | FS | `modules/upload/upload.controller.ts:23`, `common/guards/client-ip-throttler.guard.ts` | F4 |

**Fuera de alcance de código (decisiones de producto, ver §7 Gates)**: wizard de `ServiceRequest` inexistente (E2E-CLI-009), Premium `NOT-APPLICABLE` por `paymentsEnabled=false` (E2E-PRO-003 / E2E-CLI-011), redacción de E2E-PUB-005 (404 vs. redirect).

---

## 2. Patrones transversales

Cada patrón se remedia **una sola vez** y luego se aplica a todas sus instancias. Esto evita 25 fixes puntuales que vuelven a divergir.

| Patrón | Instancias | Remediación | Fase |
|---|---|---|---|
| **P1 — `.parse()` fuera de try/catch en Server Actions** | INC-004, INC-010, INC-014 | Helper `parseOrFail<T>()` en `shared/lib/` que devuelve `{ error }` legible en vez de propagar `ZodError`. Aplicar a los **7 archivos** conocidos | F7 |
| **P2 — Mensajes de error genéricos que ocultan la causa** | INC-004, INC-005, INC-014, INC-019, INC-024 | Convención: nunca un `catch` que descarte el mensaje del backend; toast con causa accionable | F7 |
| **P3 — Fechas rotas (`Invalid Date`, `NaN d`)** | INC-007.2, INC-008, INC-012 | Guard de `Date` en el interceptor + `.toISOString()` en respuestas + `formatDate` defensivo | F1 → valida F5 |
| **P4 — Caché sin invalidación tras mutación** | INC-011, INC-021 | `revalidateTag` explícito en toda Server Action que muta una entidad con ficha pública | F2 / F4 |
| **P5 — Buscadores decorativos y paginación falsa** | INC-018 (precios premium, países) | Propagar `search` al backend o filtrar en servidor; paginación real con `slice` o `skip/take` | F5 |
| **P6 — Contrato `apiClient`: `{data:[]}` vs. array plano** | INC-009 (+ INC-014/MP) | Auditar todo uso de `apiClient.get<{data:…}>` y alinear al contrato real | F2 → auditoría F7 |
| **P7 — `tokenVersion` invalida la sesión sin refrescarla** | INC-002, INC-004, INC-014 | Tras un cambio de contraseña propio: refrescar la sesión o forzar logout limpio | F3 |
| **P8 — Guards de rol ausentes (solo se valida sesión)** | INC-003 | `@Roles()` en backend + verificación de rol en las páginas Server Component | F1 / F2 |
| **P9 — Catálogo de países hardcodeado** | INC-019 | Única fuente de verdad: tabla `countries` | F6 |

---

## 3. Grafo de dependencias (DAG)

```
F0 (sync) — baseline, ramas, snapshot DB
 │
 ├──────────────────────────────┬─────────────────────────────┐
 ▼                              ▼                             ▼
F1 (async, 2 workers)      F2 (async, 3 workers)        F6 (async largo, worktree aislado)
backend crítico            frontend bloqueadores        INC-019 países dinámicos
 │                              │                             │
 │  ┌───────────────────────────┘                             │
 ▼  ▼                                                         │
F3 (sync, 1 worker) — contraseñas y sesión (P7)               │
 │                                                            │
 ▼                                                            │
F4 (async, 3 workers) — datos, scope admin, caché             │
 │                                                            │
 ▼                                                            │
F5 (async, 3 workers) — búsqueda, i18n, UX, fechas residuales │
 │                                                            │
 ▼                                                            │
F7 (sync, 2 workers secuenciales) — hardening transversal ◄────┘ (merge de F6)
 │
 ▼
F8 (sync) — re-test E2E, docs, commits
```

**Reglas del DAG**

- **F1 bloquea a F5** solo por INC-008: no se toca formateo de fechas del frontend hasta confirmar cuánto resuelve el guard del interceptor.
- **F1 y F2 son independientes** (submódulos distintos) → arrancan a la vez.
- **F6 arranca en F0 y corre en paralelo toda la ejecución**, aislado en su propio worktree. Se mergea antes de F7.
- **F7 va al final obligatoriamente**: toca los mismos archivos que F2–F5 y colisionaría con cualquier fase abierta.

---

## 4. Política de concurrencia y conflictos

### 4.1 Un archivo, un dueño

Ningún archivo tiene dos workers asignados dentro de la misma fase. Casos que forzaron el diseño:

| Archivo disputado | Incidencias | Resolución |
|---|---|---|
| `features/services/actions/mutations.ts` | INC-010, INC-011 | **Mismo worker** (W-FE-3), ambas tareas en secuencia |
| `features/users/actions/mutations.ts` | INC-004, INC-014, INC-019 | INC-004+INC-014 → W-FS-1 en F3; INC-019 aislado en worktree F6, se mergea después |
| `features/services/publish/actions/mutations.ts` | INC-009, INC-014/MP | Es el mismo bug — **una sola tarea** |
| `proxy.ts`, `[country]/layout.tsx` | INC-019 | Exclusivos de F6 en worktree separado |

### 4.2 Worktrees

Se trabaja **en el worktree actual** (`Pre-Produccion-Eruotolo`). No se crea un worktree por fase: los submódulos `frontend/` y `backend/` son checkouts independientes y los workers tienen ownership de archivos disjunto, así que compartir el worktree es seguro.

**Única excepción justificada — F6 (INC-019)**: modifica `proxy.ts`, `app/page.tsx`, `[country]/layout.tsx`, dos webhooks, `register.dto.ts` y `auth.service.ts` — archivos de arranque que cualquier otro worker necesita estables para verificar su propio trabajo. Es un conflicto real de checkout, no una preferencia. Va a worktree top-level (`--no-parent`): es trabajo arquitectónico independiente, no apilado sobre esta rama.

### 4.3 Git: los workers no escriben en el índice

**Regla dura**: ningún worker ejecuta `git add`, `git commit`, `git stash`, `git checkout` ni `git push`. Dos workers en el mismo submódulo compiten por `index.lock` y se corrompen mutuamente.

Los workers **solo editan archivos**. El coordinador commitea al cerrar cada fase, siguiendo el formato obligatorio de `CLAUDE.md` (línea resumen en inglés + bloque `Tarea/Fecha/Version` con `+1` al patch).

### 4.4 Build: serializado en el coordinador

Los workers ejecutan **solo** verificaciones locales y baratas:

```bash
# backend
pnpm --filter backend lint
pnpm --filter backend exec tsc --noEmit

# frontend
pnpm --filter frontend lint
pnpm --filter frontend type-check
```

**Ningún worker ejecuta `pnpm build`.** El script de build limpia `.next` y corrompe la caché de Turbopack del `pnpm dev` activo (`CLAUDE.md` §Verificación obligatoria), y dos builds concurrentes sobre el mismo `.next` se pisan. El build completo lo corre el coordinador en el checkpoint de cierre de cada fase, con el servidor de desarrollo detenido.

---

## 5. Fases

> **Convención de tareas**: `T<fase>.<n>` · **Owner**: identificador del worker · **Modo**: SYNC (el coordinador espera antes de seguir) / ASYNC (paralelo, se espera al cierre de fase).

### F0 — Baseline y consolidación · SYNC · coordinador solo

Sin workers. El coordinador ejecuta directamente.

| Tarea | Acción | Criterio de aceptación |
|---|---|---|
| T0.1 | Levantar `docker-database` (5435), `pnpm dev:backend` (4445), `pnpm dev:frontend` (3334); `pnpm --filter backend db:seed` | Los 3 servicios responden; `GET /geo/countries` devuelve 5 países |
| T0.2 | `pg_dump` de la DB local a `.doc/testingqa/snapshots/baseline-<fecha>.sql` (fuera de git) | Snapshot restaurable verificado |
| T0.3 | Crear rama `fix/e2e-incidencias-2026-08` en **ambos** submódulos, partiendo de su HEAD actual (`remediacion-auditoria-2026-08-26`) | `git -C frontend branch` y `git -C backend branch` muestran la rama |
| T0.4 | Registrar la renumeración canónica de §1 como nota al pie en los 2 documentos afectados (`e2e-professional-incidencias.md`, `e2e-publicacion-multipais-incidencias.md`) | Ambos documentos apuntan a los IDs canónicos |
| T0.5 | Crear el Run de Orca y las 24 tareas del DAG | `orca orchestration task-list --json` devuelve 24 tareas |

```bash
orca orchestration run-create \
  --objective "Remediación E2E Hireeo — 25 incidencias en 9 fases (F0-F8)" --json
```

---

### F1 — Backend crítico · ASYNC · 2 workers

Arranca junto con F2 y F6. Submódulo `backend/`, archivos disjuntos entre los dos workers.

#### W-BE-1 — Serialización de fechas (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T1.1** | INC-012 | Añadir guard de `Date` en `stripSensitiveFields` (`common/interceptors/serialize.interceptor.ts`), junto al guard existente de `Prisma.Decimal`. Revisar también `Buffer`, `Map`, `Set`, `BigInt` — el defecto es estructural, no exclusivo de `Date` |
| **T1.2** | INC-012 | Normalizar `chat.service.ts:89-90` (`date`, `lastMessageAt`) a `.toISOString()` y **auditar todo el backend** en busca de respuestas que devuelvan `Date` crudo de Prisma |
| **T1.3** | P3 | Emitir a `.doc/testingqa/` un informe de qué endpoints devolvían fechas rotas — **insumo directo de F5/INC-008** |

Archivos propios: `backend/src/common/interceptors/**`, `backend/src/modules/chat/**`.
Aceptación: `curl http://localhost:4445/api/v1/chat/conversations` con sesión válida devuelve `date` como string ISO; `/cl/profile/messages` renderiza sin 500 con al menos una conversación con mensajes.

#### W-BE-2 — Auth, roles y scope (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T1.4** | INC-002 | `forgotPassword` (`auth.service.ts:282-309`): enviar el email **antes** de persistir, o envolver ambos pasos en transacción con compensación. Si el envío falla, la contraseña anterior debe seguir sirviendo |
| **T1.5** | INC-003 (backend) | `@Roles(Role.PROFESSIONAL)` en `GET /service-requests/available` y `GET /quotes/my-quotes`. No depender de que `findAvailableForProvider` devuelva `[]` por casualidad de datos |
| **T1.6** | INC-020 | En el endpoint de actualización de roles: al pasar a `SuperAdmin`, forzar `countryId = NULL`. Script de corrección para filas ya inconsistentes |

Archivos propios: `backend/src/modules/auth/**`, `backend/src/modules/service-requests/**`, `backend/src/modules/quotes/**`, `backend/src/modules/users/**`.
Aceptación: con Brevo sin configurar, `POST /forgot-password` **no** modifica el hash del usuario; un Client autenticado recibe 403 en ambos endpoints de Professional; promover Admin→SuperAdmin deja `countryId IS NULL`.

```bash
orca orchestration worker-start --task <T1.1> --worktree current --agent claude --model sonnet --json
orca orchestration worker-start --task <T1.4> --worktree current --agent claude --model sonnet --json
```

**Checkpoint SYNC de cierre F1**: coordinador corre `pnpm --filter backend lint && pnpm --filter backend build && pnpm --filter backend test`, reinicia el backend y **valida la hipótesis P3**: ¿INC-007.2 e INC-008 desaparecieron solos? El resultado redefine el alcance de F5.

---

### F2 — Bloqueadores críticos de frontend · ASYNC · 3 workers

Corre en paralelo con F1 (submódulo distinto).

#### W-FE-1 — Direcciones y ficha pública (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T2.1** | INC-005 | `AddressForm` debe consumir `GET /geo/countries` (`@Public()`), no `getAdminCountries` (`@Roles(SUPER_ADMIN)`). Eliminar el `catch` que devuelve `[]` en silencio: un fallo de carga tiene que ser visible |
| **T2.2** | INC-023 | Renderizar `redesSociales` en la ficha pública. El dato ya llega mapeado (`queries.ts:59-63,81`); falta el componente. Nuevo `features/services/components/detail/ServiceSocialLinks/ServiceSocialLinks.tsx` (regla de oro: carpeta propia, nunca `index.tsx`), con los 8 tipos e iconos de Lucide |

Aceptación: un Client crea y edita una dirección completa (país→región→localidad) en `cl` y en `es`; la ficha de un servicio con 8 redes cargadas las muestra todas con enlace funcional.

#### W-FE-2 — Chat (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T2.3** | INC-006 | `ChatMensajes.tsx:37` debe leer `session.user.backendToken` (el campo real que expone NextAuth). **Evaluar deduplicar** la implementación de socket contra `ChatWindow.tsx`, que ya lo hace bien — la duplicación es la causa raíz de que solo uno esté roto |
| **T2.4** | INC-006 | `handleSend()`: el `if (socket)` sin `else` debe fallar visible. Sin socket → error al usuario, nunca un mensaje "enviado" que no existe |
| **T2.5** | INC-007 | Optimistic update en `ChatWindow.sendMessage()` + garantizar `join_conversation` antes de `send_message` |

Archivos propios: `frontend/src/features/chat/**`.
Aceptación: mensaje enviado desde el widget flotante aparece en la DB y le llega al Professional; el emisor ve su propio mensaje sin recargar; la hora se muestra correctamente.

#### W-FE-3 — Publicación y edición de servicios (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T2.6** | INC-009 (+INC-014/MP) | `generarDescripcionIA`: `apiClient.get` devuelve el array plano, no `{data:[]}`. Alinear al patrón ya correcto de `categories/actions/queries.ts:88`. **Verificar que la integración con Gemini funciona de punta a punta** una vez desbloqueada — nunca se llegó a ejecutar |
| **T2.7** | INC-010 | Unificar `telefonoContacto` entre `servicioCreateSchema` y `ownServiceUpdateSchema`. **Decisión por defecto** (ver Gate G2): hacerlo requerido también en creación, para no dejar servicios en estado ineditable |
| **T2.8** | INC-011 | `revalidateTag('servicio-slug-{country}-{slug}')` en `actualizarServicioPropio`, `toggleActivoServicioPropio` y `eliminarServicioPropio` |

Archivos propios: `frontend/src/features/services/publish/actions/**`, `frontend/src/features/services/actions/mutations.ts`, `frontend/src/features/services/schemas/**`.
Aceptación: "Completar con IA" devuelve una descripción real; un servicio sin teléfono ya no puede crearse (o se edita sin error, según el gate); la ficha pública refleja el cambio en el siguiente request, sin esperar 60s.

**Checkpoint SYNC de cierre F2**: lint + type-check + build del frontend con `pnpm dev` detenido. Commit de fase.

---

### F3 — Contraseñas y sesión · SYNC · 1 worker

**Deliberadamente síncrona y de un solo worker.** Toca autenticación: un fix mal cerrado aquí bloquea a todos los usuarios de todas las cuentas de prueba. Depende de T1.4 (misma superficie `tokenVersion`).

#### W-FS-1 — Ciclo de vida de la contraseña (`claude` / sonnet, effort alto)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T3.1** | INC-014 A | Tras un cambio de contraseña propio y exitoso: refrescar la sesión de NextAuth con el nuevo token, o forzar un logout limpio con mensaje explícito. Nunca dejar la pestaña en `ERR_TOO_MANY_REDIRECTS` |
| **T3.2** | INC-004 | `actualizarPassword`: mover `passwordUpdateSchema.parse()` dentro del `try/catch` y devolver `{ error }` legible. Confirmar que el "error falso" era esto y no un fallo real de la mutación |
| **T3.3** | INC-014 B | Errores específicos y accionables: "contraseña actual incorrecta", "mínimo 8 caracteres, 1 mayúscula y 1 carácter especial", "las contraseñas no coinciden" |
| **T3.4** | INC-004b | Unificar la regla de contraseña entre registro (`RegisterDto`, solo `@MinLength(8)`) y cambio (`passwordSchema`, con mayúscula + especial). **Una sola regla**, y que ambos copys la describan con exactitud |

Archivos propios: `features/users/actions/mutations.ts`, `features/users/schemas/**`, `features/users/components/profile/AjustesPerfilForm/**`, `app/api/auth/[...nextauth]/route.ts`, `backend/src/modules/auth/dto/register.dto.ts`.
Aceptación: cambiar contraseña muestra éxito real, la sesión sigue usable (o cierra limpiamente con aviso), los 3 errores de validación muestran mensajes distintos y correctos, y las contraseñas de fixture quedan restauradas a `Hireeo2026!Test`.

**Riesgo**: el worker cambiará contraseñas de cuentas de prueba. **Obligatorio** restaurarlas antes de `worker_done` y verificar con login real.

---

### F4 — Datos, scope de admin y caché · ASYNC · 3 workers

#### W-FE-4 — Métricas y scope del dashboard (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T4.1** | INC-013 | `getProfilePageData`: reemplazar `totalCalificaciones: 0` por `services.reduce((s, x) => s + (x.totalRatings ?? 0), 0)` |
| **T4.2** | INC-022 | `getDashboardStats` debe pasar `countryCode` a `getAdminUsers`/`getAdminServices` (ya lo soportan, ver `admin/users/page.tsx:22`). Revisar `getInteraccionesMetricas` por el mismo defecto |
| **T4.3** | INC-021 | Revalidación completa de los 4 grupos de duración tras crear/eliminar un precio premium |

#### W-FS-2 — Scope de categorías (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T4.4** | INC-016 (backend) | `POST /categories`: recibir `@CurrentUser()`, aplicar `assertAdminCanManageCategory` como ya hacen `update`/`delete` (AUD-18). Un Admin de país crea con **su** `countryCode`; solo SuperAdmin crea globales. Añadir `countryCode` y `parentId` a `CreateCategoryDto` |
| **T4.5** | INC-016 (frontend) | `CategoriaForm`: selector de categoría padre siempre; selector de país solo visible para SuperAdmin |
| **T4.6** | INC-017 | `CategoriasTable`: deshabilitar editar/eliminar/toggle cuando la fila es global y el usuario no es SuperAdmin, con tooltip explicativo. Marca **persistente**, no un toast efímero |

#### W-FS-3 — Límite de subida de imágenes (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T4.7** | INC-024 (backend) | Trackear el throttle de `/upload` **por usuario autenticado** (fallback a IP solo para anónimos) y elevar el límite largo a un valor coherente con el wizard (5 subidas por publicación → ≥60/h). Exponer `Retry-After` |
| **T4.8** | INC-024 (frontend) | `Paso2TuOficio.uploadImage`: detectar `status === 429` y mostrar un mensaje específico con la espera. **No perder el trabajo**: no reintentar subiendo de cero las imágenes ya subidas correctamente |

Aceptación: contador de reseñas real; `/ar/admin` con SuperAdmin muestra 3 servicios y 6 usuarios (no 13/36); un `admin.cl` crea una categoría que **no** aparece en `?countryCode=ar`; 5 publicaciones seguidas desde la misma IP con usuarios distintos no se bloquean.

**Checkpoint SYNC de cierre F4**: build de ambos submódulos + commit de fase.

---

### F5 — Búsqueda, i18n y UX · ASYNC · 3 workers

El alcance de INC-008 se **recorta según el informe T1.3**: si el guard del interceptor ya lo resolvió, T5.5 se cierra como verificación y no como fix.

#### W-FE-5 — Buscador del Home (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T5.1** | INC-001 | `HeroSearchBar.handleSearch`: la ubicación escrita a mano debe resolverse contra geo (match difuso sobre localidades/regiones del país) y aplicarse como filtro geográfico, no como `q`. El texto de "Describe el problema" debe viajar además como búsqueda de texto |
| **T5.2** | INC-001 | Auditar **las 12+ entradas** de `CATEGORY_MAP`/`CATEGORY_LABELS` contra `SELECT slug FROM service_categories`. `gasfiteria` no existe (es `plomeria`); verificar `jardineria`, `techos`, `linea-blanca`, `climatizacion` y el resto. Idealmente derivar el mapa de la DB en vez de hardcodearlo |

#### W-FE-6 — i18n del wizard (`claude` / sonnet)

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T5.3** | INC-015 | Conectar todo el wizard de publicación (Pasos 1–3) al sistema `getDictionary` ya usado en `service/[slug]/page.tsx`. Incluye el placeholder mixto "Selecciona state" — el verbo también debe traducirse |

#### W-FE-7 — Buscadores y fechas residuales (`claude` / haiku)

Tareas mecánicas y acotadas; no requieren razonamiento profundo.

| Tarea | Incidencia | Alcance |
|---|---|---|
| **T5.4** | INC-018 | `getAdminPreciosPremium`: usar el parámetro `_search` (o filtrar en servidor) **y** arreglar la paginación falsa (`totalPages` sin `slice`). Mismo tratamiento para el buscador de Países en `/config/countries` |
| **T5.5** | INC-008 | Verificar Leads y Cotizaciones tras F1. Si persiste algún "Invalid Date"/"NaN d", endurecer `countryUtils.formatDate` para que valide el input y degrade a un guion, nunca lance `RangeError` que tumbe un Server Component |

---

### F6 — Países dinámicos (INC-019) · ASYNC LARGO · worktree aislado

Corre desde F0 en paralelo con todo. Es la única fase con worktree propio (§4.2).

#### W-ARCH-1 — Catálogo de países desde la DB (`codex` / gpt-5.6-sol, o `claude` / opus)

Tarea de arquitectura genuina: modelo mental completo del arranque de la app y de los 9+ puntos hardcodeados. Justifica el modelo caro; el resto del plan usa Sonnet/Haiku (`CLAUDE.md` §10, regla de eficiencia de tokens).

| Tarea | Alcance |
|---|---|
| **T6.1** | Inventario exhaustivo de los puntos hardcodeados: `proxy.ts:8`, `app/page.tsx:4`, `[country]/layout.tsx:9`, webhooks de MercadoPago y Stripe, `register.dto.ts:11,35`, `auth.service.ts:367,412,490`. Confirmar que son 9 y no más |
| **T6.2** | Fuente única de verdad: los códigos activos salen de la tabla `countries`, con caché en arranque/revalidación. Validación de `RegisterDto` dinámica (validador custom que consulta el catálogo, no `@IsIn` de una constante) |
| **T6.3** | UI honesta: si `/config/countries` sigue sin poder activar países operativos, avisarlo explícitamente en pantalla en vez de fingir que funciona |
| **T6.4** | `crearUsuario` (`features/users/actions/mutations.ts:64-66`): dejar de mostrar "El email puede estar en uso" ante cualquier error. Propagar la causa real del 400 |

**Aceptación**: crear el país `py` desde `/config/countries`, activarlo, navegar a `/py` sin 404, y crear un Admin de Paraguay sin errores. Al terminar: **eliminar el fixture `py`** y dejar la DB con los 5 países reales.

```bash
orca orchestration worker-start --task <T6.1> \
  --worktree new-top-level --name paises-dinamicos \
  --agent codex --setup run --json
```

**Gate G6** (§7): si al inventariar aparecen >15 puntos hardcodeados o el cambio toca el esquema de Prisma, se difiere a un plan propio y F6 se cierra entregando solo T6.3 + T6.4 (mitigación honesta), no un refactor a medias.

---

### F7 — Hardening transversal · SYNC · 2 workers en secuencia

Va al final por diseño: toca los mismos archivos que F2–F5. Requiere F6 mergeado.

#### W-HARD-1 — Patrón P1 + P2 (`claude` / sonnet)

| Tarea | Alcance |
|---|---|
| **T7.1** | Helper `parseOrFail<T>(schema, data)` en `shared/lib/` que devuelve `{ data }` o `{ error }` con mensajes legibles. Aplicarlo a los **7 archivos conocidos**: `configuration/countries`, `payments/premium`, `contact`, `users`, `categories`, `services`, `reviews` |
| **T7.2** | Barrido de `catch` que descartan el mensaje real del backend (P2). Cada uno debe propagar causa accionable |

#### W-HARD-2 — Patrones P3 + P6 (`claude` / haiku)

Auditoría mecánica sobre superficie ya acotada.

| Tarea | Alcance |
|---|---|
| **T7.3** | Auditar todo uso de `apiClient.get<{ data: ... }>` en el frontend y alinearlo con el contrato real de cada endpoint (P6) |
| **T7.4** | Auditar todos los servicios del backend que devuelvan `Date` de Prisma sin `.toISOString()` (el guard del interceptor los cubre, pero la conversión explícita es el contrato correcto) |

---

### F8 — Re-test E2E, documentación y cierre · SYNC · coordinador + 2 workers

| Tarea | Alcance |
|---|---|
| **T8.1** | Re-ejecutar **todos** los casos marcados FAIL/BLOCKED en los 6 planes: E2E-PUB-003/010, E2E-CLI-002/003/007/013, E2E-PRO-002/004/005/007/010/011, E2E-ADM-002/007, E2E-SUP-002/004/006/008 |
| **T8.2** | Spot-check multi-país en `ar`, `es` y `us` de los fixes con superficie visible por país: INC-015 (i18n en `us`), INC-005 (direcciones), INC-023 (redes), INC-022 (KPIs scoped) |
| **T8.3** | Restaurar el estado de la DB: eliminar fixtures, restaurar contraseñas estándar, verificar conteos contra el snapshot de T0.2 |
| **T8.4** | Actualizar los 6 documentos de incidencias: marcar cada INC como resuelta con el commit que la cierra; actualizar las tablas de estado de ejecución |
| **T8.5** | Actualizar `.doc/README.md` y `.doc/testingqa/README.md` (obligatorio por `CLAUDE.md` §Mantenimiento de `.doc/`) |
| **T8.6** | Commits finales por submódulo + actualización de punteros en el repo padre + nota fechada en el vault `~/SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md` |

**Criterio de cierre del plan**: cero casos FAIL en los 6 planes E2E, salvo los explícitamente marcados `NOT-APPLICABLE` por decisión de producto (Premium con `paymentsEnabled=false`, wizard de `ServiceRequest`).

---

## 6. Cuadro de asignación

| Worker | Agente / modelo | Fase | Tareas | Justificación del modelo |
|---|---|---|---|---|
| W-BE-1 | claude / sonnet | F1 | T1.1–T1.3 | Fix acotado con causa raíz ya diagnosticada |
| W-BE-2 | claude / sonnet | F1 | T1.4–T1.6 | Idem, 3 módulos independientes |
| W-FE-1 | claude / sonnet | F2 | T2.1–T2.2 | Incluye un componente nuevo (criterio de diseño) |
| W-FE-2 | claude / sonnet | F2 | T2.3–T2.5 | Sockets + posible deduplicación |
| W-FE-3 | claude / sonnet | F2 | T2.6–T2.8 | Schemas + caché, requiere criterio |
| W-FS-1 | claude / sonnet (effort alto) | F3 | T3.1–T3.4 | Autenticación: máximo cuidado, un solo worker |
| W-FE-4 | claude / sonnet | F4 | T4.1–T4.3 | |
| W-FS-2 | claude / sonnet | F4 | T4.4–T4.6 | Full-stack con reglas de scope |
| W-FS-3 | claude / sonnet | F4 | T4.7–T4.8 | |
| W-FE-5 | claude / sonnet | F5 | T5.1–T5.2 | Matching geográfico, requiere criterio |
| W-FE-6 | claude / sonnet | F5 | T5.3 | i18n mecánico pero voluminoso |
| W-FE-7 | claude / **haiku** | F5 | T5.4–T5.5 | Mecánico y acotado — eficiencia de tokens |
| W-ARCH-1 | codex / **gpt-5.6-sol** | F6 | T6.1–T6.4 | Refactor arquitectónico transversal real |
| W-HARD-1 | claude / sonnet | F7 | T7.1–T7.2 | Helper compartido + criterio de mensajes |
| W-HARD-2 | claude / **haiku** | F7 | T7.3–T7.4 | Auditoría mecánica sobre superficie cerrada |

---

## 7. Gates de decisión (resueltos de forma autónoma)

Ejecución autónoma: el coordinador resuelve cada gate con la resolución por defecto y lo **registra** en este documento. Solo escala a Edgardo si la evidencia contradice la resolución.

| Gate | Pregunta | Resolución por defecto | Fundamento |
|---|---|---|---|
| **G1** | ¿Se construye el wizard de `ServiceRequest` (E2E-CLI-009)? | **No.** Se actualiza el caso de prueba para reflejar el flujo real por chat | Es una feature nueva, no un bug. Fuera del alcance de "remediar incidencias" |
| **G2** | `telefonoContacto`: ¿requerido en creación, u opcional en edición? | **Requerido en ambos.** Un servicio publicado sin teléfono de contacto no es contactable — el campo es el producto | Alinea con el flujo real; evita servicios ineditables |
| **G3** | ¿INC-008 e INC-007.2 se arreglan por separado? | **No hasta ver T1.3.** Si el guard del interceptor los resuelve, quedan como verificación | Evita trabajo duplicado sobre un síntoma |
| **G4** | ¿Se activa `paymentsEnabled` para probar Premium? | **No.** Es una decisión de producto vigente (lanzamiento con capa gratuita) | Documentado en 3 planes; no es deuda técnica |
| **G5** | ¿Se sube el límite de upload o se cambia el tracking? | **Ambos**: tracking por usuario + límite acorde a 5 subidas por publicación | La causa raíz es el tracking por IP, no solo el número |
| **G6** | ¿F6 completa o mitigación? | **Completa si el inventario confirma ≤15 puntos y no toca Prisma**; si no, solo T6.3+T6.4 y plan aparte | Un refactor de arranque a medias es peor que ninguno |
| **G7** | ¿Redacción de E2E-PUB-005 (404 vs. redirect)? | **Actualizar el caso de prueba**: 404 es el comportamiento correcto (AUD-32) | El código está bien; el plan de prueba está mal redactado |

---

## 8. Protocolo de worker (plantilla obligatoria de `--spec`)

Todo `task-create` usa esta estructura. Los workers reciben el preámbulo de lifecycle inyectado por Orca y reportan `worker_done` exactamente una vez.

```
CONTEXTO
Repo: /Users/edgardoruotolo/SitesWorkspaces/next-atlas-services/Pre-Produccion-Eruotolo
Monorepo con submódulos frontend/ (Next.js 16, App Router) y backend/ (NestJS 11 + Prisma).
Leer CLAUDE.md antes de tocar nada. Comunicación en español, código en inglés.
Incidencia origen: <INC-xxx> — ver .doc/tareaspendientes/opus-e2e-incidencias.md §1

ARCHIVOS QUE POSEES (exclusivo — nadie más los edita en esta fase)
- <lista explícita>

ARCHIVOS PROHIBIDOS
- Cualquier archivo fuera de la lista anterior.
- package.json, tsconfig.json, biome.json, prisma/schema.prisma (scope quirúrgico, CLAUDE.md §2).
- Si necesitas tocar uno prohibido: NO lo edites — usa `orca orchestration ask`.

TAREA
<descripción y causa raíz ya diagnosticada, con archivo:línea>

CRITERIO DE ACEPTACIÓN
<verificable, con comando o pasos de UI concretos>

VERIFICACIÓN OBLIGATORIA ANTES DE worker_done
- backend:  pnpm --filter backend lint && pnpm --filter backend exec tsc --noEmit
- frontend: pnpm --filter frontend lint && pnpm --filter frontend type-check
- NUNCA ejecutar `pnpm build` (el coordinador lo corre serializado; limpia .next y corrompe Turbopack).

PROHIBICIONES DURAS
- No ejecutar git add / commit / stash / checkout / push. Solo editas archivos.
- No agregar features, refactors ni mejoras no pedidas (CLAUDE.md §Instrucciones críticas).
- No crear archivos .md de documentación.
- Cada componente en su propia carpeta con el nombre del componente, NUNCA index.tsx.
- Si dejaste fixtures en la DB o cambiaste contraseñas de prueba: restaurar antes de terminar.

REPORTE
orca orchestration send --type worker_done \
  --subject "<INC-xxx> <estado>" \
  --body "Qué cambié, qué encontré, qué queda pendiente" \
  --task-id <task_id> --dispatch-id <dispatch_id> \
  --outcome succeeded --files-modified "<rutas>" --json
```

---

## 9. Bucle del coordinador

```bash
# 1) Crear el Run
orca orchestration run-create --objective "Remediación E2E Hireeo — 25 incidencias" --json

# 2) Crear todas las tareas de la ola actual (con --deps donde aplique)
orca orchestration task-create --spec "<spec de T1.1>" --json
orca orchestration task-create --spec "<spec de T1.4>" --json
orca orchestration task-create --spec "<spec de T2.1>" --json
# ...

# 3) Arrancar TODOS los workers independientes antes de esperar a ninguno
orca orchestration worker-start --task <T1.1> --worktree current --agent claude --model sonnet --json
orca orchestration worker-start --task <T1.4> --worktree current --agent claude --model sonnet --json
orca orchestration worker-start --task <T2.1> --worktree current --agent claude --model sonnet --json
orca orchestration worker-start --task <T6.1> --worktree new-top-level --name paises-dinamicos --agent codex --setup run --json

# 4) Esperar en ventanas rodantes (nunca sleep/poll)
orca orchestration check --wait --types worker_done,escalation,question --timeout-ms 1800000 --json

# 5) Por cada worker_done aceptado, liberar su terminal
orca orchestration worker-release --dispatch <dispatch_id> --json

# 6) Acusar recibo y seguir esperando hasta que TODOS los dispatches de la ola cierren
orca orchestration check --ack <delivery_id> --wait \
  --types worker_done,escalation,question --timeout-ms 1800000 --json
```

**Reglas de supervisión**

- Un timeout o `{count:0}` es un checkpoint, **no** un fallo. Tareas de código de 15–60 min son normales: seguir esperando.
- Un `question` se responde con `orca orchestration reply --id <msg_id> --body "<respuesta>"`. El coordinador decide de forma autónoma según §7 y `CLAUDE.md`; solo escala a Edgardo si la pregunta cambia el producto.
- Nunca cerrar un worker por estar callado. Heartbeat y actividad visible significan vivo, no terminado.
- Tras cada fase: checkpoint SYNC (build serializado + commit) antes de abrir la siguiente ola.
- Verificar provenance antes de afirmar que algo se orquestó: `orca orchestration task-list --json` y `dispatch-show --task <id> --json`.

---

## 10. Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Dos workers escriben el mismo archivo | Baja | Ownership exclusivo por fase (§4.1); tabla de archivos disputados resuelta de antemano |
| `index.lock` de git corrupto | Media si no se controla | Los workers no ejecutan git; el coordinador commitea (§4.3) |
| Build concurrente corrompe `.next` | Alta si no se controla | Ningún worker hace build; serializado en checkpoints (§4.4) |
| F3 deja cuentas de prueba inaccesibles | Media | Snapshot de DB (T0.2) + restauración obligatoria antes de `worker_done` |
| F6 desborda su alcance | Media | Gate G6 con corte explícito; worktree aislado; se mergea o se descarta sin afectar al resto |
| El guard del interceptor rompe respuestas existentes | Baja | El backend ya devuelve fechas como string en varios servicios; test suite del backend en el checkpoint F1 |
| Los fixes de F2–F5 se pisan con F7 | Alta si se paraleliza | F7 es estrictamente posterior por diseño del DAG |
| INC-024 vuelve a bloquear el re-test de F8 | Media | T4.7 se resuelve **antes** de F8; el re-test multipaís usa el límite ya elevado |

---

## 11. Trazabilidad

Cada incidencia se cierra con: commit que la resuelve + caso E2E re-ejecutado en verde + actualización de su documento de origen. Tabla a completar durante la ejecución.

| INC | Fase | Tarea | Commit | Caso E2E verde | Doc actualizado |
|---|---|---|---|---|---|
| INC-001 | F5 | T5.1, T5.2 | — | E2E-PUB-003 | ☐ |
| INC-002 | F1 | T1.4 | — | E2E-PUB-010 | ☐ |
| INC-003 | F1/F2 | T1.5 | — | E2E-CLI-013 | ☐ |
| INC-004 | F3 | T3.2 | — | E2E-CLI-002 | ☐ |
| INC-004b | F3 | T3.4 | — | E2E-CLI-002 | ☐ |
| INC-005 | F2 | T2.1 | — | E2E-CLI-003 | ☐ |
| INC-006 | F2 | T2.3, T2.4 | — | E2E-CLI-007 | ☐ |
| INC-007 | F2 | T2.5 | — | E2E-CLI-007 | ☐ |
| INC-008 | F5 | T5.5 | — | E2E-PRO-008 | ☐ |
| INC-009 | F2 | T2.6 | — | E2E-PRO-002 + E2E-PUB(MP) | ☐ |
| INC-010 | F2 | T2.7 | — | E2E-PRO-004 | ☐ |
| INC-011 | F2 | T2.8 | — | E2E-PRO-005 | ☐ |
| INC-012 | F1 | T1.1, T1.2 | — | E2E-PRO-010 | ☐ |
| INC-013 | F4 | T4.1 | — | E2E-PRO-011 | ☐ |
| INC-014 | F3 | T3.1, T3.3 | — | E2E-PRO-007 | ☐ |
| INC-015 | F5 | T5.3 | — | E2E-PUB(MP) `us` | ☐ |
| INC-016 | F4 | T4.4, T4.5 | — | E2E-ADM-002 / E2E-SUP-003 | ☐ |
| INC-017 | F4 | T4.6 | — | E2E-ADM-002 | ☐ |
| INC-018 | F5 | T5.4 | — | E2E-ADM-007 / E2E-SUP-002 | ☐ |
| INC-019 | F6 | T6.1–T6.4 | — | E2E-SUP-002 | ☐ |
| INC-020 | F1 | T1.6 | — | E2E-SUP-004 | ☐ |
| INC-021 | F4 | T4.3 | — | E2E-SUP-006 | ☐ |
| INC-022 | F4 | T4.2 | — | E2E-SUP-008 | ☐ |
| INC-023 | F2 | T2.2 | — | E2E-PUB(MP) paso 7 | ☐ |
| INC-024 | F4 | T4.7, T4.8 | — | E2E-PUB(MP) `es`/`us` | ☐ |
