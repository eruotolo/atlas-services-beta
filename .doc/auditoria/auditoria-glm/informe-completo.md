# Informe completo de auditoría

**Proyecto**: Hireeo (`next-atlas-services`) — marketplace multi-país de servicios manuales.
**Modelo auditor**: `glm-5.2` (Z.ai).
**Fecha**: 2026-07-19.
**Commit auditado**: `bc5758662b77f0b69410ba7dab4c911cb452ae9a` (rama `main`).
**Submódulos**: frontend `3f73bab`, backend `ee40d26`, appmobile `fe9b462`.
**Puntuación global**: **4.2 / 10**.
**Nivel de confianza**: Alto.

---

## A. Resumen ejecutivo

Hireeo es un monorepo con tres aplicaciones (frontend Next.js 16, backend NestJS 10 + Prisma 7.5, mobile Expo SDK 54) que implementan un marketplace multi-país de servicios manuales en cinco países (CL, AR, UY, ES, US) con dos pasarelas (MercadoPago y Stripe) según país. La **arquitectura de código es sólida** (DDD, TypeScript strict, Server Components, cifrado AES-256-GCM correcto), pero **el sistema NO está listo para producción** por la confluencia de 18 vulnerabilidades críticas que afectan la integridad de pagos, la confidencialidad de datos, y la capacidad misma de publicar la app móvil en tiendas.

**Riesgos críticos identificados**:
- Flujos de pago rotos (webhook Stripe no llega al backend, MercadoPago son stubs) → revenue e integridad financiera afectados.
- Múltiples IDOR (addresses, chat, publicar servicio, editar perfil) → acceso cross-user.
- App móvil no funcional contra el backend actual (falta `x-api-key`).
- App móvil no publicable (firma release con debug keystore, `applicationId` anónimo, push notifications rotas).
- 0 tests en backend/mobile, 0 pipelines CI/CD.

**Recomendación**: NO desplegar a producción. Ejecutar un plan de estabilización de **30-60 días** antes de cualquier lanzamiento. La base técnica es sana; los problemas son incrementales y resolubles sin migración tecnológica.

---

## B. Puntuación general (0-10)

| Dimensión | Puntuación | Justificación |
|---|---|---|
| **Arquitectura** | 6.5 | DDD bien aplicado en las 3 capas; módulos NestJS cohesivos; separación limpia de responsabilidades. Penaliza: JwtAuthGuard no global, controllers que olvidan guard, componentes de dominio en `shared/`. |
| **Frontend** | 6.0 | Server Components por defecto, React Compiler, `next/image`, proxy multi-país robusto. Penaliza: ausencia de error boundaries, 0 dynamic imports, webhooks rotos, XSS JSON-LD. |
| **Backend** | 6.5 | NestJS modular, Prisma con índices apropiados, helmet+CORS+ValidationPipe+throttle, AES-256-GCM correcto. Penaliza: IDORs, refresh no revocable, `/email/send` sin auth, `@ts-nocheck` en ai-agents. |
| **Mobile** | 5.0 | DDD consistente, SecureStore, cola anti-tormenta en refresh. Penaliza: contrato BE roto (sin `x-api-key`, SOCKET_URL localhost), release roto, icon map hardcoded. |
| **Seguridad** | 3.5 | Múltiples críticos (IDOR, XSS, OWASP A01). Penaliza: refresh no revocable, fallbacks inseguros, sin rate limit por endpoint crítico. |
| **Rendimiento** | 5.0 | Typecheck/build pasan; Server Components reducen JS. Penaliza: bundles sin code-splitting, `Image` RN sin cache, sin Redis, queries sin caché. |
| **Escalabilidad** | 3.5 | Sin Redis, sin colas, chat en serverless inestable, sin réplicas. Funciona hasta cierto volumen. |
| **Testing** | 1.0 | 0 unit tests en backend/mobile; solo 5 E2E en frontend. Cobertura mínima. |
| **DevOps** | 2.0 | Sin CI/CD, sin observabilidad, sin IaC, deploy manual. |
| **Observabilidad** | 1.5 | Logger NestJS sin estructura, sin correlation IDs, sin APM, sin Sentry, sin métricas de negocio. |
| **Mantenibilidad** | 6.5 | Convenciones DDD claras, TypeScript strict, AGENTS.md explícito. Penaliza: 0 TODOs pero código muerto (hooks no usados), lint roto en frontend, `@ts-nocheck`. |
| **Documentación** | 5.5 | AGENTS.md detallado por capa, .env.example documentado, Swagger en dev. Penaliza: sin ADR, sin CHANGELOG, README mobile boilerplate. |
| **Experiencia de desarrollador** | 6.0 | Typecheck limpio, scripts pnpm claros. Penaliza: lint roto, sin devcontainer, sin CI feedback. |
| **Experiencia de usuario** | 5.5 | Diseño limpio, multi-país coherente. Penaliza: sin loading/error boundaries, push roto, sin modo oscuro, sin bloqueo de contacto. |
| **Accesibilidad** | 5.0 | Radix UI ayuda con ARIA; Server Components reducen JS. Penaliza: sin auditoría formal, sin skip-links, sin reducción de movimiento. |
| **Preparación para producción** | 3.0 | Pagos rotos, mobile no publicable, sin observabilidad, sin tests. |
| **Preparación para crecimiento** | 3.5 | Arquitectura soporta evolución incremental; falta Redis, chat dedicado, monitoring. |
| **Global** | **4.2** | Promedio ponderado con peso en seguridad y preparación de producción. |

