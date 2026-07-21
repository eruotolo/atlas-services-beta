# Integración OAuth — Apple Sign In y Microsoft (Azure AD)

Guía completa para activar el login con Apple y Microsoft en la página `/login`.
Google ya está funcionando y sirve como referencia de flujo completo.

## Arquitectura del flujo OAuth

```
Usuario → Botón login → NextAuth (frontend) → Proveedor externo
       → callback /api/auth/callback/[provider]
       → jwt callback → handleFirstLogin()
       → POST /auth/apple  o  /auth/microsoft  (backend NestJS)
       → upsert usuario en DB → JWT propio → sesión activa
```

**Archivos clave:**

| Capa | Archivo | Responsabilidad |
|---|---|---|
| UI | `frontend/src/app/(country)/[country]/(auth)/login/page.tsx` | Botones, handlers, errores |
| NextAuth config | `frontend/src/app/api/auth/[...nextauth]/route.ts` | Providers, callbacks JWT/session/redirect |
| Servicio frontend | `frontend/src/features/auth/lib/auth.service.ts` | Llamadas al backend por proveedor |
| Backend | `backend/src/modules/auth/auth.controller.ts` | Endpoints `/auth/apple`, `/auth/microsoft` |
| Backend | `backend/src/modules/auth/auth.service.ts` | Validación de tokens y upsert de usuario |

---

## Apple Sign In

### Requisitos previos

- Cuenta de **Apple Developer** activa (paid, USD 99/año)
- Dominio real con HTTPS registrado. Apple **no permite `localhost`** para producción.
  Para desarrollo local usar una herramienta como `ngrok` con dominio estable.

### Paso 1 — Crear un App ID (si no existe)

