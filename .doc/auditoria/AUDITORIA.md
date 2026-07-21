# Informe de auditoría técnica — Hireeo

**Fecha:** 18-07-2026  
**Alcance:** `frontend/` y `appmobile/`  
**Modalidad:** revisión estática y validaciones no destructivas. No se modificó código, configuración ni datos de la aplicación.

## Resumen ejecutivo

La aplicación no está preparada para producción. Los bloqueadores principales son la integridad de pagos, vulnerabilidades de seguridad, contratos incompatibles entre Mobile/Backend, configuración de release y ausencia de pruebas reproducibles.

| Área | Frontend | Mobile |
|---|---:|---:|
| Arquitectura | 6.0/10 | 5.0/10 |
| Seguridad | 3.0/10 | 4.0/10 |
| Calidad | 5.5/10 | 3.0/10 |
| Testing | 2.5/10 | 1.5/10 |
| Preparación productiva | 2.5/10 | 3.0/10 |

**Semáforo general:** rojo para pagos, seguridad, integración y release; naranja para testing, observabilidad y accesibilidad.

## Hallazgos críticos e inmediatos

### Frontend

1. **FE-SEC-001 — Stripe permite manipular precio y servicio desde el cliente (Crítica).** `src/app/api/payments/stripe-session/route.ts` acepta importe, moneda, duración y servicio enviados por el navegador sin autenticación ni validación de propiedad. El backend debe determinar todos los valores financieros y aplicar idempotencia.
2. **FE-PAY-001 — MercadoPago usa implementaciones stub (Crítica).** La UI puede mostrar éxito sin persistencia ni conciliación durable. El flujo debe deshabilitarse hasta completar estados, firma, idempotencia y webhook.
3. **FE-SEC-002 — XSS almacenado en JSON-LD (Alta).** El `replace` usado en `service/[slug]/page.tsx` no escapa realmente `<`; debe serializarse `</script>` como `\u003c`.
4. **FE-SEC-003 — Refresh token expuesto al JavaScript del navegador (Alta).** Debe permanecer en cookies/almacenamiento HttpOnly del servidor y no incluirse en `session.user`.
5. **FE-SEC-004 — Next.js 16.1.1 vulnerable (Alta).** `pnpm audit --prod` reportó 30 vulnerabilidades (13 altas). Actualizar a una versión parcheada y validar auth/proxy/build.

### Mobile

1. **MOB-001 — URLs EAS duplican `/api/v1` (Crítica).** Las llamadas de producción terminan en `/api/v1/api/v1/...`.
2. **MOB-002 — No se envía `x-api-key` requerido por Backend (Crítica).** Las rutas protegidas fallan aunque exista JWT válido; debe definirse un contrato seguro y coherente.
3. **MOB-003 — DTOs de servicios y reservas incompatibles (Alta).** Los nombres y estructuras esperados por Mobile no coinciden con las respuestas reales.
4. **MOB-004 — Publicación envía DTO incompatible (Alta).** Mobile usa campos en inglés; Backend exige campos en español y `countryCode`.
5. **MOB-005 — Perfil, contraseña, recuperación y direcciones llaman rutas incorrectas/inexistentes (Alta).**
6. **MOB-007 — Chat REST/Socket.IO incompatible (Alta).** Eventos, nombres de campos, envelopes y ACKs no coinciden.
7. **MOB-008 — Refresh token inválido puede bloquear solicitudes indefinidamente (Alta).** Existe una promesa circular en el interceptor.
8. **MOB-009 — Socket.IO apunta a localhost en producción (Alta).** Debe configurarse mediante variable de entorno.

## Otros hallazgos relevantes

### Frontend

- Reintentos automáticos de POST/PUT/PATCH/DELETE sin idempotency keys.
- Filtros y ordenamiento se aplican solo a la página visible; algunos controles no tienen implementación real.
- Enlaces de categorías usan parámetros incompatibles (`categoria`, `c`, `category`).
- Editar/eliminar servicios desde perfil están rotos.
- Fiscalidad, moneda, locale y teléfono están hardcodeados a Chile en un producto multi-país.
- Modales sin focus trap, Escape, restitución de foco y semántica completa.
- Errores de API se convierten en listas vacías o `null`, ocultando fallos operacionales.
- Playwright no es reproducible en CI: puerto, setup, rutas y autenticación local inconsistentes.
- Acciones de IA públicas carecen de límites de cuota/tamaño/rate limit visibles.
- Revalidación pública arbitraria mediante GET; requiere POST autenticado y allowlist.
- Sin error tracking, Web Vitals, release tracking ni correlation IDs.

### Mobile

- Logout no limpia React Query; puede mostrar datos transitorios de otra cuenta.
- Roles `Client/Provider` y `CLIENT/PROVIDER` no coinciden; onboarding profesional es visual.
- Push notifications sin `projectId`, listeners, deep links ni unregister al cerrar sesión.
- Builds EAS carecen de identificadores definitivos, app links y configuración reproducible.
- No existen pruebas unitarias, de integración, contrato o E2E.
- Lint falla con 7 errores y 31 warnings; formato falla en 96 archivos.
- Sin crash reporting, APM, métricas de arranque ni trazas API.
- Sin timeout, cancelación ni estrategia offline real.
- Navegación contiene rutas inexistentes y gates inconsistentes.
- Tokens web en `localStorage`; revisar si el target web es producto soportado.

## Validaciones ejecutadas

### Frontend

- TypeScript: correcto, sin errores.
- Biome: exit 0 con 69 warnings en 44 archivos.
- `pnpm lint`: falla por `biome: command not found`.
- Prettier: 248 archivos no cumplen formato.
- `pnpm audit --prod`: 30 vulnerabilidades (13 altas, 14 medias, 3 bajas).
- Build y E2E no ejecutados para evitar artefactos o mutaciones.

### Mobile

- TypeScript: correcto.
- Lint/Biome: 7 errores y 31 warnings.
- Formato: 96 archivos fallan.
- Expo Doctor: no inició por binario pnpm ausente en el entorno.
- No se ejecutaron builds ni E2E sobre el árbol original.

## Orden recomendado de remediación

1. Bloquear y rehacer los flujos Stripe/MercadoPago con autorización, precio server-side, persistencia e idempotencia.
2. Actualizar Next.js y corregir JSON-LD y exposición de refresh token.
3. Corregir URL base/API key de Mobile y congelar un contrato Backend-Mobile compartido.
4. Reparar servicios, publicación, reservas, favoritos, perfil, direcciones y chat.
5. Reparar Playwright/EAS y establecer CI reproducible con pruebas de contrato y smoke.
6. Añadir observabilidad, separación entre error y vacío, accesibilidad y configuración multi-país.

## Limitaciones

No se ejecutaron pruebas contra servicios externos, navegador real, build productivo, Lighthouse, dispositivos físicos ni validaciones de infraestructura fuera del repositorio. CSP, WAF, rate limiting y headers aplicados fuera del código no pudieron confirmarse.

