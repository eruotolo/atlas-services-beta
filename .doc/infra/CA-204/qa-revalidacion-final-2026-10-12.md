# CA-204 — QA de la revalidación final (preparación del GO)

- **Autor:** Benjamín Torres, QA de Infraestructura. Reporto a Ricardo Soto. No ejecuté la revalidación, no tengo la tarjeta asignada y no la reclamé.
- **Fecha:** 2026-10-12, 10:50 (-03).
- **Tarjeta:** CA-204 (`cmv4wa83w000d9zev3o3t5o4v`), columna In Progress, asignada a Javier Pino. Global CA-187. No la moví.
- **Modelo:** esta revisión es Grok `grok-4.7` medium. Javier Pino ejecutó con Claude `claude-sonnet-5-5` high. Son distintos.
- **Conocimiento usado:** ninguno.
- **Veredicto:** **PREPARADO** para que Ricardo pida el nuevo GO de push y deploy. Esta revisión no aprueba la columna Test, no declara Hecho y no otorga ni sustituye el GO humano. La producción no queda validada.

## 1. Qué revisé y qué dejé fuera

Leí la tarjeta completa con `pnpm kanban ver --como "Benjamín Torres"`. Contrasté `.doc/infra/CA-204/revalidacion-final-2026-10-12.md`, `.doc/infra/CA-204/checklist-salida-produccion.md` (incluye el plan de las secciones 3 y 4) y `.doc/README.md` con el git del checkout y con los logs de `~/.crowadvance-backups/ca204-revalidacion-2026-10-12/`. CA-205 la leí con `pnpm kanban ver --tarjeta CA-205`: está en Hecho.

No corrí de nuevo type-check, test, lint, format:check ni build. No hice fetch, commit, push ni deploy. No abrí el proyecto de referencia. No toqué `AGENTS.md` ni ningún archivo distinto de este informe. La única comprobación nueva fue `pnpm exec prisma validate` en `backend/` (solo lectura del esquema): el schema es válido.

## 2. Evidencia de la pasada final

Los resúmenes del respaldo dicen exit 0 en este orden, una vez por repo. Las marcas UTC quedan dentro de la ventana 10:39–10:42 (-03) del informe de Javier (13:39–13:42 UTC).

| Repo | HEAD | Secuencia y resultado en el log |
| --- | --- | --- |
| backend | `349c35654c8437f4b53a08bb920cdf15238d1503` | type-check 0; test **832 pass, 0 fail, 0 skipped** (11,1 s); lint 272 archivos, 0 errores, 5 warnings; format:check 0; build 0 (`nest build && tsc-alias`) |
| frontend | `23292847fcd746aa0c3bdc5b06922114fff290e5` | type-check 0; test **141 pass, 0 fail, 0 skipped**; lint 498 archivos, 0 errores, 49 warnings; format:check 0; build 0, Next compiló y generó **214/214** páginas |

El padre `94805023600b893fcb3af4c338d895396216a9a7` está en `main`. Su `package.json` no declara `test`, `build` ni `type-check` (sí `dev*`, `stop`, `clean`, `db:seed`, `lint`, `format` y `format:check`, más los de `diagrama`). No hay suite propia de la raíz que esta pasada debiera haber corrido. `git ls-tree HEAD` apunta `backend` y `frontend` a esos mismos SHA, y `git submodule status` los muestra en `main` sin desfase. Los tres `origin` son solo HTTPS, sin usuario ni token en la URL:

- padre `https://github.com/eruotolo/atlas-services-beta.git`
- backend `https://github.com/hireeoapp/hireeo-back.git`
- frontend `https://github.com/hireeoapp/hireeo-front.git`

Contra las refs locales, ahead/behind es 18/0, 8/0 y 19/0, y `origin/main` es `844a065`, `fbe918e` y `d8d8fec`, igual que el informe. Esos conteos no prueban el remoto de hoy: el propio plan pide reconciliar con fetch antes de publicar. No hice ese fetch.

Backend y frontend están limpios. En los logs del respaldo no aparecen URLs con credenciales ni claves privadas. `git diff 8842ea6 HEAD -- prisma` en el backend no muestra cambios; hay 32 migraciones y la última es `20260829202220_add_rate_limit_counters`.

Los clones limpios siguen siendo los de `builds-migraciones-variables.md` (install frozen y builds anteriores, H3 corregido). Esta pasada final es del checkout. El informe conserva el límite H2: el lockfile del workspace local no es el de cada repo autónomo, y eso no equivale a validar el entorno de Vercel.