---

## C. Semáforo del proyecto

| Área | Color | Estado |
|---|---|---|
| Arquitectura de código | 🟡 | Aceptable, mejora marginal posible |
| Frontend (UX/perf) | 🟡 | Server Components OK; sin error boundaries |
| Backend (funcionalidad) | 🟡 | Aceptable, sin tests |
| Seguridad general | 🔴 | Múltiples críticos |
| Pagos | 🔴 | Webhooks rotos, stubs |
| Mobile (funcionalidad) | 🔴 | No publicable, sin x-api-key |
| Mobile (release) | 🔴 | 5 bloqueantes |
| Testing | 🔴 | 0 unit tests backend/mobile |
| CI/CD | 🔴 | Sin pipelines |
| Observabilidad | 🔴 | Sin logs/trace/APM |
| Contrato BE↔FE↔Mobile | 🔴 | DTOs y rutas desincronizadas |
| Performance | 🟡 | OK a volumen actual; mejorable |
| Accesibilidad | 🟡 | Sin auditoría formal |
| Documentación | 🟡 | Parcial; sin ADR |
| UX (recovery, errors) | 🟡 | Sin boundaries; estados parciales |
| DevOps | 🔴 | Sin IaC, sin secret scanning, sin DR documentado |
| Multi-tenancy | 🟠 | Implementado en datos, débil en guards |
| Internacionalización | 🟡 | ES/EN básico |

**Conteo**:
- 🟢 Verde: 0
- 🟡 Amarillo: 6
- 🟠 Naranja: 1
- 🔴 Rojo: 11

---

## D. Hallazgos críticos

Lista priorizada de los **18 hallazgos críticos** que requieren acción inmediata (riesgo de pérdida de datos, fraude, caídas o imposibilidad de escalar). Ver [`hallazgos.md`](./hallazgos.md) para detalle completo con archivos y líneas.

### Backend (6)

1. **BE-SEC-001** — IDOR en addresses: cualquier usuario autenticado lee/edita/borra direcciones de otros (`users.controller.ts:135-169`).
2. **BE-SEC-002** — Refresh token sin rotación/revocación: fuga → 30 días de acceso (`auth.service.ts:120-149`).
3. **BE-SEC-003** — `/email/send` sin auth: phishing masivo desde dominio Hireeo (`email.controller.ts:13-16`).
4. **BE-SEC-004** — IDOR WebSocket chat: leer mensajes de conversaciones ajenas (`chat.gateway.ts:67-77`).
5. **BE-SEC-005** — JwtAuthGuard no global: cada controller debe recordar el guard (`app.module.ts:70-79`).
6. **BE-SEC-006** — Firmas webhook logueadas en claro (`mercadopago.gateway.ts:38`, `stripe.gateway.ts:45`).

### Frontend (7)

7. **FE-SEC-001** — IDOR en publicar servicio: `usuarioId` del form (`publish/actions/mutations.ts:60-66`).
8. **FE-SEC-002** — IDOR en editar perfil: `userId` del form (`users/actions/mutations.ts:120,144`).
9. **FE-RISK-001** — 0 error/loading/not-found boundaries en todo `app/`.
10. **FE-PAY-001** — Webhook Stripe no envía `x-api-key` → suscripciones nunca se activan (`api/webhooks/stripe/route.ts:37-46`).
11. **FE-SEC-003** — XSS JSON-LD: `.replace(/</g, '<')` es no-op (`service/[slug]/page.tsx:175`).
12. **FE-SEC-004** — HTML injection en email de contacto (`contact/actions/mutations.ts:55-69`).
13. **FE-PAY-002** — Server actions de MP son stubs (`payments/actions/mutations.ts:5-24`).

### Mobile (5)

14. **MOB-001** — `apiClient` mobile no envía `x-api-key` (`shared/lib/apiClient.ts:40-45`).
15. **MOB-002** — `SOCKET_URL` hardcodeado localhost (`features/messages/context/SocketContext.tsx:10-11`).
16. **MOB-003** — Push notifications rotas: falta `extra.eas.projectId` (`registerPushToken.ts:49-50`).
17. **MOB-004** — Android release firmado con debug keystore (`android/app/build.gradle:112-115`).
18. **MOB-005** — `applicationId` y `app_name` anónimos (`com.anonymous.appmobile`, `appmobile`).

---

## E. Errores y warnings

Resumen de las herramientas automáticas. Detalle completo en [`errores-y-warnings.md`](./errores-y-warnings.md).

### Typecheck

| Capa | Resultado |
|---|---|
| backend | ✅ 0 errores |
| frontend | ✅ 0 errores |
| appmobile | ✅ 0 errores |

### Build

| Capa | Resultado |
|---|---|
| backend | ✅ `nest build` exit 0 |

### Lint (Biome)

| Capa | Errores | Warnings | Notas |
|---|---|---|---|
| backend | 17 | 40 | `noExplicitAny`, `useNumberNamespace` (auto-fixeables) |
| frontend | — | — | **`biome: command not found`** (script roto, E004) |
| appmobile | 7 | 31 | `noEmptyBlockStatements` en `profile.tsx` |

### Audit dependencias (`pnpm audit --prod`)

