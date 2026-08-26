# Términos para Prestadores de Hireeo

**Documento:** `legal-documents/02-provider-terms.md`
**Audiencia:** prestadores de servicios que publican y ofrecen sus servicios en Hireeo (rol `Professional`), incluyendo condiciones B2B/P2B cuando el prestador actúa como profesional/empresa.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1-borrador
**Fecha de vigencia propuesta:** pendiente de fijar tras revisión legal.
**Dependencias técnicas:** requiere confirmación del modelo de pago (Escenario A/B), del alcance real de verificación de licencias/credenciales, y de si existe o se planea un archivo de análisis de riesgo de clasificación laboral (`employment-and-platform-work/`, no existe todavía en este expediente al momento de redactar este borrador).

> ⚠️ **BORRADOR DE TRABAJO — NO PUBLICABLE.** Requiere resolver los `[[DECISION REQUIRED]]` y revisión legal por jurisdicción antes de publicarse.

---

## 1. Quién es el Prestador y qué relación tiene con Hireeo

**Cláusula central — clasificación de la relación:**
> "El Prestador actúa como profesional o empresa independiente. Nada en estos Términos crea una relación de empleo, sociedad, agencia ni representación entre el Prestador y Hireeo. El Prestador es responsable de sus propias obligaciones fiscales, laborales, de seguridad social y de licencias profesionales."

[[DECISION REQUIRED: confirmar controles de la relación (exclusividad, tarifas fijadas unilateralmente por Hireeo, supervisión de horario, uso exclusivo de la plataforma para todo el trabajo) tras completar una fase de análisis de riesgo de clasificación laboral — este expediente no incluye todavía ese análisis (`employment-and-platform-work/`). El riesgo de reclasificación como relación laboral depende de hechos operativos reales (grado de control, exclusividad, dependencia económica) que no se auditaron en esta fase. No declarar aquí que la clasificación de "independiente" está jurídicamente asegurada — es una cláusula contractual, no una garantía frente a una autoridad laboral o judicial que reclasifique la relación según los hechos reales.]]

## 2. Publicación de servicios — categorías y verificación

- El Prestador es responsable de contar con las licencias, matrículas, seguros y habilitaciones que su oficio requiera en su país (electricidad, gas, construcción, transporte — ver tabla comparativa en `marketplace/01-platform-role-and-liability-analysis.md` §4).
- **Estado real de verificación (a confirmar antes de publicar):** hoy Hireeo no verifica automáticamente el número de licencia/matrícula contra un registro oficial (`marketplace/01` H6). [[DECISION REQUIRED: si esto cambia, actualizar la cláusula para reflejar qué verifica Hireeo y qué no]].
- Hireeo puede suspender o remover un anuncio que corresponda a una categoría prohibida o que no cumpla con la verificación exigida para categorías reguladas — ver matriz de severidad de `marketplace/02-trust-and-safety-program.md` §1 (documento de diseño, catálogo real de categorías pendiente de confirmación de Producto).

## 3. Comisión y pagos

Misma advertencia que en `01-terms-of-service.md` §4: **usar solo la variante que corresponda al modelo de pago real**, no publicar ninguna hasta resolver `PAY-Q1`/`PAY-Q2` (`payments-tax/01-payment-architecture-scenarios-and-licensing.md` §4).

**Variante A (solo conecta):**
> "El Prestador acuerda y recibe el pago directamente del Cliente. Hireeo no interviene en el cobro."

**Variante B (escrow con comisión):**
> "Hireeo retiene una comisión de intermediación del 15% sobre cada transacción procesada a través de la plataforma, mediante [[DECISION REQUIRED: PSP contratado, no confirmado]]. El Prestador recibe el saldo neto según el cronograma de liquidación de [[DECISION REQUIRED: PSP/plazo de liquidación, no confirmado]]."

**Facturación e impuestos (referencia, no repetir investigación):** el Prestador es responsable de su propia facturación e impuestos según su país — ver `payments-tax/02-vat-digital-tax-and-invoicing.md`. **Advertencia específica para prestadores en España/UE si se activa el Escenario B:** si Hireeo intermedia pagos, el Prestador debe saber que **DAC7 no exime a los prestadores de bajo volumen** (corrección verificada en `payments-tax/02` §2) — cualquier prestador con al menos una transacción reportable puede ser incluido en el reporte anual de Hireeo a la autoridad tributaria. [[DECISION REQUIRED: definir si esto se comunica proactivamente a los prestadores antes del lanzamiento en España/UE]].

