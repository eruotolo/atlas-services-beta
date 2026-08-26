# 06 — Política de IA Responsable + Aviso de Transparencia de IA (borrador)

- **Audiencia:** usuarios finales (clientes y prestadores) de Hireeo en las 5 jurisdicciones de lanzamiento.
- **Cobertura:** global, con énfasis en obligaciones vigentes en España/UE (AI Act) y Utah (GenAI disclosure).
- **Versión:** v0.1 — borrador de investigación técnico-jurídica, no texto publicable.
- **Fecha de vigencia propuesta:** no antes de que se resuelvan las `[[DECISION REQUIRED]]` de §4 y se implementen los controles de aceptación citados.
- **Dependencias técnicas:** aviso de IA en la UI (hoy **inexistente**, confirmado en `ai/ai-user-transparency.md` §1: *"no hay ningún aviso de IA en la UI"*); control de confirmación del usuario antes de que el Sistema A escriba en base de datos (`ai-classification-and-risk-assessment.md` §2.1, AI-CHK-03).
- **Hechos que requieren confirmación antes de publicar:** entidad legal operadora (Q1 de `01-scope-assumptions-and-open-questions.md`); si Google/Gemini entrena con los datos enviados (no confirmado por contrato, ver `ai-classification-and-risk-assessment.md` §2.2).

> **Aviso.** Este es un borrador de investigación. Requiere revisión de abogado habilitado en cada jurisdicción antes de publicarse. No describe una práctica ya implementada salvo que se indique explícitamente como "hecho confirmado".

---

## 1. Qué sistemas de IA usa Hireeo (según clasificación ya confirmada)

Esta sección **no reclasifica nada** — cita la conclusión ya establecida en `ai/ai-classification-and-risk-assessment.md`:

- Hireeo actúa como **desplegador** ("deployer") de sistemas de IA de terceros (Google Gemini es el proveedor del modelo). **[HECHO, de ai-classification-and-risk-assessment.md §1]**
- Ningún sistema de IA de Hireeo está clasificado como práctica prohibida ni de alto riesgo bajo el Reglamento (UE) 2024/1689 (AI Act) **a la fecha de este borrador**. **[HECHO — conclusión ya establecida, sujeta a reevaluación si cambia el uso, ver control M4]**
- Los sistemas que interactúan con personas están sujetos a la obligación de transparencia del art. 50 del AI Act (aplicable desde 2026-08-02) y a la alfabetización en IA del art. 4 (ya vigente desde 2025-02-02).

## 2. Cómo usamos la IA (texto propuesto para el usuario final)

> Hireeo usa inteligencia artificial (Google Gemini) para ayudarte a encontrar un profesional, sugerirte categorías y, en algunos casos, redactar un borrador de solicitud de servicio a partir de tu descripción. **La IA sugiere, no decide por ti**: cualquier borrador que la IA cree requiere tu confirmación antes de enviarse a un prestador. [[DECISION REQUIRED: este texto asume que el control de confirmación técnica (AI-CHK-03) ya está implementado — no publicar esta frase hasta que ese control exista, según advierte `ai-classification-and-risk-assessment.md` §2.1]]

## 3. Transparencia de IA — obligaciones específicas ya identificadas

| Obligación | Fuente ya confirmada | Estado de implementación |
|---|---|---|
| Aviso de que se interactúa con un sistema de IA (art. 50.1 AI Act) | `ai-user-transparency.md` §2 | **No implementado** — `[[DECISION REQUIRED]]`: alcance global o solo `/es` + Utah (recomendado: global) |
| Marcado de contenido generado por IA que se publica (art. 50.2 AI Act) — aplica a la descripción de servicio generada por el Sistema E | `ai-user-transparency.md` §4 | **No implementado** — `[[DECISION REQUIRED]]`: badge de IA vs. revisión editorial humana obligatoria antes de publicar |
| Disclosure de GenAI en transacciones de consumo (Utah SB 226) | `ai-classification-and-risk-assessment.md` §3.2 | **No implementado** |
| Advertencia de no compartir datos sensibles con el asistente | `ai-user-transparency.md` §2 | **No implementado** |
| Derecho a descartar/rehacer un borrador creado por IA | `ai-user-transparency.md` §5 | Depende de que el control de confirmación (AI-CHK-03) exista |

## 4. Decisiones de negocio pendientes (heredadas de `ai-user-transparency.md` §7 — no se reinventan aquí)

- `[[DECISION REQUIRED]]` Aviso de IA global vs. solo `/es` + Utah.
- `[[DECISION REQUIRED]]` Para el Sistema E (descripción de servicio): marcado de IA o revisión editorial humana obligatoria.
- `[[DECISION REQUIRED]]` Confirmar con el proveedor (Google) si los datos enviados a Gemini se usan para entrenamiento — condiciona el texto exacto de este aviso.

## 5. Qué NO afirma esta política (límites honestos)

- No afirma que existe supervisión humana efectiva sobre el Sistema A — el control técnico que la garantizaría todavía no existe (`ai-classification-and-risk-assessment.md` §2.1). Publicar esta política sin ese control implementado dejaría la "defensa de revisión humana" **frágil** ante una autoridad de protección de datos, tal como ya se advirtió en la fase de investigación.
- No promete que la IA nunca se equivoca ni que sus sugerencias son verificadas — el aviso al usuario debe decir explícitamente que puede haber errores.

## 6. Revisión por abogado local pendiente

Este borrador depende de que se resuelvan las `[[DECISION REQUIRED]]` de §4 y de que Ingeniería confirme la fecha de implementación de los controles técnicos citados. No debe publicarse citando el art. 50 del AI Act como "ya cumplido" mientras el aviso de IA no exista en la UI.
