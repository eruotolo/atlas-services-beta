# CA-204 — Builds, migraciones, variables por entorno y CI

> Autor: Javier Pino (Infraestructura). Tarjeta CA-204. Ejecutado el 2026-10-12 entre 03:56 y 04:15 (hora local).
> Revisión base: padre `8a89b4d`, backend `8842ea6`, frontend `2ee656b` (todos en `main`, sin ramas ni worktrees).
> Alcance: solo verificación. No se modificó código de producto, no hubo push, deploy, ni contacto con bases remotas.
> Seguridad: este informe cita **solo nombres** de variables y dónde viven. Ningún valor de secreto aparece aquí.

## 1. Resumen ejecutivo

| Área | Veredicto |
| --- | --- |
| Builds y tests (checkout local y clones limpios tipo Vercel) | **OK** — backend y frontend construyen y pasan sus tests |
| Migraciones Prisma | **OK** — `migrations/` reproduce exactamente `schema.prisma`; la base local está al día |
| Aplicación de migraciones en el deploy | **OK con riesgo** — corre en el `buildCommand` de Vercel; ver B4 |
| Variables por entorno | **PENDIENTE** — matriz armada; los valores cargados en Vercel no se pueden verificar sin acceso al dashboard (no se usa CLI de Vercel) |
| CI (`.github/workflows/ci.yml`) | **BLOQUEA** — tres fallos comprobados o deducidos del código de la action (B1, B2, B3) |

> **Actualización 2026-10-12 04:07–04:12 (segundo encargo):** B1, B3, B4, H3, H8 y H9 quedaron corregidos y B2 documentado como pendiente; ver la sección 9. Las secciones 2–8 describen el estado **antes** de esas correcciones.

## 2. Checklist

| # | Punto | Estado | Evidencia (comando · hora) |
| --- | --- | --- | --- |
| 1 | Reclamo de ejecución en CA-204 | OK | `pnpm kanban reclamar … --clave ca204-javier-1` · 03:57 (generación 1; la sesión es el handle de terminal de Orca porque `orca status --json` no devuelve `caller.orcaSessionId`) |
| 2 | Lectura de `arquitectura-repos-deploy.md`, `infra-env-vars-y-rotacion.md`, `vercel-multicuenta.md`, `ci.yml`, `vercel.json` y `package.json` de ambos | OK | Lectura completa · 03:57 |
| 3a | Backend: `pnpm install --frozen-lockfile` (raíz) | OK | 2 s · 03:57 |
| 3b | Backend: `pnpm --filter backend db:generate` | OK | 1 s · 03:57 (Prisma 7.9.1) |
| 3c | Backend: `pnpm --filter backend build` | OK | 4 s (incremental) · 03:57 |
| 3d | Backend: `pnpm --filter backend test` con el entorno mínimo del CI (`env -i`) | OK | 824 tests, 824 pass, 0 fail, 11 s · 03:58 |
| 3e | Frontend: `type-check` | OK | 2 s · 03:58 |
| 3f | Frontend: `lint` | OK (49 warnings, 0 errores) | 1 s · 03:58. Tipos: noUnusedVariables 6, noUnusedImports 3, noExcessiveCognitiveComplexity 3, noExplicitAny 2, noNonNullAssertion 2, otros 4; 29 más no listados por el límite de diagnósticos |
| 3g | Frontend: `test` (incluye `tests/guards/`) | OK | 130 tests, 130 pass, 1 s · 03:58. `pnpm check:guards`: «guards OK: 711 known violation(s), none new» (línea base, ver H6) |
| 3h | Frontend: `build` (Next 16.3.3, Turbopack, 214 páginas) | OK | 10 s · 03:58 (ver H5: ruido de errores durante el prerender) |
| 3i | Clon limpio del backend como lo recibe Vercel: install frozen (pnpm 9.15.9), `build`, 824 tests | OK | install 62 s, build 5 s, test 10 s · 04:00 |
| 3j | Clon limpio del frontend sin ningún `.env`: `pnpm install --no-frozen-lockfile` (el de `vercel.json`) y `build` | OK | install 3 s, build 15 s · 04:01. El lockfile no cambió; `--frozen-lockfile` también pasa (ver H3) |
| 3k | Clon del padre con submódulos, instalación como la hace el CI: backend install/build/824 tests y frontend install/type-check/130 tests | OK | 04:02 |
| 4a | `prisma validate` | OK | «The schema at prisma/schema.prisma is valid» · 04:01 |
| 4b | `prisma migrate status` (base local, `localhost:5435`) | OK | 32 migraciones, «Database schema is up to date» · 04:01 |
| 4c | `prisma migrate diff` migraciones → schema (base sombra local temporal, ya eliminada) | OK | «No difference detected», exit 0 · 04:01 |
| 4d | `prisma migrate diff` base local → schema | OK | «No difference detected», exit 0 · 04:01 |
| 4e | Comando de migración del deploy documentado | OK con riesgo | Ver sección 4 y B4 |
| 5 | Matriz de variables por entorno (solo nombres) | OK (matriz) / PENDIENTE (carga real en Vercel) | Sección 5 |
| 5b | Desajuste local 5433/5435 e `INTERNAL_SERVICE_TOKEN` | Ya corregido por otra sesión | Ver H1; no hizo falta tocar ningún `.env` |
| 6 | CI cubre build, tests, guards y clona bien los submódulos | **BLOQUEA** | Sección 6 (B1, B2, B3) |

