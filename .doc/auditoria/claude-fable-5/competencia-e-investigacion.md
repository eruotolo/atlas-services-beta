# Competencia e investigación externa

## Investigación técnica (fuentes oficiales)

Consultadas el 2026-07-18. Detalle y enlaces en `fuentes.md`.

### Versiones y estado de mantenimiento

| Tecnología | En el proyecto | Última estable (jul 2026) | Estado | Acción |
|------------|----------------|---------------------------|--------|--------|
| Next.js | 16.1.1 | 16.2.6 | **Vulnerable** (13 CVEs < 16.2.5) | Actualizar ya (TR-02) |
| NestJS | 10.4.x | 11.1.28 | v10 en "legacy limbo" tras v11 | Migrar a medio plazo |
| Expo SDK | 54 | 56 (RN 0.85) | 2 versiones atrás | Planificar upgrade (cierra crit de tooling) |
| React Native | 0.81.5 | 0.85 | Atrás | Con Expo 56 |
| next-auth | v4 | Auth.js v5 | v4 en mantenimiento; fricción con Next 16 | Migrar al tocar auth |
| Prisma | 7.5 | 7.x | Al día | — |
| React | 19.2 | 19.2 | Al día | — |

**Hallazgo clave (confirmado):** el CVE más relevante para producción es la **cache poisoning de RSC (GHSA-vfv6-92ff-j949 / CVE-2026-44582)**, explotable tras CDN compartida. El upgrade a Next 16.2.6 es de esfuerzo bajo y cierra 13 advisories.

## Competencia y mercado

Dominio: **marketplace multi-país de servicios manuales** (electricistas, carpinteros, gásfiter, fletes, mudanzas). Competidores directos por modelo: **Thumbtack** (pay-per-lead, bids por proyecto) y **TaskRabbit** (transaccional, booking instantáneo por hora). Fuente: comparativas de mercado 2026 (ver `fuentes.md`), usadas solo como **contexto**, no como base de decisiones técnicas.

### Información pública confirmada
- **Thumbtack:** modelo pay-per-lead, ~500+ categorías, cobra hasta ~20% por lead, hiring por proyecto con bids. Amplia cobertura US incl. zonas semi-rurales.
- **TaskRabbit:** modelo transaccional (fee de servicio + trust fee), booking instantáneo por hora, categorías acotadas a hogar/handyman, presente en US/CA/UK/FR/DE/ES.

### Observaciones (dónde encaja Hireeo)
- El proyecto ya modela **ambos patrones**: `ServiceRequest`/`Quote` (estilo Thumbtack, cotizaciones) y `Service` premium/featured con contacto directo. Es una base flexible.
- El **escrow** (módulo `escrow`) y **KYC** apuntan a un modelo transaccional con confianza — hoy stubs.

### Inferencias / oportunidades (no confirmadas)
- **Diferenciador AI:** el proyecto ya integra Gemini (`ai-agents`, `chatbot`) — coincide con la visión del usuario (memoria: AI como diferenciador). Ni Thumbtack ni TaskRabbit exponen un asistente conversacional de matching como núcleo. Oportunidad real, pero requiere que el flujo base (pago, chat) funcione primero.
- **Multi-país LATAM + EU/US con pasarela por país** es un diferenciador operativo frente a competidores centrados en un mercado.

### Riesgos de copiar sin contexto
- **Booking instantáneo (TaskRabbit)** exige disponibilidad/calendario y pagos en escrow funcionando: hoy no están. Copiarlo antes de cerrar pagos sería prematuro.
- **Pay-per-lead (Thumbtack)** cambia el modelo de monetización actual (premium/sponsors); no adoptar sin validar unit economics.

## Conclusión de la investigación

La pila tecnológica es **moderna y adecuada**; la deuda de versiones es acotada y de bajo esfuerzo salvo Expo. El posicionamiento (multi-país + AI) es defendible, pero **la ventaja competitiva depende de completar los flujos núcleo (pago, chat en tiempo real, verificación)**, hoy incompletos, antes de invertir en diferenciadores.