## 4. Reseñas, reputación y moderación

- El Prestador puede responder a reseñas recibidas; Hireeo modera el contenido según el flujo `PENDING → ACTIVE` (`schema.prisma` `Rating.status`).
- **No existe hoy un canal formal de apelación de moderación documentado** (`marketplace/02-trust-and-safety-program.md` §2, `TS-Q3`) — no prometer un plazo de apelación específico hasta que exista.
- Prohibido: comprar, incentivar o fabricar reseñas falsas — consistente con la FTC Rule on Consumer Reviews (16 CFR Part 465, ya citada en `country-analysis/united-states-federal.md`) y el estándar de transparencia de ranking de la UE (P2B/DSA).

## 5. No-show y cancelaciones por parte del Prestador

[[DECISION REQUIRED: igual que en `01-terms-of-service.md` §5 — no existe hoy una política de no-show implementada; Producto debe definir consecuencias (advertencia, suspensión, penalización) antes de publicar esta sección]].

## 6. Condiciones B2B/P2B (Unión Europea)

Si el Prestador es una empresa/profesional que usa Hireeo como canal de ventas B2B en la UE, aplica el Reglamento P2B (Reglamento (UE) 2019/1150) — ya citado en `marketplace/01` §9 y `country-analysis/spain-eu.md`. Elementos mínimos exigidos por P2B que este documento debe reflejar cuando se redacte la versión final:

- Criterios de ranking y su ponderación general (sin revelar el algoritmo exacto).
- Motivos de suspensión o restricción de la cuenta del Prestador, con preaviso razonable salvo incumplimiento grave.
- Canal interno de reclamación para el Prestador, distinto del canal de disputas del Cliente.

[[DECISION REQUIRED: Hireeo no tiene hoy documentado un sistema de reclamación interna B2B — pendiente de diseño]].

## 7. Propiedad intelectual del contenido publicado

El Prestador conserva la titularidad de las fotos, descripciones y contenido que publica, y otorga a Hireeo una licencia para exhibirlo y distribuirlo en la plataforma con el fin de operar el servicio. [[DECISION REQUIRED: confirmar alcance exacto de la licencia — sublicencia, duración post-eliminación de cuenta — contra `intellectual-property/03-user-content-and-ai-generated-content.md` si existe en este expediente]].

## 8. Resolución de disputas

Aplica la misma cláusula diferenciada por jurisdicción que en `01-terms-of-service.md` §7 (arbitraje solo para EE.UU.; vía judicial/administrativa de consumo para el resto). Si el Prestador actúa como profesional B2B puro (no consumidor) en su jurisdicción, esta calificación puede variar — [[DECISION REQUIRED: requiere análisis legal específico sobre si el Prestador califica como consumidor o como parte comercial pura bajo la ley de su país, ya que eso cambia qué protecciones de irrenunciabilidad aplican]].

## 9. Terminación y suspensión de cuenta

Hireeo puede suspender cuentas por incumplimiento de estos Términos, incluyendo las categorías prohibidas de `marketplace/02-trust-and-safety-program.md` §1. [[DECISION REQUIRED: definir plazo de preaviso salvo incumplimiento grave, consistente con P2B en la UE §6]].

---

## Hechos que requieren confirmación antes de publicar

1. Controles reales de la relación Prestador-Hireeo, para sostener la clasificación de "independiente" (§1) — requiere una fase de análisis de riesgo laboral que no existe todavía en este expediente.
2. Modelo de pago real y comisión (§3).
3. Existencia de un canal de apelación de moderación (§4).
4. Política de no-show del Prestador (§5).
5. Sistema de reclamación interna B2B/P2B (§6).
6. Alcance de la licencia de contenido (§7).

## Revisión por abogado local pendiente

La cláusula de clasificación de la relación (§1) es la de mayor riesgo de este documento — su validez depende de hechos operativos reales, no solo del texto contractual, y varía significativamente entre EE.UU. (donde existe litigio extenso sobre clasificación de trabajadores de plataformas), la UE (Directiva de Trabajo en Plataformas Digitales) y cada país de LatAm. Requiere abogado laboralista habilitado en cada jurisdicción antes de publicarse, y una fase dedicada de investigación (`employment-and-platform-work/`) que este borrador no sustituye.
