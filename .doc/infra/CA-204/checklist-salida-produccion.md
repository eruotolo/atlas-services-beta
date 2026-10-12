# CA-204 — Checklist de salida a producción de hireeo

> Responsable: Ricardo Soto (Jefe de Infraestructura). Tarjeta CA-204, global CA-187; Desarrollo colabora en CA-205.
> Fecha: 2026-10-12. Revisión base: padre `8a89b4d`, backend `8842ea6`, frontend `2ee656b` (main).
> Evidencia detallada: [builds-migraciones-variables.md](./builds-migraciones-variables.md) (Javier Pino) y [seguridad-pagos-operacion.md](./seguridad-pagos-operacion.md) (Sebastián Lagos).
> Nadie hace push ni deploy sin el GO de Edgardo (AGENTS.md 2.4). Este documento cita solo nombres de variables, nunca valores.

Estados: **OK** cumple · **BLOQUEA** impide salir · **PENDIENTE** brecha a resolver o aceptar · **EDGARDO** requiere acceso o decisión humana.

## 1. Checklist

| # | Punto | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Build y tests del backend (checkout y clon limpio como Vercel) | OK | 824 → 831 tests en verde, `build` y `lint` sin errores (Javier §2 y §9) |
| 2 | Type-check, lint, tests y build del frontend (checkout y clon limpio sin `.env`) | OK | 130 tests, build Next 16.3.3 con 214 páginas (Javier §2). El test de guards falla hoy por cambios sin commitear de CA-205: se revalida al cerrar CA-205 |
| 3 | Migraciones Prisma coherentes con `schema.prisma` | OK | 32 migraciones; `migrate diff` sin diferencias; base local al día (Javier §2, 4a–4d) |
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
| 15 | Endpoints de pago rechazan con pagos deshabilitados | BLOQUEA → CA-205 | `payWithMercadoPago` y `handleWebhook` sin `assertPaymentsEnabled` (P8, P9). Derivado a Desarrollo por la global CA-187 |
| 16 | Frontend sin precios, premium, suscripciones, neto ni comisión | BLOQUEA → CA-205 | Alta de país con pagos activos (P16), defaults que fallan abiertos (P15), `/admin/payments` sin guard (P17). Derivado a CA-205 |
| 17 | E2E de `.doc/testingqa/` en verde e incidencias de `.doc/tareaspendientes/` | PENDIENTE → CA-205 | Criterios 1 y 2 de la tarjeta, a cargo de Desarrollo |
| 18 | Operación: helmet, CORS, rate limit, validación | OK | Sebastián O1–O4 |
| 19 | Operación: error tracking, health check, headers del frontend | PENDIENTE (aceptar o planificar) | Sebastián O6–O8; no bloquean la salida, no se inventan requisitos nuevos |

## 2. Bloqueos para el deploy

1. **CA-205 (Desarrollo):** puntos 15, 16 y 17. El push y el deploy no se ejecutan hasta que CA-205 esté en Hecho, aunque llegue el GO.
2. **Edgardo (acceso o decisión humana):** puntos 9, 10, 11 y 13. El punto 7 no bloquea el deploy.

## 3. Plan de push y deploy (solo tras el GO de Edgardo)

1. Con CA-205 en Hecho, revalidar en el checkout: backend `build`, `test`, `lint`; frontend `type-check`, `test`, `lint`, `build`.
2. Respaldo de la base de producción (punto 11).
3. Push a `main` de `hireeo-back`: Vercel corre `prisma migrate deploy` con `DIRECT_DATABASE_URL` y construye. Verificar el deployment y que `api.hireeo.app` lo sirva (promover si no se auto-promueve).
4. Push a `main` de `hireeo-front` y verificar el sitio.
5. Push del padre con los punteros de los submódulos.
6. Comprobación posterior: un país con pagos deshabilitados no muestra precios ni acepta cobros.
7. Rollback: volver a promover el deployment anterior en Vercel; la base se restaura desde el respaldo del paso 2.
