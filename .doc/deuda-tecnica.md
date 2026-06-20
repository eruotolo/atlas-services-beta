# Deuda Técnica — Hireeo (Frontend + Backend)

> Documento generado el 2026-06-20. Actualizar tras cada sprint o auditoría relevante.
> Complementa: `.doc/proyecto-hireeo.md`, `.doc/appmobile-claude.md` (§13 deuda mobile).

---

## 🔴 Crítica / Bloqueante para producción

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-21 | Seguridad | 🔴 PAT de GitHub expuesto | Personal Access Token (`ghp_...`) embebido en texto plano en los remotes de `frontend`/`backend`/`appmobile`. Rotar y migrar a credential helper | `.git/config` de cada sub-repo |
| DT-24 | Seguridad | 🔴 Rate limiting inerte (A1) | `auth.controller` usa `@Throttle()` pero `ThrottlerGuard` nunca se registra como `APP_GUARD` → login/register sin protección anti-brute-force | `backend/src/app.module.ts` |
| DT-25 | Seguridad | 🔴 API key pública = guard eludible (A2) | `ApiKeyGuard` (único guard global) valida `x-api-key`, pero el frontend la expone vía `NEXT_PUBLIC_API_KEY` (va al bundle del browser). Seguridad real recae solo en JwtAuthGuard/RolesGuard | `backend/src/common/guards/api-key.guard.ts` |
| DT-01 | Backend | Escrow en estado MOCK | Split payments y comisión 15% no implementados en producción; `countryCode` hardcoded a `'es'` | `backend/src/modules/escrow/escrow.service.ts` |
| DT-02 | Infra | Producción no desplegada | Beta sin deploy final en `hireeo.app` (backend ya vivo en `api.hireeo.app`) | Roadmap Fase 4 |
| ~~DT-03~~ | Repo | ~~Repos anidados desincronizados~~ ✅ RESUELTO (2026-06-20) | Formalizados como **git submodules** (`.gitmodules`). El global referencia cada app por commit; código real en `hireeo-front/back/mobile`. Ver `.doc/arquitectura-repos-deploy.md` | Raíz del monorepo |

---

## 🟠 Alta — Funcionalidad incompleta o riesgo operativo

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-04 | Backend | Lint roto (A5) | `biome` NO está en las dependencias del backend; el script `lint: biome check src/` falla siempre (binario inexistente). No hay linting real | `backend/package.json` |
| DT-05 | Frontend | Dependencia huérfana Vercel Blob | Migración a Cloudinary hecha, pero `@vercel/blob` sigue en `package.json` | `frontend/package.json` |
| DT-06 | Frontend | Remote pattern obsoleto | `next.config.ts` aún permite `*.public.blob.vercel-storage.com` | `frontend/next.config.ts` |
| DT-07 | Docs | Storage desactualizado | Obsidian y `.doc/proyecto-hireeo.md` mencionan Vercel Blob; código usa Cloudinary | Obsidian + `.doc/` |
| DT-08 | Docs | Puerto dev incorrecto | Docs dicen puerto 3000; frontend corre en **3333** | `frontend/package.json` (`next dev -p 3333`) |
| DT-09 | Roadmap | Fase 4 pendiente | Escrow, retargeting email (Brevo CronJobs), comisión al ganar trabajo | `.doc/PlanJunio.md` |
| DT-22 | Infra | CORS sin dominio canónico | `FRONTEND_URL` (Vercel hireeo-back) no incluye `https://www.hireeo.app`; el dominio redirige a `www` → llamadas client-side fallarían por CORS | Vercel env `hireeo-back` |
| DT-26 | Seguridad | Endpoint IA sin auth (A4) | `chatbot.controller` es el único sin `JwtAuthGuard`; con DT-24 (throttler inerte) queda abierto al abuso de costos de Gemini | `backend/src/modules/chatbot/chatbot.controller.ts` |

---

## 🟡 Media — Calidad, consistencia y mantenibilidad

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-10 | Frontend | Complejidad cognitiva | Biome limita a 15; `proxy.ts` usa `biome-ignore` por lógica de ruteo compleja | `frontend/src/proxy.ts` |
| DT-11 | Backend | Validación DTO estricta | `forbidNonWhitelisted: true` — cualquier campo extra rompe requests; frontend debe estar 100% alineado | `backend/src/main.ts` |
| DT-12 | Frontend | Doble SDK Gemini | `@google/genai` y `@google/generative-ai` coexisten | `frontend/package.json` |
| DT-13 | Tooling | CodeGraph MCP no configurado | `.mcp.json` solo tiene shadcn; bases `.codegraph/codegraph.db` existen pero MCP no está en Cursor | `.mcp.json`, `frontend/.codegraph/` |
| DT-14 | Backend | Deploy serverless ✅ FUNCIONAL (2026-06-20) | `api.hireeo.app` sirve la API (200). Config en repo (`framework:null`, lockfile propio, pnpm 9.15.9). Pendiente validar cold starts y WebSockets en serverless. Ver `.doc/arquitectura-repos-deploy.md` | `backend/src/main.ts`, `backend/vercel.json`, `backend/api/index.js` |
| DT-15 | Seed | Dependencia de seed manual | Sin `pnpm db:seed`, filtros geo (regiones/localidades) quedan vacíos | `backend/prisma/seed/` |
| DT-23 | Infra | Deploy no auto-promueve | Push a `main` de `hireeo-back` genera Production pero no toma el dominio; hubo que promover manualmente. Revisar settings de promoción | Vercel proyecto `hireeo-back` |
| DT-27 | Backend | Doble naming de roles (A6) | `RolesGuard` mapea `Admin`→`['Admin','admin']`, `Professional`→`['Professional','provider']`, etc. Nombres inconsistentes entre capas; frágil para autorización | `backend/src/common/guards/roles.guard.ts` |
| DT-28 | Seguridad | Comparación no time-safe (A7) | `ApiKeyGuard` usa `apiKey !== validKey` (no constante en tiempo). Timing attack teórico, bajo impacto | `backend/src/common/guards/api-key.guard.ts` |

