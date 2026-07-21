# Hallazgos detallados

Formato por hallazgo según la sección 18 del encargo. IDs por capa: `BE` backend, `FE` frontend, `MO` mobile, `TR` transversal/infra.

Confianza: **Confirmado** (verificado en código/comando), **Alta**, **Media**, **Hipótesis**.

---

## CRÍTICOS

### [TR-01] El flujo de pago no está implementado — las pasarelas son stubs

- **Capa:** Backend / Transversal
- **Categoría:** Correctness / Producto / Preparación producción
- **Severidad:** Crítica · **Urgencia:** Inmediata · **Impacto:** Crítico · **Esfuerzo:** Alto · **Confianza:** Confirmado
- **Estado:** confirmado
- **Ubicación / Archivos:**
  - `backend/src/modules/payments/gateways/stripe.gateway.ts:35-41`
  - `backend/src/modules/payments/gateways/mercadopago.gateway.ts:28-34`
  - `backend/src/modules/subscriptions/subscriptions.service.ts:211-270`
  - `frontend/src/features/payments/actions/mutations.ts:5-12` (`procesarPagoWebhook` = `console.info`)
- **Evidencia:** `createPayment` en ambos gateways retorna URLs/secretos falsos (`stub_...`, `pi_stub_...`). El webhook del backend valida la firma pero luego no puede mapear el evento a una suscripción: `extractMercadoPagoEvent` retorna siempre `subscriptionId: undefined` y hay comentarios explícitos "Pendiente de Fase 2.1". `procesarPagoWebhook` del frontend solo hace `console.info`.
- **Comando/prueba:** lectura de código + `grep -rn "stub" backend/src`.
- **Resultado observado:** un pago aprobado no activa la suscripción ni marca el servicio como PREMIUM.
- **Comportamiento esperado:** `createPayment` crea una preferencia/checkout real; el webhook mapea `external_reference`/`metadata.subscriptionId` y activa la suscripción.
- **Causa raíz:** desarrollo incremental; la capa de cobro quedó como andamiaje.
- **Riesgo actual:** ninguna venta puede completarse; el negocio (premium/sponsors) no monetiza.
- **Riesgo futuro:** si se lanza a producción con esto, se cobran clientes sin activar el beneficio (o al revés) → disputas y reversos.
- **Escenario de fallo:** usuario paga en Stripe/MP → vuelve a la app → su servicio sigue BASIC.
- **Recomendación:** implementar `createPayment` real (Stripe Checkout Sessions ya existe parcialmente en `frontend/src/app/api/payments/stripe-session/route.ts`; portarlo al backend) y completar el mapeo del webhook con `external_reference`.
- **Solución mínima:** setear `metadata.subscriptionId` al crear el pago y leerlo en el webhook.
- **Solución recomendada:** unificar la creación de pago y el webhook en el backend (una sola fuente de verdad), eliminar la ruta y el stub del frontend.
- **Criterio de aceptación:** un pago sandbox de MP y de Stripe activa la suscripción y sube el servicio a PREMIUM, verificado en DB.
- **Prueba de validación:** test e2e de pago sandbox por país (cl + es).

### [TR-02] Next.js 16.1.1 con 13 CVEs sin parchear (incl. cache poisoning)

- **Capa:** Frontend · **Categoría:** Vulnerabilidad de dependencia
- **Severidad:** Crítica (agregada) · **Urgencia:** Inmediata · **Impacto:** Alto · **Esfuerzo:** Bajo · **Confianza:** Confirmado
- **Estado:** confirmado
- **Ubicación:** `frontend/package.json` → `"next": "16.1.1"`
- **Evidencia:** `pnpm audit --prod` marca `next >=16.0.0 <16.2.5` vulnerable (GHSA-vfv6-92ff-j949 / CVE-2026-44582). El repo oficial publicó 13 correcciones de seguridad en 16.2.5/16.2.6.
- **Resultado observado:** 13 vulnerabilidades high/moderate en el árbol de `next`.
- **Comportamiento esperado:** `next >= 16.2.6`.
- **Riesgo actual:** en dev es bajo; en producción tras CDN compartida, cache poisoning RSC (una respuesta de un usuario servida a otro).
- **Recomendación:** `pnpm --filter frontend up next@16.2.6` y re-`pnpm build`.
- **Criterio de aceptación:** `pnpm audit` sin advisories de `next`; build verde.
- **Fuente:** GHSA-vfv6-92ff-j949; Next.js security advisories.

