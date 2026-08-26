# accessibility-and-content/03 — No discriminación, sesgo y controles (Fase 13)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con dos integraciones de IA (Gemini 2.5 Flash).
- **Fecha de corte / ejecución:** 2026-07-23
- **Versión:** 0.1 (borrador de investigación técnico-jurídica).
- **Insumos previos:** `../01-scope-assumptions-and-open-questions.md`, `../02-product-and-data-map.md`, `../03-legal-entity-and-role-map.md` (roles), `../country-analysis/spain-eu.md` §4.2/§5 (art. 22 GDPR, AI Act), `../country-analysis/united-states-federal.md` (FCRA/NYC LL144 — **no se repite**).

> **Aviso.** Documento de investigación, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción. Marcadores: **[HECHO]** (evidencia archivo:línea), **[INFERENCIA]**, **[SUPUESTO]**, **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**.

---

## 0. Encuadre: los prestadores son independientes, NO empleados

**[HECHO — confirmado en expediente]** Hireeo es un **intermediario de descubrimiento y contacto**; los prestadores tienen el rol `PROVIDER` ("Professional"), publican sus propios servicios y son responsables de su contenido (`../03-legal-entity-and-role-map.md` §2, §4; `marketplace/01`). **No** hay relación laboral ni Hireeo actúa como empleador. En consecuencia:

- **No** aplica automáticamente la normativa antidiscriminación **laboral/de empleo** (p. ej. NYC Local Law 144 sobre AEDT en contratación, ni FCRA para decisiones de empleo — `../country-analysis/united-states-federal.md` confirma que el marketplace **no** es plataforma de empleo).
- **Sí** aplican, en cambio: (i) el principio de **no discriminación en el acceso a bienes y servicios** (consumo/igualdad), (ii) la **transparencia de ranking** del DSA/consumo y P2B (relación B2B con prestadores), y (iii) el **AI Act / art. 22 GDPR** en la medida en que decisiones automatizadas afecten a personas.

**Reserva [SUPUESTO/HIGH]:** el marketplace **da acceso a oportunidades económicas** a los prestadores. Si el ranking, la suspensión o la verificación llegaran a **determinar de forma automatizada y determinante** ese acceso, debe reabrirse el análisis de alto riesgo del AI Act (Anexo III) y de discriminación — hoy no se alcanza ese umbral (ver §5). No atribuir a Hireeo estatus de empleador que no está confirmado.

---

## 1. Superficies de decisión analizadas (dónde puede entrar sesgo)

| Superficie | ¿Automatizada? | Evidencia | Riesgo de sesgo |
|---|---|---|---|
| **Ranking de resultados de búsqueda** | Sí, determinista | `backend/src/modules/services/services.service.ts:80` | **ALTO** (ver R-01) |
| **Recomendación del agente de IA** | Sí, IA + query determinista | `ai-agents.service.ts:45-70`; `tools/services.tool.ts:5-32` | **ALTO** (ver R-02) |
| **Insignia "TopPro"** | Sí, umbral fijo | `services.service.ts:113,172` | MEDIO (ver R-03) |
| **Destacado / "featured" (de pago)** | Sí, comercial | `services.service.ts:392-407`; `escrow`/`PremiumPrice` | MEDIO (ver R-01) |
| **Precios** | No algorítmico | precio lo fija el prestador (`Service.price`) | BAJO |
| **Suspensión / verificación (KYC)** | Manual + KYC stub | `kyc.service.ts` (stub); moderación SuperAdmin | MEDIO (ver R-04) |
| **Moderación de reseñas** | Manual (PENDING→ACTIVE) | `Rating.status`; `../02` §3.6 | MEDIO (ver R-04) |

---

## 2. Los DOS riesgos de sesgo más relevantes (detallados)

### R-01 — Ranking prioriza el pago sobre la calidad, sin divulgación — **ALTO**

