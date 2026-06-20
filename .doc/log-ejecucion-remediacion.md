# Log de ejecución — Plan de remediación

> **Generado por:** opencode (glm-5.2)
> **Propósito:** registro detallado de cada fase para inspección posterior por Claude Code (doble control).
> **Convención:** una sección por fase ejecutada, con commits, verificaciones y desviaciones del plan.

---

## FASE 0 — Seguridad crítica — COMPLETA (con incidente)

### Estado final
- **Backend** `hireeoapp/hireeo-back` `main` = `4201aa5` (historial reescrito, 0 secretos, prod restaurada).
- **Global** `eruotolo/atlas-services-beta` `main` = `449a456` (historial reescrito, 0 secretos en branches).
- **Frontend / Appmobile**: no se tocaron (sin secretos en historial).

### 0.A — Commitear WIP pendiente (pre-filter-repo)
- `f9c7829` (backend) `chore: type-only imports, role enum literals, harden api-key guard` — 58 files. **⚠️ Este commit rompió producción (ver incidente abajo).**
- `2c1fecd` (global) `chore: add multi-host MCP configs and remediation plan` — 8 files.

### 0.B — Mover 3 secretos a env vars
- `c83653e` (backend) `security: move hardcoded secrets to env vars`:
  - `prisma/seed/roles-users/index.ts`: `SEED_SUPERADMIN_PASSWORD_EDGARDO`/`_LNUNEZ` (throw en prod, dummy en dev).
  - `prisma/seed/categories/index.ts`: `CLOUDINARY_CLOUD_NAME`/`_API_KEY`/`_API_SECRET` (throw en prod, skip uploads en dev).
  - `.env.example`: placeholders de las nuevas keys.
- `0bd8ffb` (backend) `security: move cloudinary creds to env in upload scripts`:
  - `scripts/upload-category-images.ts` + `.cjs`: leen `CLOUDINARY_*` vía `dotenv/config` (throw si faltan).
  - **Hallazgo no previsto por el plan:** los scripts de upload también tenían el secreto hardcodeado. filter-repo los redactó en historial; este commit los fixea en working tree.
- `0444c70` (global) `security: move postgres creds to env in docker-compose`:
  - `docker-database/docker-compose.yml`: `POSTGRES_USER`/`_PASSWORD`/`_DB` interpolados de `docker-database/.env`.
  - `docker-database/.env` creado (local, gitignored) con valores actuales (rotar en 0.D).
- `backend/.env` (local, gitignored): agregadas `SEED_SUPERADMIN_PASSWORD_*` y `CLOUDINARY_*` con valores reales.

### 0.C — filter-repo + force-push (one-way door, aprobado por usuario)
- `git-filter-repo` v2.47.0 instalado vía brew.
- Backups (clones espejo `--no-local`): `/var/folders/.../opencode/hireeo-filter-backup/{global,backend}.git` (preservados).
- Patrones: `patterns-backend.txt` (4 secretos), `patterns-global.txt` (1 secreto).
- filter-repo ejecutado en ambos clones. Verificación: 0 ocurrencias de los 5 secretos en historial reescrito, trees HEAD idénticos a working trees, 0 tags, commit counts preservados (backend 18, global 55).
- Force-push (aprobado): backend `main` (1 branch), global 8 branches (`main`, `develop`, `developer-2.1`, `feature/appmobile`, `feature/atlas2.0`, `feature/change-08-06`, `feature/hireo-2.0-branch`, `feature/visual-identity`).
- Re-sync working trees: `fetch forzado + reset --hard origin/main`. Untracked y gitignored (.env) preservados.
- Puntero submódulo backend en el global actualizado (`git add backend && commit`) — filter-repo no reescribe gitlinks.
- Lockfile del backend desactualizado tras `f9c7829` (agregó `@biomejs/biome` sin regenerar): `bd6e3a3` `fix: regenerate pnpm-lock.yaml` con pnpm@9.15.9 (`--ignore-workspace` porque el backend es submódulo del workspace global).

### 🔴 Incidente — Fase 0.C rompió producción (resuelto)

**Síntoma:** tras el force-push, `api.hireeo.app/api/v1/*` devolvía 500 `FUNCTION_INVOCATION_FAILED` en todas las rutas. El frontend perdió conexión con el backend.

**Causa raíz:** el commit `f9c7829` (WIP commiteado "tal cual" por decisión del usuario) convirtió **96 imports de clases inyectables** (`PrismaService`, `Services`, `ConfigService`, `Gateways`) de `import { X }` a `import type { X }`. TypeScript borra `import type` en runtime → NestJS perdía los tokens de inyección de dependencias → `Nest can't resolve dependencies of the UsersService (?)` → crash al bootstrap → todas las rutas 500. Era un intento de silenciar la regla `useImportType` de biome 2.2.0, pero biome no puede saber que NestJS necesita esos imports en runtime como tokens de DI.

**Error de verificación de opencode:** se corrió `pnpm lint && pnpm build` (pasaron — `import type` es TS válido y compila) pero **no se arrancó el backend**. El fallo solo aparece en runtime al resolver la DI. **Lección:** después de cualquier cambio en el backend, arrancar el server y hacer curl a un endpoint antes de pushear.

**Fix (`4201aa5`):**
1. `git revert --no-edit f9c7829` (`6034f18`) → restauró la DI, runtime funcional.
2. Re-agregó `@biomejs/biome` 2.2.0 + `biome.json` (devDep para lint, no afecta runtime).
3. **Desactivó `useImportType`** en `biome.json` (la regla culpable).
4. Bajó a `warn` reglas ruidosas con deuda preexistente: `noExplicitAny`, `noNonNullAssertion`, `useNumberNamespace`, `noInferrableTypes`. Silenció con `biome-ignore` los `any` legítimos del handler serverless de Vercel en `main.ts` y el `DATABASE_URL!` en `prisma.service.ts`.
5. Fixeo 3 errors de template-literals en stubs de `notifications.service.ts` y `subscriptions.service.ts`.

