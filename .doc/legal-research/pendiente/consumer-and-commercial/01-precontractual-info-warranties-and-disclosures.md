# Información precontractual, garantías, no-show y transparencia comercial (Fase 7)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — síntesis de hechos ya investigados en `country-analysis/*.md` y `marketplace/01-platform-role-and-liability-analysis.md`; no repite esas fuentes, las referencia.

## 0. Alcance y qué NO está en este documento

- La calificación de Hireeo como intermediario/proveedor y los límites de exclusión de responsabilidad **ya están analizados** en `marketplace/01-platform-role-and-liability-analysis.md` §6-7. No se repiten aquí.
- Los plazos de desistimiento/retracto por país **ya están en** `country-analysis/comparative-matrix.md` (fila "Comercio electrónico y desistimiento B2C"). No se repiten aquí.
- La facturación, impuestos y comprobantes de pago se tratan en la Fase 8 (`payments-tax/`, pendiente) — aquí solo se cubre el **deber de información sobre precio total** desde la óptica de consumo, no el tratamiento fiscal.
- Las reglas de suscripción/renovación automática y la ejecutabilidad de cláusulas de arbitraje/acción de clase se investigan en documentos separados de esta misma carpeta (`02-subscriptions-and-auto-renewal.md`, `03-dispute-resolution-and-arbitration.md`) porque son huecos genuinos que no estaban cubiertos.

## 1. Información precontractual mínima — síntesis por país (con referencia a fuente ya citada)

| Elemento exigido | Uruguay | Argentina | Chile | España/UE | Estados Unidos |
|---|---|---|---|---|---|
| Identidad y contacto del proveedor | Ley 17.250 art. 6, 16 — `country-analysis/uruguay.md` §"Consumo y e-commerce" | Ley 24.240 art. 4, 8 bis — `country-analysis/argentina.md` L.13 | DS 6/2021 arts. 1-3 — `country-analysis/chile.md` §4 | LSSI art. 10 — `country-analysis/spain-eu.md` L.247 | FTC Act §5 — `country-analysis/united-states-federal.md` L.25 |
| Precio total, moneda, cargos e impuestos | Ley 17.250 art. 6, 16 | Ley 24.240 art. 4 | DS 6/2021 Tít. II | Directiva 2011/83 + Omnibus | Estatal, variable — ver matriz US |
| Descripción del servicio, disponibilidad y condiciones | Igual cita | Igual cita | Igual cita | Igual cita | FTC Act §5 |
| Confirmación y archivo del contrato | No especificado explícitamente en la investigación previa — **hueco menor, prioridad `LOW`** | Igual | Igual | GDPR-adyacente: conservar prueba de consentimiento/confirmación | No especificado a nivel federal |

**Hecho confirmado:** las cinco jurisdicciones exigen, como mínimo común, identidad del proveedor, precio total y descripción del servicio antes de contratar. Esto ya está bloqueado como `P0`/`BLOCKING` en varios archivos de país por falta de razón social/domicilio/RUT confirmados de la entidad Hireeo — ver `01-scope-assumptions-and-open-questions.md`.

## 2. No-show, reprogramación y garantía legal — síntesis (razonamiento, no nueva investigación normativa)

Este es un escenario operativo específico de un marketplace de servicios manuales (el prestador no llega a la cita) que **no** tiene una norma dedicada identificada en la investigación de país — se resuelve con los principios generales de consumo ya confirmados:

- **Uruguay/Argentina/Chile:** el incumplimiento de la prestación contratada (no-show) es incumplimiento contractual bajo el régimen general de consumo (Ley 17.250, Ley 24.240, Ley 19.496) — da derecho a reembolso y, según el caso, a indemnización. No hay un plazo especial de "no-show" identificado; se aplica el régimen general de incumplimiento. **[INFERENCIA razonable, no hecho normativo específico]**
- **España/UE:** la Directiva de derechos de los consumidores exige que el servicio se preste conforme a lo contratado; el no-show habilita resolución del contrato y reembolso bajo garantía legal general (no hay norma de "no-show" específica para marketplaces de servicios).
- **Estados Unidos:** depende del estado; no hay regla federal de no-show. Aplican reglas generales de FTC Act §5 si el marketplace representa una disponibilidad o garantía que no cumple.

**Decisión de producto pendiente (no legal):** Hireeo debe definir una **política propia de no-show** (reembolso automático, reprogramación, penalización al prestador) — esto no está impuesto por ley específica, pero su ausencia expone a reclamos bajo el régimen general de incumplimiento/garantía legal de cada país. Se recomienda documentarla en `legal-documents/` (Fase 14) como parte de los Términos para Prestadores y de Cliente.

## 3. Precios personalizados, descuentos, afiliados y resultados patrocinados

- **Hecho confirmado (ya citado en otros documentos):** identificar contenido patrocinado/destacado (`Sponsor/featured`) es exigencia de la FTC Act §5 en EE.UU. (`country-analysis/united-states-federal.md` L.25) y de la normativa de competencia/publicidad en Uruguay (Ley 18.159, `country-analysis/uruguay.md` L.46) y transparencia de ranking bajo DSA/P2B en la UE (`country-analysis/spain-eu.md` §"Ranking / transparencia").
- **Supuesto pendiente de confirmar (producto):** Hireeo no tiene hoy, según la evidencia del repo revisada en fases previas, un mecanismo de "resultados patrocinados" o precios personalizados activo. Si se lanza esta función en el futuro, debe re-evaluarse contra DSA arts. 26-27 (UE) y FTC Act §5 (EE.UU.) antes del lanzamiento, no después.
- **No aplica hoy** una obligación específica de afiliados si Hireeo no opera un programa de afiliados — no inventar esta obligación sin evidencia de que el programa existe.

## 4. Fuentes

Este documento no introduce fuentes primarias nuevas — todas las citas provienen de `country-analysis/*.md` y `marketplace/01-platform-role-and-liability-analysis.md`, cuyos registros de fuentes (`[U-xx]`, `[A-xx]`, `[CL-xx]`, etc.) siguen siendo la referencia autoritativa. Este documento es una capa de síntesis cruzada, no una nueva investigación jurisdiccional.

## 5. Preguntas abiertas nuevas de este documento

| # | Pregunta | Prioridad |
|---|---|---|
| CONS-Q1 | ¿Cuál será la política de no-show/reprogramación de Hireeo? (decisión de producto, no legal) | `MEDIUM` |
| CONS-Q2 | ¿Existe o se planea un mecanismo de resultados patrocinados o precios personalizados? | `LOW` — reevaluar si se activa |

## 6. Revisión por abogado local pendiente

La síntesis de §1 y §3 se apoya en fuentes ya verificadas en fases previas de este expediente. El razonamiento de §2 (no-show) es una inferencia de principios generales de consumo, no una cita normativa específica — debe validarse con abogado local antes de publicarse como garantía en un Término de Servicio.
