# Errores y warnings

Resultado de las herramientas automáticas ejecutadas el 2026-07-19 contra el commit `bc57586`.

## Resumen general

| Herramienta | Capa | Errores | Warnings | Notas |
|---|---|---|---|---|
| `tsc --noEmit` | backend | 0 | 0 | ✅ Limpio |
| `tsc --noEmit` | frontend | 0 | 0 | ✅ Limpio |
| `tsc --noEmit` | appmobile | 0 | 0 | ✅ Limpio |
| `pnpm build` (nest) | backend | 0 | 0 | ✅ Compila |
| `pnpm lint` (biome) | backend | 17 | 40 | ❌ |
| `pnpm lint` (biome) | frontend | — | — | ❌ `biome: command not found` |
| `pnpm lint` (biome) | appmobile | 7 | 31 | ❌ |
| `pnpm audit --prod` | backend (workspace) | 119 vulns | 2 crit, 40 high, 69 mod, 8 low | ❌ |
| `pnpm audit --prod` | frontend | 30 vulns | 13 high, 14 mod, 3 low | ❌ |
| `pnpm audit --prod` | appmobile (workspace) | 119 vulns | 2 crit, 40 high, 69 mod, 8 low | ❌ |

---

## Tabla de errores y warnings

| ID | Mensaje | Herramienta | Capa | Archivo | Severidad | Causa | Solución | Estado |
|---|---|---|---|---|---|---|---|---|
| E001 | `lint/suspicious/noExplicitAny` | biome | backend | `modules/notifications/dto/create-notification.dto.ts:22` | Warning | `data?: any` en DTO | Tipar como `Record<string, unknown>` o `JsonValue` | Pendiente |
| E002 | `lint/suspicious/noExplicitAny` (×2) | biome | backend | `src/main.ts:13,86` | Warning | `cachedServer: any`, `handler(req: any, res: any)` | Tipar con `FastifyInstance`/`RequestHandler` | Pendiente |
| E003 | `lint/style/useNumberNamespace` (×varios) | biome | backend | `modules/quotes/quotes.service.ts:31`, `modules/interactions/interactions.controller.ts:40-41` | Warning | `parseFloat`/`parseInt` globales | `Number.parseFloat`/`Number.parseInt` | Pendiente |
| E004 | `biome: command not found` | shell | frontend | `frontend/package.json:10` | Error | `lint: "biome check"` pero el binario no está instalado | `pnpm --filter frontend add -D @biomejs/biome` o cambiar script a `npx biome check` | Pendiente |
| E005 | `lint/suspicious/noEmptyBlockStatements` (×3) | biome | appmobile | `src/app/(tabs)/profile.tsx:258,265,272` | Error | `onPress={() => {}}` y `onPress={() => handleProtected(() => {})}` | Implementar handler real o añadir comentario | Pendiente |
| E006 | Diagnostics excede el límite (39 no mostrados backend, 18 mobile) | biome | ambos | — | Info | `--max-diagnostics` default | `biome check --max-diagnostics=200` para ver todos | Pendiente |
| E007 | `"pnpm"` field in package.json ignored | pnpm warn | backend | `backend/package.json:5` | Info | `packageManager` field legacy | Migrar `onlyBuiltDependencies` a `pnpm-workspace.yaml` | Pendiente |
| V001 | Next.js null origin bypass dev HMR CSRF | pnpm audit | frontend | `next@16.1.1` | Low (dev-only) | `GHSA-jcc7-9wpm-mj36` | `next@>=16.1.7` | Pendiente |
| V002 | Next.js cache poisoning via RSC cache-busting | pnpm audit | frontend | `next@16.1.1` | Low ( patched 16.2.5) | `GHSA-vfv6-92ff-j949` | `next@>=16.2.5` | Pendiente |
| V003 | Next.js middleware/proxy cache poisoning | pnpm audit | frontend | `next@16.1.1` | Low | `GHSA-3g8h-86w9-wvmq` | `next@>=16.2.5` | Pendiente |
| V004 | Next.js DoS (Server Components) | pnpm audit | frontend | `next@16.1.1` | High | `>=16.0.0 <16.2.5` | `next@>=16.2.5` | Pendiente |
| V005 | Next.js otras variantes (×9 advisories high) | pnpm audit | frontend | `next@16.1.1` | High | Varias | `next@>=16.2.6` | Pendiente |
| V006 | `minimatch` vulnerable (×3) | pnpm audit | frontend | `@google/genai > google-auth-library` | High | `>=9.0.0 <9.0.7` | Update `@google/genai` o override | Pendiente |
| V007 | `ws` DoS por fragmentos pequeños | pnpm audit | workspace | `expo>@expo/cli>ws`, `socket.io-client>engine.io-client>ws`, `@google/genai>ws` | High (CVSS 7.5) | `GHSA-96hv-2xvq-fx4p` (CVE-2026-48779) | `ws@>=8.21.0` o override | Pendiente |
| V008 | `undici` WebSocket DoS | pnpm audit | appmobile | `expo>@expo/cli>undici` | High (CVSS 7.5) | `GHSA-vxpw-j846-p89q` (CVE-2026-12151) | `undici@>=6.27.0` | Pendiente |
| V009 | `undici` Set-Cookie SameSite downgrade | pnpm audit | appmobile | `expo>@expo/cli>undici` | Low | `GHSA-g8m3-5g58-fq7m` | `undici@>=6.27.0` | Pendiente |
| V010 | `multer` DoS via nested field names | pnpm audit | backend | `@nestjs/platform-express>multer@2.0.2` | High (CVSS 7.5) | `GHSA-72gw-mp4g-v24j` (CVE-2026-5079) | `multer@>=2.2.0` + `limits.fieldNestingDepth` | Pendiente |
| V011 | `hono` vulnerabilidad | pnpm audit | backend | `@prisma/client>prisma>@prisma/dev>hono` | High (CVSS 7.1) | `GHSA-88fw-hqm2-52qc` (CVE-2026-54290) | Dev dependency; update Prisma cuando lancen fix | Pendiente |
| V012 | `esbuild` arbitrary file read (Windows) | pnpm audit | appmobile | `nativewind>tailwindcss>postcss-load-config>tsx>esbuild` | Low (Windows only) | `GHSA-g7r4-m6w7-qqqr` | Dev dependency; update nativewind cuando fix | Pendiente |

