# ai/ai-classification-and-risk-assessment — Clasificación y evaluación de riesgo (Fase 6.1)

- **Fecha de corte / acceso a fuentes:** 2026-07-23
- **Versión:** 0.1
- **Insumos:** `ai-system-inventory.md`, `country-analysis/spain-eu.md` §5, `country-analysis/united-states-federal.md`, `country-analysis/united-states-state-local-matrix.md`.
- **Sistemas evaluados:** A `ai-agents`, B `chatbot`, y secundarios C–F (frontend). Ver inventario.

> **Aviso.** Investigación técnico-jurídica, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción. Etiquetas: **[HECHO]**, **[INFERENCIA]**, **[SUPUESTO]**, **[OBLIGACIÓN]** vigente, **[FUTURO]**, **[GUÍA]** no vinculante, **[BUENA PRÁCTICA]**.

---

## 1. Unión Europea — EU AI Act (tomado como dado de `spain-eu.md` §5)

La clasificación bajo el **Reglamento (UE) 2024/1689** ya está establecida en `country-analysis/spain-eu.md` §5 y **no se repite**; se sintetiza y se construye sobre ella:

| Dimensión | Conclusión (de `spain-eu.md` §5) |
|---|---|
| **Rol de Hireeo** | **Desplegador** ("deployer") de ambos sistemas; Google es el proveedor del modelo GPAI. Vigilar art. 25 (reclasificación a proveedor si Hireeo pone su marca y lo ofrece como sistema propio). |
| **Prácticas prohibidas (art. 5)** | **No aplica** a ninguno. |
| **Alto riesgo (Anexo III)** | **No aplica** a ninguno (no es empleo, ni servicios esenciales, ni biometría). |
| **Riesgo limitado — transparencia (art. 50)** | **Aplica** a A y B (y a C, D por interacción; E por contenido sintético publicado). |
| **Alfabetización IA (art. 4)** | **Ya exigible** desde 2025-02-02 para el equipo que opera los sistemas. |

### 1.1 Fechas de aplicación (de `spain-eu.md` §7)
- **Art. 4 (alfabetización):** VIGENTE (2025-02-02). **[OBLIGACIÓN]**
- **GPAI (Cap. V):** VIGENTE (2025-08-02) — deberes aguas abajo del uso de Gemini. **[OBLIGACIÓN]**
- **Art. 50 (transparencia):** **2026-08-02** — a **10 días** de la fecha de corte. **[FUTURO inminente]**
- **Art. 50.2 marcado en sistemas preexistentes:** 2026-12-02. **[FUTURO]**
- Alto riesgo Anexo III pospuesto a 2027-12-02 (Digital Omnibus) — no aplica a Hireeo hoy.

### 1.2 Construcción sobre el análisis EU: reevaluación obligatoria
> **[SUPUESTO/HIGH — de `spain-eu.md` §5.2]** Si el agente pasara a **filtrar/seleccionar prestadores condicionando su acceso a oportunidades económicas** de forma automatizada y determinante, podría rozar el Anexo III. **[BUENA PRÁCTICA]** Todo cambio de finalidad del Sistema A o F debe disparar una reevaluación de clasificación (control M4; ver `ai-governance-framework.md`).

---

## 2. GDPR Art. 22 y profiling — foco en el Sistema A

> Este es el análisis jurídico **más sensible** del expediente de IA, porque el Sistema A **actúa** (escribe en DB) y su única salvaguarda de confirmación es textual (ver `ai-system-inventory.md` §1.1).

