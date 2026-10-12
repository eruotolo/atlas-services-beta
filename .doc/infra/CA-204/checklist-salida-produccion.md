# CA-204 — Checklist de salida a producción de hireeo

> Responsable: Ricardo Soto (Jefe de Infraestructura). Tarjeta CA-204, global CA-187; Desarrollo colabora en CA-205.
> Fecha: 2026-10-12. Revisión base: padre `8a89b4d`, backend `8842ea6`, frontend `2ee656b` (main). **Revalidación final (2026-10-12, Javier Pino):** padre `94805023600b893fcb3af4c338d895396216a9a7`, backend `349c35654c8437f4b53a08bb920cdf15238d1503`, frontend `23292847fcd746aa0c3bdc5b06922114fff290e5`; detalle en [revalidacion-final-2026-10-12.md](./revalidacion-final-2026-10-12.md).
> Evidencia detallada: [builds-migraciones-variables.md](./builds-migraciones-variables.md) (Javier Pino) y [seguridad-pagos-operacion.md](./seguridad-pagos-operacion.md) (Sebastián Lagos).
> Nadie hace push ni deploy sin el GO de Edgardo (AGENTS.md 2.4). Este documento cita solo nombres de variables, nunca valores.

Estados: **OK** cumple · **BLOQUEA** impide salir · **PENDIENTE** brecha a resolver o aceptar · **EDGARDO** requiere acceso o decisión humana.

## 1. Checklist