- **[HECHO]** El orden de resultados es `orderBy: [{ featured: 'desc' }, { averageRating: 'desc' }]` (`services.service.ts:80`). Es decir, **primero** los anuncios **destacados de pago** (`featured`/nivel PREMIUM — `toggleFeatured` fija `level: 'PREMIUM'`, `:392-407`), y **solo dentro de ese bloque** ordena por calificación.
- **Efecto discriminatorio/estructural:** los prestadores que **pueden pagar** el destacado se posicionan por encima de otros mejor calificados pero gratuitos. Esto (i) es **publicidad/posicionamiento pagado no divulgado** como tal al consumidor, y (ii) puede producir **impacto dispar** contra prestadores con menos recursos (frecuentemente correlacionado con factores socioeconómicos protegidos).
- **Norma tocada:** **DSA arts. 26-27** (transparencia de parámetros de ranking y de publicidad — UE), **Directiva de consumidores/Omnibus** (deber de informar cuando el ranking está influido por pago), **P2B Reg. 2019/1150** (parámetros de ranking hacia prestadores empresa), **FTC §5** (posicionamiento patrocinado no divulgado = engañoso — `../country-analysis/united-states-federal.md`). Cruza con `consumer-and-commercial/` y `marketplace/`.
- **Control:** **divulgar** de forma clara que los resultados destacados son pagados (etiqueta "Destacado"/"Ad" visible), publicar los **parámetros principales de ranking**, y evaluar un orden por defecto que no penalice sistemáticamente al no-pagador (p. ej. separar visualmente el bloque pagado del orgánico).

### R-02 — El agente de IA hereda el ranking de pago y solo muestra 3 resultados — **ALTO**

- **[HECHO]** La tool `buscarProveedores` del agente llama a `services.findAll(... limit: 3)` (`tools/services.tool.ts:14-21`), que aplica el **mismo** `orderBy: featured desc, rating desc`. El agente devuelve **solo 3** proveedores "ordenados por calificación" (así lo dice su `description`, pero el orden real antepone el pago) y los presenta como recomendación conversacional (`ai-agents.service.ts:54-57`; prompt `hireeo-system.prompt.ts:3,11-12`).
- **Efecto:** el agente **amplifica** el sesgo de R-01 y lo **opaca**: (i) el usuario recibe una recomendación de IA en lenguaje natural que **parece** basada en mérito ("con nombre y calificación") pero antepone anuncios pagados; (ii) el recorte a **3** resultados reduce drásticamente la visibilidad de prestadores no destacados; (iii) la **categoría** la infiere Gemini (`obtenerCategorias`) a partir de texto libre — una interpretación errónea o sesgada de la categoría puede **excluir sistemáticamente** a prestadores; (iv) la búsqueda se filtra por `localitySlug`, y la localidad puede actuar como **proxy** de nivel socioeconómico/composición demográfica del barrio (riesgo de impacto dispar geográfico).
- **Matiz importante [INFERENCIA]:** el sesgo **no** nace del LLM inventando un ranking — la selección de proveedores es una **query determinista de base de datos**, y el `crearBorradorSolicitud` exige confirmación (`service-requests.tool.ts:7`; prompt regla 4-5). El riesgo está en (a) el orden pagado heredado, (b) el recorte a 3, y (c) la clasificación de categoría por IA. La transparencia de IA (art. 50 AI Act, desde 2026-08-02) y la explicación del rol de la IA son exigibles (`../country-analysis/spain-eu.md` §5).
- **Control:** que la recomendación del agente **declare** cuándo un proveedor es destacado/pagado; **auditar** que el recorte a 3 no excluya sistemáticamente por localidad/categoría; registrar (logging minimizado) las categorías inferidas para medir errores de clasificación; mantener el `guardrail` anti-alucinación ya presente (`hireeo-system.prompt.ts:18`).

### Otros riesgos (síntesis)

