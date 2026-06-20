# Deuda Técnica — Hireeo (Frontend + Backend)

> Documento generado el 2026-06-20. Actualizar tras cada sprint o auditoría relevante.
> Complementa: `.doc/proyecto-hireeo.md`, `.doc/appmobile-claude.md` (§13 deuda mobile).

---

## 🔴 Crítica / Bloqueante para producción

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-01 | Backend | Escrow en estado MOCK | Split payments y comisión 15% no implementados en producción; `countryCode` hardcoded a `'es'` | `backend/src/modules/escrow/escrow.service.ts` |
| DT-02 | Infra | Producción no desplegada | Beta sin deploy final en `hireeo.app` | Roadmap Fase 4 |
| DT-03 | Repo | Repos anidados desincronizados | `frontend/` y `backend/` tienen `.git` propio; el monorepo raíz los marca como eliminados (`D`) | Raíz del monorepo |

---

## 🟠 Alta — Funcionalidad incompleta o riesgo operativo

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-04 | Backend | Lint roto | `pnpm lint` (`biome check src/`) reportado como no funcional | `backend/package.json` |
| DT-05 | Frontend | Dependencia huérfana Vercel Blob | Migración a Cloudinary hecha, pero `@vercel/blob` sigue en `package.json` | `frontend/package.json` |
| DT-06 | Frontend | Remote pattern obsoleto | `next.config.ts` aún permite `*.public.blob.vercel-storage.com` | `frontend/next.config.ts` |
| DT-07 | Docs | Storage desactualizado | Obsidian y `.doc/proyecto-hireeo.md` mencionan Vercel Blob; código usa Cloudinary | Obsidian + `.doc/` |
| DT-08 | Docs | Puerto dev incorrecto | Docs dicen puerto 3000; frontend corre en **3333** | `frontend/package.json` (`next dev -p 3333`) |
| DT-09 | Roadmap | Fase 4 pendiente | Escrow, retargeting email (Brevo CronJobs), comisión al ganar trabajo | `.doc/PlanJunio.md` |

---

## 🟡 Media — Calidad, consistencia y mantenibilidad

| ID | Área | Problema | Detalle | Archivo / Ubicación |
|----|------|----------|---------|---------------------|
| DT-10 | Frontend | Complejidad cognitiva | Biome limita a 15; `proxy.ts` usa `biome-ignore` por lógica de ruteo compleja | `frontend/src/proxy.ts` |
| DT-11 | Backend | Validación DTO estricta | `forbidNonWhitelisted: true` — cualquier campo extra rompe requests; frontend debe estar 100% alineado | `backend/src/main.ts` |
| DT-12 | Frontend | Doble SDK Gemini | `@google/genai` y `@google/generative-ai` coexisten | `frontend/package.json` |
| DT-13 | Tooling | CodeGraph MCP no configurado | `.mcp.json` solo tiene shadcn; bases `.codegraph/codegraph.db` existen pero MCP no está en Cursor | `.mcp.json`, `frontend/.codegraph/` |
| DT-14 | Backend | Deploy serverless | NestJS exporta handler Vercel; requiere validación de cold starts, WebSockets y Prisma en serverless | `backend/src/main.ts`, `backend/vercel.json` |
| DT-15 | Seed | Dependencia de seed manual | Sin `pnpm db:seed`, filtros geo (regiones/localidades) quedan vacíos | `backend/prisma/seed/` |

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

1. **DT-03** — Definir estrategia de repos: monorepo único vs submodules vs repos separados documentados.
2. **DT-01 + DT-09** — Completar Escrow real (Stripe Connect / MP split) antes de monetización por comisión.
3. **DT-05 + DT-06 + DT-07** — Limpiar referencias a Vercel Blob y actualizar docs.
4. **DT-04** — Reparar lint del backend.
5. **DT-08** — Alinear documentación (Obsidian + `.doc/`) con puerto 3333.
6. **DT-13** — Agregar CodeGraph al MCP de Cursor para análisis de impacto.

---

## 🔗 Referencias

- Obsidian: `SitesDoc/nextjs_projects/next-atlas-services/next-atlas-services.md`
- Roadmap: `.doc/PlanJunio.md`
- Deuda mobile: `.doc/appmobile-claude.md` §13
- Sync agentes: `.doc/AGENT_SYNC.md`

---

*Última revisión: 2026-06-20*