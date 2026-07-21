# Resumen ejecutivo

**Proyecto**: Hireeo (`next-atlas-services`) — marketplace multi-país de servicios manuales (electricistas, carpinteros, gasfiter, fletes, mudanzas).
**Commit auditado**: `bc57586` (rama `main`), 2026-07-19.
**Modelo**: `glm-5.2` (Z.ai).
**Puntuación global**: **4.2 / 10** — **NO LISTO PARA PRODUCCIÓN**.

## Estado general

Hireeo es un monorepo de tamaño medio (~390 archivos TS/TSX entre las 3 capas) con **arquitectura DDD bien aplicada** y una base técnica sólida (TypeScript strict, Prisma + PostgreSQL, Next.js 16 con Server Components, NestJS modular, Expo SDK 54 con NativeWind v4). El código compila limpio en las 3 capas y hay buenas prácticas reales: `helmet`, CORS allowlist, `ValidationPipe` estricto, throttle, ApiKeyGuard global, AES-256-GCM para credenciales en DB, 0 `console.log` de secretos, 0 TODOs.

Sin embargo, **el proyecto no está listo para producción**. Hay **18 vulnerabilidades críticas** que afectan a pagos, seguridad, integridad de datos y la capacidad misma de publicar la app mobile en tiendas.

## Nivel de madurez

| Dimensión | Nivel |
|---|---|
| Arquitectura de código | Medio-alto (DDD, separación de capas) |
| Seguridad | Bajo (múltiples IDOR, ausencia de guard JWT global) |
| Pagos | Bajo (stubs, webhooks rotos, sin idempotencia) |
| Testing | Muy bajo (0 tests backend/mobile) |
| DevOps/CI | Muy bajo (sin pipelines, sin observabilidad) |
| Preparación mobile | Bajo (firma release rota, app anónima, push roto) |
| Observabilidad | Muy bajo (sin logs estructurados, sin APM) |

## Principales fortalezas

1. **Arquitectura DDD consistente** en las 3 capas (`features/<dominio>/{actions,components,schemas,types}`).
2. **TypeScript strict** y typecheck limpio en backend, frontend y mobile.
3. **Buenas prácticas de seguridad criptográfica**: AES-256-GCM con IV aleatorio y Auth Tag, comparaciones timing-safe, validación de key al arranque.
4. **Frontend con Server Components por defecto** (0 páginas `'use client'`), React Compiler habilitado, `next/image` en todas las imágenes.
5. **Multi-país bien diseñado a nivel de routing** (`proxy.ts` con detección por cookie → CF → Vercel → Accept-Language) y validación de país del usuario para admin.
6. **Mobile con almacenamiento seguro** (`expo-secure-store`, 0 AsyncStorage para tokens) y manejo robusto de refresh token con cola anti-tormenta.
7. **Schema Prisma con índices apropiados** (índices compuestos en `services`, unique constraints en tablas de unión).
8. **0 TODOs/FIXMEs, 0 código de debug de secretos**.

## Principales debilidades

1. **18 vulnerabilidades críticas** (6 backend, 7 frontend, 5 mobile) — ver [`hallazgos.md`](./hallazgos.md).
2. **Flujos de pago incompletos/rotos**: webhooks de Stripe no llegan al backend (sin `x-api-key`), MercadoPago son stubs. **Integridad financiera en riesgo.**
3. **App mobile no funcional contra backend actual**: no envía `x-api-key` → `ApiKeyGuard` rechaza todo.
4. **IDOR múltiples**: cualquier usuario autenticado puede leer/modificar direcciones de otros, publicar servicios en nombre de otros, unirse a chats ajenos, modificar perfiles ajenos.
5. **0 tests automatizados** en backend y mobile; solo 5 specs E2E en frontend. Sin estrategia de QA.
6. **0 CI/CD**: no existe `.github/workflows/`. Cero automatización de lint/typecheck/test/build.
7. **Sin error boundaries** en el frontend Next.js (0 archivos `error.tsx`/`loading.tsx`/`global-error.tsx`).
8. **Dependencias vulnerables**: Next.js 16.1.1 con 13 CVEs HIGH, multer con CVE DoS, ws/undici vulnerables.
9. **Sin observabilidad**: sin logs estructurados, sin correlation IDs, sin APM, sin alertas.
10. **App mobile sin posibilidad de release**: firmada con debug keystore, `applicationId` anónimo (`com.anonymous.appmobile`), nombre visible `appmobile`, push notifications rotas.

