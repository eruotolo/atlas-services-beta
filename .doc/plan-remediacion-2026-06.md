# Plan de Remediación — Hireeo (v1.1.9)

> **Fecha:** 2026-06-20
> **Generado por:** opencode (glm-5.2) con skill `plan-eng-review` de gstack
> **Repo:** `next-atlas-services` (monorepo pnpm + 3 git submódulos)
> **Estado:** Aprobado con 6 cambios del usuario. Pendiente de ejecución.

---

## 0. Contexto previo

Análisis exhaustivo del repo (frontend Next.js 16 + backend NestJS 10 + appmobile Expo 54)
ejecutado con agentes explore en paralelo. Hallazgos consolidados en este plan.

**Resumen de hallazgos por severidad:**

| Prioridad | Hallazgo | Dónde |
|---|---|---|
| P0 | Credenciales commiteadas (super-admins, Cloudinary, Postgres) | seeds + docker-compose |
| P0 | Inconsistencia sistemática de nombres de rol | backend, 5+ servicios |
| P0 | Bug `c.id` vs `c.categoryId` | `service-requests.service.ts:79` |
| P0 | Webhook de suscripciones sin firma criptográfica | `subscriptions.controller.ts` |
| P1 | Implementar pagos/KYC/FCM reales | gateways + notifications |
| P1 | i18n mobile incompleto (~140 claves) | appmobile |
| P1 | Conectar `reviews`/`payments` en mobile | appmobile |
| P1 | `showNotification` nunca se invoca | appmobile |
| P2 | 23 componentes fuera de carpeta propia (Regla de Oro) | frontend |
| P2 | Redirects legacy + sitemap sin prefijo país | `proxy.ts`, `sitemap.ts` |
| P2 | Eliminar `any` (32) y `as any` (10) en mobile | appmobile |

---

## 1. Configuración de herramientas (multi-host) — HECHO

Antes de ejecutar el plan, se configuraron las 4 herramientas en los 3 hosts:

| Herramienta | opencode | Claude Code | Gemini CLI |
|---|---|---|---|
| **gstack** (skills) | 58 skills | 58 skills | 5 skills (investigate, review, qa, cso, ship) |
| **codegraph** MCP | connected | repo + global | connected |
| **icons0** MCP | connected | global | connected |
| **shadcn** MCP | connected | repo | connected |

### Archivos escritos

**En el repo (commiteables):**
- `opencode.json` (nuevo) → codegraph + shadcn para opencode
- `.mcp.json` (fix) → codegraph args corregido con `serve --mcp` para Claude Code
- `.gemini/settings.json` (nuevo) → codegraph + shadcn para Gemini

**Globales (machine-local, no commitean):**
- `~/.config/opencode/opencode.json` → icons0 (token, backup `.bak`)
- `~/.claude.json` → codegraph + icons0 (ya existía)
- `~/.agents/skills/{investigate,review,qa,cso,ship}` → symlinks a `~/.claude/skills/gstack/*`

### Notas
- **Reinicios requeridos:** opencode y Claude Code deben reiniciarse para cargar los MCPs
  como tools invocables. Gemini ya los muestra `Connected`.
- **gstack en Gemini:** 5 skills con `name` único (subset seguro). Se evitó el conflicto
  de `open-gstack-browser` (bug de gstack: mismo `name` en 2 SKILL.md). Los scripts de
  analytics son no-op en Gemini (`$GSTACK_BIN` no resuelve), pero la guía carga.
- **icons0 con token secreto:** solo en configs globales, nunca en el repo. El equipo
  debe configurar su propio token.

---

## 2. Deltas aplicados al plan original (feedback del usuario)