### 2.1 Art. 22 GDPR (decisiones automatizadas)
- **Norma:** Art. 22.1 GDPR prohíbe decisiones **basadas únicamente** en tratamiento automatizado que produzcan **efectos jurídicos o significativos** sobre la persona, salvo excepciones (contrato, consentimiento explícito, autorización legal) con salvaguardas. **[OBLIGACIÓN]**
- **Aplicación a Hireeo [INFERENCIA]:**
  - **Hoy, según el diseño previsto:** el resultado del agente es un **borrador** (`status: DRAFT`) que el usuario debería confirmar → **intervención humana significativa** → en principio **fuera** del art. 22. (Coincide con `spain-eu.md` §4.2.)
  - **Pero [HECHO]:** el código **no garantiza** esa intervención. `crearBorradorSolicitud` crea el registro sin validar confirmación (`service-requests.tool.ts:17-45`). La "significatividad" de crear un `ServiceRequest` + `Quote` a nombre del usuario es discutible pero **no trivial** (compromete al usuario frente a un prestador).
- **Conclusión:** el riesgo art. 22 es **gestionable con un control técnico**: exigir por código la confirmación del usuario. Sin ese control, la defensa "hay revisión humana" es **frágil**. **[OBLIGACIÓN condicional → convertir en control, no en disclaimer]**. Ver `ai-implementation-checklist.md` AI-CHK-03.

### 2.2 Profiling (art. 4.4) y transparencia (arts. 13-14)
- Ranking, `featured`, matchmaking (F) y sugerencia de proveedores (A) implican **perfilado ligero**. **[OBLIGACIÓN]** de informar (arts. 13.2.f / 14.2.g) sobre la existencia de decisiones automatizadas/perfilado y su lógica, y **[BUENA PRÁCTICA]** de un test de interés legítimo (LIA) documentado.
- Envío de PII al modelo sin aviso ni base documentada: `code-audit` §5.2 [MEDIUM]. Debe cubrirse en la política de privacidad y el aviso de IA (`ai-user-transparency.md`).

### 2.3 DPIA (art. 35)
- **[OBLIGACIÓN condicional — muy probable]** (de `spain-eu.md` §4.3): perfilado + geolocalización precisa + IA que interactúa y **actúa** concurren para exigir DPIA **antes del lanzamiento** en `/es`. La DPIA debe cubrir específicamente el Sistema A y el flujo de escritura en DB.

---

## 3. Estados Unidos — federal y estatal (de los archivos US)

### 3.1 Federal (de `united-states-federal.md`)
- **No hay ley federal horizontal de IA vigente** al corte. **[HECHO]**
- **FTC Act §5** (15 USC §45): prohíbe prácticas engañosas/desleales; **aplica al desarrollo, afirmaciones y uso de IA**. **[OBLIGACIÓN]** Relevante para: (i) afirmaciones no sustentadas ("verificado", "mejor", "seguro"); (ii) **la descripción SEO del Sistema E** que afirma calidad/experiencia sin base; (iii) resultados de IA presentados como recomendación propia sin divulgar patrocinio/IA.
- La propuesta FTC sobre "suppression of accuracy" (2026-06-30) es **propuesta/consulta, no obligación** (`united-states-federal.md` [F-02]). **[GUÍA]**
- **FCRA / NYC LL144:** **No aplican** — Hireeo no es plataforma de empleo ni usa consumer reports (confirmado en ambos archivos US). No extender por analogía. **[HECHO]**
- **COPPA:** no es una obligación *de IA* en sí, pero la ausencia de age gate significa que **texto de menores podría enviarse a Gemini** — se cruza con la falta de barrera de edad (`united-states-federal.md` US-F1). **[OBLIGACIÓN condicional]**

