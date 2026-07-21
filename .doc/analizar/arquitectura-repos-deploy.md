# Arquitectura de Repositorios y Deploy — Hireeo

> Documento generado el 2026-06-20. Explica cómo está organizado el versionado
> del proyecto (repo global + sub-repos por app) y cómo despliega el backend en
> Vercel. Complementa `.doc/deuda-tecnica.md` (DT-03, DT-14).

---

## 1. Modelo de repositorios

El proyecto usa **un repo global + un repo independiente por app**, conectados
mediante **git submodules**.

```
atlas-services-beta  (repo GLOBAL — github.com/eruotolo/atlas-services-beta)
│  .gitmodules          ← registra las 3 apps como submódulos
├── frontend/   ─submódulo→  github.com/hireeoapp/hireeo-front   (deploy Vercel)
├── backend/    ─submódulo→  github.com/hireeoapp/hireeo-back    (deploy Vercel)
└── appmobile/  ─submódulo→  github.com/hireeoapp/hireeo-mobile  (build EAS/Expo)
```

### Roles

| Repo | Rol | Fuente de verdad |
|------|-----|------------------|
| **Global** (`atlas-services-beta`) | Respaldo total + vista unificada. Guarda una **referencia (commit SHA)** a cada app, no su código duplicado. | De la *combinación coherente* de versiones |
| **`hireeo-front`** | App Next.js. Autónoma para deploy en Vercel. | Del frontend |
| **`hireeo-back`** | API NestJS. Autónoma para deploy en Vercel. | Del backend |
| **`hireeo-mobile`** | App Expo/React Native. | Del mobile |

**Principio clave:** cada sub-repo es **autosuficiente** — contiene todo lo
necesario para construirse solo (su `package.json`, `.npmrc`, `pnpm-lock.yaml`,
`vercel.json`). Vercel clona *solo* `hireeo-back` y debe poder buildear sin
depender de archivos de la raíz.

---

## 2. Workflow diario

### Clonar el proyecto completo
```bash
git clone --recurse-submodules https://github.com/eruotolo/atlas-services-beta.git
# Si ya clonaste sin submódulos:
git submodule update --init --recursive
```

### Trabajar en una app (ej. backend)
```bash
cd backend                      # es un repo git normal
git checkout -b fix/algo
# ...cambios...
git commit -m "fix: ..."
git push origin main            # esto dispara el deploy en Vercel
```

### Congelar una "foto" coherente del proyecto en el global
```bash
cd ..                           # raíz (repo global)
git add backend                 # registra el nuevo commit del submódulo
git commit -m "bump backend to <sha>"
git push
```

> El global **no** se actualiza solo. Cuando una app avanza, hay que hacer
> `git add <app>` + commit en el global para mover el puntero. Esto es el único
> costo del modelo de submódulos.

---

## 3. Deploy del backend en Vercel (cómo funciona)

`hireeo-back` despliega como **función serverless** en Vercel. La configuración
vive enteramente en el repo (no en el dashboard).

### Archivos clave

**`vercel.json`**
```json
{
    "framework": null,
    "installCommand": "pnpm install --frozen-lockfile",
    "buildCommand": "pnpm run build",
    "rewrites": [{ "source": "/(.*)", "destination": "/api" }]
}
```

**`api/index.js`** — entrypoint serverless que carga el handler compilado:
```js
const app = require('../dist/main.js');
module.exports = app.default || app;
```

**`package.json`** (campos relevantes):
```json
{
    "packageManager": "pnpm@9.15.9",
    "engines": { "node": "22.x" }
}
```

**`.npmrc`**:
```
ignore-scripts=false
network-concurrency=1
```

**`public/index.html`** — directorio estático mínimo (requisito del preset Other).

### Por qué cada pieza

| Pieza | Razón |
|-------|-------|
| `framework: null` | El preset "NestJS" **no** empaqueta la carpeta `api/`. Con "Other" (null), Vercel detecta `api/index.js` como función serverless. |
| `api/index.js → dist/main.js` | `main.ts` exporta `export default handler`. El build (`nest build` + `tsc-alias`) genera `dist/main.js` con los path-aliases ya resueltos. |
| `pnpm-lock.yaml` commiteado | **Sin lockfile, pnpm resuelve todo el árbol desde el registry y dispara el bug `ERR_INVALID_THIS` de undici en el build de Vercel.** Con lockfile, el install es determinista y no falla. (Causa raíz del histórico 404/500.) |
| `packageManager: pnpm@9.15.9` | pnpm 9 **ejecuta los build scripts** (Prisma engines, bcrypt) con `ignore-scripts=false`. pnpm 10+ los ignora por defecto y rompía Prisma/bcrypt en runtime. |
| `engines.node: 22.x` | Node 22 LTS estable (evita el 24.x default). |
| `--frozen-lockfile` | Install reproducible e idéntico al validado localmente. |
| `public/` | Con `framework: null`, Vercel exige un directorio de salida estático. El `rewrite` manda todo a `/api`, así que esta página nunca se sirve. |

### Flujo de una request en producción
```
GET https://api.hireeo.app/api/v1/categories
        │
        ├─ Vercel: no es archivo estático → aplica rewrite /(.*) → /api
        │
        ├─ Invoca la función api/index.js → carga dist/main.js (NestJS)
        │
        ├─ NestJS (globalPrefix api/v1) rutea a CategoriesController
        │     · ApiKeyGuard global valida el header x-api-key
        │
        └─ 200 + JSON   (sin header x-api-key → 401, comportamiento correcto)
```

El frontend (`hireeo-front`) consume la API vía `lib/api/apiClient.ts`, que envía
`x-api-key` automáticamente y apunta a `NEXT_PUBLIC_API_URL=https://api.hireeo.app/api/v1`.

---

## 4. Variables de entorno (Vercel — proyecto hireeo-back)

Cargadas en el dashboard (Production + Preview). Las críticas:
`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `API_KEY`, `FRONTEND_URL`,
`WEBHOOK_SECRET`.

> ⚠️ `API_KEY` (backend) **debe** coincidir con `NEXT_PUBLIC_API_KEY` (frontend),
> o el `ApiKeyGuard` rechaza todo con 401.

---

## 5. Notas de operación / pendientes

- **Promoción a producción:** los push a `main` generan un deployment Production
  pero (por el estado heredado) hubo que **promover manualmente** el último build
  para que `api.hireeo.app` lo sirviera. Vigilar que el próximo push se
  auto-promueva; si no, promover en Vercel → Deployments → "Promote to Production".
- **CORS:** `FRONTEND_URL` debería incluir `https://hireeo.app,https://www.hireeo.app`
  (el dominio canónico redirige a `www`). Necesario para llamadas client-side.
- **🔴 Seguridad:** el PAT de GitHub estuvo embebido en texto plano en los remotes
  de los sub-repos. **Rotarlo** (GitHub → Settings → Developer settings → revocar)
  y usar un credential helper en vez de incrustarlo en la URL.