## 3. Bloqueos y riesgos para salir a producción

### Bloqueantes

- **B1 — El CI falla en el primer paso (pnpm).** `ci.yml` usa `pnpm/action-setup@v4` con `version: 10` (en los dos jobs), pero el `package.json` de la raíz declara `packageManager: pnpm@10.33.2`. El código de la action (`src/install-pnpm/run.ts`, v4) lanza «Multiple versions of pnpm specified» cuando `packageManager.replace('pnpm@','') !== version`; «10» ≠ «10.33.2». Deducido de la fuente de la action, no ejecutado (no se lanza Actions a mano). Corrección: quitar `version: 10` del `ci.yml` y dejar que la action tome `packageManager`.
- **B2 — El CI no trae el código de backend ni de frontend.** `actions/checkout@v4` se usa sin `submodules:`; `backend/` y `frontend/` son submódulos y quedan vacíos (comprobado clonando el padre: ambos directorios vacíos). Con `working-directory: backend|frontend` los jobs fallan. Además, `hireeo-back` y `hireeo-front` viven en la organización `hireeoapp` y el padre en `eruotolo`: el `GITHUB_TOKEN` por defecto no puede leer esos repos si son privados; hace falta un token con lectura (secreto del repositorio) o una deploy key. Corrección: `submodules: recursive` (o `submodules: true` y excluir `appmobile`) más `token:`/`ssh-key:` con el secreto adecuado.
- **B3 — El paso de lint del frontend falla en el CI.** El script es `../node_modules/.bin/biome check src/`, pero el job instala con `working-directory: frontend`, donde existe `frontend/pnpm-workspace.yaml` (el frontend es su propia raíz de workspace) y por eso el biome de la raíz nunca se instala. Reproducido en un clon limpio del padre: `sh: ../node_modules/.bin/biome: No such file or directory`, `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL` · 04:02. Corrección posible: instalar también en la raíz antes del lint, o llamar a un biome propio del frontend. Es un cambio en `ci.yml`/`package.json`, fuera de mi alcance.

### Riesgos altos (decisión de Edgardo / Ricardo)

- **B4 — `prisma migrate deploy` usa `DATABASE_URL`, no `DIRECT_DATABASE_URL`.** `backend/prisma.config.ts` define `datasource.url` con `process.env.DATABASE_URL`. `DIRECT_DATABASE_URL` figura en la doc como «usada por migraciones» y está declarada en `env.validation.ts`, pero ningún código la lee. El `.env.production` local (archivo no versionado) apunta a un host de Neon con sufijo `-pooler`. Migrar a través de un pooler PgBouncer puede colgarse o fallar por los advisory locks de Prisma Migrate. Si en Vercel `DATABASE_URL` es la URL con pooler, el primer deploy puede romperse en el `buildCommand`. Corrección sugerida: que `prisma.config.ts` use `DIRECT_DATABASE_URL ?? DATABASE_URL`, o cargar en Vercel un `DATABASE_URL` directo solo para build. No lo toqué (archivo de configuración; la regla del proyecto pide solicitud explícita).
- **B5 — No hay un paso definido (ni seguro) para sembrar la base de producción.** El deploy aplica migraciones pero no siembra: tras el primer `migrate deploy` la base queda sin países, roles, categorías ni precios. El único comando disponible (`pnpm db:seed`) ejecuta también `seedCountryUsers` (1 admin, 2 profesionales y 2 clientes por país) y `seedTestData` (servicios de prueba). `seedCountryUsers` exige contraseñas por variable cuando `NODE_ENV=production`, pero `prisma/seed/test-data.ts` no tiene guarda de producción, y `load-env.ts` solo lee `backend/.env.local`. Antes del GO hace falta decidir y documentar un seed de producción acotado (geo, roles, SuperAdmin, categorías) sin datos de prueba. Seed de precios: lo revisa Sebastián Lagos junto con «pagos deshabilitados».
- **B6 — `NEXT_PUBLIC_API_URL` ausente en producción cae en silencio a `http://localhost:4000/api/v1`.** Está en `src/lib/api/apiBaseUrl.ts`. Si la variable falta en `hireeo-front`, el build pasa (comprobado: el build sin `.env` funciona) y la app queda rota en runtime sin error visible. `NEXT_PUBLIC_*` se incrusta en el build: hay que cargarla en Vercel **antes** del build de producción.
- **B7 — Variables de Vercel sin verificar.** No se consultó el dashboard ni el CLI de Vercel (prohibido en esta tarjeta). La tabla de la sección 5 es lo que debe existir; falta que alguien con acceso confirme que está cargado en Production y que Preview no apunta a la base de producción (ver sección 4).

