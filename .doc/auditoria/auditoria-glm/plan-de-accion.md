# Plan de acción

Plan priorizado por ventanas temporales. Cada acción incluye objetivo, responsable sugerido, dependencias, riesgo, esfuerzo, impacto, resultado esperado y criterio de aceptación.

**Responsables sugeridos**: BE (backend engineer), FE (frontend engineer), MOB (mobile engineer), DEV (DevOps), QA (QA engineer), SEC (security), ALL (compartido).

---

## 🚨 Primeras 24-72 horas (Crítico)

Objetivo: **bloquear deploy a producción y resolver vulnerabilidades de seguridad y de integridad de pagos**.

### A01 — Hacer `JwtAuthGuard` global en backend
- **Objetivo**: Eliminar la clase entera de "controller olvidado sin guard".
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo (algunos endpoints públicos deben marcarse `@Public()`).
- **Esfuerzo**: Bajo (2-4h).
- **Impacto**: Crítico.
- **Resultado**: `app.module.ts` registra `JwtAuthGuard` como `APP_GUARD`.
- **Criterio de aceptación**: `GET /users` sin JWT → 401; `/auth/login` y `/subscriptions/webhook` marcados `@Public()` siguen funcionando.
- **Hallazgos resueltos**: BE-SEC-005, BE-SEC-007, BE-SEC-008.

### A02 — Fix IDOR en addresses, chat, publicar servicio, editar perfil
- **Objetivo**: Eliminar acceso cross-user.
- **Responsable**: BE + FE.
- **Dependencias**: A01.
- **Riesgo**: Bajo.
- **Esfuerzo**: Medio (1-2 días).
- **Impacto**: Crítico.
- **Resultado**: Todos los endpoints/actions usan `@CurrentUser()` o `session.user.id`; no aceptan `userId` del cliente.
- **Criterio de aceptación**: Tests E2E con 2 usuarios cubren IDOR en addresses, chat, publish, update profile.
- **Hallazgos**: BE-SEC-001, BE-SEC-004, FE-SEC-001, FE-SEC-002.

### A03 — Proteger `/email/send` y limpiar logs de firmas
- **Objetivo**: Cerrar vector de phishing y exposure de firmas.
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Muy bajo (1h).
- **Impacto**: Crítico.
- **Resultado**: `/email/send` con `@UseGuards(ServiceTokenGuard)`; logs de firmas eliminados.
- **Criterio de aceptación**: curl con solo API_KEY → 401; grep de `signature` en logs → 0.
- **Hallazgos**: BE-SEC-003, BE-SEC-006.

### A04 — Añadir `x-api-key` en apiClient mobile
- **Objetivo**: Hacer la app funcional contra backend.
- **Responsable**: MOB.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Muy bajo (15 min).
- **Impacto**: Crítico.
- **Resultado**: `buildHeaders` incluye `x-api-key: process.env.EXPO_PUBLIC_API_KEY`.
- **Criterio de aceptación**: `GET /users/me` desde mobile con JWT → 200.
- **Hallazgos**: MOB-001.

### A05 — Fix XSS JSON-LD + HTML injection en email de contacto
- **Objetivo**: Cerrar injection vectors.
- **Responsable**: FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (2h).
- **Impacto**: Alto.
- **Resultado**: JSON-LD usa escape correcto o `next/script`; email de contacto escapa HTML.
- **Criterio de aceptación**: Test con payload `</script>` no se ejecuta; email de contacto renderiza payload como texto.
- **Hallazgos**: FE-SEC-003, FE-SEC-004.

### A06 — Mover webhook Stripe/MP al backend (o añadir `x-api-key` + implementar MP)
- **Objetivo**: Asegurar que los pagos activen suscripciones.
- **Responsable**: BE + FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Medio (cambiar URLs de webhook en dashboards de Stripe/MP).
- **Esfuerzo**: Medio (1-2 días).
- **Impacto**: Crítico.
- **Resultado**: Webhook Stripe/MP llama directo al backend con verificación de firma; `/subscriptions/activate` protegido por signature verification interna.
- **Criterio de aceptación**: Tras `checkout.session.completed` real o simulado, `service.level = PREMIUM` en DB.
- **Hallazgos**: FE-PAY-001, FE-PAY-002, FE-SEC-005, BE-PAY-001.

