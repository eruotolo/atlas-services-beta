# Informe completo de auditoría técnica — Hireeo

**Modelo:** Claude Fable 5 · **Fecha:** 2026-07-18 · **Commit:** `bc57586` (main) · **Submódulos:** frontend `3f73bab`, backend `ee40d26`, appmobile `fe9b462`.

> Este documento es autocontenido. Los archivos hermanos (`hallazgos.md`, `seguridad.md`, `arquitectura-*.md`, `plan-de-accion.md`, etc.) amplían cada sección.

---

## A. Resumen ejecutivo

Hireeo es un marketplace multi-país de servicios manuales con tres capas (Next.js 16 / NestJS 10 / Expo 54) en un monorepo pnpm. La **arquitectura es sólida y moderna** (DDD por dominios, buenas prácticas de seguridad de base, type-safety real: las tres apps compilan y tipan sin errores). **No está listo para producción**: el flujo de pago es un stub, el backend serverless es incompatible con su WebSocket/rate-limiting, hay una vulnerabilidad relevante de Next.js sin parchear y faltan CI, tests, observabilidad y staging. **Recomendación: mantener la arquitectura, cerrar críticos de bajo esfuerzo, completar pagos y montar la base operativa.** Confianza del análisis: media-alta (código verificado directamente; entorno de despliegue inferido sin acceso).

## B. Puntuación general (0–10)

| Área | Nota | Justificación |
|------|------|---------------|
| Arquitectura | 7.5 | Monolito modular limpio, DDD coherente en 3 capas; penaliza el mismatch serverless/WebSocket y la duplicación de pagos |
| Frontend | 7.0 | App Router + Server Components + React Compiler bien usados; deuda de `any`, sin CSP, Next vulnerable |
| Backend | 6.5 | Módulos limpios, DTOs estrictos, guards correctos; stubs de pago/KYC, sin tests, lint roto |
| Mobile | 5.5 | Buena estructura y UX; auth rota contra endpoints protegidos, forgot-password inexistente |
| Seguridad | 5.5 | Fundamentos correctos; broken access control en /users, CORS ws abierto, refresh no revocable, Next CVE |
| Rendimiento | 6.0 | Buenas bases (SSR, next/image, React Query); N+1 en chat, sin caché, no medido en runtime |
| Escalabilidad | 5.0 | Estructura escalable; runtime serverless y throttler en memoria limitan hoy |
| Testing | 2.0 | 0 tests backend, solo 4 e2e frontend, sin cobertura de dinero/permisos |
| DevOps | 2.5 | Sin CI, sin staging, sin IaC (solo docker DB local) |
| Observabilidad | 2.0 | Solo console/Logger; sin APM, error tracking, health checks |
| Mantenibilidad | 6.5 | Código legible y organizado; deuda de lint y archivos temporales versionados |
| Documentación | 6.0 | CLAUDE.md/AGENTS.md ricos, vault Obsidian; falta ADR y OpenAPI publicado |
| Exp. desarrollador | 6.5 | Monorepo pnpm claro, comandos documentados; falta CI y datos de prueba reproducibles fuera de seed |
| Exp. usuario | 6.0 | Flujos completos y multi-idioma; pago no se completa (stub) |
| Accesibilidad | 5.0 | Radix aporta base; sin auditoría axe/WCAG |
| Prep. producción | 3.0 | Bloqueada por pagos, CVE, access control y ausencia de operación |
| Prep. crecimiento | 5.0 | Alta en código, baja en operación/tests |

**Global ponderado: 5.4 / 10.**

## C. Semáforo del proyecto

| Área | Estado |
|------|--------|
| Arquitectura (diseño) | 🟢 Verde |
| Frontend | 🟡 Amarillo |
| Backend (código) | 🟡 Amarillo |
| Mobile | 🟠 Naranja (auth rota) |
| Seguridad | 🟠 Naranja |
| Pagos / monetización | 🔴 Rojo (stub) |
| Testing | 🔴 Rojo |
| DevOps / CI | 🔴 Rojo |
| Observabilidad | 🔴 Rojo |
| Escalabilidad (runtime) | 🟠 Naranja |
| Dependencias | 🟠 Naranja (Next CVE, Expo atrás) |
| Documentación | 🟢 Verde |