| Capa | Critical | High | Moderate | Low |
|---|---|---|---|---|
| backend (workspace) | 2 | 40 | 69 | 8 |
| frontend | 0 | 13 | 14 | 3 |
| appmobile (workspace) | 2 | 40 | 69 | 8 |

**Vulnerabilidades prioritarias a parchear**:
- `next@16.1.1` → `>=16.2.6` (cierra 13 HIGH en una sola actualización).
- `multer@2.0.2` → `>=2.2.0` (CVE-2026-5079 DoS).
- `ws`/`undici` vía overrides (`>=8.21.0` / `>=6.27.0`).

### Tabla resumida

| ID | Herramienta | Capa | Mensaje | Severidad | Estado |
|---|---|---|---|---|---|
| E001 | biome | backend | noExplicitAny en `cachedServer/handler` | Warning | Pendiente |
| E002 | biome | backend | noExplicitAny en notification DTO | Warning | Pendiente |
| E003 | biome | backend | useNumberNamespace (parseFloat/Int) | Warning | Pendiente |
| **E004** | **shell** | **frontend** | **`biome: command not found`** | **Error** | **Pendiente — bloquea lint** |
| E005 | biome | mobile | noEmptyBlockStatements en profile.tsx (×3) | Error | Pendiente |
| V001-V005 | pnpm audit | frontend | Next.js 16.1.1 (13 HIGH) | High | Pendiente |
| V006 | pnpm audit | frontend | minimatch vulnerable en `@google/genai` | High | Pendiente |
| V007 | pnpm audit | workspace | ws memory exhaustion DoS | High | Pendiente |
| V008 | pnpm audit | workspace | undici WebSocket DoS | High | Pendiente |
| V009 | pnpm audit | workspace | undici SameSite downgrade | Low | Pendiente |
| V010 | pnpm audit | backend | multer DoS via nested fields (CVE-2026-5079) | High | Pendiente |
| V011 | pnpm audit | backend | hono (Prisma dev) | High | Pendiente |
| V012 | pnpm audit | mobile | esbuild (Windows only) | Low | Pendiente |

---

## F. Deuda técnica

| Ítem | Origen | Consecuencias | Costo de no resolverla | Recomendación | Prioridad |
|---|---|---|---|---|---|
| **0 tests unitarios backend** | Inicio del proyecto sin QA automatizado | Regresiones frecuentes no detectadas; miedo a refactor | Refactors de pago/auth peligrosos | Jest + Supertest; mínimo 60% en auth, payments, services, users, ratings | **Alta** |
| **0 tests unitarios mobile** | Sin QA automatizado | Regresiones en release sin detectar | Mobile update puede romper users | Jest + RNTL; tests de flujos críticos | Alta |
| **JwtAuthGuard no global** | Decisión original no aplicada | IDORs recurrentes en cada controller nuevo | Nuevo endpoint = nuevo posible leak | APP_GUARD global + `@Public()` explícito | **Crítica** |
| **Refresh token stateless** | Decisión inicial sin logout efectivo | Sesiones persistentes tras logout | Incidente de seguridad no contenible | RefreshToken model con rotación + denylist en Redis | Crítica |
| **`@ts-nocheck` en ai-agents** | Mismatch con SDK AI resuelto con pragma | Errores en herramientas que manipulan datos pasan a prod | Bug IA pasando a producción | Tipar correctamente las tools del AI | Alta |
| **`enableImplicitConversion: true`** | Conveniencia | Conversión implícita de tipos en DTOs | Bugs sutiles en transformación | Desactivar; usar `transform: true` con tipos explícitos | Media |
| **`cachedServer: any` en main.ts** | Compatibilidad Vercel serverless | Pérdida de type safety en hot path | Bug en runtime del serverless | Tipar como `Application` | Media |
| **Nominatim sin cache ni User-Agent** | Uso directo de OSM | Latencia + riesgo de ban IP | Búsqueda geográfica afectada | Proxy vía backend con cache Redis + UA | Media |
| **Sin soft-delete en DB** | Schema Prisma directo | Borrado físico = datos perdidos (GDPR, recovery) | Imposible recuperar servicios borrados | `deletedAt` + queries filtradas | Media |
| **Cascade deletes peligrosos** | Schema Prisma con `onDelete: Cascade` | Borrar un user borra todo (servicios, ratings, mensajes) | Pérdida masiva de datos | Audit + considerar `SetNull` | Media |
| **Código muerto mobile** | Refactors incompletos | Confusión al leer | Mantenimiento más difícil | Eliminar `useFavorites`, `useServiceMutations`, `useQuotes`, `useReviews`, `usePayments` | Baja |
| **README mobile boilerplate** | Plantilla `create-expo-app` sin tocar | Nuevos devs confundidos | Onboarding más lento | Reescribir con setup real (env, prebuild, EAS) | Baja |
| **`src/types/` mobile vacío** | Estructura declarada sin uso | Inconsistencia arquitectónica | Confusión | Eliminar o poblar | Baja |
| **`react-native-web` + `react-dom` sin uso** | Dependencias que vinieron por defecto | Bundle ligeramente más pesado | Build time mayor | Eliminar si no se usa web | Baja |
| **`biome.json` no existe en mobile** | Migración incompleta a Biome | Script lint apunta a algo no presente | Lint inconsistente | Crear `biome.json` o cambiar a eslint | Media |
| **`installCommand` Vercel inconsistente** | `backend --frozen-lockfile` vs `frontend --no-frozen-lockfile` | Build frontend puede diverger del lock | Builds no reproducibles | Unificar a `--frozen-lockfile` | Media |