### A07 — Upgrade Next.js a `>=16.2.6` y `multer@>=2.2.0`
- **Objetivo**: Cerrar 13 CVEs HIGH + DoS multer.
- **Responsable**: FE (Next.js), BE (multer).
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo-Medio (verificar que proxy/auth/build sigan funcionando).
- **Esfuerzo**: Bajo (2h).
- **Impacto**: Alto.
- **Resultado**: `pnpm audit` sin CVEs HIGH en `next` ni `multer`.
- **Criterio de aceptación**: Build + e2e de auth pasan.
- **Hallazgos**: TRANSV-003, TRANSV-004.

### A08 — Bloquear cualquier deploy a producción
- **Objetivo**: Contención.
- **Responsable**: DEV.
- **Dependencias**: Ninguna.
- **Riesgo**: Ninguno.
- **Esfuerzo**: Muy bajo.
- **Impacto**: Crítico.
- **Resultado**: Vercel `promote: false` para el proyecto hasta clearance.

---

## 📅 Próximos 7 días (Alto impacto, bajo riesgo)

### B01 — Refresh token rotation + revocación
- **Objetivo**: Logout efectivo; contención ante fuga.
- **Responsable**: BE.
- **Dependencias**: Migración Prisma.
- **Riesgo**: Medio (cambia flujo auth).
- **Esfuerzo**: Medio (2-3 días).
- **Impacto**: Alto.
- **Resultado**: Modelo `RefreshToken` con `familyId`, rotación al uso, invalidación de familia ante reúso.
- **Criterio de aceptación**: Tras logout, refresh anterior retorna 401; reúso de token rotado invalida la familia.
- **Hallazgos**: BE-SEC-002.

### B02 — Mover tokens del backend a cookies httpOnly separadas
- **Objetivo**: Reducir impacto de XSS.
- **Responsable**: FE.
- **Dependencias**: B01 (refresh revocable).
- **Riesgo**: Medio.
- **Esfuerzo**: Medio (1-2 días).
- **Impacto**: Alto.
- **Criterio**: `session.user` ya no contiene `backendToken`/`backendRefreshToken`; apiClient SSR los lee de cookies.
- **Hallazgos**: FE-SEC-008.

### B03 — Setup CI/CD GitHub Actions
- **Objetivo**: Automatizar calidad.
- **Responsable**: DEV.
- **Dependencias**: Fix lint frontend (B04).
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Alto.
- **Criterio**: PR dispara lint + typecheck + audit + build en las 3 capas.
- **Hallazgos**: TRANSV-002.

### B04 — Fix `pnpm lint` frontend (instalar biome)
- **Objetivo**: Lint funcional.
- **Responsable**: FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Muy bajo (15 min).
- **Impacto**: Medio.
- **Criterio**: `pnpm --filter frontend lint` corre biome y reporta errores reales.
- **Hallazgos**: FE-LINT-001.

### B05 — Error boundaries en frontend
- **Objetivo**: Resiliencia UI.
- **Responsable**: FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Alto.
- **Criterio**: Existen `global-error.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx` en segments clave.
- **Hallazgos**: FE-RISK-001.

### B06 — Stripe session con auth + precio server-side
- **Objetivo**: Integridad financiera.
- **Responsable**: FE + BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Medio.
- **Esfuerzo**: Medio (1 día).
- **Impacto**: Alto.
- **Criterio**: `POST /api/payments/stripe-session` requiere auth y consulta precio real del backend.
- **Hallazgos**: FE-SEC-007.

### B07 — Mobile: SOCKET_URL desde env, fix applicationId/app_name, fix ProveedorCard route
- **Objetivo**: Mobile funcional en EAS.
- **Responsable**: MOB.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Alto.
- **Criterio**: SOCKET_URL respeta `EXPO_PUBLIC_API_URL`; `applicationId = 'app.hireeo'`; `app_name = "Hireeo"`; ruta `/service/[slug]`.
- **Hallazgos**: MOB-002, MOB-005, MOB-010.

