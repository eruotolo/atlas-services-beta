# CA-204 — Seguridad, pagos deshabilitados y operación

- **Autor:** Sebastián Lagos (SRE, Infraestructura)
- **Fecha:** 2026-10-12, 03:56–04:01 (-03)
- **Tarjeta:** CA-204 (`cmv4wa83w000d9zev3o3t5o4v`), asignada a Javier Pino
- **Estado de los repos:** padre `8a89b4d`, backend `8842ea6`, frontend `2ee656b` (main, sin cambios de código míos)
- **Alcance:** solo verificación. No se cambió código. No se copia ningún valor de secreto: se citan nombre de variable, archivo y commit.

Estados: **OK** = cumple · **BLOQUEA** = impide salir a producción según el criterio 6 / la decisión de Edgardo del 2026-10-12 · **PENDIENTE** = brecha que hay que resolver o aceptar explícitamente, pero no bloquea por sí sola.

## 1. Checklist

### 1.1 Secretos

| # | Punto | Estado | Evidencia (comando · fecha/hora) |
|---|---|---|---|
| S1 | Ningún `.env` real versionado (padre, backend, frontend) | OK | `git ls-files` y `git log --all --diff-filter=A --name-only` por repo · 03:57. Solo hay `.env.example` versionados (`/.env.example`, `backend/.env.example`, `frontend/.env.example`, `appmobile/.env.example`). Nunca se agregó un `.env` real, `.pem`, `.key`, `.p12` ni service account. |
| S2 | `.env` locales ignorados | OK | `git check-ignore` · 04:00: `.env`, `backend/.env` y `frontend/.env.local` dan ignorados. `.gitignore` del padre: `.env`, `.env*.local`, `.env.production*`, `*.pem`. Backend: `.env*`. Frontend: `.env`, `.env.*.local`, `.env.production*`, `*.pem`, `frontend_env.json`. |
| S3 | Historial sin claves reales (Stripe, MercadoPago, Google, AWS, GitHub, Slack, Brevo, Vercel, JWT, llaves privadas, URLs de Postgres con password) | OK | `git log --all -p` + regex de patrones de proveedor, por repo · 03:57 (no hay gitleaks ni trufflehog instalados). Los hallazgos son todos sintéticos o placeholders: `backend/src/modules/integrations/__fixtures__/provider-credentials.fixture.ts` (commit `1c6eb0b`, el propio archivo documenta que son datos sintéticos; valores tipo `abcdef`, `fake`, `123456`, llave PEM truncada `MIIE...`), `integration-health.service.spec.ts` (`b7b5e94`), `app-module.wiring.spec.ts` (`543bc90`, `test:…@localhost`). Las URLs de Postgres en `README.md`, `frontend/README.md`, `.doc/proyecto-hireeo.md`, `.doc/infra/infra-env-vars-y-rotacion.md` y `backend/.env.example` usan `USER`/`HOST`/`password` de placeholder. |
| S4 | `.env.example` sin valores reales | PENDIENTE | `/.env.example:10` `POSTGRES_PASSWORD` trae un literal que no es placeholder (agregado en `192ee2d`, 2026-07-28). No coincide con `.env` ni `backend/.env` actuales (comparación local sin imprimirlo · 03:59). Es solo de Docker local, pero conviene cambiarlo por un placeholder vacío y no reutilizarlo en ningún entorno. En `backend/.env.example` y `frontend/.env.example` los secretos (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`, `AUTH_SECRET`, `INTEGRATIONS_ENCRYPTION_KEY`, `INTERNAL_SERVICE_TOKEN`, `SEED_SUPERADMIN_PASSWORD_*`) están vacíos (`""`): OK. |
| S5 | `docker-compose.yml` sin credenciales literales | OK | `docker-compose.yml:22-24,61-62` usan `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}` y `${POSTGRES_DB}` · 03:59. |
| S6 | `.doc/infra/credenciales-desarrollo.md` solo con credenciales de desarrollo | OK | Lectura · 03:59. Solo lista emails de cuentas Admin por país y patrones de email del seed; no tiene contraseñas, tokens ni cuentas SuperAdmin/OAuth/reales. Remite al gestor de secretos o al seed. |
| S7 | Passwords del seed | PENDIENTE (rotar) | `backend/prisma/seed/roles-users/index.ts:21` exige `SEED_SUPERADMIN_PASSWORD` (sin fallback). `backend/prisma/seed/users/index.ts:78-86` usa una password de desarrollo fija si falta la env var y aborta con `NODE_ENV=production`. Antes de producción: no seedear las cuentas de prueba de `credenciales-desarrollo.md` en la base de producción o, si se seedean, rotar sus passwords con `SEED_*` desde el gestor de secretos. |
| S8 | Secretos de CI | OK | `.github/workflows/ci.yml:23-24` define `JWT_SECRET`/`JWT_REFRESH_SECRET` dummy con el rótulo `not-for-production`. |
| S9 | Escaneo automático de secretos | PENDIENTE | No hay gitleaks/trufflehog instalado ni un paso de secret scanning en `ci.yml`. La revisión se hizo con regex manual. |

### 1.2 Pagos deshabilitados (criterio 6, decisión de Edgardo 2026-10-12)

| # | Punto | Estado | Evidencia (comando · fecha/hora) |
|---|---|---|---|
| P1 | Default del schema | OK | `backend/prisma/schema.prisma:143` `paymentsEnabled Boolean @default(false)`. |
| P2 | Migraciones dejan todos los países en false | OK | `backend/prisma/migrations/20260824145839_disable_payments_and_add_indexes/migration.sql:2-5`: `SET DEFAULT false` + `UPDATE … SET "paymentsEnabled" = false WHERE code IN ('cl','ar','uy','es','us')`. Corre en cada deploy con `prisma migrate deploy` (`backend/vercel.json`). |
| P3 | El seed no habilita pagos | OK | `grep -rn paymentsEnabled backend/prisma/seed` · 03:59: sin resultados, así que aplica el default del schema. |
| P4 | Estado real en la DB local | OK | `docker exec hireeo-postgres psql … "select code, paymentsEnabled, active from countries"` · 03:58: `ar`, `cl`, `es`, `us`, `uy` → `paymentsEnabled = f`. Las dos migraciones de pagos están aplicadas en `_prisma_migrations`. |
| P5 | Alta de país por API | OK | `backend/src/modules/geo/geo.service.ts:175-176`: sin `?? true`, aplica `@default(false)`. |
| P6 | `POST /subscriptions` (checkout premium) rechaza | OK | `subscriptions.service.ts:257-258` `assertPaymentsEnabled(country)` → `ForbiddenException`. |
| P7 | `POST /escrow/checkout` rechaza | OK | `escrow.service.ts:89-90`. Test: `escrow.service.spec.ts:109`. |
| P8 | `POST /subscriptions/:id/mercadopago/payment` rechaza | **BLOQUEA** | `subscriptions.controller.ts:54` → `subscriptions.service.ts:318-375` (`payWithMercadoPago`) **no llama** a `assertPaymentsEnabled`. Cobra cualquier suscripción `pending` existente (por ejemplo, una creada antes de deshabilitar los pagos) sin mirar el país. |
| P9 | Webhooks de Stripe y MercadoPago rechazan o ignoran | **BLOQUEA** | `subscriptions.controller.ts:66-67` (`@Public`) → `subscriptions.service.ts:399-428` (`handleWebhook`) solo valida la firma y aplica el evento (suscripción → `level: PREMIUM`, `featured: true`, o escrow) **sin chequear** `paymentsEnabled`. El frontend lo proxea sin filtro: `frontend/src/app/api/webhooks/stripe/route.ts:33` y `frontend/src/app/api/webhooks/mercadopago/route.ts:37`. Mitigación de hecho: sin credenciales de pasarela cargadas, la firma no valida. Aun así, no cumple «los endpoints de pago rechazan por paymentsEnabled». |
| P10 | Comisión/neto (backend) | PENDIENTE | `subscriptions.service.ts:165-178` (`findAllPaginated`, solo Admin) y `:198` (`sumCompletedNetIncome`) devuelven `gatewayFee`/`netAmount` sin mirar `paymentsEnabled`. Con pagos apagados no hay cobros, así que vuelven vacíos. Es un listado de admin, no un endpoint de cobro. |
| P11 | `GET /prices` público | PENDIENTE | `prices.controller.ts:28-29` (`@Public`) devuelve los precios premium aunque el país tenga los pagos apagados. Hoy el frontend no los muestra (P13), pero la API los expone. |
| P12 | Tests de backend | OK, con brecha | `node --test … geo.service.spec.ts escrow.service.spec.ts subscriptions.service.spec.ts` · 03:58: **49/49 pass**. `geo.service.spec.ts:221-237` cubre `assertPaymentsEnabled` y `escrow.service.spec.ts:109` el rechazo de escrow. **No hay test** del rechazo de `createCheckout`, `payWithMercadoPago` ni del webhook con pagos apagados. |
| P13 | Frontend: `/pricing` | OK, falla abierta | `app/(country)/[country]/(public)/pricing/page.tsx:214` muestra `PaymentsDisabledNotice` solo si `paymentsEnabled === false`. Si `getCountryConfig` falla y devuelve undefined, se muestran los planes. |
| P14 | Frontend: publicar, cotización y formulario de servicio | OK | Fallan cerrados (`=== true`): `PublicarWizard.tsx:95`, `QuoteForm.tsx:48`, `ServicioFormBase.tsx:355`, `Paso2TuOficio.tsx:463,662`. Footer: `Footer.tsx:71` (truthy). Precios del admin: `admin/premium-prices/page.tsx:28-30` (`?? false`, solo lectura). |
| P15 | Frontend: valores por defecto que fallan abiertos | **BLOQUEA** | Si falta el dato del país, se muestran premium/suscripciones/monetización: `app/(country)/[country]/(account)/profile/page.tsx:66` (`!== false`, enlaces a `/pricing` en `:158-163` y `:261-308`), `admin/page.tsx:109` (`?? true` en el estado inicial del toggle), `AdminSidebar.tsx:121` (`paymentsEnabled = true`), `UserSidebar.tsx:232` (`paymentsEnabled = true`), `CountryScopeSelector.tsx:31` (fallback `paymentsEnabled: true`). |
| P16 | Frontend: alta de país desde el panel nace con pagos **activos** | **BLOQUEA** | `features/configuration/countries/schemas/countrySchemas.ts:22` `paymentsEnabled: z.boolean().default(true)` y `CountryForm.tsx:52` `country?.paymentsEnabled ?? true`. El formulario envía `true` de forma explícita y pisa el `@default(false)` del backend. Afecta, por ejemplo, el alta futura de `py`. |
| P17 | Frontend: página de pagos del admin (neto/comisión) | **BLOQUEA** | `app/(country)/[country]/(admin)/admin/payments/page.tsx:15-40` no chequea `paymentsEnabled`. El sidebar oculta el enlace, pero entrando por URL se ven las columnas «Neto (Caja)» e ingresos netos (`PagosTable.tsx:128-130,170`). |
| P18 | Frontend: config global | OK | `app/(config)/config/payments/page.tsx:29` filtra a países con pagos. `config/premium-prices/page.tsx:18-42` queda en solo lectura si ninguno tiene pagos. |
| P19 | Tests de frontend sobre `paymentsEnabled` | PENDIENTE | `grep -rl paymentsEnabled src tests \| grep test` · 04:00: no hay tests unitarios ni guards. |
| P20 | Quién puede habilitar pagos | PENDIENTE (operativo) | `geo.controller.ts:130-143` `PATCH /geo/countries/:code/payments` con `@Roles(ADMIN, SUPER_ADMIN)`: el Admin de un país puede reactivar los pagos en producción. Si se acepta, tiene que quedar como regla operativa explícita. |
| P21 | Verificación contra la API local | PENDIENTE | `curl localhost:4000/api/health` y `localhost:3333` · 03:58 → sin respuesta: el backend y el frontend no estaban levantados. No los levanté para no interferir con CA-205 en el mismo checkout. La verificación se hizo con tests y con la DB (P4, P12). |

### 1.3 Operación

| # | Punto | Estado | Evidencia (comando · fecha/hora) |
|---|---|---|---|
| O1 | Headers de seguridad en el backend | OK | `backend/src/main.ts:36` `app.use(helmet())`. |
| O2 | CORS en el backend | OK | `main.ts:39-44`: orígenes desde `FRONTEND_URL` (lista), `credentials: true`, métodos y headers acotados. WebSocket con los mismos orígenes (`:33`). `trust proxy` solo en Vercel (`:28-30`). |
| O3 | Rate limit | OK | `app.module.ts:79-80` `ClientIpThrottlerGuard` global. `common/throttler/rate-limit.module.ts`: 10/s y 100/min. Storage en Redis (`REDIS_URL`) con fallback a Postgres (`redis-throttler.storage.ts:96`). Brecha menor: `REDIS_URL` no figura en `backend/.env.example`. |
| O4 | Validación y saneo | OK | `main.ts:59-67` `ValidationPipe` con `whitelist`/`forbidNonWhitelisted`. `SerializeInterceptor` global quita campos sensibles. `ApiKeyGuard` global (`app.module.ts:83-84`). Swagger solo fuera de producción (`main.ts:70`). |
| O5 | Logs | OK, básico | Logger de Nest (`main.ts:18`, sin `debug` en producción). Logs de eventos de pago en `subscriptions.service.ts`. No hay agregador ni log estructurado (pino/winston). En el backend queda 1 `console.*` fuera de los specs. |
| O6 | Errores y alertas | PENDIENTE | Backend: solo `PrismaExceptionFilter` global (`main.ts:53`). No hay error tracking (Sentry u otro) ni en backend ni en frontend. Frontend: hay `app/not-found.tsx`, pero **no** `error.tsx` ni `global-error.tsx`. |
| O7 | Health check | PENDIENTE | No hay un endpoint de liveness/readiness general en el backend: solo `GET /integrations/:provider/health` (salud de las integraciones, `integrations.controller.ts:40`). `curl /api/health` · 03:58 no tiene ruta definida en el código. |
| O8 | Headers de seguridad en el frontend | PENDIENTE | `frontend/next.config.ts` no tiene `headers()` ni `poweredByHeader`, y `proxy.ts` no setea CSP, X-Frame-Options ni X-Content-Type-Options (`grep` · 04:00). Queda solo lo que agregue Vercel (HSTS en dominios `*.vercel.app`). |
| O9 | Migraciones en el deploy | OK | `backend/vercel.json` `buildCommand: prisma migrate deploy && pnpm run build`. Documentado en `.doc/arquitectura/arquitectura-repos-deploy.md:82-87`. |
| O10 | Backups y rollback de la base | PENDIENTE | No hay en el repo ni en `.doc/` un procedimiento de backup, restore o rollback de la base de producción. Las migraciones se aplican automáticamente en cada deploy sin un backup previo. `infra-env-vars-y-rotacion.md:226` solo menciona `pg_dump/restore` para migrar datos. El rollback de código sí existe a nivel de repos (puntero de submódulos en el global, `arquitectura-repos-deploy.md:26`). |
| O11 | Entorno local (contexto CA-184) | Informativo | `hireeo-postgres` publica `5435` y `backend/.env` ya apunta a `localhost:5435` (`docker ps` + grep del host, sin valores · 03:58). |

## 2. Bloqueos (los corrige Desarrollo vía la global; no se cambió código)

1. **P8:** `backend/src/modules/subscriptions/subscriptions.service.ts:318` — `payWithMercadoPago` no llama a `this.geo.assertPaymentsEnabled(country)` (endpoint `subscriptions.controller.ts:54`).
2. **P9:** `backend/src/modules/subscriptions/subscriptions.service.ts:399` — `handleWebhook` aplica eventos de suscripción y escrow sin chequear `paymentsEnabled` del país `ctx.countryCode` (endpoint `subscriptions.controller.ts:66`; proxies `frontend/src/app/api/webhooks/stripe/route.ts:33` y `.../mercadopago/route.ts:37`).
3. **P16:** `frontend/src/features/configuration/countries/schemas/countrySchemas.ts:22` y `components/CountryForm/CountryForm.tsx:52` — un país nuevo nace con `paymentsEnabled: true`.
4. **P15:** valores por defecto que fallan abiertos (muestran premium/monetización si falta el dato): `app/(country)/[country]/(account)/profile/page.tsx:66`, `app/(country)/[country]/(admin)/admin/page.tsx:109`, `features/admin/components/AdminSidebar/AdminSidebar.tsx:121`, `features/users/components/account/UserSidebar/UserSidebar.tsx:232`, `features/admin/components/CountryScopeSelector/CountryScopeSelector.tsx:31`. También `/pricing` (`pricing/page.tsx:214`) si falla `getCountryConfig`.
5. **P17:** `frontend/src/app/(country)/[country]/(admin)/admin/payments/page.tsx:15` — la página de pagos (neto/caja) no está protegida por `paymentsEnabled` y se puede abrir por URL.

## 3. Pendientes no bloqueantes (decidir o aceptar)

- S4: reemplazar el literal de `POSTGRES_PASSWORD` en `/.env.example:10` por un placeholder.
- S7: rotar o no seedear en producción las cuentas de prueba (`SEED_*`).
- S9: agregar secret scanning (gitleaks) en CI.
- P10/P11: neto/comisión en el listado admin y `GET /prices` público sin filtro por `paymentsEnabled`.
- P12/P19: tests del rechazo con pagos apagados en `createCheckout`, `payWithMercadoPago` y el webhook, y tests de frontend.
- P20: el Admin del país puede reactivar los pagos (`geo.controller.ts:130`).
- P21: repetir la verificación contra la API levantada cuando CA-205 libere el entorno.
- O3: documentar `REDIS_URL` en `backend/.env.example`.
- O6/O7/O8/O10: error tracking, `error.tsx`/`global-error.tsx`, health check general, headers de seguridad del frontend, y procedimiento de backup/rollback de la base antes de `migrate deploy`.