---

## G. Seguridad

Auditoría OWASP Top 10 (2021). Resumen en [`seguridad.md`](./seguridad.md).

### Vulnerabilidades confirmadas

| Severidad | Cantidad | CVSS rango |
|---|---|---|
| Crítica | 8 | 7.4 – 8.1 |
| Alta | 13 | 6.5 – 7.5 |
| Media | 4 | 4.0 – 6.0 |
| Informativa | 2 | — |

### OWASP Top 10 cubierto

| Categoría OWASP | Hallazgos principales | Estado |
|---|---|---|
| A01 Broken Access Control | BE-SEC-001, 004, 005, 007, 008, 009, 010, 011, 012; FE-SEC-001, 002, 007 | 🔴 Múltiples |
| A02 Cryptographic Failures | FE-SEC-008 (tokens en session.user) | 🟠 |
| A03 Injection (XSS) | FE-SEC-003 (JSON-LD), FE-SEC-004 (HTML email) | 🔴 |
| A04 Insecure Design | BE-SEC-013 (exposición email/teléfono público), FE-SEC-007 (precio client-side) | 🟠 |
| A05 Security Misconfiguration | BE-SEC-015/016 (MIME/limits Multer), BE-PAY-002 (CORS WS) | 🟠 |
| A06 Vulnerable Components | TRANSV-003 (Next.js), TRANSV-004 (multer), TRANSV-005 (ws/undici/hono) | 🟠 |
| A07 Auth Failures | BE-SEC-002 (refresh), BE-SEC-014 (MS audience), FE-SEC-009 (Math.random) | 🔴 |
| A08 Software/Data Integrity | BE-SEC-003 (email send), BE-PAY-001 (webhooks sin idempotencia) | 🔴 |
| A09 Logging/Monitoring | BE-SEC-006 (firmas en logs), C02 pendiente (Sentry) | 🟠 |
| A10 SSRF | No se detectó | ✅ |
| Mobile Top 10 M1 (creds) | MOB-001 (x-api-key faltante) | 🔴 |
| Mobile Top 10 M3 (auth) | MOB-007/008 (logout incompleto) | 🟠 |

### Secretos

- `backend/.env` contiene: `GEMINI_API_KEY`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `WEBHOOK_SECRET`, `API_KEY`, `CLOUDINARY_API_SECRET` con valores reales (no commiteados al repo pero presentes en filesystem local).
- `appmobile/.env.production` contiene `EXPO_PUBLIC_API_KEY` real (se incluye en el bundle → reversible desde la APK).
- **Acción**: rotar `GEMINI_API_KEY`, `CLOUDINARY_API_SECRET` y `API_KEY` antes de cualquier release.

### Plan de remediación

- **0-72h**: arreglar los 18 críticos (ver [`plan-de-accion.md`](./plan-de-accion.md) A01-A08).
- **7 días**: refresh rotation, mover tokens a cookies, webhooks completos, CI/CD.
- **30 días**: Sentry, logger estructurado, rate limit por endpoint, SAST en CI.
- **90 días**: MFA admin, App Check, pentest externo.

---

## H. Arquitectura actual

Diagrama en [`diagramas/arquitectura-actual.mmd`](./diagramas/arquitectura-actual.mmd). Detalle completo en [`arquitectura-actual.md`](./arquitectura-actual.md).

### Componentes
- **Frontend**: Next.js 16.1.1, 46 páginas, 35 server actions, 18 features, proxy.ts multi-país.
- **Backend**: NestJS 10, 24 módulos, serverless en Vercel, Prisma 7.5 + PostgreSQL.
- **Mobile**: Expo SDK 54, expo-router 6, 98 archivos, sin prebuild nativo releaseable.
- **DB local**: docker-compose con Postgres 16 + Adminer.

### Puntos únicos de fallo
1. Backend serverless en Vercel (sin redundancia cross-region).
2. PostgreSQL única instancia (sin réplicas confirmadas).
3. Socket.io en serverless (chat no escalable).
4. Sin CDN/WAF confirmado.
5. Variables de entorno sin IaC.

### Acoplamiento y cohesión
- Backend: bien cohesionado, dependencias cruzadas menores.
- Frontend: features aisladas, pero `shared/` contiene componentes de dominio (FE-ARCH-001/002).
- Mobile: contrato desincronizado con backend (MOB varios).

### Flujos críticos
1. **Login/OAuth**: emite JWT stateless, no revocable (BE-SEC-002).
2. **Publicar servicio**: vulnerable a IDOR (FE-SEC-001).
3. **Pago premium**: webhooks rotos (FE-PAY-001/002).
4. **Chat**: IDOR join_conversation (BE-SEC-004).
5. **Multi-país**: bien implementado, sin open redirect.

---

## I. Arquitectura objetivo

Diagrama en [`diagramas/arquitectura-objetivo.mmd`](./diagramas/arquitectura-objetivo.mmd). Detalle completo en [`arquitectura-objetivo.md`](./arquitectura-objetivo.md).

