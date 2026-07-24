# country-analysis/spain-eu — España y Unión Europea (Fase 3.4)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales/profesionales con dos integraciones reales de IA (Google Gemini 2.5 Flash).
- **Fecha de corte / acceso a fuentes:** 2026-07-23
- **Versión:** 0.1 (borrador de investigación jurisdiccional condicionado)
- **Insumos previos:** `01-scope-assumptions-and-open-questions.md`, `02-product-and-data-map.md`, `marketplace/01-platform-role-and-liability-analysis.md`.
- **Alcance de este documento (delta):** el rol de plataforma, la responsabilidad del intermediario, el DSA (arts. 6, 9-10, 16-17, 19, 25-32), el P2B y el consumo/Omnibus **ya están analizados en `marketplace/01`** y **no se repiten**. Aquí se profundiza lo que ese documento no cubre: **GDPR/LOPDGDD, cookies/ePrivacy/LSSI, AI Act a fondo (dos casos de uso reales), accesibilidad (EAA), NIS2, geobloqueo, Data Act/DGA y transferencias internacionales**.

> **Aviso.** Documento de investigación técnico-jurídica, no asesoramiento legal. Requiere revisión de abogado habilitado en España/UE antes de cualquier uso público. Se distingue entre **[HECHO]** (evidencia en repo), **[INFERENCIA]** técnica, **[SUPUESTO]** pendiente, **[OBLIGACIÓN]** vigente, **[FUTURO]** con fecha de aplicación posterior, **[GUÍA]** no vinculante y **[BUENA PRÁCTICA]**.
>
> **Condicionantes BLOCKING transversales (de `01`):** Q1 entidad legal operadora y su lugar de establecimiento (determina si aplica el **representante UE del art. 27 GDPR** y las exenciones pyme del DSA); Q2 arquitectura de pagos; Q4 contrato con Google/Gemini (entrenamiento, ubicación); Q5 región de alojamiento de datos.

---

## 0. Resumen ejecutivo

España es la jurisdicción **más densa en obligaciones activas** del proyecto. La aplicabilidad se activa por el criterio de **targeting**: en cuanto Hireeo ofrezca el subpath `/es` en euros dirigido a personas en España (`register.dto.ts:11` admite `es`; Footer lista España), quedan aplicables el **GDPR**, la **LOPDGDD**, la **LSSI-CE**, el régimen **ePrivacy/cookies** y el resto del acervo UE, **con independencia de dónde esté constituido el operador** (GDPR art. 3.2; extraterritorialidad).

Hallazgos de mayor exposición inmediata:

1. **Tracking sin consentimiento (crítico, vivo al lanzamiento).** GTM `GTM-PT2PFWF9` y GA4 `G-WREYNC9F4M` se inyectan en `<head>`/`<noscript>` sin CMP ni gate de consentimiento (`layout.tsx:170-207` — E-02). Infringe el **art. 22.2 LSSI-CE** y la **Guía de cookies de la AEPD (enero 2024)**: los identificadores no funcionales no pueden colocarse antes del consentimiento. Es la brecha más clara y sancionable del expediente. Añade una transferencia a Google (EE. UU.).
2. **IA — transparencia inminente (art. 50 AI Act) + alfabetización ya exigible.** Los dos sistemas (agente con *tools* y chatbot clasificador) son de **riesgo limitado**: obligaciones de **transparencia del art. 50** (informar que se interactúa con IA / marcar contenido sintético) que **empiezan a aplicarse el 2026-08-02** (10 días después de la fecha de corte). La **alfabetización en IA del art. 4** ya rige desde **2025-02-01**. No son de alto riesgo (ver §5).
3. **Cimientos GDPR ausentes.** Sin ROPA, sin política de privacidad real (páginas i18n genéricas), sin base jurídica declarada, sin DPIA (perfilado + geolocalización precisa + IA que actúa), sin verificación de DPA/SCC con subprocesadores, y probable falta de **representante UE (art. 27)** si el operador no está establecido en la UE. Además, geolocalización **precisa** (lat/long — `schema.prisma:522-523`) es dato de mayor riesgo.

**Clasificación AI Act (resumen):** ambos sistemas → **riesgo limitado / transparencia (art. 50)**; Hireeo actúa como **desplegador** ("deployer") y **responsable del despliegue del sistema de IA** compuesto, **no** como proveedor del modelo (ese rol es de Google) ni como importador/distribuidor. **Ninguno** cae en prácticas prohibidas (art. 5) ni en el Anexo III (alto riesgo).

---

## 1. Aplicabilidad (¿cuándo y por qué aplica el Derecho de la UE?)

| Vector de aplicabilidad | Fundamento | Situación Hireeo | Estado |
|---|---|---|---|
| **GDPR — targeting de residentes UE** | Reg. (UE) 2016/679, **art. 3.2.a**: aplica a responsables no establecidos en la UE que ofrezcan bienes/servicios a interesados en la UE. | El código admite país `es`, euros y contenido en español dirigido a España → *targeting* activo. | **[OBLIGACIÓN]** |
| **Representante UE** | GDPR **art. 27** | Si el operador (Q1) **no** está establecido en la UE, debe designar por escrito un **representante en un Estado miembro** (salvo la estrecha excepción de tratamiento "ocasional" —que un marketplace no cumple). | **[OBLIGACIÓN condicional a Q1]** |
| **DSA / LSSI** | Reg. (UE) 2022/2065; Ley 34/2002 | Servicio de la sociedad de la información dirigido a España. Analizado en `marketplace/01`. | **[OBLIGACIÓN]** |
| **ePrivacy / cookies** | Directiva 2002/58 (transpuesta en art. 22.2 LSSI-CE) | Cualquier acceso/almacenamiento en el terminal del usuario español. | **[OBLIGACIÓN]** |
| **AI Act** | Reg. (UE) 2024/1689, **art. 2**: aplica a proveedores y desplegadores cuyo *output* se use en la UE, con independencia de su establecimiento. | Hireeo despliega IA cuyos resultados afectan a usuarios en España. | **[OBLIGACIÓN escalonada]** |
| **EAA / accesibilidad** | Directiva (UE) 2019/882; Ley 11/2023; RD 193/2023 | El **comercio electrónico B2C** es servicio incluido en el ámbito del EAA. | **[OBLIGACIÓN vigente 2025-06-28]** |

