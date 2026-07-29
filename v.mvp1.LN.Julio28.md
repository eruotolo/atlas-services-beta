# v.mvp1.LN — 28 de julio de 2026

Registro de cambios de la sesión. Autor: LN.

---

## 1. Entorno local dockerizado

Todo el stack corre bajo el proyecto Docker **`hireeo`**. Antes solo la base estaba
en contenedor y las apps se corrían nativas.

| Servicio | Contenedor | Puerto |
|---|---|---|
| Frontend (Next.js 16, dev) | `hireeo-frontend` | 3333 |
| Backend (NestJS, watch) | `hireeo-backend` | 4000 |
| PostgreSQL 16 | `hireeo-postgres` | 5435 |
| Adminer | `hireeo-adminer` | 8081 |

**Archivos nuevos** (en el repo paraguas, sin tocar submódulos):
`docker-compose.yml`, `docker/backend.dev.Dockerfile`, `docker/frontend.dev.Dockerfile`,
`docker/README.md`, `.dockerignore`, `.env` + `.env.example`.

**Eliminado:** `docker-database/docker-compose.yml` (quedó obsoleto). La carpeta
`docker-database/postgres-data/` con los datos se conserva.

Detalles:
- Postgres en **5435**, no 5433: ese puerto ya lo ocupa `rp-inventory-db-1` de otro proyecto.
- Credenciales de la DB movidas del `docker-compose.yml` (estaban en claro en un repo
  público) a `.env`, que está en el `.gitignore`.
- Hot-reload en ambos servicios. El backend necesita
  `TSC_WATCHFILE`/`TSC_WATCHDIRECTORY=DynamicPriorityPolling` porque los eventos de
  filesystem de macOS no cruzan el bind mount.
- Healthchecks en los cuatro servicios y `restart: unless-stopped`.
- `appmobile` queda fuera de Docker: Expo necesita la red del host.

## 2. Scripts de trabajo

Ambos en `scripts/` (ojo: `/scripts/` está en el `.gitignore` del paraguas, así que
por ahora son locales).

- **`./docker/sync`** — baja `origin/main` de los 3 submódulos, decide si hace falta
  rebuild, levanta el stack, aplica migraciones pendientes y valida. Flags:
  `--force-rebuild`, `--skip-migrations`, `--no-pull`. Aborta si algún submódulo tiene
  cambios sin commitear.
- **`./docker/check-urls`** — 41 chequeos sobre frontend, API e infra. Verifica el
  código esperado, no solo que responda: las rutas protegidas deben dar 307, así que un
  200 ahí se reporta como fallo.

## 3. Auth — solo Google

**Frontend** (`hireeo-front`):
- Apple y Microsoft ocultos del login. No se borró el código: quedan detrás de
  `ENABLED_OAUTH_PROVIDERS` en `src/features/auth/lib/oauth-providers.ts` (archivo
  nuevo). Reactivarlos es sumarlos a esa lista, volver a instanciar su provider y su
  botón, y cargar credenciales.
- El route handler de NextAuth ya no instancia providers sin credenciales. Antes creaba
  Apple y Azure AD siempre con `clientId: ''`, que era el origen del error genérico
  *"Hubo un problema al iniciar sesión con el proveedor seleccionado"*.
- Si Google está habilitado pero sin credenciales, loguea un aviso claro en vez de
  fallar en silencio.

**Credenciales de Google:** proyecto `hireeo` en Google Cloud, cuenta `luisnuy@gmail.com`,
con `edgardoruotolo@gmail.com` como co-owner. Cargadas cifradas (AES-256-GCM) en la tabla
`integrations` vía `/config/integrations`. Publishing status en *Testing*, con ambos
correos como test users.

## 4. Seguridad — validación de Google endurecida

`backend/src/modules/auth/auth.service.ts`, en `googleLogin()`. Dos agujeros que estaban
abiertos:

- **No se validaba el claim `aud`.** El endpoint `tokeninfo` de Google valida la *firma*
  del token, pero no que haya sido emitido para esta app. Como `POST /auth/google` es
  `@Public()`, cualquiera con su propia app de Google podía mandar un id_token válido de
  otro cliente y entrar como ese usuario. Ahora se compara contra el Client ID configurado.
- **No se validaba `email_verified`.** Combinado con el `upsert` por email, alguien podía
  reclamar el email de un usuario ya registrado con contraseña. Ahora se exige verificado.

## 4b. Seguridad — Apple y Microsoft cerrados en el servidor

