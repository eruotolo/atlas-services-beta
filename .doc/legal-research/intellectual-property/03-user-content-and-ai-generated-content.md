# 03 — Contenido de usuarios y contenido generado por IA (Fase 9)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA.
- **Fecha:** 2026-07-23
- **Versión:** 0.1
- **Alcance:** (1) licencia del contenido subido por usuarios a Hireeo y derecho a moderar/sublicenciar; (2) derechos de input/output del contenido generado por IA (Google Gemini). La transparencia de IA bajo AI Act Art. 50 se analiza en [`../country-analysis/spain-eu.md`](../country-analysis/spain-eu.md) — aquí solo se referencia. El scraping/anti-abuso se referencia a [`../security/security-and-privacy-controls-gap.md`](../security/security-and-privacy-controls-gap.md).

> **Aviso.** Investigación técnica, no asesoramiento legal. Se distingue hecho / inferencia / supuesto / obligación.

---

## A. Contenido subido por usuarios (UGC)

### A.1 Qué contenido suben los usuarios (hecho confirmado)

| Tipo de UGC | Modelo/campo | Evidencia |
|---|---|---|
| Perfiles y anuncios de servicio (título, descripción, precio, contacto, redes) | `Service` | `backend/prisma/schema.prisma:241-289` |
| Imágenes de servicios y avatar (Cloudinary) | `Service.images[]`, `User.avatar` | `upload.service.ts:14-62`; `schema.prisma` |
| Reseñas y respuesta del dueño | `Rating{comment, ownerResponse, status}` | `schema.prisma:291-310` |
| Mensajes privados cliente↔prestador | `Message.text` | `schema.prisma:430-465` |
| Solicitudes/cotizaciones | `ServiceRequest.description`, `Quote.message` | `schema.prisma:469-505` |

### A.2 Brecha BLOCKING — los Términos actuales NO otorgan licencia sobre el UGC

**Hecho confirmado:** los Términos y Condiciones vigentes en el repo (servidos desde i18n) **no contienen** ninguna cláusula de licencia de contenido de usuarios a Hireeo, ni representación de titularidad de derechos, ni derecho a sublicenciar para operar, ni plazo post-terminación. Tampoco hay sección de propiedad intelectual.

| ID | Archivo:línea | Fragmento | Conclusión |
|---|---|---|---|
| UGC-01 | `frontend/src/lib/i18n/locales/cl.json` (pages.terminos) | Secciones: 1 Aceptación, 2 Naturaleza, 3 Premium, 4 Obligaciones, 5 Limitación de responsabilidad, 6 Modificaciones, 7 Ley y contacto | **No hay** cláusula de licencia de UGC ni de IP. |
| UGC-02 | idem, §2 "Naturaleza del servicio" | *"Hireeo es un directorio digital... **No somos intermediarios, no participamos en los contratos, no cobramos comisiones** por trabajos ni garantizamos la calidad..."* | **Contradice** el código: existe escrow con **comisión 15%** (`escrow.service.ts:8`, aunque MOCK) y flujos de intermediación (mensajería, solicitudes, cotizaciones). Ver [`../01-scope-assumptions-and-open-questions.md`](../01-scope-assumptions-and-open-questions.md) E-10. |
| UGC-03 | idem, §4 "Obligaciones" | *"No publicar contenido ilegal, fraudulento o que vulnere derechos de terceros."* | Impone deber al usuario, pero **no** obtiene de él la representación/garantía de titularidad ni la licencia para que Hireeo aloje/muestre/modere el contenido. |

**Riesgo:** sin una licencia expresa del usuario, Hireeo aloja, transforma (Cloudinary re-encodea a webp — `upload.service.ts:50`), muestra públicamente y modera contenido **sin base contractual clara** para hacerlo. Esto es especialmente sensible para: (a) imágenes (derecho de autor del prestador o de terceros fotografiados); (b) reseñas moderadas (transición `PENDING→ACTIVE` por SuperAdmin); (c) la creación de borradores por IA a partir del input del usuario.

**[[DECISION REQUIRED]]** Redactar (en Fase 14) una cláusula de licencia de UGC que sea **proporcional, no exclusiva, mundial, revocable al eliminar el contenido, limitada a operar/promocionar la plataforma**, con: (i) representación y garantía del usuario de que tiene los derechos; (ii) derecho de Hireeo a moderar/retirar; (iii) derecho a sublicenciar solo a subprocesadores (Cloudinary) para prestar el servicio; (iv) plazo post-terminación acotado (backups/obligaciones legales). **No sobreapropiarse** del contenido (evitar licencias perpetuas/irrevocables/transferibles amplias que en CL/AR/UY/ES/UE se leen como abusivas frente a consumidores).

### A.3 Derecho a moderar (parcialmente soportado en código, sin base en ToS)