---

## ALTOS

### [BE-03] WebSocket Gateway con CORS `origin: '*'`

- **Capa:** Backend · **Categoría:** Seguridad (CORS) · **Severidad:** Alta · **Urgencia:** Próximo sprint · **Impacto:** Medio · **Esfuerzo:** Muy bajo · **Confianza:** Confirmado
- **Ubicación:** `backend/src/modules/chat/chat.gateway.ts:20-24`
- **Evidencia:** `@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })`. La API REST sí restringe orígenes (`main.ts` con `FRONTEND_URL`), pero el gateway no.
- **Riesgo:** cualquier origen puede abrir el socket; con un JWT filtrado, se lee/envía chat desde sitios de terceros.
- **Recomendación:** reutilizar `allowedOrigins` de `FRONTEND_URL` en el gateway.
- **Criterio de aceptación:** conexión desde origen no permitido rechazada.

### [BE-04] Backend desplegado como función serverless en Vercel es incompatible con el WebSocket Gateway y el ThrottlerModule en memoria

- **Capa:** Backend / Infra · **Categoría:** Arquitectura / Escalabilidad · **Severidad:** Alta · **Urgencia:** Próximo sprint · **Impacto:** Alto · **Esfuerzo:** Alto · **Confianza:** Alta
- **Ubicación:** `backend/vercel.json`, `backend/src/main.ts:83-95` (handler serverless), `backend/src/modules/chat/chat.gateway.ts`, `backend/src/app.module.ts:36-40` (ThrottlerModule sin storage externo)
- **Evidencia:** `vercel.json` reescribe todo a `/api` y `main.ts` exporta un `handler` serverless con `cachedServer`. Las funciones serverless de Vercel no mantienen conexiones WebSocket persistentes ni estado compartido entre invocaciones.
- **Riesgo actual:** el chat en tiempo real no funcionará (o será inestable) en Vercel; el rate limiting (`@nestjs/throttler` con almacenamiento en memoria) es inefectivo porque cada instancia serverless tiene su propio contador.
- **Riesgo futuro:** a escala, el throttler no protege y el chat requiere reescritura.
- **Recomendación:** desplegar el backend en un runtime long-running (Railway/Render/Fly) o separar el servicio de WebSocket; usar Redis como storage del throttler y adapter de socket.io.
- **Criterio de aceptación:** chat estable con múltiples instancias; rate limit consistente entre réplicas.

### [BE-05] `GET /users` expone el listado de usuarios (email, roles, país) sin control de rol

- **Capa:** Backend · **Categoría:** Broken Access Control (OWASP A01) · **Severidad:** Alta · **Urgencia:** Próximo sprint · **Impacto:** Alto · **Esfuerzo:** Bajo · **Confianza:** Confirmado
- **Ubicación:** `backend/src/modules/users/users.controller.ts:34-51`
- **Evidencia:** `findAll` no tiene `@UseGuards(JwtAuthGuard, RolesGuard)` ni `@Roles`. Solo lo cubre el `ApiKeyGuard` global. La `x-api-key` es una única clave compartida usada por todo el frontend/servidor; cualquiera que la obtenga (o cualquier endpoint interno) puede paginar toda la base de usuarios con emails y roles.
- **Riesgo:** fuga de PII (enumeración de usuarios, base para phishing).
- **Recomendación:** añadir `@UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)` al listado (como ya hace `subscriptions.controller`).
- **Criterio de aceptación:** `GET /users` sin JWT de admin → 401/403.