| # | Cambio del usuario | Impacto en el plan |
|---|---|---|
| 0.1 | Passwords de super-admins → env vars (no en docker) | Seed lee `SEED_SUPERADMIN_PASSWORD_*` de `.env` del backend. Cloudinary → `CLOUDINARY_*` env. Postgres password → `docker-database/.env` (gitignored). |
| 1 | Ejecuta backend | Fases 1 y 2 las ejecuta el agente (con grep/read; CodeGraph disponible tras reiniciar opencode). |
| 2 | Solo 2 SuperAdmins en DB, sin otros clientes | Fase 1.1 **sin migración de datos**: roles en DB ya son los del seed; solo alinear enum + fixear string literals. |
| 3 | Sin cuentas Stripe/MP todavía | Fase 2.1 (pagos reales) y 2.2 (escrow Connect) se **defer**. Solo configuración por país lista + webhook verification + escrow país-fix. |
| 4 | Puerto dev 3333 | Fase 3.5: alinear `.env.example` (`AUTH_URL=:3333`), docs y `FRONTEND_URL` del backend a 3333. |
| 5 | Dejar todo listo para solo integrar APIs | Fase 4.3: no eliminar reviews/payments; dejarlos listos. Fase 2 = preparación, no implementación. FCM/DeviceToken sí se implementa (no depende de pasarelas). |
| 6 | Purgar historial git | Fase 0.1 incluye `git filter-repo` en los 4 repos (global + 3 submódulos). One-way door (force-push). |

---

## 3. Plan de ejecución

### Principios
- **Incremental (strangler fig):** cada fase es independiente y commiteable. Fase 0 primero.
- **Boring by default:** SDKs oficiales para pagos (cuando se implemente), no fetch manual.
- **Make the change easy, then make the easy change:** Fase 1.1 desacopla fuente de verdad
  antes de fixear consumidores. Sin cambios estructurales + comportamentales en el mismo commit.
- **Seguridad:** Fases 0, 1.3, 1.5 y Fase 2 pasan por `/cso` antes de merge.
- **Verificación obligatoria:** `pnpm lint && pnpm build` por app después de cada cambio.
- **Submódulos:** cada app commitea en su repo; el global solo actualiza el puntero SHA.

---

### FASE 0 — Seguridad crítica (P0, bloqueante) → `/cso`

**Blast radius:** repo entero + credenciales de producción. Reversible solo rotando (one-way door).

#### 0.1 Rotar + mover a env (3 secretos commiteados)
- `backend/prisma/seed/roles-users/index.ts:51-52` → `password: process.env.SEED_SUPERADMIN_PASSWORD_EDGARDO` / `_LNUNEZ`. Throw si faltan en seed de prod; fallback dummy + warning en dev.
- `backend/prisma/seed/categories/index.ts:6-10` → `cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET })`.
- `docker-database/docker-compose.yml:14-16` → `POSTGRES_USER: ${POSTGRES_USER}`, `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}`, `POSTGRES_DB: ${POSTGRES_DB}` + `docker-database/.env` (gitignored).
- Rotar en servicios reales: passwords super-admins (vía Studio/DB), Cloudinary api_secret (dashboard revoke+new), Postgres password.
- Actualizar `.env.example` del backend con las nuevas keys.

#### 0.2 Purgar historial git con `git filter-repo` (one-way, force-push)
- Aplicar en los 4 repos (global + 3 submódulos).
- `git filter-repo --replace-text` con los patrones de los 3 secretos.
- Force-push a `main` de cada repo. **Confirmar con usuario antes de ejecutar.**

#### 0.3 Rotar PAT de GitHub (HTTPS credential helper o SSH).

---

### FASE 1 — Bugs backend (P0)

#### 1.1 Unificar nombres de rol (sin migración de datos)
- `backend/src/common/enums/role.enum.ts:2` → `CLIENT = 'Client'` (alinea con DB; `PROVIDER`/`ADMIN`/`SUPER_ADMIN` ya coinciden).
- Reemplazar string literals por `Role.*` en:
  - `users.service.ts:186` (`'Administrador'`→`Role.ADMIN` + fix validación país-admin)
  - `services.service.ts:333`
  - `ratings.service.ts:158`
  - `interactions.service.ts:115`
  - `subscriptions.service.ts:122` (`includes('admin')`→`includes(Role.ADMIN) || includes(Role.SUPER_ADMIN)`)
  - `test-data.ts:47` (`'PROVIDER'`→`Role.PROVIDER`)
- Tests unit: `isAdmin(roles)` true para `['Admin']` y `['SuperAdmin']`, false para `['Professional']`.

#### 1.2 Fix `c.id` → `c.categoryId`
- `backend/src/modules/service-requests/service-requests.service.ts:79,83`:
  `select: { id: true }`→`{ categoryId: true }`; `c.id`→`c.categoryId`.