- **Hecho confirmado:** existe moderación **previa** de reseñas (nacen `PENDING`, solo `ACTIVE` es público) aprobada por rol ADMIN (`ratings.service.ts:61-78`, `ratings.controller.ts:48-55`).
- **Brecha:** el ToS no informa al usuario de que su reseña será moderada ni bajo qué criterios, ni ofrece **apelación**. La moderación sin trazabilidad del acto administrativo ya está señalada como `LOW` en `00-repository-inventory.md §5.6`. → coordinar con Fase 10 (Trust & Safety) y Fase 7 (reseñas/transparencia).

---

## B. Contenido generado por IA (Google Gemini 2.5 Flash)

### B.1 Sistemas de IA que generan output (hecho confirmado)

Seis usos reales (no stubs), ver `00-repository-inventory.md §5.2`:

| Uso | Genera | Evidencia |
|---|---|---|
| Agente conversacional con tools (crea `ServiceRequest`) | Texto + acción en DB | `backend/src/modules/ai-agents/ai-agents.service.ts:27-52` |
| Clasificador de categoría (chatbot) | Slug de categoría | `backend/src/modules/chatbot/chatbot.service.ts:33,45-49` |
| Matchmaking (elige proveedores mostrados) | Selección de resultados | `frontend/src/features/services/actions/matchmaking.ts` |
| Sugerencia de búsqueda | Texto libre al usuario | `frontend/src/shared/lib/ai/geminiService.ts` |
| Generación de descripciones SEO | Texto publicado | idem |
| Borrador de solicitud | Texto + registro DB | `ai-agents/tools/service-requests.tool.ts:17-46` |

### B.2 Derechos de input/output — Términos vigentes de Google Gemini API

**Fuente primaria:** *Gemini API Additional Terms of Service*, Google — **Effective March 23, 2026; Last updated 2026-04-28** (`https://ai.google.dev/gemini-api/terms`, acceso 2026-07-23). Ver registro en [`../08-source-register.md`].

| Cuestión | Qué dicen los términos (a 2026-07-23) | Implicación para Hireeo |
|---|---|---|
| **Propiedad del output** | Google **no reclama** titularidad sobre el contenido generado ("Google won't claim ownership over that content"). Entre usuario y Google, el output es del usuario/cliente. | Hireeo (o su usuario) puede usar comercialmente el output. **Pero** propiedad ≠ ausencia de infracción (ver B.3). |
| **Indemnidad IP por el output** | **No se aborda** en los Additional Terms de la Gemini API (la API para desarrolladores). La indemnización IP de Google aplica a productos **enterprise** (Vertex AI), **no** a esta API. | Hireeo **no** cuenta con indemnidad de Google si un output infringe IP de un tercero. Riesgo propio. → **[[DECISION REQUIRED]]** evaluar Vertex AI (con indemnidad) o asumir el riesgo con controles. |
| **Uso de datos para entrenamiento** | **Servicios NO pagos:** Google usa prompts y respuestas para mejorar sus productos y modelos. **Servicios pagos:** Google **no** usa prompts/respuestas para entrenar. **Excepción EEE/Suiza/UK:** los términos de "pago" (no entrenamiento) aplican a **todos** los servicios, incluidos los gratuitos. | **BLOCKING (Q4/Q8 de `../01`):** hay que confirmar si Hireeo usa la Gemini API en **tier pago o gratuito**. En tier gratuito **fuera** de EEE (p. ej. CL/AR/UY/US), el input del usuario **alimentaría el entrenamiento de Google** — grave, dado que el input puede contener datos personales (nombre/dirección/teléfono, ver `00-repository-inventory.md §5.2`). |
| **Retención para abuso** | Google registra prompts/respuestas por un periodo limitado para detectar violaciones de la Prohibited Use Policy (documentado en ~55 días en material de Google). | Transferencia y retención por Google que debe reflejarse en aviso de privacidad y en el análisis de transferencias (Fase 4). |

**[[DECISION REQUIRED]]** Confirmar plan (pago vs gratuito) de la Gemini API por entorno y país, y no enviar datos personales al tier gratuito fuera de EEE. Documentar DPA/condiciones con Google (Q9 HIGH de `../01`).

### B.3 Riesgos de IP y de output dañino/alucinado