> **[SUPUESTO S5 / HIGH]** No hay verificación de edad ni fecha de nacimiento (`register.dto.ts`; búsqueda negativa §C de `01`). Si accedieran menores de 14 (edad de consentimiento digital en España, LOPDGDD art. 7), se activarían obligaciones adicionales de consentimiento parental y de diseño. Debe fijarse edad mínima 18+ en Términos y bloquear el registro por debajo.

---

## 2. Leyes vigentes con cita (privacidad, cookies, ciberseguridad, accesibilidad, datos)

> El bloque DSA / P2B / LSSI-art.16 / consumo-Omnibus está citado en `marketplace/01` §2.4 y §9. Aquí se listan las normas **no cubiertas** por ese documento.

| Norma | Cita / arts. clave para Hireeo | Autoridad | Estado a 2026-07-23 |
|---|---|---|---|
| **GDPR** — Reg. (UE) 2016/679 | Arts. 5 (principios), 6 (base jurídica), 9 (categorías especiales), 12-22 (derechos, incl. **22 decisiones automatizadas**), 25 (privacidad desde el diseño/por defecto), 27 (representante UE), 28 (encargado/DPA), 30 (ROPA), 32 (seguridad), 33-34 (brechas), 35 (**DPIA**), 44-49 (transferencias) | AEPD | **VIGENTE** |
| **LOPDGDD** — L.O. 3/2018 | Art. 7 (edad ≥14), arts. 11-18 (info y derechos), Disp. Ad. (DPO), régimen sancionador nacional | AEPD | **VIGENTE** |
| **LSSI-CE** — Ley 34/2002 | **Art. 22.2** (cookies/consentimiento), art. 10 (información del prestador), arts. 20-21 (comunicaciones comerciales/spam), art. 16 (hosting — ver `marketplace/01`) | AEPD (cookies/comunicaciones) | **VIGENTE** |
| **AEPD — Guía sobre el uso de cookies** | Actualización **enero 2024** (cumplimiento 2024-01-11) + criterios CEPD "pay or consent" (opinión abril 2024): rechazar tan fácil como aceptar, sin casillas premarcadas, acciones igual de visibles | AEPD | **VIGENTE / GUÍA** |
| **AI Act** — Reg. (UE) 2024/1689 | Art. 4 (alfabetización), art. 5 (prohibidas), art. 50 (transparencia), Cap. V (GPAI), Anexo III (alto riesgo) — ver §5 y calendario §7 | AESIA (España) / Oficina Europea de IA | **APLICACIÓN ESCALONADA** |
| **EAA** — Directiva (UE) 2019/882 · **Ley 11/2023** · **RD 193/2023** | Accesibilidad de servicios de comercio electrónico (WCAG/EN 301 549) | Autoridades de consumo / discapacidad | **VIGENTE desde 2025-06-28** |
| **NIS2** — Directiva (UE) 2022/2555 | Gestión de riesgos + notificación de incidentes; transposición nacional pendiente (ver §8) | (futuro) Centro Nacional de Ciberseguridad | **NO transpuesta en España** |
| **Reglamento de geobloqueo** — Reg. (UE) 2018/302 | No discriminación por nacionalidad/lugar de residencia en el acceso; exclusiones para ciertos servicios | CNMC / consumo | **VIGENTE (aplicabilidad limitada, §9)** |
| **Data Act** — Reg. (UE) 2023/2854 | Acceso/portabilidad de datos IoT y cambio de proveedor cloud | (nacional) | **VIGENTE desde 2025-09-12 (aplicabilidad marginal, §9)** |
| **Data Governance Act** — Reg. (UE) 2022/868 | Intermediación de datos, altruismo de datos | — | **VIGENTE (no aplica al modelo actual, §9)** |

Fuente de vigencia AI Act / Digital Omnibus: adopción del **Digital Omnibus** por el Parlamento (2026-06-16) y el Consejo (2026-06-29); publicación en el DOUE esperada en julio 2026 (ver §7 y Registro de fuentes).

---

## 3. Autoridades competentes