### B08 — Mobile: GestureHandlerRootView, expo-image, push projectId
- **Objetivo**: UX y push.
- **Responsable**: MOB.
- **Dependencias**: Proyecto EAS creado.
- **Riesgo**: Bajo.
- **Esfuerzo**: Medio (1 día).
- **Impacto**: Alto.
- **Criterio**: `<GestureHandlerRootView>` envuelve la app; `Image` reemplazado por `expo-image`; `app.json` tiene `extra.eas.projectId`.
- **Hallazgos**: MOB-003, MOB-009, MOB-011.

### B09 — `/api/revalidate` con auth + robots.txt por país
- **Objetivo**: Endurecimiento.
- **Responsable**: FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (2h).
- **Impacto**: Medio.
- **Criterio**: `/api/revalidate` exige `INTERNAL_SERVICE_TOKEN`; `robots.ts` bloquea `/{country}/admin`.
- **Hallazgos**: FE-SEC-006, FE-SEC-011.

---

## 📆 Próximos 30 días (Estabilización)

### C01 — Tests unitarios backend (cobertura mínima)
- **Objetivo**: Red de seguridad.
- **Responsable**: BE + QA.
- **Dependencias**: Ninguna.
- **Riesgo**: Ninguno.
- **Esfuerzo**: Alto (1-2 semanas).
- **Impacto**: Alto.
- **Criterio**: Cobertura ≥ 60% en `auth`, `payments`, `subscriptions`, `services`, `users`, `ratings`; CI falla si baja.
- **Hallazgos**: TRANSV-001.

### C02 — Sentry (error tracking) en las 3 capas
- **Objetivo**: Observabilidad de errores.
- **Responsable**: DEV + BE/FE/MOB.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (1 día).
- **Impacto**: Alto.
- **Criterio**: Errores 5xx en backend, crashes en mobile, runtime errors en frontend llegan a Sentry.

### C03 — Logger estructurado (pino) + correlation IDs en backend
- **Objetivo**: Observabilidad de logs.
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Medio (2 días).
- **Impacto**: Alto.
- **Criterio**: Cada request loggeada con `requestId`, `userId` (si auth), `route`, `status`, `duration`.

### C04 — Health endpoints + readiness
- **Objetivo**: Soporte para zero-downtime deploys.
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Muy bajo.
- **Impacto**: Medio.
- **Criterio**: `GET /health` y `GET /ready` funcionan.

### C05 — Idempotencia de webhooks (Redis o tabla DB)
- **Objetivo**: Evitar duplicados.
- **Responsable**: BE.
- **Dependencias**: Redis (Upstash).
- **Riesgo**: Medio.
- **Esfuerzo**: Medio (1-2 días).
- **Impacto**: Alto.
- **Criterio**: Webhook reenviado no duplica side-effects.

### C06 — Rate limiting por endpoint crítico (login, refresh, register, password)
- **Objetivo**: Anti-fuerza bruta.
- **Responsable**: BE.
- **Dependencias**: Redis.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Alto.
- **Criterio**: `@Throttle` específico en endpoints de auth; bloqueo tras 5 intentos fallidos.

### C07 — Migrar AI agents de `@ts-nocheck` a types reales
- **Objetivo**: Type safety.
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Medio (1 día).
- **Impacto**: Medio.
- **Criterio**: `grep -r "@ts-nocheck" backend/src` → 0.

### C08 — Soft-delete en User, Service, Message
- **Objetivo**: GDPR, integridad.
- **Responsable**: BE.
- **Dependencias**: Migración Prisma.
- **Riesgo**: Medio.
- **Esfuerzo**: Medio (2 días).
- **Impacto**: Medio.
- **Criterio**: `deletedAt` en modelos; queries filtran por null por defecto.

### C09 — OpenAPI spec publicada + cliente TS generado
- **Objetivo**: Contrato compartido.
- **Responsable**: BE.
- **Dependencias**: Swagger ya existe.
- **Riesgo**: Bajo.
- **Esfuerzo**: Medio (1-2 días).
- **Impacto**: Medio.
- **Criterio**: `frontend/src/lib/api/backendTypes.ts` generado desde OpenAPI.

