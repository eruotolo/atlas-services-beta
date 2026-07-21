# Arquitectura objetivo (incremental)

Principio: **evolución incremental, no reescritura**. El diseño actual (monolito modular NestJS + Next App Router + Expo) es adecuado para el tamaño presente y para escalar considerablemente. NO se recomienda microservicios ni cambio de stack. Los cambios se ordenan por señal que los justifica.

Diagrama: `diagramas/arquitectura-objetivo.mmd`.

## Qué MANTENER (no tocar)

- **Monolito modular NestJS.** 26 módulos por dominio, bien acoplados internamente. Es la arquitectura correcta para este tamaño y para 10–50× el tráfico actual.
- **Next.js App Router + Server Components + Server Actions.** Patrón moderno y correcto.
- **Prisma + PostgreSQL.** Modelo de datos sólido con índices razonables.
- **Expo + React Native + expo-router.** Stack estándar y mantenido.
- **RBAC multi-país** vía `UserRole(userId, roleId, countryId)`. Escala a nuevos países sin cambios de esquema.
- **Cifrado AES-256-GCM** de credenciales de integraciones.

## Qué REFACTORIZAR (corto plazo, con señal ya presente)

1. **Runtime del backend: de serverless a contenedor long-running** (Railway/Render/Fly). *Señal: ya existe WebSocket Gateway + throttler en memoria, ambos rotos en serverless.* Habilita chat estable y rate limit consistente.
2. **Redis** como pieza transversal: storage del throttler, adapter de socket.io (pub/sub entre réplicas) y caché de lecturas calientes (geo, categorías). *Señal: multi-país con datos geo repetidos + necesidad de rate limit compartido.*
3. **Unificar la capa de pago en el backend.** Eliminar rutas de webhook/checkout del frontend; una sola implementación con firma. *Señal: FE-10, duplicación divergente.*
4. **Contrato de API compartido.** Generar cliente TS desde el OpenAPI de NestJS (Swagger ya existe) y consumirlo en web y mobile. *Señal: tipos redefinidos en 3 capas.*

## Qué REEMPLAZAR

- **next-auth v4 → Auth.js v5.** v4 está en modo mantenimiento y su combinación con Next 16 requiere workarounds de peer-deps. Migrar cuando se toque auth de forma sustancial (no urgente si funciona hoy).
- **`console.*` → logging estructurado + APM.** Sentry (web/mobile/api) + OpenTelemetry.

## Qué AÑADIR (nuevos componentes necesarios)

- **CI/CD** (GitHub Actions): typecheck + lint + build por app; tests en PR; deploy a staging.
- **Entorno de staging** real (hoy inexistente).
- **Observabilidad:** Sentry + dashboards + alertas + health/readiness checks (el `handler` serverless no expone health).
- **Tests:** unitarios de dominio (auth, payments, subscriptions, permisos), contrato (web/mobile ↔ backend), e2e de flujos de dinero.
- **Gestión de secretos** con vault/entorno cifrado y rotación de `INTEGRATIONS_ENCRYPTION_KEY`.

## Escalado por horizonte

| Horizonte | Cambio | Señal que lo justifica |
|-----------|--------|------------------------|
| **Actual** | Cerrar críticos (pagos, Next CVE, access control), CI básico | Producción bloqueada sin pagos y con CVEs |
| **Corto (30–90d)** | Backend long-running + Redis, observabilidad, tests de dominio | Chat inestable, sin visibilidad, sin red de tests |
| **Medio** | Réplica de lectura PostgreSQL, caché agresiva, colas (BullMQ) para notificaciones/emails | p95 de DB creciente, picos de notificaciones |
| **Gran escala** | Extraer WebSocket/notificaciones a servicio propio; particionar por país si un mercado domina | Un país concentra la carga; el gateway satura |

## Qué NO hacer todavía

- **No** microservicios: el monolito modular basta hasta que haya evidencia de cuellos por dominio.
- **No** sharding de DB: PostgreSQL con réplica e índices cubre mucho crecimiento.
- **No** multi-región activa-activa: sin volumen que lo justifique.
- **No** reescribir mobile ni migrar de stack.

## Métricas que dispararían el siguiente cambio

- p95 de endpoints > 500 ms sostenido → réplica de lectura + caché.
- CPU/memoria del contenedor > 70% sostenido → escalado horizontal (requiere Redis, ya previsto).
- > 1 país concentrando > 60% del tráfico → considerar aislamiento de ese mercado.
- Cola de notificaciones/emails con latencia → BullMQ + worker dedicado.
