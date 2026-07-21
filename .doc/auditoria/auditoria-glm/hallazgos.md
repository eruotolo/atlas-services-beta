# Hallazgos

Lista completa de hallazgos con el formato estándar requerido. Total: **91 hallazgos** (18 críticos, 26 altos, 22 medios, 15 bajos, 12 informativos).

Convención de IDs:
- `BE-*` Backend
- `FE-*` Frontend
- `MOB-*` Mobile
- `OPS-*` DevOps/Infraestructura
- `TRANSV-*` Transversal

---

## 🔴 HALLAZGOS CRÍTICOS (18)

### BE-SEC-001 — IDOR en addresses (lectura/escritura cross-user)

- **Capa**: Backend
- **Categoría**: Vulnerabilidad (Broken Access Control / IDOR)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/modules/users/users.controller.ts:135-169`, `backend/src/modules/users/users.service.ts:268-295`
- **Evidencia**:
  ```ts
  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard)
  getAddresses(@Param('id') id: string) { return this.service.getAddresses(id); }

  @Post(':id/addresses')
  createAddress(@Param('id') id: string, @Body() dto: CreateAddressDto) {
      return this.service.createAddress(id, dto);  // id del path, no del JWT
  }
  ```
  En el service, `updateAddress(userId, ...)` recibe `userId = :id` del path, así que `address.userId !== userId` siempre pasa.
- **Comportamiento esperado**: Usar `@CurrentUser() user` y operar solo con `user.id`. No aceptar `:id` del path para mutaciones de recursos propios.
- **Causa raíz probable**: Patrón copy-paste de endpoints RESTful sin aplicar autorización basada en el token.
- **Riesgo actual**: Cualquier usuario autenticado puede leer, crear, editar y eliminar direcciones físicas (calle, número, apartamento, zip, lat/lng) de cualquier otro usuario.
- **Riesgo futuro**: GDPR / LOPD / incidente de seguridad público.
- **Escenario de fallo**: Atacante enumera `userId` (que es UUID devuelto públicamente por `GET /users/:id`) y lee las direcciones completas de todos los usuarios de un país.
- **Solución mínima**: Reemplazar `@Param('id')` por `@CurrentUser()` en los 4 endpoints de addresses (líneas 135-169).
- **Solución recomendada**: Además, agregar `AddressService.assertOwnership(addressId, userId)` que verifique y lance `ForbiddenException` si no coincide. Tipar `@CurrentUser()` con una interfaz `AuthenticatedUser`.
- **Alternativas**: Eliminar `:id` del path y usar siempre `/me/addresses`.
- **Posibles efectos secundarios**: La app mobile/frontend que use `:id` del path deberá actualizarse.
- **Dependencias**: Mobile usa `/users/.../addresses` con `:id` (ver MOB).
- **Criterio de aceptación**: Test E2E donde el user A intenta leer addresses del user B → 403.
- **Prueba necesaria**: E2E con 2 usuarios distintos; 403 en GET/POST/PATCH/DELETE de addresses ajenas.

### BE-SEC-002 — Refresh token stateless sin rotación ni revocación

- **Capa**: Backend
- **Categoría**: Vulnerabilidad (Auth)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Medio
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/modules/auth/auth.service.ts:120-149`
- **Evidencia**:
  ```ts
  async refresh(refreshToken: string) {
      const payload = this.jwt.verify<{ sub, email }>(refreshToken, { secret: ... });
      const user = await this.prisma.user.findUnique({ ... });
      return this.buildTokens(user.id, user.email, roles, country);  // emite nuevos, viejo sigue válido
  }
  ```
  El refresh token no se persiste, no se rota, no hay denylist. `JWT_REFRESH_EXPIRES_IN='30d'`.
- **Comportamiento esperado**: Rotación de refresh tokens (cada uso emite uno nuevo e invalida el anterior) + posibilidad de revocación (logout server-side, cambio de password).
- **Causa raíz probable**: Decisión inicial de JWT stateless sin prever logout efectivo.
- **Riesgo actual**: Si un refresh token se filtra (XSS, log, dispositivo robado), el atacante mantiene acceso 30 días. El "logout" del cliente no invalida nada server-side.
- **Riesgo futuro**: Exfiltración masiva si se filtra `JWT_REFRESH_SECRET`.
- **Escenario de fallo**: Token robado en un cibercafé / dispositivo compartido → sesión persistente del atacante aunque la víctima cierre sesión.
- **Solución mínima**: Persistir hash del refresh token en DB (tabla `RefreshToken` o campo en `User`), validar al usarlo, invalidar al rotar.
- **Solución recomendada**: Modelo `RefreshToken { id, userId, tokenHash, familyId, revokedAt, expiresAt }` con rotación + detección de reúso (invalidar toda la familia ante reúso de un token ya rotado). Permite logout efectivo.
- **Alternativas**: Pasar a sesiones server-side (Redis) con `sid` en cookie httpOnly.
- **Posibles efectos secundarios**: Requiere migración Prisma. Logout debe llamar al backend.
- **Dependencias**: Frontend y mobile ya llaman a `/auth/refresh` y `/auth/logout` (mobile aún no).
- **Criterio de aceptación**: Tras `logout`, el refresh token anterior retorna 401.
- **Prueba necesaria**: Test E2E: login → refresh → logout → usar refresh anterior → 401.

### BE-SEC-003 — `POST /email/send` sin autenticación ni autorización

