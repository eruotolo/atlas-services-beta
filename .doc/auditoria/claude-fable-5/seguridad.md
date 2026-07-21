# Seguridad

Revisión basada en OWASP Top 10 (2021) y buenas prácticas. Severidad orientativa con referencia CVSS aproximada cuando aplica. Ver detalle y remediación en `hallazgos.md`.

## Vulnerabilidades confirmadas

| ID | OWASP | Descripción | Severidad | CVSS aprox. | Estado |
|----|-------|-------------|-----------|-------------|--------|
| BE-05 | A01 Broken Access Control | `GET /users` lista PII (email, roles, país) sin control de rol, solo api-key compartida | Alta | ~7.5 | Confirmado |
| BE-03 | A05 Misconfiguration | WebSocket `/chat` con CORS `origin:'*'` | Alta | ~6.5 | Confirmado |
| FE-07 | A05 / DoS | `/api/revalidate` sin autenticación → invalidación de caché arbitraria | Alta | ~5.3 | Confirmado |
| TR-09 | A07 Auth Failures | Refresh tokens (30d) no revocables ni rotados; sin logout server-side | Alta | ~6.0 | Confirmado |
| TR-02 | A06 Vuln Components | Next.js 16.1.1 con 13 CVEs (cache poisoning RSC, etc.) | Alta/Crítica | 3.7–7 | Confirmado |
| FE-10 | A08 / A04 | Webhook MP del frontend sin validación de firma HMAC | Media | ~5.0 | Confirmado |
| MO-06 | A07 / diseño | Intento de incrustar api-key global en binario móvil (`EXPO_PUBLIC_API_KEY`) | Media | ~5.0 | Confirmado |
| TR-15 | A05 | `.env.example` induce a exponer api-key con prefijo público | Media | ~4.0 | Confirmado |
| W3/W4 | A06 | `protobufjs`/`shell-quote` crit en tooling (no runtime prod) | Crítica (tooling) | — | Confirmado |

## Controles CORRECTOS observados (fortalezas)

- **Hash de contraseñas:** bcrypt con 12 rounds (`auth.service.ts`). ✅
- **Comparaciones en tiempo constante:** `safeEqual`/`crypto.timingSafeEqual` en ApiKeyGuard, WebhookGuard, ServiceTokenGuard. ✅
- **Cifrado de credenciales de integraciones:** AES-256-GCM con IV aleatorio y validación de clave de 32 bytes (`CryptoService`). ✅
- **Validación de tokens OAuth server-side:** Google (tokeninfo), Apple (JWKS con issuer/audience), Microsoft (Graph). ✅
- **DTOs estrictos:** `ValidationPipe` global con `whitelist + forbidNonWhitelisted + transform`. ✅
- **Helmet** activo para headers de seguridad. ✅
- **Firma de webhooks en backend:** Stripe (`constructEvent`) y MP (HMAC sha256 + timingSafeEqual). ✅
- **Ownership en chat:** `createMessage`/`getMessages` verifican que el usuario sea client o provider de la conversación (`ForbiddenException`). ✅
- **Interceptor de serialización** elimina campos sensibles (`password`) de las respuestas. ✅
- **Swagger** solo en desarrollo. ✅
- **Tokens en SecureStore** (mobile nativo). ✅
- **Rate limit** en endpoints de auth (`@Throttle` en login/register/oauth). ✅
- **No hay secretos reales versionados** (solo `.env.example` y placeholders de UI). ✅

## Riesgos potenciales (requieren validación)

- **Enumeración de usuarios en registro:** `register` lanza `ConflictException('El email ya está registrado')` → revela si un email existe. Considerar respuesta genérica.
- **`INTEGRATIONS_ENCRYPTION_KEY` / `JWT_SECRET` en Vercel env:** la seguridad de todo el cifrado de credenciales y de la sesión depende de la gestión de estos secretos; no verificable sin acceso al panel.
- **Sesiones concurrentes:** no hay límite ni visibilidad de sesiones activas por usuario.
- **CSP:** no se observó Content-Security-Policy explícita en el frontend (helmet cubre la API, no las páginas Next).

## Secretos

- Escaneo (`git grep` + revisión de historial): **no se detectaron secretos reales versionados**. Evidencia en `evidencias/secretos.txt`.
- Las coincidencias de patrones (`sk_live_...`, `whsec_...`, `AIza...`) son **placeholders de formularios** en `integrations/providers`.

## Plan de remediación (orden sugerido)

1. **Inmediato:** cerrar BE-05 (rol admin en `/users`), FE-07 (secreto en revalidate), BE-03 (CORS del gateway), TR-02 (upgrade Next).
2. **7 días:** definir modelo de auth mobile (MO-06); eliminar webhook duplicado del frontend (FE-10); quitar api-key pública de `.env.example` (TR-15).
3. **30 días:** rotación/revocación de refresh tokens (TR-09); Redis para throttler (BE-16); respuesta genérica anti-enumeración; CSP en frontend.
4. **90 días:** rotación programada de `INTEGRATIONS_ENCRYPTION_KEY`; gestión de secretos con vault; auditoría de accesos (audit log ya existe para integraciones: `IntegrationAuditLog`).
