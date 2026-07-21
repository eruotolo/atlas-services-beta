# Comandos ejecutados

Fecha de ejecución: 2026-07-18. Directorio base salvo indicación: `/Users/edgardoruotolo/Sites/nextjs_projects/next-atlas-services`. Ningún comando aplicó correcciones. Los builds se hicieron en copias temporales y esas copias se eliminaron.

| Comando exacto o subcomando registrado | Objetivo | Exit | Duración | Resumen | Evidencia | Cambios en el proyecto |
|---|---|---:|---:|---|---|---|
| `git status --short` / `git branch --show-current` / `git rev-parse HEAD` / `git submodule status` | Congelar baseline | 0 | no registrada | Rama `main`, commit y submódulos identificados; árbol ya estaba sucio | README | No |
| `rg --files` y `find` acotados por aplicación | Inventario | 0 | no registrada | Estructura, tests, configuración e infraestructura | arquitectura actual | No |
| `pnpm lint` | Gate raíz | 1 | 0,425 s | Conflicto de configuraciones raíz de Biome | `evidencias/lint.txt` | No |
| `pnpm --filter frontend lint` | Lint Frontend | 0 | 0,413 s | 69 warnings | `evidencias/lint.txt` | No |
| `pnpm --filter backend lint` | Lint Backend | 1 | 0,421 s | 17 errores, 40 warnings | `evidencias/lint.txt` | No |
| `pnpm --filter appmobile lint` | Lint Mobile | 1 | 0,453 s | 7 errores, 31 warnings | `evidencias/lint.txt` | No |
| `pnpm --filter frontend exec tsc --noEmit --incremental false` | Typecheck Frontend | 0 | 3,425 s | Sin errores | `evidencias/typecheck.txt` | No |
| `pnpm --filter backend exec tsc --noEmit --incremental false` | Typecheck Backend | 0 | 2,076 s | Sin errores | `evidencias/typecheck.txt` | No |
| `pnpm --filter appmobile exec tsc --noEmit --incremental false` | Typecheck Mobile | 0 | 1,492 s | Sin errores | `evidencias/typecheck.txt` | No |
| `pnpm format:check` | Formato global | 2 | 8,317 s | Incluye artefactos nativos y Prettier no analiza decoradores Nest con la configuración actual | errores y warnings | No |
| `pnpm list -r --depth 0` | Inventario dependencias | 0 | no registrada | Stack y dependencias directas | `evidencias/dependencias.txt` | No |
| `pnpm outdated -r` | Versiones pendientes | distinto de 0 por paquetes desactualizados | no registrada | Salida informativa, sin upgrade | `evidencias/dependencias.txt` | No |
| `pnpm audit --prod --json` | Advisories | distinto de 0 por advisories | 2,719 s en la consulta resumida | 2 critical, 40 high, 69 moderate, 8 low en árbol combinado | `evidencias/vulnerabilidades.txt` | No |
| `pnpm dlx expo-doctor` | Compatibilidad Expo | 1 | no registrada | 15/18 checks; 3 fallos | `evidencias/dependencias.txt` | No en el proyecto; ejecución aislada |
| `pnpm exec next build` | Build Frontend | 0 | no registrada | Build productivo correcto en copia temporal; errores Backend capturados durante prerender | `evidencias/compilacion.txt` | No; copia aislada |
| `pnpm exec nest build` + `pnpm exec tsc-alias` + `pnpm exec prisma validate` | Build y schema Backend | 0 | no registrada | Build correcto y schema válido en copia temporal | `evidencias/compilacion.txt` | No; copia aislada |
| `pnpm exec expo export --platform web` | Validar export Mobile web | 0 | no registrada | 31 rutas; warning de ruta `(auth)` ausente | `evidencias/compilacion.txt` | No; copia aislada |
| `rg` de firmas sensibles en archivos rastreados e historial | Detección de secretos | 0 | no registrada | Sin coincidencias de alta confianza; no se leyeron `.env` ignorados | `evidencias/secretos.txt` | No |
| `rg -n ... '(TODO\|FIXME\|HACK\|XXX\|stub)' frontend/src backend/src appmobile/src` | Código incompleto | 0 | 0,2 s | Stubs confirmados de pagos, KYC e integraciones | hallazgos | No |
| `python3 .../ui-ux-pro-max/scripts/search.py ...` (3 consultas) | Checklist UX Web/Next/RN | 0 | 0,2 s total | Teclado, labels, touch targets y navegación | auditorías de capa | No |

## Comandos no ejecutados deliberadamente

- `pnpm install --frozen-lockfile`: ya existían `node_modules`; una instalación limpia alteraría cachés/estado y no era necesaria para el diagnóstico inicial.
- Playwright/E2E: pueden mutar datos y no tienen fixtures aisladas reproducibles.
- Tests de carga, estrés, DAST, backup/restore y migraciones: requieren un entorno aislado y autorización operativa inexistentes.
- Builds nativos EAS/App Store/Play Store: requieren credenciales/configuración externa y pueden crear artefactos.
- Gitleaks, Trivy y Semgrep: no instalados; no se instalaron herramientas por la prohibición de modificar el proyecto/entorno de trabajo.

## Intentos metodológicos fallidos

- Un primer build Frontend con `node_modules` enlazado desde la copia temporal falló por aislamiento de Turbopack/pnpm; no se clasificó como fallo del proyecto. Se repitió copiando los módulos dentro del entorno temporal y pasó.
- Un primer `expo-doctor` desde el subagente no pudo resolver el binario de pnpm. La ejecución aislada del coordinador sí corrió y produjo el resultado 15/18.

