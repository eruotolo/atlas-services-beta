# marketplace/01 — Clasificación legal del rol de plataforma y responsabilidad (Fase 2)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales/profesionales con IA.
- **Fecha de corte / acceso a fuentes:** 2026-07-23
- **Versión:** 0.1 (borrador de análisis jurídico condicionado)
- **Insumos:** `01-scope-assumptions-and-open-questions.md`, `02-product-and-data-map.md`, `03-legal-entity-and-role-map.md`.
- **Jurisdicciones:** Uruguay (UY), Argentina (AR), Chile (CL), España/UE (ES-UE), Estados Unidos (US federal + estatal).

> **Aviso.** Documento de investigación técnico-jurídica, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción antes de cualquier uso público. Se distingue explícitamente entre **[HECHO]** (evidencia en repo), **[INFERENCIA]** técnica razonable, **[SUPUESTO]** pendiente de confirmar, **[OBLIGACIÓN]** jurídica vigente, **[GUÍA]** no vinculante y **[BUENA PRÁCTICA]**.
>
> **Condicionante transversal (BLOCKING):** la calificación de Hireeo depende de dos hechos aún no resueltos — la entidad legal operadora (Q1) y la arquitectura de pagos definitiva (Q2). Hoy el código **no cobra ni retiene fondos reales** (pagos y escrow en estado *stub/mock* — `payments.service.ts`, `escrow.service.ts:8,57-60`). Todo el análisis se presenta en dos escenarios: **A (solo conecta)** y **B (Hireeo cobra/retiene vía escrow real)**. Ver sección final.

---

## 0. Hechos de partida relevantes para la calificación (desde el repo)

| # | Hecho | Efecto sobre la calificación | Evidencia |
|---|---|---|---|
| H1 | Intermediario de **descubrimiento y contacto**: perfiles, búsqueda geo, mensajería, solicitudes/cotizaciones. | Acerca la figura a "intermediario/alojamiento de contenido de terceros". | `03-...md` §4; `schema.prisma` (Service, Conversation, ServiceRequest, Quote) |
| H2 | Pagos y escrow (15%) en **stub/mock**; hoy no hay flujo de fondos real. | Mantiene abierta la frontera entre escenario A y B. | `escrow.service.ts:8,57-60`; gateways stub |
| H3 | **Ranking/destacados**: `featured`, `level BASIC/PREMIUM`, `Sponsor` (publicidad). | Activa deberes de transparencia de ranking y publicidad (P2B/DSA/consumo). | `schema.prisma` (Service.featured/level, Sponsor) |
| H4 | **IA con *tools*** (`ai-agents`, Gemini 2.5 Flash) que puede **crear un `ServiceRequest`** (borrador) y sugerir proveedores. | Aumenta la intervención activa de la plataforma en la transacción → mayor exposición. | `ai-agents.service.ts:27-70`; `hireeo-system.prompt.ts` |
| H5 | **KYC** de prestadores vía Stripe Identity en **stub**; flag `isKycVerified` real. | Verificación de identidad prevista pero no operativa. | `kyc.service.ts:22-47` |
| H6 | **Sin verificación de edad ni credenciales profesionales** (licencias/seguros). | Riesgo en oficios regulados (electricidad, gas, transporte). | Búsqueda negativa §C de `01-...md` |
| H7 | Servicios mayoritariamente **presenciales** (electricistas, gásfiter, fletes). **[INFERENCIA]** | Ejecución fuera de plataforma → contratación a distancia + responsabilidad off-platform. | `CLAUDE.md` §5 |
| H8 | Moderación de reseñas `PENDING→ACTIVE` por SuperAdmin. | Base para notice-and-action, pero sin proceso formal documentado. | `schema.prisma` (Rating.status) |

---

## 1. Tabla comparativa por jurisdicción (síntesis)

