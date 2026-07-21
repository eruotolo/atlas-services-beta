# Auditoría Backend

**Stack**: NestJS 10.4 + Prisma 7.5 + PostgreSQL 16 + TypeScript 5.7 strict.
**Commit**: `ee40d26` (submódulo backend).
**Tamaño**: 24 módulos, ~7.5K líneas en `src/modules/` + `common/` + `prisma/`.

## Resumen

| Métrica | Resultado |
|---|---|
| Typecheck (`tsc --noEmit`) | ✅ Limpio |
| Build (`nest build`) | ✅ Exit |
| Lint (`biome check src/`) | ❌ 17 errors, 40 warnings |
| Tests | ❌ 0 archivos `*.spec.ts` |
| Audit deps | ⚠ 119 vulns workspace (2 crit, 40 high) |
| Score arquitectura | **6.5/10** (DDD bien aplicado, problemas de seguridad) |
| Score seguridad | **3.5/10** (múltiples IDOR + falta de guard global) |
| Score testing | **1.0/10** (cero tests) |

## Arquitectura

### Fortalezas
- **Modular DDD**: 24 módulos de dominio aislados, cada uno con `controller`, `service`, `dto/`.
- **Common reutilizable**: `guards/`, `decorators/`, `filters/`, `interceptors/`, `utils/`, `enums/`.
- **Prisma con índices apropiados**: índices compuestos en `services` (`countryId, level, featured, endDate`), unique constraints en tablas de unión.
- **Cifrado AES-256-GCM correcto** en `integrations/crypto.service.ts` (IV aleatorio, Auth Tag, validación de key).
- **Comparaciones timing-safe** en `common/utils/timing-safe.ts`.
- **ValidationPipe global estricto** (`whitelist + forbidNonWhitelisted + transform`).
- **Helmet + CORS allowlist** desde `FRONTEND_URL`.
- **ThrottlerGuard** global con 2 buckets (short 10/s, long 100/min).
- **Swagger documentado** (solo dev).
- **Versionado URI** (`/api/v1`).
- **0 TODOs, 0 console.log de secretos**.

### Debilidades
- **JwtAuthGuard NO global** (BE-SEC-005): root cause de muchos IDORs.
- **Cascada de deletes peligrosa**: muchas relaciones `onDelete: Cascade` sin soft-delete (BE-DB-001).
- **Sin auditoría de auth**: solo `IntegrationAuditLog` existe (BE-DB-002).
- **`@ts-nocheck`** en `ai-agents.service.ts:1` y `tools/service-requests.tool.ts:1` (BE-INFO-001).
- **`enableImplicitConversion: true`** en ValidationPipe (BE-LINT-002).
- **RolesGuard no valida país** (multi-tenancy débil, BE-SEC-018).

## Módulos por tamaño

| Módulo | Archivos | Líneas | Notas |
|---|---|---|---|
| integrations | 11 | 756 | CryptoService bien hecho; runtime endpoint expone credenciales |
| services | 6 | 722 | Mayor module; raw query seguro (`$queryRaw`) |
| users | 9 | 630 | **IDOR en addresses** (BE-SEC-001) |
| auth | 6 | 516 | **Refresh no revocable** (BE-SEC-002); OAuth Google/Apple/MS |
| geo | 8 | 397 | Bien estructurado |
| subscriptions | 4 | 393 | **Webhook sin idempotencia** (BE-PAY-001) |
| chat | 4 | 414 | **IDOR en join_conversation** (BE-SEC-004); CORS wildcard |
| ratings | 7 | 366 | Ownership bien validado |
| categories | 5 | 352 | OK |
| ai-agents | 11 | 334 | **`@ts-nocheck`**; userId del body (BE-SEC-010) |
| sponsors | 5 | 289 | OK |
| payments | 5 | 283 | **Logs de firmas** (BE-SEC-006); createPayment stub |
| prices | 4 | 211 | OK |
| interactions | 4 | 224 | **POST sin auth** (BE-SEC-008) |
| quotes | 4 | 178 | **acceptQuote sin concurrencia** (BE-PAY-001) |
| notifications | 4 | 162 | **userId del body** (BE-SEC-009) |
| favorites | 3 | 152 | OK |
| chatbot | 4 | 158 | OK |
| service-requests | 4 | 176 | **findOne sin ownership** (BE-SEC-011) |
| escrow | 4 | 117 | Sin uso visible en producción |
| upload | 3 | 119 | **MIME spoofable + sin limits** (BE-SEC-015/016) |
| kyc | 3 | 103 | **Fallback `'mock_signature'`** (potencial) |
| crm | 3 | 102 | OK |
| email | 4 | 100 | **`/email/send` sin auth** (BE-SEC-003) |

## Seguridad

### Críticos
1. **BE-SEC-001** — IDOR addresses (`users.controller.ts:135-169`).
2. **BE-SEC-002** — Refresh token stateless (`auth.service.ts:120-149`).
3. **BE-SEC-003** — `/email/send` sin auth (`email.controller.ts:13-16`).
4. **BE-SEC-004** — IDOR WebSocket chat (`chat.gateway.ts:67-77`).
5. **BE-SEC-005** — JwtAuthGuard no global (`app.module.ts:70-79`).
6. **BE-SEC-006** — Firmas webhook logueadas (`mercadopago.gateway.ts:38`, `stripe.gateway.ts:45`).

### Altos
- BE-SEC-007 a 016: ver [`hallazgos.md`](../hallazgos.md).

## Base de datos

- **Schema**: 22 modelos, bien normalizado.
- **Índices**: apropiados en la mayoría.
- **Multi-tenancy**: `countryId` propagado a tablas relevantes.
- **Problemas**:
  - Sin soft-delete (BE-DB-001): borrado físico en cascada.
  - Sin auditoría de auth (BE-DB-002).
  - `P2002` expone campo conflictivo (BE-DB-003).
  - `Service.endDate` para expiración pero sin cron/archivado.

## Performance

- Endpoints con `findMany` + filtros: índices apropiados, no se anticipan N+1 en queries principales.
- `$queryRaw` en `services.service.ts:346-360` para recalcular `averageRating` — seguro (tagged template).
- **Sin caché**: cada request hitting DB. Recomendación: Redis para hot queries (TopPro, listings).
- **Serverless cold starts**: el `cachedServer` en `main.ts:13,86` mitiga pero `any` es type-unsafe.
- **Pool de conexiones**: no se ve configuración explícita; en serverless Vercel + Neon, recomendado PgBouncer.

## DevOps

- `vercel.json`: framework null, rewrites a `/api` (serverless).
- `installCommand: pnpm install --frozen-lockfile` (consistente).
- Sin healthcheck endpoint.
- Sin observabilidad.

## Recomendaciones priorizadas para backend

1. **Inmediato**: A01 (JwtAuthGuard global), A02 (IDORs), A03 (email send + logs), A06 (webhooks), A07 (multer update).
2. **7 días**: B01 (refresh rotation), B06 (stripe session).
3. **30 días**: C01 (tests), C03 (logger estructurado), C04 (health), C05 (idempotencia), C06 (rate limit), C08 (soft-delete).
4. **90 días**: D01 (chat dedicado), D02 (BullMQ workers).

## Comandos ejecutados

```bash
cd backend
npx tsc --noEmit                  # EXIT 0
pnpm lint                         # 17 errors, 40 warnings
pnpm audit --prod                 # 119 vulns
pnpm audit --prod --audit-level=high --json
pnpm build                        # EXIT 0
```

Evidencias en [`../evidencias/`](../evidencias).
