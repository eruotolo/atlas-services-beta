# Auditoría técnica — Hireeo (next-atlas-services)

- **IA:** Anthropic
- **Modelo:** Claude Fable 5 (`claude-fable-5`)
- **Inicio:** 2026-07-18 ~21:20 (-04:00)
- **Fin:** 2026-07-18 ~22:05 (-04:00)
- **Commit analizado:** `bc57586` (rama `main`) · submódulos: frontend `3f73bab`, backend `ee40d26`, appmobile `fe9b462`
- **Confianza global:** media-alta

## Alcance

Auditoría integral de las tres unidades: **frontend** (Next.js 16), **backend** (NestJS 10), **appmobile** (Expo 54), y su integración. Cubre arquitectura, seguridad, rendimiento, escalabilidad, testing, DevOps, observabilidad, UX y deuda técnica.

### Partes revisadas
- Código fuente de `frontend/src`, `backend/src` (+ `prisma/`), `appmobile/src`.
- Configuración: `next.config.ts`, `main.ts`, `app.module.ts`, `vercel.json`, `docker-compose`, `eas.json`, `app.json`.
- Auth (JWT/next-auth/OAuth), pagos (Stripe/MP), webhooks, upload, chat WebSocket, integraciones cifradas.

### Partes NO revisadas
- Entornos desplegados (no existe staging; producción no desplegada).
- Paneles cloud (Vercel, DB gestionada), variables de entorno reales.
- Tests de carga / DAST / ejecución en dispositivo móvil.

## Herramientas y comandos disponibles

- Shell (git, pnpm, tsc, biome, nest/next build, pnpm audit), lectura de archivos, búsqueda de código, WebSearch/WebFetch.
- Comandos ejecutados (todos sin modificar el proyecto): typecheck, lint, build, audit en las 3 apps. Detalle en [comandos-ejecutados.md](./comandos-ejecutados.md).

## Limitaciones

Sin acceso a runtime/infra real → conclusiones de escalabilidad/despliegue inferidas del código (confianza media). Sin datos de volumen/costos/legal → esas secciones quedan como información faltante. Ver [informacion-faltante.md](./informacion-faltante.md).

## Índice de informes

- [resumen-ejecutivo.md](./resumen-ejecutivo.md)
- [informe-completo.md](./informe-completo.md) — documento autocontenido con todos los entregables
- [hallazgos.md](./hallazgos.md) — hallazgos con formato detallado (sección 18)
- [errores-y-warnings.md](./errores-y-warnings.md)
- [seguridad.md](./seguridad.md)
- [arquitectura-actual.md](./arquitectura-actual.md)
- [arquitectura-objetivo.md](./arquitectura-objetivo.md)
- [competencia-e-investigacion.md](./competencia-e-investigacion.md)
- [plan-de-accion.md](./plan-de-accion.md)
- [informacion-faltante.md](./informacion-faltante.md)
- [comandos-ejecutados.md](./comandos-ejecutados.md)
- [fuentes.md](./fuentes.md)
- [metadata.json](./metadata.json)
- Por capa: [frontend/](./frontend/auditoria-frontend.md) · [backend/](./backend/auditoria-backend.md) · [mobile/](./mobile/auditoria-mobile.md)
- Diagramas: [arquitectura-actual.mmd](./diagramas/arquitectura-actual.mmd) · [arquitectura-objetivo.mmd](./diagramas/arquitectura-objetivo.mmd)
- Evidencias crudas: [evidencias/](./evidencias/)

## Hallazgos por severidad

| Severidad | Cantidad |
|-----------|----------|
| Crítica | 2 |
| Alta | 8 |
| Media | 9 |
| Baja | 6 |
| Informativa | 4 |

### Críticos
1. **TR-01** — Flujo de pago no implementado (pasarelas stub + webhook sin mapeo).
2. **TR-02** — Next.js 16.1.1 con 13 CVEs sin parchear (cache poisoning RSC).

## Estado general del proyecto

Base técnica sólida y moderna (arquitectura 🟢), penalizada por preparación para producción y operación (pagos 🔴, testing 🔴, DevOps 🔴, observabilidad 🔴). **Puntuación global: 5.4/10.** No apto para producción hasta cerrar críticos y montar la base operativa. **No requiere reescritura.**

## Próxima acción recomendada

Ejecutar los 4 quick wins de seguridad de 24–72h (upgrade Next 16.2.6, RolesGuard en `GET /users`, secreto en `/api/revalidate`, CORS del WebSocket Gateway) y, en paralelo, planificar la implementación del pago real como siguiente hito técnico.
