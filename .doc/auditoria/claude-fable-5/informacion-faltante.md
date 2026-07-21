# Información faltante

Datos no disponibles durante la auditoría, cómo afectan la precisión y cómo obtenerlos. El encargo (sección 24) dejó los campos de contexto como plantilla sin rellenar; varias conclusiones de escalabilidad/costos son estructurales por esa razón.

| # | Falta | Por qué importa | Qué decisión bloquea | Cómo obtenerlo |
|---|-------|-----------------|----------------------|----------------|
| 1 | Volumen actual y esperado de usuarios/RPM | Dimensiona escalado, DB y caché | Cuándo migrar a long-running, réplica, colas | Analítica de producción (no existe aún) o proyección de negocio |
| 2 | Entornos reales (¿hay staging?) | El README menciona solo local + Vercel prod | Estrategia de promoción y pruebas | Confirmar con el equipo / panel Vercel |
| 3 | Config real de Vercel (¿backend serverless o long-running?) | BE-04 asume serverless por `vercel.json` | Si el chat/throttler ya están rotos en prod | Acceso a proyecto Vercel del backend |
| 4 | Gestión de secretos (dónde viven `JWT_SECRET`, `INTEGRATIONS_ENCRYPTION_KEY`) | Todo el cifrado depende de ello | Plan de rotación y vault | Panel de env de Vercel / secretos EAS |
| 5 | Estado real de las integraciones (¿credenciales de pasarela cargadas?) | Determina si el stub de pago es lo único que falta | Alcance de C1 | Consultar tabla `Integration` en DB |
| 6 | Backups y RPO/RTO de PostgreSQL | Riesgo de pérdida de datos | Plan de disaster recovery | Proveedor de DB gestionada (si existe) |
| 7 | ¿Hay tráfico/lanzamiento previsto? | Prioriza críticos vs mejoras | Ventana para cerrar TR-01/TR-02 | Roadmap de negocio |
| 8 | Requisitos legales por país (GDPR/EU, protección de datos LATAM) | Multi-país maneja PII | Retención, consentimiento, borrado | Asesoría legal / requisitos de cada país |
| 9 | Presupuesto e infraestructura objetivo | Condiciona hosting (Railway vs Vercel vs AWS) | D1 (migración de runtime) | Definición del equipo |
| 10 | Métricas de rendimiento actuales (p95, Core Web Vitals) | No se midió en entorno real | Priorización de optimizaciones FE | Lighthouse/RUM en prod o preview |

## Impacto en la confianza del análisis

- **Alta confianza:** hallazgos de código (seguridad, arquitectura, stubs, versiones) — verificados directamente.
- **Confianza media:** conclusiones de escalabilidad y de despliegue (BE-04) — se infieren de `vercel.json` y del código, sin acceso al entorno real.
- **Baja confianza / no evaluado:** costos, rendimiento real, backups, cumplimiento legal — requieren datos de infraestructura y negocio no disponibles.
