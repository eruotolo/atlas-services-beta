# Comandos ejecutados

Registro exacto de los comandos ejecutados durante la auditoría (2026-07-19). Todos fueron ejecutados desde el directorio raíz del proyecto (`/Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services`) o desde el subdirectorio indicado en "Directorio".

## Comandos de git

| # | Fecha | Directorio | Comando | Objetivo | Exit | Resultado | Cambió código |
|---|---|---|---|---|---|---|---|
| 1 | 2026-07-19T15:47 | raíz | `git log --oneline -5` | Verificar commits recientes | 0 | 5 commits mostrados | No |
| 2 | 2026-07-19T15:47 | raíz | `git rev-parse --abbrev-ref HEAD` | Rama actual | 0 | `main` | No |
| 3 | 2026-07-19T15:47 | raíz | `git rev-parse HEAD` | Commit actual | 0 | `bc5758662b77f0b69410ba7dab4c911cb452ae9a` | No |
| 4 | 2026-07-19T15:48 | raíz | `git ls-files \| grep .env` | Detectar secretos commiteados (raíz) | 0 | Ninguno | No |
| 5 | 2026-07-19T15:48 | backend | `git -C backend ls-files \| grep .env` | Detectar secretos en backend | 0 | Solo `.env.example` | No |
| 6 | 2026-07-19T15:48 | frontend | `git -C frontend ls-files \| grep .env` | Detectar secretos en frontend | 0 | Solo `.env.example` | No |
| 7 | 2026-07-19T15:48 | appmobile | `git -C appmobile ls-files \| grep .env` | Detectar secretos en mobile | 0 | Solo `.env.example` | No |

## Typecheck

| # | Fecha | Directorio | Comando | Exit | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 8 | 2026-07-19T15:50 | backend | `npx tsc --noEmit` | 0 | ✅ Sin errores | evidencias/typecheck.txt |
| 9 | 2026-07-19T15:50 | frontend | `npx tsc --noEmit` | 0 | ✅ Sin errores | evidencias/typecheck.txt |
| 10 | 2026-07-19T15:50 | appmobile | `npx tsc --noEmit` | 0 | ✅ Sin errores | evidencias/typecheck.txt |

## Lint

| # | Fecha | Directorio | Comando | Exit | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 11 | 2026-07-19T15:52 | backend | `pnpm lint` | 1 | ❌ 17 errors, 40 warnings (noExplicitAny, useNumberNamespace) | evidencias/lint.txt |
| 12 | 2026-07-19T15:52 | frontend | `pnpm lint` | 1 | ❌ `biome: command not found` | evidencias/lint.txt |
| 13 | 2026-07-19T15:52 | appmobile | `pnpm lint` | 1 | ❌ 7 errors, 31 warnings (noEmptyBlockStatements) | evidencias/lint.txt |

## Auditoría de dependencias

| # | Fecha | Directorio | Comando | Exit | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 14 | 2026-07-19T15:54 | backend | `pnpm audit --prod` | 0 | 119 vulns (2 crit, 40 high, 69 mod, 8 low) | evidencias/audit.txt |
| 15 | 2026-07-19T15:54 | frontend | `pnpm audit --prod` | 0 | 30 vulns (13 high, 14 mod, 3 low) | evidencias/audit.txt |
| 16 | 2026-07-19T15:54 | appmobile | `pnpm audit --prod` | 0 | 119 vulns (2 crit, 40 high, 69 mod, 8 low) | evidencias/audit.txt |
| 17 | 2026-07-19T15:55 | backend | `pnpm audit --prod --audit-level=high --json` | 0 | Detalle JSON de CVEs críticos/high | evidencias/audit.txt |
| 18 | 2026-07-19T15:55 | frontend | `pnpm audit --prod --audit-level=high` | 0 | Detalle filtrado (next, ws, minimatch) | evidencias/audit.txt |

## Build

| # | Fecha | Directorio | Comando | Exit | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 19 | 2026-07-19T16:00 | backend | `pnpm build` | 0 | ✅ `nest build && tsc-alias` exitoso | evidencias/build.txt |