| # | Punto | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Build y tests del backend (checkout final; clon limpio en revisión anterior) | OK (revalidado) | HEAD `349c356…`: `type-check`, `test` (832/832), `lint` (0 errores, 5 warnings), `format:check` y `build` con exit 0 (Revalidación final §2; antes 824 → 831) |
| 2 | Type-check, lint, tests y build del frontend (checkout final; clon limpio en revisión anterior) | OK (revalidado) | HEAD `2329284…`: `type-check`, `test` (141/141, guards incluidos), `lint` (0 errores, 49 warnings), `format:check` y `build` (Next 16.3.3, 214/214 páginas) con exit 0 (Revalidación final §2). El fallo de guards de antes ya no existe |
| 3 | Migraciones Prisma coherentes con `schema.prisma` | OK (revalidado) | 32 migraciones; CA-205 no tocó `prisma/` (`git diff 8842ea6 HEAD -- prisma` vacío), `prisma validate` OK; `migrate diff` sin diferencias y base local al día (Javier §2, 4a–4d). Variables solo por nombre (Revalidación final §4) |
| 4 | Migraciones en el deploy con conexión directa | OK (corregido) | `backend/prisma.config.ts` usa `DIRECT_DATABASE_URL ?? DATABASE_URL`; validado con y sin la variable (Javier §9, B4) |
| 5 | Install reproducible en Vercel | OK (corregido) | `frontend/vercel.json` con `--frozen-lockfile`, probado en clon limpio (H3) |
| 6 | CI del padre (`ci.yml`) | OK parcial (corregido) | B1 versión de pnpm y B3 biome corregidos, lint del backend agregado, YAML válido. El CI no gobierna los deploys: Vercel despliega desde `hireeo-back` y `hireeo-front` |
| 7 | CI con submódulos (B2) | EDGARDO | Falta el secreto `SUBMODULES_TOKEN` con lectura de los repos de `hireeoapp`; sin él, `submodules: recursive` rompe el checkout |
| 8 | Matriz de variables por entorno | OK | Javier §5 (solo nombres); docs `.doc/infra/infra-env-vars-y-rotacion.md` y `arquitectura-repos-deploy.md` §4–§5 actualizadas |
| 9 | Variables cargadas en Vercel Production (B6, B7) | EDGARDO | `hireeo-back`: `DATABASE_URL`, `DIRECT_DATABASE_URL` (sin pooler, nunca vacía), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`, `INTERNAL_SERVICE_TOKEN`, `INTEGRATIONS_ENCRYPTION_KEY`, `FRONTEND_URL`. `hireeo-front`: `NEXT_PUBLIC_API_URL` (antes del build: si falta cae a localhost), `NEXT_PUBLIC_APP_URL`, `API_KEY`, `INTERNAL_SERVICE_TOKEN`, `AUTH_SECRET`, `NEXTAUTH_URL`. Preview con base propia, no la de producción |
| 10 | Estado y seed de la base de producción (B5) | EDGARDO | El deploy aplica migraciones pero no siembra; `pnpm db:seed` crea también usuarios y datos de prueba. Confirmar que la base de producción ya tiene países, roles y categorías, o definir el seed acotado |
| 11 | Respaldo de la base de producción antes de `migrate deploy` (O10) | EDGARDO | No hay procedimiento de backup/rollback en el repo; Prisma no revierte migraciones |
| 12 | Secretos fuera del repositorio | OK | Sin `.env` reales ni claves en archivos ni historial de los tres repos (Sebastián S1–S3, S5, S6, S8) |
| 13 | Token antiguo de los remotes | EDGARDO | Los remotes ya no llevan token embebido (H8); falta confirmar que el token anterior fue revocado |
| 14 | Pagos deshabilitados en datos (5 países) | OK | `paymentsEnabled @default(false)`, migración que los deja en false, seed sin habilitarlos, base local en false (Sebastián P1–P5) |
| 15 | Endpoints de pago rechazan con pagos deshabilitados | OK (CA-205 en Hecho) | Backend `00da5c8` y `349c356`: `payWithMercadoPago`, el webhook de pasarela (tras validar la firma) y la lectura de tarifas rechazan por `assertPaymentsEnabled`; `createCheckout` y escrow ya lo hacían. 832 pruebas de backend en verde hoy; `payments-disabled.spec.ts` (e2e): `/prices?countryCode=` 403 en los 5 países, `POST /subscriptions` 403 (evidencia original de CA-205) |
| 16 | Frontend sin precios, premium, suscripciones, neto ni comisión | OK (CA-205 en Hecho) | Frontend `e4f992c` y `8aa8083`: helper fail-closed (`arePaymentsEnabled`, `usePaymentsEnabled`, `PaymentsGate`), país nuevo nace con pagos apagados, `/admin/payments` y `premium-prices` (país y `/config`) devuelven 404. 141 pruebas en verde hoy; e2e `payments-disabled.spec.ts` sin precios, Pro ni checkout en los 5 países (evidencia original de CA-205) |
| 17 | E2E de `.doc/testingqa/` en verde e incidencias de `.doc/tareaspendientes/` | OK (CA-205 en Hecho) | E2E completo, QA Andrés Molina: corrida 1 y corrida 2 seguidas, **253 passed, 0 failed** cada una, sobre frontend `2329284…` y backend `349c356…`, que son los HEAD actuales (no se repite). Incidencias: INC-008 corregida, INC-019 mitigada (decisión), INC-021/Países verificados, E2E-PUB-013 sin objeto por pagos, el resto resuelto (decisiones de CA-205) |
| 18 | Operación: helmet, CORS, rate limit, validación | OK | Sebastián O1–O4 |
| 19 | Operación: error tracking, health check, headers del frontend | PENDIENTE (aceptar o planificar) | Sebastián O6–O8; no bloquean la salida, no se inventan requisitos nuevos |

## 2. Bloqueos para el deploy

1. **CA-205 (Desarrollo): cerrado.** Puntos 15, 16 y 17 en OK con CA-205 en Hecho y revalidados hoy. Fuera de alcance, ya registrados por CA-205: el Admin de país puede reactivar pagos (P20), textos de FAQ y legales que nombran Premium, y los 429 de `/auth/refresh`.
2. **Edgardo (acceso o decisión humana):** puntos 9, 10, 11 y 13. El punto 7 no bloquea el deploy.
3. **Acceso a remotos (hallazgo posterior de Ricardo, 2026-10-12):** `git fetch origin` del padre pasó y confirmó 18 ahead / 0 behind antes del commit documental. Backend y frontend respondieron `Repository not found` (exit 128), y `gh api repos/hireeoapp/hireeo-back` y `hireeo-front` respondieron 404. Puede ser falta de permisos o URLs cambiadas; no prueba que se hayan borrado. Consulta en CA-204 `cmv5b9vlv0000pgev2d89i8to`: confirmar URLs y configurar acceso local sin compartir secretos. No se publica hasta que ambos remotos sean accesibles y estén reconciliados.

## 3. Plan de push y deploy (solo tras el GO de Edgardo)

Entrega de aplicaciones revalidada: backend `349c35654c8437f4b53a08bb920cdf15238d1503` → `https://github.com/hireeoapp/hireeo-back.git`; frontend `23292847fcd746aa0c3bdc5b06922114fff290e5` → `https://github.com/hireeoapp/hireeo-front.git`; padre base `94805023600b893fcb3af4c338d895396216a9a7` → `https://github.com/eruotolo/atlas-services-beta.git`. Los punteros ya coinciden. El SHA del commit documental posterior del padre se registra en la tarjeta antes del nuevo GO; no cambia las aplicaciones.

