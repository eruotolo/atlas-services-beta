# Variables de entorno de infraestructura y runbook de rotación

> **Audiencia.** Edgardo y quien opere el despliegue. Este documento describe
> **qué variables siguen viviendo en `.env`** (no en el panel de Integraciones)
> y **cómo rotarlas** sin cortar el servicio.
>
> **Regla general.** Las credenciales de **proveedor** (Stripe, MercadoPago,
> Gemini, Cloudinary, Brevo, Firebase, OAuth) **no** viven en `.env`: viven en
> la tabla `Integration` cifrada con AES-256-GCM y se administran desde
> `/{country}/config/integrations`. La excepción transitoria es el fallback de
> `IntegrationConfigService`, que está pensado solo para desarrollo y
> 예정이다 fecha de retiro (ver "Fallback de variables de entorno" más abajo).
>
> **Ninguna credencial real va en este documento.** Los nombres y propósitos sí;
> los valores van en el gestor de secretos (1Password / Bitwarden / Vercel
> env vars / Docker secrets según el entorno).

## 1. Qué vive en `.env`

### 1.1. Backend (`backend/.env.local` y variables de Vercel/CI)

| Variable | Propósito | Quién la consume | Sensibilidad |
| --- | --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (formato `postgresql://USER:PASS@HOST:PORT/DB`). | `PrismaService` al construir el adapter `PrismaPg`. | Alta — credencial de DB. |
| `DIRECT_DATABASE_URL` | Cadena de conexión directa, usada por migraciones Prisma. | `prisma migrate`. | Alta — credencial de DB. |
| `JWT_SECRET` | Firma de access tokens (HS256/HS512). | `JwtService` / `AuthModule`. | Alta — quien firma auth. |
| `JWT_REFRESH_SECRET` | Firma de refresh tokens. | `JwtService` / `AuthModule`. | Alta — quien firma auth. |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Tiempos de expiración. | `JwtService`. | Baja — formato duración. |
| `API_KEY` | Clave `x-api-key` que el frontend envía al backend. | `ApiKeyGuard` global. | Alta — bypass de auth. |
| `INTERNAL_SERVICE_TOKEN` | Token máquina-a-máquina que NextAuth envía al backend para leer credenciales OAuth desde `/api/v1/integrations/runtime`. Debe coincidir entre frontend y backend. | `ServiceTokenGuard`. | Alta — equivalente a una service account. |
| `INTEGRATIONS_ENCRYPTION_KEY` | Clave AES-256-GCM de 32 bytes en base64. Cifra y descifra las credenciales guardadas en `Integration`. | `CryptoService`. | **Crítica** — si se pierde, todas las credenciales del panel son irrecuperables. |
| `FRONTEND_URL` | Lista separada por comas de URLs permitidas para CORS y para armar `callbackUrl` en OAuth health checks. | CORS, `IntegrationHealthService`. | Baja — URL pública. |
| `NODE_ENV` / `PORT` | Entorno y puerto del proceso. | Bootstrap NestJS. | Baja. |
| `SEED_SUPERADMIN_PASSWORD_*` | Contraseñas temporales para cuentas SuperAdmin durante el seed. | `prisma/seed/users`. | Alta — cuentas admin. Solo seed. |

### 1.2. Frontend (`frontend/.env.local` y variables de Vercel)

| Variable | Propósito | Quién la consume | Sensibilidad |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL base del backend que ve el navegador. | `apiClient.ts`. | Baja — pública. |
| `NEXT_PUBLIC_FRONTEND_URL` | URL pública del frontend (usada en callbacks OAuth generados en runtime). | Server Components y NextAuth. | Baja — pública. |
| `API_KEY` | Igual al `API_KEY` del backend; el frontend la pega como header `x-api-key`. | `apiClient.ts`. | Alta — bypass de auth (mitigada por HTTPS). |
| `INTERNAL_SERVICE_TOKEN` | Igual al del backend; el frontend lo usa para leer credenciales OAuth desde el runtime controller. | `IntegrationRuntimeClient` (panel de Integraciones). | Alta — service token. |
| `NEXTAUTH_SECRET` | Firma cookies de sesión. | NextAuth. | Alta. |
| `NEXTAUTH_URL` | URL pública del frontend (callback base). | NextAuth. | Baja. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | **Solo durante la migración inicial.** Una vez cargadas en el panel, deben quedar en `.env` como respaldo histórico o eliminarse. | NextAuth provider. | Alta — al migrar al panel, dejar de consultar. |
| `APPLE_ID` / `APPLE_SECRET` | Igual: durante la transición. | NextAuth provider. | Alta — JWT caduca a 6 meses. |
| `AZURE_AD_CLIENT_ID` / `AZURE_AD_CLIENT_SECRET` / `AZURE_AD_TENANT_ID` | Igual: durante la transición. | NextAuth provider. | Alta. |

> **Importante.** NextAuth hoy todavía lee algunas credenciales OAuth desde
> variables de entorno como red de seguridad. El criterio de salida de la fase
> 4 es que todas esas variables pasen a vivir en el panel. Mientras esa
> transición no esté terminada, ambos lugares deben estar sincronizados.