### [MO-06] La app mobile no envía `x-api-key`: no puede consumir endpoints protegidos por el ApiKeyGuard global

- **Capa:** Mobile / Integración · **Categoría:** Integración / Correctness · **Severidad:** Alta · **Urgencia:** Próximo sprint · **Impacto:** Alto · **Esfuerzo:** Bajo · **Confianza:** Alta
- **Ubicación:** `appmobile/src/shared/lib/apiClient.ts:40-45` (`buildHeaders` no incluye `x-api-key`); `appmobile/.env.example` declara `EXPO_PUBLIC_API_KEY` pero no se usa en ningún archivo.
- **Evidencia:** `grep x-api-key appmobile/src` → sin resultados. El `ApiKeyGuard` es `APP_GUARD` global en el backend y rechaza (401) todo lo que no sea `@Public()`.
- **Riesgo:** cualquier endpoint no `@Public` (perfil, favoritos, chat, reservas) responde 401 desde mobile; o bien la app hoy solo funciona contra endpoints públicos.
- **Nota:** poner la API key en un binario móvil (`EXPO_PUBLIC_*`) es además un antipatrón: queda extraíble. Conviene un modelo de auth distinto para mobile (JWT sin api-key compartida, o api-key por cliente).
- **Recomendación:** decidir el modelo (a) marcar los endpoints de mobile con auth por JWT y excluirlos del ApiKeyGuard cuando hay Bearer válido, o (b) emitir api-keys por plataforma. No incrustar la key global en el binario.
- **Criterio de aceptación:** flujo autenticado completo en mobile (login → perfil → favoritos) sin 401.

### [FE-07] `GET /api/revalidate` sin autenticación permite invalidar caché arbitrariamente

- **Capa:** Frontend · **Categoría:** Seguridad / DoS · **Severidad:** Alta · **Urgencia:** Próximo sprint · **Impacto:** Medio · **Esfuerzo:** Muy bajo · **Confianza:** Confirmado
- **Ubicación:** `frontend/src/app/api/revalidate/route.ts`
- **Evidencia:** el handler acepta `?tag=` sin verificar secreto ni sesión y ejecuta `revalidateTag`.
- **Riesgo:** un atacante puede invalidar caché en bucle (`?tag=services`) forzando regeneración → coste y latencia (cache stampede).
- **Recomendación:** exigir un `REVALIDATE_SECRET` en header/query y compararlo con `safeEqual`.
- **Criterio de aceptación:** petición sin secreto → 401.

### [TR-08] Sin tests unitarios/integración en backend y sin pipeline CI

- **Capa:** Transversal · **Categoría:** Testing / DevOps · **Severidad:** Alta · **Urgencia:** Próximos 30 días · **Impacto:** Alto · **Esfuerzo:** Alto · **Confianza:** Confirmado
- **Ubicación:** `backend/src/**` (`*.spec.ts` = 0); no hay `.github/workflows`.
- **Evidencia:** `find backend/src -name '*.spec.ts' | wc -l` → 0. `find . -path '*/.github/workflows'` → vacío. Frontend solo tiene 4 specs Playwright (guest/user/admin/security).
- **Riesgo:** cada cambio en auth, pagos o permisos puede romper sin detección; no hay red de seguridad para el crecimiento del equipo.
- **Recomendación:** CI con typecheck+lint+build por app; tests unitarios de servicios críticos (auth, payments, subscriptions, chat ownership) con Prisma mockeado.
- **Criterio de aceptación:** pipeline verde obligatorio en PR; cobertura útil de módulos de dinero/permisos.

### [TR-09] Refresh tokens de 30 días no revocables ni rotados

