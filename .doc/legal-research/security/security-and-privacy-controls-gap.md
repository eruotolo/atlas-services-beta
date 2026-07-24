# Gap Assessment de Controles de Seguridad y Privacidad

> **Proyecto:** Hireeo · **Fecha de corte:** 2026-07-23 · **Fase:** 1.1 (auditoría de código, solo lectura)
> **Marcos de referencia (uso REFERENCIAL, NO certificación):** OWASP ASVS 4.0, OWASP API Security Top 10 (2023), NIST Cybersecurity Framework 2.0 (Identify/Protect/Detect/Respond/Recover). Este documento **no** es una auditoría formal ni una atestación SOC 2/ISO 27001; mapea la evidencia del código a controles conocidos para orientar remediación.
> **Limitaciones:** análisis estático de repositorio; **producción no desplegada**; no se ejecutó SAST/DAST/pentest ni se revisó configuración de infraestructura (WAF, TLS, backups reales). "No confirmado" significa que no se halló evidencia en el código, no que el control esté necesariamente ausente en producción.

## Convención de estado
- ✅ **Presente (con evidencia)** — control implementado, referencia archivo:línea.
- ⚠️ **Parcial** — implementado con debilidades o cobertura incompleta.
- ❌ **Ausente / no confirmado** — sin evidencia en el código.

---

## 1. Control de acceso y autenticación (ASVS V2/V4; API1/API2/API5; NIST PR.AA)

| Control | Estado | Evidencia / brecha | Severidad |
|---------|--------|--------------------|-----------|
| Hashing de contraseñas robusto | ✅ | bcrypt 12 rondas — `auth.service.ts:15,57,102` | — |
| Comparación de secretos en tiempo constante | ✅ | `common/utils/timing-safe.ts:8-14` (api-key, service-token, webhook) | — |
| Autorización a nivel de objeto (evitar IDOR) | ❌ | IDOR en direcciones — `users.service.ts:241-295`; `GET /users` sin authz — `users.controller.ts:34-50` | **HIGH** (API1) |
| Autorización a nivel de función/rol | ⚠️ | `RolesGuard` no global; scoping por país no validado — `roles.guard.ts:12-25`; endpoints sin guard (`GET /users`, `/users/roles`) | **HIGH** (API5) |
| Validación de audiencia en OAuth | ⚠️ | Apple sí (`auth.service.ts:198`); Google ❌ (`:151-166`) y Microsoft ❌ (`:241-257`) | **HIGH** |
| Verificación de email | ❌ | Sin `emailVerified` ni flujo | **MEDIUM** |
| Recuperación de contraseña | ❌ | Sin endpoint forgot/reset (solo label i18n) | **MEDIUM** |
| MFA / 2FA | ❌ | No implementado | **MEDIUM** |
| Protección de fuerza bruta en login | ✅ | `@Throttle` 5/60s — `auth.controller.ts:31`; register 3/60s `:21` | — |
| Protección de fuerza bruta en refresh | ❌ | `POST /auth/refresh` sin `@Throttle` propio — `auth.controller.ts:41-48` | MEDIUM |
| Almacenamiento seguro de tokens de sesión | ⚠️ | NextAuth cookie httpOnly ✅ (`route.ts:174`) PERO tokens backend expuestos al cliente en el payload de sesión (`route.ts:138-139`); localStorage en web mobile (`appmobile/.../storage.ts:5-16`) | **HIGH** |
| Algoritmo JWT fijado explícitamente | ⚠️ | `algorithms` no restringido — `jwt.strategy.ts:15-19` | LOW |
| **Criterio de aceptación propuesto** | | Todo endpoint que devuelva/mute PII exige `JwtAuthGuard`; recurso atado al `sub` del JWT (no al `:id` de URL); `RolesGuard` valida rol **y** país; OAuth valida `aud`/tenant; tokens de backend nunca salen al cliente; MFA opcional para admins; reset de contraseña con token de un solo uso y expiración | |

## 2. Gestión de secretos y criptografía (ASVS V6; API8; NIST PR.DS)

| Control | Estado | Evidencia / brecha | Severidad |
|---------|--------|--------------------|-----------|
| Sin secretos hardcodeados en el código | ✅ | Verificado; matches son placeholders de UI | — |
| Sin `.env` en git / historial | ✅ | `git ls-files`/`log` limpios; `.gitignore` cubre `.env*` | — |
| Cifrado de credenciales en reposo | ✅ | AES-256-GCM, IV aleatorio, auth tag, clave validada a 32B — `crypto.service.ts:13-45` | — |
| Auditoría de acceso/cambio de secretos | ✅ | `IntegrationAuditLog` en toda mutación — `integrations.service.ts` | — |
| Minimización de superficie de secretos | ⚠️ | `GET /integrations/runtime` devuelve credenciales en claro; doble fuente (DB + env); secretos server-side en `frontend/.env.local` — `integration-runtime.controller.ts:15-21` | **HIGH** |
| Rotación de secretos | ❌ | `API_KEY`/`INTERNAL_SERVICE_TOKEN` estáticos, larga vida, sin rotación evidente | MEDIUM |
| Contraseñas privilegiadas fuera de env | ❌ | `SEED_SUPERADMIN_PASSWORD_*` en `.env` | LOW |
| **Criterio de aceptación propuesto** | | Token de runtime con scope por proveedor + rotación programada; separar `API_KEY` y `INTERNAL_SERVICE_TOKEN` de artefactos del frontend; fuente única de verdad para secretos de pago; secretos de superadmin fuera de archivos de entorno persistentes | |