| Eje | Uruguay | Argentina | Chile | España/UE | EE.UU. |
|---|---|---|---|---|---|
| **Régimen de responsabilidad del intermediario** | Sin ley específica de intermediarios; **responsabilidad subjetiva** por analogía civil (Ley 17.250 + Código Civil). **[OBLIGACIÓN parcial / INFERENCIA]** | **Responsabilidad subjetiva** (doctrina CSJN *Rodríguez* 2014, ratificada *Gimbutas/Mazza*): responde ante pasividad tras notificación. **[OBLIGACIÓN — jurisprudencial]** | Sin puerto seguro legal expreso; **Ley 19.496** + Ley 21.398 tienden a responsabilizar al proveedor/intermediario en e-commerce. **[OBLIGACIÓN en evolución]** | **DSA (Reg. UE 2022/2065)** + **LSSI-CE art. 16**: exención condicionada de hosting + deberes activos de plataforma. **[OBLIGACIÓN — vigente]** | **§230 CDA**: inmunidad por contenido de terceros, **no** por conducta propia (diseño, incumplimiento regulatorio, cobro). **[OBLIGACIÓN — federal]** |
| **Deber de trazabilidad de prestadores (KYC/KYB)** | No hay deber expreso; recomendable. **[BUENA PRÁCTICA]** | No hay deber general expreso. **[BUENA PRÁCTICA]** | No hay deber general expreso; SERNAC empuja verificación. **[GUÍA]** | **DSA art. 30** (KYC de traders) **si** califica como "plataforma que permite contratos a distancia con consumidores". **[OBLIGACIÓN condicional]** | Depende del estado; no hay deber federal general. **[VARIABLE]** |
| **Transparencia de ranking / publicidad** | Ley 17.250 (publicidad no engañosa). **[OBLIGACIÓN]** | Ley 24.240 + Res. 270/2020 (info clara). **[OBLIGACIÓN]** | Ley 19.496 + reglamento e-commerce; distinguir patrocinado. **[OBLIGACIÓN]** | **P2B (Reg. UE 2019/1150)** ranking a business users + **DSA arts. 26/27** publicidad y parámetros. **[OBLIGACIÓN]** | **FTC Act §5** (unfair/deceptive), guías de endorsements/dark patterns. **[OBLIGACIÓN]** |
| **Retiro de contenido/servicios ilegales** | Colaboración con autoridad; sin plazo legal. **[OBLIGACIÓN parcial]** | Retiro tras notificación fehaciente (doctrina). **[OBLIGACIÓN]** | Retiro ante ilícito conocido; SERNAC/consumo. **[OBLIGACIÓN]** | **DSA arts. 16 (notice-and-action), 6 (hosting), 9/10 (órdenes)**. **[OBLIGACIÓN]** | Sin mandato federal de takedown salvo DMCA (IP); §230 no obliga a retirar. **[VARIABLE]** |
| **Contratación a distancia / desistimiento** | Rescisión en ventas fuera de local (Ley 17.250 art. 16). **[OBLIGACIÓN]** | Derecho de arrepentimiento 10 días + botón de arrepentimiento (Res. 270/271). **[OBLIGACIÓN]** | Retracto 10 días e-commerce (Ley 19.496 art. 3 bis). **[OBLIGACIÓN]** | Directiva 2011/83 + Omnibus: 14 días, excepciones servicios ejecutados. **[OBLIGACIÓN]** | No hay derecho federal general de "cooling-off" online; reglas estatales de autorenovación. **[VARIABLE]** |
| **Oficios regulados (electricidad/gas/transporte)** | Instalador registrado **UTE**; energía/gas bajo **URSEA**. **[OBLIGACIÓN al prestador]** | Gasista matriculado **ENARGAS** (nacional); electricista matriculado (provincial/distribuidora). **[OBLIGACIÓN al prestador]** | Instalador eléctrico/gas autorizado y registrado en **SEC** (RNII; DS 191). **[OBLIGACIÓN al prestador]** | Instalador autorizado BT (**RD 842/2002**, ITC-BT-03) y gas; carné profesional. **[OBLIGACIÓN al prestador]** | Licencia estatal de electricista/plomero/contratista; sanción penal/civil por ejercicio sin licencia. **[OBLIGACIÓN al prestador]** |

---

## 2. Análisis por jurisdicción

### 2.1 Uruguay

