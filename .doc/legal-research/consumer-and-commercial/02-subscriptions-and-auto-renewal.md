# Suscripciones, pruebas gratuitas y renovación automática (Fase 7)

**Última actualización:** 2026-07-23
**Fuente base:** investigación de fuentes primarias por agente Haiku 4.5 (`consumer-and-commercial/haiku-research-fase7-raw.md`), con verificación selectiva de los hallazgos más relevantes por Sonnet 5 (ver §3).
**Estado:** 🟡 borrador normativo — Hireeo **no tiene hoy** un modelo de suscripción activo (ver `01-scope-assumptions-and-open-questions.md`); este documento es preparatorio para cuando se active.

## 1. Panorama comparativo por jurisdicción

| Jurisdicción | ¿Regulación específica de suscripciones/renovación automática? | Aviso antes de renovar | Cancelación tan fácil como suscribirse | Aviso de aumento de precio |
|---|---|---|---|---|
| España / UE | **Sí** — Directiva 2019/2161 (Omnibus, modifica Directiva 2011/83/UE) + Ley 10/2025 de España (Ley de Servicios de Atención a la Clientela) | **15 días de antelación** (Ley 10/2025) | Sí — mismo procedimiento usado para contratar (art. 9 Directiva 2011/83/UE) | Debe comunicarse con claridad antes del cobro |
| EE.UU. — Federal | **Sí, pero con estado legal inestable** — ROSCA (15 U.S.C. cap. 110) sigue vigente; la "Click-to-Cancel Rule" de la FTC (16 CFR § 425) **fue anulada por el Octavo Circuito el 8 de julio de 2025**, días antes de su entrada en vigor prevista (14 de julio de 2025), por defecto procedimental (falta de análisis regulatorio preliminar exigido por ley cuando el impacto económico anual supera US$ 100 millones) | Prenotificación clara antes del primer cobro (ROSCA); sin plazo fijo para avisos de renovación bajo ROSCA | Exigible bajo ROSCA § 7702(b)(1)(E) ("simple mechanism"), pero sin el estándar reglamentario detallado que traía la regla anulada | Un cambio de precio se trata como "término material" — requiere nuevo consentimiento expreso bajo la interpretación de la FTC |
| California | **Sí** — Cal. Bus. & Prof. Code §§ 17600-17606, ampliado por AB 2863 (vigente desde 2025-07-01) | Aviso anual obligatorio de renovación inminente (AB 2863) | Sí — si la suscripción se hizo online, la cancelación debe poder hacerse **exclusivamente online**; AB 2863 exige "mismo método" (ej. si fue por teléfono, cancelar por teléfono debe ser igual de fácil) | Debe comunicarse "de forma clara y visible" antes de cobrar la renovación |
| Argentina | **No existe** regulación específica de suscripciones digitales | No normado | No normado — la jurisprudencia trata la dificultad de cancelar como posible cláusula abusiva (art. 37-38 Ley 24.240) | No normado específicamente |
| Chile | **Parcial** — DS 6/2021 solo exige transparencia del costo total de la suscripción; no regula plazos de aviso ni mecanismo de cancelación | No especificado | No regulado explícitamente | No regulado explícitamente |
| Uruguay | **Sí, desde 2024-01-01** — Ley 20.212 (Rendición de Cuentas 2023) reformó el art. 31 de la Ley 17.250: es **cláusula presuntamente abusiva** exigir al consumidor un plazo de aviso previo para manifestar que no quiere renovar | Uruguay **prohíbe** exigir un plazo de preaviso al consumidor (efecto inverso al resto: es la empresa la que no puede imponer trabas) | Implícito — la reforma prohíbe trabas; el consumidor puede cancelar dentro de los 60 días posteriores a la renovación automática, y la empresa debe procesarlo en 15 días hábiles | No especificado; se presume exigible bajo el estándar general de abusividad |

## 2. Hecho confirmado vs. inferencia técnica