## 3. Validación de entrada y protección de la aplicación (ASVS V5; API3/API6; NIST PR.PS)

| Control | Estado | Evidencia / brecha | Severidad |
|---------|--------|--------------------|-----------|
| Validación estricta de DTOs (backend) | ✅ | `ValidationPipe` `whitelist+forbidNonWhitelisted+transform` — `main.ts:49-58`; class-validator en DTOs | — |
| Validación en frontend (Server Actions) | ✅ | Zod `.parse()` — `users/actions/mutations.ts:40,71,122` | — |
| Endpoints sin DTO validado | ⚠️ | `@Body('x')` string en OAuth/refresh/chat — `auth.controller.ts:46,56,66,76`; `chat.controller.ts:24` | LOW |
| Límite de tamaño en mensajes de chat | ❌ | `send_message` sin validación/longitud — `chat.gateway.ts:88-100`; `Message.text` = `@db.Text` | MEDIUM |
| Validación de archivos subidos | ⚠️ | Valida MIME **declarado por cliente**, no magic-bytes — `upload.service.ts:35-43` (mitigado por re-encoding Cloudinary `:50`); tamaño 4MB, 10 archivos | MEDIUM |
| Cabeceras de seguridad backend | ✅ | `helmet()` — `main.ts:26` | — |
| Cabeceras de seguridad frontend (CSP/HSTS/X-Frame-Options) | ❌ | Sin `headers()` — `next.config.ts`; agravado por `dangerouslySetInnerHTML` (GTM/GA/JSON-LD) | **HIGH** |
| CORS restringido | ⚠️ | HTTP restringido a `FRONTEND_URL` — `main.ts:29-34`; **WebSocket `origin:'*'`** — `chat.gateway.ts:20-25` | MEDIUM |
| Prevención de open redirect | ✅ | callbackUrl solo relativo — `proxy.ts:129-131` | — |
| Rate limiting global | ✅ | ThrottlerModule (10/1s, 100/60s) — `app.module.ts:40-43` | — |
| Protección prompt injection (IA) | ❌ | Interpolación cruda de input en prompts — `chatbot.service.ts:56`, `matchmaking.ts:39` | **HIGH** |
| Moderación de output de IA / safety settings | ❌ | Sin `safetySettings`/moderación en ninguna función IA | **HIGH** |
| **Criterio de aceptación propuesto** | | CSP restrictiva con nonces para los scripts inline; HSTS + X-Frame-Options DENY + Referrer-Policy + Permissions-Policy; DTO validado en todo endpoint (incl. WS con límite de longitud); validación de archivos por contenido; CORS de WebSocket restringido a orígenes conocidos; delimitación/saneamiento de input en prompts + `safetySettings` + moderación de salida | |

## 4. Protección de datos y privacidad (ASVS V8/V9; NIST PR.DS; GDPR art. 25/32)

| Control | Estado | Evidencia / brecha | Severidad |
|---------|--------|--------------------|-----------|
| Datos de tarjeta fuera de la plataforma (PCI) | ✅ | Tokenización client-side (MP) / Checkout hospedado (Stripe); sin PAN/CVV en DB | — |
| Filtrado de campos sensibles en respuestas | ✅ | `SerializeInterceptor` elimina `password`/`refreshToken` — `serialize.interceptor.ts:14-16` (⚠️ lista fija, no cubre `otp`/`secret`/`apiKey`) | LOW |
| Consentimiento previo de cookies/tracking | ❌ | GA4+GTM sin consentimiento ni CMP — `layout.tsx:174-207` | **CRITICAL** |
| Registro de consentimiento (modelo de datos) | ❌ | Sin tabla de consentimiento | HIGH |
| Derecho de acceso/portabilidad | ❌ | Sin endpoint de exportación | **HIGH** |
| Derecho de supresión (autoservicio) | ⚠️ | Backend `DELETE /users/:id` (hard delete, sin anonimización) pero sin UI para el titular — `users.service.ts:230-237` | MEDIUM |
| Derecho de rectificación | ⚠️ | Parcial (name/phone/avatar; email no) — `users.service.ts:130-142` | LOW |
| Minimización en flujos de IA | ❌ | Texto libre + `userId` + historial enviados a Google — `ai-agents.service.ts:48,78` | MEDIUM |
| Transparencia de IA (aviso al usuario) | ❌ | Sin disclaimer "generado por IA" | MEDIUM |
| PII en logs | ⚠️ | Email del destinatario logueado — `email.service.ts:50` | LOW/MEDIUM |
| Cifrado de comunicaciones privadas (chat) | ❌ | `Message.text` en claro, sin cifrado app/E2E — `schema.prisma:456` | MEDIUM |
| Política de retención definida | ❌ | Sin campos/lógica de retención ni soft-delete (salvo `CommentStatus.DELETED`) | MEDIUM |
| **Criterio de aceptación propuesto** | | CMP con consentimiento previo, granular y revocable + Consent Mode antes de GA/GTM; modelo de consentimiento persistido; endpoints de acceso/portabilidad (export JSON) y supresión con anonimización respetando retención legal; disclaimers de IA + minimización de PII en prompts; retención por categoría documentada | |

