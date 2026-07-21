# Información faltante

Información necesaria para completar el análisis que **no estuvo disponible** durante la auditoría. Para cada ítem se indica por qué es importante y qué decisión impide tomar.

## Contexto del producto

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **Volumen actual de usuarios** | Calibrar si las recomendaciones de escalabilidad (Redis, read replicas, chat dedicado) son necesarias ya o pueden esperar. | Decidir entre "estabilizar primero" vs "escalar primero". | Métricas de GA / Vercel Analytics / DB (`SELECT COUNT(*) FROM users`). |
| **Volumen esperado a 6/12 meses** | Justificar inversiones en infraestructura. | Decidir si extraer chat a Pusher/Ably ya o esperar. | Plan de negocio / roadmap de marketing. |
| **Peticiones por minuto actuales** | Identificar cuellos de botella reales vs teóricos. | Priorizar optimizaciones de performance. | Vercel usage / logs. |
| **Distribución por país** | Decidir prioridad de pasarelas, i18n, y multi-tenancy. | Si 95% es CL, AR/UY/ES/US pueden esperar. | DB groupby `country`. |

## Requisitos regulatorios

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **¿Aplica GDPR (usuarios ES)?** | Obligación de soft-delete, export de datos, derecho al olvido. | Decidir prioridad de C08 (soft-delete). | Asesoría legal. |
| **¿Aplica CCPA (usuarios US)?** | Similar a GDPR para California. | Igual. | Asesoría legal. |
| **¿Ley chilena 19.628 (privacidad)?** | Para usuarios CL. | Igual. | Asesoría legal. |
| **¿PCI-DSS?** | Si se manejan datos de tarjetas directamente (no parece). | Decidir si Stripe Elements/MP Brick son suficientes (parece sí). | Confirmar con pasarela. |
| **¿KYC obligatorio para proveedores?** | Si Hireeo procesa pagos a proveedores, puede exigirlo. | Prioridad del módulo KYC existente. | Ley de cada país. |

## Datos sensibles

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **Inventario de datos sensibles** | GDPR requiere registro de tratamiento. | Decidir qué datos cifrar/retener/archivar. | Auditoría de schema DB. |
| **Política de retención** | Mensajes, direcciones, interacciones — ¿cuánto se guardan? | Decidir archivado. | Política de producto. |

## Infraestructura

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **¿Qué proveedor PostgreSQL en prod?** (Neon, Supabase, RDS, Vercel Postgres) | Recomendaciones de backups, read replicas, connection pooling. | Recomendar feature flags específicas. | Vercel env / dashboard. |
| **¿Hay backups automáticos?** | RPO/RTO. | Decisión crítica de DR. | Dashboard del proveedor. |
| **¿Hay staging?** | Validar despliegues sin tocar prod. | Recomendar estrategia de release. | Vercel preview deploys. |
| **¿Dominio `hireeo.app` está activo?** | DNS, certificados. | Validar headers de seguridad reales. | whois + curl. |
| **¿Cloudflare o Vercel Edge delante?** | WAF, rate limiting, CDN. | Recomendar defensa perimetral. | DNS records. |

## Estrategias de operación

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **¿Estrategia de backups y restore?** | DR; contrato con usuarios. | Validar si el backup restore se ha probado. | RUNBOOK / equipo DEV. |
| **¿Estrategia de monitoreo?** | Detección de incidentes. | Recomendar tools específicas. | Stack actual (si existe). |
| **¿On-call?** | Quién responde a incidentes. | Recomendar runbooks. | Equipo. |
| **¿Postmortems de incidentes previos?** | Aprender de fallos. | Validar si hay bugs recurrentes. | Notion/Linear. |

## Equipo y presupuesto

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **Tamaño del equipo** | Decidir qué tan rápido se pueden ejecutar las 90 acciones del plan. | Priorización realista. | RRHH / founder. |
| **¿Hay QAs dedicados?** | Estrategia de pruebas. | Decidir entre automatizar todo o mix manual. | Equipo. |
| **¿Hay SRE/DevOps?** | Capacidad de CI/CD, observabilidad. | Decidir entre self-host vs managed. | Equipo. |
| **¿Budget para servicios (Sentry, Upstash, Pusher)?** | Costo mensual. | Elegir tier gratuito vs paid. | Founder. |
| **¿Ventana de lanzamiento?** | Urgencia real. | Decidir entre refactor profundo vs quick wins. | Plan de producto. |

## Restricciones de negocio

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **¿Hay acuerdos con Stripe/MP específicos?** | Comisiones, webhook config. | Recomendar migración de webhook handlers. | Contrato. |
| **¿Hireeo tiene logo/branding final?** | `app_name`, splash. | Cerrar MOB-005. | Diseño. |
| **¿Política de moderación de servicios?** | Filtros de contenido, KYC. | Decidir workflow de moderación. | Producto. |

## Testing y validación

| Ítem | Por qué importa | Qué impide | Cómo obtenerla |
|---|---|---|---|
| **¿Hay DB de staging con datos realistas?** | Tests E2E significativos. | Validar flujos de pago reales. | Setup DEV. |
| **¿Hay cuentas de prueba en Stripe/MP?** | Test webhooks. | Validar A06. | Dashboard Stripe/MP test mode. |
| **¿Hay dispositivos físicos iOS/Android para test?** | Validar release mobile. | Cerrar MOB-004, MOB-005. | QA. |

## Limitaciones de esta auditoría

Específicas del análisis realizado:

1. **No se accedió a Vercel/Neon/Cloudinary dashboards** → no se validó configuración real de prod.
2. **No se ejecutaron pruebas reales** (E2E, DAST, carga) → performance y UX son inferencias del código, no medidas.
3. **No se inspeccionaron los `.env` a fondo** (solo patrones) → no se rotaron secretos.
4. **No se validaron flujos de pago end-to-end** → se asume que están rotos por evidencia de código, no por test real.
5. **El audit de dependencias muestra vulnerabilidades del workspace** → algunas son dev deps que no llegan a prod.
6. **El commit `bc57586` es de hoy** → algunos hallazgos pueden haber sido ya corregidos en branches no mergeadas.

## Próximos pasos para cerrar la información faltante

1. **Solicitar a Edgardo**: respuestas a las preguntas de "Contexto del producto" + "Equipo" + "Ventana de lanzamiento".
2. **Solicitar a DEV**: configuración real de Vercel, Neon, Stripe/MP webhook URLs, dominio.
3. **Solicitar a Legal**: requisitos regulatorios por país.
4. **Programar**: sesión de 1h con el equipo para revisar este informe y responder preguntas abiertas.
