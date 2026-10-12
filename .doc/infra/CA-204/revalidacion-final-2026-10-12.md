# CA-204 — Revalidación final sobre los HEAD finales

> Autor: Javier Pino (Infraestructura), por encargo de Ricardo Soto. Tarjeta CA-204 (global CA-187). Ejecutado el 2026-10-12 entre 10:39 y 10:42 (hora local; 13:39–13:42 UTC).
> Alcance: solo verificación y documentación. Sin cambios de código ni de configuración, sin commit, push, deploy, migración remota ni base remota. Este informe cita solo nombres de variables, nunca valores.
> Contexto: CA-205 (Desarrollo) quedó en Hecho; esta pasada revalida el estado final antes de pedir el GO de deploy.

## 1. Estado de los repos (reconciliación)

Los tres repos están en `main`, en el checkout existente, sin ramas ni worktrees adicionales. «Ahead» se calcula contra las refs locales `origin/main` (último fetch del 2026-09-23; no se hizo fetch ahora para no tocar la red).

| Repo | HEAD (40 caracteres) | Rama | Remoto `origin` (fetch y push) | Ahead / behind de `origin/main` | Árbol |
| --- | --- | --- | --- | --- | --- |
| padre `next-atlas-services` | `94805023600b893fcb3af4c338d895396216a9a7` | `main` | `https://github.com/eruotolo/atlas-services-beta.git` | 18 / 0 (`origin/main` = `844a06535ec7af89eb1e4a13277902ac6166a2e7`) | solo ` M AGENTS.md` (hunk ajeno sin commitear, no se toca) |
| `backend` (hireeo-back) | `349c35654c8437f4b53a08bb920cdf15238d1503` | `main` | `https://github.com/hireeoapp/hireeo-back.git` | 8 / 0 (`origin/main` = `fbe918e261616cc54f05a6ce74fc16d16ee6bb8a`) | limpio |
| `frontend` (hireeo-front) | `23292847fcd746aa0c3bdc5b06922114fff290e5` | `main` | `https://github.com/hireeoapp/hireeo-front.git` | 19 / 0 (`origin/main` = `d8d8fec273af8de467d1a18fd3a559390f096476`) | limpio |

- Remotos: ninguna URL lleva credenciales embebidas (no hay `usuario:token@`), por eso se citan completas. Los tres repos tienen solo `origin`.
- Punteros del padre (`git ls-tree HEAD`): `backend` → `349c35654c8437f4b53a08bb920cdf15238d1503` y `frontend` → `23292847fcd746aa0c3bdc5b06922114fff290e5`. Coinciden exactamente con los HEAD de los submódulos. `appmobile` no se toca (`fb130fba1715ee3617a61f78721aba477eec77bc`, fuera del alcance de hireeo).
- Los árboles quedaron en el mismo estado después de las verificaciones: ni `build` ni los tests dejaron archivos versionados modificados.
- Commits locales desde la revisión anterior (CA-204, `248a1ce`/`15747be`/`9ef02fa`), todos de CA-205:
  - backend: `00da5c8` (rechaza pagos con tarjeta y lectura de tarifas en países sin pagos), `349c356` (rechaza webhooks firmados de países sin pagos).
  - frontend: `e4f992c`, `48371fa`, `8aa8083`, `fb209b4`, `2329284`.
  - padre: `ad76d4e`, `f75533b`, `280ed94`, `9480502`.
- Decisiones originales de CA-205 leídas: evidencia de Tomás Vidal, QA devuelto y QA aprobado de Andrés Molina; el último commit de CA-205 (`94805023…`) es el HEAD del padre.

## 2. Verificaciones, en orden, sobre los HEAD finales

Entorno: Node v22.23.0, pnpm 10.33.2. Cada repo corrió su secuencia `type-check` → `test` → `lint` → `format:check` → `build` desde su carpeta (`backend/`, `frontend/`), una sola corrida por repo, sin editar nada. Los logs completos están respaldados fuera de los repos (sección 6).

El padre no declara scripts `type-check`, `test` ni `build`: referencia las aplicaciones, cuyos comandos se verificaron en sus carpetas. Esta pasada final se hizo en el checkout; las pruebas de instalación/build en clones limpios son las de la revisión anterior del informe de builds. Se conserva la limitación de lockfiles distintos entre workspace local y repos autónomos (H2 de ese informe); no se afirma una nueva validación del entorno real de Vercel.

### Backend (`349c35654c8437f4b53a08bb920cdf15238d1503`)

