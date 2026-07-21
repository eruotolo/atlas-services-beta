# Informe completo de auditoría técnica — Hireeo

**Modelo:** OpenAI GPT-5  
**Fecha:** 2026-07-18  
**Commit:** `bc5758662b77f0b69410ba7dab4c911cb452ae9a`  
**Alcance:** Frontend, Backend, Mobile, seguridad, arquitectura, infraestructura, testing, DevOps, observabilidad, UX y accesibilidad.  
**Modo:** solo lectura; no se modificó código, configuración ni datos.

## Resumen ejecutivo

Hireeo tiene una base técnica moderna —monolito modular NestJS, Next App Router y Expo—, pero no está preparado para producción. Los bloqueadores son pagos incompletos, controles de acceso, dependencias vulnerables, contratos Mobile/Backend incompatibles, runtime serverless incompatible con WebSocket, ausencia de tests y falta de operación observable.

**Puntuación global:** 3.8/10 · **Confianza:** medio-alta.

| Área | Estado | Nota |
|---|---|---:|
| Arquitectura | 🟡 | 6.0 |
| Seguridad | 🔴 | 3.0 |
| Pagos | 🔴 | 1.0 |
| Frontend | 🟠 | 5.0 |
| Backend | 🟠 | 5.0 |
| Mobile | 🔴 | 3.0 |
| Testing | 🔴 | 1.5 |
| DevOps/release | 🔴 | 2.0 |
| Observabilidad | 🔴 | 2.0 |
| UX/accesibilidad | 🟠 | 4.0 |

## Hallazgos críticos

- **TR-01 / FE-PAY-001 — Pagos no implementados de forma durable.** Stripe/MercadoPago contienen stubs; la interfaz puede mostrar éxito sin persistencia, conciliación e idempotencia. Bloquea monetización.
- **FE-SEC-001 — Stripe confía en precio, moneda, duración y servicio enviados por el cliente.** Permite manipular el importe y potencialmente pagar un servicio ajeno. El servidor debe resolver todos los valores financieros y validar ownership.
- **TR-02 / FE-SEC-004 — Next.js 16.1.1 y árbol de dependencias vulnerable.** Auditoría combinada: 2 críticos, 40 altos, 69 moderados y 8 bajos. Actualizar y revisar alcanzabilidad.
- **MOB-001/MOB-002 — Mobile no puede consumir correctamente Backend en EAS.** Duplica `/api/v1` y no envía el `x-api-key` requerido.

## Seguridad

- **BE-05:** `GET /users` carece de RolesGuard y expone PII con una api-key compartida.
- **BE-03:** CORS del WebSocket usa `origin: '*'`.
- **TR-09:** refresh tokens de 30 días no son revocables.
- **FE-SEC-002:** JSON-LD no escapa correctamente `</script>`, con XSS almacenado potencial.
- **FE-SEC-003:** refresh token del Backend se expone a JavaScript mediante `session.user`.
- **FE-SEC-006:** endpoint de revalidación público por GET sin autenticación ni allowlist.
- **FE-SEC-007:** formulario de contacto público sin controles de abuso visibles.
- No se confirmaron secretos versionados; los `.env` ignorados no fueron inspeccionados.

Fortalezas: bcrypt, comparaciones en tiempo constante, AES-256-GCM, validación OAuth server-side, firma de webhooks y ownership del chat.

## Backend y arquitectura

El Backend es un monolito modular coherente con 26 módulos y DTOs estrictos. TypeScript/build/Prisma pasan. No se recomienda reescritura ni microservicios ahora.

- Pagos, KYC y parte de escrow siguen incompletos.
- Throttler en memoria no funciona como límite global en múltiples instancias.
- Despliegue serverless en Vercel es incompatible con WebSocket persistente y empeora el rate limiting.
- `handleSendMessage` recalcula todas las conversaciones por mensaje (N+1 lógico).
- No hay Redis/caché de lecturas calientes ni health/readiness/liveness.
- Hay 0 tests backend y 17 errores/40 warnings de lint.

## Frontend

- Filtros/ordenamiento solo afectan los elementos de la página actual; `availability`, `verified`, `nearest` y otros controles no reflejan siempre el contrato real.
- Parámetros de categorías incompatibles entre Home, Search y Backend.
- Editar/eliminar servicios desde perfil usan rutas o autenticación incorrectas.
- Fiscalidad, moneda, RUT, IVA y zona horaria están hardcodeados a Chile en un producto multi-país.
- Errores de API se convierten en listas vacías/null.
- Modales sin focus trap, Escape, restitución de foco y semántica completa.
- Playwright no es reproducible: puerto, setup, rutas y sesiones locales inconsistentes.
- Typecheck/build pasan; lint tiene 69 warnings y Prettier falla en 248 archivos.

## Mobile

- Detalle de servicio, reservas, favoritos, publicación, perfil, direcciones y recuperación usan DTOs/rutas incompatibles con Backend.
- Chat REST/Socket.IO no coincide en eventos, campos, envelopes ni ACKs.
- Refresh concurrente puede quedar bloqueado indefinidamente.
- Socket.IO apunta a localhost; logout no limpia caché privada.
- Roles `Client/Provider` no coinciden con `CLIENT/PROVIDER`; onboarding profesional no persiste el rol.
- Push/deep links/EAS no tienen configuración de release reproducible.
- Sin tests, crash reporting, timeouts, cancelación ni estrategia offline.
- Lint: 7 errores/31 warnings; formato: 96 archivos.

## Testing y operación

- Frontend: 4 specs Playwright; Backend: 0; Mobile: 0.
- E2E no ejecutado por puertos, rutas, sesiones locales y mutación potencial de base de datos.
- Sin cobertura instrumentada, CI efectivo, staging, APM, error tracking, Web Vitals, correlation IDs o release health.
- Builds aislados: Frontend `next build` ✅, Backend build/Prisma ✅, Mobile web export ✅.
- Expo Doctor aislado: 15/18 checks; tres fallos de configuración/dependencias.

## Plan prioritario

1. Congelar pagos y cerrar precio server-side, autorización, persistencia, firma e idempotencia.
2. Actualizar Next/dependencias; corregir `/users`, CORS WebSocket, revalidación, JSON-LD y refresh tokens.
3. Decidir runtime long-running + Redis para WebSocket/rate limiting.
4. Definir OpenAPI/DTOs compartidos y reparar todos los flujos Mobile.
5. Configurar EAS/deep links/push, Playwright y CI reproducible.
6. Añadir tests de dominio, contrato, auth, pagos, permisos y E2E aislado.
7. Añadir observabilidad, health checks, error states, accesibilidad y presupuestos de rendimiento.

## Limitaciones

No se validaron producción, staging, paneles cloud, secretos reales, dispositivos físicos, DAST, carga/estrés, backup/restore ni WAF/CSP externos. Las conclusiones de runtime y escalabilidad se basan en el código y configuración revisados.

## Fuentes internas

- [Comandos ejecutados](./comandos-ejecutados.md)
- [Evidencias](./evidencias/)
- [Auditoría Backend de referencia](../../claude-fable-5/backend/auditoria-backend.md)
- [Auditoría Frontend](../../claude-fable-5/frontend/auditoria-frontend.md)
- [Auditoría Mobile](../../claude-fable-5/mobile/auditoria-mobile.md)

