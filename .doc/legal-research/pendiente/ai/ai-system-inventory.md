# ai/ai-system-inventory — Inventario de sistemas de IA (Fase 6.1)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA de Google Gemini 2.5 Flash.
- **Fecha de corte:** 2026-07-23
- **Versión:** 0.1 (borrador de descubrimiento)
- **Método:** inspección no destructiva del código (`backend/src/modules/ai-agents`, `backend/src/modules/chatbot`, `frontend/src/shared/lib/ai`, `frontend/src/features/services/actions`). No se modificó código.
- **Insumos:** `01-scope-assumptions-and-open-questions.md`, `02-product-and-data-map.md`, `code-audit/00-repository-inventory.md` §5.2, `country-analysis/spain-eu.md` §5.

> **Aviso.** Documento técnico de auditoría, no asesoramiento legal. Se distingue **[HECHO]** (evidencia en repo), **[INFERENCIA]** técnica, **[SUPUESTO]** pendiente, **[OBLIGACIÓN]** vigente, **[FUTURO]** con fecha posterior, **[GUÍA]** no vinculante y **[BUENA PRÁCTICA]**. La clasificación jurídica se desarrolla en `ai-classification-and-risk-assessment.md`.

---

## 0. Resumen del hallazgo

El *briefing* de la tarea describe **dos** sistemas de IA. La inspección del código confirma esos dos como los sistemas **primarios** con impacto sobre el usuario, pero también revela **funciones de IA adicionales en el frontend** que comparten el mismo modelo (Gemini 2.5 Flash) y la misma API key. Siguiendo el estándar del megaprompt (priorizar la evidencia del código), este inventario documenta **la superficie completa de IA**, agrupada así:

| Grupo | Sistema | Ubicación | Escribe en DB / actúa | Interactúa con persona |
|---|---|---|---|---|
| **A — Primario** | `ai-agents` (agente conversacional con *tools*) | backend | **Sí** (crea `ServiceRequest` + `Quote`) | Sí |
| **B — Primario** | `chatbot` (clasificador de categoría) | backend | No | Sí (vía UI) |
| **C — Secundario** | `detectarCategoriaChatbot` (clasificador duplicado) | frontend Server Action | No | Sí |
| **D — Secundario** | `getSmartServiceSuggestion` (asistente de búsqueda) | frontend Server Action | No | Sí |
| **E — Secundario** | `generateServiceDescription` (redacción SEO) | frontend Server Action | No (texto que el prestador publica) | Sí (prestador) |
| **F — Secundario** | `matchServiceCategory` (matchmaking) | frontend Server Action | No | Sí (indirecto) |

> **[HECHO]** Los seis usan `gemini-2.5-flash`. Backend `ai-agents` usa `@ai-sdk/google` (`ai-agents.service.ts:3-4,29`); backend `chatbot` usa `@google/generative-ai` (`chatbot.service.ts:3,34`); el frontend usa `@google/genai` (`geminiService.ts:1`, `matchmaking.ts:3`). Tres SDKs distintos, dos formas de gestión de la API key (DB cifrada vs. `process.env`). **[INFERENCIA]** Esto es fragmentación de gobernanza, no dos sistemas aislados.

---

## 1. Sistema A — `ai-agents` (agente conversacional con herramientas)