| # | Comando | Exit | Resultado |
| --- | --- | --- | --- |
| 1 | `pnpm type-check` (`tsc --noEmit -p tsconfig.json`) | 0 | sin errores |
| 2 | `pnpm test` (`node --test …`) | 0 | **832 tests, 832 pass, 0 fail**, 0 cancelled, 0 skipped (≈12 s) |
| 3 | `pnpm lint` (biome `check src/`) | 0 | 272 archivos, 0 errores, 5 warnings (ya existentes) |
| 4 | `pnpm format:check` (prettier) | 0 | todos los archivos con el estilo |
| 5 | `pnpm build` (`nest build && tsc-alias`) | 0 | build correcto (≈5 s, incremental) |

### Frontend (`23292847fcd746aa0c3bdc5b06922114fff290e5`)

| # | Comando | Exit | Resultado |
| --- | --- | --- | --- |
| 1 | `pnpm type-check` (`next typegen && tsc --noEmit`) | 0 | tipos de rutas generados, sin errores |
| 2 | `pnpm test` (`tsx --test`, incluye `tests/guards/`) | 0 | **141 tests, 141 pass, 0 fail**, 0 cancelled, 0 skipped. Los guards de regresión pasan (el fallo «debt went down» del 2026-10-12 temprano ya no está) |
| 3 | `pnpm lint` (biome `check src/`) | 0 | 498 archivos, 0 errores, 49 warnings (ya existentes) |
| 4 | `pnpm format:check` (prettier) | 0 | todos los archivos con el estilo |
| 5 | `pnpm build` (`pnpm clean && next build`) | 0 | Next.js 16.3.3 (Turbopack), compilado, 214/214 páginas generadas (≈16 s) |

Los conteos coinciden con la evidencia final de CA-205 (backend 832, frontend 141, 49 y 5 warnings). Respecto de la revalidación anterior de CA-204 (backend 831, frontend 130) suben porque CA-205 agregó pruebas de pagos deshabilitados y de regresión.

Padre (`94805023…`): el `package.json` de la raíz **no tiene scripts `build`, `test` ni `type-check` propios** (solo `dev*`, `stop`, `clean`, `db:seed`, `lint`, `lint:fix`, `format` y `format:check`, además de los de `diagrama`). No hay nada que correr ahí: la validación de las aplicaciones es la de los submódulos, es decir, las dos tablas de arriba. El padre solo aporta documentación, el CI y los punteros de los submódulos.

Incidente de ejecución (sin efecto en el resultado): el primer lanzamiento de la secuencia arrancó dos veces por un error mío al lanzar el script; detuve todas las corridas y procesos de `next build` antes de que terminaran, verifiqué que los árboles seguían limpios y repetí **una sola corrida por repo**. Todo lo citado arriba sale de esa corrida limpia; los logs abortados quedaron aparte y no se usan.

## 3. E2E: no se repite

La evidencia vigente es la de QA (Andrés Molina, segunda revisión de CA-205) sobre el mismo código que hoy es HEAD: `pnpm test:e2e` **completo dos veces seguidas, sin `--no-deps`**, corrida 1 = **253 passed, 0 failed** (2.1 min) y corrida 2 = **253 passed, 0 failed** (2.1 min), con backend `node dist/main` en 4444, `next dev` en 3334 y la base local `hireeo-postgres` en 5435. Esos commits son los de hoy: frontend `2329284…` (v0.1.53) y padre `9480502…` (v1.5.11); backend sin cambios en `349c356…`. Entre esa revisión y este HEAD no hay commits nuevos en ningún repo (verificado: `git rev-parse HEAD` de los tres coincide con los SHA que cita la decisión de QA). Tomás Vidal obtuvo antes otras dos corridas verdes de 253 sobre el mismo `2329284`. Por eso no se vuelve a correr.

## 4. Migraciones y configuración (solo lectura)