- Test: provider cat A + request cat A → aparece; request cat C → no.

#### 1.3 Webhook de suscripciones — validar firma criptográfica real
- `subscriptions.controller.ts:64-72`: controller recibe `req.rawBody` → `gateway.verifyWebhook(rawBody, headers)` → solo si true, `actualizarEstadoPago`.
- **Prereq:** raw body en `main.ts` (comparte con KYC 2.4).
- Errar hacia reject es seguro (reintento de la pasarela rescata legítimos).
- `/cso` obligatorio.

#### 1.4 JWT expiración invertida
- `backend/src/modules/auth/auth.service.ts:300-308`: defaults `15m` access / `30d` refresh (alineados a `.env.example`).

#### 1.5 `WebhookGuard` comparación timing-safe
- `backend/src/common/guards/webhook.guard.ts:10`: `crypto.timingSafeEqual` (patrón de `ApiKeyGuard`).
- `/cso`.

---

### FASE 2 — Preparar para integración (NO implementar real)

#### 2.1 Pagos — dejar configuración por país lista
- `stripe.gateway.ts` / `mercadopago.gateway.ts`: secrets por país mapeados + `verifyWebhook` implementado (HMAC ya está en MP).
- `createPayment` queda stub **documentado** con TODO claro. No instalar SDKs aún.

#### 2.2 Escrow — fix país hardcodeado
- `escrow.service.ts:36`: resolver país del `Quote→ServiceRequest→User` (no hardcodear `'es'`). Estructura split ready, sin Connect.

#### 2.3 FCM real + DeviceToken (SÍ se implementa)
- Prisma: nuevo modelo `DeviceToken { id, userId, token, platform, createdAt }` + migración versionada.
- Endpoint `POST /users/me/device-token` (JwtAuthGuard).
- `notifications.service.ts:31-58`: consultar `DeviceToken` y llamar `admin.messaging().sendMulticast()`.

#### 2.4 KYC — raw body
- Comparte raw body con Fase 1.3. `createVerificationSession` queda stub documentado hasta cuenta Stripe Identity.

---

### FASE 3 — Frontend (P1/P2)

#### 3.1 Mover 23 componentes a carpeta propia (Regla de Oro)
- `Foo.tsx` → `Foo/index.tsx`. Dominio por dominio, commits separados (strangler).
- Afecta: `features/home/components/` (9), `features/services/publish/components/` (11), `features/payments/premium/components/` (3), `features/admin/components/` (2), `shared/components/` (~20).
- Verificar con `pnpm build` (tsc + next) que no queden imports rotos.

#### 3.2 Redirects legacy a país detectado
- `proxy.ts:71`: `new URL(\`/cl${pathname}\`)` → `new URL(\`/${detectCountry(request)}${pathname}\`)`.

#### 3.3 Sitemap con prefijo país
- `sitemap.ts:19-24,30`: URLs por país (`/cl/search`, `/ar/search`…) usando `COUNTRY_SEO_CONFIG`.

#### 3.4 Unificar `CountryConfig` (DRY — triple fuente)
- `countryUtils.ts` como única fuente UI; `queries.ts` fallback la importa; `CountryProvider` reexporta la interface.

#### 3.5 Puerto dev 3333
- `frontend/package.json:6` ya usa `next dev -p 3333`. Alinear `.env.example` (`AUTH_URL=:3333`), docs y `FRONTEND_URL` del backend.

#### 3.6 Eliminar doble detección de país (insegura)
- `app/page.tsx:36`: borrar fetch a `http://ip-api.com`; delegar al `proxy.ts`.
- `/cso`.

---

### FASE 4 — Mobile (P1)

#### 4.1 i18n — migrar ~140 claves con `defaultValue` a JSON
- Extraer cada `t('clave', { defaultValue: 'English text' })` → agregar a `es.json` y `en.json`; quitar `defaultValue`. Paridad 151→~290.
- Por pantalla, commits separados.

#### 4.2 ChatIA i18n
- `features/chatbot/components/ChatIA/index.tsx` (100% hardcodeado español rioplatense) + `actions/detectarServicio.ts:24`: mover ~10 strings a `chatbot.*`.