| Campo | Detalle | Evidencia |
|---|---|---|
| **Nombre interno** | `AiAgentsService` / módulo `ai-agents` | `backend/src/modules/ai-agents/ai-agents.service.ts:18` |
| **Finalidad** | Asistente conversacional que ayuda al usuario a encontrar un prestador y, tras confirmación, **crea un borrador de solicitud de servicio** (`ServiceRequest` en estado `DRAFT`) y un `Quote` vinculado. | `ai-agents.service.ts:41-70`; `service-requests.tool.ts:21-44` |
| **Usuario afectado** | Cliente autenticado (la tool de escritura solo se registra si hay `userId`). Visitante anónimo puede conversar sin la tool de escritura. | `ai-agents.service.ts:32-38` |
| **Proveedor / modelo** | Google **Gemini 2.5 Flash** (GPAI de terceros) vía Vercel AI SDK (`@ai-sdk/google`). | `ai-agents.service.ts:3-4,29` |
| **Rol de Hireeo (AI Act)** | **Desplegador** ("deployer") del modelo GPAI; operador que pone en servicio un **sistema de IA compuesto** (system prompt + tools). No es proveedor del modelo (lo es Google). Ver `ai-classification-and-risk-assessment.md`. | `spain-eu.md` §5.1 |
| **Entradas** | Texto libre del usuario (`mensaje`, 3–500 chars); `countryCode`; `localitySlug`; `userId`; **historial de conversación** completo (`historial`). | `agent-chat.dto.ts:8-27`; `ai-agents.service.ts:42,48` |
| **Salidas** | Texto conversacional; lista de hasta 3 proveedores; `borradorId` (ID del `ServiceRequest` creado); campo `accion` inferido. | `ai-agents.service.ts:64-69` |
| **Datos personales / sensibles** | El texto libre y el historial **pueden contener** nombre, dirección, teléfono, descripción del problema del hogar; se propaga `userId`. No hay minimización ni redacción antes de enviarlo a Google. | `code-audit/00-repository-inventory.md` §5.2 [MEDIUM]; `ai-agents.service.ts:48` |
| **Herramientas / acciones** | 4 tools: `obtenerCategorias` (lee catálogo), `buscarProveedores` (lee servicios), `buscarLocalidad` (lee geo), **`crearBorradorSolicitud` (ESCRIBE en DB: `serviceRequest.create` + `quote.create`)**. | `ai-agents.service.ts:33-38`; `tools/*.ts` |
| **Grado de automatización** | Multi-paso autónomo: `maxSteps: 5`, `temperature: 0.4`. El modelo decide qué tools llamar y en qué orden dentro de esos 5 pasos, incluida la escritura en DB. | `ai-agents.service.ts:50-51,80-81` |
| **Intervención humana actual** | **Solo por instrucción en el prompt**, NO por control de código. El system prompt dice "Usa crearBorradorSolicitud SOLO tras confirmación explícita del usuario" (`hireeo-system.prompt.ts:14`) y la descripción de la tool lo repite (`service-requests.tool.ts:7`), pero **nada en el código valida que la confirmación haya ocurrido**. El `execute` crea el registro sin ninguna verificación de estado de confirmación. | `hireeo-system.prompt.ts:14`; `service-requests.tool.ts:5-46` |
| **Impacto posible** | Creación de solicitudes/cotizaciones no deseadas o fraudulentas; sugerencia sesgada de proveedores; envío de PII a Google; salida alucinada mostrada como recomendación de Hireeo. | Ver `ai-safety-security-and-misuse.md` |
| **Región** | Backend serverless en Vercel; modelo servido por Google (región **no confirmada — Q4/Q5 BLOCKING**). | `01` §B S8, Q5 |
| **Controles positivos presentes** | `JwtAuthGuard` + `@Throttle(10/min, 50/h)` en el controller (`ai-agents.controller.ts:14-15`); reglas anti-alucinación en el prompt ("NUNCA inventes proveedores/calificaciones", `hireeo-system.prompt.ts:18`); validación de slug de categoría contra catálogo real en las tools. | `ai-agents.controller.ts:12-16` |
| **Deuda técnica relevante** | `// @ts-nocheck` al inicio del service y de las tools de escritura → sin verificación de tipos en el camino que escribe en DB. | `ai-agents.service.ts:1`; `service-requests.tool.ts:1` |

### 1.1 Hallazgo clave sobre supervisión humana

> **[HECHO / CRÍTICO]** La "confirmación del usuario" antes de crear un `ServiceRequest` **NO es un control de código**: es únicamente una instrucción en lenguaje natural dentro del system prompt y de la descripción de la tool. El método `execute` de `crearBorradorSolicitud` ejecuta `prisma.serviceRequest.create(...)` y `prisma.quote.create(...)` sin comprobar ningún flag de confirmación, ni token, ni paso de UI intermedio (`service-requests.tool.ts:17-45`). Un modelo que ignore la instrucción (por alucinación, prompt injection o razonamiento erróneo) **creará el registro igualmente**.
>
> **[INFERENCIA]** Esto es lo que en `spain-eu.md` §4.2 y §5.5 se marca como el punto que puede acercar el sistema al **Art. 22 GDPR** y que exige un control técnico real, no un disclaimer. Es también el vector de *tool abuse* de `ai-safety-security-and-misuse.md`.

---

## 2. Sistema B — `chatbot` (clasificador de categoría, backend)