| Materia | Autoridad | Rol frente a Hireeo |
|---|---|---|
| Protección de datos | **AEPD** (Agencia Española de Protección de Datos) | Supervisión GDPR/LOPDGDD, cookies (LSSI 22.2), comunicaciones comerciales; potestad sancionadora. |
| DSA — Coordinador de Servicios Digitales (ES) | **CNMC** (Comisión Nacional de los Mercados y la Competencia) — designada DSC español **[SUPUESTO — confirmar instrumento de designación]** | Punto de contacto DSA nacional; supervisión de plataformas no VLOP. |
| DSA — plataformas muy grandes | **Comisión Europea** | Solo si Hireeo alcanzara VLOP (≥45M usuarios UE) — no es el caso. |
| IA | **AESIA** (Agencia Española de Supervisión de la IA, sede A Coruña) + **Oficina Europea de IA** (GPAI) | Autoridad nacional de vigilancia del AI Act. |
| Consumo | Autoridades autonómicas + **Dirección General de Consumo** | Directiva consumidores/Omnibus (ver `marketplace/01`). |
| Accesibilidad | Órganos de consumo/discapacidad designados por la Ley 11/2023 | Vigilancia EAA. |
| Ciberseguridad | **INCIBE / CCN / CNI** (y futuro Centro Nacional de Ciberseguridad tras NIS2) | Incidentes; hoy sin obligación NIS2 exigible (§8). |
| Industria (oficios regulados) | Órganos de industria de cada CCAA | Instaladores BT/gas — recae en el prestador (ver `marketplace/01` §4). |

---

## 4. Privacidad y datos personales (GDPR / LOPDGDD) — análisis a fondo

### 4.1 Base jurídica por tratamiento (propuesta condicionada)

| Tratamiento | Evidencia | Base jurídica candidata (art. 6 GDPR) | Nota |
|---|---|---|---|
| Cuenta y autenticación | `auth.service.ts:50-80` | **6.1.b** ejecución de contrato | Ok. |
| Publicación/descubrimiento de servicios | `schema.prisma` Service | **6.1.b** + **6.1.f** interés legítimo (visibilidad) | Requiere test de ponderación (LIA). |
| Geolocalización precisa (lat/long) | `schema.prisma:522-523` | **6.1.b** o **6.1.a** consentimiento | Dato de mayor riesgo; evaluar minimización (¿precisión exacta necesaria?). |
| Mensajería interna | `schema.prisma:425-465` | **6.1.b** | Contenido de terceros posible. |
| Analítica GTM/GA4 | `layout.tsx:170-207` | **6.1.a consentimiento** (+ art. 22.2 LSSI) | **Hoy sin base válida** (sin consentimiento) → §4.4. |
| IA (agente + chatbot) | `ai-agents.service.ts`, `chatbot.service.ts` | **6.1.b/6.1.f** + transparencia art. 13/14 y art. 22 | Ver §5. |
| KYC (futuro real) | `kyc.service.ts` | **6.1.c** obligación legal (si AML aplica) / **6.1.f** | Datos de identidad; Stripe como responsable/encargado. |

### 4.2 Art. 22 GDPR — decisiones automatizadas (relevante por el agente con *tools*)

- El **agente `ai-agents`** puede **crear un `ServiceRequest`** (borrador) y sugerir proveedores con `maxSteps:5` (`ai-agents.service.ts:27-70`). **[HECHO]**
- **Análisis:** el art. 22.1 prohíbe decisiones **basadas únicamente** en tratamiento automatizado que produzcan **efectos jurídicos o significativos**. Del código se infiere que el resultado es un **borrador que el usuario confirma** (`02-product-and-data-map.md:211`) → hay **intervención humana significativa** → en principio **no** cae en el art. 22. **[INFERENCIA]**
- **Riesgo / [SUPUESTO]:** si el agente crea solicitudes **sin confirmación del usuario**, o si sus recomendaciones determinan de facto qué prestador contrata el consumidor sin revisión, podría acercarse al art. 22 y exigir: información específica (arts. 13.2.f/14.2.g), derecho a intervención humana, a expresar el punto de vista y a impugnar la decisión. **Debe confirmarse el grado de autonomía real (M4 de `marketplace/01`).**
- **Perfilado (art. 4.4):** ranking/`featured`/recomendaciones IA implican perfilado ligero → obligación de transparencia y, potencialmente, de LIA.

### 4.3 DPIA (art. 35 GDPR) — probablemente obligatoria

Concurren varios criterios de la lista de la AEPD/CEPD que, combinados, activan DPIA: **(i)** evaluación/perfilado (ranking + IA), **(ii)** datos a gran escala, **(iii)** **geolocalización precisa** sistemática, **(iv)** uso innovador de IA que interactúa y actúa, **(v)** cruce de fuentes. **[OBLIGACIÓN condicional — muy probable]** Debe realizarse **antes** del lanzamiento y documentarse.

### 4.4 Transferencias internacionales (arts. 44-49) — Schrems II / DPF

| Subprocesador | Destino probable | Mecanismo | Estado a 2026-07-23 |
|---|---|---|---|
| Google (Gemini, GTM/GA4, Firebase, OAuth) | EE. UU. (Google LLC) | **EU-US Data Privacy Framework** (adecuación) + SCC de respaldo | DPF **válido**: el Tribunal General desestimó el recurso *Latombe* (2025-09-03); **apelación C-703/25 P pendiente ante el TJUE** (interpuesta 2025-10-31, sin vista a mayo 2026) → **riesgo residual "tercer Schrems"**. **[HECHO / riesgo futuro]** |
| Stripe | EE. UU./UE | DPF + SCC | Verificar certificación DPF y DPA (Q9). |
| Cloudinary | Por confirmar (Q5) | SCC + TIA | **[SUPUESTO]** |
| Brevo | UE (Francia) | Intra-UE | Sin transferencia si permanece en UE. |
| MercadoPago | Regional (LatAm) | SCC | Solo aplica a usuarios `es` si procesa sus datos. |

**Acciones [OBLIGACIÓN condicional a Q4/Q5/Q9]:** confirmar certificación DPF de cada proveedor USA; firmar **SCC (Decisión 2021/914) como respaldo**; realizar **TIA (Transfer Impact Assessment)**; documentar medidas suplementarias. No declarar SCC implementadas sin contrato firmado.

