# CA-204 — Revisión QA de infraestructura

- **Autor:** Benjamín Torres (QA de Infraestructura). No ejecuté el encargo ni tengo la tarjeta asignada.
- **Fecha:** 2026-10-12, 04:16–04:25 (-03).
- **Tarjeta:** CA-204 (`cmv4wa83w000d9zev3o3t5o4v`), In Progress, asignada a Javier Pino. No la moví ni la reclamé.
- **Veredicto:** **APROBADO**.
- **Baseline declarado por el checklist:** padre `8a89b4d`, backend `8842ea6`, frontend `2ee656b` (main). Los diffs de infraestructura siguen sin commit.
- Este informe cita solo nombres de variables. No copia valores.

## 1. Qué se revisó

1. `.doc/infra/CA-204/checklist-salida-produccion.md` contra `builds-migraciones-variables.md` (Javier Pino) y `seguridad-pagos-operacion.md` (Sebastián Lagos), y contra los criterios de aceptación de la tarjeta (`pnpm kanban ver` · 04:16).
2. Diffs de infraestructura, y solo esos: `.github/workflows/ci.yml`, `.doc/README.md`, `.doc/arquitectura/arquitectura-repos-deploy.md`, `.doc/infra/infra-env-vars-y-rotacion.md` en el padre; `backend/prisma.config.ts`; `frontend/vercel.json`. `AGENTS.md` del padre sigue modificado y no lo abrí. El resto de `backend/` y `frontend/` es de CA-205.
3. Comprobaciones independientes (sección 5). No corrí `pnpm build` en el checkout del frontend.

## 2. Criterios de aceptación

| Criterio de la tarjeta | Dónde está en el checklist | ¿Falta? |
| --- | --- | --- |
| 1. Incidencias de `.doc/tareaspendientes/` resueltas o con decisión | Punto 17, PENDIENTE → CA-205. La tarjeta ya registra que bloquean el deploy junto con CA-205. | No |
| 2. E2E de `.doc/testingqa/` en verde, con evidencia | Mismo punto 17. No afirma que estén en verde. | No |
| 3. Build, migraciones y variables por entorno | Puntos 1 a 10, con evidencia de Javier §2, §5 y §9 | No |
| 4. Checklist con evidencia y bloqueos | El propio documento y la sección 2 | No |
| 5. Pedido de GO a Edgardo; nadie publica sin él | Intro y sección 3 (plan solo tras el GO). El pedido todavía no se envía: es el paso del jefe después de esta revisión. | No como fila numerada; sí como regla y plan |
| 6. Pagos deshabilitados en todos los países | Puntos 14 (datos, OK), 15 y 16 (código, BLOQUEA → CA-205), alineados con Sebastián P1–P5, P8, P9 y P15–P17 | No |

## 3. Estados del checklist

Los 19 puntos tienen columna de evidencia. Los contrasté con los informes:

- Puntos 1 a 6 y 8 citan resultados que están en Javier §2, §9, B4 y H3 (824 tests y luego 831; 130 tests; 32 migraciones; `DIRECT_DATABASE_URL ?? DATABASE_URL`; `--frozen-lockfile`; B1 y B3). El punto 1 no repite el matiz de Javier §9: los 7 tests de más salen de specs sin commitear de otra sesión. La evidencia remite a §9, donde sí está. No lo devuelvo.
- Punto 2 declara que el test de guards falla hoy por cambios sin commitear de CA-205. Coherente con Javier §9 y con `git status` del frontend (`baseline.json` y páginas de pagos modificadas). No reejecuté esa suite.
- Puntos 7, 9, 10, 11 y 13 están en EDGARDO con la lista concreta (secreto `SUBMODULES_TOKEN`, variables por proyecto, seed, respaldo, revocación del token). Coinciden con B2, B5, B6, B7, H8 y O10.
- Punto 12 (secretos OK) cita S1–S3, S5, S6 y S8. Esos estados del informe de Sebastián son OK. Ver el hallazgo S4 en la sección 6: no está citado y el informe lo deja en PENDIENTE, no en BLOQUEA.
- Puntos 14 a 16 coinciden con P1–P5, P8, P9 y P15–P17 del informe de Sebastián, medidos sobre el baseline commiteado.
- Punto 17 no trae una corrida de e2e ni un inventario de incidencias. El estado es PENDIENTE y la evidencia es la asignación a CA-205 (criterios 1 y 2). Alcanza para no dar por cerrados esos criterios.
- Puntos 18 y 19 coinciden con O1–O4 y O6–O8. O10 quedó en el punto 11, no se perdió.