Apagar los botones no alcanzaba: `POST /auth/apple` y `POST /auth/microsoft` son
`@Public()` y se podían llamar directo, sin pasar por ninguna UI. Se comprobó que
respondían y procesaban peticiones.

El caso grave era Microsoft: `microsoftLogin()` valida el token contra Microsoft Graph
pero **no verifica que haya sido emitido para Hireeo**. Cualquiera con su propia app de
Azure podía generar un token de Graph y entrar como ese usuario; como el `upsert` es por
email, podía caer sobre una cuenta existente. Apple estaba mejor cubierto (valida
`audience` y falla si falta `APPLE_CLIENT_ID`), pero igual se cerró.

Ahora ambos métodos cortan de entrada con `assertProviderEnabled()`, contra la constante
`ENABLED_OAUTH_PROVIDERS` del backend (espejo de la del frontend):

```
POST /auth/microsoft  → 401 "El acceso con Microsoft no está habilitado."
POST /auth/apple      → 401 "El acceso con Apple no está habilitado."
POST /auth/google     → sigue operativo
```

> Para reactivar Apple o Microsoft hay que sumarlos a esa constante **y**, antes,
> agregarles la validación de `aud` como la de `googleLogin()`. Encenderlos sin eso
> reabre el robo de cuentas por email.

## 5. Bug corregido — usuarios de OAuth sin país

**Síntoma:** entrabas con Google, el usuario se creaba bien en la base, pero la app te
dejaba clavado en `/login` como si no hubieras entrado.

**Causa:** `register()` asigna el rol `Client` **con país**; `googleLogin()` lo creaba
**sin país**. `redirectByRole()` manda a `/login?error=no-country` a cualquier usuario que
no sea SuperAdmin y no tenga país, y `useAuthRedirect` corta ahí sin redirigir. Quedabas
autenticado pero sin poder entrar.

**Solución:** el país viaja desde el frontend (cookie `hireeo_country`, con el mismo
fallback `cl` que usa `proxy.ts`) hasta `googleLogin()`, que ahora crea el rol con país.

Archivos: `auth.service.ts`, `auth.controller.ts` (backend);
`features/auth/lib/auth.service.ts`, `app/api/auth/[...nextauth]/route.ts` (frontend).

## 6. Corrección de diseño — red de Docker

La primera versión del compose usaba `network_mode: "service:backend"` para que
`localhost:4000` significara lo mismo dentro y fuera del contenedor, y así evitar tocar
los 6 archivos del frontend que leen `NEXT_PUBLIC_API_URL`.

**Falló en la práctica:** cuando el contenedor de backend reinicia, se recrea el namespace
de red y el frontend queda **sin red**, aunque Docker lo siga reportando `healthy` (su
healthcheck corre dentro del namespace viejo). Los puertos publicados quedan huérfanos.

**Solución:** cada servicio con su red, y dos variables resueltas por
`frontend/src/lib/api/apiBaseUrl.ts` (archivo nuevo):

| Dónde corre | Variable | Valor |
|---|---|---|
| Navegador | `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` |
| Servidor (en el contenedor) | `INTERNAL_API_URL` | `http://backend:4000/api/v1` |

Fuera de Docker no hace falta definir `INTERNAL_API_URL`.

## 7. Roles

`luisnuy@gmail.com` pasó de `Client` a **SuperAdmin**, igual que
`edgardoruotolo@gmail.com` y `nluis@outlook.com`. Se agregó al seed
(`prisma/seed/roles-users/index.ts`) para que sobreviva a un re-seed.

El rol persiste entre logins: el `upsert` de `googleLogin()` solo actualiza nombre, avatar
y `googleId`, nunca los roles.

## 8. Ubicación real del usuario

**El problema no era la detección: era que no existía.** "San Jose" venía de un valor fijo
en `HeroSearchBar.tsx` (`DEFAULT_LOCATIONS`), junto con Santiago, Buenos Aires, Montevideo
y Madrid. Nunca se intentaba averiguar dónde estaba el usuario.

Debajo había tres huecos más: `geo_localities` no tenía coordenadas ni código postal, el
backend ignoraba los `lat`/`lng` que el frontend ya le mandaba en la URL, y el catálogo de
USA tenía 2,6 localidades por estado (Pennsylvania: Philadelphia, Pittsburgh y Harrisburg).

### Por qué Nominatim solo no alcanzaba

Para el ZIP **18969** devuelve "Franconia Township". Parado en Telford, el reverse devuelve
"Franconia". Nunca dice "Telford", que es el nombre postal real.

La salida fue sumar **Zippopotam**, que sí devuelve el nombre correcto, y encadenar los dos
caminos por el código postal:

```
ZIP escrito     → Zippopotam                        → Telford
GPS del celular → Nominatim reverse → postcode 18969 → Zippopotam → Telford
```

Ambos convergen en el mismo nombre. Zippopotam cubre **US y ES**; en AR, CL y UY se usa solo
el reverse de Nominatim, que ahí sí devuelve nombres correctos (distingue Pocitos de Centro).

### Modelo

Migración `add_locality_coordinates`: `latitude`, `longitude` y `autoCreated` en
`geo_localities`. El flag distingue las del seed (`false`) de las creadas por uso real
(`true`), y sirve para auditarlas y para el dashboard de métricas más adelante.

Las 405 localidades del seed se geocodificaron con `pnpm db:geocode`, respetando el límite
de 1 request por segundo de Nominatim (~8 minutos). El resultado quedó versionado en
`prisma/seed/geo/coordinates.json`, así `pnpm db:seed` sigue siendo rápido y sin red.
404 con coordenadas, 1 sin resultado.

### Backend

`GET /geo/resolve?countryCode=us&postalCode=18969` o `&latitude=..&longitude=..` devuelve la
localidad y **la crea si no existe**. Las regiones no se crean solas: son un conjunto cerrado
por país, y que el geocodificador devuelva una desconocida es señal de seed incompleto.

`QueryServicesDto` acepta `lat`, `lng` y `radiusKm` opcionales. La búsqueda por defecto sigue
siendo por localidad exacta; el radio es la salida cuando esa localidad no tiene servicios.
Se resuelve con Haversine en SQL crudo sobre `geo_localities` (tabla chica) y se compone como
un filtro más del `where` de Prisma, sin reescribir la query principal. Sin PostGIS ni
earthdistance: no dependemos de extensiones de Postgres.

### Frontend

Fuera el hardcodeo. Detección automática al entrar, campo de código postal cuando el usuario
rechaza el permiso (solo en países con cobertura), localidad preseleccionada y editable,
preferencia recordada en `localStorage`, y estado vacío con botón "buscar en 50 km".

También se reemplazó una resolución duplicada que vivía en la página de búsqueda: consultaba
Nominatim por su cuenta y matcheaba por nombre contra las localidades existentes, que es
justo lo que falla en pueblos chicos.

### Bug encontrado y corregido: duplicados

La primera versión **duplicó "Centro"** en Montevideo. El seed usa el slug `centro-mvd` y la
normalización generaba `centro`, así que la restricción única `(regionId, slug)` no lo frenó.
Ahora el matcheo compara por slug **y** por nombre normalizado antes de crear.

### Verificado

| Entrada | Resultado |
|---|---|
| ZIP 18969 | Telford (Pennsylvania) |
| GPS en Telford | Telford |
| ZIP 90210 | Beverly Hills, creada automáticamente |
| GPS en Pocitos | Pocitos (Montevideo) |
| GPS en Santiago | Santiago (Metropolitana) |
| Radio 50 km desde Birmingham | 5 servicios |
| Radio 50 km desde Telford | 0 servicios (los de USA están en Birmingham, a 1.300 km) |
| Sin coordenadas | Idéntico al comportamiento anterior |

> Los datos de prueba están apiñados: los 5 servicios de USA están todos en Birmingham y los
> 5 de Uruguay en Artigas. Para probar el flujo completo con resultados hay que sembrar
> servicios en localidades más repartidas.


---

## Hallazgos que conviene tener presentes

**Los `.env.example` de los submódulos están desactualizados:**
- El frontend lee `process.env.API_KEY` (server-side), **no** `NEXT_PUBLIC_API_KEY`. Con el
  nombre equivocado, las páginas de admin y config fallan con "API Key inválida".
- NextAuth v4 necesita `NEXTAUTH_URL` y `NEXTAUTH_SECRET`; el example solo menciona
  `AUTH_URL` y `AUTH_SECRET`.
- El backend necesita un `backend/.env` además del `.env.local`, porque `prisma.config.ts`
  hace `import 'dotenv/config'` (que solo lee `.env`) mientras NestJS lee `.env.local`.
  Resuelto con un symlink `backend/.env -> .env.local`.

**El `CLAUDE.md` está desactualizado:** las rutas están en inglés (`/cl/search`, no
`/cl/buscar`, que da 404) y el backend tiene 23 módulos, no los 11 que lista.

**Trampa del lockfile:** el `pnpm-lock.yaml` vive en el paraguas pero los `package.json` en
los submódulos. Al bajar una versión que suma dependencias, el lockfile queda viejo y el
`--frozen-lockfile` de la imagen falla. En prod lo esquivaron con
`"installCommand": "pnpm install --no-frozen-lockfile"` en `frontend/vercel.json`; el
script `sync` lo resuelve regenerando el lockfile antes de construir.