- **R-03 — "TopPro" con umbral fijo (entrenchment):** `isTopPro = averageRating >= 4.5 && totalRatings >= 10` (`services.service.ts:113,172`). Un prestador **nuevo** o de bajo volumen **nunca** puede obtener la insignia, aunque su calidad sea alta (**cold-start bias**). Genera un bucle de retroalimentación que favorece a los ya establecidos. **[BUENA PRÁCTICA]** documentar el criterio, considerar una vía para nuevos prestadores y divulgar qué significa la insignia. MEDIO.
- **R-04 — Suspensión / moderación / verificación sin criterios ni apelación documentados:** la moderación de reseñas (`PENDING→ACTIVE` por SuperAdmin) y las suspensiones no tienen criterios objetivos escritos ni mecanismo de apelación en código (`../01` Q12; `../02` §3.6). Decisiones discrecionales sin criterios uniformes pueden derivar en trato desigual. MEDIO — cruza con `marketplace/` (Trust & Safety) y DSA (motivación de restricciones + apelación).

---

## 3. Encuadre jurídico de la no discriminación

| Vector | Norma | Aplicabilidad a Hireeo | Fuente |
|---|---|---|---|
| **Transparencia de ranking (consumidor)** | DSA arts. 26-27; Dir. consumidores/Omnibus | Debe divulgar ranking pagado y parámetros | `marketplace/01`; `../country-analysis/spain-eu.md` |
| **Ranking hacia prestadores empresa** | P2B Reg. (UE) 2019/1150 | Parámetros de ranking + preaviso de cambios + reclamación interna | `../country-analysis/spain-eu.md` §13 |
| **Decisiones automatizadas** | GDPR **art. 22** + profiling (art. 4.4) | Ranking/recom. IA = perfilado ligero; hoy con intervención humana (confirmación) → fuera del 22 estricto | `../country-analysis/spain-eu.md` §4.2 |
| **IA — clasificación de riesgo** | AI Act (Reg. 2024/1689) | Riesgo **limitado** (transparencia art. 50); **no** alto riesgo hoy | `../country-analysis/spain-eu.md` §5.2 |
| **Prácticas engañosas** | FTC §5 (US) | Posicionamiento pagado no divulgado / recomendación IA no sustentada | `../country-analysis/united-states-federal.md` |
| **NO aplica** | NYC LL144 / FCRA empleo | Hireeo **no** es plataforma de empleo | `../country-analysis/united-states-federal.md` |
| **[SUPUESTO]** IA/ADMT estatal US, sesgo | Leyes estatales de IA/decisiones automatizadas | Reevaluar si ranking determina acceso económico | `../country-analysis/united-states-state-local-matrix.md` |

---

## 4. Controles de no discriminación, auditoría y apelación (marco propuesto)

### 4.1 Diseño / prevención
- **Divulgación de ranking pagado:** etiqueta visible "Destacado" y explicación de parámetros de ranking (DSA/consumo/P2B). Prerrequisito para R-01 y R-02.
- **Separar orgánico de pagado:** que el bloque pagado no se confunda con mérito.
- **Criterios objetivos y escritos** para suspensión/verificación/moderación (evita discrecionalidad — R-04).
- **Minimización de proxies:** revisar que localidad/categoría no produzcan impacto dispar; no usar atributos protegidos ni sus proxies como criterio de ranking.

### 4.2 Auditoría periódica de sesgo [BUENA PRÁCTICA / control AI Act no sustituible por disclaimer]
- Medir la **distribución de visibilidad**: qué fracción de impresiones/recomendaciones capturan los prestadores destacados vs. orgánicos, por localidad y categoría.
- Medir **tasa de acierto de clasificación de categoría** del agente (falsos negativos que excluyen prestadores).
- Revisión **trimestral** documentada; versionado de prompt/modelo (`ai/` Fase 6).

