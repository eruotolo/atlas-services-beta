# Asignación de Tareas — Delegación (Antigravity / Supervisado / Humano)

> Generado 2026-06-20. Divide la deuda técnica (`deuda-tecnica.md`) según quién
> la ejecuta mejor. **Recordá:** cada repo es un submódulo independiente — Antigravity
> debe trabajar en el repo correcto (`hireeo-front`, `hireeo-back`) o en el global.

## Criterio
- **🤖 Antigravity (autónomo):** acotada, mecánica, verificable con `tsc`/`build`/`lint`, bajo riesgo, sin decisiones de arquitectura/seguridad/producto, sin acceso a infra externa.
- **👀 Supervisado:** toca seguridad/autorización/ruteo o refactor con riesgo; necesita review humano antes de mergear.
- **🧑 Humano:** credenciales, settings de dashboard (Vercel/GitHub) o decisiones de producto.

---

## 🤖 Lote A — Delegables a Antigravity (con spec)

### A-1 · DT-05/06/07 — Eliminar restos de Vercel Blob · repo `hireeo-front`
- **Objetivo:** quitar la dependencia huérfana y referencias muertas a Vercel Blob (ya se migró a Cloudinary).
- **Archivos:** `package.json`, `next.config.ts`.
- **Pasos:**
  1. Quitar `"@vercel/blob"` de `package.json` (verificado: **0 archivos** lo importan).
  2. En `next.config.ts`, eliminar el `remotePattern` con `hostname: '*.public.blob.vercel-storage.com'`.
  3. `pnpm install` para regenerar lockfile.
- **Aceptación:** `pnpm build` verde; `grep -r '@vercel/blob' src` y `grep blob.vercel-storage next.config.ts` vacíos.

### A-2 · DT-12 — Unificar SDK de Gemini · repo `hireeo-front`
- **Objetivo:** dejar un solo SDK. Mantener `@google/genai` (nuevo, unificado); eliminar `@google/generative-ai` (legacy).
- **Estado:** cada SDK se usa en **1 archivo**. Hay que migrar el archivo que usa el legacy.
- **Pasos:**
  1. Localizar el archivo que importa `@google/generative-ai` y migrar su uso a la API de `@google/genai`.
  2. Quitar `"@google/generative-ai"` de `package.json`; `pnpm install`.
- **Aceptación:** `grep -r '@google/generative-ai' src package.json` vacío; `pnpm build` verde; la feature de IA sigue funcionando.

### A-3 · DT-29 (A8) — Tipar los `any` injustificados · repo `hireeo-back`
- **Objetivo:** reemplazar `any` por tipos reales (regla TS estricta). **No** tocar los `any` del handler de Vercel en `src/main.ts` (son del runtime).
- **Archivos:** `src/modules/payments/gateways/mercadopago.gateway.ts` (`payload: any`), `src/modules/payments/gateways/payment-gateway.interface.ts` (`event?: any`), `src/modules/kyc/kyc.controller.ts` (`req: any` → usar `RequestWithUser`).
- **Pasos:** definir interfaces/`unknown`+narrowing por cada caso; usar `RequestWithUser` de `@common/decorators/current-user.decorator` para los `req`.
- **Aceptación:** `tsc --noEmit` y `nest build` verdes; 0 `any` nuevos fuera de `main.ts`.

### A-4 · DT-28 (A7) — `ApiKeyGuard` time-safe · repo `hireeo-back`
- **Objetivo:** evitar timing attack en la comparación de la API key.
- **Archivo:** `src/common/guards/api-key.guard.ts`.
- **Pasos:** reemplazar `apiKey !== validKey` por `crypto.timingSafeEqual` (manejando longitudes distintas y el caso de header ausente/array).
- **Aceptación:** `nest build` verde; la auth por API key sigue funcionando (200 con key correcta, 401 sin/con incorrecta).

### A-5 · DT-08 — Alinear docs al puerto 3333 · repo **global** (`.doc/`)
- **Objetivo:** corregir menciones de puerto `3000` → `3333` (el frontend corre en 3333).
- **Archivos:** `.doc/proyecto-hireeo.md`, `.doc/integracion-apple-microsoft-login.md`, `.doc/prototype.html`.
- **Cuidado:** **NO** cambiar `deuda-tecnica.md` (ahí "3000" describe el problema).
- **Aceptación:** las URLs de dev locales dicen 3333; el doc de deuda intacto.

### A-6 · DT-13 — Configurar CodeGraph MCP · repo **global**
- **Objetivo:** agregar el server de CodeGraph al `.mcp.json` (hoy solo tiene shadcn).
- **Aceptación:** `.mcp.json` incluye codegraph; el MCP responde.

---

## 👀 Lote B — Supervisado (review humano obligatorio)

| DT | Tarea | Repo | Riesgo |
|----|-------|------|--------|
| DT-04 (A5) | Instalar `biome` + `biome.json` + arreglar lint | `hireeo-back` | Destapa muchos errores; acordar reglas primero |
| DT-26 (A4) | Proteger `chatbot.controller` (auth + throttle) | `hireeo-back` | Seguridad: definir si el chatbot es público |
| DT-10 | Reducir complejidad en `proxy.ts` | `hireeo-front` | Es el ruteo multi-país; romperlo tira el sitio |
| DT-27 (A6) | Unificar naming de roles | `hireeo-back` | Tocar autorización |
| DT-11 | Revisar `forbidNonWhitelisted` | `hireeo-back` | Alineación contrato front/back |

---

## 🧑 Lote C — Humano (no delegar a agente)

| DT | Tarea | Dónde |
|----|-------|-------|
| DT-21 | Rotar PAT de GitHub + credential helper | GitHub settings |
| DT-22 | CORS: agregar `www.hireeo.app` a `FRONTEND_URL` | Vercel `hireeo-back` |
| DT-23 | Revisar auto-promoción de deploys | Vercel `hireeo-back` |
| DT-25 (A2) | Rediseñar protección (API key pública) | Decisión de arquitectura |
| DT-01 / DT-09 | Escrow real + Fase 4 | Pagos / producto |
| DT-02 | Deploy final de producción | Infra |
| DT-16 / DT-20 | Paraguay, modelo de monetización | Producto |

---

## Orden sugerido para Antigravity
Tareas **independientes entre sí** (no se pisan), una por vez con su spec:
**A-1 → A-2** (frontend) · **A-3 → A-4** (backend) · **A-5 → A-6** (global).
Cada una cierra con build/lint verde antes de pasar a la siguiente.