### Corto plazo (0-30 días) — Estabilización
- **Mantener**: NestJS modular monolith en Vercel, Next.js, Prisma + PostgreSQL, Expo/EAS.
- **Refactorizar**: hacer JwtAuthGuard global, arreglar IDORs, refresh rotation, mover tokens a cookies httpOnly, fix `x-api-key` y `SOCKET_URL` en mobile.
- **Añadir**: CI/CD, Sentry, logger estructurado, tests mínimos en servicios críticos, healthcheck.

### Mediano plazo (30-90 días) — Escalabilidad
- Redis (Upstash): rate limit, caché, denylist, idempotencia.
- BullMQ + worker persistente: push, emails, webhooks.
- Chat dedicado (Pusher/Ably o VM).
- OpenAPI spec + cliente TS generado.
- Paquete `@hireeo/contracts` con tipos compartidos.

### Largo plazo (90+ días) — Solo si hay métricas que lo justifiquen
- Read replicas (cuando QPS > 500).
- Multi-región (cuando US/ES despegan).
- Event sourcing (cuando consistencia distribuida es problema).
- Sharding por país (cuando un país > 10M usuarios).
- Microservicios solo si un módulo requiere cambios de escala radical.

### Componentes a mantener
NestJS modular, Prisma + PostgreSQL, Next.js App Router, Expo SDK 54 + EAS, NextAuth v4, Cloudinary, Stripe + MercadoPago.

### Componentes a reemplazar (cuando sea necesario)
- Socket.io en Vercel → servicio dedicado.
- `Math.random` para passwords → server-side.
- `Image` RN → `expo-image`.
- `Logger` NestJS default → pino.

### Cambios que NO deben hacerse todavía
- Microservicios (modularidad actual suficiente).
- GraphQL (REST + OpenAPI más simple).
- Multi-región (sin latencia medida).
- Event sourcing (complejidad innecesaria).
- Migrar a Auth0/Cognito (NextAuth funciona).
- Sharding por país (sin volumen).
- iOS native build (no prioritario).

---

## J. Comparación con competencia

Detalle completo en [`competencia-e-investigacion.md`](./competencia-e-investigacion.md).

### Competidores analizados
- **TaskRabbit** (US/UK/ES) — referente en servicios del hogar con escrow y KYC.
- **Thumbtack** (US) — modelo de leads pagados, cotizaciones estructuradas.
- **Cronoshare** (ES/LATAM) — multi-idioma, tarifa plana de leads.
- **Fixly** (PL) — reviews con moderación, sistema de destacados.
- **HireAHelper** (US) — específico mudanzas/fletes.

### Funcionalidades comunes del sector
Todos tienen: marketplace por país, categorías, multi-idioma, geo, reviews, mensajería, KYC, escrow (en US/ES), notificaciones push, app móvil.

### Diferenciadores posibles de Hireeo
- **Multi-país con moneda local** (CLP+MP, ARS+MP, UYU+MP, EUR+Stripe, USD+Stripe) — **único en la región**.
- **Modelo freemium** con BASIC/PREMIUM y escrow opcional.
- **Geo refinado** (país → región → comuna/localidad).
- **IA agente** para describir necesidades — pocos competidores lo tienen.

### Riesgos de copiar soluciones
- **No** copiar el onboarding de TaskRabbit (US-only, sin multi-moneda).
- **No** copiar escrow de Fixly sin resolver FE-PAY-001/002 primero.
- **No** copiar subastas inversas (cambia modelo de negocio).

### Gaps de Hireeo vs sector
| Gap | Severidad | Recomendación |
|---|---|---|
| Webhook Stripe sin API key | Crítica | Fix A06 |
| Stubs MercadoPago | Crítica | Fix A06 |
| KYC no exigido en publish | Alta | BE-SEC-012 fix |
| Escrow no implementado en pagos | Alta | Módulo existe, cablear en webhook |
| Reviews bidireccionales | Media | Schema ya soporta, añadir UX |
| Mobile no publicable | Crítica | MOB-004/005 fix |
| Sin disputas/mediación | Media | Roadmap |
| Onboarding publish complejo | Media | Simplificar a 3 pasos |
| Sin bloqueo de contacto hasta reserva | Media | Anti-spam |

---

## K. Plan de acción

Detalle completo en [`plan-de-accion.md`](./plan-de-accion.md).

### 24-72 horas (crítico)
- A01 — JwtAuthGuard global (BE, 2-4h, crítico).
- A02 — Fix IDORs (BE+FE, 1-2 días, crítico).
- A03 — Proteger `/email/send` + limpiar logs (BE, 1h, crítico).
- A04 — Añadir `x-api-key` mobile (MOB, 15 min, crítico).
- A05 — Fix XSS JSON-LD + HTML injection email (FE, 2h, alto).
- A06 — Mover/implementar webhooks Stripe/MP (BE+FE, 1-2 días, crítico).
- A07 — Upgrade Next.js y multer (FE+BE, 2h, alto).
- A08 — Bloquear deploy a producción (DEV, 15 min).

### 7 días (alto impacto)
- B01 — Refresh token rotation + revocación (BE, 2-3 días).
- B02 — Mover tokens a cookies httpOnly (FE, 1-2 días).
- B03 — CI/CD GitHub Actions (DEV, 4h).
- B04 — Fix `pnpm lint` frontend (FE, 15 min).
- B05 — Error boundaries (FE, 4h).
- B06 — Stripe session con auth + precio server-side (FE+BE, 1 día).
- B07 — Mobile SOCKET_URL + applicationId + ProveedorCard (MOB, 4h).
- B08 — Mobile GestureHandlerRootView + expo-image + push projectId (MOB, 1 día).
- B09 — `/api/revalidate` con auth + robots por país (FE, 2h).