1. Verificar en la tarjeta el GO humano de categoría deploy y su alcance exacto; elevar el pedido por Gerencia no lo autoriza. Revalidado el 2026-10-12 con CA-205 en Hecho: todo verde. Si cambia código, dependencias o configuración de las aplicaciones, revalidar y actualizar el alcance antes de publicar; un commit solo documental del padre no requiere repetir sus tests.
2. Antes del primer push (dispara Vercel): confirmar en el tablero variables de Production (punto 9), estado o seed acotado de la base (10), respaldo recuperable previo a migraciones (11) y revocación del token antiguo (13). No ejecutar `db:seed` general en producción. Comprobar pagos apagados para cl/ar/uy/es/us; no cargar tarifas de Stripe/MercadoPago. Preview usa otra base.
3. Resolver la quinta precondición: acceso a los dos repos `hireeoapp` y reconciliación de remotos y ramas con lectura/fetch antes de publicar. El padre fue verificado hoy; los conteos ahead de backend/frontend aún usan refs locales del 2026-09-23 porque el acceso falló. Si hay divergencia o no hay acceso, detener y volver a Gerencia; nunca forzar un push.
4. Push de `main` a `origin` de `hireeo-back` primero: Vercel corre `prisma migrate deploy` con `DIRECT_DATABASE_URL` y construye. Identificar deployment anterior y respaldo para rollback antes del push. Esperar build y runtime correctos en `api.hireeo.app`; promover si no se auto-promueve. Si falla, no continuar con frontend.
5. Push de `main` a `origin` de `hireeo-front` después; esperar el deployment y comprobar `hireeo.app`/`www.hireeo.app`. Luego push de `main` a `origin` del padre con los punteros exactos. Mobile no forma parte de este pedido.
6. Seguir CI del padre cuando esté habilitado y guardar evidencia; `SUBMODULES_TOKEN` es pendiente de CI, no autoriza ni bloquea los deployments autónomos. Prueba de humo posterior: home, login, lectura de un dato y pagos deshabilitados en los cinco países (sin precios, premium, neto/comisión ni checkout; endpoints rechazan). Registrar URLs/ids de deployments y resultado sin secretos.
7. Rollback: detener la secuencia y volver a promover deployments anteriores de backend y frontend en Vercel. Prisma no revierte migraciones: ante incompatibilidad de datos, coordinar restauración del respaldo recuperable del paso 2 con interrupción controlada de escrituras; restaurar datos de producción también requiere autorización humana. No reactivar pagos como solución.

## 4. Riesgos conocidos que debe ver el GO

- CA-205 registró P20: un Admin de país puede reactivar pagos. La salida conserva pagos apagados; ese permiso existente no autoriza reactivarlos ni modifica la decisión de Edgardo. No se cambian permisos en esta preparación.
- CA-205 registró que `/auth/refresh` puede responder 429 y producir redirecciones en ciclo con token vencido. El E2E usa `JWT_EXPIRES_IN=4h`; no demuestra que ese flujo de producción esté corregido. Gerencia debe exponer esta limitación en el pedido.
- Textos de FAQ/legales todavía mencionan Premium; error tracking, health check y headers del frontend siguen pendientes (punto 19).
- Workspace local y subrepos autónomos tienen lockfiles distintos (Javier H2). Los builds finales son locales; Vercel y los datos reales de producción solo se validan después del GO y de las precondiciones.
- Ninguno de estos pendientes se borra por el verde técnico ni por la aprobación de calidad. El nuevo GO debe considerar los riesgos y confirmar las condiciones previas.