**Verificación:** lint (0 errors, 39 warnings) + build + arranque local (GET `/categories` 200, `/geo/countries` 200) + **producción `api.hireeo.app` 200 en ambos endpoints**.

**Deuda dejada (no del incidente, preexistente):** 39 warnings de lint para limpiar gradualmente. Fase 1.1 (Role enum) y 1.5 (timingSafeEqual) descartadas por el revert — **re-aplicar correctamente** (con imports normales, no `import type`).

### 0.C.6 — Residual no purgeable vía API
- **Global:** los 12 `refs/pull/*` (PRs merged/closed) preservan commits viejos con `REDACTED` (Postgres password). GitHub no permite borrar PRs mergeados ni sus refs vía API (`gh pr delete` solo funciona en PRs abiertos; hay 0).
- **Mitigación:** rotar el Postgres password (0.D) invalida el secreto residual.
- **Purga total (opcional, destructiva):** contactar GitHub support o recrear el repo (pierde issues/PRs/stars). No recomendado ahora.
- **Backend:** 0 PR refs viejos — 100% limpio.

### 0.D — Rotación manual de secretos (PENDIENTE — ejecuta el usuario)

Estas acciones invalidan los secretos viejos (incluido el residual en PR refs del global). **El más urgente: Postgres password** (único que quedó accesible en PR refs).

1. **Postgres password** (urgente, residual en PR refs):
   ```sql
   ALTER USER eruotolo WITH PASSWORD '<nuevo>';
   ```
   Vía `psql` o Adminer (`localhost:8080`). Luego actualizar:
   - `docker-database/.env` → `POSTGRES_PASSWORD=<nuevo>`
   - `backend/.env` → `DATABASE_URL` y `DIRECT_DATABASE_URL` (reemplazar password)
   - Vercel backend → variables de entorno `DATABASE_URL` / `DIRECT_DATABASE_URL`
   - Reiniciar container: `cd docker-database && docker compose down && docker compose up -d`

2. **Super-admin passwords:**
   - Setear nuevos valores en `backend/.env`: `SEED_SUPERADMIN_PASSWORD_EDGARDO`, `SEED_SUPERADMIN_PASSWORD_LNUNEZ`.
   - Ejecutar `pnpm --filter backend db:seed` (el seed hace upsert con hash bcrypt nuevo).
   - Alternativa: cambiar el hash vía Prisma Studio (`pnpm --filter backend db:studio`).

3. **Cloudinary api_secret:**
   - Dashboard Cloudinary → Settings → API Keys → revocar key `527633178561754` → generar nueva.
   - Actualizar `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` en `backend/.env` y en Vercel backend.

4. **PAT GitHub** (`ghp_KwbXvrky...`, omitido por decisión del usuario):
   - Quedó expuesto en los remotes de los 3 submódulos y en output de sesión.
   - Si se decide rotar: `github.com/settings/tokens` → revoke → crear nuevo → actualizar remotes (`git -C <app> remote set-url origin <nueva-url>`).

### 0.E — /cso review
- **Pendiente.** Se ejecutará al final del bloque de seguridad.

### 0.F — Obsidian + punteros
- Punteros backend/global sincronizados tras el incidente.
- Append a Obsidian: pendiente (se hace al cerrar 0.E).

### 0.E — /cso review (focalizado en cambios de la Fase 0)

**Scope:** solo los archivos/áreas tocados en la Fase 0 (secrets, filter-repo, env vars, incidente backend). No es un full-scan del repo (eso sería `/cso` completo de 14 fases).

**Hallazgos:**

| # | Check | Estado | Nota |
|---|---|---|---|
| 1 | Secretos en working trees (código trackeado) | ✅ 0 | backend/src+prisma+scripts y docker-database limpios |
| 2 | .env files trackeados por error | ✅ 0 | global y backend: 0 .env en git ls-files |
| 3 | docker-database/.env gitignored | ✅ | `git check-ignore` confirma; no trackeado |
| 4 | .env.example sin valores reales | ✅ | SEED_* y CLOUDINARY_* como placeholders vacíos |
| 5 | Secretos en branches remotas (historial) | ✅ 0 | backend y global: 0 ocurrencias en origin/* |
| 6 | Residual PR refs global (REDACTED) | ⚠️ conocido | 1 ocurrencia en refs/pull/* (no purgeable vía API); mitigado por rotación 0.D |
| 7 | forbidNonWhitelisted (incidente) | ✅ restaurado a true | El revert lo dejó en `true` (más seguro que el `false` del WIP) |
| 8 | ApiKeyGuard comparación timing-safe | ❌ pendiente | Sigue `apiKey !== validKey` (no timing-safe) → **Fase 1.5** |
| 9 | WebhookGuard comparación timing-safe | ❌ pendiente | Sigue `secret !== WEBHOOK_SECRET` → **Fase 1.5** |

**Veredicto Fase 0:** ✅ COMPLETA con un residual conocido (PR refs) mitigado por rotación manual pendiente (0.D). Los items 8-9 no son de la Fase 0, son de la Fase 1.5 (se ejecutan después).

**Confianza:** 8/10 (gate de daily mode). Bajaría si la rotación 0.D no se ejecuta — el secreto residual en PR refs quedaría activo.

