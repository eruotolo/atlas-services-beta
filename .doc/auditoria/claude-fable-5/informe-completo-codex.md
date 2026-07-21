# Informe completo de auditoría técnica — Hireeo

**Modelo:** Codex (GPT-5)  
**Fecha:** 18-07-2026  
**Alcance:** `frontend/` y `appmobile/`  
**Modalidad:** revisión estática y validaciones no destructivas. No se modificó código, configuración ni datos.

## Resumen ejecutivo

Hireeo no está preparado para producción. Los bloqueadores principales son la integridad de pagos, vulnerabilidades de seguridad, contratos incompatibles entre Mobile y Backend, configuración de release y ausencia de pruebas reproducibles.

**Semáforo:** pagos, seguridad, integración, testing y release: 🔴 rojo. Observabilidad, accesibilidad y calidad: 🟠 naranja.

## Puntuación

| Área | Nota |
|---|---:|
| Arquitectura Frontend | 6.0/10 |
| Calidad Frontend | 5.5/10 |
| Seguridad Frontend | 3.0/10 |
| Testing Frontend | 2.5/10 |
| Arquitectura Mobile | 5.0/10 |
| Seguridad Mobile | 4.0/10 |
| Calidad Mobile | 3.0/10 |
| Testing Mobile | 1.5/10 |
| Preparación productiva | 2.5/10 |

## Hallazgos críticos

### Frontend

- **FE-SEC-001 — Stripe permite manipular precio y servicio desde el cliente.** `src/app/api/payments/stripe-session/route.ts` acepta importe, moneda, duración y servicio enviados por el navegador sin autenticación ni validación de propiedad. El servidor debe determinar valores financieros, propietario e idempotencia.
- **FE-PAY-001 — MercadoPago usa implementaciones stub.** La UI puede mostrar éxito sin persistencia ni conciliación durable. El flujo debe deshabilitarse hasta completar estados, firma, idempotencia y webhook.

### Mobile

- **MOB-001 — URLs EAS duplican `/api/v1`.** Las llamadas de producción terminan en `/api/v1/api/v1/...`.
- **MOB-002 — No se envía `x-api-key` requerido por Backend.** Las rutas protegidas fallan aunque exista JWT válido; debe definirse un contrato seguro y coherente.

## Hallazgos altos

### Frontend

- JSON-LD con escape incorrecto permite XSS almacenado potencial (`FE-SEC-002`).
- Refresh token del Backend expuesto al JavaScript del navegador (`FE-SEC-003`).
- Next.js 16.1.1 afectado por vulnerabilidades altas; `pnpm audit --prod` reportó 30 vulnerabilidades (`FE-SEC-004`).
- Reintentos automáticos de mutaciones no idempotentes (`FE-RES-001`).
- Endpoint de categorías usado por IA no coincide con Backend (`FE-INT-001`).
- Filtros, ordenamiento y paginación operan solo sobre la página visible (`FE-UX-001`).
- Enlaces de categorías usan parámetros incompatibles (`FE-UX-002`).
- Editar y eliminar servicios desde perfil están rotos (`FE-UX-003`).
- Fiscalidad, moneda y formatos están hardcodeados a Chile (`FE-I18N-001`).
- Modales sin gestión completa de foco y teclado (`FE-A11Y-001`).
- Errores de API se convierten en listas vacías o `null` (`FE-ARCH-001`).
- Suite Playwright no reproducible en CI (`FE-QA-001`).

### Mobile

- Detalle de servicios y reservas usan contratos incompatibles (`MOB-003`).
- Publicación envía DTO incompatible (`MOB-004`).
- Perfil, contraseña, recuperación y direcciones llaman rutas incorrectas (`MOB-005`).
- Favoritos usa envelope e identificadores incompatibles (`MOB-006`).
- Chat REST/Socket.IO incompatible (`MOB-007`).
- Refresh token inválido puede bloquear solicitudes indefinidamente (`MOB-008`).
- Socket.IO apunta a localhost en producción (`MOB-009`).
- Logout no limpia caché por usuario (`MOB-010`).
- Roles y onboarding profesional no coinciden con Backend (`MOB-011`).
- Push notifications y deep links no están listos (`MOB-012`, `MOB-013`).
- Lint y formato fallan (`MOB-014`); no existe estrategia de pruebas (`MOB-015`).

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
- Expo Doctor no inició por binario pnpm ausente en el entorno.
- No se ejecutaron builds ni E2E sobre el árbol original.

## Plan recomendado

1. Bloquear y rehacer Stripe/MercadoPago con autorización, precio server-side, persistencia e idempotencia.
2. Actualizar Next.js y corregir JSON-LD y exposición de refresh token.
3. Corregir URL base/API key de Mobile y congelar contrato Backend-Mobile compartido.
4. Reparar servicios, publicación, reservas, favoritos, perfil, direcciones y chat.
5. Reparar Playwright/EAS y establecer CI reproducible con pruebas de contrato y smoke.
6. Añadir observabilidad, separación entre error y vacío, accesibilidad y configuración multi-país.

## Limitaciones

No se ejecutaron pruebas contra servicios externos, navegador real, build productivo, Lighthouse, dispositivos físicos ni validaciones de infraestructura fuera del repositorio. CSP, WAF, rate limiting y headers aplicados fuera del código no pudieron confirmarse.