## 4. Diffs de infraestructura

| Archivo | Diff | ¿Coincide con lo declarado? |
| --- | --- | --- |
| `.github/workflows/ci.yml` | +11/−2. Se quitó `with: version: 10` de `pnpm/action-setup@v4` en los dos jobs. Job backend: paso `Lint backend` (`pnpm --filter backend lint`) después del install. Job frontend: paso `Install root tooling (biome)` con `working-directory: .` y `pnpm install --frozen-lockfile --filter .` antes del type-check. | Sí (B1, B3). B2 no se tocó: no hay `submodules:` ni `token:`. |
| `backend/prisma.config.ts` | +7/−2. `migrationUrl = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!` en `datasource.url` y en `migrate.adapter`. | Sí (B4). |
| `frontend/vercel.json` | `installCommand` pasa de `pnpm install --no-frozen-lockfile` a `pnpm install --frozen-lockfile`. | Sí (H3). |
| `.doc/arquitectura/arquitectura-repos-deploy.md` | +55/−. Quita `WEBHOOK_SECRET` y `NEXT_PUBLIC_API_KEY`. Documenta `DIRECT_DATABASE_URL`, el mismo valor de `API_KEY` e `INTERNAL_SERVICE_TOKEN` en los dos proyectos, Preview con base propia, remotes sin token embebido, `SUBMODULES_TOKEN` y el seed de producción. | Sí (H8, H9, B2, B5). |
| `.doc/infra/infra-env-vars-y-rotacion.md` | Nombres alineados al código: `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `SEED_SUPERADMIN_PASSWORD` (sin sufijo `_*`), y las opcionales que faltaban (`REDIS_URL`, `DATABASE_POOL_MAX`, `BACKEND_PUBLIC_URL`, `VERCEL`, `REVALIDATE_SECRET`, `CONTACT_EMAIL`, `INTERNAL_API_URL`, `NEXT_PUBLIC_APP_URL_<CC>`). Corrige el texto corrupto de la introducción. | Sí. Cruce puntual con el código: `apiBaseUrl.ts` cae a `http://localhost:4000/api/v1`; `roles-users/index.ts` lee `SEED_SUPERADMIN_PASSWORD`; `auth.ts` y `proxy.ts` leen `AUTH_SECRET`; `payments.service.ts` lee `BACKEND_PUBLIC_URL`. |
| `.doc/README.md` | Tres enlaces nuevos a `infra/CA-204/` (checklist, seguridad, builds). | Sí. Este informe todavía no está enlazado. |

`git status` confirma que no hay otros archivos de infraestructura en el diff. El padre tiene además `AGENTS.md` (fuera de alcance) y la carpeta sin seguimiento `.doc/infra/CA-204/`.

Comprobación local del cwd que usa el CI, sin instalar de nuevo (04:18): desde `backend/`, `pnpm root -w` es el `node_modules` del padre y `pnpm --filter backend exec` resuelve; desde `frontend/`, el workspace root es el propio frontend y `pnpm --filter frontend exec` también resuelve. El paso de biome declara `working-directory: .`, que en la sintaxis de Actions reemplaza el default del job. No ejecuté GitHub Actions.

## 5. Verificación independiente

### 5.1 YAML de `ci.yml` · 04:20:06

```
ruby -ryaml -e 'YAML.load_file(...)'
```