La carpeta de respaldo tiene una sola secuencia por repo (`run.sh` corta en el primer exit distinto de 0). No están ahí los logs del primer lanzamiento abortado que describe Javier. El veredicto usa solo esta secuencia completa.

## 3. CA-205 y el E2E

CA-205 está en Hecho, asignada a Tomás Vidal. La segunda revisión de Andrés Molina (2026-10-12) la aprueba sobre frontend `2329284` (0.1.53), padre `9480502` (1.5.11) y backend sin cambios en `349c356`. Esos son los HEAD de ahora. Esa revisión registra `pnpm test:e2e` completo, dos veces seguidas y sin `--no-deps`: 253 passed y 0 failed, y otra vez 253 passed y 0 failed. No repetí el E2E. La devolución anterior de Test quedó superada por esa segunda revisión, no por esta.

## 4. Documentos que verá el GO

El checklist y el informe de revalidación citan los mismos SHA, 832/832, 141/141 y el E2E 253+253. `.doc/README.md` enlaza el checklist, los informes previos, la revisión QA anterior y `revalidacion-final-2026-10-12.md`.

Quedan a la vista, y el texto no los da por cerrados:

- Condiciones humanas del deploy: punto 9 (variables de Production en Vercel, solo nombres), 10 (estado o seed acotado de la base), 11 (respaldo recuperable antes de `migrate deploy`) y 13 (revocación del token antiguo). El punto 7 (`SUBMODULES_TOKEN`) queda como pendiente de CI, no como bloqueo del deploy de Vercel.
- Riesgos: P20 (un Admin de país puede reactivar pagos), 429 de `/auth/refresh` con redirección en ciclo (el E2E usa `JWT_EXPIRES_IN=4h` y no demuestra ese flujo de producción), textos de FAQ y legales que nombran Premium, lockfiles distintos (H2) y operación pendiente (punto 19: error tracking, health check y headers del frontend; O6–O8 de Sebastián).
- Rollback: el paso 7 del plan dice promover el deployment anterior en Vercel y, si el dato no es compatible, restaurar el respaldo con autorización humana. Prisma no revierte migraciones. No propone reactivar pagos.

El plan (secciones 3 y 4) ordena backend, después frontend y después el padre, pide reconciliar remotos sin forzar el push, y dice que un commit solo documental del padre no repite los tests de las aplicaciones. La frase «todo verde» del plan está acotada a esa revalidación técnica. Los documentos dejan el GO pendiente. No dicen que el GO esté otorgado ni que la producción esté validada.

## 5. Límites y corrección documental

El árbol del padre, medido a las 10:50, ya no es solo `AGENTS.md`. También están modificados `.doc/README.md` y `.doc/infra/CA-204/checklist-salida-produccion.md`, y sin seguimiento `revalidacion-final-2026-10-12.md` más este informe. La sección 1 del informe de Javier describe el árbol de las 10:42 y por eso solo nombra `AGENTS.md`. No hace falta reescribir esa foto: este informe es la lectura posterior. En el commit documental hay que incluir el README, el checklist, la revalidación y este archivo, y dejar fuera el hunk de `AGENTS.md`.

Este archivo no está en el índice de `.doc/README.md`. No lo agregué: ese índice está fuera de lo que puedo editar. Al commit documental, Ricardo suma una viñeta junto a las otras de CA-204:

`- [CA-204: QA de la revalidación final](./infra/CA-204/qa-revalidacion-final-2026-10-12.md)`

La tarjeta sigue en In Progress. No intenté `mover`: aprobar Hecho o devolver a en-curso corresponde a la columna Test, y esta pasada es de preparación. El canal hacia Ricardo es este informe.

## 6. Qué queda

Ricardo puede pedir el GO con los SHA de la sección 2, los tres remotos, el orden backend → frontend → padre, las cuatro precondiciones humanas, el rollback y los riesgos de la sección 4. El deploy sigue esperando ese GO y esas precondiciones. Si cambia código, dependencias o configuración de las aplicaciones, la revalidación técnica deja de servir y hay que repetirla.

## 7. Adenda posterior de Ricardo Soto

El veredicto de Benjamín arriba corresponde a su revisión previa al fetch del jefe. Después, Ricardo confirmó lectura del padre, pero backend/frontend devolvieron `Repository not found` y `gh api` devolvió 404. Esta adenda no atribuye a Benjamín una nueva revisión: registra una quinta condición de publicación, acceso y reconciliación de ambos remotos, y la consulta `cmv5b9vlv0000pgev2d89i8to`. README ya indexa este informe. No se publica mientras esta condición y las anteriores sigan pendientes, incluso si llega el GO. El cambio de ventana UTC de §2 corrige la conversión horaria documental; no cambia los logs.