## D. Hallazgos críticos

1. **TR-01 — Flujo de pago no implementado (stub).** Bloquea toda monetización. Riesgo de cobrar sin entregar el beneficio.
2. **TR-02 — Next.js 16.1.1 con 13 CVEs** (incl. cache poisoning RSC). Esfuerzo de cierre muy bajo.
3. **BE-05 — `GET /users` expone PII** (email/roles/país) protegido solo por api-key compartida.
4. **BE-04 — Backend serverless incompatible con WebSocket/throttler** → chat inestable y rate limit inefectivo.
5. **MO-06 — Mobile no envía api-key** → no puede consumir endpoints protegidos.

Detalle completo con formato de la sección 18 en `hallazgos.md`.

## E. Errores y warnings

Ver `errores-y-warnings.md`. Síntesis: typecheck y build ✅ en las 3 apps; lint ❌ en backend (17 err) y mobile (7 err) pero fuera del pipeline; frontend limpio (69 warnings). Vulnerabilidades: frontend 30 (13 high), backend/mobile 119 (2 crit de tooling, 40 high).

## F. Deuda técnica

| Deuda | Origen | Consecuencia | Costo de no resolver | Prioridad |
|-------|--------|--------------|----------------------|-----------|
| Pagos/KYC stub | Desarrollo incremental | Sin monetización ni verificación real | Bloquea el negocio | Crítica |
| Sin tests ni CI | Velocidad temprana | Regresiones no detectadas | Frágil al crecer el equipo | Alta |
| Runtime serverless + WS | Deploy fácil en Vercel | Chat/rate-limit rotos | Reescritura futura | Alta |
| Duplicación de pagos front/back | Dos iteraciones | Validaciones divergentes | Superficie de ataque doble | Media |
| Lint no forzado | Sin pipeline | Deuda de tipos (`any`) | Erosión de calidad | Media |
| Archivos temporales versionados | Scripts de migración | Ruido / ejecución accidental | Bajo pero acumulativo | Media |
| next-auth v4 / NestJS 10 / Expo 54 | Momento de adopción | Fricción y fin de soporte futuro | Migraciones más caras después | Baja-Media |

## G. Seguridad

Ver `seguridad.md`. OWASP: A01 (BE-05), A05 (BE-03, FE-07), A06 (TR-02, deps), A07 (TR-09, enumeración), A08/A04 (FE-10). Fortalezas confirmadas: bcrypt 12, AES-256-GCM, timingSafeEqual, validación OAuth server-side, firma de webhooks en backend, ownership en chat, serialización que oculta password, Swagger solo dev. **Sin secretos reales versionados.**

## H. Arquitectura actual

Ver `arquitectura-actual.md` y `diagramas/arquitectura-actual.mmd`. Monolito modular NestJS (26 módulos) + Next App Router + Expo, PostgreSQL 16 + Prisma 7. SPOF: backend serverless único, api-key global, `INTEGRATIONS_ENCRYPTION_KEY`, DB sin réplica. Contratos entre capas no compartidos (riesgo de deriva).

## I. Arquitectura objetivo

Ver `arquitectura-objetivo.md` y `diagramas/arquitectura-objetivo.mmd`. **Incremental, sin reescritura.** Mantener el monolito modular; refactorizar runtime a long-running + Redis; unificar pagos en backend; añadir contrato OpenAPI compartido, CI, observabilidad y tests. Reemplazar next-auth v4→v5 y console→APM cuando toque. No microservicios, no sharding, no multi-región hasta que las métricas lo exijan.

## J. Comparación con competencia

Ver `competencia-e-investigacion.md`. Competidores por modelo: Thumbtack (pay-per-lead, bids) y TaskRabbit (transaccional, booking). Hireeo ya modela ambos patrones (`ServiceRequest`/`Quote` + premium/featured) y añade AI (Gemini) como posible diferenciador. Riesgo: copiar booking instantáneo o pay-per-lead antes de completar pagos/escrow sería prematuro.

## K. Plan de acción