#### 4.3 Dejar `reviews`/`payments` listos (no eliminar)
- Tipar bien, sin `any`, para integración futura. Conectar UI de reviews (backend ratings ya existe).
- `getPaymentHistory` es stub del backend → si conectas payments, depende de Fase 2.

#### 4.4 Disparar `showNotification` desde el socket
- `SocketContext` handler `new_message` → `showNotification` si no es chat activo. Banner ya cableado en `_layout.tsx:72`.
- Edge cases: no notificar si está en ese chat; no notificar mensajes propios; respetar `unreadCount`.

#### 4.5 Push token — campo backend + UpdateUserDto
- `registerPushToken.ts:55` documenta que backend no acepta `pushToken`. Bloqueado por Fase 2.3.

#### 4.6 Eliminar `any` (32) y `as any` (10)
- `catch (error: unknown)` + narrowing; tipar respuestas backend; regenerar `.expo/types` para rutas.

#### 4.7 Discrepancia docs Expo v54 vs v56
- `AGENTS.md` referencia v56, `package.json` instala v54. Alinear `AGENTS.md` a v54.

---

### FASE 5 — Verificación final

```
Por cada fase (en orden):
  1. pnpm --filter backend lint && pnpm --filter backend build
  2. pnpm --filter frontend lint && pnpm --filter frontend build
  3. (appmobile) pnpm --filter appmobile lint && pnpm tsc --noEmit
  4. pnpm --filter frontend test:e2e   (smoke)
  5. /cso en Fases 0, 1.3, 1.5, 2.3, 3.6
  6. /review + /qa antes de /ship
```

- **Obsidian:** append a `next-atlas-services.md` por fase completada.
- **Submódulos:** commit por repo (`hireeo-front/back/mobile`), luego actualizar puntero en el global.

---

## 4. Diagrama de dependencias entre fases

```
FASE 0 (secrets) ──────── independiente, primero
   │
FASE 1 (bugs backend)
   ├─ 1.1 roles ────────── independiente
   ├─ 1.2 categoryId ──── independiente
   ├─ 1.3 webhook ─────── prereq: raw body en main.ts (comparte con 2.4)
   ├─ 1.4 JWT ──────────── independiente
   └─ 1.5 timing-safe ──── independiente
   │
FASE 2 (preparación)
   ├─ 2.1 pagos config ─── independiente (no implementa real)
   ├─ 2.2 escrow país ──── independiente
   ├─ 2.3 FCM+DeviceToken ─ bloquea 4.5
   └─ 2.4 KYC raw body ─── comparte raw-body con 1.3
   │
FASE 3 (frontend) ─────── independiente de 1/2
FASE 4 (mobile)
   ├─ 4.5 push ─────────── bloqueado por 2.3
   ├─ 4.3 reviews/payments─ payments bloqueado por 2.1
   └─ resto independiente
```

---

## 5. Preguntas del usuario — ya respondidas

1. **¿Ejecuta backend o lo deja a Gemini?** → Ejecuta backend el agente.
2. **¿Prod tiene datos reales de roles?** → Solo 2 SuperAdmins, sin otros clientes. Sin migración de datos.
3. **Fase 2.2 (Escrow/Connect):** → Sin cuentas Stripe/MP. Solo dejar configuración lista.
4. **Fase 3.5: ¿puerto dev 3000 o 3333?** → 3333.
5. **Fase 4.3: ¿conectar reviews/payments o eliminar?** → Dejar todo listo para integrar APIs.
6. **Fase 0.1: ¿purgar historial git?** → Sí, purgar con filter-repo.

---

## 6. Orden de ejecución sugerido

1. **Reiniciar opencode** (para activar codegraph/icons0/shadcn como tools invocables).
2. **Fase 0** (secrets + purge) — confirmar one-way door antes de force-push.
3. **Fase 1** (bugs backend) — 1.1, 1.2, 1.4, 1.5 independientes; 1.3 con prereq raw body.
4. **Fase 2** (preparación) — 2.3 (FCM) desbloquea 4.5.
5. **Fase 3** (frontend) — independiente.
6. **Fase 4** (mobile) — 4.5 al final (espera 2.3).
7. **Fase 5** (verificación) — `/cso`, `/review`, `/qa`, `/ship`.