| Campo | Detalle | Evidencia |
|---|---|---|
| **Nombre interno** | `ChatbotService` / módulo `chatbot` | `backend/src/modules/chatbot/chatbot.service.ts:26` |
| **Finalidad** | Clasificar la necesidad descrita por el usuario en texto libre hacia **una categoría de servicio del catálogo** (devuelve slug + nombre + frase de confirmación). | `chatbot.service.ts:37-112` |
| **Usuario afectado** | Cualquier usuario (el controller expone el endpoint; `JwtAuthGuard` según `code-audit` §5.2 INFO). | `chatbot.controller.ts` |
| **Proveedor / modelo** | Google **Gemini 2.5 Flash** vía `@google/generative-ai`. | `chatbot.service.ts:3,45-46` |
| **Rol de Hireeo** | **Desplegador**. Función de clasificación. | `spain-eu.md` §5.1 |
| **Entradas** | `mensaje` (texto libre) + `countryCode`; se inyecta el listado de categorías reales. | `chatbot.service.ts:38,52-63` |
| **Salidas** | JSON estructurado: `categoriaSlug`, `categoriaNombre`, `mensaje`, flags `sinProveedores`/`otros`. | `chatbot.service.ts:95-105` |
| **Datos personales** | El texto libre puede contener PII; se envía a Google. No hay minimización. | `chatbot.service.ts:56` |
| **Grado de automatización** | Una sola llamada, `temperature: 0.4`, `responseMimeType: application/json`. **No escribe en DB.** | `chatbot.service.ts:66-69` |
| **Intervención humana** | El resultado es una **sugerencia de navegación** (qué categoría buscar); el usuario decide. Bajo impacto. | `chatbot.service.ts:95-105` |
| **Control anti-alucinación** | **Fuerte:** valida que el slug devuelto exista en el catálogo real; si no, devuelve error (`chatbot.service.ts:85-88`). | `chatbot.service.ts:85-88` |
| **Gestión de credenciales** | **Inconsistente:** lee `GEMINI_API_KEY` de `process.env` vía `ConfigService` (`chatbot.service.ts:33`), mientras que `ai-agents` la lee del almacén cifrado en DB. | `chatbot.service.ts:33` vs `ai-agents.service.ts:28` |

---

## 3. Sistemas secundarios de IA (frontend) — mismo modelo, misma API key

> **[HECHO]** Estas funciones viven en el frontend (`@google/genai`) y leen `process.env.GEMINI_API_KEY`. El `code-audit` §5.2 las marca **[HIGH · VT/IJ] Server Actions de IA sin autenticación ni throttling**: son invocables por cualquiera y llaman a Gemini con input de usuario, a diferencia de los endpoints backend que sí tienen `JwtAuthGuard` + throttling.

### 3.1 Sistema C — `detectarCategoriaChatbot`
- **Finalidad:** clasificador de categoría (duplica al Sistema B, con prompt más rico y ejemplos por país). `geminiService.ts:77-143`.
- **Salida validada** contra catálogo real (`geminiService.ts:133-134`) → anti-alucinación presente.
- **Interacción con persona:** sí (UI de chat). **[INFERENCIA]** activa transparencia Art. 50 igual que B.

### 3.2 Sistema D — `getSmartServiceSuggestion`
- **Finalidad:** asistente de búsqueda que devuelve **texto libre** sugiriendo qué profesional necesita el usuario. `geminiService.ts:183-203`.
- **Riesgo:** salida de **texto libre mostrada al usuario sin validación ni moderación** → vector de alucinación / contenido dañino (`code-audit` §5.2 [HIGH]). Sin `safetySettings`.

### 3.3 Sistema E — `generateServiceDescription`
- **Finalidad:** genera **descripción SEO de 200+ palabras** que el **prestador publica** en su perfil de servicio. `geminiService.ts:212-273`.
- **Relevancia legal:** contenido **sintético publicado** de cara al público. **[FUTURO/OBLIGACIÓN]** Art. 50.2 AI Act (marcado de contenido generado por IA) y publicidad no engañosa (el texto afirma "calidad", "experiencia", "puntualidad" sobre un prestador que la IA no conoce — `geminiService.ts:233`). Riesgo de afirmaciones no sustentadas atribuibles a Hireeo. Ver `ai-user-transparency.md` §4.
- **Sin verificación de veracidad:** el prompt pide "transmitir confianza y experiencia" sin datos reales del prestador → **[INFERENCIA]** riesgo de práctica engañosa (FTC §5; consumo LatAm/UE).

### 3.4 Sistema F — `matchServiceCategory` (matchmaking)
- **Finalidad:** decide la categoría de resultados a partir de la consulta; con *fallback* a un diccionario de keywords si Gemini no está disponible. `matchmaking.ts:27-72`.
- **Impacto:** determina qué resultados ve el usuario (`code-audit` §5.2 [MEDIUM] decisión automatizada sin disclaimer). Hoy es clasificación, no ranking determinante de contratación.

---

