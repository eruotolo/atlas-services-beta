# Entorno local con Docker

Todo el stack de Hireeo corre bajo el proyecto Docker **`hireeo`**. El único
componente que queda fuera es `appmobile` (Expo necesita la red del host para el
QR y el dev client, así que se corre nativo).

## Servicios

| Servicio | Contenedor | URL / Puerto | Qué es |
|---|---|---|---|
| `frontend` | `hireeo-frontend` | http://localhost:3333 | Next.js 16 en modo dev |
| `backend` | `hireeo-backend` | http://localhost:4000/api/v1 | NestJS en modo watch |
| `postgres` | `hireeo-postgres` | `localhost:5435` | PostgreSQL 16 |
| `adminer` | `hireeo-adminer` | http://localhost:8081 | GUI de la base de datos |

> El puerto de Postgres es **5435**, no el 5433 habitual: ese ya lo ocupa otro
> proyecto en esta máquina.

## Arranque

```bash
cd /Users/nluis/Documents/Hireeo/workspace

cp .env.example .env      # solo la primera vez, y completá la password
docker compose up -d --build
```

La primera build tarda unos minutos (instala las dependencias dentro de la
imagen). Las siguientes son casi instantáneas mientras no cambien los
`package.json`.

Los contenedores tienen `restart: unless-stopped`, así que vuelven a levantar
solos cuando arranca Docker Desktop.

## Uso diario

```bash
docker compose up -d              # levantar
docker compose down               # bajar (los datos de Postgres persisten)
docker compose ps                 # estado y salud
docker compose logs -f frontend   # seguir logs de un servicio
docker compose logs -f            # seguir todos
docker compose restart backend    # reiniciar uno solo
```

## Bajar lo que está en prod

Prod es el Vercel de Hireeo, que despliega desde `main` de los repos de
`hireeoapp`. Para traer eso a local y dejar el stack listo:

```bash
./docker/sync
```

Hace, en orden: verifica que los submódulos estén limpios (si no, aborta sin
tocar nada), trae `origin/main` con fast-forward, decide si hace falta rebuild,
levanta el stack, espera los healthchecks, aplica migraciones pendientes y
valida las URLs.

```bash
./docker/sync --force-rebuild     # reconstruir aunque no cambien dependencias
./docker/sync --skip-migrations   # sin tocar la base
./docker/sync --no-pull           # solo levantar y validar
./docker/check-urls               # solo validar (41 chequeos)
```

### Por qué a veces reconstruye y a veces no

Si solo cambió código, **no reconstruye**: el bind mount ya lo trae y el
hot-reload se encarga. Segundos en vez de minutos.

Reconstruye cuando cambia algún `package.json`. Y ahí hay una trampa propia de
este repo: el `pnpm-lock.yaml` vive en el **paraguas**, pero los `package.json`
viven en los **submódulos**. Cuando un submódulo suma una dependencia, el
lockfile del paraguas queda viejo y el `pnpm install --frozen-lockfile` de la
imagen falla. Por eso el script regenera el lockfile antes de construir.

> Es el mismo problema que en prod esquivaron poniendo
> `"installCommand": "pnpm install --no-frozen-lockfile"` en
> `frontend/vercel.json`.

Después de sincronizar, el paraguas va a mostrar los punteros de submódulo
modificados y quizá el `pnpm-lock.yaml`. Es normal: el paraguas todavía apunta a
los commits viejos. Commitearlo es decisión tuya, el script no lo toca.

## Base de datos

Los datos viven en `docker-database/postgres-data/` (bind mount, ignorado por
git). Sobreviven a `docker compose down`.

```bash
# migraciones y seed
docker compose run --rm backend pnpm --filter backend db:migrate
docker compose run --rm backend pnpm --filter backend db:seed

# consola SQL
docker compose exec postgres psql -U hireeo -d db_hireeo
```