- **Capa:** Backend · **Categoría:** Seguridad (gestión de sesión) · **Severidad:** Alta · **Urgencia:** Próximos 30 días · **Impacto:** Alto · **Esfuerzo:** Medio · **Confianza:** Confirmado
- **Ubicación:** `backend/src/modules/auth/auth.service.ts:294-310` (`buildTokens`), `refresh()` no invalida el token usado.
- **Evidencia:** `JWT_REFRESH_EXPIRES_IN=30d`; `refresh()` verifica firma pero no consulta lista de revocación ni rota el refresh; no hay endpoint de logout que invalide.
- **Riesgo:** un refresh token filtrado es válido 30 días sin posibilidad de revocarlo (ni siquiera con cambio de contraseña).
- **Recomendación:** persistir refresh tokens (hash) por sesión con rotación en cada uso e invalidación en logout/cambio de contraseña.
- **Criterio de aceptación:** logout invalida el refresh; reutilizar un refresh rotado → 401.

---

## MEDIOS

### [FE-10] Doble implementación de webhooks de pago con validaciones distintas

- **Capa:** Frontend/Backend · **Categoría:** Arquitectura / Seguridad · **Severidad:** Media · **Confianza:** Confirmado
- **Ubicación:** `frontend/src/app/api/webhooks/mercadopago/route.ts` y `.../stripe/route.ts` vs `backend/src/modules/subscriptions/subscriptions.controller.ts` + gateways.
- **Evidencia:** el webhook MP del frontend **no valida la firma HMAC** (solo hace un GET al pago), mientras el del backend sí. Dos rutas de cobro paralelas y divergentes.
- **Riesgo:** superficie doble; el endpoint del frontend acepta cualquier POST bien formado (aunque re-consulta a MP, no verifica autenticidad del emisor).
- **Recomendación:** una sola implementación (backend, con firma), eliminar las rutas del frontend.

### [MO-11] Mobile llama a `/auth/forgot-password`, endpoint inexistente en el backend

- **Capa:** Mobile/Backend · **Categoría:** Correctness · **Severidad:** Media · **Confianza:** Confirmado
- **Ubicación:** `appmobile/src/features/auth/services/authService.ts:67-69`; no existe en `backend/src/modules/auth/auth.controller.ts`.
- **Evidencia:** `grep forgot-password backend/src` → vacío.
- **Riesgo:** funcionalidad de recuperación de contraseña rota (404) → usuarios sin acceso a su cuenta.
- **Recomendación:** implementar el endpoint (con rate limit y sin enumeración de usuarios) o deshabilitar la UI.

### [BE-12] Lint del backend con 17 errores y del mobile con 7 errores (fuera del pipeline)

- **Capa:** Backend/Mobile · **Categoría:** Deuda técnica · **Severidad:** Media · **Confianza:** Confirmado
- **Evidencia:** `biome check src/` → backend 17 err/40 warn, mobile 7 err/31 warn (uso de `any`, bloques vacíos). No bloquean el build porque el lint no está en un pipeline.
- **Recomendación:** correr `biome check` en CI y resolver o justificar con `biome-ignore`.

### [TR-13] Archivos de trabajo/temporales versionados

- **Capa:** Transversal · **Categoría:** Deuda / Higiene de repo · **Severidad:** Media · **Confianza:** Confirmado
- **Evidencia:** versionados: `frontend/fix_imports.js`, `fix_syntax.js`, `migrate*.js`, `server.log`, `backend/unsplash_results.json`, `find_images.js`, `test-prod.ts`, `check-countries.ts`, `generate_image_map.ts`.
- **Riesgo:** ruido, posible ejecución accidental, `server.log` puede filtrar datos en el futuro.
- **Recomendación:** mover a `scripts/` fuera de build o borrar; añadir a `.gitignore` los logs.

### [BE-14] KYC/verificación de identidad es un stub

- **Capa:** Backend · **Categoría:** Producto / Seguridad · **Severidad:** Media · **Confianza:** Confirmado
- **Ubicación:** `backend/src/modules/kyc/kyc.service.ts:25-26` (`vi_stub_...`).
- **Riesgo:** si la UI muestra "verificado", es falso; confianza del marketplace comprometida.
- **Recomendación:** no exponer verificación en UI hasta integrar el proveedor real.