### 4.5 Otras obligaciones GDPR aplicables

- **ROPA (art. 30):** elaborar el registro (borrador en `privacy/`). **[OBLIGACIÓN]**
- **DPO (art. 37 / LOPDGDD):** evaluar si el tratamiento a gran escala con seguimiento sistemático (geo + analítica + IA) obliga a designar DPO. **[OBLIGACIÓN condicional — probable]**
- **Derechos (arts. 15-22):** implementar canal y flujo (acceso, rectificación, supresión, portabilidad, oposición, limitación). Hoy no hay endpoint de autoborrado por el titular (`02` §1). **[OBLIGACIÓN — brecha]**
- **Brechas (arts. 33-34):** notificación a la AEPD en **72 h** y, si alto riesgo, a los interesados. Requiere playbook (Fase 11). **[OBLIGACIÓN]**
- **Encargados (art. 28):** DPA con todos los subprocesadores (Q9). **[OBLIGACIÓN]**
- **Info al usuario (arts. 13-14):** la política de privacidad actual es contenido i18n genérico (E-20); insuficiente. **[OBLIGACIÓN — brecha]**

---

## 5. AI Act (Reg. (UE) 2024/1689) — análisis a fondo de los DOS casos de uso reales

### 5.1 Rol de Hireeo por sistema

| Sistema (evidencia) | Modelo | Rol de Hireeo bajo el AI Act |
|---|---|---|
| **`ai-agents`** — agente conversacional con *tools* que sugiere proveedores y **crea un `ServiceRequest`** (`ai-agents.service.ts:27-70`; `hireeo-system.prompt.ts`) | Gemini 2.5 Flash (GPAI de terceros) | **Desplegador** (art. 3.4) del modelo GPAI; y **operador que pone en servicio un sistema de IA** compuesto (prompt + tools) para sus usuarios. **No** es proveedor del modelo (lo es Google), **ni** importador/distribuidor. Podría reclasificarse como **proveedor del sistema** si le pone su marca y lo ofrece como sistema propio (art. 25) — matiz a vigilar. |
| **`chatbot`** — clasificador de categorías de servicio (`chatbot.service.ts:33,45-49`) | Gemini 2.5 Flash | **Desplegador**. Función de clasificación backend. |

> **GPAI (Cap. V):** las obligaciones de proveedor de modelo de propósito general recaen en **Google**; a Hireeo se le **trasladan** deberes de transparencia/documentación aguas abajo (usar la información y la documentación técnica que el proveedor debe facilitar) y respetar las condiciones de uso del modelo. Verificar Q4 (contrato Gemini: entrenamiento con inputs/outputs, ubicación, subprocesadores).

### 5.2 Clasificación de riesgo — sustentada en el uso real (NO alto riesgo por defecto)

| Categoría AI Act | ¿Aplica a `ai-agents`? | ¿Aplica a `chatbot`? | Fundamento |
|---|---|---|---|
| **Prácticas prohibidas (art. 5)** | **No** | **No** | No hay manipulación subliminal, explotación de vulnerabilidad, *social scoring*, categorización biométrica, scraping facial, reconocimiento de emociones en trabajo/educación, ni identificación biométrica remota. |
| **Alto riesgo (Anexo III)** | **No** | **No** | Ninguno cae en biometría, infraestructura crítica, educación, **empleo/gestión de trabajadores** (el prompt del proyecto advierte NO tratarlo como reclutamiento), acceso a **servicios esenciales** (crédito, sanidad, ayudas), law enforcement, migración o justicia. Un agente de *matching* de servicios y un clasificador de categorías no evalúan elegibilidad a servicios esenciales ni toman decisiones de empleo. |
| **Riesgo limitado — transparencia (art. 50)** | **Sí** | **Sí (si interactúa con personas)** | Sistemas destinados a **interactuar directamente con personas físicas** → deber de informar que se trata de IA. Si generan/publican texto o contenido sintético → marcado/etiquetado. |
| **Riesgo mínimo** | — | Parcial (si el clasificador es puramente interno sin interacción visible) | Resto de funciones. |

> **Advertencia de reevaluación [SUPUESTO/HIGH]:** si en el futuro el agente se usara para **filtrar/seleccionar prestadores condicionando su acceso a oportunidades económicas** de forma automatizada y determinante, podría rozar el Anexo III (empleo/servicios esenciales según diseño). Debe re-clasificarse ante cualquier cambio de finalidad (M4).

### 5.3 Obligaciones concretas del art. 50 (transparencia) aplicables a Hireeo

1. **Interacción con IA (art. 50.1):** informar de forma clara y visible al usuario del agente/chatbot que **está interactuando con un sistema de IA**, salvo que sea obvio.
2. **Contenido sintético (art. 50.2, como desplegador/operador):** si el sistema **genera texto** que se publica (p. ej. descripciones o mensajes), marcarlo como generado por IA cuando proceda; excepción si hay **revisión editorial humana con responsabilidad**.
3. **Deepfakes / emociones / biometría:** no aplican (Hireeo no los usa).

### 5.4 Alfabetización en IA (art. 4) — **ya exigible**

Desde **2025-02-01**, proveedores y **desplegadores** deben garantizar un **nivel suficiente de alfabetización en IA** de su personal que opere/use estos sistemas. **[OBLIGACIÓN VIGENTE]** → documentar formación básica del equipo que mantiene `ai-agents`/`chatbot`.