### 30 días (estabilización)
- C01 — Tests unitarios backend (≥60% en auth/payments/services/users/ratings).
- C02 — Sentry en 3 capas.
- C03 — Logger estructurado (pino) + correlation IDs.
- C04 — Health/ready endpoints.
- C05 — Idempotencia de webhooks (Redis o tabla DB).
- C06 — Rate limit por endpoint crítico.
- C07 — Migrar AI agents de `@ts-nocheck` a types reales.
- C08 — Soft-delete en User/Service/Message.
- C09 — OpenAPI spec + cliente TS.
- C10 — `next/dynamic` para bundles pesados.
- C11 — Signing release Android con keystore propio.
- C12 — Validación MIME por magic bytes + limits Multer.

### 90 días (refactor estructural)
- D01 — Extraer WebSocket chat (cuando > 100 conexiones concurrentes).
- D02 — BullMQ workers (cuando push/emails demoran > 5s).
- D03 — Read replicas PostgreSQL (cuando QPS > 500).
- D04 — Mobile: App Check / Play Integrity + obfuscación.
- D05 — MFA para admins.
- D06 — Auditoría externa (pentest).

### Largo plazo (6+ meses)
- Multi-región si US/ES despegan.
- Event sourcing si consistencia distribuida es crítica.
- iOS native build (cuando Android esté estable).
- Bug bounty privado.

---

## L. Quick wins (esfuerzo bajo, impacto alto)

| # | Acción | Esfuerzo | Impacto | Hallazgo |
|---|---|---|---|---|
| Q1 | Añadir `x-api-key` en mobile | 15 min | Crítico | MOB-001 |
| Q2 | Quitar logs de firmas | 5 min | Alto | BE-SEC-006 |
| Q3 | Proteger `/email/send` | 30 min | Crítico | BE-SEC-003 |
| Q4 | Fix XSS JSON-LD (un replace) | 5 min | Alto | FE-SEC-003 |
| Q5 | `JwtAuthGuard` global | 2-4h | Crítico | BE-SEC-005 |
| Q6 | IDOR addresses (`@CurrentUser`) | 1-2h | Crítico | BE-SEC-001 |
| Q7 | Webhook Stripe con `x-api-key` | 15 min | Crítico | FE-PAY-001 |
| Q8 | SOCKET_URL desde env | 5 min | Crítico | MOB-002 |
| Q9 | `applicationId` + `app_name` mobile | 30 min | Alto | MOB-005 |
| Q10 | Upgrade Next.js 16.2.6 | 2h | Alto | TRANSV-003 |
| Q11 | `multer@>=2.2.0` | 30 min | Alto | TRANSV-004 |
| Q12 | `/api/revalidate` con auth | 30 min | Medio | FE-SEC-006 |
| Q13 | Fix `pnpm lint` frontend | 15 min | Medio | FE-LINT-001 |
| Q14 | Crear archivos de error boundary | 4h | Alto | FE-RISK-001 |
| Q15 | Quitar `@ts-nocheck` en ai-agents | 1 día | Medio | BE-INFO-001 |
| Q16 | Crear `biome.json` mobile | 30 min | Bajo | MOB-CONF-001 |
| Q17 | Verificar/rotar secretos antes de release | 1h | Alto | — |

**Tiempo total quick wins**: ~3 días de trabajo.

---

## M. Información faltante

Detalle completo en [`informacion-faltante.md`](./informacion-faltante.md).

### Producto y volumen
- Volumen actual de usuarios.
- Volumen esperado a 6/12 meses.
- Peticiones por minuto actuales.
- Distribución por país.

### Regulatorio
- GDPR (usuarios ES)?
- CCPA (usuarios US)?
- Leyes locales (Chile 19.628, etc.).
- KYC obligatorio para proveedores?

### Infraestructura
- Proveedor PostgreSQL real (Neon/Supabase/RDS/Vercel Postgres).
- Backups automáticos?
- Staging?
- Dominio `hireeo.app` activo?
- Cloudflare o Vercel Edge delante?

### Operación
- Estrategia de backups y restore.
- Monitoreo actual.
- On-call?
- Postmortems previos?

### Equipo y presupuesto
- Tamaño del equipo.
- QAs dedicados.
- SRE/DevOps?
- Budget para Sentry, Upstash, Pusher?
- Ventana de lanzamiento.

### Limitaciones de esta auditoría
1. No se accedió a paneles cloud.
2. No se ejecutaron pruebas reales (E2E, DAST, carga).
3. No se inspeccionaron `.env` a fondo.
4. No se validaron flujos de pago end-to-end.
5. El audit de dependencias incluye transitivas del workspace.
6. El commit es de hoy → algunos hallazgos pueden estar corregidos en branches.

---

## N. Comandos recomendados

### Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### Compilar

```bash
# Backend
pnpm --filter backend build

# Frontend (no probado en esta auditoría)
pnpm --filter frontend build

# Mobile (requiere prebuild)
pnpm --filter appmobile run android
```

### Ejecutar linters