## 4. Migraciones: cómo corren en el deploy

- Carpeta `backend/prisma/migrations`: 32 migraciones, de `20260316000000_init` a `20260829202220_add_rate_limit_counters`, `migration_lock.toml` con `provider = "postgresql"`. Reproducen exactamente `schema.prisma` (4c) y la base local coincide (4b, 4d).
- Dónde corre en el pipeline: `backend/vercel.json` → `buildCommand: "pnpm exec prisma migrate deploy && pnpm run build"`. Es decir, **durante el build de Vercel de `hireeo-back`**, con las variables del entorno de ese deployment. No hay paso de migración en `ci.yml`, ni en el frontend.
- Comando manual equivalente: `pnpm --filter backend db:migrate:deploy` (script `prisma migrate deploy`). No se ejecutó contra ninguna base remota.
- Consecuencias a tener presentes:
  1. **Los deployments de Preview también ejecutan `migrate deploy`** contra la `DATABASE_URL` del entorno Preview. Si Preview comparte la base de producción, un push a una rama de preview migraría producción. Confirmar que Preview tiene su propia base (o quitar `migrate deploy` del build de Preview).
  2. Si una migración falla, falla el build y Vercel no promueve: es el comportamiento deseado.
  3. No hay paso de *rollback* de migraciones; Prisma no lo tiene. Antes del primer deploy conviene un respaldo de la base de producción (acción de Edgardo, no mía).
  4. `DATABASE_URL` debe ser visible en el **build** de Vercel (variable de entorno del proyecto, no solo de runtime). Ver B4.

## 5. Matriz de variables por entorno (solo nombres)

Leyenda: **Obl.** = obligatoria; **Opc.** = opcional; **—** = no aplica / no se necesita. «Doc» = aparece en `.doc/infra/infra-env-vars-y-rotacion.md`; «Ej.» = aparece en `.env.example`.

### 5.1 Backend (proyecto Vercel `hireeo-back`)

La validación de arranque está en `backend/src/config/env.validation.ts` (verificado: el backend se niega a arrancar sin `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`, `INTEGRATIONS_ENCRYPTION_KEY` e `INTERNAL_SERVICE_TOKEN`).

| Variable | Local | CI | Preview | Producción | Dónde cargarla | Ej. | Doc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | Obl. (`backend/.env` y `.env.local`, puerto 5435) | — (build/test no la usan) | Obl. (base propia, ver §4) | Obl. + visible en el build | Vercel `hireeo-back` (Production y Preview) | Sí | Sí |
| `DIRECT_DATABASE_URL` | Opc. | — | Opc. | **Huérfana**: nada la lee (B4) | — hasta resolver B4 | Sí | Sí (dice que migrate la usa: falso) |
| `JWT_SECRET` | Obl. | placeholder en `ci.yml` | Obl. | Obl. | Vercel `hireeo-back` | Sí | Sí |
| `JWT_REFRESH_SECRET` | Obl. | placeholder en `ci.yml` | Obl. | Obl. | Vercel `hireeo-back` | Sí | Sí |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | Opc. | — | Opc. | Opc. | Vercel `hireeo-back` | Sí | Sí |
| `API_KEY` | Obl. (igual a la del frontend: verificado) | placeholder | Obl. | Obl. (igual a `API_KEY` del frontend) | Vercel `hireeo-back` **y** `hireeo-front` | Sí | Sí |
| `INTERNAL_SERVICE_TOKEN` | Obl. (igual al frontend: verificado) | placeholder | Obl. | Obl. (igual al del frontend) | Vercel `hireeo-back` **y** `hireeo-front` | Sí | Sí |
| `INTEGRATIONS_ENCRYPTION_KEY` | Obl. | placeholder | Obl. | Obl. y **no rotar** salvo emergencia (cifra la tabla `Integration`) | Vercel `hireeo-back` | Sí | Sí |
| `FRONTEND_URL` | Opc. (fallback dev) | placeholder | Obl. | **Obl.**: sin ella el backend lanza error en producción o en Vercel (`resolveFrontendUrl`). Debe incluir `https://hireeo.app,https://www.hireeo.app` | Vercel `hireeo-back` | Sí | Sí |
| `NODE_ENV` | `development` | — | Vercel lo fija | Vercel lo fija (`production`) | No cargar | Sí | Sí |
| `PORT` | 4444 local | — | — (serverless) | — (serverless) | No cargar en Vercel | Sí | Sí |
| `VERCEL` | — | — | automática | automática | No cargar | No | No |
| `REDIS_URL` | Opc. | — | Opc. | Opc. (si falta, el rate limit usa Postgres) | Vercel `hireeo-back` si se quiere Redis | **No** | **No** |
| `DATABASE_POOL_MAX` | Opc. (por defecto 5) | — | Opc. | Opc. | Vercel `hireeo-back` si se ajusta | **No** | **No** |
| `BACKEND_PUBLIC_URL` | Opc. | — | Opc. | Solo para pagos (URL de notificación de MercadoPago); con pagos deshabilitados no se necesita | Vercel `hireeo-back` al habilitar pagos | **No** | **No** |
| `SEED_SUPERADMIN_PASSWORD` | Obl. para `db:seed` | — | — | Obl. en el seed de producción | Entorno del operador, nunca en Vercel | **No** (el ejemplo lista `_EDGARDO` y `_LNUNEZ`, que el código no lee) | **No** (idem) |
| `SEED_ADMIN_PASSWORD`, `SEED_PROFESSIONAL_PASSWORD`, `SEED_CLIENT_PASSWORD` | Opc. en dev | — | — | Obl. si se ejecuta `seedCountryUsers` (ver B5) | Entorno del operador | **No** | **No** |
| Credenciales de proveedores (Cloudinary, Brevo, Gemini, Firebase, Google/Apple/Azure OAuth; Stripe/MercadoPago) | Fallback dev (`env-fallback.ts`) | — | Panel `/config/integrations` | Panel `/config/integrations` (tabla `Integration` cifrada). Con pagos deshabilitados: **no cargar Stripe ni MercadoPago** | Panel de Integraciones, **no** variables de Vercel | Aviso en el ejemplo | Sí (§1.3 y §1.4) |