- 32 migraciones en `backend/prisma/migrations/` (la última, `20260829202220_add_rate_limit_counters`). Ningún commit de CA-205 toca `prisma/` (`git diff 8842ea6 HEAD -- prisma` vacío), así que no hay migraciones nuevas desde la revisión anterior: la comparación contra `schema.prisma` y la base local al día (informe de builds §4) siguen vigentes. `prisma validate` hoy: esquema válido.
- `backend/prisma.config.ts` usa `DIRECT_DATABASE_URL ?? DATABASE_URL` para migrar (el runtime no lo lee). `backend/vercel.json` corre `prisma migrate deploy && build`; `frontend/vercel.json` instala con `--frozen-lockfile`. Sin cambios desde `15747be`/`9ef02fa`.
- Archivos de entorno: versionados solo los `.env.example` (padre, backend, frontend); los demás (`.env`, `.env.local`, `.env.production`, `.env.e2e.local`) están ignorados por git en los tres repos.
- Variables por nombre. Backend (`.env.example`): `NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `FRONTEND_URL`, `API_KEY`, `INTEGRATIONS_ENCRYPTION_KEY`, `INTERNAL_SERVICE_TOKEN`, `SEED_SUPERADMIN_PASSWORD_EDGARDO`, `SEED_SUPERADMIN_PASSWORD_LNUNEZ`. Frontend: `NEXT_PUBLIC_API_URL`, `API_KEY`, `AUTH_SECRET`, `NEXTAUTH_URL`, `INTERNAL_SERVICE_TOKEN`, `NEXT_PUBLIC_APP_URL`. Coincide con la matriz del informe de builds §5 y con la lista del punto 9 del checklist.
- Observación (no cambia el veredicto): el `backend/.env.production` local (un volcado de Vercel, ignorado por git) no lista `INTEGRATIONS_ENCRYPTION_KEY` ni `INTERNAL_SERVICE_TOKEN`, y trae `WEBHOOK_SECRET` y `APPLE_CLIENT_ID`; el `frontend/.env.production` local trae `NEXT_PUBLIC_API_KEY` y `AUTH_URL`, que ningún código usa. Es un archivo local posiblemente desactualizado: lo que cuenta es lo cargado en Vercel, que nadie puede ver desde aquí (punto 9, de Edgardo). Confirmar al cargar las variables que las dos primeras existen en `hireeo-back`, y no cargar `NEXT_PUBLIC_API_KEY`.

## 5. Veredicto y qué falta

- **Técnico: todo verde.** Backend y frontend pasan type-check, test, lint, format:check y build sobre los HEAD finales; sin errores ni tests saltados.
- **Bloqueos de código de CA-204 (puntos 15–17 del checklist): cerrados** por CA-205 en Hecho; los puntos 1–3 se revalidaron hoy.
- **Siguen siendo de Edgardo (no bloquean la verificación, sí el deploy):** variables de Production en Vercel (punto 9), estado y seed de la base de producción (10), respaldo antes de `migrate deploy` (11) y revocación del token antiguo de los remotes (13). El secreto `SUBMODULES_TOKEN` (7) no bloquea el deploy.
- **Pendientes fuera de alcance ya registrados por CA-205:** el Admin de país puede reactivar pagos (P20), textos de FAQ y legales que nombran Premium, y los 429 de `/auth/refresh` con redirect infinito.
- **Brecha del proceso:** `pnpm kanban reclamar` fue rechazado («La ejecución ya terminó correctamente») porque la ejecución de CA-204 ya era `SUCCEEDED`; esta revalidación se hizo sin reserva, con autorización de Ricardo, sin inventar una ni crear tarjeta. No hay checkpoint ni liberación que registrar.
- Pendiente del jefe: commit del padre con los punteros (ya son los finales: sin cambios de submódulos), mover la tarjeta y el pedido del GO con SHA, remotos, orden de push (hireeo-back, hireeo-front, padre), rollback y precondiciones humanas.

## 6. Logs

Respaldados fuera de los repos, sin secretos (revisados: solo rutas, nombres de pruebas y conteos): `~/.crowadvance-backups/ca204-revalidacion-2026-10-12/` (`<repo>.<paso>.log`, `.start`, `.end`, `<repo>.summary` y `run.sh`).

## 7. Nota posterior del jefe (Ricardo Soto, 2026-10-12)

Tras la revisión independiente de Benjamín, Ricardo probó lectura de los remotos para preparar la entrega: `git fetch origin` pasó en el padre (mismo `origin/main`, 18 ahead / 0 behind antes del commit documental); en backend y frontend devolvió `Repository not found` (128). `gh api` confirmó que el acceso actual no puede leer ambos repos (404). No se cambió ningún HEAD, credencial ni archivo de código; no hubo push/deploy. Se conserva la evidencia técnica anterior y se agrega al GO la condición de acceso y no divergencia de ambos repos, con consulta `cmv5b9vlv0000pgev2d89i8to` en CA-204. Los conteos de los subrepos siguen siendo solo los de las refs locales.
