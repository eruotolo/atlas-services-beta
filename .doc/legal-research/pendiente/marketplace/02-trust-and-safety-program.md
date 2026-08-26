# Programa de Trust & Safety (Fase 10)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — diseño de programa condicionado a decisiones de producto pendientes. Extiende `marketplace/01-platform-role-and-liability-analysis.md` §4-5 (servicios regulados, trazabilidad y retiro de contenido), que ya cubre las obligaciones DSA/§230/DMCA de takedown — no se repiten aquí.

## 0. Brecha de partida (hecho confirmado)

`marketplace/01` §5 ya identificó que **no hay canal formal de notice-and-action ni logs de decisiones de moderación documentados en el repo**, más allá de `Rating.status` (PENDING→ACTIVE) e `IntegrationAuditLog`. Este documento diseña el programa que debe llenar ese vacío — es una propuesta, no una descripción de algo ya implementado.

## 1. Categorías de servicios y contenido — marco de severidad

| Categoría | Ejemplos | Tratamiento propuesto | Base |
|---|---|---|---|
| **Prohibido absoluto** | Servicios sexuales, explotación de menores, armas, drogas ilegales, servicios que requieren licencia médica/legal/financiera que Hireeo no puede verificar, juegos de azar no licenciados | Bloqueo automático en la publicación (palabras clave + revisión); ningún prestador puede publicar bajo estas categorías | `[BUENA PRÁCTICA]` — no hay una lista legal única; se construye por analogía con los marcos de confianza y seguridad estándar de la industria y con las categorías de "alto riesgo" ya señaladas en la Fase 2 del encargo original |
| **Regulado — requiere verificación** | Electricidad, gas, construcción, transporte (ya tabulado en `marketplace/01` §4) | Publicación bloqueada hasta verificar número de licencia/matrícula contra registro oficial | `[OBLIGACIÓN condicional]` — ya citado en `marketplace/01` §4 |
| **Sensible — requiere aviso o edad mínima** | Servicios a domicilio con menores presentes (ej. cuidado infantil, si se llegara a habilitar), servicios nocturnos | Aviso adicional al cliente; posible restricción de edad del solicitante | `[BUENA PRÁCTICA]` — pendiente de decisión de producto sobre si estas categorías existirán |
| **General** | Electricistas no regulados en tareas menores, gásfiter, fletes, limpieza, jardinería | Publicación estándar sin bloqueo adicional | — |

**Decisión de producto pendiente (no legal):** esta tabla es un punto de partida. Hireeo debe decidir formalmente qué categorías de servicio habilitar antes de traducir esta matriz en una política pública — no se puede publicar una "lista de servicios prohibidos" sin que Producto confirme el catálogo real de categorías (`schema.prisma` → `Category`/`Service`).

## 2. Diseño de notice-and-action (propuesta — no implementado)

Basado en las obligaciones ya identificadas en `marketplace/01` §5 (DSA arts. 16-17, 20-21 para UE; deber general de retirar tras notificación en AR/CL/UY; DMCA para IP en EE.UU.):

1. **Canal de reporte** visible en cada perfil/servicio/reseña — hoy no existe evidencia de este canal en el repo.
2. **Confirmación de recepción** al denunciante.
3. **Motivación de la decisión** por escrito al afectado si se retira contenido (exigencia DSA art. 17 para la UE; buena práctica para el resto).
4. **Plazo interno de respuesta** — no hay un plazo legal único; se recomienda un SLA interno (ej. 5 días hábiles) documentado, sin prometerlo públicamente como garantía si el equipo no puede operarlo.
5. **Mecanismo de apelación** interno antes de escalar a autoridad o vía judicial (exigencia DSA art. 20 para la UE; buena práctica para el resto).
6. **Registro y conservación de evidencia** de cada decisión — quién decidió, cuándo, con qué motivo, y la notificación original. Esto es la base para poder demostrar diligencia ante un reclamo de consumo o una autoridad.
7. **Trusted flaggers (DSA art. 22, solo relevante si aplica — ver §4):** priorizar reportes de entidades reconocidas como confiables, si Hireeo llega a operar a la escala donde esto sea relevante.

## 3. Riesgos específicos de contenido — síntesis (evidencia ya citada en otras fases)

- **Reseñas falsas / manipulación de reputación:** ya citado en `country-analysis/united-states-federal.md` (FTC Rule on Consumer Reviews, 16 CFR Part 465) y en la transparencia de ranking DSA/P2B para la UE. Requiere moderación activa más allá del flag `Rating.status` existente — hoy no hay evidencia de un proceso de detección de patrones de reseñas falsas.
- **Suplantación de identidad de prestadores:** vinculado al KYC en stub (`kyc.service.ts:22-47`, ya señalado en `payments-tax/01`). Sin KYC operativo, el riesgo de perfiles falsos es alto.
- **Contenido sintético / generado por IA:** Hireeo tiene un asistente de IA con *tools* que puede crear un `ServiceRequest` (H4 en `marketplace/01` §0). Si en el futuro se permite contenido generado por IA en perfiles/descripciones, debe evaluarse contra `ai/ai-classification-and-risk-assessment.md` — no se duplica ese análisis aquí.
- **Doxxing/acoso/amenazas en mensajería:** no hay evidencia de un mecanismo de reporte de mensajes abusivos en el repo — brecha a documentar en preguntas abiertas (§5).
- **Explotación de menores (CSAM):** ver `03-minors-content-and-mandatory-reporting.md` (huecos de investigación pendientes en curso).

## 4. DSA — aplicabilidad según tamaño (pendiente de confirmar con investigación en curso)

Hireeo, dado su tamaño actual, **no es un proveedor de plataforma en línea de muy gran tamaño (VLOP)** — esa categoría exige un umbral de usuarios activos mensuales en la UE que Hireeo no alcanza. Esto significa que las obligaciones más onerosas del DSA (evaluación de riesgos sistémicos, auditorías externas independientes, arts. 33-43) **no aplican hoy**. Sin embargo, un conjunto de obligaciones básicas (mecanismo de notificación, motivación de decisiones, sistema interno de reclamaciones — arts. 16, 17, 20) **aplica a cualquier proveedor de servicios de alojamiento/plataforma independientemente del tamaño** — esto ya está confirmado en `marketplace/01` §5 y no cambia con este documento.

## 5. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| TS-Q1 | ¿Qué categorías de servicio estarán realmente habilitadas en el catálogo de producción? (define qué aplica de la matriz de §1) | `HIGH` |
| TS-Q2 | ¿Existe hoy algún canal (aunque sea informal, vía soporte) para reportar contenido/comportamiento abusivo? | `MEDIUM` |
| TS-Q3 | ¿Quién sería el responsable interno de operar el SLA de notice-and-action si se implementa? | `MEDIUM` |

## 6. Revisión por abogado local pendiente

La matriz de severidad (§1) es una propuesta de producto informada por buena práctica, no una lista legal exhaustiva por país — cada categoría "prohibida" o "regulada" debe validarse contra la normativa sectorial específica de cada país antes de publicarse como política.
