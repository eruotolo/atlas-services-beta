# ai/ai-data-and-model-governance — Gobernanza de datos y modelo (Fase 6.2)

- **Fecha:** 2026-07-23 · **Versión:** 0.1
- **Insumos:** `ai-system-inventory.md` §4, `02-product-and-data-map.md` §3.12, `code-audit/00-repository-inventory.md` §5.2.

> Etiquetas: **[HECHO]**, **[INFERENCIA]**, **[SUPUESTO]**, **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**, **[[DECISION REQUIRED]]**.
> **Regla del megaprompt:** no afirmar que Google no entrena con los datos si el contrato no lo confirma. Aquí se marca como **pregunta abierta**.

---

## 1. Qué datos viajan al modelo (verificado en código)

| Sistema | Payload real enviado a Gemini | PII potencial | Evidencia |
|---|---|---|---|
| A `ai-agents` | `mensaje` (texto libre 3–500) + **historial completo** de la conversación + `countryCode` + `localitySlug` | **Alta** (el usuario puede escribir nombre, dirección, teléfono, detalle del problema) | `ai-agents.service.ts:42,48` |
| B `chatbot` | `mensaje` libre + listado de categorías + `countryCode` | Media | `chatbot.service.ts:52-63` |
| C `detectarCategoriaChatbot` | `mensaje` libre + listado + país | Media | `geminiService.ts:86-111` |
| D `getSmartServiceSuggestion` | `query` libre + país | Media | `geminiService.ts:187` |
| E `generateServiceDescription` | `título` + `categorías` + país (datos del anuncio, no del cliente) | Baja | `geminiService.ts:222-242` |
| F `matchServiceCategory` | `query` libre | Media | `matchmaking.ts:36-42` |

> **[HECHO]** No existe **ninguna capa de minimización, redacción ni delimitación** del input antes de enviarlo a Google (búsqueda negativa `safetySetting|sanitiz|redact` = 0). El `userId` **no** se concatena en el texto del prompt del Sistema A, pero sí se usa para la tool de escritura (`ai-agents.service.ts:37,42`).

> **[HECHO]** No se persisten prompts, outputs ni embeddings propios (`02` §3.12; `code-audit` §5.2 [LOW]). Bueno para minimización; **malo para accountability/trazabilidad** de incidentes (AI Act, responsabilidad proactiva LatAm).

---

## 2. Principios de datos aplicados a la IA

| Principio | Estado actual | Acción |
|---|---|---|
| **Minimización** (GDPR 5.1.c; 18.331; 25.326) | **Incumplido**: texto libre + historial completo sin filtrado. | Redactar/limitar PII antes de enviar; enviar solo lo necesario para clasificar. **[OBLIGACIÓN]** |
| **Limitación de finalidad** | Sin declaración; uso inferido. | Declarar finalidad de cada envío en el aviso y la política. **[OBLIGACIÓN]** |
| **Exactitud / procedencia** | Datos de catálogo reales (categorías/servicios) validados contra DB (anti-alucinación en B, C). | Mantener validación de salida contra fuentes reales en A, F. **[BUENA PRÁCTICA]** |
| **Licitud del input** | Base jurídica del envío a un subprocesador no documentada. | Base 6.1.b/6.1.f + aviso arts. 13-14; DPA con Google. **[OBLIGACIÓN]** |
| **Seguridad** (GDPR 32) | Input sin sanitizar; Server Actions sin auth. | Ver `ai-safety-security-and-misuse.md`. **[OBLIGACIÓN]** |
| **Trazabilidad** | Sin logs de IA. | Logging **minimizado y protegido** de decisiones materiales (tool calls que escriben en DB), no del contenido completo. **[BUENA PRÁCTICA]** |

---

## 3. Relación con el proveedor del modelo (Google Gemini) — PREGUNTA ABIERTA CENTRAL

> **[SUPUESTO S8 / Q4 / AI-1 — BLOCKING]** No hay contrato ni DPA de Google en el repositorio. **NO se puede afirmar** que Google:
> - no usa los inputs/outputs para **entrenar** o mejorar sus modelos;
> - procesa los datos en una **región** determinada (UE / EE. UU. / global);
> - no emplea **subprocesadores** adicionales;
> - ofrece garantías de **retención** y borrado.