Variables en archivos locales que el código **no lee** (limpiar): `WEBHOOK_SECRET` (pura, sin prefijo) y `APPLE_CLIENT_ID` en `backend/.env`/`.env.production`; la doc `arquitectura-repos-deploy.md` §4 incluso la lista entre las «críticas».

### 5.2 Frontend (proyecto Vercel `hireeo-front`)

| Variable | Local | CI | Preview | Producción | Dónde cargarla | Ej. | Doc |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Obl. (`localhost:4444`) | — (el build pasa sin ella, B6) | Obl. | **Obl.** y antes del build: se incrusta en el bundle | Vercel `hireeo-front` | Sí | Sí |
| `NEXT_PUBLIC_APP_URL` | Opc. | — | Opc. | Obl. de facto (SEO, sitemap, metadata; si falta cae a `hireeo.app`/`www.hireeo.app`, dos valores distintos en `layout.tsx` y `siteUrl.ts`) | Vercel `hireeo-front` | Sí | La doc la llama `NEXT_PUBLIC_FRONTEND_URL` |
| `NEXT_PUBLIC_APP_URL_CL`, `_AR`, `_UY`, `_ES`, `_US` | Opc. | — | Opc. | Opc. (por defecto `https://hireeo.app/<país>`) | Vercel `hireeo-front` si se cambia el dominio | **No** | **No** |
| `API_KEY` | Obl. | — | Obl. | Obl. (igual a `API_KEY` del backend); solo servidor, nunca `NEXT_PUBLIC_` | Vercel `hireeo-front` | Sí | Sí |
| `INTERNAL_SERVICE_TOKEN` | Obl. | — | Obl. | Obl. (igual al del backend) | Vercel `hireeo-front` | Sí | Sí |
| `AUTH_SECRET` | Obl. | — | Obl. | Obl. (la usan `auth.ts` y `proxy.ts`) | Vercel `hireeo-front` | Sí | La doc la llama `NEXTAUTH_SECRET` (el código no la lee) |
| `NEXTAUTH_URL` | Obl. local | — | Vercel la infiere en preview | Obl. (`https://hireeo.app` o el dominio canónico) | Vercel `hireeo-front` | Sí | Sí |
| `REVALIDATE_SECRET` | Opc. | — | Opc. | Obl. si se usa `/api/revalidate` (sin ella el endpoint responde 401 siempre) | Vercel `hireeo-front` | **No** | **No** |
| `CONTACT_EMAIL` | Opc. | — | Opc. | Opc. (por defecto `info@hireeo.app`) | Vercel `hireeo-front` | **No** | **No** |
| `INTERNAL_API_URL` | Opc. (Docker) | — | — | No cargar en Vercel | — | **No** | **No** |
| `GOOGLE_CLIENT_ID/SECRET`, `APPLE_ID/SECRET`, `AZURE_AD_*` | Fallback dev | — | Panel de Integraciones | Panel de Integraciones; `oauth-availability.ts` aún las consulta | Panel; Vercel solo si se mantiene el respaldo | No (nota en el ejemplo) | Sí |
| `NODE_ENV`, `NEXT_TELEMETRY_DISABLED`, `CI`, `PLAYWRIGHT_TEST_BASE_URL` | — | `NEXT_TELEMETRY_DISABLED` en `ci.yml` | — | — | No cargar | — | — |

