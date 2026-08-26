# ai/ai-user-transparency — Transparencia de IA al usuario (Fase 6.2)

- **Fecha:** 2026-07-23 · **Versión:** 0.1
- **Insumos:** `ai-classification-and-risk-assessment.md`, `country-analysis/spain-eu.md` §5.3, `united-states-state-local-matrix.md` (Utah), `code-audit/00-repository-inventory.md` §5.2.

> Etiquetas: **[OBLIGACIÓN]** vigente, **[FUTURO]**, **[BUENA PRÁCTICA]**, **[[DECISION REQUIRED]]**.

---

## 1. Marco aplicable

| Fuente | Deber | Estado |
|---|---|---|
| **AI Act art. 50.1** | Informar al usuario que **interactúa con un sistema de IA** (salvo que sea obvio). | **[FUTURO] 2026-08-02** (10 días de la fecha de corte) — aplica en `/es`. |
| **AI Act art. 50.2** | Marcar el **contenido generado por IA** que se publica (excepción con revisión editorial humana responsable). | **[FUTURO] 2026-08-02** (sistemas preexistentes: 2026-12-02). |
| **Utah AI Policy Act / SB 226 (GenAI)** | Disclosure de GenAI cuando una persona razonable pueda creer que habla con un humano, en consumer transactions. | **[OBLIGACIÓN vigente]** si hay usuarios en Utah. |
| **GDPR arts. 13-14 / 22** | Informar del tratamiento por IA, perfilado y (si aplica) decisiones automatizadas. | **[OBLIGACIÓN vigente]** |
| **FTC §5 / consumo LatAm** | No engañar sobre si se habla con humano o IA; no afirmaciones IA no sustentadas. | **[OBLIGACIÓN vigente]** |
| **Soft law LatAm** (AAIP Disp. 2/2023; Estrategia UY; Política CL) | Transparencia y explicabilidad. | **[GUÍA]** |

> **[HECHO]** Hoy **no hay ningún aviso de IA** en la UI (`code-audit` §5.2 [MEDIUM] "decisión automatizada sin supervisión humana ni disclaimer de IA" — `HeroSearchBar.tsx:72`; `ai-agents/tools/services.tool.ts`).

> **[INFERENCIA / recomendación]** Aunque el art. 50 solo es exigible en la UE, el disclosure de IA es **buena práctica global** y **ya obligatorio en Utah**. **[BUENA PRÁCTICA]** Implementarlo de forma **uniforme en todos los países** simplifica el producto y cubre el mínimo común.

---

## 2. Aviso de interacción con IA (art. 50.1)

**Dónde [OBLIGACIÓN]:**
- **Agente conversacional (Sistema A)** — `ChatIA`/`HeroSearchBar` y cualquier UI de chat: etiqueta visible "Asistente con IA" al inicio de la conversación y de forma persistente.
- **Chatbot clasificador (B, C, F)** — cuando el usuario describe su necesidad en lenguaje natural y recibe una sugerencia: indicar que la sugerencia la genera IA.

**Contenido mínimo del aviso:**
- "Estás interactuando con un **asistente de IA** de Hireeo."
- Qué hace: te ayuda a encontrar un profesional; **puede equivocarse**; **no** toma decisiones por ti.
- Qué **no** debes compartir: documentos de identidad, datos de tarjeta, información sensible (`united-states-federal.md` control verificable).
- Enlace a la **Política de IA** y a cómo cuestionar/rehacer un resultado (§5).

> El disclaimer "la IA puede equivocarse" **acompaña**, no reemplaza, los controles técnicos (regla del megaprompt).

---

## 3. Explicación del rol de la IA

Publicar, en la Política de IA / centro de ayuda, una explicación clara [BUENA PRÁCTICA, refuerza GDPR 13-14]:
- Qué sistemas de IA operan y para qué (clasificar, sugerir, redactar, crear borradores).
- Que la IA **sugiere** pero **no selecciona ni contrata** por el usuario.
- Que se usa **Google Gemini** como proveedor del modelo (subprocesamiento) — coordinar con política de privacidad y DPA (Q4).
- Que los borradores de solicitud **requieren tu confirmación** (una vez implementado el control AI-CHK-03).

---

## 4. Marcado de contenido generado (art. 50.2) — Sistema E

- **[HECHO]** `generateServiceDescription` produce la **descripción del servicio que el prestador publica** (`geminiService.ts:212-273`), de cara al público, con afirmaciones de calidad/experiencia no verificadas.
- **[FUTURO/OBLIGACIÓN 2026-08-02]** El contenido generado por IA que se publica debe **marcarse** salvo que haya **revisión editorial humana con responsabilidad**.
- **Opciones [[DECISION REQUIRED]]:**
  1. **Marcar** la descripción como "asistida por IA" (badge/nota), **o**
  2. Establecer **revisión editorial humana** (el prestador revisa, edita y asume la responsabilidad del texto antes de publicar) — lo que además reduce el riesgo de afirmaciones engañosas (FTC §5).
- **[OBLIGACIÓN]** En cualquier caso, ajustar el prompt para **no afirmar hechos no verificables** ("verificado", "el mejor", "garantizado"); reformular hacia lenguaje no engañoso.

---

## 5. Derecho a cuestionar el resultado

Cuando el impacto sea significativo (Sistema A que crea borradores) [OBLIGACIÓN/BUENA PRÁCTICA]:
- Permitir **rehacer/deshacer**: el usuario puede descartar el borrador creado y la sugerencia.
- Canal para **reportar** una respuesta incorrecta/dañina de la IA (enlaza con `ai-incident-response.md`).
- Si en el futuro la IA tomara decisiones que caigan bajo el **art. 22 GDPR**, añadir derecho a **intervención humana**, a expresar el punto de vista y a impugnar (arts. 13.2.f/14.2.g/22.3). **[FUTURO condicional]**

---

## 6. Requisitos de implementación (criterios de aceptación)

| # | Requisito | Criterio verificable |
|---|---|---|
| 1 | Aviso de IA visible en el agente | La UI muestra "Asistente con IA" antes del primer mensaje; test E2E lo verifica. |
| 2 | Aviso de IA en el clasificador | La sugerencia de categoría indica origen IA. |
| 3 | Política de IA publicada y enlazada | Página accesible desde el chat y el footer. |
| 4 | Marcado o revisión editorial del Sistema E | Toda descripción generada lleva badge de IA **o** pasa por edición del prestador antes de publicar. |
| 5 | Advertencia de no compartir datos sensibles | Texto presente en la UI del chat. |
| 6 | Deshacer/reportar resultado de IA | Botón/enlace funcional; el borrador es descartable. |

---

## 7. Decisiones de negocio pendientes

- **[[DECISION REQUIRED]]** ¿Aviso de IA **global** (todos los países) o solo `/es` + Utah? (Recomendado: global.)
- **[[DECISION REQUIRED]]** Para el Sistema E: ¿marcado de IA o revisión editorial humana obligatoria?
- **[[DECISION REQUIRED]]** Redacción final del aviso y de la Política de IA (Fase 14, `legal-documents/`), pendiente de datos de Q1 (entidad) y Q4 (proveedor).