Acceso por Adminer (http://localhost:8081): server `postgres`, usuario `hireeo`,
base `db_hireeo`, password la de tu `.env`.

### Usuarios sembrados

- `nluis@outlook.com` — SuperAdmin
- `edgardoruotolo@gmail.com` — SuperAdmin
- `test_provider@example.com` — **no sirve para login**, el seed le pone un
  password dummy sin hashear

Las passwords de los SuperAdmin salen de `SEED_SUPERADMIN_PASSWORD_*` en
`backend/.env.local`.

## Hot-reload

Funciona en los dos servicios: el código se monta por bind mount y los
`node_modules` quedan tapados con volúmenes anónimos (pnpm usa symlinks al store
de la raíz, por eso hay que preservar los tres niveles).

El backend necesita `TSC_WATCHFILE`/`TSC_WATCHDIRECTORY=DynamicPriorityPolling`
porque los eventos de filesystem de macOS no cruzan el bind mount. Consecuencia
práctica: **un `touch` no dispara la recarga**, el polling de tsc compara
contenido. Hay que cambiar el archivo de verdad.

## La URL del backend son dos, no una

El navegador y el código server-side del frontend llegan al backend por
direcciones distintas:

| Dónde corre | Variable | Valor |
|---|---|---|
| Navegador | `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` |
| Servidor (dentro del contenedor) | `INTERNAL_API_URL` | `http://backend:4000/api/v1` |

Lo resuelve `frontend/src/lib/api/apiBaseUrl.ts`. Fuera de Docker no hace falta
definir `INTERNAL_API_URL`: ambos lados caen en `NEXT_PUBLIC_API_URL` y todo
sigue funcionando igual.

> **No usar `network_mode: "service:backend"`.** Se probó como alternativa para
> tener una sola variable. Funciona hasta que el contenedor de backend reinicia:
> ahí se recrea el namespace de red y el frontend queda **sin red**, aunque
> Docker lo siga reportando `healthy` (su healthcheck corre dentro del namespace
> viejo). Los puertos publicados quedan huérfanos y hay que reiniciar el
> frontend a mano.

## Variables de entorno

| Archivo | Para qué | Versionado |
|---|---|---|
| `.env` | credenciales de Postgres que lee el compose | no (hay `.env.example`) |
| `backend/.env.local` | JWT, API_KEY, secretos del backend | no |
| `frontend/.env.local` | NextAuth, API_KEY | no |

Dentro de Docker, el compose inyecta `DATABASE_URL` apuntando a
`postgres:5432`, lo que pisa el valor de `backend/.env.local` (que apunta a
`localhost:5435`, para cuando se corre fuera de Docker). Funciona porque dotenv
no sobrescribe variables que ya están en `process.env`.

### Ojo: los `.env.example` de los submódulos están desactualizados

- El frontend lee `process.env.API_KEY` (server-side), **no**
  `NEXT_PUBLIC_API_KEY` como dice su `.env.example`. Con el nombre equivocado,
  las páginas de admin y config fallan con "API Key inválida".
- NextAuth v4 necesita `NEXTAUTH_URL` y `NEXTAUTH_SECRET`; el `.env.example`
  solo menciona `AUTH_URL` y `AUTH_SECRET`.
- El backend necesita un `backend/.env` además del `.env.local`, porque
  `prisma.config.ts` hace `import 'dotenv/config'` (que solo lee `.env`)
  mientras que NestJS lee `.env.local`. Está resuelto con un symlink
  `backend/.env -> .env.local`. Sin él, `prisma migrate dev` falla con
  *"datasource.url property is required"*.

## Correr fuera de Docker

Sigue funcionando, por si hace falta:

```bash
docker compose up -d postgres adminer   # solo la base
pnpm dev                                # frontend + backend nativos
```

Los `.env.local` ya apuntan a `localhost:5435`, así que no hay que tocar nada.
Eso sí, bajá los contenedores de `frontend` y `backend` antes, o chocan los
puertos.

## Rutas útiles

Están en **inglés**, no en español como dice el `CLAUDE.md`
(`/cl/buscar` da 404):

- http://localhost:3333/cl — home Chile
- http://localhost:3333/cl/search — búsqueda con filtros geo
- http://localhost:3333/cl/pricing — planes premium (CLP)
- http://localhost:3333/es — España (EUR)
- http://localhost:3333/login

Las integraciones externas (Stripe, MercadoPago, OAuth, email) no están
configuradas: se cargan desde la UI de SuperAdmin en `/config/integrations`.