**`pnpm lint` en la raíz está roto** (deuda preexistente): `backend/biome.json` se declara
raíz y choca con el del workspace. Hay que lintear por paquete.

**El catálogo de la API es `@Public()`** a propósito: geo, servicios, categorías, precios y
sponsors se leen sin API key. El `ApiKeyGuard` global protege el resto.

**`pnpm build` del frontend falla** con `rm -rf .next: Permission denied` mientras el
contenedor corre, porque `.next` es el punto de montaje de un volumen anónimo. Hay que
parar el contenedor o usar `npx next build`.

---

## 9. Estado de producción (relevado el 28/07)

**Producción está viva**, al contrario de lo que decía la documentación previa:

| | Estado |
|---|---|
| `hireeo.app` | 308 → redirige a `www.hireeo.app` |
| `www.hireeo.app` | 200, desplegado en Vercel desde `main` de `hireeo-front` |
| `api.hireeo.app` | 200, backend desplegado (`backend/vercel.json` reescribe todo a `/api`) |
| Login con Google en prod | **Funciona**, con su propio cliente OAuth |

**El dominio canónico es `www`.** El callback de OAuth en prod es
`https://www.hireeo.app/api/auth/callback/google`.

### Dos clientes OAuth distintos

| Entorno | Client ID | Proyecto |
|---|---|---|
| Producción | `65289837267-cdg2bvnu…` | Preexistente, dueño desconocido |
| Local | `722593962113-ros9qk4n…` | `hireeo`, de luisnuy@gmail.com |

Se verificó contra Google que el cliente de producción acepta su redirect URI (302 al
consentimiento, sin `redirect_uri_mismatch`). El cliente nuevo tiene registrado
`hireeo.app` **sin** `www`: si alguna vez se migra producción a ese cliente, hay que
agregar la variante con `www` o el login falla.

> ⚠️ El proyecto `65289837267` probablemente pertenece a la cuenta de Google de
> `hireeoapp`, la misma que está en recuperación. Si hace falta tocar ese cliente
> (agregar dominios, rotar el secret, publicar la app), se necesita acceso a esa cuenta.
> Conviene averiguar de quién es antes de que sea urgente.

### Riesgo al desplegar: la validación de `aud`

El backend ahora compara el `aud` del token contra el `clientId` que devuelve
`IntegrationConfigService`, que busca primero en la tabla `integrations` y después en la
variable `GOOGLE_CLIENT_ID` **del backend**. El frontend obtiene el suyo de la misma tabla
vía el endpoint runtime, o de **su propia** `GOOGLE_CLIENT_ID` en Vercel.

El login de prod se rompe **solo** si la tabla `integrations` no tiene Google **y** el
backend no tiene `GOOGLE_CLIENT_ID`, mientras el frontend sí la tiene.

**Verificar antes de desplegar:** entrar a `https://www.hireeo.app/config/integrations`
como SuperAdmin y confirmar que Google OAuth esté configurado. Si no está, cargar las
credenciales ahí, o confirmar que el backend en Vercel tenga
`GOOGLE_CLIENT_ID=65289837267-cdg2bvnu3hvp82bunhk5i4c4gjvo2gpq.apps.googleusercontent.com`.

### Orden seguro para ir a producción

1. Aplicar la migración a la base de prod: `DATABASE_URL="<prod>" pnpm --filter backend db:migrate:deploy`.
   **Es obligatorio y va primero**: `geo.service` ya pide `latitude`/`longitude` en sus
   `select`, así que sin la migración `/geo/regions/:id/localities` devuelve 500.
2. Verificar el Client ID en `integrations` de prod (ver arriba).
3. Mergear **backend** y esperar el deploy.
4. Mergear **frontend**.
5. Poblar coordenadas en prod: `DATABASE_URL="<prod>" pnpm --filter backend db:geocode`
   (lee de `coordinates.json`, no vuelve a pegarle a Nominatim).

> Para probar antes de publicar, abrir un PR desde `dev-lnunez`: Vercel genera un deploy de
> preview. Se puede validar todo salvo el login con Google, porque las URLs de preview son
> dinámicas y Google no acepta comodines en los redirect URI.

## 10. Dónde quedó el trabajo

Rama **`dev-lnunez`** en los tres repos del monorepo, todo pusheado:

| Repo | Commit |
|---|---|
| `eruotolo/atlas-services-beta` (paraguas) | `192ee2d` — Docker, scripts y este documento |
| `hireeoapp/hireeo-front` | `c7a6d18` — auth y ubicación |
| `hireeoapp/hireeo-back` | `635c40c` — auth, geo y migración |

El paraguas apunta a los commits nuevos de los submódulos, así que se baja una sola cosa.

**Sin commitear a propósito** (son cambios locales preexistentes, no de este trabajo):
`AGENTS.md`, `.gitignore`, y el contenido de `.doc/`, `.agents/` y `.codegraph/`.


---

## Notas de troubleshooting

**Error `module factory is not available` en el frontend.** Si el navegador tira
*"Module ... jsx-dev-runtime ... was instantiated because it was required from X, but the
module factory is not available"*, no es caché del navegador: son los `node_modules` del
contenedor desalineados con el lockfile. Pasó con Next resuelto contra
`@playwright/test@1.58.2` en la imagen mientras el lockfile pedía `1.61.1`, así que los
chunks apuntaban a un módulo inexistente. Se arregla con:

```bash
docker compose build frontend
docker compose up -d --force-recreate frontend
docker compose exec frontend rm -rf /app/frontend/.next/*
docker compose restart frontend
```

Ojo al diagnosticar: el nombre del chunk es el hash del archivo fuente, así que **no cambia**
aunque el contenido sí. Hay que comparar el módulo de Next que referencia adentro, no el
nombre del archivo.

**Error `JWT_SESSION_ERROR: decryption operation failed`.** La cookie de sesión quedó cifrada
con un secreto distinto al actual (pasa si el contenedor arrancó alguna vez sin ver
`AUTH_SECRET`). Ni el logout funciona, porque tampoco puede descifrarla. Se borra desde
DevTools → Application → Storage → Clear site data.


## Pendientes para retomar

### Antes de desplegar a producción
- [ ] Verificar Google OAuth en `https://www.hireeo.app/config/integrations` (ver sección 9)
- [ ] Aplicar la migración `add_locality_coordinates` a la base de prod — **bloqueante**
- [ ] Averiguar de quién es el proyecto de Google `65289837267` de producción
- [ ] Abrir PRs desde `dev-lnunez` y validar en el deploy de preview de Vercel

### Producto
- [ ] Mostrar el campo de código postal siempre en US y ES, no solo al rechazar el permiso.
      Hoy, si el usuario acepta pero la ubicación sale mal (típico en desktop, que resuelve
      por wifi/IP), no tiene cómo corregirla salvo el selector de localidad.
- [ ] Sembrar servicios en localidades repartidas: los 5 de USA están todos en Birmingham y
      los 5 de Uruguay en Artigas, así que la búsqueda por radio no se puede probar de verdad
- [ ] Vista en el admin para revisar y fusionar las localidades con `autoCreated = true`
- [ ] Dashboard de métricas: desde dónde se conectan los usuarios

### Deuda técnica


- [ ] Commitear: ~20 archivos en `hireeo-front`, ~12 en `hireeo-back`, y lo de Docker en el paraguas
- [ ] Sembrar servicios en localidades repartidas, para poder probar la búsqueda por radio
- [ ] Vista en el admin para revisar y fusionar las localidades con `autoCreated = true`
- [ ] Dashboard de métricas: desde dónde se conectan los usuarios (usa `autoCreated` + coordenadas)
- [ ] Evaluar migrar de Nominatim/Zippopotam a un proveedor con SLA antes de producción
- [x] ~~Cerrar `/auth/apple` y `/auth/microsoft` en el servidor~~ — hecho (ver 4b)
- [ ] Validar `aud` en `appleLogin()` y `microsoftLogin()` antes de reactivarlos
- [ ] Publicar la app en Google Auth Platform cuando se abra el registro al público
      (scopes `openid email profile` son no sensibles → sin verificación de Google)
- [ ] En Vercel: setear `NEXTAUTH_URL`, `AUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET` y
      registrar el redirect URI de producción
- [ ] Rotar el Client Secret de Google antes de producción (pasó por un chat)
- [ ] Corregir los `.env.example` de los submódulos y el `CLAUDE.md`
- [ ] Arreglar el conflicto de `biome.json` que rompe `pnpm lint` en la raíz

## Verificación al cierre

- 41/41 URLs OK
- Lint sin hallazgos nuevos en los archivos tocados
- `pnpm build` limpio en backend y frontend (exit 0)
- Registro por correo probado end-to-end: usuario en DB con rol y país
- Login con Google probado end-to-end: usuario en DB con `googleId`, nombre y avatar