---

## 🟢 Baja — Mejoras futuras / deuda conocida aceptada

| ID | Área | Problema | Detalle |
|----|------|----------|---------|
| DT-16 | Geo | Paraguay pendiente | País `py` planificado pero no implementado |
| DT-17 | i18n | Categorías US | País `us` usa `nameEn` en lugar de `name` — lógica especial a mantener |
| DT-18 | Upload | Rate limiter en memoria | `/api/upload` usa Map en memoria; insuficiente para multi-instancia en producción |
| DT-19 | Mobile | Deuda separada | Ver `.doc/appmobile-claude.md` §13 (OAuth, bookings, addresses CRUD, etc.) |
| DT-20 | Monetización | Modelo en transición | Suscripción BASIC/PREMIUM activa; objetivo es listar gratis + 15% comisión (Escrow) |

---

## 📋 Acciones recomendadas (priorizadas)

1. **DT-21** — 🔴 Rotar el PAT de GitHub expuesto y migrar a credential helper (seguridad).
2. **DT-22 + DT-23** — Ajustar CORS (`www`) y revisar auto-promoción en Vercel `hireeo-back`.
3. **DT-01 + DT-09** — Completar Escrow real (Stripe Connect / MP split) antes de monetización por comisión.
4. **DT-05 + DT-06 + DT-07** — Limpiar referencias a Vercel Blob y actualizar docs.
5. **DT-04** — Reparar lint del backend.
6. **DT-08** — Alinear documentación (Obsidian + `.doc/`) con puerto 3333.
7. **DT-13** — Agregar CodeGraph al MCP de Cursor para análisis de impacto.

> ~~DT-03~~ (estrategia de repos) cerrado el 2026-06-20 — submódulos formalizados.

---

## ☑️ Checklist de resolución

> Marcar `[x]` al resolver. `🔧` = en progreso. Mantener en orden de prioridad.

### 🔴 Crítica
- [ ] **DT-21** — Rotar PAT de GitHub expuesto + credential helper
- [ ] **DT-24** — Registrar `ThrottlerGuard` como `APP_GUARD` (rate limiting real)
- [ ] **DT-25** — Quitar dependencia de API key pública; reforzar JwtAuthGuard/RolesGuard
- [ ] **DT-01** — Implementar Escrow real (Stripe Connect / MP split)
- [ ] **DT-02** — Deploy final de producción en `hireeo.app`
- [x] **DT-03** — Repos como git submodules (2026-06-20)

### 🟠 Alta
- [ ] **DT-26** — Proteger/limitar `chatbot.controller` (auth + throttle)
- [ ] **DT-04** — Instalar `biome` y reparar lint del backend
- [ ] **DT-05 / DT-06 / DT-07** — Limpiar restos de Vercel Blob + docs
- [ ] **DT-08** — Alinear docs al puerto 3333
- [ ] **DT-09** — Fase 4 (Escrow, retargeting Brevo, comisión)
- [ ] **DT-22** — CORS: agregar `www.hireeo.app` a `FRONTEND_URL`

### 🟡 Media
- [ ] **DT-10** — Reducir complejidad cognitiva en `proxy.ts`
- [ ] **DT-11** — Revisar `forbidNonWhitelisted` (alineación front/back)
- [ ] **DT-12** — Unificar SDK de Gemini en frontend
- [ ] **DT-13** — Configurar CodeGraph MCP
- [x] **DT-14** — Deploy serverless del backend funcional (2026-06-20)
- [ ] **DT-15** — Automatizar/garantizar el seed de geo
- [ ] **DT-23** — Revisar auto-promoción en Vercel `hireeo-back`
- [ ] **DT-27** — Unificar naming de roles (eliminar doble mapeo)
- [ ] **DT-28** — `ApiKeyGuard` con comparación time-safe

### 🟢 Baja
- [ ] **DT-16** — Paraguay (`py`)
- [ ] **DT-17** — i18n categorías US (`nameEn`)
- [ ] **DT-18** — Rate limiter de upload fuera de memoria
- [ ] **DT-19** — Deuda mobile (ver `appmobile-claude.md` §13)
- [ ] **DT-20** — Modelo de monetización en transición

---

## 🔗 Referencias

- Obsidian: `SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md`
- Roadmap: `.doc/PlanJunio.md`
- Deuda mobile: `.doc/appmobile-claude.md` §13
- Sync agentes: `.doc/AGENT_SYNC.md`

---

*Última revisión: 2026-06-20*