Ver `plan-de-accion.md`. Resumen:
- **24–72h:** upgrade Next 16.2.6; RolesGuard en /users; auth en /revalidate; CORS del gateway.
- **7 días:** auth de mobile; retirar webhooks duplicados; limpiar repo/.env.example; CI mínimo.
- **30 días:** pagos reales; rotación de refresh tokens; observabilidad; tests de dominio; forgot-password.
- **90 días:** backend long-running + Redis; contrato OpenAPI; staging + e2e en CI.
- **Largo plazo:** NestJS 11, Auth.js v5, Expo 56, réplica DB, colas, KYC/escrow reales.

## L. Quick wins (bajo esfuerzo, alto impacto)

1. `up next@16.2.6` (cierra 13 CVEs) — muy bajo esfuerzo.
2. RolesGuard en `GET /users` — muy bajo, cierra fuga de PII.
3. Secreto en `/api/revalidate` — muy bajo, cierra DoS de caché.
4. CORS del WebSocket con `FRONTEND_URL` — muy bajo.
5. Quitar `NEXT_PUBLIC_API_KEY`/`EXPO_PUBLIC_API_KEY` de los `.env.example` — muy bajo.
6. Borrar archivos temporales versionados y `server.log` — muy bajo.
7. CI de typecheck+build en PR — bajo, gran impacto.

## M. Información faltante

Ver `informacion-faltante.md`. Falta: volumen real, entornos (¿staging?), config real de Vercel, gestión de secretos, estado de credenciales de integraciones, backups/RPO/RTO, requisitos legales por país, presupuesto, métricas de rendimiento. Afecta principalmente a las conclusiones de escalabilidad y costos (confianza media/baja ahí).

## N. Comandos recomendados

Ver `comandos-ejecutados.md` para lo ya ejecutado. Recomendados en adelante:

```bash
# Instalar / builds
pnpm install
pnpm --filter frontend build && pnpm --filter backend build

# Calidad
pnpm --filter frontend exec tsc --noEmit
pnpm --filter backend exec tsc --noEmit
pnpm --filter appmobile exec tsc --noEmit
pnpm lint                      # biome en todo el monorepo

# Seguridad / dependencias
pnpm --filter frontend up next@16.2.6
pnpm audit --prod              # por app
npx gitleaks detect            # escaneo de secretos dedicado (recomendado)

# Base de datos
pnpm --filter backend db:migrate
pnpm --filter backend db:seed

# Análisis de bundle (recomendado añadir)
ANALYZE=true pnpm --filter frontend build

# Tests (a crear)
pnpm --filter backend test         # unit (jest) — pendiente
pnpm --filter frontend test:e2e    # playwright existente
```

## O. Conclusión (respuestas directas)

1. **¿Listo para producción?** No. Bloquean pagos (stub), Next CVE, broken access control y ausencia de operación.
2. **¿Es seguro?** Fundamentos sí; con brechas concretas de severidad alta (access control, CORS ws, refresh no revocable, dep vulnerable) que hay que cerrar antes de exponerlo.
3. **¿Es mantenible?** Sí en estructura; limitado por falta de tests/CI y deuda de lint.
4. **¿Puede crecer con la arquitectura actual?** Sí en diseño; requiere cambiar el runtime del backend (serverless→long-running+Redis) para chat/rate-limit y sumar operación.
5. **¿Principal riesgo?** Lanzar sin pagos funcionales ni red de tests/observabilidad.
6. **¿Qué resolver primero?** Los 4 quick wins de seguridad (Next, /users, /revalidate, CORS) y luego el pago real.
7. **¿Refactorizar, migrar o mantener?** Mantener la arquitectura; refactorizar runtime y pagos; no reescribir ni migrar de stack.
8. **¿Qué NO hacer todavía?** Microservicios, sharding, multi-región, migración NestJS 11 / Auth.js v5 / Expo 56 no urgentes.
9. **¿Siguiente hito técnico?** Pago real funcionando end-to-end en sandbox (cl + es) con activación de suscripción verificada.
10. **¿Nivel de inversión técnica?** Medio: semanas de trabajo enfocado (no meses de reescritura). El grueso es completar pagos + montar CI/observabilidad/tests + migrar runtime.
