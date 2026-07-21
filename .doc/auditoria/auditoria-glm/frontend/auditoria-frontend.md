# Auditoría Frontend

**Stack**: Next.js 16.1.1 + React 19.2.3 + NextAuth v4 + Tailwind v4 + Biome.
**Commit**: `3f73bab` (submódulo frontend).
**Tamaño**: 325 archivos TS/TSX, 46 páginas, 35 server action files, 18 features.

## Resumen

| Métrica | Resultado |
|---|---|
| Typecheck | ✅ Limpio |
| Build | (no ejecutado) — typecheck proxy positivo |
| Lint (`biome check`) | ❌ **`biome: command not found`** (FE-LINT-001) |
| Tests E2E | ⚠ 5 specs Playwright (`frontend/tests/`) |
| Audit deps | ⚠ 30 vulns (13 high en `next`) |
| Score arquitectura | **6.5/10** (DDD + Server Components bien) |
| Score seguridad | **3.5/10** (IDOR + XSS + pagos rotos) |
| Score UX | **5.0/10** (sin error boundaries, sin dynamic imports) |

## Arquitectura

### Fortalezas
- **Server Components por defecto**: 0 páginas `'use client'`.
- **DDD bien aplicado**: 18 features con `actions/`, `components/`, `schemas/`, `types/`.
- **`proxy.ts`** robusto: detección multi-país, validación de sesión y país para admin, sin open redirect.
- **`apiClient` SSR** con `x-api-key` solo en server (no expuesto al bundle).
- **`next/image` en todas partes** (0 `<img>` raw).
- **React Compiler** habilitado.
- **35 server actions** con `revalidatePath` consistente.
- **11 schemas Zod** en `features/*/schemas/`.
- **Webhooks route handlers** separados (`/api/webhooks/stripe`, `/api/webhooks/mercadopago`).

### Debilidades
- **0 archivos `error.tsx`/`loading.tsx`/`not-found.tsx`/`global-error.tsx`** (FE-RISK-001).
- **0 `next/dynamic` imports** (FE-PERF-001): leaflet, recharts, MP SDK en bundle inicial.
- **Componentes admin en `shared/components/admin/`** (FE-ARCH-001): viola AGENTS.md.
- **Componentes Chat en `shared/components/hireeo/ui/Chat*`** (FE-ARCH-002): debería ser `features/chat`.
- **`.parse()` en 20 server actions** (FE-UX-001): UX mala vs `.safeParse()`.
- **`bcrypt` en `serverExternalPackages` sin uso** (FE-CONF-001).
- **`installCommand: --no-frozen-lockfile`** en `vercel.json` (inconsistencia con backend).

## Multi-país

- `proxy.ts` (160 líneas): cookie → CF → Vercel → Accept-Language → `cl`.
- Legacy paths → redirect 301 a `/{country}{path}`.
- Login/register globales (`/login`, `/register` sin país).
- Admin valida país del usuario vs URL.
- **Sin open redirect**: callbackUrl validado `startsWith('/')`.

## Auth / Sesiones

- **NextAuth v4** estrategia JWT, `maxAge: 30 días`.
- Tokens del backend guardados en **JWT de next-auth** (httpOnly cookie) — **NO localStorage**.
- `maybeRefreshToken` refresca cuando faltan 60s.
- Distingue `ok` / `invalid` (401) / `transient` (5xx) — no invalida sesión en transitorios.
- `SessionGuard` detecta `RefreshTokenExpired` y fuerza signOut.

### Problemas
- **FE-SEC-008**: `backendToken` y `backendRefreshToken` expuestos en `session.user` (XSS risk).
- **FE-SEC-009**: Contraseña invitado con `Math.random()`.
- **FE-SEC-010**: Política contraseñas inconsistente (auth `min 6` vs users `min 8 + simbol`).

## Server Actions

- **IDOR FE-SEC-001** en `publicarServicioPublico` (`publish/actions/mutations.ts:60-66`).
- **IDOR FE-SEC-002** en `actualizarPerfil` (`users/actions/mutations.ts:120,144`).
- **Stubs FE-PAY-002** en `payments/actions/mutations.ts:5-24`.
- Varias acciones no validan sesión antes de procesar (ineficiente, no crítico).

## API Routes

- `/api/webhooks/stripe` — **FE-PAY-001**: no envía `x-api-key` al backend.
- `/api/webhooks/mercadopago` — **FE-SEC-005**: no verifica firma HMAC.
- `/api/revalidate` — **FE-SEC-006**: sin auth (DoS de caché).
- `/api/payments/stripe-session` — **FE-SEC-007**: sin auth, precio client-side.
- `/api/upload` — lee `API_KEY` (server-only).

## Seguridad

### Críticos
1. **FE-SEC-001** IDOR publicar servicio.
2. **FE-SEC-002** IDOR editar perfil.
3. **FE-RISK-001** 0 error boundaries.
4. **FE-PAY-001** Webhook Stripe sin API key.
5. **FE-SEC-003** XSS JSON-LD.
6. **FE-SEC-004** HTML injection email.
7. **FE-PAY-002** MP stubs.

### Altos
- FE-SEC-005 a FE-SEC-011.

## XSS / dangerousHTML

- 6 usos de `dangerouslySetInnerHTML` (todos con biome-ignore justificado), **excepto**:
- **FE-SEC-003**: JSON-LD con `.replace(/</g, '<')` que es **no-op**.
- **FE-SEC-004**: Email de contacto sin escaping HTML.

## Performance

- **Server Components** reduce JS del cliente.
- **React Compiler** optimiza re-renders.
- **next/image** optimiza imágenes.
- **Falta**: `next/dynamic` para librerías pesadas (FE-PERF-001).
- **Falta**: `apiClient` sin `AbortController`/timeout (FE-PERF-002).

## Accesibilidad

- **No auditada a fondo** (fuera de alcance principal), pero:
- Uso semántico de HTML en la mayoría de componentes.
- Etiquetas de formularios en `RegisterPage`/`LoginPage`.
- **Falta**: foco visible en modales (Radix Dialog lo da por defecto, validar).
- **Falta**: skip-links, ARIA live regions para toasts.
- **WCAG 2.2 AA**: estimado 60-70% conforme.

## UX

- **0 `loading.tsx`** → spinners inconsistentes o ausentes.
- **0 `error.tsx`** → errores no recuperables.
- **`.parse()` en 20 actions** → mensajes genéricos.
- **Nominatim sin User-Agent** → riesgo de ban IP (FE-UX-003).
- **`revalidatePath('/profile/favorites')` sin país** → no revalida (FE-UX-002).
- **Robots.txt no bloquea `/{country}/admin`** (FE-SEC-011).

## Recomendaciones priorizadas para frontend

1. **Inmediato**: A02 (IDORs), A05 (XSS), A06 (webhooks), A07 (Next upgrade).
2. **7 días**: B02 (tokens cookies), B04 (fix lint), B05 (error boundaries), B06 (stripe auth), B09 (revalidate + robots).
3. **30 días**: C02 (Sentry), C09 (OpenAPI cliente), C10 (dynamic imports).

## Comandos ejecutados

```bash
cd frontend
npx tsc --noEmit        # EXIT 0
pnpm lint               # biome: command not found (FE-LINT-001)
pnpm audit --prod       # 30 vulns (13 high en next)
pnpm audit --prod --audit-level=high
```