## 4. Datos que viajan al proveedor (Google) — resumen

| Sistema | Payload enviado a Google | Contiene PII potencial | Minimización |
|---|---|---|---|
| A `ai-agents` | mensaje + historial completo + país + localidad (`userId` NO viaja en el prompt de texto, pero sí se usa para la tool) | **Sí** (texto libre + historial) | **Ninguna** |
| B `chatbot` | mensaje + catálogo de categorías + país | Sí (texto libre) | Ninguna |
| C `detectarCategoriaChatbot` | mensaje + catálogo + país | Sí | Ninguna |
| D `getSmartServiceSuggestion` | query libre + país | Sí | Ninguna |
| E `generateServiceDescription` | título + categorías + país | Bajo (datos del anuncio) | N/A |
| F `matchServiceCategory` | query libre | Sí | Ninguna |

> **[SUPUESTO S8 / Q4 — BLOCKING]** No está confirmado contractualmente si Google usa estos inputs/outputs para entrenar sus modelos ni la región de procesamiento. **NO debe afirmarse que Google no entrena con los datos.** Ver `ai-data-and-model-governance.md` §3 y `[[ai-implementation-checklist]]`.

---

## 5. Ausencias notables (búsquedas negativas)

| Búsqueda | Resultado | Conclusión |
|---|---|---|
| `safetySetting` / `HarmCategory` / `moderation` | 0 resultados | Ninguna de las 6 funciones aplica filtros de seguridad de contenido de Gemini. `code-audit` §5.2 [HIGH]. |
| Sanitización / delimitación de input de usuario en el prompt | Ausente | Texto libre concatenado crudo → prompt injection (`chatbot.service.ts:56`; `geminiService.ts:103`; `matchmaking.ts:39`). |
| Logging/persistencia de prompts y outputs de IA | Ausente | Bueno para privacidad, **malo para accountability** (AI Act, trazabilidad de incidentes). |
| Registro de versión de prompt/modelo | Ausente | Sin versionado ni gestión de cambios de prompts. |
| Validación de "confirmación" antes de `crearBorradorSolicitud` | Ausente | Solo instrucción en prompt (§1.1). |

---

## 6. Preguntas abiertas específicas de IA

| ID | Pregunta | Bloquea | Prioridad |
|---|---|---|---|
| AI-1 | ¿El contrato/DPA con Google (Gemini) prohíbe el entrenamiento con inputs/outputs y define región y subprocesadores? (= Q4) | Transferencias, AI Act GPAI, minimización | **BLOCKING** |
| AI-2 | ¿El agente `ai-agents` debe exigir confirmación humana **por código** antes de crear un `ServiceRequest`? | Art. 22 GDPR; tool abuse | **HIGH** |
| AI-3 | ¿Se consolidarán los 3 SDKs y la gestión de la API key en un único punto gobernado? | Seguridad, gobernanza | HIGH |
| AI-4 | ¿La descripción SEO generada (Sistema E) se marcará como generada por IA y se revisará editorialmente? | Art. 50.2; publicidad engañosa | HIGH |
| AI-5 | ¿Se aplicarán `safetySettings` y moderación de output a las salidas de texto libre (A, D, E)? | Contenido dañino | HIGH |

---

## 7. Registro de evidencia (repo)

| ID | Archivo:línea | Observación |
|---|---|---|
| AI-E01 | `ai-agents.service.ts:27-52` | Modelo Gemini 2.5 Flash, key desde DB, tools, `maxSteps:5` |
| AI-E02 | `ai-agents.service.ts:32-38` | Registro condicional de la tool de escritura según `userId` |
| AI-E03 | `service-requests.tool.ts:17-45` | `execute` crea `ServiceRequest`+`Quote` sin validar confirmación |
| AI-E04 | `hireeo-system.prompt.ts:14,18` | Confirmación e instrucciones anti-alucinación solo en prompt |
| AI-E05 | `ai-agents.controller.ts:14-15` | `JwtAuthGuard` + throttling (control positivo) |
| AI-E06 | `chatbot.service.ts:33` | API key desde `process.env` (inconsistencia con A) |
| AI-E07 | `chatbot.service.ts:85-88` | Validación de slug contra catálogo (anti-alucinación) |
| AI-E08 | `geminiService.ts:183-203` | Salida de texto libre sin validación (Sistema D) |
| AI-E09 | `geminiService.ts:212-273` | Generación de contenido publicado por el prestador (Sistema E) |
| AI-E10 | `matchmaking.ts:6,27-72` | Server Action sin auth; matchmaking con fallback keyword |