| Riesgo | Análisis | Evidencia / referencia |
|---|---|---|
| **Infracción de IP en el output** | El output puede reproducir contenido protegido (texto/descripciones). La propiedad reconocida por Google **no** garantiza no-infracción, y **no** hay indemnidad. Hireeo publica descripciones SEO generadas → responsabilidad propia. | B.2; `geminiService.ts` |
| **Alucinación con impacto legal** | El agente puede afirmar hechos falsos sobre prestadores o crear `ServiceRequest` erróneos. Mitigante **parcial**: system prompt "NUNCA inventes proveedores/calificaciones" (`hireeo-system.prompt.ts:18`) + validación de slug contra catálogo. **Pero** un prompt no es un control técnico suficiente. | `00-repository-inventory.md §5.2` |
| **Sin moderación de output ni `safetySettings`** | Cero filtrado de entrada/salida en las 6 funciones (`HarmCategory|safetySetting` = 0 resultados). Output dañino/ilícito se muestra o almacena sin revisión. | `00-repository-inventory.md §5.2 [HIGH]` |
| **Creación de registros sin confirmación validada** | `crearBorradorSolicitud` escribe en DB; la "confirmación del usuario" solo se pide por instrucción en el prompt, **no** se valida en código. | `service-requests.tool.ts:17-46`; `hireeo-system.prompt.ts:14` |
| **Falta de transparencia/atribución de IA** | No hay disclaimer "generado por IA / puede contener errores" en la UI. Obligación de transparencia analizada en **AI Act Art. 50** — ver [`../country-analysis/spain-eu.md`](../country-analysis/spain-eu.md). Aquí solo se referencia; también relevante para publicidad no engañosa (consumo). | `HeroSearchBar.tsx:72`; `ai-agents/tools/services.tool.ts:5-32` |

**Recomendación (no disclaimers como sustituto de control):** un aviso "la IA puede equivocarse" **no** reemplaza (i) `safetySettings`/moderación de output, (ii) validación en código de la confirmación antes de escribir en DB, (iii) supervisión humana en decisiones con impacto (matchmaking). Coordinar con el expediente `ai/` (Fase 6).

### B.4 Voz/imagen, deepfakes, impersonación

- **Hecho:** hoy la IA genera **solo texto**; no hay generación de imágenes ni de voz en el código. Riesgo de deepfakes/voz: **bajo** por ahora.
- **Supuesto:** si se añadiera generación de imágenes/avatares por IA, se activarían derechos de imagen y riesgo de suplantación → reevaluar. Impersonación de prestadores se trata en [`04`](./04-copyright-dmca-and-trademark.md).

---

## C. Scraping y anti-abuso (referencia)

- **Hecho confirmado (referencia):** existen `ApiKeyGuard` global y `ThrottlerModule` (10/s, 100/min) — ver [`../security/security-and-privacy-controls-gap.md`](../security/security-and-privacy-controls-gap.md) y `00-repository-inventory.md §3`. **No se repite** aquí el análisis de seguridad.
- **Ángulo IP/competencia (no cubierto en seguridad):** los perfiles públicos de prestadores (`GET /users/:id` devuelve email/teléfono, `00-repository-inventory.md §5.1`) son **extraíbles masivamente** por cualquier titular de la API key. Desde la óptica de **IP/base de datos**: si Hireeo invierte en compilar el directorio, podría existir un **derecho sui generis de base de datos** (UE) y protección contractual anti-scraping en el ToS. Hoy el ToS **no** contiene cláusula anti-scraping/anti-extracción.
- **[[DECISION REQUIRED]]** Añadir en ToS (Fase 14) cláusulas razonables anti-scraping/anti-extracción y límites de uso de la API, **sin** exceder los límites de competencia (no impedir usos legítimos/interoperabilidad). Cerrar la exposición técnica de PII en perfiles (remite a Fase 11).

---

## D. Matriz obligación → propietario → prioridad

| # | Acción | Propietario | Prioridad |
|---|---|---|---|
| 1 | Redactar cláusula de licencia de UGC (no exclusiva, revocable, para operar) + representación de derechos del usuario | Legal | **BLOCKING** |
| 2 | Corregir contradicción ToS "no intermediarios/no comisiones" vs escrow 15% e intermediación | Legal / Product | **BLOCKING** |
| 3 | Confirmar tier pago/gratuito de Gemini por país; evitar datos personales en tier gratuito fuera de EEE; DPA con Google | Legal / Engineering | **BLOCKING** |
| 4 | Implementar `safetySettings` + moderación de output y validación en código de confirmación antes de escribir en DB | Engineering | HIGH |
| 5 | Disclaimer de IA en UI (coordinar AI Act Art. 50, ver spain-eu.md) | Product / Legal | HIGH |
| 6 | Informar moderación de reseñas + canal de apelación en ToS | Legal / Trust & Safety | MEDIUM |
| 7 | Cláusula anti-scraping razonable + cerrar exposición de PII de perfiles | Legal / Engineering | MEDIUM |

---

## E. Revisión pendiente

Las cláusulas propuestas (licencia de UGC, anti-scraping, avisos de IA) deben redactarse por jurisdicción en Fase 14 y revisarse por abogado local: en CL/AR/UY/ES/UE las licencias amplias de UGC frente a consumidores pueden reputarse abusivas. Confirmar el plan contractual con Google (tier, DPA, región) antes de afirmar cualquier práctica de datos de IA.