### 5.5 Controles recomendados (no sustituibles por disclaimers)

Supervisión humana del agente (confirmación del usuario antes de crear `ServiceRequest`), *guardrails* anti-alucinación (ya presente en `hireeo-system.prompt.ts` — "NUNCA inventes proveedores/calificaciones"), controles de *prompt injection*/*tool abuse*, logging minimizado de prompts/outputs, versionado de prompt/modelo. Detalle en Fase 6 (`ai/`).

---

## 6. Accesibilidad (European Accessibility Act) — VIGENTE

- **Marco:** Directiva (UE) 2019/882, transpuesta por **Ley 11/2023** y desarrollada por **RD 193/2023**. **[OBLIGACIÓN]**
- **Aplicación:** desde **2025-06-28** para servicios **nuevos**; los preexistentes tienen hasta **2030-06-28**. El **comercio electrónico dirigido a consumidores** está expresamente incluido → un marketplace B2C como Hireeo **está en ámbito**. **[HECHO — normativo]**
- **Requisito técnico:** accesibilidad conforme a **EN 301 549 / WCAG 2.1 AA** (auditar hacia **2.2 AA** como buena práctica) en registro, formularios, pagos, consentimientos, chat, reportes y contenido.
- **Obligación de información:** publicar cómo el servicio cumple los requisitos de accesibilidad y un **canal de feedback** de accesibilidad.
- **Diferencia B2C/B2B:** el EAA protege al **consumidor**; la relación B2B con prestadores queda fuera de su ámbito de protección.

> **Acción [OBLIGACIÓN]:** auditoría de accesibilidad WCAG 2.2 AA del frontend (`frontend/`) antes del lanzamiento en `/es`; incluir declaración de accesibilidad. Detalle en Fase 13 (`accessibility-and-content/`).

---

## 7. Tabla de fechas de aplicación: VIGENTE HOY vs FUTURO

| Obligación | Fecha de aplicación | Estado a **2026-07-23** | Impacto Hireeo |
|---|---|---|---|
| GDPR / LOPDGDD | 2018-05-25 | **VIGENTE** | Todo el §4. |
| ePrivacy / cookies (LSSI 22.2) + Guía AEPD 2024 | Vigente / guía 2024-01-11 | **VIGENTE** | GTM/GA4 sin consentimiento = brecha. |
| DSA (Reg. 2022/2065) | 2024-02-17 | **VIGENTE** | Ver `marketplace/01`. |
| P2B (Reg. 2019/1150) | 2020-07-12 | **VIGENTE** | Relación con prestadores empresa. |
| EAA (Ley 11/2023 / RD 193/2023) | **2025-06-28** | **VIGENTE** | Accesibilidad B2C. |
| AI Act — **prohibidas (art. 5)** + **alfabetización (art. 4)** | **2025-02-02** | **VIGENTE** | Art. 4 ya obliga (formación equipo IA). |
| AI Act — **GPAI (Cap. V)** | **2025-08-02** | **VIGENTE** | Deberes aguas abajo del uso de Gemini. |
| Data Act (Reg. 2023/2854) — núcleo | 2025-09-12 | **VIGENTE** | Aplicabilidad marginal (§9). |
| **AI Act — transparencia (art. 50)** | **2026-08-02** | **FUTURO (10 días)** | Avisos de IA en agente y chatbot; marcado de contenido sintético. |
| AI Act — marcado de contenido en sistemas preexistentes | **2026-12-02** | **FUTURO** | Prórroga para el deber de marcado del proveedor. |
| AI Act — **alto riesgo Anexo III (autónomos)** | **2027-12-02** *(pospuesto por el Digital Omnibus; antes 2026-08-02)* | **FUTURO** | No aplica a Hireeo hoy (no es alto riesgo), pero fija el calendario. |
| AI Act — alto riesgo Anexo I (productos regulados) | **2028-08-02** *(pospuesto)* | **FUTURO** | No aplica. |
| **NIS2** (transposición española) | Directiva 2022-10-17 (España **incumplió** el plazo) | **NO transpuesta** (anteproyecto 2025-01-14; dictamen motivado CE mayo 2025) | Sin obligación exigible aún; monitorizar (§8). |

> **Nota sobre el Digital Omnibus (IA):** adoptado por el Parlamento Europeo (2026-06-16) y el Consejo (2026-06-29); pendiente de firma y publicación en el DOUE (esperada julio 2026). **Pospuso los plazos de alto riesgo**, pero **mantuvo la transparencia del art. 50 en 2026-08-02**. Verificar la publicación consolidada en EUR-Lex antes de cualquier decisión.

---

## 8. NIS2 — evaluación de aplicabilidad a Hireeo

- **Estado normativo [HECHO]:** la Directiva (UE) 2022/2555 debía transponerse antes del **2024-10-17**. España **no cumplió**; el Consejo de Ministros aprobó el **anteproyecto de Ley de Coordinación y Gobernanza de la Ciberseguridad el 2025-01-14**, pero **a julio de 2026 sigue sin publicarse en el BOE**; la Comisión Europea remitió **dictamen motivado en mayo de 2025**. → **No hay obligación NIS2 nacional directamente exigible a entidades privadas hoy.** (Una directiva no transpuesta no despliega, en general, efecto directo horizontal frente a un privado.)
- **¿Entraría Hireeo por sector/tamaño?** NIS2 aplica a entidades **esenciales/importantes** de sectores del Anexo I/II y, por lo general, con umbral de **mediana empresa** (≥50 empleados o >10M€). Un **marketplace de servicios locales** encaja, si acaso, en "proveedores de mercados en línea" (entidad **importante**, Anexo II) **solo si supera el umbral de tamaño**. **[INFERENCIA]** Dado el estado *pre-lanzamiento* y presumible tamaño micro/pequeño (ligado a Q1/Q3), **probablemente Hireeo quede fuera del ámbito NIS2 por tamaño**. **[SUPUESTO — reevaluar al crecer]**
- **Acción [BUENA PRÁCTICA]:** no esperar a la ley; adoptar medidas de gestión de riesgos y un procedimiento de notificación de incidentes (alerta 24 h / notificación 72 h / informe final 1 mes) como preparación, alineado con la Fase 11 (`security/`).

---

## 9. Otras normas UE — geobloqueo, Data Act, DGA (aplicabilidad acotada)

- **Geobloqueo (Reg. (UE) 2018/302) [OBLIGACIÓN vigente / aplicabilidad limitada]:** prohíbe discriminar a clientes por nacionalidad/residencia en el acceso a la interfaz y condiciones. Un marketplace de **servicios prestados presencialmente en un lugar físico** goza de matices (los servicios ejecutados en un país concreto pueden condicionarse a esa localización); el reglamento **excluye** además ciertos servicios. **Riesgo bajo**, pero: no bloquear el **acceso** a la web ni redirigir automáticamente sin consentimiento por país (el proxy de país por cookie/headers, `proxy.ts`, debe permitir cambiar de país manualmente). **[INFERENCIA]**
- **Data Act (Reg. (UE) 2023/2854) [aplicabilidad marginal]:** orientado a **datos de productos IoT y cambio de proveedor cloud**. Hireeo no fabrica IoT; como **cliente** de servicios cloud se **beneficia** de las reglas de portabilidad/cambio de proveedor (no es sujeto obligado principal). Sin acción inmediata.
- **Data Governance Act (Reg. (UE) 2022/868) [no aplica]:** regula intermediarios de datos y altruismo de datos; Hireeo no presta servicios de intermediación de datos en el sentido del DGA. **[INFERENCIA]** Reevaluar si monetiza datos agregados.

---

## 10. Sanciones (con fuente y rangos)

| Régimen | Rango sancionador | Fuente |
|---|---|---|
| **GDPR** (infracciones graves: base jurídica, transferencias, derechos) | Hasta **20 M€ o 4% de la facturación anual mundial** (lo mayor) | GDPR **art. 83.5** |
| **GDPR** (infracciones de art. 27 representante, art. 28, art. 30, art. 33) | Hasta **10 M€ o 2%** | GDPR **art. 83.4** |
| **Cookies / LSSI-CE (art. 22.2)** | Infracción **grave** hasta **150.000 €**; **leve** hasta **30.000 €** | LSSI-CE **arts. 38-39** |
| **AI Act** — prácticas prohibidas (art. 5) | Hasta **35 M€ o 7%** de la facturación mundial | AI Act **art. 99** |
| **AI Act** — otras obligaciones (incl. **transparencia art. 50**) | Hasta **15 M€ o 3%** | AI Act **art. 99** |
| **AI Act** — información incorrecta a autoridades | Hasta **7,5 M€ o 1%** | AI Act **art. 99** |
| **DSA** (Reg. 2022/2065) | Hasta **6% de la facturación anual mundial** | DSA **art. 52** (ver `marketplace/01`) |
| **EAA** (Ley 11/2023) | Régimen sancionador de discapacidad/consumo (multas que pueden alcanzar cientos de miles de € / porcentaje de ingresos según CCAA) | Ley 11/2023 / RD Leg. 1/2013 **[verificar cuantía por CCAA]** |
| **NIS2** (cuando se transponga) | Entidades importantes hasta **7 M€ o 1,4%**; esenciales hasta **10 M€ o 2%** | Directiva 2022/2555 arts. 34-35 (pendiente de ley española) |

> Las cuantías se acumulan por regímenes distintos ante un mismo hecho (p. ej., GTM/GA4 sin consentimiento puede tocar LSSI **y** GDPR por la transferencia).

---

## 11. Jurisprudencia / resoluciones / enforcement relevante

- **AEPD — cookies:** resoluciones sancionadoras recurrentes por instalar cookies/identificadores **antes del consentimiento** y por banners sin opción de rechazo equivalente (patrón directamente aplicable a la configuración actual de Hireeo). **[GUÍA / enforcement]**
- **CEPD — opinión "consent or pay" (abril 2024):** incorporada a la Guía AEPD; condiciona los muros de cookies y las alternativas de pago. **[GUÍA]**
- **TJUE — transferencias:** *Schrems II* (C-311/18) sigue siendo el marco; el **Tribunal General** confirmó el **DPF** en *Latombe* (T-553/23, 2025-09-03), con **apelación C-703/25 P pendiente** — riesgo de invalidación futura del marco de transferencias a EE. UU. **[HECHO / riesgo]**
- **DSA:** primeras decisiones de la Comisión contra VLOPs (no aplicables a Hireeo por tamaño) fijan criterios de *notice-and-action*, publicidad y patrones oscuros que orientan la buena práctica. **[GUÍA]**

---

## 12. Registros, autorizaciones, contratos y avisos obligatorios

- **Registros/autorizaciones:** no hay registro previo obligatorio para operar como plataforma (salvo el eventual **representante UE art. 27** y, si NIS2 aplicara tras transposición, el registro de entidad importante). Los **oficios regulados** exigen habilitación **al prestador** (ver `marketplace/01` §4). **[OBLIGACIÓN condicional]**
- **Contratos requeridos:** **DPA (art. 28)** con Google, Stripe, Cloudinary, Brevo, Firebase, MercadoPago; **SCC** para transferencias; **contrato de representante UE**; términos B2B/P2B con prestadores; DPA con clientes enterprise si Hireeo actúa como encargado. **[OBLIGACIÓN condicional Q9]**
- **Avisos obligatorios en la web:** (i) **información del prestador de servicios** (art. 10 LSSI: denominación, NIF/CIF, domicilio, contacto) — **hoy ausente (S1/Q1 BLOCKING)**; (ii) **política de privacidad** completa (arts. 13-14 GDPR); (iii) **política y banner de cookies** conformes a la Guía AEPD; (iv) **declaración de accesibilidad** (EAA); (v) **aviso de transparencia de IA** (art. 50, desde 2026-08-02); (vi) información precontractual y de reseñas (consumo/Omnibus — ver `marketplace/01`).

---

## 13. Diferencias B2C vs B2B

| Eje | B2C (cliente consumidor) | B2B (prestador empresa) |
|---|---|---|
| Consumo / desistimiento | Directiva 2011/83 + Omnibus (14 días, excepciones) | No aplica derecho de desistimiento; rige P2B. |
| Accesibilidad (EAA) | **Protegido** (servicio de e-commerce B2C) | Fuera del ámbito de protección EAA. |
| Cláusulas de exclusión de responsabilidad | Nulas si vulneran derechos inderogables | Mayor libertad contractual; indemnidades válidas. |
| Ranking / transparencia | DSA arts. 26/27 + consumo | **P2B** (parámetros de ranking, preaviso de cambios, reclamaciones internas). |
| GDPR | Interesado con plenos derechos | El prestador persona física también es interesado. |

---

## 14. Controles técnicos / operativos exigibles (checklist)

1. **CMP con gate de consentimiento previo** para GTM/GA4 (bloquear scripts hasta el consentimiento; rechazo tan fácil como aceptar; sin casillas premarcadas; registro de prueba de consentimiento). Implementar **Google Consent Mode v2**. **[CRÍTICO]**
2. **Aviso de interacción con IA** en `ai-agents` y `chatbot` + marcado de contenido generado (antes de 2026-08-02). **[ALTO]**
3. **Confirmación humana** obligatoria antes de que el agente cree un `ServiceRequest` (evitar art. 22). **[ALTO]**
4. **Política de privacidad y de cookies** reales + **información del prestador (art. 10 LSSI)**. **[ALTO — bloqueado por Q1]**
5. **Flujo de derechos GDPR** (acceso/supresión/portabilidad) y **endpoint de autoborrado** del titular. **[ALTO]**
6. **DPIA** documentada antes del lanzamiento en `/es`. **[ALTO]**
7. **DPA + SCC + TIA** con subprocesadores; verificar certificación DPF de proveedores USA. **[ALTO]**
8. **Auditoría de accesibilidad WCAG 2.2 AA** + declaración de accesibilidad. **[MEDIO-ALTO]**
9. **Representante UE (art. 27)** si el operador no está establecido en la UE. **[condicional Q1]**
10. **Minimización de geolocalización** (evaluar si lat/long exacta es necesaria o basta granularidad menor). **[MEDIO]**
11. **Formación de alfabetización en IA** del equipo (art. 4 — ya exigible). **[MEDIO]**
12. **Bloqueo de edad <18** en registro. **[MEDIO]**

---

## 15. Preguntas abiertas específicas (España/UE)

| ID | Pregunta | Bloquea | Prioridad |
|---|---|---|---|
| ES-1 | ¿Dónde está establecido el operador (Q1)? Determina representante art. 27 y exenciones pyme DSA. | Rep. UE, avisos art. 10 LSSI. | **BLOCKING** |
| ES-2 | ¿El contrato con Google/Gemini prohíbe el entrenamiento con inputs/outputs y define ubicación/subprocesadores (Q4)? | Base transferencias + AI Act GPAI. | **BLOCKING** |
| ES-3 | ¿El agente crea `ServiceRequest` siempre con confirmación humana? | Art. 22 GDPR; §230/AI Act. | HIGH |
| ES-4 | ¿Región de alojamiento de PostgreSQL/Cloudinary (Q5)? | TIA/SCC. | HIGH |
| ES-5 | ¿Se designará DPO? El perfil (geo + analítica + IA a gran escala) apunta a sí. | Gobernanza GDPR. | HIGH |
| ES-6 | ¿CMP y Consent Mode antes de GTM/GA4 (Q8)? | Cookies/ePrivacy. | HIGH |
| ES-7 | ¿Instrumento exacto que designa a la CNMC como DSC español y fecha? | Punto de contacto DSA. | MEDIUM |
| ES-8 | ¿Cuantía sancionadora EAA aplicable por la CCAA de establecimiento? | Exposición accesibilidad. | LOW |

---

## 16. Matriz: obligación → evidencia → propietario → prioridad → fecha objetivo

| # | Obligación | Norma | Evidencia repo | Brecha | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|---|---|---|
| 1 | Consentimiento previo de cookies (CMP + Consent Mode) | LSSI 22.2 + Guía AEPD 2024 + GDPR 6.1.a | `layout.tsx:170-207` (E-02) | Total | Engineering + Legal | **P0 — bloqueador de lanzamiento** | Pre-lanzamiento `/es` |
| 2 | Aviso de transparencia de IA (art. 50) | AI Act art. 50 | `ai-agents.service.ts`, `chatbot.service.ts` | Total | Product + Engineering | **P0** | **2026-08-02** |
| 3 | Confirmación humana antes de crear `ServiceRequest` | GDPR art. 22 | `ai-agents.service.ts:27-70` | Por confirmar (ES-3) | Product | P1 | Pre-lanzamiento |
| 4 | Política de privacidad + info del prestador (art. 10 LSSI) | GDPR 13-14 + LSSI 10 | páginas i18n `/privacy` (E-20) | Alta | Legal | P0 (dep. Q1) | Pre-lanzamiento |
| 5 | ROPA + base jurídica documentada | GDPR 30 / 6 | Ausencia | Total | DPO/Legal | P1 | Pre-lanzamiento |
| 6 | DPIA | GDPR 35 | perfilado+geo+IA | Total | DPO | P1 | Pre-lanzamiento |
| 7 | DPA + SCC + TIA con subprocesadores | GDPR 28/44-49 | `schema.prisma:51-63` (E-15) | Total (Q9) | Legal | P1 | Pre-lanzamiento |
| 8 | Representante UE | GDPR 27 | S1/Q1 | Por determinar | Legal | P1 (dep. Q1) | Pre-lanzamiento |
| 9 | Flujo de derechos + autoborrado | GDPR 15-22 | sin endpoint (`02` §1) | Alta | Engineering | P1 | Pre-lanzamiento |
| 10 | Accesibilidad WCAG 2.2 AA + declaración | EAA / Ley 11/2023 | `frontend/` | Por auditar | Product/Eng | P2 | Pre-lanzamiento |
| 11 | Alfabetización en IA del equipo | AI Act art. 4 | — | Total | People/Eng | P2 | **ya exigible** |
| 12 | Bloqueo de edad <18 | LOPDGDD 7 / Términos | `register.dto.ts` (E-05) | Total | Engineering | P2 | Pre-lanzamiento |
| 13 | Monitorizar transposición NIS2 y umbral de tamaño | Directiva 2022/2555 | — | N/A hoy | Security | P3 | Continuo |

---

## 17. Registro de fuentes (acceso 2026-07-23)

> Fuentes primarias **[P]**; secundarias/orientativas **[S]**. Verificar el texto consolidado en EUR-Lex/BOE antes de publicar cualquier documento.

- **[P]** GDPR — Reglamento (UE) 2016/679 (arts. 3, 6, 9, 22, 27, 28, 30, 32-35, 44-49, 83) — EUR-Lex CELEX 32016R0679.
- **[P]** LOPDGDD — Ley Orgánica 3/2018 (art. 7 edad; régimen sancionador) — BOE-A-2018-16673.
- **[P]** LSSI-CE — Ley 34/2002 (arts. 10, 20-22, 38-39) — BOE-A-2002-13758.
- **[P]** AEPD — «La AEPD actualiza su Guía sobre el uso de cookies para adaptarla a las nuevas directrices del CEPD» (nota de prensa) — aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd. **[S/P]**
- **[P]** AI Act — Reglamento (UE) 2024/1689 (arts. 2, 3, 4, 5, 25, 50, 99; Anexo III; Cap. V) — EUR-Lex CELEX 32024R1689.
- **[P/S]** Digital Omnibus (IA) — adopción Parlamento 2026-06-16 / Consejo 2026-06-29; posposición de alto riesgo (Anexo III → 2027-12-02; Anexo I → 2028-08-02); art. 50 mantiene 2026-08-02. Fuentes: Gibson Dunn «EU AI Act Omnibus Agreement — Postponed High-Risk Deadlines»; Jones Walker «Yes, August 2 Still Matters»; Technology.org «What Actually Applies on 2 August 2026». **[S]**
- **[P]** EAA — Directiva (UE) 2019/882; **Ley 11/2023** (BOE-A-2023-11022); **RD 193/2023**. Aplicación 2025-06-28; legacy hasta 2030-06-28.
- **[P]** NIS2 — Directiva (UE) 2022/2555 (arts. 34-35). Estado España: anteproyecto de Ley de Coordinación y Gobernanza de la Ciberseguridad (Consejo de Ministros 2025-01-14, sin publicar en BOE a 2026-07); dictamen motivado CE mayo 2025. Fuentes: DSN (dsn.gob.es/node/24160); nisd2.eu/es/wiki/timelines-and-status/nis2-status-spain. **[S/P]**
- **[P]** Geobloqueo — Reglamento (UE) 2018/302.
- **[P]** Data Act — Reglamento (UE) 2023/2854 (aplicable 2025-09-12). **[P]** DGA — Reglamento (UE) 2022/868.
- **[P/S]** Transferencias — TJUE *Schrems II* (C-311/18); Tribunal General *Latombe* (T-553/23, 2025-09-03) confirma el DPF; apelación **C-703/25 P** pendiente ante el TJUE. Fuentes: IAPP; Jones Day; Wilmer Hale. **[S]**
- **[P]** GDPR art. 27 — designación de representante UE; excepción de tratamiento ocasional.

---

## 18. Revisión por abogado local pendiente

Este expediente requiere validación por abogado habilitado en España/UE antes de cualquier publicación. **Hechos a confirmar antes de redactar documentos legales:** entidad legal y establecimiento del operador (Q1); contrato Google/Gemini (Q4); región de datos (Q5); DPA/SCC firmados (Q9); grado de autonomía real del agente de IA (ES-3); designación de DPO y representante UE; cuantías sancionadoras EAA por CCAA; y verificación del texto consolidado del Digital Omnibus en el DOUE una vez publicado.