## 5. Detección, respuesta y resiliencia (NIST DE/RS/RC; ASVS V7)

| Control | Estado | Evidencia / brecha | Severidad |
|---------|--------|--------------------|-----------|
| Verificación de firma en webhooks (backend) | ✅ | Stripe/MP/KYC con `constructEvent`/HMAC timing-safe, fail-closed — `stripe.gateway.ts:44-55`; `mercadopago.gateway.ts:37-76`; `kyc.service.ts:30-54` | — |
| Verificación de firma en webhooks (frontend) | ❌ | MP frontend sin verificación de firma — `webhooks/mercadopago/route.ts:14-61` | **CRITICAL** |
| Manejo de errores sin fuga al cliente | ✅ | `PrismaExceptionFilter` sin stack trace — `prisma-exception.filter.ts:20-62` | — |
| Filtro catch-all de excepciones | ❌ | Solo Prisma; resto al handler por defecto — `main.ts:43` | LOW/MEDIUM |
| Nivel de logging apropiado en producción | ⚠️ | `logger:['error','warn','log','debug']` siempre activo — `main.ts:17` | LOW |
| Logging/auditoría de moderación | ⚠️ | Moderación de reseñas sin registro del acto — `ratings.controller.ts:48-55` | LOW |
| Screening AML/OFAC/sanciones | ❌ | Ausente (condicional a pagos funcionales) — 0 resultados | CRITICAL (condicional) |
| Detección de fraude propia | ⚠️ | Solo fingerprinting nativo de MP — `PaymentBrick.tsx:43` | MEDIUM |
| Monitoreo / alertas / SIEM | ❌ | No confirmado en el código | — (verificar en infra) |
| Backups / recuperación | ❌ | No confirmado en el código | — (verificar en infra) |
| Plan de respuesta a incidentes / breach notification | ❌ | No confirmado en el repo | HIGH (obligación legal en las 5 jurisdicciones) |
| **Criterio de aceptación propuesto** | | Unificar webhooks en el backend con firma verificada (eliminar los divergentes del frontend); filtro global de excepciones + logging por nivel según entorno; registro de actos de moderación; screening AML antes de habilitar cobros; documentar backups/restauración y un playbook de respuesta a incidentes con plazos de notificación por jurisdicción | |

---

## 6. Resumen de brechas priorizadas

**Bloqueantes de lanzamiento (CRITICAL/HIGH) que dependen de código (no de infra):**
1. **[CRITICAL]** GA4/GTM sin consentimiento + sin CMP (§4) — bloqueante UE.
2. **[CRITICAL]** Webhook MercadoPago frontend sin verificación de firma (§5).
3. **[HIGH]** IDOR/BOLA en direcciones y `GET /users` sin authz — fuga de PII (§1).
4. **[HIGH]** Tokens de backend expuestos al cliente + localStorage web mobile (§1).
5. **[HIGH]** OAuth Google/Microsoft sin validar audiencia (§1).
6. **[HIGH]** Sin CSP/HSTS en frontend (§3).
7. **[HIGH]** Prompt injection + sin moderación de output de IA (§3).
8. **[HIGH]** Exposición de credenciales en claro vía `/integrations/runtime` con secretos estáticos (§2).
9. **[HIGH]** Sin exportación/portabilidad de datos ni notice-and-action de contenido ilícito (§4 y code-audit §5.6).

**Condicionales a que el flujo de pagos/escrow se vuelva funcional:**
- Screening AML/OFAC, facturación/IVA, licencias de transmisión de dinero, alcance PCI (SAQ-A) — hoy los cobros/escrow/KYC-onboarding son stubs.

**Controles positivos confirmados (no re-trabajar):** bcrypt 12, timing-safe, AES-256-GCM con auditoría, ValidationPipe estricto + Zod, SerializeInterceptor, moderación previa de reseñas, verificación de firma de webhooks en backend, tokenización de pagos (PCI), higiene de git.

> **Nota final:** los estados ❌/⚠️ marcados como "no confirmado" (backups, SIEM, WAF, TLS, respuesta a incidentes) requieren revisión de la infraestructura de producción, fuera del alcance de esta auditoría de código. Requiere validación por especialista de seguridad y abogado habilitado por jurisdicción antes de cualquier atestación.