## Riesgos críticos

| Riesgo | Probabilidad | Impacto |
|---|---|---|
| Filtrado masivo de datos de usuarios (direcciones, emails, teléfonos) | Alta | Crítico (GDPR/multas) |
| Suscripciones pagadas no activadas (pérdida de revenue + soporte) | Cierta | Crítico |
| Phishing masivo desde dominio Hireeo (`/email/send` abierto) | Alta | Crítico (reputación) |
| App mobile rechazada en Play Store | Cierta | Crítico (lanzamiento) |
| App mobile no funcional (sin `x-api-key`) | Cierta | Crítico (lanzamiento) |
| Ataque XSS en páginas públicas de servicios | Media | Alto |
| Refresh token filtrado mantiene acceso 30 días | Media | Alto |
| Race condition en aceptación de cotizaciones (doble pago) | Baja-Media | Alto |

## Capacidad actual de crecimiento

La **arquitectura de código** escala bien: la organización modular de NestJS y la estructura DDD del frontend permiten añadir features sin fricción. Sin embargo:

- **La base de datos** no tiene estrategia de archivado ni soft-delete; con crecimiento de `services`, `messages`, `interactions` se degradará.
- **El backend es stateless serverless en Vercel**: no hay webhooks persistentes ni colas; los pagos asíncronos y las notificaciones push a escala son inviables hoy.
- **No hay caché distribuida** (Redis/DynamoDB) ni sistema de colas (BullMQ/SQS) para jobs.
- **El WebSocket de chat** (socket.io) no es compatible con serverless puro; necesitará un servicio dedicado (Pusher, Ably, o un small VM) al escalar.
- **Multi-tenancy por país** está implementada a nivel de datos (`countryId`) pero los guards de autorización no validan país de forma consistente → un admin de Chile podría operar sobre Argentina.

## Recomendación general

**NO desplegar a producción** hasta resolver los 18 hallazgos críticos. El proyecto tiene **base técnica sana** y merece una **fase de estabilización de 30-60 días** antes de cualquier lanzamiento. **No se recomienda reescritura** — los problemas son incrementales y resolvibles sin migración tecnológica.

## Nivel de confianza del análisis

**Alto.** Todos los hallazgos críticos fueron **verificados directamente** leyendo el código fuente (no por inferencia). El análisis coincide sustancialmente con las auditorías previas de `gpt-5` y `claude-fable-5` (ver [`comparacion-con-otras-auditorias.md`](./comparacion-con-otras-auditorias.md)), lo que refuerza la validez. Las áreas de menor confianza son: configuración cloud real, performance en producción, y flujos de pago end-to-end (que requieren pasarela real).

## Semáforo del proyecto

| Área | Color |
|---|---|
| Pagos | 🔴 Rojo (crítico) |
| Seguridad backend | 🔴 Rojo (crítico) |
| Seguridad frontend | 🔴 Rojo (crítico) |
| Seguridad mobile | 🟠 Naranja |
| Testing | 🔴 Rojo (crítico) |
| DevOps / CI | 🔴 Rojo (crítico) |
| Observabilidad | 🔴 Rojo (crítico) |
| Contrato BE↔FE↔Mobile | 🔴 Rojo (crítico) |
| Arquitectura de código | 🟡 Amarillo |
| Performance | 🟡 Amarillo |
| Accesibilidad | 🟡 Amarillo |
| UX | 🟡 Amarillo |
| Documentación | 🟡 Amarillo |
| Preparación release mobile | 🔴 Rojo (crítico) |