```bash
# Backend
pnpm --filter backend lint

# Frontend (actualmente ROTO — instalar biome primero)
pnpm --filter frontend add -D @biomejs/biome
pnpm --filter frontend lint

# Mobile
pnpm --filter appmobile lint
```

### Ejecutar type checking

```bash
pnpm --filter backend exec tsc --noEmit
pnpm --filter frontend exec tsc --noEmit
pnpm --filter appmobile exec tsc --noEmit
```

### Ejecutar tests

```bash
# Frontend (5 E2E)
pnpm --filter frontend test:e2e
pnpm --filter frontend test:security

# Backend y mobile: NO HAY tests todavía
# Recomendado:
pnpm --filter backend add -D jest @types/jest ts-jest supertest
pnpm --filter appmobile add -D jest @testing-library/react-native jest-expo
```

### Medir cobertura

```bash
# Una vez configurado Jest
pnpm --filter backend test -- --coverage
pnpm --filter appmobile test -- --coverage
pnpm --filter frontend test:e2e -- --coverage
```

### Analizar dependencias

```bash
pnpm audit --prod                        # Todas las capas (workspace)
pnpm audit --prod --audit-level=high    # Solo high+critical
pnpm outdated -r                         # Versiones desactualizadas
pnpm list -r --depth 0                   # Inventario
```

### Auditar vulnerabilidades específicas

```bash
# Ver CVEs detallados
pnpm audit --prod --json | jq '.vulnerabilities'

# Buscar por paquete
pnpm audit --prod --json | jq '.vulnerabilities["multer"]'
```

### Detectar secretos

```bash
# Trufflehog (recomendado)
pnpm dlx trufflehog filesystem .

# GitGuardian (alternativa)
# o grep manual:
grep -rE "(API_KEY|SECRET|PRIVATE_KEY|PASSWORD|TOKEN)\s*=\s*['\"][a-zA-Z0-9_\-]{16,}" .
```

### Analizar bundles

```bash
# Frontend
pnpm --filter frontend build
pnpm --filter frontend exec next-bundle-analyzer

# Mobile
pnpm dlx expo export --platform android
# Inspeccionar bundle con react-native-bundle-visualizer
```

### Análisis estático

```bash
# Semgrep
pnpm dlx semgrep --config=auto backend/src frontend/src appmobile/src

# CodeQL (en CI, no local)
# GitHub Code Scanning requiere push

# TypeScript
pnpm exec tsc --noEmit --strict
```

### Tests de carga (recomendado en staging)

```bash
# k6 (recomendado)
pnpm dlx k6 run scripts/load-test.js

# Artillery
pnpm dlx artillery quick --count 100 --num 10 http://localhost:4000/api/v1/services
```

### Validar builds de producción

```bash
# Backend (ya validado)
pnpm --filter backend build

# Frontend
pnpm --filter frontend build

# Verificar Vercel build localmente
pnpm --filter backend exec vercel build
pnpm --filter frontend exec vercel build
```

### Pre-commit hooks (recomendado)

```bash
# Husky + lint-staged
pnpm dlx husky init
echo "pnpm exec biome check --write ." > .husky/pre-commit
```

---

## O. Conclusión

### 1. ¿El proyecto está listo para producción?
**No.** Hay 18 vulnerabilidades críticas que afectan pagos, seguridad de datos, y la capacidad misma de publicar la app móvil en tiendas. Sin tests automatizados ni CI/CD. **Bloquear cualquier deploy.**

### 2. ¿Es seguro?
**No.** Múltiples IDOR (A01), XSS (A03), autenticación débil (A07), integridad de datos comprometida (A08). Aunque hay buenas prácticas (AES-256-GCM, helmet, CORS allowlist), la superficie de ataque es demasiado amplia.

### 3. ¿Es mantenible?
**Sí, razonablemente.** TypeScript strict, DDD bien aplicado, AGENTS.md explícito, 0 TODOs. Pero la ausencia de tests (0 en backend/mobile) hace que cualquier refactor sea arriesgado.

### 4. ¿Puede crecer con la arquitectura actual?
**Sí, hasta cierto volumen.** La modularidad de NestJS soporta crecimiento orgánico. Sin embargo, sin Redis (caché/rate limit), sin colas (procesamiento asíncrono), y con Socket.io en serverless (chat no escalable), el sistema se degradará antes de alcanzar los volúmenes esperados de un marketplace en 5 países.

### 5. ¿Cuál es el principal riesgo?
**Riesgo #1**: pérdida de ingresos y confianza por **flujos de pago rotos** (FE-PAY-001, FE-PAY-002) — los usuarios pagan premium pero no se activan.
**Riesgo #2** (cercano): **filtración masiva de datos** vía los múltiples IDOR (BE-SEC-001, FE-SEC-001/002).
**Riesgo #3**: **app móvil no publicable** por issues de release (MOB-004/005).

### 6. ¿Qué debe resolverse primero?
Los 18 hallazgos críticos en este orden:
1. **MOB-001** (x-api-key) — sin esto la app no funciona.
2. **BE-SEC-005** (JwtAuthGuard global) — elimina clase entera de IDORs.
3. **BE-SEC-001, FE-SEC-001, FE-SEC-002, BE-SEC-004** (IDORs específicos).
4. **BE-SEC-003** (`/email/send`) — phishing vector.
5. **FE-PAY-001, FE-PAY-002** (pagos).
6. **MOB-002/003/004/005** (release mobile).
7. **FE-SEC-003, FE-SEC-004, BE-SEC-006** (XSS/injection/logs).
8. **BE-SEC-002** (refresh token).
9. **FE-RISK-001** (error boundaries).
10. **TRANSV-003/004** (Next.js y multer updates).