Variables locales sin uso en el código del frontend (`frontend/.env.local`): `NEXT_PUBLIC_API_KEY`, `AUTH_URL`, `NEXT_PUBLIC_MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`, `BREVO_*`, `NEXT_PUBLIC_CLOUDINARY_*`, `CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`. `NEXT_PUBLIC_API_KEY` también figura en `.env.production` local y en la doc de arquitectura como «debe coincidir con `API_KEY`»: **no se debe cargar** en Vercel (el prefijo `NEXT_PUBLIC_` la expondría al navegador si algún día se referencia).

### 5.3 Qué debe existir en `hireeo-back` / `hireeo-front` para el primer deploy

- **hireeo-back (Production):** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`, `INTERNAL_SERVICE_TOKEN`, `INTEGRATIONS_ENCRYPTION_KEY`, `FRONTEND_URL`.
- **hireeo-front (Production):** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`, `API_KEY`, `INTERNAL_SERVICE_TOKEN`, `AUTH_SECRET`, `NEXTAUTH_URL`; `REVALIDATE_SECRET` si se usa la revalidación.
- **Panel de Integraciones (después del primer deploy):** Cloudinary, Brevo y el resto de proveedores que se usen; ni Stripe ni MercadoPago (decisión del 2026-10-12).

## 6. CI (`.github/workflows/ci.yml`)

| Necesidad de la salida | Cubierto | Observación |
| --- | --- | --- |
| Build backend | Sí | `db:generate` + `build` |
| Tests backend | Sí | `pnpm --filter backend test`, 824 tests, con 5 variables mínimas |
| Lint backend | **No** | El job se llama «lint + build + tests» pero no corre lint; el script `lint` del backend usa `../node_modules/.bin/biome` |
| Type-check, lint, tests y build del frontend | Declarados | `lint` falla (B3) |
| Guards de regresión | Parcial | `pnpm test` incluye `tests/guards/*.test.ts`; `check:guards` no se ejecuta aparte |
| Validación de Prisma (`validate`, `migrate diff` contra base sombra) | **No** | Convendría un paso que detecte migraciones faltantes antes del merge |
| e2e (Playwright) | **No** | Lo cubre CA-205 localmente; en CI exigiría backend + base |
| Submódulos | **No** (B2) | Sin `submodules:`; sin credenciales para repos privados de `hireeoapp` |
| Versión de pnpm | **No** (B1) | Choque entre `version: 10` y `packageManager: pnpm@10.33.2` |
| Otros | — | Sin `timeout-minutes` ni `concurrency`; Node 22 coincide con `engines` del backend |

Los repos que Vercel despliega (`hireeo-back`, `hireeo-front`) no tienen `.github/workflows`: el CI solo existe en el padre y no gobierna los pushes a `main` de los submódulos, que son los que disparan el deploy. Un push a `hireeo-back` o `hireeo-front` despliega sin pasar por ninguna verificación.

## 7. Hallazgos adicionales (fuera de alcance o informativos)