Resultado: carga bien. Jobs `backend` y `frontend`. La cadena `version: 10` no está. Pasos del backend: checkout, pnpm, setup-node, install, lint, generate, build, test. Pasos del frontend: checkout, pnpm, setup-node, install, install de biome en la raíz, type-check, lint, test, build.

### 5.2 Prisma · 04:20

En `backend/`, con `hireeo-postgres` ya healthy y publicado en `5435` (no reinicié nada):

```
pnpm exec prisma validate
pnpm exec prisma migrate status
```

- `validate`: «The schema at prisma/schema.prisma is valid». Exit 0.
- `migrate status`: 32 migraciones, «Database schema is up to date». El datasource que resolvió `prisma.config.ts` es PostgreSQL en `localhost:5435`. No repetí el ensayo con y sin `DIRECT_DATABASE_URL` (ya está en Javier §9) ni imprimí la URL.

### 5.3 Install frozen del frontend · después de las 04:20

Clon limpio con `git clone --local` del submódulo `frontend` a un directorio temporal fuera del proyecto (HEAD, sin el working tree). Copié encima el `vercel.json` modificado. `installCommand` quedó en `pnpm install --frozen-lockfile`. Luego:

```
pnpm install --frozen-lockfile
```

Resultado: «Lockfile is up to date», 554 paquetes reutilizados del store, exit 0, 2.8 s, pnpm 11.24.0. Borré el clon. No corrí el build. El frontend no declara `packageManager`; la misma versión ya la había anotado Javier (H3).

## 6. Secretos

Barrido por nombre de patrón (claves de proveedor, tokens, PEM, JWT, cadenas de conexión) sobre los tres informes, `ci.yml`, las dos docs de arquitectura/variables, `README.md`, `prisma.config.ts` y `vercel.json`. Sin coincidencias concretas. La única cadena de conexión está en `infra-env-vars-y-rotacion.md` y es el formato con `USER`/`PASS`/`HOST`.

`ci.yml` conserva los placeholders ya versionados del job backend (rotulados como no aptos para producción). El diff no los agrega. No los transcribo.

Hallazgo preexistente, fuera de estos diffs: `/.env.example:10`, variable `POSTGRES_PASSWORD`, valor literal de 17 caracteres que no es un placeholder conocido. Sebastián lo clasificó PENDIENTE (S4), no BLOQUEA. El punto 12 del checklist no lo menciona. No lo cambié.

## 7. Hallazgos que no devuelven el trabajo

1. **S4**, arriba. Conviene no perderlo de vista; no es una regresión de este diff.
2. **CA-205, fuera de alcance.** Sobre el HEAD commiteado, `payWithMercadoPago` no llama a `assertPaymentsEnabled` y `handleWebhook` tampoco: el checklist dice la verdad del baseline. En el working tree (diff de CA-205, no lo apruebo) `payWithMercadoPago` ya llama al guard; `handleWebhook` sigue sin llamarlo. Los puntos 15 y 16 se revalidan cuando CA-205 esté en Hecho.
3. **Criterio 5.** El pedido de GO a Edgardo no está enviado. La sección 3 lo deja como condición del push. Lo hace el jefe.
4. **README.** Falta el enlace a este informe. No edité `.doc/README.md`: la revisión no modifica los archivos bajo examen. Al commitear, hay que agregar la entrada.

## 8. Qué no hice

No reclamé la ejecución, no moví la tarjeta, no hice push, deploy, ni uso de la CLI de Vercel, ni seed, ni migraciones contra una base remota. No corrí `pnpm build` en el checkout del frontend. No toqué `AGENTS.md` ni archivos de CA-205. No archivé la tarjeta.

`pnpm kanban decision` y, por la misma regla, la evidencia quedaron sin escribir: el CLI respondió «No tienes permiso para editar este tablero». En `kanbanRules.ts`, un QA decide o carga evidencia en una tarjeta de su sector solo si está asignada a él o si la tarjeta está en Test. Esta está In Progress y asignada a Javier Pino. No la pasé a Test. El veredicto queda en este informe para que el jefe lo registre.