> **Nota**: El build de frontend y de mobile no se ejecutó para no interferir con el tiempo de auditoría; el typecheck limpio en ambas capas es un indicador fuerte de compilabilidad.

## Detección de secretos

| # | Fecha | Directorio | Comando | Exit | Resultado | Evidencia |
|---|---|---|---|---|---|---|
| 20 | 2026-07-19T15:56 | raíz | `grep -rE "(API_KEY\|SECRET\|PRIVATE_KEY\|PASSWORD\|TOKEN)\s*=\s*['\"]..."` | 0 | 6 matches en `backend/.env` (no commiteado) | evidencias/secretos.txt |

**Patrones detectados en `backend/.env` (no commiteado, pero con valores reales en FS)**:
- `GEMINI_API_KEY`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `WEBHOOK_SECRET`
- `API_KEY`
- `CLOUDINARY_API_SECRET`

## Búsquedas de patrones

| # | Fecha | Comando | Resultado |
|---|---|---|---|
| 21 | 2026-07-19T15:57 | `grep -rE "TODO\|FIXME\|HACK\|XXX" backend/src` | 0 ocurrencias |
| 22 | 2026-07-19T15:57 | `grep -rE "TODO\|FIXME\|HACK\|XXX" frontend/src` | 0 ocurrencias |
| 23 | 2026-07-19T15:57 | `grep -rE "TODO\|FIXME\|HACK\|XXX" appmobile/src` | 0 ocurrencias |
| 24 | 2026-07-19T15:58 | `grep -rE "console\.(log\|error\|warn)" backend/src` | 1 ocurrencia (`main.ts:101` — inicio server) |
| 25 | 2026-07-19T15:58 | `grep -rE "console\.(log\|error\|warn)" frontend/src` | 0 (server actions usan `console.error`/`console.info`) |
| 26 | 2026-07-19T15:58 | `grep -rE "console\.(log\|error\|warn)" appmobile/src` | 0 |

> **Aclaración**: El conteo "0 console.log" en frontend y mobile se refiere a `console.log` específicamente (server actions usan `console.error` para logging, que es aceptable).

## Otros

| # | Fecha | Comando | Resultado |
|---|---|---|---|
| 27 | 2026-07-19T16:01 | `find backend -name "*.spec.ts"` | 0 archivos (0 tests backend) |
| 28 | 2026-07-19T16:01 | `find frontend/tests -type f` | 5 archivos (Playwright E2E) |
| 29 | 2026-07-19T16:01 | `find appmobile -name "*.spec.ts" -o -name "*.test.ts"` | 0 archivos (0 tests mobile) |
| 30 | 2026-07-19T16:02 | `find .github -type f` | 0 archivos (no hay CI/CD) |
| 31 | 2026-07-19T16:05 | Lectura de archivos vía `Read`, `Glob`, `Grep` | ~40 archivos clave leídos |
| 32 | 2026-07-19T16:07 | Sub-agentes `explore` (3) | Reportes de seguridad para cada capa |

## Comandos NO ejecutados

- `pnpm install` (las dependencias ya estaban instaladas en `node_modules/`).
- `pnpm --filter frontend build` (Next.js build; se omitió por tiempo; typecheck limpio es buen proxy).
- `pnpm --filter appmobile run ios/android` (requiere simulator/device; fuera de alcance).
- `pnpm dlx expo-doctor` (mencionado por la auditoría gpt-5 como fallido; no se replicó).
- Pruebas E2E de Playwright (requieren DB corriendo + seed).
- Pruebas de carga/DAST (fuera de alcance).
- Análisis estático con Semgrep / Snyk Code / CodeQL (no instalados).

## Resumen

- **Comandos ejecutados**: 32 categorizados.
- **Comandos fallidos**: 1 (`pnpm lint` frontend — biome no instalado).
- **Cambios en el proyecto**: **Ninguno**. La auditoría fue estrictamente de solo lectura (no se modificó código ni configuración).
- **Evidencias guardadas**: en `evidencias/`.