- **H1 — Entorno local.** Al empezar (03:56) `backend/.env` ya apuntaba a `localhost:5435` (la base real del contenedor `hireeo-postgres`) y contenía `INTERNAL_SERVICE_TOKEN`; `.env` se modificó a las 03:57 y `.env.local` apareció a las 04:02, por otra sesión. `API_KEY` e `INTERNAL_SERVICE_TOKEN` coinciden entre `backend/.env` y `frontend/.env.local` (comparado por huella, sin mostrar valores). El contexto de CA-184 (5433, token ausente) quedó obsoleto. No toqué ningún `.env`. Pendientes locales: (a) hay tres lectores con convenciones distintas: Prisma CLI lee `.env`, Nest lee `.env.local` y luego `.env`, y el seed exige `.env.local`; (b) ningún archivo define `SEED_SUPERADMIN_PASSWORD` (solo `_EDGARDO`/`_LNUNEZ`), por lo que `pnpm db:seed` local abortaría con «Falta SEED_SUPERADMIN_PASSWORD»; (c) `FRONTEND_URL` local no incluye `localhost:3334`, el puerto del `dev` del frontend, aunque sí `3333`.
- **H2 — Dos lockfiles divergentes.** El repo padre tiene su `pnpm-lock.yaml` (Prisma 7.9.1 en el checkout y en el CI) y el backend su propio lockfile (Prisma 7.8.0 en el clon limpio que usa Vercel). Lo que se prueba en el CI y en local no es exactamente lo que se despliega. Misma situación para el frontend (lockfile propio, `pnpm-workspace.yaml` propio).
- **H3 — `frontend/vercel.json` instala con `--no-frozen-lockfile`**, a diferencia del backend (`--frozen-lockfile`): permite que Vercel resuelva versiones distintas a las probadas. El frontend no declara `packageManager` ni `engines` (en el clon se usó pnpm 11.24.0 por defecto). La instalación `--frozen-lockfile` ya funciona, así que se puede igualar a la del backend.
- **H4 — Configuración del proyecto Vercel (snapshot local).** `backend/.vercel/project.json` (de 2026-06-19) dice `framework: nestjs` y `nodeVersion: 24.x`, mientras `vercel.json` fija `framework: null` y `engines.node: 22.x`. Es un snapshot local posiblemente viejo; confirmar en el dashboard.
- **H5 — Ruido en el build del frontend.** El build imprime ~123 líneas de «Dynamic server usage: Route /[country]/admin couldn't be rendered statically because it used `headers`» (capturadas por los `try/catch` de las queries de `features/users`, `services` e `interactions`). No rompen el build ni la ruta (queda dinámica ƒ), pero ensucian el log y pueden esconder errores reales. Producto.
- **H6 — Guards con línea base de 711 violaciones conocidas.** `check:guards` pasa porque no hay violaciones *nuevas*; la deuda existente no bloquea. Informativo.
- **H7 — Pinning de pnpm.** Raíz: `pnpm@10.33.2`; backend: `pnpm@9.15.9` (la doc explica que pnpm 9 ejecuta los build scripts de Prisma/bcrypt); CI: pnpm 10. La advertencia «The "pnpm" field in package.json is no longer read» aparece en los `package.json` de backend y raíz: los `overrides` de `multer` se mantienen por `pnpm-workspace.yaml` de la raíz, pero el `overrides` del `package.json` del backend no tiene efecto bajo pnpm 10.
- **H8 — Remotes.** Los `origin` de `frontend`, `backend` y del padre ya no llevan token embebido en la URL (el pendiente de `arquitectura-repos-deploy.md` §5 está resuelto en este checkout). La doc sigue marcándolo como abierto; corregirla.
- **H9 — Docs desactualizadas** (para quien mantenga `.doc/infra/`): `NEXTAUTH_SECRET`→`AUTH_SECRET`, `NEXT_PUBLIC_FRONTEND_URL`→`NEXT_PUBLIC_APP_URL`, `WEBHOOK_SECRET` y `NEXT_PUBLIC_API_KEY` no se usan, `DIRECT_DATABASE_URL` no se usa en migraciones, y faltan `REDIS_URL`, `DATABASE_POOL_MAX`, `BACKEND_PUBLIC_URL`, `REVALIDATE_SECRET`, `CONTACT_EMAIL`, `NEXT_PUBLIC_APP_URL_<CC>`, `SEED_*_PASSWORD` en `.env.example`/doc.
- **H10 — Archivo con datos de producción en el disco local.** `backend/.env.production` (no versionado, ignorado por `.gitignore`) contiene variables de conexión a la base de producción de Neon. Por seguridad no se leyó su contenido más allá de los nombres; que Sebastián Lagos lo revise junto con la rotación de credenciales.
- **H11 — Incidente menor de manejo de secretos.** Al inspeccionar `backend/.env` con un `sed` que no quitó las comillas, una credencial de la base **local de desarrollo** apareció una vez en la salida de la terminal de esta sesión. No se copió a ningún archivo, tarjeta ni este informe. Es una credencial de desarrollo local, pero se avisa por transparencia.

## 8. Qué se creó y qué se tocó

- Creado: este informe (`.doc/infra/CA-204/builds-migraciones-variables.md`). No edité `.doc/README.md` para no pisar el trabajo en paralelo de CA-205 y de Sebastián Lagos: al commitear, el jefe debe agregar la entrada de `infra/CA-204/` en `.doc/README.md` (regla de `CLAUDE.md`). Nada más en el repositorio por mi parte.
- Efectos locales reversibles ya revertidos: base sombra `ca204_shadow` creada y borrada en el contenedor local `hireeo-postgres`; clones temporales en el directorio temporal de la sesión (no en el proyecto); `pnpm install --frozen-lockfile` y los builds regeneraron `node_modules`, `dist/` y `.next/` del checkout (sin cambios en archivos versionados).
- No se ejecutó: push, deploy, CLI de Vercel, GitHub Actions, migraciones ni seed en ninguna base remota, ni `pnpm kanban archivar`.

## 9. Correcciones del segundo encargo (decisión de Ricardo Soto)

Cambios de configuración de despliegue y documentación; no se tocó código de producto ni archivos de CA-205. **Sin commit** (lo hace el jefe).