1. Ir a [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Identifiers**
2. Crear un nuevo **App ID** (tipo App) con el Bundle ID de la app, e.g. `com.hireeo.app`
3. Habilitar la capability **Sign In with Apple**

### Paso 2 — Crear un Service ID

Este es el identificador que se usa como `client_id` para web.

1. En **Identifiers** → `+` → **Services IDs**
2. Description: `Hireeo Web Login`
3. Identifier: `com.hireeo.web` ← este valor es el `APPLE_ID`
4. Habilitar **Sign In with Apple** → **Configure**
5. En **Web Authentication Configuration**:
   - **Primary App ID**: seleccionar el App ID del paso 1
   - **Domains and Subdomains**: `hireeo.com` (dominio de producción)
   - **Return URLs**: `https://hireeo.com/api/auth/callback/apple`
6. Guardar y registrar

### Paso 3 — Crear una Key (.p8)

1. En **Keys** → `+` → Nombre: `Hireeo Sign In Key`
2. Habilitar **Sign In with Apple** → Configure → seleccionar el App ID primario
3. Descargar el archivo `.p8` — **solo se puede descargar una vez**
4. Anotar:
   - **Key ID** (10 caracteres, e.g. `ABCD123456`)
   - **Team ID** (visible en la esquina superior derecha del portal, e.g. `TEAMID123`)

### Paso 4 — Generar el APPLE_SECRET (JWT)

`APPLE_SECRET` no es una contraseña simple: es un **JWT firmado** con el `.p8` que NextAuth usa como `client_secret`. Caduca cada 6 meses como máximo.

Usando Node.js:

```js
// scripts/generate-apple-secret.mjs
import { SignJWT, importPKCS8 } from 'jose';
import { readFileSync } from 'fs';

const privateKey = readFileSync('./AuthKey_KEYID.p8', 'utf8');
const key = await importPKCS8(privateKey, 'ES256');

const secret = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: 'ABCD123456' }) // KEY_ID
    .setIssuer('TEAMID123')                                    // TEAM_ID
    .setAudience('https://appleid.apple.com')
    .setSubject('com.hireeo.web')                             // SERVICE_ID = APPLE_ID
    .setIssuedAt()
    .setExpirationTime('180d')                                 // máximo 6 meses
    .sign(key);

console.log(secret);
```

```bash
node scripts/generate-apple-secret.mjs
```

El output es el valor de `APPLE_SECRET`.

### Paso 5 — Variables de entorno

**Frontend** (`frontend/.env.local` y en Vercel → Settings → Environment Variables):

```env
APPLE_ID="com.hireeo.web"
APPLE_SECRET="eyJhbGciOiJFUzI1NiIsImtpZCI..."   # JWT generado en el paso 4
```

**Backend** (`backend/.env` y en producción):

```env
# Mismo valor que APPLE_ID del frontend — usado para verificar el audience del idToken
APPLE_CLIENT_ID="com.hireeo.web"
```

### Paso 6 — Renovar el APPLE_SECRET

El JWT caduca en máximo 6 meses. Recordar regenerarlo antes de que expire:

```
/schedule  # Usar el comando /schedule para programar un recordatorio de renovación
```

---

## Microsoft / Azure AD

### Requisitos previos

- Cuenta de **Microsoft Azure** (puede ser free tier)
- El portal: [portal.azure.com](https://portal.azure.com)

### Paso 1 — Crear una App Registration

1. Ir a **Azure Active Directory** → **App registrations** → **New registration**
2. **Name**: `Hireeo Login`
3. **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   → Esto equivale a `tenantId: 'common'` y permite cuentas @outlook, @hotmail, empresariales, etc.
4. **Redirect URI**: seleccionar **Web** e ingresar:
   - Desarrollo: `http://localhost:3333/api/auth/callback/azure-ad`
   - Producción: `https://hireeo.com/api/auth/callback/azure-ad`
5. **Register**

### Paso 2 — Obtener Client ID y Tenant ID

En la página **Overview** de la app registration anotar:

- **Application (client) ID** → valor de `AZURE_AD_CLIENT_ID`
- **Directory (tenant) ID** → (si se quiere restringir a un tenant específico, sino usar `common`)

### Paso 3 — Crear un Client Secret

1. En el menú izquierdo → **Certificates & secrets** → **Client secrets** → **New client secret**
2. Description: `NextAuth Production`
3. Expires: `24 months` (máximo disponible)
4. Copiar el **Value** inmediatamente (solo visible una vez) → `AZURE_AD_CLIENT_SECRET`

### Paso 4 — Configurar permisos de API

1. En **API permissions** verificar que exista `User.Read` (Microsoft Graph) — suele estar por defecto
2. Si no está: **Add a permission** → **Microsoft Graph** → **Delegated** → `User.Read`
3. No es necesario **Grant admin consent** para `User.Read`

### Paso 5 — Variables de entorno

**Frontend** (`frontend/.env.local` y en Vercel):

```env
AZURE_AD_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
AZURE_AD_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
AZURE_AD_TENANT_ID="common"
```

> `AZURE_AD_TENANT_ID="common"` permite tanto cuentas personales (Outlook, Hotmail)
> como cuentas corporativas. Cambiar por el Tenant ID específico si se quiere restringir.

---

## Notas de implementación

### Cómo funciona el token en cada proveedor

| Proveedor | NextAuth envía al backend | Campo en `account` |
|---|---|---|
| Google | `id_token` | `account.id_token` |
| Apple | `id_token` | `account.id_token` |
| Microsoft | `access_token` | `account.access_token` |

Esto está gestionado en [`route.ts`](../frontend/src/app/api/auth/%5B...nextauth%5D/route.ts)
dentro de `handleFirstLogin()`.

### Comportamiento de Apple en re-logins

Apple **solo envía el email en el primer inicio de sesión**. En los siguientes, solo envía el `sub` (Apple ID).
El backend maneja esto buscando primero por `appleId` y, si no existe, por `email`:

```ts
// auth.service.ts (backend) — appleLogin()
const existing = await this.prisma.user.findUnique({ where: { appleId } });
if (existing) return this.buildUserResponse(existing);
// Primera vez: upsert por email y vincular appleId
```

### Manejo de errores en la UI

Si el proveedor falla (credenciales no configuradas, error del servidor externo, etc.):

- NextAuth redirige a `/login?error=OAuthSignin` (o similar)
- La página lee el query param `?error=` y muestra un mensaje amigable en español
- Los handlers de cada botón también tienen `try/catch` para errores síncronos

### Redirect callback

El callback `redirect` en `route.ts` maneja:

```ts
if (url.startsWith('/')) return `${baseUrl}${url}`;  // rutas relativas
if (url.startsWith(baseUrl)) return url;              // misma origin
return `${baseUrl}/profile`;                          // fallback (redirige al país desde /profile)
```

---

## Checklist de activación

### Apple

- [ ] App ID creado con Sign In with Apple habilitado
- [ ] Service ID creado (`com.hireeo.web`) con dominio y Return URL configurados
- [ ] Key `.p8` descargada y almacenada de forma segura (fuera del repo)
- [ ] `APPLE_SECRET` (JWT) generado con el script y cargado en env
- [ ] `APPLE_ID="com.hireeo.web"` en `frontend/.env.local` y Vercel
- [ ] `APPLE_SECRET="eyJ..."` en `frontend/.env.local` y Vercel
- [ ] `APPLE_CLIENT_ID="com.hireeo.web"` en `backend/.env` y producción
- [ ] Recordatorio de renovación del JWT en 5 meses (caduca en 6)

### Microsoft / Azure AD

- [ ] App Registration creada en portal.azure.com
- [ ] Redirect URIs configuradas (localhost y producción)
- [ ] Permiso `User.Read` confirmado en API permissions
- [ ] Client Secret creado y copiado
- [ ] `AZURE_AD_CLIENT_ID` en `frontend/.env.local` y Vercel
- [ ] `AZURE_AD_CLIENT_SECRET` en `frontend/.env.local` y Vercel
- [ ] `AZURE_AD_TENANT_ID="common"` en `frontend/.env.local` y Vercel

---

## Qué NO hacer

- No commitear el archivo `.p8` de Apple al repositorio
- No commitear `APPLE_SECRET` ni ningún client secret al repositorio
- No usar `localhost` como dominio en la configuración de Apple (solo funciona con HTTPS real)
- No olvidar agregar la URL de producción en los Redirect URIs de ambos portales
- No reutilizar el mismo Service ID de Apple para múltiples dominios sin configurarlos todos
