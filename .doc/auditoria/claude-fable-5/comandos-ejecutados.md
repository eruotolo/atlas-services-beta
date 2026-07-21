# Comandos ejecutados

Todos ejecutados el **2026-07-18** desde la raíz del monorepo `next-atlas-services` (rama `main`, commit `bc57586`), salvo indicación contraria. **Ningún comando modificó código fuente del proyecto** (solo se crearon archivos dentro de `.doc/claude-fable-5/`).

| # | Comando | Directorio | Objetivo | Exit | Evidencia | ¿Modifica proyecto? |
|---|---------|-----------|----------|------|-----------|---------------------|
| 1 | `git log -1 / git submodule status` | raíz | Estado de repo y submódulos | 0 | — | No |
| 2 | `cat package.json` (x4) | raíz + apps | Inventario de dependencias | 0 | — | No |
| 3 | `find src -type d` | apps | Estructura de carpetas | 0 | — | No |
| 4 | `git grep` patrones de secretos | apps | Detección de credenciales | 0/1 | evidencias/secretos.txt | No |
| 5 | `tsc --noEmit` | frontend | Type checking | 0 | evidencias/typecheck-frontend.txt | No |
| 6 | `tsc --noEmit` | backend | Type checking | 0 | evidencias/typecheck-backend.txt | No |
| 7 | `tsc --noEmit` | appmobile | Type checking | 0 | evidencias/typecheck-appmobile.txt | No |
| 8 | `biome check src/` | frontend | Lint | 0 (69 warn) | evidencias/lint-frontend.txt | No |
| 9 | `biome check src/` | backend | Lint | 1 (17 err/40 warn) | evidencias/lint-backend.txt | No |
| 10 | `biome check src/` | appmobile | Lint | 1 (7 err/31 warn) | evidencias/lint-appmobile.txt | No |
| 11 | `pnpm build` (nest build + tsc-alias) | backend | Build producción | 0 | evidencias/build-backend.txt | No |
| 12 | `pnpm build` (next build) | frontend | Build producción | 0 | evidencias/build-frontend.txt | No |
| 13 | `pnpm audit --prod` | frontend | Vulnerabilidades deps | — | evidencias/vulnerabilidades.txt | No |
| 14 | `pnpm audit --prod` | backend | Vulnerabilidades deps | — | evidencias/vulnerabilidades.txt | No |
| 15 | `pnpm audit --prod` | appmobile | Vulnerabilidades deps | — | evidencias/vulnerabilidades.txt | No |

## Resultados resumidos

- **Type checking:** las 3 apps compilan sin errores de tipos (`tsc --noEmit` → exit 0).
- **Builds:** frontend y backend generan build de producción correctamente (exit 0).
- **Lint:** frontend limpio (solo warnings); backend con 17 errores + 40 warnings; mobile con 7 errores + 31 warnings (no bloquean el build porque no están en el pipeline).
- **Auditoría de dependencias:** frontend 30 (13 high); backend 119 (2 critical, 40 high); appmobile 119 (2 critical, 40 high). Los `critical` (protobufjs, shell-quote) provienen de tooling transitivo de Expo/Firebase, no de código de aplicación en runtime.
- **Tests:** 0 tests unitarios/integración en backend (`*.spec.ts` = 0). Frontend solo tiene E2E Playwright (4 specs).

## Comandos NO ejecutados (y por qué)

- `pnpm test` backend → no existen tests que ejecutar.
- Tests de carga / DAST → sin entorno desplegado.
- `npx expo run` / build EAS → requiere credenciales y dispositivo; auditoría estática de mobile.
- Escaneo de secretos con herramienta dedicada (gitleaks/trufflehog) → se usó `git grep` con patrones; no se detectaron secretos reales versionados.