| Ítem | Estado | Cambio | Evidencia (comando · hora) |
| --- | --- | --- | --- |
| B1 | CORREGIDO | `.github/workflows/ci.yml`: se quitó `with: version: 10` de `pnpm/action-setup@v4` en los dos jobs; la action toma `packageManager: pnpm@10.33.2` de la raíz | `git diff` del archivo; YAML válido: `ruby -ryaml` carga el workflow con los jobs `backend` y `frontend` · 04:08 |
| B3 | CORREGIDO | Job `frontend`: nuevo paso «Install root tooling (biome)» con `working-directory: .` y `pnpm install --frozen-lockfile --filter .` entre la instalación del frontend y el type-check. Instala solo el importer raíz (donde vive `@biomejs/biome`) y deja intacta la instalación propia del frontend (la del lockfile de Vercel) | Clon limpio del padre (`parent2`): tras instalar solo en `frontend/`, `pnpm --filter frontend lint` → `ENOENT ../node_modules/.bin/biome`; tras el paso nuevo → «Checked 495 files … Found 49 warnings», rc 0 · 04:09. Luego `type-check`, `test` y `build` del frontend en ese orden también rc 0 |
| B3 (backend) | CORREGIDO | Job `backend`: nuevo paso «Lint backend» (`pnpm --filter backend lint`) después de instalar. Solo se agregó porque pasa con 0 errores | `pnpm --filter backend lint` → «Checked 272 files … Found 5 warnings», rc 0 · 04:10. Ese job instala desde la raíz del workspace, así que biome ya queda instalado |
| B2 | **PENDIENTE (documentado)** | No se agregó `submodules: recursive` ni `token: ${{ secrets.SUBMODULES_TOKEN }}` | Decisión abajo |
| B4 | CORREGIDO | `backend/prisma.config.ts`: `const migrationUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!` usada en `datasource.url` y en `migrate.adapter` | Ver verificación abajo |
| H3 | CORREGIDO | `frontend/vercel.json`: `installCommand` pasa a `pnpm install --frozen-lockfile` | Clon limpio de `frontend` (`front2`): `pnpm install --frozen-lockfile` rc 0, 3 s, sin cambios en el lockfile; `pnpm run build` rc 0 · 04:09 |
| H8 | CORREGIDO (doc) | `.doc/arquitectura/arquitectura-repos-deploy.md` §5: los remotes ya no llevan token embebido (`git remote -v` sin credenciales en los tres repos); la **revocación del token anterior la confirma Edgardo** | Lectura del archivo |
| H9 | CORREGIDO (doc) | `.doc/infra/infra-env-vars-y-rotacion.md` (§1.1, §1.2, §2.2) y `arquitectura-repos-deploy.md` §4: nombres reales (`AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`), sin `WEBHOOK_SECRET` ni `NEXT_PUBLIC_API_KEY`, `DIRECT_DATABASE_URL` para migraciones, y las variables que faltaban (`REDIS_URL`, `DATABASE_POOL_MAX`, `BACKEND_PUBLIC_URL`, `VERCEL`, `REVALIDATE_SECRET`, `CONTACT_EMAIL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_APP_URL_<CC>`, `SEED_*_PASSWORD`). Se corrigió además un texto corrupto en la introducción del primer documento | `git diff --stat` |
| README | HECHO | `.doc/README.md`: entrada de `infra/CA-204/builds-migraciones-variables.md` justo debajo de la de Sebastián (`seguridad-pagos-operacion.md`), que no se tocó | `sed -n 12,20p .doc/README.md` |

### B4: verificación (base local, `localhost:5435`)

- El runtime **no** depende de `prisma.config.ts`: `PrismaService` arma su propio `PrismaPg` con `DATABASE_URL` (vía `ConfigService`) y nadie importa el archivo (`grep` de `prisma.config`/`prisma/config` en `src`, `prisma`, `scripts`, `package.json`: sin resultados).
- Con `DIRECT_DATABASE_URL` definida (valor local de `backend/.env`): `prisma validate` «valid»; `prisma migrate status` → 32 migraciones, «Database schema is up to date» · 04:09.
- Sin `DIRECT_DATABASE_URL` (se apuntó `DOTENV_CONFIG_PATH` a un archivo temporal con solo `DATABASE_URL`, ya borrado): `validate` «valid»; `migrate status` «up to date» sobre `localhost:5435` · 04:09. Cae correctamente a `DATABASE_URL`.
- Precedencia: con `DIRECT_DATABASE_URL` apuntando a un puerto local inexistente (5999) Prisma intentó ese destino (`P1001 Can't reach database server at localhost:5999`): la variable directa gana.
- Nota: `??` no cae a `DATABASE_URL` si `DIRECT_DATABASE_URL` existe pero está **vacía** (`DIRECT_DATABASE_URL=`). En Vercel no se debe crear la variable vacía: o tiene la conexión directa o no se define.
- Acción pendiente para Edgardo/infra: cargar `DIRECT_DATABASE_URL` (conexión directa, sin pooler) en Vercel `hireeo-back` Production antes del primer deploy.