**[[DECISION REQUIRED]]** Confirmar y adjuntar:
1. **DPA / Data Processing Addendum** con Google (Gemini API / Vertex AI / AI Studio — **verificar cuál se usa**, porque las condiciones de entrenamiento difieren: la API de pago vs. AI Studio gratuito tienen políticas distintas de uso de datos).
2. Cláusula expresa sobre **entrenamiento con inputs/outputs** (prohibición o consentimiento).
3. **Ubicación/región** de procesamiento y almacenamiento.
4. **Subprocesadores** y notificación de cambios.
5. **SCC + TIA** para la transferencia a EE. UU. (Google LLC) — coordinar con `spain-eu.md` §4.4 (DPF + SCC de respaldo).
6. Condiciones de **cambio de versión del modelo** (`gemini-2.5-flash` puede ser deprecado) y su impacto en comportamiento/regresión.

> **[INFERENCIA / riesgo material]** El uso de `process.env.GEMINI_API_KEY` directo (chatbot y frontend) sugiere posible uso de la **Gemini API de AI Studio** más que de Vertex AI con contrato enterprise. Bajo los términos gratuitos/estándar de AI Studio, Google **puede** usar los prompts para mejorar sus productos. **Esto debe verificarse con urgencia** porque cambiaría la evaluación de minimización, transferencias y entrenamiento. **No asumir el resultado.**

---

## 4. Calidad, sesgo y robustez (pruebas)

> No hay evidencia de pruebas de calidad/sesgo (búsqueda negativa). Programa mínimo **[BUENA PRÁCTICA, exigido por gobernanza para desplegador]**:

| Prueba | Qué medir | Sistemas | Periodicidad |
|---|---|---|---|
| **Exactitud de clasificación** | % de mensajes correctamente mapeados a categoría real | B, C, F | Antes de lanzar + al cambiar prompt/modelo |
| **Alucinación** | ¿Inventa proveedores/categorías/datos? (guardrail ya en prompts, verificar cobertura) | A, B, C, D | Antes de lanzar + trimestral |
| **Sesgo** | ¿Sesga sugerencias por género/origen del nombre del prestador o del usuario? | A, F | Antes de lanzar + trimestral |
| **Robustez multilingüe** | Comportamiento en es-CL/AR/UY/ES y es-US (los prompts ya distinguen locale) | A–F | Antes de lanzar |
| **Regresión** | Cambios de comportamiento al actualizar `gemini-2.5-flash` | Todos | Ante cada cambio de versión |
| **Prompt injection** | Ver `ai-safety-security-and-misuse.md` | A–F | Antes de lanzar + trimestral |

Definir **umbrales de aceptación** por prueba y registrar resultados en el AI Decision Log.

---

## 5. Versionado y gestión de cambios

- **[HECHO]** No hay versionado de prompts (`hireeo-system.prompt.ts`, prompts inline en frontend) ni fijación explícita de versión de modelo más allá del string `gemini-2.5-flash`.
- **[BUENA PRÁCTICA]:**
  - Versionar los prompts en el repo con changelog (ya están en código; añadir versión semántica y fecha).
  - Fijar y registrar la versión exacta del modelo; suscribirse a los avisos de deprecación de Google.
  - Plan de **rollback** de prompt/modelo ante regresión detectada.
  - Consolidar los **3 SDKs** (`@ai-sdk/google`, `@google/generative-ai`, `@google/genai`) para reducir superficie y unificar la gobernanza de la key (AI-3).

---

## 6. Decisiones de negocio pendientes

- **[[DECISION REQUIRED]]** Qué producto de Google se usa (Vertex AI vs. Gemini API/AI Studio) y sus términos de entrenamiento — determina S8/Q4.
- **[[DECISION REQUIRED]]** Si se implementa una capa de **minimización/redacción** de PII antes de enviar al modelo.
- **[[DECISION REQUIRED]]** Política de **logging de IA**: qué se registra (metadatos de tool calls sí; contenido completo no) y su retención.
- **[[DECISION REQUIRED]]** Consolidación de SDKs y gestión centralizada de la API key.