> **Nota importante sobre `pnpm audit`**: El backend y appmobile comparten workspace (`pnpm-workspace.yaml`) por lo que el conteo (119) incluye vulnerabilidades transitivas del otro. Muchas están en **dev dependencies** (Prisma dev, Expo CLI, nativewind dev) y **no llegan a producción**. Sin embargo, V004-V007 (Next.js, ws, undici) y V010 (multer) **sí llegan a producción** y son las prioritarias.

---

## Detalle de comandos

### Typecheck — ✅
```
backend:   npx tsc --noEmit  →  EXIT 0
frontend:  npx tsc --noEmit  →  EXIT 0
appmobile: npx tsc --noEmit  →  EXIT 0
```

### Build backend — ✅
```
pnpm build → nest build && tsc-alias → EXIT 0
```

### Lint backend — ❌
```
pnpm lint → 17 errors, 40 warnings (diagnostics limit reached, 39 hidden)
Categorías: noExplicitAny (varios), useNumberNamespace (varios), noEmptyBlockStatements
```

### Lint frontend — ❌ (roto)
```
pnpm lint → "$ biome check" → sh: biome: command not found → EXIT 1
```
**Root cause**: `package.json:10` declara `"lint": "biome check"` pero `@biomejs/biome` no está en `devDependencies`. Probablemente se instaló globalmente en algún momento o se espera que venga del workspace raíz (no encontrado).

### Lint appmobile — ❌
```
pnpm lint → 7 errors, 31 warnings
Categorías: noEmptyBlockStatements (profile.tsx), unused vars, etc.
```

### Audit resumen
```
backend (workspace):   119 vulns (2 critical, 40 high, 69 moderate, 8 low)
frontend:               30 vulns (13 high, 14 moderate, 3 low)
appmobile (workspace): 119 vulns (2 critical, 40 high, 69 moderate, 8 low)
```

---

## Recomendación

1. **Inmediato**: Arreglar `E004` (frontend lint roto). Sin esto, el frontend no se está limeando en CI/local.
2. **Inmediato**: `next@>=16.2.6` para cerrar 13 CVEs HIGH de una sola actualización.
3. **Inmediato**: `multer@>=2.2.0` (V010).
4. **Corto plazo**: Limpiar errores biome (`E001-E003`, `E005`) — todos auto-fixeables con `biome check --write`.
5. **Corto plazo**: Agregar `overrides` en `pnpm-workspace.yaml` para forzar `ws@>=8.21.0`, `undici@>=6.27.0`.
6. **Corto plazo**: Agregar CI que ejecute lint + typecheck + audit + build en cada PR (TRANSV-002).

Las evidencias completas están en [`evidencias/`](./evidencias).