### 3.2 Estatal (de `united-states-state-local-matrix.md`)
| Ley | Estado | Consecuencia para los sistemas de IA de Hireeo |
|---|---|---|
| **Colorado AI Act** (SB 24-205, mod. SB25B-004) | **Vigente 2026-06-30** | Regula *high-risk AI* que toma "consequential decisions" (empleo, crédito, vivienda, etc.). **[INFERENCIA]** No se ve decisión consecuencial hoy (marketplace ≠ empleo). **No declarar N/A permanente**: prohibir usar ranking/IA para elegibilidad laboral/crédito y **documentar la clasificación**. |
| **Texas TRAIGA** (HB 149) | **Vigente 2026-01-01** | Aplica territorialmente si se desarrolla/despliega IA en Texas. Controles sobre discriminación ilegal, biometría y **disclosures**. Revisar texto final. **[OBLIGACIÓN condicional a nexo territorial]** |
| **Utah AI Policy Act** + SB 226 (GenAI) | Vigente 2024-05-01 / 2025-05-07 | **Disclosure de GenAI** cuando una persona razonable pueda creer que interactúa con un humano, en consumer transactions. **[OBLIGACIÓN si hay usuarios UT]** → refuerza el aviso de IA (Sistemas A–D). |
| **California CPPA ADMT** | Regs efectivas 2026-01-01; ADMT para *significant decisions* **2027-01-01** | Hoy el clasificador/draft **no es** decisión significativa confirmada. **[FUTURO]** Inventariar ADMT y preparar opt-out/access antes de 2027 si el producto cambia. |
| **Connecticut (CTDPA ampliado)** | Vigente; ampliaciones 2026-07-01 | Protección de menores + profiling; AG investiga chatbots. **[OBLIGACIÓN]** No dirigir IA a menores; estándar más protector hasta conocer la edad. |
| **Illinois BIPA** | Vigente | Solo si se captan identificadores biométricos. El flag `isKycVerified` **no demuestra** captura hoy. **[OBLIGACIÓN condicional a biometría]** |

> **[INFERENCIA]** El **denominador común US** es **disclosure de interacción con IA** (Utah ya vigente; buena práctica multiestado) + **no usar IA para decisiones consecuenciales** sin reabrir el análisis. Ambos se traducen en controles concretos en `ai-user-transparency.md` y `ai-governance-framework.md`.

---

## 4. Chile, Argentina, Uruguay — norma vigente vs. iniciativas vs. buenas prácticas

> **Regla de rigor:** en los tres países **no hay ley horizontal de IA vigente** a 2026-07-23. Lo aplicable **hoy** es la **normativa de protección de datos** vigente (que sí alcanza el tratamiento automatizado y el perfilado) más **guías/estrategias no vinculantes**. Se separa estrictamente lo vigente de lo futuro.

### 4.1 Chile
- **Vigente [OBLIGACIÓN]:** Ley 19.628 de protección de la vida privada (datos personales). **Reforma sustancial**: **Ley 21.719** (nueva ley de datos, publicada 2024-12-13) crea la Agencia de Protección de Datos y moderniza el régimen; su **entrada en vigencia es diferida (≈diciembre 2026)** — verificar fecha exacta antes de decisiones. Incluye principios y, relevante para IA, reglas reforzadas sobre tratamiento y decisiones automatizadas. **[FUTURO próximo]**
- **Iniciativa [FUTURO, no vigente]:** **Proyecto de ley que regula los sistemas de IA** (Boletines 15.869-19 y 16.821-19, refundidos), de **enfoque basado en riesgo similar al EU AI Act**. Aprobado en **primer trámite constitucional en la Cámara de Diputados el 2025-10-13**; en **segundo trámite ante el Senado** (Comisión Desafíos del Futuro + Hacienda), con urgencias sucesivas (dic-2025, ene-2026). **No es obligación exigible hoy.** [Fuente: IAPP/MinCiencia/Senado, ver §7].
- **Guía [GUÍA]:** Política Nacional de IA (actualizada 2024). No vinculante.
- **[BUENA PRÁCTICA]** Diseñar ya conforme al enfoque de riesgo del proyecto de ley (inventario, transparencia, supervisión humana) reduce el coste de adaptación cuando entre en vigor.