- **Marco.** No existe ley específica de responsabilidad de intermediarios de Internet ni un "puerto seguro" legislado. La relación de consumo se rige por la **Ley 17.250 de Relaciones de Consumo** (11/08/2000) y su Decreto 244/000; los daños por defecto del servicio se resuelven por el régimen del **Código Civil**. **[OBLIGACIÓN parcial]** La ley aún **no fue reformada** específicamente para e-commerce/plataformas, aunque hay jurisprudencia aplicando ventas a distancia. **[HECHO — fuente secundaria/oficial]**
- **Calificación de Hireeo.** En **escenario A**, Hireeo se aproxima a un **intermediario/alojamiento** de anuncios de terceros; su responsabilidad frente al consumidor por el servicio del prestador sería, en principio, **subjetiva** (culpa propia: p. ej. inducir a error, no retirar un anuncio ilícito conocido, o presentar el servicio como propio). **[INFERENCIA]** La Ley 17.250 impone deberes de **información veraz** y **publicidad no engañosa** al **proveedor** (art. 24 y ss.), calidad que Hireeo asume respecto de **su propio servicio de intermediación** (la plataforma), no del oficio ejecutado por el prestador. **[OBLIGACIÓN]**
- **Ventas a distancia.** El art. 16 de la Ley 17.250 concede al consumidor el derecho a **rescindir** contratos celebrados fuera del local comercial (incluye medios "informáticos o similares"), plazo típico de 5 días. **[OBLIGACIÓN]** Aplica a la contratación del servicio; su articulación con servicios presenciales ya ejecutados debe precisarse. **[SUPUESTO]**
- **Oficios regulados.** Instaladores eléctricos deben estar **registrados ante UTE** (técnico + firma instaladora); el sector energía/gas está bajo **URSEA**. **[OBLIGACIÓN — recae en el prestador]** Hireeo no es el obligado a habilitar, pero **listar prestadores sin credencial** en oficios de riesgo puede fundar responsabilidad propia por facilitación negligente. **[INFERENCIA / riesgo]**
- **Autoridades.** Área de Defensa del Consumidor (MEF); URCDP (datos); URSEA/UTE (energía).

### 2.2 Argentina

- **Marco.** La responsabilidad de intermediarios de Internet se rige por **doctrina de la CSJN**: *Rodríguez, María Belén c/ Google* (28/10/2014), ratificada en *Gimbutas* y *Mazza* (2021). Regla: **responsabilidad subjetiva** — el intermediario **no** tiene deber general de monitoreo previo y responde solo si, **notificado** de contenido manifiestamente ilícito o lesivo, permanece **pasivo**. **[OBLIGACIÓN — jurisprudencial]** Para ilícitos "manifiestos" basta notificación privada; para casos opinables se requiere orden judicial/administrativa. **[GUÍA — criterio CSJN]**
- **Consumo/e-commerce.** **Ley 24.240** de Defensa del Consumidor + **Resolución SCI 270/2020** (internaliza Res. MERCOSUR 37/2019): deber de información clara, veraz y accesible sobre proveedor, servicio y transacción; **derecho de arrepentimiento de 10 días** y **"botón de arrepentimiento"** (Res. 271/2020) obligatorio en la web. **[OBLIGACIÓN — vigente]** El art. 40 de la Ley 24.240 establece **responsabilidad solidaria** de toda la cadena de comercialización por daños derivados del servicio; **si Hireeo se presenta como parte de la cadena o percibe comisión (escenario B), el riesgo de ser alcanzado por la solidaridad aumenta**. **[INFERENCIA / riesgo alto en B]**
- **Oficios regulados.** **Gasista matriculado ENARGAS** (matrícula nacional, firma con responsabilidad legal personal) obligatoria para todo trabajo de gas; **electricista matriculado** ante la distribuidora/provincia para conexiones y certificaciones. **[OBLIGACIÓN — recae en el prestador]**
- **Autoridades.** Secretaría de Comercio / Defensa del Consumidor; AAIP (datos); ENARGAS (gas).

### 2.3 Chile

- **Marco.** No hay puerto seguro legislado. **Ley 19.496** (protección al consumidor), reformada por la **Ley 21.398 "Pro Consumidor"** (2021) y el **Reglamento de Comercio Electrónico**, refuerza deberes de información y tiende a **responsabilizar a marketplaces/intermediarios**. Debate regulatorio abierto (SERNAC vs. cámaras de comercio) sobre el alcance de la responsabilidad del intermediario; jurisprudencia reciente ha **condenado a marketplaces** por conductas propias (p. ej. cancelación unilateral). **[HECHO — SERNAC/jurisprudencia]**
- **Calificación de Hireeo.** En **escenario A**, intermediario de descubrimiento con deberes propios de información veraz y no inducir a error (Ley 19.496). En **escenario B** (cobra/retiene), el riesgo de ser tratado como **proveedor** frente al consumidor crece sustancialmente. **[INFERENCIA]**
- **Contratación a distancia.** **Retracto de 10 días** en compras electrónicas (art. 3 bis Ley 19.496); si no se envía confirmación escrita de condiciones, el plazo se extiende a **90 días**. Deber de informar **costo total** y plazos. **[OBLIGACIÓN]**
- **Oficios regulados.** Instaladores eléctricos y de gas deben estar **autorizados y registrados en la SEC** (Registro Nacional de Instaladores; licencias por clase; DS 191 para gas). El buscador público de la SEC permite verificar vigencia. **[OBLIGACIÓN — recae en el prestador]** Listar prestadores no autorizados en electricidad/gas es un foco de riesgo reputacional y de consumo. **[INFERENCIA]**
- **Autoridades.** SERNAC (consumo); Agencia de Protección de Datos (en transición, Ley 21.719); SEC (electricidad/gas).