### 1.3. Variables del panel de Integraciones (NO van en `.env`)

Las siguientes credenciales viven **exclusivamente** en la tabla `Integration`,
cifradas con `INTEGRATIONS_ENCRYPTION_KEY`:

- Stripe (`STRIPE`, `STRIPE_KYC`): `secretKey`, `publishableKey`, `webhookSecret`
- MercadoPago (`MERCADOPAGO`, `MERCADOPAGO_PUBLIC`): `accessToken`, `webhookSecret`, `publicKey`
- Firebase (`FIREBASE`): `serviceAccountJson`
- Gemini (`GEMINI`): `apiKey`
- Cloudinary (`CLOUDINARY`): `cloudName`, `apiKey`, `apiSecret`
- Brevo (`BREVO`): `apiKey`, `senderEmail`, `senderName`
- Google OAuth (`GOOGLE_OAUTH`): `clientId`, `clientSecret`
- Apple OAuth (`APPLE_OAUTH`): `clientId` (Services ID), `secret` (JWT firmado)
- Azure AD OAuth (`AZURE_AD_OAUTH`): `clientId`, `clientSecret`, `tenantId`

Cualquier credencial de proveedor encontrada en `.env` (sin contar el fallback
explícito de la sección 1.4) es una **deuda técnica** que debe migrarse al
panel usando `pnpm tsx prisma/seed/migrate-integrations.ts`.

### 1.4. Fallback de variables de entorno

`IntegrationConfigService` lee estas variables **únicamente** cuando:

1. No existe una fila activa para el `provider + countryId` en la tabla
   `Integration`.
2. La variable de entorno tiene un valor no vacío.