### B2: por qué queda pendiente

`submodules: recursive` con `token: ${{ secrets.SUBMODULES_TOKEN }}` **no es seguro sin el secreto**: si `SUBMODULES_TOKEN` no existe, la expresión da cadena vacía y el checkout se queda sin credencial; además, con `submodules: recursive` el checkout intentaría clonar los tres repos privados de `hireeoapp` (incluido `appmobile`) y falla el job entero. Hoy el CI ya falla sin los submódulos, pero cambiaría un fallo claro («directorio vacío») por otro más confuso. Queda a la espera de que **Edgardo cree el secreto `SUBMODULES_TOKEN`** (token con lectura sobre `hireeo-back`, `hireeo-front` y `hireeo-mobile`, o una deploy key). Con el secreto creado, el cambio es solo agregar a `actions/checkout@v4` de los dos jobs: `submodules: recursive` y `token: ${{ secrets.SUBMODULES_TOKEN }}` (idealmente excluyendo `appmobile`, que el CI no usa). Quedó anotado en `arquitectura-repos-deploy.md` §5.

### Verificación en orden (checkout, tras los cambios)

| Paso | Resultado | Hora |
| --- | --- | --- |
| backend `db:generate` | rc 0, 2 s | 04:10 |
| backend `build` | rc 0, 4 s | 04:10 |
| backend `test` (entorno mínimo de CI) | 831 pass, 0 fail (7 más que antes, probablemente por los specs de `prices` y `subscriptions` modificados sin commitear por otra sesión) | 04:10 |
| backend `lint` | rc 0, 0 errores, 5 warnings | 04:10 |
| frontend `type-check` | rc 0, 2 s | 04:10 |
| frontend `test` | **1 fallo de 130** — ver abajo; no relacionado con mis cambios | 04:10 |
| frontend `lint` | rc 0, 0 errores, 49 warnings | 04:10 |
| frontend `build` en el checkout | **NO ejecutado**: hay un `next-server` (v16.3.3) del frontend activo en el checkout desde las 03:59 (probablemente e2e de CA-205) y `pnpm build` ejecuta `rm -rf .next`, lo que lo rompería (regla del `CLAUDE.md`) | — |
| frontend `build` verificado en su lugar | Clon limpio del frontend (HEAD, `front2`): install frozen + `pnpm run build` rc 0; clon del padre (`parent2`): `build` rc 0 tras el paso de biome | 04:09 |
| YAML de `ci.yml` | válido (`ruby -ryaml`) | 04:08 |

**Fallo del test del frontend (hallazgo, no corregido):** `tests/guards/ratchet.test.ts` → «debt went down: run `pnpm check:guards --update`». La línea base de `hardcoded-text` bajó en `profile/page.tsx` (21 → 20) y `admin/premium-prices/page.tsx` (1 → 0) por **cambios sin commitear de otra sesión** (`git status` del frontend muestra modificados `profile/page.tsx`, `pricing/page.tsx`, `countryUtils.ts`, `CountryProvider.tsx`, `Footer.tsx` y un `paymentsEnabled.ts` nuevo). No es una regresión: el ratchet exige actualizar `baseline.json` cuando la deuda baja. Quien cierre esos cambios (CA-205/Sebastián) debe correr `pnpm check:guards --update` antes del commit; de lo contrario el CI fallará en el paso de tests. Con HEAD limpio los 130 tests pasan (clon `parent`, 04:02).

### Pendiente tras este encargo

1. **B2** (secreto `SUBMODULES_TOKEN` + `submodules: recursive`): Edgardo.
2. Cargar `DIRECT_DATABASE_URL` en Vercel `hireeo-back` (B4) y confirmar `NEXT_PUBLIC_API_URL` y el resto de la matriz de la sección 5 (B6/B7).
3. B5: definir el seed de producción acotado.
4. Confirmar la revocación del token anterior de GitHub (H8): Edgardo.
5. `baseline.json` de los guards del frontend (ver arriba) y el build del frontend en el checkout cuando no haya un servidor activo.
6. Sin resolver (no pedidos): H2 (lockfiles divergentes), H4, H5, H6, H7, H10; el CI sigue sin `prisma validate/migrate diff`, sin e2e y sin CI propio en `hireeo-back`/`hireeo-front`.
7. La ejecución de CA-204 no se pudo reclamar de nuevo con `ca204-javier-2`: `pnpm kanban reclamar` responde «La ejecución ya terminó correctamente» (la había liberado con `exito`). Se trabajó sin reserva y no hay latidos ni checkpoints de este tramo; la decisión de la tarjeta registra los cambios.