### 2.4 España / Unión Europea

Es la jurisdicción con **más deberes activos** y donde el diseño de Hireeo (ranking, destacados, IA con *tools*, escrow futuro) tiene mayor impacto.

- **Régimen de intermediarios.** **LSSI-CE (Ley 34/2002) art. 16**: exención de responsabilidad del prestador de **alojamiento** por contenido ajeno mientras (i) no tenga **conocimiento efectivo** de la ilicitud y (ii) actúe con diligencia para retirarlo al conocerlo. **[OBLIGACIÓN]** Este régimen convive con y es desplazado en parte por el **DSA (Reglamento UE 2022/2065)**, aplicable en su totalidad desde **17/02/2024**. **[OBLIGACIÓN — vigente]**
- **DSA — calificación.** Como servicio de **alojamiento** que además es **plataforma en línea**, y —de forma determinante— como **"plataforma en línea que permite a los consumidores celebrar contratos a distancia con comerciantes"**, activaría la **Sección 4 (arts. 29–32)**. El DSA **cubre servicios, no solo bienes** (marketplaces, alojamiento, viajes). **[OBLIGACIÓN condicional]** Obligaciones relevantes:
  - **Art. 30 — trazabilidad de comerciantes (KYC):** recabar y esforzarse razonablemente por verificar identidad, dirección, contacto, documento y registro mercantil **antes** de permitir operar; suspender a quien no la aporte. El **KYC hoy es stub** (H5) → **brecha directa**. **[OBLIGACIÓN condicional / brecha]**
  - **Art. 31 — compliance by design:** interfaz que permita al comerciante cumplir su normativa (incl. mostrar credenciales); *random checks* en bases oficiales. **[OBLIGACIÓN condicional]**
  - **Arts. 16/17 — notice-and-action** y declaración de motivos de retirada. La moderación `PENDING→ACTIVE` (H8) es base insuficiente; falta canal de notificación y apelación. **[OBLIGACIÓN condicional / brecha]**
  - **Arts. 26/27 — publicidad y transparencia de parámetros de recomendación/ranking:** `featured`/`Sponsor` (H3) deben identificarse como publicidad y explicarse los parámetros principales. **[OBLIGACIÓN condicional]**
  - **Art. 25 — prohibición de dark patterns.**
  - **Exención pyme (art. 19):** microempresas y pequeñas empresas están exentas de varias obligaciones de la Sección 3 (no de las de trazabilidad de la Sección 4 en lo esencial). Verificar tamaño del operador (ligado a Q1). **[SUPUESTO]**
- **P2B (Reglamento UE 2019/1150).** Regula la relación **plataforma ↔ prestadores empresariales** (business users): T&C claras, **preaviso de cambios**, **transparencia de los parámetros de ranking** y de si el pago (destacados) influye en él, motivación de suspensiones y **sistema interno de reclamaciones** + mediación. Aplica con independencia del DSA. Los prestadores de Hireeo que actúen profesionalmente son *business users*. **[OBLIGACIÓN — vigente]**
- **Consumo.** Directiva 2011/83 (derechos de los consumidores) + **Directiva Omnibus (2019/2161)**: información precontractual, **desistimiento 14 días** (con excepción de servicios plenamente ejecutados con consentimiento), y —clave— **transparencia sobre reseñas** (verificación de que provienen de usuarios reales) y sobre **quién es la contraparte contractual** (Hireeo vs. prestador) y su condición de comerciante o no. **[OBLIGACIÓN]**
- **IA con *tools* (H4).** El agente que sugiere proveedores y **crea solicitudes** interactúa con personas y **participa activamente** en el emparejamiento; esto (i) refuerza que Hireeo **no** es un alojamiento pasivo respecto de esa función y (ii) activa deberes de **transparencia de IA** (EU AI Act art. 50 — informar que se interactúa con IA) — se desarrolla en la Fase 6 (`ai/`). **[OBLIGACIÓN — transparencia; clasificación de riesgo en Fase 6]**
- **Oficios regulados.** Instalador autorizado de **baja tensión** (RD 842/2002, ITC-BT-03) y de **gas**; habilitación válida en todo el territorio (Ley 17/2009). **[OBLIGACIÓN — recae en el prestador]**
- **Autoridades.** Coordinador de Servicios Digitales (DSA), AEPD (datos), autoridades de consumo autonómicas/nacionales, órganos de industria de cada CCAA.