### 4.2 Argentina
- **Vigente [OBLIGACIÓN]:** Ley 25.326 de Protección de Datos Personales (alcanza tratamiento automatizado; art. 20 sobre decisiones basadas en tratamiento automatizado de datos). Autoridad: **AAIP**.
- **Soft law vigente [GUÍA]:**
  - **Resolución AAIP 161/2023** (2023-09-04): crea el "Programa de Transparencia y Protección de Datos Personales en el uso de la IA".
  - **Disposición SSTI 2/2023** (2023-06-01): "Recomendaciones para una IA fiable" — principios éticos en todo el ciclo de vida; **la responsabilidad y supervisión deben recaer siempre en humanos**.
  - **Guía AAIP para entidades públicas y privadas** (junio 2024): transparencia, protección de datos, mitigación de sesgos, evaluaciones de impacto.
- **[FUTURO]** No hay ley horizontal de IA sancionada; existen proyectos legislativos.
- **[BUENA PRÁCTICA]** Alinear el Sistema A con la Disposición 2/2023 ("supervisión humana siempre") **refuerza** exactamente el control técnico de confirmación que ya se recomienda (AI-CHK-03).

### 4.3 Uruguay
- **Vigente [OBLIGACIÓN]:** Ley 18.331 de Protección de Datos Personales; autoridad **URCDP**. El tratamiento automatizado y el perfilado quedan bajo sus principios (responsabilidad proactiva, evaluaciones de impacto, privacidad desde el diseño).
- **Marco de gobernanza [HECHO]:** el **art. 74 de la Ley 20.212/2023** encarga a **AGESIC** diseñar la Estrategia Nacional de Datos e IA, en acción conjunta con URCDP para datos personales.
- **Iniciativa [FUTURO, no vigente]:** **Estrategia Nacional de IA 2024–2030** (AGESIC, consulta pública) y anuncio gubernamental (nov-2025) de impulsar una **ley de regulación de IA**; en desarrollo, **no vigente**.
- **[BUENA PRÁCTICA]** Principios de la estrategia (equidad, no discriminación, rendición de cuentas, auditabilidad) → adoptar como marco voluntario.

### 4.4 Síntesis LatAm
| País | Ley IA vigente | Datos personales (vigente) | Soft law IA | Acción hoy |
|---|---|---|---|---|
| Chile | **No** (proyecto en Senado) | 19.628 (+21.719 dif.) | Política Nac. IA 2024 | Diseñar por riesgo; transparencia; supervisión humana |
| Argentina | **No** | 25.326 (art. 20) | Res. 161/2023, Disp. 2/2023, Guía AAIP 2024 | Supervisión humana por código; evaluación de impacto |
| Uruguay | **No** (en desarrollo) | 18.331 | Estrategia IA 2024-2030 | Privacidad desde diseño; evaluación de impacto |

---

## 5. Matriz de riesgo de IA (escenarios reales)

| ID | Escenario | Sistema | Jurisdicción/Norma | Prob. | Impacto | Control actual | Brecha | Prioridad |
|---|---|---|---|---|---|---|---|---|
| AIR-01 | El agente crea un `ServiceRequest`/`Quote` sin confirmación real del usuario (alucinación o injection) | A | GDPR 22; Disp. AAIP 2/2023; consumo | Media | Alto | Solo instrucción en prompt | Sin control de código | **P0** |
| AIR-02 | Falta de aviso de interacción con IA al lanzar en `/es` | A,B,C,D | AI Act art. 50 (2026-08-02); Utah GenAI | Alta | Medio-Alto | Ninguno | Total | **P0** |
| AIR-03 | Salida de texto libre dañina/ilícita mostrada al usuario | A,D | Consumo; FTC §5; DSA | Media | Medio | Sin `safetySettings` ni moderación | Total | **P1** |
| AIR-04 | Descripción SEO con afirmaciones no sustentadas publicada como del prestador | E | FTC §5; consumo/Omnibus; AI Act 50.2 | Media | Medio | Ninguno | Total | **P1** |
| AIR-05 | Prompt injection redirige el agente (exfiltración, tool abuse) | A | Seguridad; GDPR 32 | Media | Alto | Concatenación cruda de input | Total | **P1** |
| AIR-06 | PII enviada a Google sin base/aviso; entrenamiento no confirmado | A–D | GDPR 13-14/28/44-49; 25.326; 18.331 | Alta | Medio-Alto | Ninguna minimización | Total (Q4) | **P0/BLOCKING** |
| AIR-07 | Reclasificación a alto riesgo si la IA condiciona acceso económico | A,F | AI Act Anexo III; Colorado AI Act | Baja hoy | Alto | Documentación de clasificación ausente | Reevaluación M4 | P2 |
| AIR-08 | Server Actions de IA sin auth → abuso de cuota/coste (DoS económico) | C–F | Seguridad | Media | Medio | Backend sí; frontend no | Auth/throttle frontend | **P1** |