### [TR-15] `NEXT_PUBLIC_API_KEY` / `EXPO_PUBLIC_API_KEY` en los `.env.example`

- **Capa:** Transversal · **Categoría:** Seguridad (configuración) · **Severidad:** Media · **Confianza:** Confirmado
- **Evidencia:** ambos `.env.example` declaran la api-key con prefijo público (`NEXT_PUBLIC_`/`EXPO_PUBLIC_`), que Next/Expo **incrustan en el bundle cliente**. El `apiClient.ts` del frontend hoy usa correctamente `API_KEY` (solo servidor), pero el ejemplo induce al error.
- **Riesgo:** si alguien sigue el `.env.example`, la api-key global queda expuesta en el navegador/binario.
- **Recomendación:** quitar la variante pública del ejemplo; documentar que la api-key es solo servidor.

### [BE-16] Throttler global posiblemente insuficiente y sin storage compartido

- **Capa:** Backend · **Categoría:** Seguridad / Escalabilidad · **Severidad:** Media · **Confianza:** Alta
- **Evidencia:** `ThrottlerModule.forRoot([{short:10/1s},{long:100/60s}])` con almacenamiento por defecto (memoria). En serverless/multi-réplica no comparte contadores (ver BE-04).
- **Recomendación:** storage Redis para throttler; límites específicos por endpoint sensible (login ya tiene `@Throttle`).

### [FE-17] `any` en el manejo de eventos de pago y en varios puntos del frontend/backend

- **Capa:** Frontend/Backend · **Categoría:** Type safety / Deuda · **Severidad:** Media · **Confianza:** Confirmado
- **Evidencia:** `extractStripeEvent`/`extractMercadoPagoEvent` usan `any` con `biome-ignore`; 69 warnings en frontend incluyen usos de `any`.
- **Recomendación:** tipar los payloads de Stripe/MP (tipos oficiales del SDK) al implementar TR-01.

### [BE-18] Validación de `folder` en upload evita path traversal pero permite anidamiento arbitrario

- **Capa:** Backend · **Categoría:** Seguridad (menor) · **Severidad:** Media-baja · **Confianza:** Confirmado
- **Ubicación:** `backend/src/modules/upload/upload.controller.ts:30-33`
- **Evidencia:** regex `^[a-zA-Z0-9-_/]+$` bloquea `..` pero permite cualquier ruta con `/`. El destino es Cloudinary (no FS local), así que el riesgo real es bajo; validación correcta de MIME y tamaño (4MB) presente.
- **Recomendación:** allow-list de folders válidos en vez de regex abierta.

---

## BAJOS / INFORMATIVOS

### [FE-19] 69 warnings de Biome en frontend (info)
Type safety y estilo; no bloquean. Resolver incrementalmente.

### [TR-20] `console.*` como logging en frontend/backend (info)
`console.error/info` en webhooks y actions. Sustituir por logger estructurado (ver observabilidad).

### [BE-21] Swagger deshabilitado en producción (correcto — positivo)
`main.ts` solo monta Swagger si `NODE_ENV !== 'production'`. Buena práctica.

### [BE-22] Uso de `crypto.timingSafeEqual` y `safeEqual` en guards (correcto — positivo)
Comparaciones de api-key/webhook/service-token en tiempo constante. Buena práctica.

### [BE-23] Credenciales de integraciones cifradas con AES-256-GCM (correcto — positivo)
`CryptoService` valida clave de 32 bytes y usa GCM con IV aleatorio. Buen diseño; el riesgo se traslada a la gestión de `INTEGRATIONS_ENCRYPTION_KEY`.

### [MO-24] Tokens en `expo-secure-store` en nativo (correcto — positivo)
`storage.ts` usa SecureStore en iOS/Android y `localStorage` solo en web. Correcto para nativo.