### 2.5 Estados Unidos (federal + estatal)

- **Sección 230 CDA.** Otorga inmunidad al operador frente a reclamos que lo traten como **"publisher or speaker"** de contenido de terceros (p. ej. un anuncio o reseña de un prestador). **No es inmunidad absoluta:** no cubre (i) responsabilidad por **conducta/diseño propio** de la plataforma, (ii) incumplimiento de **regulación de la transacción** (el 9º Circuito, *HomeAway/Airbnb v. Santa Monica*, avaló obligar a la plataforma a **no completar reservas** ilegales sin ello violar §230), (iii) reclamos de **IP** (fuera de §230; ver DMCA), ni (iv) actos donde la plataforma **co-crea** el contenido ilícito. Tendencia 2025-2026: lectura **más estrecha** de §230 en el 9º Circuito. **[OBLIGACIÓN — federal / jurisprudencia]**
- **Exposición por diseño e IA.** La función de **IA con *tools*** (H4) que genera recomendaciones/solicitudes puede considerarse **contenido propio** de Hireeo (no de un tercero) y por tanto **fuera del paraguas de §230** — foco de riesgo de responsabilidad por negligencia/producto. **[INFERENCIA / riesgo]**
- **FTC Act §5.** Prohíbe prácticas **desleales o engañosas**: reseñas falsas (Rule on Consumer Reviews and Testimonials, 2024), resultados patrocinados no divulgados, **dark patterns** y **autorenovación** oscura (relevante para suscripciones premium; ver también estatales). **[OBLIGACIÓN — federal]**
- **Estatal/local.** (i) **Licenciamiento de oficios:** electricistas/plomeros/contratistas requieren **licencia estatal**; el ejercicio sin licencia acarrea multas (USD 500–15.000+), en California incluso **pena de cárcel** en primera ofensa y **pérdida del derecho a cobrar**. Facilitar contratación de no licenciados en estados estrictos es riesgo material. **[OBLIGACIÓN — recae en el prestador; riesgo de facilitación para la plataforma]** (ii) **Autorenovación:** leyes estatales (California ARL, etc.) exigen consentimiento claro y cancelación fácil. (iii) **Marketplace/facilitator laws** (impositivas) y reglas de transparencia estatales. Análisis estado por estado en Fase 3 (`country-analysis/united-states-state-local-matrix.md`). **[OBLIGACIÓN — variable]**
- **Autoridades.** FTC (federal); fiscalías estatales, juntas de licenciamiento (contractor state boards), reguladores de consumo estatales.

---

## 3. Cuándo el diseño de Hireeo **aumenta** la responsabilidad de la plataforma

Ordenado de menor a mayor incremento de exposición. Cada factor traslada a Hireeo desde "intermediario pasivo" hacia "participante activo/proveedor".