- **Hecho confirmado (verificado por Sonnet 5 contra fuente secundaria especializada, no el Federal Register directamente):** el Octavo Circuito de EE.UU. anuló la "Click-to-Cancel Rule" de la FTC el 8 de julio de 2025 por defecto procedimental. La obligación de fondo (ROSCA) sigue vigente; lo que cayó fue el reglamento más prescriptivo que la FTC había emitido para reforzarla.
- **Hecho confirmado (verificado):** Uruguay reformó su régimen de renovación automática el 2023-11-06 (Ley 20.212), vigente desde 2024-01-01, y la reforma tiene un efecto **inverso** al de las demás jurisdicciones — no exige que la empresa avise con anticipación, sino que **prohíbe** que la empresa exija al consumidor un plazo de preaviso para cancelar.
- **Inferencia razonable:** el estándar más protector aplicable a toda la operación (si Hireeo lanza suscripciones) sería: (1) mostrar precio, periodicidad y condiciones de cancelación de forma clara antes de suscribir; (2) permitir cancelar por el mismo medio usado para suscribirse; (3) avisar cualquier cambio de precio antes del cobro; (4) en Uruguay específicamente, no imponer ningún plazo de preaviso al consumidor para cancelar.
- **Supuesto no verificado — requiere revisión antes de publicación:** las citas de "Ley 10/2025" (España) y "AB 2863" (California) y "Disposición 377/2026" (Argentina, ver documento de arbitraje) fueron reportadas por el agente de investigación con URL a fuentes oficiales, pero **no se verificaron independientemente por Sonnet 5** contra el texto íntegro del BOE/Federal Register/Boletín Oficial respectivamente — se marcan como pendientes de verificación puntual antes de usarse para redactar cualquier Término de Servicio.

## 3. Qué se verificó y qué no (transparencia metodológica)

| Afirmación | Verificado independientemente | Método |
|---|---|---|
| Anulación de la FTC Click-to-Cancel Rule (8 jul. 2025) | ✅ Sí | Búsqueda cruzada con múltiples firmas de derecho (Sidley, Mayer Brown, WilmerHale, Steptoe) — coinciden en fecha y motivo |
| Ley 20.212 de Uruguay reforma art. 31 Ley 17.250 | ✅ Sí | Búsqueda cruzada con IMPO y fuente especializada — coincide con el reporte del agente |
| Ley 10/2025 de España (servicios de atención a la clientela) | ❌ No verificado independientemente | Solo cita del agente de investigación — **pendiente** |
| AB 2863 de California (vigente 2025-07-01) | ❌ No verificado independientemente | Solo cita del agente de investigación — **pendiente** |
| DS 6/2021 de Chile (no regula renovación automática) | ❌ No verificado independientemente (aunque DS 6/2021 ya está citado en `country-analysis/chile.md` como fuente confirmada para otros fines) | Parcial |

## 4. Implicación para Hireeo (condicionada — no hay suscripciones activas hoy)

Si Hireeo lanza un modelo de suscripción (mencionado como posible modelo de ingreso en la Fase 0), antes de activar el cobro recurrente debe:

1. Diseñar el flujo de cancelación **por el mismo canal** usado para suscribirse (aplicable como estándar global, no solo California).
2. Mostrar precio, periodicidad, duración de la prueba gratuita (si existe) y condiciones de cancelación **antes** de solicitar datos de pago.
3. Para usuarios en Uruguay: **no** imponer ningún plazo de preaviso para que el usuario comunique que no quiere renovar — es una infracción específica y reciente (2024).
4. Para usuarios en España/UE: avisar la renovación con al menos 15 días de antelación (si aplica la Ley 10/2025 tal como fue reportada) y permitir desistimiento de 14 días en la contratación inicial a distancia.
5. Documentar el consentimiento inicial de forma que sirva de evidencia (Argentina/Chile no tienen regla específica, pero la falta de evidencia de consentimiento claro se trata como indicio de cláusula abusiva bajo el régimen general).

## 5. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| SUB-Q1 | ¿Hireeo planea lanzar un modelo de suscripción? ¿En qué plazo? | `MEDIUM` — determina si este documento pasa de preparatorio a operativo |
| SUB-Q2 | Verificar el texto íntegro de la Ley 10/2025 española y de AB 2863 (California) antes de citarlas en un Término de Servicio publicado | `HIGH` |

## 6. Revisión por abogado local pendiente

Los dos hechos verificados independientemente (§3) pueden usarse con confianza razonable. El resto de las citas de este documento requieren confirmación contra texto oficial antes de fundar cualquier cláusula contractual publicada.