| Proveedor | Variables de fallback |
| --- | --- |
| `STRIPE` (por país) | `STRIPE_SECRET_KEY_<CC>`, `STRIPE_PUBLISHABLE_KEY_<CC>`, `STRIPE_WEBHOOK_SECRET_<CC>` |
| `STRIPE_KYC` (global) | `STRIPE_SECRET_KEY_ES`, `STRIPE_KYC_WEBHOOK_SECRET` |
| `MERCADOPAGO` (por país) | `MP_ACCESS_TOKEN_<CC>`, `MP_WEBHOOK_SECRET_<CC>` |
| `MERCADOPAGO_PUBLIC` (por país) | `MP_PUBLIC_KEY_<CC>` |
| `FIREBASE` (global) | `FIREBASE_SERVICE_ACCOUNT` |
| `GEMINI` (global) | `GEMINI_API_KEY` |
| `CLOUDINARY` (global) | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| `BREVO` (global) | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` |
| `GOOGLE_OAUTH` (global) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `APPLE_OAUTH` (global) | `APPLE_ID`, `APPLE_SECRET` |
| `AZURE_AD_OAUTH` (global) | `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID` |

> **Cuándo dejar de usarlas.** El plan de Integraciones (Fase 3) considera el
> fallback como una red de seguridad de desarrollo y migración. La fecha de
> retiro se decide por producto y se documenta en `~/SitesDoc/decisiones/`.
> Mientras exista, los logs del backend imprimen un `WARN` cada vez que se
> resuelve una credencial por `environment_fallback`.

## 2. Runbook de rotación de credenciales

> **Regla de oro.** Ninguna rotación debe dejar al backend en un estado en el
> que no pueda autenticar contra el proveedor. Por eso toda rotación sigue
> tres pasos: **1) subir la nueva credencial al panel / env** (sin tocar la
> vieja), **2) esperar a que se propague**, **3) invalidar la credencial vieja
> en el proveedor**.

### 2.1. Credenciales del panel de Integraciones

Estas credenciales se rotan **directamente desde el panel** (`/{country}/config/integrations`):

- Stripe `secretKey` / `publishableKey` / `webhookSecret`
- MercadoPago `accessToken` / `webhookSecret` / `publicKey`
- Firebase `serviceAccountJson`
- Gemini `apiKey`
- Cloudinary `apiKey` / `apiSecret`
- Brevo `apiKey`
- Google / Apple / Azure OAuth `clientSecret`

**Procedimiento.**

1. Generar la nueva credencial en el dashboard del proveedor.
2. En el panel de Integraciones, abrir la tarjeta del proveedor (y el país si
   aplica) y pegar la nueva credencial. El backend hace merge sobre los campos
   no enviados (los vacíos no sobrescriben).
3. Guardar. Confirmar que `IntegrationHealthService.check()` reporta
   `connected=true` para ese proveedor/país.
4. **Solo entonces** revocar la credencial vieja en el dashboard del
   proveedor. Si la API del proveedor lo permite, dejar un período de gracia
   de 24 h para evitar carreras con webhooks en vuelo.
5. Verificar en logs que la próxima resolución viene de `database`, no de
   `environment_fallback`.

**Auditoría.** Cada rotación queda registrada en `integration_audit_logs`
(`action = 'upsert'`), con `metadata.changedFields` indicando qué campo se
tocó. No requiere acción manual: el panel ya lo hace.

### 2.2. Claves de infraestructura (`.env`)

Estas claves se rotan **re desplegando** el servicio con la nueva variable:

| Clave | Frecuencia sugerida | Comando de generación |
| --- | --- | --- |
| `JWT_SECRET` | cada 6 meses o ante incidente | `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | cada 6 meses o ante incidente | `openssl rand -base64 64` |
| `API_KEY` | cada 6 meses | `openssl rand -hex 32` |
| `INTERNAL_SERVICE_TOKEN` | cada 6 meses | `openssl rand -hex 32` |
| `INTEGRATIONS_ENCRYPTION_KEY` | **no rotar salvo emergencia** — implica re-cifrar todas las filas de `Integration` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_SECRET` | cada 6 meses | `openssl rand -base64 32` |

**Procedimiento (claves que no son `INTEGRATIONS_ENCRYPTION_KEY`).**

1. Generar la nueva clave con el comando sugerido.
2. Actualizar la variable en **dos lugares sincronizados**:
   - Backend (`.env.local` y Vercel/CI).
   - Frontend, si la clave se comparte (caso de `API_KEY` e
     `INTERNAL_SERVICE_TOKEN`).
3. Redesplegar backend y frontend.
4. Invalidar todas las sesiones JWT activas (no se puede sin reiniciar la
   firma). Comunicar a los usuarios si la rotación es fuera de horario.
5. Confirmar en logs que el primer request autenticado post-rotación fue
   aceptado.

### 2.3. `INTEGRATIONS_ENCRYPTION_KEY` (rotación de emergencia)

**Advertencia.** Esta clave cifra todas las credenciales del panel. Rotarla
sin re-cifrar las filas rompe la lectura en caliente.

**Procedimiento (solo si la clave fue comprometida o se perdió).**

1. Generar nueva clave: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
2. Escribir un script de migración que:
   - Levante `PrismaService` con la clave **vieja**.
   - Lea cada fila de `Integration`, descifre, re-cifre con la clave nueva.
   - Actualice la fila en una transacción.
3. Ejecutar el script en una ventana de mantenimiento.
4. Reemplazar `INTEGRATIONS_ENCRYPTION_KEY` en `.env` y redesplegar.
5. Confirmar que `GET /api/v1/integrations` sigue listando las mismas
   credenciales con `hasSecret` correcto (no se exponen los valores).
6. **Destruir la clave vieja** de todos los entornos y de los backups.

### 2.4. `APPLE_SECRET` (JWT de Apple Sign In)

Apple exige regenerar el JWT cada **6 meses como máximo**. El panel de
Integraciones valida la vigencia (ver `integration-health.service.spec.ts`) y
muestra `connected=false` cuando expira.

**Procedimiento.**

1. Cinco meses después de la última rotación, regenerar el JWT:
   ```bash
   node scripts/generate-apple-secret.mjs
   ```
2. Pegar el nuevo JWT en la tarjeta **Apple OAuth** del panel.
3. Confirmar `connected=true` desde el health check.
4. Programar recordatorio en `/schedule` para 5 meses después.

### 2.5. Client Secret de Azure AD (24 meses máx.)

Azure permite Client Secrets de hasta 24 meses. Rotar antes del vencimiento.

**Procedimiento.**

1. **Crear el nuevo Client Secret** en
   `portal.azure.com → App registrations → Certificates & secrets`. Anotar
   `Value` (no `Secret ID`).
2. En el panel de Integraciones, tarjeta **Azure AD OAuth**, reemplazar
   `clientSecret`. Guardar.
3. Verificar `connected=true` y `callbackUrl` correcto.
4. Tras 24 h de uso sin incidentes, eliminar el Client Secret viejo.

### 2.6. Credenciales OAuth de Google / Apple / Azure (rotación de `clientSecret`)

Mismo patrón que 2.1. La diferencia es que el callback URL debe quedar
**idéntico** antes y después de la rotación. El health check desde el panel
muestra el `callbackUrl` esperado; compararlo contra lo registrado en el
proveedor antes de tocar nada.

### 2.7. `DATABASE_URL` / `DIRECT_DATABASE_URL`

Solo se rotan en escenarios de provisioning nuevo o incidente. Implican:

1. Crear el nuevo usuario/DB.
2. Migrar datos (pg_dump/restore).
3. Actualizar la variable.
4. Redesplegar backend.

## 3. Checklist post-rotación

Para cada rotación, completar:

- [ ] Auditoría revisada: aparece `integration_audit_logs` con la acción
      esperada y los `changedFields` correctos.
- [ ] Health check desde el panel reporta `connected=true` para los
      proveedores afectados.
- [ ] Tests automatizados en verde: `pnpm --filter backend test`.
- [ ] Credencial vieja revocada en el proveedor.
- [ ] (Si aplica) Recordatorio de la próxima rotación agendado.
- [ ] Si la rotación fue de una clave de infra, **ningún secreto** quedó en
      el repo ni en comentarios de commit (`git log -p` y `git diff`).

## 4. Referencias cruzadas

- Sandboxes paso a paso: `.doc/tareaspendientes/sandbox-checklist-integraciones.md`.
- Esquemas Zod y catálogo: `backend/src/modules/integrations/providers/`.