| Factor de diseño (evidencia) | Efecto jurídico | Jurisdicciones más sensibles |
|---|---|---|
| Alojar anuncios/reseñas de terceros (H1) | Mínimo — núcleo de la exención de hosting/§230/*Rodríguez*. | Todas (favorable) |
| **Ranking, destacados, `Sponsor`** (H3) | Deberes de transparencia; publicidad encubierta si no se divulga. | ES-UE (P2B, DSA 26/27), US (FTC), CL, AR |
| **Moderación activa de reseñas** (H8) | Puede generar deber de diligencia y de proceso (notice-and-action, apelación). | ES-UE (DSA 16/17) |
| **IA que recomienda y crea solicitudes** (H4) | Contenido **propio** → puede **excluir** la exención de intermediario (§230) y sumar deberes de transparencia de IA. | US (§230), ES-UE (DSA + AI Act 50) |
| **Cobro/retención de fondos y comisión** (escenario B, H2) | Acerca a **proveedor / merchant of record / cadena de comercialización**; en AR activa riesgo de **solidaridad (art. 40 LDC)**; en CL riesgo de ser tratado como proveedor. | AR, CL, ES-UE, US |
| **Verificación/sello de prestadores** (KYC real, H5) | Genera **expectativa de confianza**: verificar mal puede fundar responsabilidad por representación; **no verificar** en oficios de riesgo, responsabilidad por facilitación. | Todas |

**Regla operativa [BUENA PRÁCTICA]:** cuanto más control ejerza Hireeo sobre precio, cobro, emparejamiento y presentación (y cuanto más "propia" sea la salida de IA), más deberes activos y mayor riesgo de recalificación como proveedor. La mitigación no es un disclaimer, sino **controles reales**: divulgación de patrocinio, verificación de credenciales en oficios regulados, notice-and-action operativo y separación clara de contrapartes contractuales.

---

## 4. Servicios regulados / de alto riesgo — deberes exigibles a prestadores

Los oficios objetivo de Hireeo (electricidad, gas, construcción, transporte/fletes) están **regulados** en las 5 jurisdicciones y exigen credenciales al **prestador**. Hireeo no es el obligado primario, pero **omitir su verificación** en categorías de riesgo es la principal fuente de responsabilidad propia por facilitación y de incumplimiento del art. 30/31 DSA en la UE.

| Oficio | UY | AR | CL | ES-UE | US |
|---|---|---|---|---|---|
| Electricidad | Técnico/firma registrada UTE; URSEA | Electricista matriculado (distribuidora/provincia) | Instalador autorizado SEC (RNII) | Instalador autorizado BT (RD 842/2002) | Licencia estatal de electricista |
| Gas | Instalador habilitado; URSEA | Gasista matriculado ENARGAS (nacional) | Instalador de gas licenciado SEC (DS 191) | Instalador de gas autorizado + carné | Licencia estatal de plomero/gas |
| Construcción/obras | Reglas municipales/profesionales | Matrículas provinciales; colegios | Permisos municipales; SEC si aplica | Colegios profesionales; licencias de obra | Contractor license estatal |
| Transporte/fletes | Habilitación de transporte de carga | Habilitación CNRT/municipal | Registro/permisos de transporte | Autorización de transporte + seguro | CDL/USDOT según carga |

**Deberes de Hireeo recomendados [BUENA PRÁCTICA / OBLIGACIÓN condicional en UE]:** (i) whitelist de categorías y bloqueo de servicios prohibidos/altamente regulados sin credencial; (ii) captura y verificación del número de licencia/matrícula contra registros oficiales (SEC, ENARGAS, UTE, registros de industria, state boards); (iii) exigir seguro de responsabilidad civil donde el oficio lo requiera; (iv) mostrar la credencial verificada en el perfil (compliance by design, DSA art. 31).

---

## 5. Trazabilidad, retiro de contenido y conservación de evidencia

- **UE (obligación más exigente).** DSA: **art. 30** (trazabilidad de traders), **art. 16** (mecanismo de notificación de contenido ilícito), **art. 17** (motivación de retirada), **arts. 9/10** (cumplir órdenes de autoridades y de información), **art. 20/21** (reclamaciones internas y resolución extrajudicial). **[OBLIGACIÓN condicional]**
- **AR/CL/UY.** Deber de **retirar tras notificación** de ilícito manifiesto y de **colaborar con la autoridad**; conservar la notificación y la acción tomada como prueba de diligencia. **[OBLIGACIÓN / BUENA PRÁCTICA]**
- **US.** Sin mandato general de takedown (§230), salvo **DMCA** para IP (notice-and-takedown, repeat infringer). **[OBLIGACIÓN — IP]**
- **Brecha actual.** No hay canal formal de notice-and-action ni logs de decisiones de moderación documentados en el repo (más allá de `Rating.status` y `IntegrationAuditLog`). **[HECHO — brecha]**

---

## 6. Responsabilidades entre partes y límites de exclusión

- **Contrato principal.** [INFERENCIA] El contrato de servicio se forma **entre cliente y prestador**; Hireeo provee un **contrato de intermediación** separado. Debe mostrarse con claridad quién es la contraparte (exigido por consumo UE y buena práctica en LatAm/US) para evitar la recalificación como proveedor.
- **Límites de exclusión de responsabilidad [OBLIGACIÓN].** En **ninguna** de las 5 jurisdicciones puede excluirse válidamente, frente a **consumidores**, la responsabilidad por dolo/culpa grave, por daños a la vida/integridad, ni derogar derechos legales de consumo (desistimiento, garantía legal, información). Cláusulas "as-is" totales son inválidas frente a consumidores en UE, CL, AR y UY; en US su validez es estatal y no cubre negligencia grave. Un disclaimer de "Hireeo solo conecta" **no** neutraliza responsabilidad si de hecho cobra, verifica o co-crea contenido. **[OBLIGACIÓN]**
- **Indemnidades del prestador** hacia Hireeo son válidas B2B (respaldadas por P2B en UE en cuanto a equidad), pero **no** oponibles al consumidor.
- **Seguros [BUENA PRÁCTICA].** Póliza de RC de la plataforma + exigencia de seguro al prestador en oficios de riesgo; conservación de evidencia para litigios y disputas.

---

## 7. Impacto de la arquitectura de pagos en la calificación legal (Escenario A vs B)

Esta es la **decisión de producto más determinante** para el perfil de riesgo. Hoy los pagos están en stub/mock (H2), lo que mantiene a Hireeo en el extremo favorable, pero **la decisión debe tomarse antes de lanzar cobros**.

### Escenario A — "Solo conecta" (pago directo cliente↔prestador, fuera de la plataforma)

- **Calificación:** intermediario / alojamiento / plataforma de descubrimiento. Máxima cobertura de las exenciones (LSSI 16, §230 para contenido, doctrina *Rodríguez*).
- **Consecuencias:** Hireeo **no** es merchant of record; **no** activa licencias de transmisión de dinero, PCI-DSS propio ni obligaciones de escrow. Responsabilidad de consumo por el servicio recae en el prestador; Hireeo responde solo por su conducta propia (info, ranking, moderación, IA).
- **Sigue obligando:** DSA arts. 30/31/16/26 en UE (por permitir contratos a distancia), P2B, transparencia de ranking/reseñas, verificación de oficios regulados.
- **Riesgo residual:** facilitación de prestadores no licenciados; reseñas falsas; salida de IA dañina.

### Escenario B — "Hireeo cobra/retiene vía escrow real" (comisión 15%, split payment)

- **Calificación:** se **desplaza hacia proveedor / merchant of record / parte de la cadena de comercialización**. En **AR** se agrava el riesgo de **responsabilidad solidaria (art. 40 LDC)**; en **CL** riesgo de ser tratado como proveedor bajo Ley 19.496; en **UE** refuerza deberes de consumo y de plataforma; en **US** puede activar reglas de **money transmitter** estatales y responsabilidad por el flujo de fondos.
- **Obligaciones nuevas [OBLIGACIÓN condicional]:** contrato con PSP y definición de MoR; **PCI-DSS** en el alcance del cobro; **KYC/KYB y AML** proporcional; gestión de chargebacks/reembolsos; **facturación e IVA/impuestos digitales**; en UE, reporte **DAC7** de plataformas si hay intermediación de pago; posibles **licencias de dinero/entidad de pago** según flujo (retención de fondos = mayor probabilidad de licencia). Estos ejes se desarrollan en la Fase 8 (`payments-tax/`).
- **Mitigación de licencia [GUÍA]:** usar al PSP (Stripe/MercadoPago) como **agregador/merchant of record** y evitar que Hireeo retenga fondos en cuenta propia reduce (no elimina) el riesgo de necesitar licencia de transmisión de dinero. Requiere confirmar el modelo con el PSP (Q2, BLOCKING).

### Recomendación de secuencia

1. **Resolver Q1 (entidad legal) y Q2 (modelo de pago) antes de salir de stub.** Son BLOCKING para toda la clasificación.
2. Si se busca **minimizar exposición al lanzamiento**, comenzar en **Escenario A** (o B con el PSP como MoR y sin retención propia de fondos) y sumar controles activos (verificación de credenciales, notice-and-action, transparencia de ranking) desde el día uno.
3. Migrar a escrow con retención propia solo con estructura legal, licencias, PCI y AML resueltos.

---

## 8. Preguntas abiertas específicas de Fase 2

| ID | Pregunta | Bloquea | Prioridad |
|---|---|---|---|
| M1 | ¿El operador retendrá fondos en cuenta propia o el PSP actuará como MoR/agregador? | Licencias de dinero, PCI, solidaridad AR. | **BLOCKING** |
| M2 | ¿Se permitirán oficios regulados (electricidad, gas, transporte) y se verificará la credencial contra registros oficiales? | DSA 30/31; facilitación de no licenciados. | HIGH |
| M3 | ¿El operador califica como microempresa/pequeña empresa a efectos de las exenciones DSA art. 19? | Alcance de obligaciones DSA. | HIGH |
| M4 | ¿La salida del agente de IA se presenta como recomendación propia de Hireeo o como resultado neutral de búsqueda? | Exclusión de §230; transparencia AI Act. | HIGH |
| M5 | ¿Existirá canal formal de notice-and-action y apelación de moderación? | DSA 16/17; diligencia LatAm. | MEDIUM |

---

## 9. Registro de fuentes (acceso 2026-07-23)

> Fuentes primarias marcadas **[P]**; secundarias/orientativas **[S]** (usadas solo para contexto).

- **[P] DSA — Reglamento (UE) 2022/2065**, arts. 6, 9-10, 16-17, 19, 25-27, 29-32. Texto: eu-digital-services-act.com/Digital_Services_Act_Articles.html; EUR-Lex CELEX 32022R2065.
- **[S]** Freshfields, "DSA decoded #9: online marketplaces" — technologyquotient.freshfields.com/post/102lx12 (alcance arts. 29-32 a servicios).
- **[P] P2B — Reglamento (UE) 2019/1150** (aplicable desde 12/07/2020); Directrices de transparencia de ranking de la Comisión Europea — digital-strategy.ec.europa.eu.
- **[P] LSSI-CE — Ley 34/2002**, art. 16 — noticias.juridicas.com/base_datos/Admin/l34-2002.html; lssi.digital.gob.es.
- **[P]** Directiva 2011/83/UE (derechos de los consumidores) y Directiva Omnibus 2019/2161.
- **[P]** RD 842/2002 (REBT), ITC-BT-03 — industria.gob.es; Ley 17/2009 (libre acceso a actividades de servicios).
- **[P] CSJN Argentina**, *Rodríguez, María Belén c/ Google Inc.* (28/10/2014); ratif. *Gimbutas* y *Mazza* (2021) — csjn.gov.ar; abogados.com.ar/15712.
- **[P] Ley 24.240** (Defensa del Consumidor, art. 40 solidaridad); **Resolución SCI 270/2020** y **271/2020** — argentina.gob.ar/normativa; boletinoficial.gob.ar (20200908).
- **[P] ENARGAS** (matrícula gasista); electricista matriculado por distribuidora — enargas.gob.ar.
- **[P] Ley 19.496 Chile** (art. 3 bis retracto) + **Ley 21.398 "Pro Consumidor"** + Reglamento de Comercio Electrónico — sernac.cl/portal/604/w3-propertyvalue-66795.html; leychile.cl.
- **[P] SEC Chile** — Registro Nacional de Instaladores; licencia de gas (DS 191) — sec.cl; chileatiende.gob.cl (fichas 65520, 2641, 67276).
- **[S]** SERNAC, "valora fallo que condena a marketplace por cancelación unilateral" — sernac.cl/portal/604/w3-article-83673.html.
- **[P] Ley 17.250 Uruguay** (Relaciones de Consumo, art. 16 rescisión) + Decreto 244/000 — impo.com.uy/bases/leyes/17250-2000; mef.gub.uy.
- **[P] UTE** (registro de técnicos y firmas instaladoras); **URSEA** — ute.com.uy/clientes/tramites-y-servicios/firmas-y-tecnicos-instaladores.
- **[P] Sección 230 CDA** (47 U.S.C. §230); **FTC Act §5** + Rule on Consumer Reviews (2024).
- **[P/S]** 9th Cir., *HomeAway.com/Airbnb v. City of Santa Monica* (2019); *Doe v. Grindr* (9th Cir. 2025); roundup Eric Goldman (blog.ericgoldman.org/archives/2026/01) **[S]**.
- **[S]** Licenciamiento de oficios US (electricista/plomero/contractor) — procore.com/library/contractors-license-guide-all-states; nextinsurance.com.

> Las URLs completas y la ficha por fuente se consolidan en `08-source-register.md` (pendiente). Antes de publicar cualquier documento, verificar vigencia de cada norma y el texto consolidado en el diario oficial correspondiente.