### C10 — Frontend: `next/dynamic` para leaflet, recharts, MP SDK
- **Objetivo**: Reducir bundle inicial.
- **Responsable**: FE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Medio.
- **Criterio**: LCP mejora > 200ms en /buscar.

### C11 — Signing release Android con keystore propio
- **Objetivo**: Release Play Store.
- **Responsable**: MOB + DEV.
- **Dependencias**: Keystore creado y custodiado.
- **Riesgo**: Medio.
- **Esfuerzo**: Medio (1 día).
- **Impacto**: Crítico (para lanzamiento mobile).
- **Criterio**: Build release firma con SHA-1 propio; subida a Play Console exitosa.

### C12 — Validación MIME por magic bytes + limits Multer
- **Objetivo**: Endurecimiento upload.
- **Responsable**: BE.
- **Dependencias**: Ninguna.
- **Riesgo**: Bajo.
- **Esfuerzo**: Bajo (4h).
- **Impacto**: Medio.
- **Criterio**: Upload rechaza imágenes con magic bytes no coincidentes; Multer con `limits.fileSize`.

---

## 📅 Próximos 90 días (Refactor estructural)

### D01 — Extraer WebSocket chat a servicio dedicado
- **Señal de activación**: > 100 conexiones concurrentes o degradación en Vercel.
- **Opciones**: Pusher, Ably, o VM dedicado con Socket.io.
- **Criterio**: Latencia < 200ms p95 para mensajes.

### D02 — BullMQ workers para push/emails/webhooks
- **Señal**: emails/push demoran > 5s.
- **Criterio**: worker processa 100 jobs/min sin demora perceptible.

### D03 — Read replicas PostgreSQL (Neon/Supabase)
- **Señal**: QPS > 500 o queries > 500ms p95.
- **Criterio**: endpoints de search usan read replica.

### D04 — Mobile: App Check / Play Integrity + obfuscación
- **Señal**: intentos de abuso detectados (API_KEY filtrada).
- **Criterio**: APK reverse-engineered no expone API_KEY útil.

### D05 — MFA para admins
- **Señal**: manejo de pagos/datos sensibles.
- **Criterio**: TOTP o WebAuthn para SUPER_ADMIN.

### D06 — Auditoría externa (pentest)
- **Señal**: pre-lanzamiento masivo.
- **Criterio**: reporte externo sin críticos.

---

## 🌅 Largo plazo (6+ meses)

- Multi-región si US/ES despegan.
- Event sourcing para pagos si consistencia distribuida es crítica.
- iOS native build (cuando Android esté estable).
- Bug bounty privado.
- Migrar a microservicios **SOLO si** un módulo específico requiere cambios radicales de escala (ej. AI agents con LLMs pesados).

---

## Quick wins (esfuerzo bajo, impacto alto)

| # | Acción | Esfuerzo | Impacto |
|---|---|---|---|
| Q1 | Añadir `x-api-key` en mobile | 15 min | Crítico |
| Q2 | Quitar logs de firmas | 5 min | Alto |
| Q3 | Proteger `/email/send` | 30 min | Crítico |
| Q4 | Fix XSS JSON-LD (un replace) | 5 min | Alto |
| Q5 | `JwtAuthGuard` global | 2-4h | Crítico |
| Q6 | IDOR addresses (`@CurrentUser`) | 1-2h | Crítico |
| Q7 | Webhook Stripe con `x-api-key` | 15 min | Crítico |
| Q8 | SOCKET_URL desde env | 5 min | Crítico |
| Q9 | `applicationId` + `app_name` mobile | 30 min | Alto |
| Q10 | Upgrade Next.js 16.2.6 | 2h | Alto |
| Q11 | `multer@>=2.2.0` | 30 min | Alto |
| Q12 | `/api/revalidate` con auth | 30 min | Medio |
| Q13 | Fix `pnpm lint` frontend | 15 min | Medio |