### 4.3 Explicación y apelación
- **Explicar el rol de la IA** al usuario (art. 50 AI Act desde 2026-08-02) y que la recomendación no es exhaustiva.
- **Mecanismo de apelación** para prestadores ante suspensión, retirada o cambio de ranking que les afecte (DSA motivación + P2B reclamación interna): canal, plazo, revisión **humana**, y registro.
- **Intervención humana significativa** mantenida en la creación de solicitudes (ya presente — `service-requests.tool.ts:7`).

---

## 5. Clasificación de riesgo AI Act — confirmación (no alto riesgo hoy)

Coherente con `../country-analysis/spain-eu.md` §5.2: los dos sistemas de IA son de **riesgo limitado (transparencia art. 50)**, **no** Anexo III. El agente de *matching* de servicios y el clasificador de categorías **no** evalúan elegibilidad a servicios esenciales ni toman decisiones de empleo. **Reabrir la clasificación** si el ranking/recomendación pasa a **determinar de forma automatizada y determinante** el acceso de un prestador a oportunidades económicas o el precio (podría rozar Anexo III empleo/servicios esenciales según diseño). `[[DECISION REQUIRED]]` confirmar el grado real de autonomía y determinación del agente (ES-3 / M4 de `marketplace/01`).

---

## 6. Matriz: obligación → evidencia → propietario → prioridad → fecha objetivo

| # | Acción | Norma | Evidencia repo | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|---|---|
| 1 | Divulgar ranking pagado + parámetros; separar orgánico/pagado | DSA 26-27 / Omnibus / P2B / FTC §5 | `services.service.ts:80,392-407` | Legal + Product + Eng | **P1** | Pre-lanzamiento |
| 2 | Que el agente IA declare proveedores destacados y explique el rol de IA | AI Act art. 50 / FTC §5 | `services.tool.ts:14-21`; `ai-agents.service.ts:54-57` | Product + Eng | **P1** (art. 50 → 2026-08-02) | Pre-lanzamiento |
| 3 | Auditoría de distribución de visibilidad por localidad/categoría | AI Act (gestión de sesgo) | R-01/R-02 | Data + Product | P2 | Pre-lanzamiento + trimestral |
| 4 | Documentar/ajustar criterio "TopPro" (cold-start) | Transparencia / no discriminación | `services.service.ts:113` | Product | P2 | Pre-lanzamiento |
| 5 | Criterios escritos + apelación para suspensión/moderación | DSA / P2B | sin criterios (Q12) | Trust & Safety + Legal | P2 | Pre-lanzamiento |
| 6 | Confirmar grado de autonomía del agente (reclasificación AI Act) | AI Act / art. 22 GDPR | `ai-agents.service.ts:45-70` | Product + Legal | P1 | Pre-lanzamiento |

---

## 7. Preguntas abiertas / decisiones requeridas

- `[[DECISION REQUIRED]]` ¿Se mantiene el ranking que antepone el pago a la calificación, con divulgación, o se rediseña el orden por defecto? Decisión de producto con impacto legal (DSA/consumo).
- `[[DECISION REQUIRED]]` Grado de autonomía/determinación del agente de IA (confirma clasificación AI Act y art. 22 GDPR).
- **[SUPUESTO]** ¿El recorte a 3 resultados del agente es configurable/ampliable para reducir exclusión? (`services.tool.ts:19`).
- **[SUPUESTO]** Reevaluar leyes estatales US de ADMT/sesgo si el ranking determina acceso económico (`../country-analysis/united-states-state-local-matrix.md`).

---

## 8. Revisión por abogado local pendiente

Validar antes de publicar: alcance del deber de transparencia de ranking (DSA/Omnibus/P2B) y su divulgación mínima; encuadre exacto del perfilado bajo art. 22 GDPR según el grado de intervención humana confirmado; aplicabilidad de leyes estatales US de IA/ADMT; y que ningún control atribuya a Hireeo estatus de empleador. No presentar la auditoría de sesgo como certificación de ausencia de discriminación sin métricas ejecutadas.