### 7. ¿Conviene refactorizar, migrar o mantener la arquitectura?
**Mantener y estabilizar.** La arquitectura es correcta. Migrar a microservicios, GraphQL, o nuevo ORM sería desperdicio de energía. Lo que falta es: tests, CI/CD, observabilidad, y arreglar los críticos incrementales.

### 8. ¿Qué cambios no deberían hacerse todavía?
- Microservicios.
- GraphQL.
- Multi-región.
- Event sourcing.
- Sharding por país.
- Migrar a Auth0/Cognito.
- iOS native build (sin Android estable primero).
- Adopción prematura de AI auto-respuesta para proveedores.

### 9. ¿Cuál sería el siguiente hito técnico?
**Hito 1 (30 días)**: cerrar los 18 críticos + setup de CI/CD + tests mínimos + Sentry → **"internamente listo para beta privada"**.
**Hito 2 (60 días)**: refresh token rotation + OpenAPI + Redis rate limit + IDORs resueltos → **"internamente listo para producción cerrada"**.
**Hito 3 (90 días)**: chat dedicado + observabilidad completa + mobile release (Play Store) → **"lanzamiento público limitado"**.

### 10. ¿Qué nivel de inversión técnica necesita?
- **Equipo mínimo recomendado** para ejecutar el plan:
  - 1 backend senior (NestJS/Prisma) — 100% durante 30 días.
  - 1 frontend senior (Next.js) — 100% durante 30 días.
  - 1 mobile senior (Expo/RN) — 100% durante 30 días, luego 50%.
  - 1 DevOps/SRE — 50% durante todo el proceso (CI/CD, observabilidad, deploys).
  - 1 QA — 100% durante 30 días, luego 50%.

- **Servicios externos adicionales** (costo mensual estimado):
  - Sentry: 0-26 USD/mes (free tier hasta 5K events).
  - Upstash Redis: 0-10 USD/mes (free tier).
  - Pusher/Ably (chat): 0-49 USD/mes (free tier disponible).
  - EAS Build: free tier hasta 30 builds/mes.
  - **Total estimado**: < 100 USD/mes para volumen inicial.

- **Tiempo total estimado**: 60-90 días para "lanzamiento público limitado".

---

## Apéndice: índice de archivos generados

| Archivo | Descripción |
|---|---|
| [`README.md`](./README.md) | Índice principal de la auditoría |
| [`resumen-ejecutivo.md`](./resumen-ejecutivo.md) | Resumen ejecutivo para stakeholders |
| [`informe-completo.md`](./informe-completo.md) | Este documento |
| [`hallazgos.md`](./hallazgos.md) | Lista completa de hallazgos con formato estándar |
| [`errores-y-warnings.md`](./errores-y-warnings.md) | Errores de lint, typecheck, build |
| [`seguridad.md`](./seguridad.md) | Auditoría de seguridad detallada |
| [`arquitectura-actual.md`](./arquitectura-actual.md) | Arquitectura AS-IS |
| [`arquitectura-objetivo.md`](./arquitectura-objetivo.md) | Arquitectura TO-BE |
| [`competencia-e-investigacion.md`](./competencia-e-investigacion.md) | Análisis de mercado |
| [`plan-de-accion.md`](./plan-de-accion.md) | Plan por ventanas temporales |
| [`informacion-faltante.md`](./informacion-faltante.md) | Datos no disponibles |
| [`comandos-ejecutados.md`](./comandos-ejecutados.md) | Log de comandos |
| [`fuentes.md`](./fuentes.md) | Fuentes externas consultadas |
| [`comparacion-con-otras-auditorias.md`](./comparacion-con-otras-auditorias.md) | Comparación con gpt-5 y claude-fable-5 |
| [`backend/auditoria-backend.md`](./backend/auditoria-backend.md) | Informe detallado del backend |
| [`frontend/auditoria-frontend.md`](./frontend/auditoria-frontend.md) | Informe detallado del frontend |
| [`mobile/auditoria-mobile.md`](./mobile/auditoria-mobile.md) | Informe detallado del mobile |
| [`diagramas/arquitectura-actual.mmd`](./diagramas/arquitectura-actual.mmd) | Diagrama AS-IS |
| [`diagramas/arquitectura-objetivo.mmd`](./diagramas/arquitectura-objetivo.mmd) | Diagrama TO-BE |
| [`diagramas/flujos-criticos.mmd`](./diagramas/flujos-criticos.mmd) | 5 flujos críticos |
| [`evidencias/typecheck.txt`](./evidencias/typecheck.txt) | Salida typecheck |
| [`evidencias/lint.txt`](./evidencias/lint.txt) | Salida lint |
| [`evidencias/audit.txt`](./evidencias/audit.txt) | Salida pnpm audit |
| [`evidencias/build.txt`](./evidencias/build.txt) | Salida nest build |
| [`evidencias/secretos.txt`](./evidencias/secretos.txt) | Detección de secretos |
| [`evidencias/cobertura.txt`](./evidencias/cobertura.txt) | Cobertura de tests |
| [`metadata.json`](./metadata.json) | Metadatos de la auditoría |