- **Capa**: Backend
- **Categoría**: Vulnerabilidad (Broken Access Control + Email injection)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/modules/email/email.controller.ts:13-16`
- **Evidencia**:
  ```ts
  @Controller('email')
  export class EmailController {
      @Post('send')
      @HttpCode(HttpStatus.OK)
      async send(@Body() dto: SendEmailDto): Promise<{ messageId: string }> {
          return { messageId: await this.email.send(dto.to, dto.toName, dto.subject, dto.html) };
      }
  }
  ```
  Sin `@UseGuards(JwtAuthGuard)`, sin `@Roles`, sin `@Public()`. Solo `ApiKeyGuard` global lo protege. `SendEmailDto` acepta `to`, `subject`, `html` arbitrarios.
- **Comportamiento esperado**: Endpoint interno solo llamable desde el frontend server (con `INTERNAL_SERVICE_TOKEN`) o solo admin.
- **Causa raíz probable**: Endpoint creado para uso del frontend sin considerar que `ApiKeyGuard` no es suficiente (la API_KEY vivirá en el bundle mobile).
- **Riesgo actual**: Si la API_KEY se filtra (trivial desde la APK/IPA vía reverse engineering), un atacante puede enviar **phishing masivo desde el dominio confiable de Hireeo** (Brevo/Postmark) a cualquier destinatario. Limitado solo por ThrottlerGuard (100/min global, pero escalable con IPs/cuentas).
- **Riesgo futuro**: Blacklisting del dominio, demanda, pérdida de confianza.
- **Escenario de fallo**: Atacante extrae API_KEY del APK → envía 100K phishing/día desde `noreply@hireeo.app`.
- **Solución mínima**: Agregar `@UseGuards(ServiceTokenGuard)` (ya existe) o `@Roles(Role.SUPER_ADMIN)` + restringir destinatarios a whitelist.
- **Solución recomendada**: Migrar a sistema de templates (el `html` no debe venir del cliente nunca) + `ServiceTokenGuard` interno + rate limiting por IP.
- **Alternativas**: Eliminar el endpoint y enviar emails solo desde server actions del frontend.
- **Posibles efectos secundarios**: Cambiar la forma en que el frontend envía mails transaccionales.
- **Dependencias**: `frontend/src/features/contact/actions/mutations.ts` lo usa para enviar mails de contacto.
- **Criterio de aceptación**: Sin `INTERNAL_SERVICE_TOKEN` → 401/403.
- **Prueba necesaria**: curl con solo API_KEY → 401.

### BE-SEC-004 — IDOR en WebSocket chat (join_conversation sin validar participación)

- **Capa**: Backend
- **Categoría**: Vulnerabilidad (Broken Access Control / IDOR)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/modules/chat/chat.gateway.ts:67-77`, `backend/src/modules/chat/chat.service.ts:168-179`
- **Evidencia**:
  ```ts
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(client, data: { conversationId: string }) {
      if (!client.userId) return;
      void client.join(`conversation:${data.conversationId}`);  // sin validar participación
      await this.chatService.markAsRead(data.conversationId, client.userId);
  }
  ```
  Mensajes emitidos a `conversation:<id>` en `chat.gateway.ts:103-105`.
- **Comportamiento esperado**: Antes de hacer `client.join`, verificar que `client.userId` es participante (`clientId` o `providerId`) de la conversación.
- **Causa raíz probable**: Falta de autorización en eventos de socket; se asume que solo el frontend legítimo envía IDs válidos.
- **Riesgo actual**: Cualquier usuario autenticado se une a rooms de conversaciones ajenas y recibe en tiempo real todos los mensajes privados de cualquier par (cliente ↔ proveedor).
- **Escenario de fallo**: Atacante descubre un `conversationId` (UUID) y lee el chat privado de cualquier transacción del marketplace.
- **Solución mínima**:
  ```ts
  const conv = await this.prisma.conversation.findUnique({ where: { id } });
  if (!conv || (conv.clientId !== client.userId && conv.providerId !== client.userId)) {
      client.disconnect(); return;
  }
  client.join(`conversation:${id}`);
  ```
- **Solución recomendada**: Crear un `ChatAccessGuard` reutilizable para todos los eventos del gateway.
- **Posibles efectos secundarios**: Mensajes a conversaciones propias siguen funcionando.
- **Criterio de aceptación**: Test: user C intenta `join_conversation` de conversación A↔B → rechazado.
- **Prueba necesaria**: E2E con 3 sockets.

### BE-SEC-005 — `JwtAuthGuard` NO es global (clase entera de endpoints olvidados)