---

## 6. Conclusión de clasificación

1. **Ningún sistema** de Hireeo es práctica prohibida ni alto riesgo bajo el AI Act **hoy**. **[HECHO, de `spain-eu.md`]**
2. Todos los que interactúan con personas están sujetos a **transparencia (art. 50, 2026-08-02)** y a **alfabetización (art. 4, ya vigente)**.
3. El **Sistema A es el foco de riesgo** por su capacidad de **actuar** (escribir en DB) sin control técnico de supervisión → cruza GDPR art. 22, la Disposición argentina 2/2023 (supervisión humana), y el vector de *tool abuse*.
4. En **EE.UU.** el eje es **disclosure de IA** (Utah vigente) y **no usar IA para decisiones consecuenciales** (Colorado/Texas) — hoy no se activan, pero deben documentarse y vigilarse.
5. En **LatAm** rige la **normativa de datos** (que ya alcanza perfilado y decisiones automatizadas) más **soft law**; las leyes de IA están en trámite y **no son exigibles**.

---

## 7. Registro de fuentes (acceso 2026-07-23)

- **[P]** AI Act — Reg. (UE) 2024/1689 (arts. 4, 5, 25, 50, 99; Anexo III; Cap. V) — vía `country-analysis/spain-eu.md` §17.
- **[P]** GDPR — Reg. (UE) 2016/679 (arts. 13-14, 22, 35) — vía `spain-eu.md`.
- **[P/S]** EE.UU. federal y estatal — ver `country-analysis/united-states-federal.md` [F-01..F-15] y `united-states-state-local-matrix.md` [S-01..S-14].
- **[P/S] Chile — Proyecto de Ley IA (Boletines 15.869-19 / 16.821-19):** Senado de Chile (senado.cl); MinCiencia (minciencia.gob.cl/areas/inteligencia-artificial); IAPP «Se aprueba en primer trámite constitucional el Proyecto que regula los sistemas de IA en Chile» y «Continúa la tramitación». Estado: primer trámite aprobado 2025-10-13, en Senado. **[FUTURO, no vigente]**
- **[P] Chile — Ley 21.719** (nueva ley de datos, publicada 2024-12-13, vigencia diferida ≈2026-12). Verificar fecha exacta en Diario Oficial.
- **[P/S] Argentina — AAIP:** Resolución 161/2023 (Boletín Oficial 2023-09-04); Disposición SSTI 2/2023 (Recomendaciones para una IA fiable, 2023-06-01); Guía AAIP para entidades públicas y privadas (junio 2024, argentina.gob.ar; IAPP). Ley 25.326.
- **[P/S] Uruguay — AGESIC:** Estrategia Nacional de IA 2024-2030 (plataformaparticipacionciudadana.gub.uy); art. 74 Ley 20.212/2023 (impo.com.uy); anuncio de ley de IA (la diaria, nov-2025). Ley 18.331; URCDP.

> Verificar el texto consolidado de cada norma en la fuente oficial (EUR-Lex, Diario Oficial de Chile, Boletín Oficial de Argentina, IMPO Uruguay) antes de redactar cualquier documento legal.
