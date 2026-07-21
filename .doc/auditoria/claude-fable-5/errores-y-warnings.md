# Errores y warnings

Resultados de `tsc --noEmit`, `biome check` y `pnpm build` ejecutados el 2026-07-18. Evidencia cruda en `evidencias/`.

## Resumen por app

| App | Typecheck | Build | Lint (biome) | Vuln deps (prod) |
|-----|-----------|-------|--------------|------------------|
| frontend | ✅ exit 0 | ✅ exit 0 | ⚠️ 0 err / 69 warn | 30 (13 high, 14 mod, 3 low) |
| backend | ✅ exit 0 | ✅ exit 0 | ❌ 17 err / 40 warn | 119 (2 crit, 40 high)* |
| appmobile | ✅ exit 0 | (no ejecutado) | ❌ 7 err / 31 warn | 119 (2 crit, 40 high)* |

\* backend y appmobile comparten árbol de transitivas del monorepo; los `critical` (protobufjs, shell-quote) vienen de **tooling de build de Expo/Firebase**, no de código de runtime de la app.

## Tabla de hallazgos automáticos

| ID | Mensaje | Herramienta | Capa | Archivo | Severidad | Causa | Solución | Estado |
|----|---------|-------------|------|---------|-----------|-------|----------|--------|
| W1 | `next` <16.2.5 vulnerable (CVE-2026-44582 + 12 más) | pnpm audit | FE | frontend/package.json | Alta | Versión desactualizada | `up next@16.2.6` | Abierto |
| W2 | 13 high advisories en árbol de `next` | pnpm audit | FE | frontend | Alta | idem W1 | idem | Abierto |
| W3 | `protobufjs` <7.5.5 arbitrary code exec (crit) | pnpm audit | BE/MO | transitiva (firebase-admin/expo) | Crítica (tooling) | Dep transitiva | `pnpm up` / override | Abierto |
| W4 | `shell-quote` <=1.8.3 (crit) | pnpm audit | MO | transitiva (@expo/cli) | Crítica (tooling dev) | Dep transitiva | Actualizar Expo SDK | Abierto |
| W5 | `undici` <6.27.0 | pnpm audit | BE/MO | transitiva (@expo/cli) | Moderada | Dep transitiva | idem | Abierto |
| W6 | 17 errores de lint (uso de `any`, etc.) | biome | BE | backend/src/**| Media | Sin lint en CI | Corregir/justificar | Abierto |
| W7 | 7 errores de lint (bloques vacíos, `any`) | biome | MO | appmobile/src/** | Media | Sin lint en CI | Corregir | Abierto |
| W8 | 69 warnings (`any`, estilo) | biome | FE | frontend/src/** | Baja | Deuda de tipos | Incremental | Abierto |
| W9 | `pnpm.onlyBuiltDependencies` ignorado por pnpm | pnpm | raíz | package.json | Info | Config obsoleta de pnpm | Migrar a nuevo formato de settings | Abierto |
| W10 | `biome` not found al correr `backend pnpm lint` con path relativo | pnpm | BE | backend/package.json | Baja | Script usa `../node_modules/.bin/biome`; falla en algunos contextos | Usar `pnpm exec biome` | Abierto |

## Notas

- **No hay errores de compilación ni de tipos** en ninguna de las 3 apps: el código es type-safe según `tsc`. La deuda está en lint (no forzado) y en dependencias.
- El backend **compila y buildea** correctamente pese a los errores de lint, porque el lint no está en el pipeline de build.
- Las 2 vulnerabilidades `critical` NO están en la superficie de runtime de producción (son de `@expo/cli` y de tooling de Firebase). Aun así deben cerrarse actualizando Expo SDK y Firebase Admin.