- **Capa**: Backend
- **Categoría**: Arquitectura de seguridad / Vulnerabilidad
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/app.module.ts:70-79`
- **Evidencia**: Solo `ThrottlerGuard` y `ApiKeyGuard` son `APP_GUARD`. Endpoints sin `@UseGuards(JwtAuthGuard)` confirmados:
  - `GET /users`, `GET /users/:id`, `GET /users/roles` (`users.controller.ts:34,52,74`)
  - `GET /users/:id/services` (línea 80, tiene guard pero pasa `:id` del path)
  - `POST /email/send` (BE-SEC-003)
  - `POST /interactions` (`interactions.controller.ts:18-22`)
  - `GET /service-requests/:id` (`service-requests.controller.ts:32-36`)
  - `GET /quotes/by-request/:id` (`quotes.controller.ts:27-31`)
- **Comportamiento esperado**: `JwtAuthGuard` global con `@Public()` explícito solo donde corresponda (auth, webhooks, listings públicos).
- **Causa raíz probable**: Patrón de NestJS no aplicado; reliance manual por controller.
- **Riesgo actual**: Cualquier endpoint nuevo olvidado queda expuesto con solo la API_KEY (que vivirá en el bundle mobile).
- **Riesgo futuro**: Clase entera de "controller olvidado sin guard" → recurrente.
- **Solución mínima**: Registrar `JwtAuthGuard` como `APP_GUARD` y marcar `@Public()` en controllers públicos.
- **Solución recomendada**: Definir política: todo endpoint es privado por defecto; `@Public()` es excepción explícita con justificación en PR.
- **Posibles efectos secundarios**: Algunos endpoints actualmente sin guard se rompen para callers que no mandan JWT → corregir uno a uno.
- **Criterio de aceptación**: `GET /users` sin JWT → 401.
- **Prueba necesaria**: Suite E2E que cubra endpoints que deben requerir auth.

### BE-SEC-006 — Firmas de webhook logueadas en claro

- **Capa**: Backend
- **Categoría**: Vulnerabilidad (Information disclosure)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Medio-Alto
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `backend/src/modules/payments/gateways/mercadopago.gateway.ts:38`, `backend/src/modules/payments/gateways/stripe.gateway.ts:45`
- **Evidencia**:
  ```ts
  this.logger.log(`Verifying MercadoPago webhook, x-signature: ${signatureHeader}`);
  this.logger.log(`Verifying Stripe webhook, signature: ${signature}`);
  ```
- **Comportamiento esperado**: Loguear `signature.substring(0,8)` + `...` o solo metadata (provider, event id).
- **Causa raíz probable**: Debug temporal que llegó al commit.
- **Riesgo actual**: Si los logs se exponen (error tracking, ELK mal configurado), combinados con el body del webhook permiten reproducirlo o inferir el secret.
- **Solución mínima**: Quitar los `logger.log` de firmas. Usar `this.logger.debug(\`webhook ${provider} received\`)`.
- **Criterio de aceptación**: Grep de `signature` / `x-signature` en logs → 0 resultados.

### FE-SEC-001 — IDOR en `publicarServicioPublico`

- **Capa**: Frontend
- **Categoría**: Vulnerabilidad (IDOR)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/features/services/publish/actions/mutations.ts:54-66`
- **Evidencia**:
  ```ts
  if (session?.user?.id) {
      usuarioId = session.user.id;
  } else {
      const usuarioIdFromForm = formData.get('usuarioId') as string;
      if (!usuarioIdFromForm) return { error: 'No autorizado...' };
      usuarioId = usuarioIdFromForm;  // controlado por el cliente
  }
  ```
- **Comportamiento esperado**: El `usuarioId` debe venir siempre del servidor (`session.user.id` o un token efímero firmado emitido en `verificarOCrearUsuario`).
- **Causa raíz probable**: Flujo "guest publish" sin token server-side.
- **Riesgo actual**: Cualquiera (sin autenticación) publica servicios en nombre de cualquier `userId` existente.
- **Escenario de fallo**: Spam/fraude masivo: atacante crea miles de servicios falsos en nombre de usuarios legítimos.
- **Solución mínima**: Tras `verificarOCrearUsuario`, emitir un JWT efímero firmado (HMAC) con `{ guestId, exp: 5min }` y exigirlo en `publicarServicioPublico`.
- **Solución recomendada**: El backend debe resolver `userId` del JWT del caller; el frontend nunca debe enviar `usuarioId` en el body.
- **Dependencias**: Requiere cambio en server action + posiblemente en endpoint `/services` del backend.
- **Criterio de aceptación**: Cambiar `usuarioId` en el form → no tiene efecto; el servicio se asocia al dueño del token.

### FE-SEC-002 — IDOR en `actualizarPerfil`

- **Capa**: Frontend
- **Categoría**: Vulnerabilidad (IDOR)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/features/users/actions/mutations.ts:120,144`
- **Evidencia**:
  ```ts
  const userId = formData.get('userId') as string;
  await apiClient.patch(`/users/${userId}`, ..., { token });
  ```
- **Comportamiento esperado**: `userId` desde `session.user.id` (servidor), nunca del formData.
- **Riesgo actual**: Usuario autenticado edita nombre/teléfono/avatar de cualquier otro usuario.
- **Solución mínima**: `const userId = session.user.id` y eliminar `userId` del form.
- **Criterio de aceptación**: Modificar `userId` del form no tiene efecto.

### FE-RISK-001 — Ausencia total de boundaries de error/loading

- **Capa**: Frontend
- **Categoría**: UX / Resiliencia
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: 0 archivos `error.tsx`/`loading.tsx`/`not-found.tsx`/`global-error.tsx` en todo `frontend/src/app/`.
- **Comportamiento esperado**: Cada route segment debe tener `loading.tsx`; el root debe tener `global-error.tsx`; rutas dinámicas deben tener `error.tsx` y `not-found.tsx`.
- **Riesgo actual**: Cualquier error runtime (fetch fallido, JSON malformado) en una página → pantalla blanca o error 500 del framework sin recovery. Errores en `layout.tsx` rompen toda la app.
- **Solución mínima**: Crear `app/global-error.tsx`, `app/error.tsx`, `app/not-found.tsx`, y `loading.tsx` en segments críticos (`/(country)/[country]/(public)/`, `/admin`, `/profile`).
- **Criterio de aceptación**: Simular un throw en una página → boundary captura y muestra UI de recuperación.

### FE-PAY-001 — Webhook Stripe no envía `x-api-key` al backend

- **Capa**: Frontend (integración con Backend)
- **Categoría**: Bug crítico / Integridad de pagos
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/app/api/webhooks/stripe/route.ts:37-46`
- **Evidencia**:
  ```ts
  await fetch(`${apiUrl}/subscriptions/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },  // sin x-api-key
      body: JSON.stringify({ serviceId, durationMonths, transactionId, paymentGateway }),
  });
  ```
- **Comportamiento esperado**: El fetch debe incluir `x-api-key` (y opcionalmente `INTERNAL_SERVICE_TOKEN`).
- **Riesgo actual**: `ApiKeyGuard` global del backend retorna 401 silencioso → **las suscripciones pagadas con Stripe nunca se activan**. El usuario paga pero no recibe premium. No se verifica la respuesta del fetch.
- **Causa raíz probable**: Omisión del header + no chequear `res.ok`.
- **Solución mínima**:
  ```ts
  headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY },
  const res = await fetch(...); if (!res.ok) console.error('activation failed', await res.text());
  ```
- **Solución recomendada**: Mover el handler del webhook al backend directamente (sin reenvío desde Next.js). El webhook de Stripe debe llamar a NestJS, no al frontend.
- **Criterio de aceptación**: Tras un `checkout.session.completed`, el `service.level` pasa a `PREMIUM` y `featured=true`.

### FE-SEC-003 — XSS en JSON-LD de página de servicio (escape roto)

- **Capa**: Frontend
- **Categoría**: Vulnerabilidad (XSS almacenado)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/app/(country)/[country]/(public)/service/[slug]/page.tsx:175`
- **Evidencia**:
  ```ts
  dangerouslySetInnerHTML={{
      __html: JSON.stringify(localBusinessSchema).replace(/</g, '<'),  // replace a sí mismo (no-op)
  }}
  ```
- **Comportamiento esperado**: `.replace(/</g, '\\u003c')` para escapar `</script>`. O mejor: usar `<script>` con `JSON.stringify` directo (Next.js lo gestiona) o `next/script`.
- **Riesgo actual**: Un atacante crea un servicio con `title`, `commune` o `description` que contenga `</script><script>alert(document.cookie)</script>` → JS se ejecuta en el navegador de cualquier visitante (incl. admin). Robo del JWT de NextAuth.
- **Solución mínima**: `.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')`.
- **Solución recomendada**: Reemplazar `dangerouslySetInnerHTML` por un componente server-side con `next/script` y `type="application/ld+json"` (no requiere escape manual).
- **Criterio de aceptación**: Test con un título que contenga `</script>` → no se rompe el tag.

### FE-SEC-004 — Inyección HTML en email de contacto

- **Capa**: Frontend
- **Categoría**: Vulnerabilidad (HTML injection)
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/features/contact/actions/mutations.ts:55-69`
- **Evidencia**:
  ```ts
  <div class="value">${datos.nombre}</div>
  ...
  ${datos.mensaje.replace(/\n/g, '<br>')}  // mensaje sin escapar HTML
  ```
- **Comportamiento esperado**: Escapar todos los campos user-controlled antes de interpolarlos en HTML. Zod no filtra HTML.
- **Riesgo actual**: Atacante envía `mensaje = '<img src=x onerror=alert(1)>'` → se ejecuta en el cliente de mail del destinatario (`CONTACT_EMAIL`). Útil para phishing interno o exploits de cliente de mail.
- **Solución mínima**: `escapeHtml(datos.nombre)` etc. antes de interpolar. Convertir `\n` a `<br>` solo tras escapar.
- **Solución recomendada**: Usar templates de email en el backend (MJML/React Email) con auto-escaping; el frontend solo envía datos planos.
- **Criterio de aceptación**: Test con payload HTML → se renderiza como texto plano en el mail.

### FE-PAY-002 — Server actions de pago MercadoPago son stubs

- **Capa**: Frontend
- **Categoría**: Bug crítico / Integridad de pagos
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Medio
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `frontend/src/features/payments/actions/mutations.ts:5-24`
- **Evidencia**:
  ```ts
  export async function procesarPagoWebhook(...) { console.info(...); return { success: true }; }
  export async function crearPagoPremium(...) { console.info(...); return { success: true }; }
  ```
  Invocados desde `app/api/webhooks/mercadopago/route.ts:52`.
- **Riesgo actual**: El webhook MP llama al stub → los pagos premium de MercadoPago **nunca se activan** aunque el cliente haya pagado. Para CL/AR/UY (MercadoPago) esto es la mayoría del revenue.
- **Solución mínima**: Implementar la lógica real de activación llamando al backend (`/subscriptions/activate` con `x-api-key`).
- **Solución recomendada**: Mover toda la lógica de webhook al backend (NestJS tiene `payments` y `subscriptions` modules) y eliminar el handler intermedio en Next.js.
- **Criterio de aceptación**: Tras pago MP aprobado, `service.level = PREMIUM` en DB.

### MOB-001 — apiClient mobile no envía `x-api-key`

- **Capa**: Mobile
- **Categoría**: Bug crítico / Contrato BE-Mobile roto
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `appmobile/src/shared/lib/apiClient.ts:40-45`
- **Evidencia**:
  ```ts
  function buildHeaders(extra?) {
      const headers = { 'Content-Type': 'application/json' };
      if (_accessToken) headers.Authorization = `Bearer ${_accessToken}`;
      if (_locale) headers['Accept-Language'] = _locale;
      return { ...headers, ...extra };
  }
  ```
  `EXPO_PUBLIC_API_KEY` existe en `.env.local`/`.env.production` pero **nunca se lee** en código (`grep x-api-key` → 0 resultados).
- **Riesgo actual**: `ApiKeyGuard` global del backend retorna 401 silencioso a **todas** las llamadas mobile. Además dispara el flujo de refresh en bucle (porque el 401 es de API key, no de JWT).
- **Solución mínima**:
  ```ts
  headers['x-api-key'] = process.env.EXPO_PUBLIC_API_KEY ?? '';
  ```
- **Posibles efectos secundarios**: La API_KEY vivirá en el bundle → ver BE-SEC-005 para implicancia (dejar endpoints sensibles sin JwtAuthGuard los expone).
- **Solución recomendada a largo plazo**: Migrar a scheme de auth mobile más robusto (App Attest / Play Integrity + short-lived API keys por sesión).
- **Criterio de aceptación**: Llamada `GET /users/me` desde mobile con JWT válido → 200.

### MOB-002 — `SOCKET_URL` hardcodeado a localhost

- **Capa**: Mobile
- **Categoría**: Bug crítico
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Muy bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `appmobile/src/features/messages/context/SocketContext.tsx:10-11`
- **Evidencia**:
  ```ts
  const SOCKET_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  ```
- **Riesgo actual**: En builds de EAS, el socket SIEMPRE apunta a localhost → chat offline en cualquier build de producción/preview.
- **Solución mínima**: `const SOCKET_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).replace(/\/$/, '')`.
- **Criterio de aceptación**: En build EAS preview, el socket conecta a la URL de producción.

### MOB-003 — Push notifications rotas (falta `extra.eas.projectId`)

- **Capa**: Mobile
- **Categoría**: Bug crítico
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `appmobile/src/features/notifications/lib/registerPushToken.ts:49-50`, `appmobile/app.json` (sin `extra.eas.projectId`)
- **Evidencia**:
  ```ts
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;  // early return silencioso
  ```
- **Riesgo actual**: `getExpoPushTokenAsync` nunca se llama → push notifications inactivas en builds de EAS. Las notificaciones del backend (`notifications.service.ts`) no llegan a ningún dispositivo.
- **Solución mínima**: Agregar a `app.json`:
  ```json
  "extra": { "eas": { "projectId": "<EAS_PROJECT_ID>" } }
  ```
  Y obtener el projectId de `eas init`.
- **Criterio de aceptación**: En build EAS preview, `getExpoPushTokenAsync` retorna un token.

### MOB-004 — Android firmado con debug keystore en release

- **Capa**: Mobile (Infraestructura de release)
- **Categoría**: Bloqueador de release
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Crítico
- **Esfuerzo**: Medio
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `appmobile/android/app/build.gradle:112-115`
- **Evidencia**:
  ```gradle
  release {
      signingConfig signingConfigs.debug
  }
  ```
- **Riesgo actual**: Imposible subir a Play Store. Cualquiera puede re-firmar la APK.
- **Solución mínima**: Crear keystore de release, guardar references en EAS, configurar `eas.json` con `credentialsSource: remote`.
- **Solución recomendada**: Usar EAS Build con credentials management (no keystores locales).
- **Criterio de aceptación**: Build release con SHA-1 propio; subida a Play Console exitosa.

### MOB-005 — Identidad anónima (`com.anonymous.appmobile`, `app_name = "appmobile"`)

- **Capa**: Mobile
- **Categoría**: Bloqueador de release / Producto
- **Severidad**: Crítica
- **Urgencia**: Inmediata
- **Impacto**: Alto
- **Esfuerzo**: Bajo
- **Confianza**: Confirmada
- **Estado**: Confirmado
- **Ubicación**: `appmobile/android/app/build.gradle:90,92`, `appmobile/android/app/src/main/res/values/strings.xml:2`
- **Evidencia**: `namespace 'com.anonymous.appmobile'`, `applicationId 'com.anonymous.appmobile'`, `<string name="app_name">appmobile</string>`.
- **Riesgo actual**: La app se publica con identidad anónima; los usuarios ven "appmobile" como nombre del launcher.
- **Solución mínima**: Cambiar a `app.hireeo` (o el bundle id definitivo) y `app_name = "Hireeo"`. Regenerar prebuild nativo.
- **Criterio de aceptación**: Build release con `applicationId` correcto y nombre visible "Hireeo".

---

## 🟠 HALLAZGOS ALTOS (26)

### BE-SEC-007 — `GET /users` y `/users/:id` exponen email y teléfono sin auth

- **Capa**: Backend | **Severidad**: Alta | **Urgencia**: Inmediata | **Confianza**: Confirmada
- **Ubicación**: `users.controller.ts:34-50,74-78`, `users.service.ts:22-37` (`USER_SELECT` incluye email+phone)
- **Evidencia**: Sin `@UseGuards(JwtAuthGuard)`. Con solo la API_KEY se enumeran todos los usuarios con emails y teléfonos.
- **Solución**: Aplicar BE-SEC-005 (JwtAuthGuard global) + reducir `USER_SELECT` para endpoints públicos.

### BE-SEC-008 — `POST /interactions` sin auth → manipulación de métricas

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `interactions.controller.ts:18-22`
- **Impacto**: Atacante inyecta views/calls/whatsapp falsos → manipula ranking e `isTopPro`.
- **Solución**: Exigir JWT y asociar `userId` del token; rate limitar.

### BE-SEC-009 — `POST /notifications/send` acepta `userId` del body

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `notifications.controller.ts:14-18`
- **Impacto**: Cualquiera autenticado envía push notifications (con `data` arbitrario) a cualquier usuario.
- **Solución**: Tomar `userId` del JWT; limitar a roles admin o contexto legítimo (nuevo mensaje, etc.).

### BE-SEC-010 — `POST /ai-agents/chat` permite crear solicitudes a nombre de otro

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `ai-agents/dto/agent-chat.dto.ts:21-23`, `ai-agents.controller.ts:22-24`, `ai-agents/tools/service-requests.tool.ts:17-29`
- **Solución**: `userId` del JWT, no del body.

### BE-SEC-011 — `findOne` en service-requests y quotes sin ownership

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `service-requests.controller.ts:32-36`, `quotes.controller.ts:27-31`
- **Impacto**: Filtra `user.id`, quotes con precios de cualquier ServiceRequest.
- **Solución**: Validar que el solicitante sea el dueño o un provider elegible.

### BE-SEC-012 — `createService` no exige rol Professional

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `services.controller.ts:36-42`
- **Impacto**: Un `Client` puede publicar servicios y cobrar sin verificación.
- **Solución**: `@Roles(Role.PROFESSIONAL)` o `PROVIDER`.

### BE-SEC-013 — `findBySlug` (público) expone email y teléfono del proveedor

- **Capa**: Backend | **Severidad**: Alta (scraping/spam) | **Confianza**: Confirmada
- **Ubicación**: `services.service.ts:142,168-170`
- **Solución**: Exponer contacto solo vía plataforma (chat) o tras `Interaction` registrada.

### BE-SEC-014 — Microsoft login no valida `audience` del token

- **Capa**: Backend | **Severidad**: Alta (potencial) | **Confianza**: Alta probabilidad
- **Ubicación**: `auth.service.ts:241-279`
- **Evidencia**: Solo verifica que el access token funcione contra Graph API; no valida `aud`/`appid`.
- **Solución**: Validar `aud` contra el clientId de Hireeo usando MSAL o `jose`.

### BE-SEC-015 — Validación MIME solo por `file.mimetype` (spoofeable)

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `upload/upload.service.ts:35-43`
- **Solución**: Validar magic bytes con `file-type`.

### BE-SEC-016 — Multer sin `limits.fileSize` (DoS por memoria)

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `upload.controller.ts:21-22` (`storage: undefined` = memory storage)
- **Solución**: `FileInterceptor(..., { limits: { fileSize: 4*1024*1024 } })`.

### BE-PAY-001 — Webhooks sin idempotencia ni control de concurrencia

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `subscriptions.service.ts:181-202`, `quotes.service.ts:95` (`acceptQuote`)
- **Impacto**: Reintentos de webhook disparan side-effects duplicados; doble accept podría disparar dos pagos.
- **Solución**: Columna `transactionId` UNIQUE (o tabla `processedWebhook`) + transacciones con lock optimista/pesimista.

### BE-PAY-002 — CORS wildcard en WebSocket gateway

- **Capa**: Backend | **Severidad**: Alta (potencial) | **Confianza**: Confirmada
- **Ubicación**: `chat.gateway.ts:20-25` (`cors: { origin: '*' }`)
- **Solución**: Allowlist de orígenes desde `FRONTEND_URL` + app scheme.

### BE-INFO-001 — `ai-agents.service.ts:1` y `service-requests.tool.ts:1` usan `@ts-nocheck`

- **Capa**: Backend | **Severidad**: Alta (deuda técnica / calidad) | **Confianza**: Confirmada
- **Impacto**: Inhabilita type-safety; errores pueden pasar a producción.
- **Solución**: Resolver los mismatch de tipos del AI SDK en lugar de silenciar.

### BE-INFO-002 — Fallback a ENV vars sin cifrar en `IntegrationConfigService`

- **Capa**: Backend | **Severidad**: Alta (potencial) | **Confianza**: Confirmada
- **Ubicación**: `integrations/integration-config.service.ts:88-98`
- **Impacto**: Si un attacker puede leer ENV (Vercel dashboard), bypassa el cifrado en DB.
- **Solución**: Eliminar fallback en producción; exigir migración a DB.

### BE-INFO-003 — `WebhookGuard` definido pero no usado (código muerto)

- **Capa**: Backend | **Severidad**: Media | **Confianza**: Confirmada
- **Ubicación**: `common/guards/webhook.guard.ts`
- **Solución**: Usarlo o eliminarlo.

### FE-SEC-005 — Webhook MercadoPago no verifica firma

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `app/api/webhooks/mercadopago/route.ts:14-66`
- **Impacto**: Atacante pasa un `paymentId` real de un pago legítimo de otro y dispara activación.
- **Solución**: Verificar HMAC `x-signature` con `MP_WEBHOOK_SECRET`.

### FE-SEC-006 — `GET /api/revalidate` sin auth

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `app/api/revalidate/route.ts:4-17`
- **Impacto**: DoS de caché (cualquiera fuerza `revalidateTag`).
- **Solución**: Exigir `INTERNAL_SERVICE_TOKEN` o token signed.

### FE-SEC-007 — Stripe session sin auth ni precio server-side

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `app/api/payments/stripe-session/route.ts:6-75`
- **Impacto**: Usuario crea sesión de Stripe con `amount` arbitrario → paga menos por premium.
- **Solución**: Auth obligatoria + consultar precio real al backend por `serviceId`.

### FE-SEC-008 — Tokens del backend expuestos en `session.user`

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `shared/types/auth.d.ts:11-12`, `app/api/auth/[...nextauth]/route.ts:138-139`
- **Impacto**: Un XSS roba access+refresh token del backend vía `useSession()`.
- **Solución**: Mover los tokens a cookies httpOnly separadas (no exponerlos en `session.user`).

### FE-SEC-009 — Contraseña de invitado con `Math.random()`

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `publish/actions/mutations.ts:25`
- **Solución**: `crypto.getRandomValues` o, mejor, que el backend genere la contraseña.

### FE-SEC-010 — Política de contraseñas inconsistente

- **Capa**: Frontend | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `auth/schemas/authSchemas.ts:7,12` (min 6) vs `users/schemas/userSchemas.ts:6-10` (min 8 + may + especial)
- **Solución**: Unificar `passwordSchema` y reutilizarlo.

### FE-SEC-011 — `robots.txt` no bloquea `/{country}/admin` ni `/{country}/profile`

- **Capa**: Frontend | **Severidad**: Alta (info exposure) | **Confianza**: Confirmada
- **Ubicación**: `app/robots.ts:9-13`
- **Solución**: Generar disallow dinámico por país o agregar los prefijos.

### MOB-006 — Logout no limpia cache de React Query

- **Capa**: Mobile | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `features/auth/context/AuthContext.tsx:91-98`
- **Impacto**: Datos sensibles del usuario anterior (favorites, conversations, addresses) quedan en cache para el próximo login en el mismo device.
- **Solución**: `queryClient.clear()` en logout.

### MOB-007 — Logout no invalida refresh token server-side

- **Capa**: Mobile | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `features/auth/lib/authService.ts:71-77`
- **Dependencias**: Requiere BE-SEC-002 (refresh token revocable) y endpoint `/auth/logout`.
- **Solución**: Llamar `POST /auth/logout` antes de limpiar storage.

### MOB-008 — Refresh fallado no navega al login

- **Capa**: Mobile | **Severidad**: Alta | **Confianza**: Confirmada
- **Ubicación**: `AuthContext.tsx:55-65`
- **Impacto**: Usuario con token expirado ve app vacía/cacheada sin redirección.
- **Solución**: Tras refresh fallido, `router.replace('/login')`.

### MOB-009 — `expo-image` instalado pero no usado (uso de `Image` de RN)

- **Capa**: Mobile | **Severidad**: Alta (performance) | **Confianza**: Confirmada
- **Ubicación**: 0 imports de `expo-image` en `src/`; `Image` de RN usado en ~6 archivos.
- **Solución**: Migrar a `expo-image` con `placeholder`, `transitionDuration`, cache nativo.

### MOB-010 — Ruta inválida en `ProveedorCard` (path web en mobile)

- **Capa**: Mobile | **Severidad**: Alta (UX rota) | **Confianza**: Confirmada
- **Ubicación**: `features/chatbot/components/ProveedorCard/index.tsx:36`
- **Evidencia**: `router.push(\`/${countryCode}/service/${proveedor.slug}\` as never)` — ruta del frontend web, no de mobile.
- **Solución**: `router.push(\`/service/${proveedor.slug}\`)`.

### MOB-011 — Ausencia de `GestureHandlerRootView`

- **Capa**: Mobile | **Severidad**: Alta (UX/gestures) | **Confianza**: Confirmada
- **Ubicación**: `app/_layout.tsx` (solo SafeAreaProvider + QueryClientProvider)
- **Solución**: Envolver la app en `<GestureHandlerRootView style={{flex:1}}>`.

### MOB-012 — Icon map hardcodeado de 528 líneas (viola regla icons0)

- **Capa**: Mobile | **Severidad**: Alta (deuda + violación AGENTS.md) | **Confianza**: Confirmada
- **Ubicación**: `shared/components/Icon/index.tsx:1-528` (paths SVG copiados de Tabler Icons)
- **Solución**: Migrar a MCP `icons0` como exige AGENTS.md raíz sección 8.

### TRANSV-001 — 0 tests automatizados en backend y mobile

- **Capa**: Transversal | **Severidad**: Alta | **Confianza**: Confirmada
- **Evidencia**: 0 archivos `*.spec.ts` en backend, 0 en mobile. Solo 5 specs E2E en frontend (`frontend/tests/`).
- **Impacto**: Cambios sin red de seguridad; regresiones detectadas tarde.
- **Solución**: Setup Jest en backend (cobertura mínima: services de auth, payments, ratings, services, users). Setup Jest + RNTL en mobile.

### TRANSV-002 — 0 CI/CD (no existe `.github/workflows/`)

- **Capa**: Transversal / DevOps | **Severidad**: Alta | **Confianza**: Confirmada
- **Solución**: GitHub Actions con jobs de lint, typecheck, test, build en PRs.

### TRANSV-003 — Next.js 16.1.1 con 13 CVEs HIGH

- **Capa**: Transversal / Seguridad | **Severidad**: Alta | **Confianza**: Confirmada
- **Evidencia**: `pnpm audit` en frontend: 30 vulnerabilities (13 high) todas en `next`. Versiones parchadas: 16.1.7, 16.2.5, 16.2.6.
- **Solución**: `pnpm --filter frontend add next@^16.2.6` y validar build/proxy/auth.

### TRANSV-004 — `multer` 2.0.2 vulnerable a DoS (CVE-2026-5079)

- **Capa**: Backend | **Severidad**: Alta | **Confianza**: Confirmada
- **Evidencia**: Vía `@nestjs/platform-express>multer`. Parche en `multer@>=2.2.0`.
- **Solución**: Override con pnpm + configurar `limits.fieldNestingDepth`.

### TRANSV-005 — `hono`, `ws`, `undici`, `esbuild` con CVEs en dev deps

- **Capa**: Transversal | **Severidad**: Alta-Media | **Confianza**: Confirmada
- **Evidencia**: `pnpm audit` workspace: 119 vulnerabilities (2 critical, 40 high, 69 mod, 8 low).
- **Solución**: `pnpm update -r -L`; overrides para transitivas.

---

## 🟡 HALLAZGOS MEDIOS (22)

| ID | Título | Capa | Confianza | Ubicación |
|---|---|---|---|---|
| BE-LINT-001 | 17 errores de biome (noExplicitAny, useNumberNamespace) | Backend | Confirmada | `src/modules/*` |
| BE-LINT-002 | `enableImplicitConversion: true` puede causar bugs sutiles | Backend | Potencial | `main.ts:55` |
| BE-DB-001 | Cascade deletes peligrosos (no soft-delete) | Backend | Confirmada | `schema.prisma` |
| BE-DB-002 | Sin auditoría de auth (login attempts, etc.) | Backend | Confirmada | — |
| BE-DB-003 | `P2002` expone nombre del campo único | Backend | Confirmada | `prisma-exception.filter.ts:38-42` |
| BE-SEC-017 | `/auth/refresh` sin `@Throttle` específico | Backend | Confirmada | `auth.controller.ts:41-48` |
| BE-SEC-018 | RolesGuard no valida país (multi-tenancy débil) | Backend | Confirmada | `common/guards/roles.guard.ts` |
| FE-LINT-001 | `pnpm lint` frontend roto (biome no instalado) | Frontend | Confirmada | `frontend/package.json:10` |
| FE-PERF-001 | 0 `next/dynamic` imports en todo el árbol | Frontend | Confirmada | — |
| FE-ARCH-001 | Componentes admin en `shared/components/admin/` | Frontend | Confirmada | viola AGENTS.md |
| FE-ARCH-002 | Componentes Chat en `shared/components/hireeo/ui/Chat*` | Frontend | Confirmada | debería ser `features/chat` |
| FE-UX-001 | `.parse()` en 20 server actions (UX mala) | Frontend | Confirmada | varias |
| FE-UX-002 | `revalidatePath('/profile/favorites')` sin prefijo país | Frontend | Confirmada | `favorites/actions/mutations.ts:19` |
| FE-UX-003 | Nominatim (OSM) sin User-Agent ni rate limit | Frontend | Confirmada | `HeroSearchBar:104`, `AddressForm:139` |
| FE-CONF-001 | `bcrypt` en `serverExternalPackages` sin uso | Frontend | Confirmada | `next.config.ts:11` |
| FE-PERF-002 | `apiClient` sin `AbortController`/timeout | Frontend | Confirmada | `lib/api/apiClient.ts:89` |
| MOB-LINT-001 | 7 errores de biome (empty blocks, etc.) | Mobile | Confirmada | `src/app/(tabs)/profile.tsx:258-272` |
| MOB-SEC-001 | `uploadImage` no envía auth ni API key | Mobile | Confirmada | `users/lib/uploadImage.ts:22-25` |
| MOB-SEC-002 | Permisos Android deprecados/innecesarios | Mobile | Confirmada | `AndroidManifest.xml:5-9` |
| MOB-PERF-001 | `apiClient` mobile sin timeout/AbortController | Mobile | Confirmada | `shared/lib/apiClient.ts:64` |
| MOB-ARCH-001 | Query keys inconsistentes (favoritos, service-requests) | Mobile | Confirmada | varias |
| MOB-CONF-001 | `lint` script referencia Biome pero no hay `biome.json` | Mobile | Confirmada | `package.json:51` |

---

## 🟢 HALLAZGOS BAJOS (15)

| ID | Título | Capa | Ubicación |
|---|---|---|---|
| BE-DEAD-001 | `WebhookGuard` no usado (código muerto) | Backend | `common/guards/webhook.guard.ts` |
| BE-LOG-001 | Logs con PII (destinatario email, títulos de push) | Backend | `email.service.ts:50`, `notifications.service.ts:55` |
| FE-DEAD-001 | `getInteraccionesReport` marcado `DEPRECATED` | Frontend | `analytics/actions/queries.ts:108` |
| FE-LOG-001 | 30+ `console.error` en server actions | Frontend | varias |
| FE-I18N-001 | Sin uso de `Intl.NumberFormat` en `formatCurrency` (mobile y frontend inconsistentes) | Transversal | varias |
| MOB-DEAD-001 | Hooks no usados (`useFavorites`, `useServiceMutations`, `useQuotes`, `useReviews`, `usePayments`) | Mobile | `features/*/hooks/` |
| MOB-DEAD-002 | `src/types/` existe pero vacío | Mobile | `src/types/` |
| MOB-DEAD-003 | `package.json` declara `react-native-web` + `react-dom` sin uso mobile-first | Mobile | `package.json:28-29,37` |
| MOB-B1 | `as never` para bypassear typed-routes | Mobile | `ChatIA:91`, `ProveedorCard:36` |
| MOB-I18N-001 | i18n default siempre `es` incluso para usuarios US | Mobile | `i18n.ts:32-35` |
| MOB-CONF-002 | `app.json` no define `splash`, `icon`, `adaptiveIcon`, bloque `ios` | Mobile | `app.json` |
| MOB-DOC-001 | README mobile es boilerplate sin tocar | Mobile | `README.md` |
| TRANSV-DOC-001 | Sin ADR (Architecture Decision Records) | Transversal | — |
| TRANSV-DOC-002 | Sin CHANGELOG por capa | Transversal | — |
| TRANSV-CONF-001 | `installCommand` inconsistente: backend `--frozen-lockfile`, frontend `--no-frozen-lockfile` | Transversal | `vercel.json` |

---

## ℹ️ HALLAZGOS INFORMATIVOS (12) — Buenas prácticas confirmadas

| ID | Observación | Ubicación |
|---|---|---|
| INFO-001 | ✅ `.env` correctamente gitignored en los 3 submódulos | `.gitignore` |
| INFO-002 | ✅ 0 secretos commiteados (solo `.env.example`) | `git ls-files` |
| INFO-003 | ✅ TypeScript strict + typecheck limpio en las 3 capas | `tsc --noEmit` |
| INFO-004 | ✅ `helmet`, CORS allowlist, ValidationPipe estricto, throttle | `main.ts`, `app.module.ts` |
| INFO-005 | ✅ AES-256-GCM correcto para credenciales | `integrations/crypto.service.ts` |
| INFO-006 | ✅ Comparaciones timing-safe en guards | `common/utils/timing-safe.ts` |
| INFO-007 | ✅ 0 `console.log` de secretos; 0 TODOs/FIXMEs | grep |
| INFO-008 | ✅ Server Components por defecto (0 páginas `'use client'`) | frontend |
| INFO-009 | ✅ `next/image` en todas las imágenes (0 `<img>` raw) | frontend |
| INFO-010 | ✅ `expo-secure-store` para tokens (0 AsyncStorage) | mobile |
| INFO-011 | ✅ Refresh token con cola anti-tormenta (mobile) | `apiClient.ts:27-93` |
| INFO-012 | ✅ Colores NativeWind sincronizados (`tailwind.config.js` ↔ `colors.ts`) | mobile |

---

## Resumen por severidad

| Severidad | Cantidad |
|---|---|
| Crítica | 18 |
| Alta | 26 |
| Media | 22 |
| Baja | 15 |
| Informativa | 12 |
| **Total** | **93** |

## Resumen por capa

| Capa | Críticos | Altos | Medios | Bajos |
|---|---|---|---|---|
| Backend | 6 | 13 | 8 | 2 |
| Frontend | 7 | 7 | 8 | 4 |
| Mobile | 5 | 7 | 6 | 8 |
| Transversal | 0 | 5 | 0 | 4 |
