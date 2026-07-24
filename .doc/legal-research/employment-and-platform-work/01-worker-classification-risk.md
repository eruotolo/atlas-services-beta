# Riesgo de reclasificación laboral de los prestadores (Fase 13 — tangencial en el encargo original)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales/profesionales.
- **Fecha de corte / acceso a fuentes:** 2026-07-23
- **Versión:** 0.1 (borrador de análisis jurídico condicionado)
- **Extiende:** `marketplace/01-platform-role-and-liability-analysis.md` (no repite su análisis de rol de plataforma/responsabilidad frente a consumidores; aquí el sujeto de análisis es la relación Hireeo↔prestador, no Hireeo↔cliente).

> **Aviso.** Documento de investigación técnico-jurídica, no asesoramiento legal. Se distingue explícitamente entre **[HECHO]** (evidencia en repo), **[INFERENCIA]** técnica razonable, **[SUPUESTO]** pendiente de confirmar, **[OBLIGACIÓN]** jurídica vigente, **[GUÍA]** no vinculante y **[BUENA PRÁCTICA]**. Conforme a la instrucción explícita del encargo (Fase 13), este documento **no atribuye a Hireeo un estatus de empleador que no esté confirmado** — analiza riesgo de reclasificación, no una conclusión de que exista relación laboral.

---

## 0. Hechos de partida (desde el repo)

| # | Hecho | Efecto sobre el riesgo de reclasificación | Evidencia |
|---|---|---|---|
| L1 | El **prestador fija su propio precio** al crear el servicio (`CreateServiceDto.precio`, campo obligatorio ingresado por quien publica el servicio). | **Reduce el riesgo** — la fijación de precio por el propio trabajador es uno de los indicios más citados de independencia económica en todos los tests legales revisados en este documento. | `backend/src/modules/services/dto/create-service.dto.ts:49-52` |
| L2 | **No se encontró evidencia** en el schema ni en los DTOs de un campo de horario/disponibilidad obligatorio controlado por Hireeo, ni de exclusividad exigida al prestador. | **Reduce el riesgo**, pero es una ausencia de evidencia, no una política explícita confirmada — no declarar que Hireeo garantiza flexibilidad total sin una política escrita. | Búsqueda negativa en `backend/prisma/schema.prisma` y `backend/src/modules/services/` |
| L3 | El campo `level` (`BASIC`/`PREMIUM`) y `featured`/`Sponsor` (ya documentados como H3 en `marketplace/01`) son mecanismos de **visibilidad pagada**, no de evaluación de desempeño tipo empleado. | Neutro — es un mecanismo comercial (publicidad), no de control laboral. | `backend/prisma/schema.prisma` (`Service.level`, `Service.featured`, `Sponsor`) |
| L4 | El sistema de `Rating` (calificación de clientes al prestador) es generado por **terceros (clientes)**, no por Hireeo evaluando el desempeño del prestador como lo haría un empleador. | **Reduce el riesgo** en la mayoría de los tests (que distinguen entre reputación pública y supervisión/evaluación de desempeño por el principal), pero **algunos tests modernos de "gestión algorítmica"** (ver Directiva UE 2024/2831, §3) sí consideran los sistemas de calificación como una forma de control si determinan acceso a trabajo futuro — **no se puede descartar el riesgo solo por ser calificación de clientes**. | `backend/prisma/schema.prisma` (`Rating`); ya documentado como H8 en `marketplace/01` |
| L5 | No hay evidencia de un flujo de **asignación algorítmica** de trabajo (Hireeo no asigna un cliente a un prestador específico de forma automática — el cliente busca y elige). El agente de IA (H4 en `marketplace/01`) puede **sugerir** prestadores, pero no confirma la asignación. | **Reduce el riesgo** — la ausencia de asignación algorítmica obligatoria es un factor a favor de independencia, especialmente relevante bajo la Directiva UE 2024/2831 (que se centra en la "gestión algorítmica"). | `ai-agents.service.ts:27-70` (ya citado en `marketplace/01` H4) |

**Conclusión de esta sección [INFERENCIA]:** el diseño actual de Hireeo, tal como está evidenciado en el repositorio, se parece más a un marketplace de anuncios (los prestadores fijan precio, eligen si publicar, no tienen horario impuesto) que a una plataforma de gestión algorítmica de trabajo tipo delivery/rideshare (donde la plataforma asigna viajes/pedidos y fija tarifas). Esto es favorable para mantener la clasificación de contratista/profesional independiente, pero **no es una garantía** — dos factores no verificados (exclusividad de facto y evaluación cualitativa fuera del sistema de `Rating`) podrían cambiar esta conclusión y deben confirmarse (ver §5).

---

## 1. Tests legales de clasificación — por jurisdicción

### 1.1 Uruguay

- **Test general.** No hay una ley específica de "trabajo de plataformas". Se aplica el test general de la legislación laboral: **subordinación jurídica** (dependencia, ajenidad, remuneración) según los criterios clásicos del Derecho del Trabajo uruguayo — dirección, supervisión y disciplina por el empleador. **[OBLIGACIÓN — marco general, no específico de plataformas]**
- **Normativa específica de plataformas:** **no se identificó** una ley uruguaya de trabajo de plataformas digitales vigente a la fecha de este informe. **[HECHO — ausencia de norma específica, no verificado exhaustivamente]**
- **Consecuencia de reclasificación:** de confirmarse relación de dependencia, aplicarían las cargas de la seguridad social (BPS), indemnización por despido, licencias, y responsabilidad retroactiva por aportes no realizados. **[INFERENCIA — régimen general]**

### 1.2 Argentina

- **Test general.** Ley de Contrato de Trabajo (20.744): presunción de relación laboral cuando hay prestación de servicios bajo dependencia, con los tres elementos clásicos — dependencia jurídica (subordinación a directivas), económica (remuneración como única/principal fuente de ingreso) y técnica (organización del trabajo por el empleador). **[OBLIGACIÓN — marco general]**
- **Normativa específica de plataformas:** a la fecha de este informe, **no existe una ley vigente** de trabajo de plataformas digitales en Argentina. Hay un **proyecto de reforma laboral en debate en el Congreso (2025-2026)** que reconocería explícitamente relación de dependencia para trabajadores de reparto/transporte de plataformas bajo demanda (repartidores de comida, conductores de apps), con obligaciones específicas (100% de propinas al trabajador, seguro de accidentes). **[SUPUESTO — proyecto de ley, NO vigente; no tratar como obligación actual]**
- **Alcance del proyecto:** el proyecto está redactado específicamente para plataformas de **reparto/entrega y transporte de pasajeros bajo demanda** — su texto, según lo relevado, no está dirigido a marketplaces de servicios profesionales/técnicos como electricistas o gásfiter. **No debe asumirse que Hireeo quedaría comprendido** sin revisar el texto final si se aprueba. **[SUPUESTO]**
- **Consecuencia de reclasificación:** cargas sociales retroactivas, multas de la Ley 25.323 (indemnización agravada por despido sin registración), riesgo de responsabilidad solidaria si se activa el art. 40 de la Ley de Defensa del Consumidor de forma simultánea (ya señalado en `marketplace/01` §2.2 para el escenario de pagos B). **[INFERENCIA]**

### 1.3 Chile

- **Test general.** Código del Trabajo: presunción de laboralidad cuando hay **subordinación y dependencia** (criterios clásicos: cumplimiento de un horario, obligación de asistencia, subordinación a instrucciones, exclusividad relativa). **[OBLIGACIÓN — marco general]**
- **Normativa específica de plataformas — Ley 21.431 (verificada):** publicada el 2022-03-11, vigente desde el **2022-09-01**, modifica el Código del Trabajo para regular específicamente a los "trabajadores de plataformas digitales de servicios". **Su ámbito de aplicación está definido para empresas que gestionan servicios mediante aplicaciones de retiro, distribución y/o reparto de bienes/mercaderías, o transporte menor de pasajeros** (el caso típico es Uber, Didi, Rappi, PedidosYa). **[OBLIGACIÓN — vigente, pero de alcance acotado]**
- **Aplicabilidad a Hireeo [SUPUESTO — requiere confirmación por categoría de servicio]:** Hireeo no es, en su descripción general, una plataforma de reparto o transporte de pasajeros. Sin embargo, si Hireeo habilita una categoría de **fletes/mudanzas** que pudiera calificarse como "transporte menor" o "distribución de bienes", esa categoría específica podría quedar dentro del ámbito de la Ley 21.431 — **debe analizarse categoría por categoría, no asumir exclusión total ni inclusión total**.
- **Contenido de la Ley 21.431 (si aplicara):** establece la naturaleza del vínculo (puede ser dependiente o independiente, según cómo se estructure la relación), obligaciones de seguridad y salud en el trabajo (capacitación, elementos de protección personal) y transparencia algorítmica básica. **[OBLIGACIÓN condicional]**
- **Consecuencia de reclasificación (régimen general, fuera de la Ley 21.431):** cotizaciones previsionales retroactivas, indemnización por años de servicio, multas de la Dirección del Trabajo. **[INFERENCIA]**

### 1.4 España / Unión Europea

- **Test nacional (España).** El Estatuto de los Trabajadores exige **ajenidad y dependencia**; desde 2021 existe la llamada **"Ley Rider"** (Real Decreto-ley 9/2021, de 11 de mayo de 2021), que estableció una **presunción legal de laboralidad** para las personas que prestan servicios retribuidos de reparto/distribución de productos de consumo/mercancías consistentes en la entrega en el marco de una actividad organizada por un empleador a través de la gestión algorítmica del servicio. Esta reforma siguió a la sentencia del Tribunal Supremo (Sala Social) del 25 de septiembre de 2020 (caso Glovo), que declaró la existencia de relación laboral de un repartidor. **[OBLIGACIÓN — vigente; alta confianza por conocimiento jurídico consolidado, no reverificado en este informe con fuente primaria directa — pendiente confirmar cita exacta del BOE]**
- **Alcance de la "Ley Rider":** está redactada específicamente para **reparto/distribución de productos de consumo**, no para servicios profesionales presenciales tipo electricista/gásfiter. **Hireeo, al no ser una plataforma de reparto, no encajaría directamente en esta presunción específica** — pero el test general de laboralidad del Estatuto de los Trabajadores (ajenidad y dependencia) sigue aplicando a cualquier prestador, con independencia del sector. **[INFERENCIA]**
- **Directiva (UE) 2024/2831 sobre trabajo en plataformas — VERIFICADA:**
  - Entró en vigor el **2024-12-01**.
  - **Plazo de transposición a legislación nacional: 2026-12-02.**
  - **A la fecha de este informe (2026-07-23), ningún Estado miembro de la UE ha completado la transposición** — el estado reportado es: 0 de 27 con ley transpuesta en vigor, 4 con una presunción preexistente parcialmente en línea con la Directiva, 5 en fase de redacción, 18 sin haber comenzado. **[HECHO — verificado, con fecha de corte de la fuente cercana a la de este informe]**
  - **Contenido relevante:** introduce una **presunción legal de relación laboral** cuando la plataforma ejerce control o dirección sobre la ejecución del trabajo (criterios: control de la remuneración, supervisión del desempeño por medios electrónicos, restricción de la libertad de organizar el trabajo, restricción de la posibilidad de tener otros clientes). Impone también obligaciones de **transparencia y supervisión humana de la gestión algorítmica** (similar en espíritu al art. 22 GDPR y al art. 50 del AI Act, ya analizados en otras fases de este expediente). **[OBLIGACIÓN — futura, no vigente hoy en ningún país; aplicable desde que cada Estado la transponga, a más tardar 2026-12-02]**
  - **Implicación para Hireeo [INFERENCIA]:** aunque hoy no está transpuesta, Hireeo debería diseñar su relación con los prestadores **anticipando** los criterios de la Directiva (evitar control de remuneración más allá de la comisión de intermediación, evitar restringir que el prestador trabaje para otros, evitar supervisión de desempeño equivalente a gestión algorítmica de un empleado) — es una buena práctica de anticipación regulatoria, no una obligación exigible hoy.
- **Autoridades:** Inspección de Trabajo y Seguridad Social (España); autoridades laborales nacionales equivalentes en cada Estado miembro tras la transposición.

### 1.5 Estados Unidos (federal + estatal, foco California)

- **Test federal.** No hay un test único federal uniforme — varía según la ley aplicable (impuestos: IRS common-law test; salarios: FLSA "economic realities test" del Departamento de Trabajo). **[VARIABLE]**
- **California — AB5 y los tests "Borello"/"Dynamex" (ABC test):** la Ley AB5 (2019) codificó el **"ABC test"** de la sentencia *Dynamex Operations West, Inc. v. Superior Court* (2018): para ser contratista independiente, la empresa debe probar las tres condiciones — (A) el trabajador está libre del control de la empresa en la realización del trabajo; (B) el trabajo realizado está fuera del curso habitual del negocio de la empresa; y (C) el trabajador habitualmente se dedica a un oficio, ocupación o negocio establecido de forma independiente. El incumplimiento de **cualquiera** de las tres condiciones implica que es empleado. **[OBLIGACIÓN — vigente]**
- **Proposition 22 — VERIFICADO, situación en litigio activo:**
  - Prop 22 (aprobada por votación popular en 2020) creó una **excepción al ABC test específicamente para conductores de transporte y reparto basados en aplicaciones** ("app-based drivers"), estableciendo que son contratistas independientes si controlan su propio horario, pueden usar múltiples apps, elegir sus propios trabajos y trabajar en otros empleos legales — a cambio de ciertos beneficios mínimos (pago mínimo garantizado, seguro por lesiones, aporte a salud).
  - La **Corte Suprema de California confirmó la constitucionalidad de Prop 22 en julio de 2024** (rechazando el desafío de sindicatos).
  - **Advertencia de inestabilidad — no verificado con precisión suficiente para citar como definitivo:** se reportan desarrollos posteriores contradictorios (una corte de apelaciones en abril de 2026 habría fallado a favor de las empresas confirmando que Prop 22 es "mayormente constitucional", pero también se reporta que un juez de primera instancia la habría declarado inconstitucional en un fallo separado). **Estas dos afirmaciones son difíciles de conciliar con una sentencia firme de la Corte Suprema de 2024 y no se pudieron verificar con una fuente primaria única y confiable en el tiempo disponible — se recomienda una verificación adicional específica antes de citar el estado de Prop 22 en cualquier documento publicable.** **[SUPUESTO — estado exacto de litigio en 2026 no confirmado con certeza]**
  - **Alcance de Prop 22 [INFERENCIA importante]:** la excepción de Prop 22 está redactada específicamente para **conductores de transporte y reparto ("app-based drivers")** — **no protege genéricamente a un marketplace de servicios profesionales como Hireeo**. Si Hireeo opera en California, sus prestadores (electricistas, gásfiter, fletes) se evaluarían bajo el **ABC test general de AB5**, no bajo la excepción de Prop 22, salvo que la categoría de "fletes" pudiera interpretarse como transporte/reparto — de nuevo, análisis categoría por categoría, no una respuesta única.
- **Otros estados:** el test varía; algunos usan un test de "control" más flexible similar al common law. Fuera del alcance de esta investigación puntual — se recomienda un análisis estado por estado si Hireeo opera en EE.UU. con volumen relevante, similar al ya hecho para privacidad en `country-analysis/united-states-state-local-matrix.md`.
- **Consecuencia de reclasificación en EE.UU.:** responsabilidad retroactiva por impuestos de nómina no retenidos (FICA, FUTA), multas de la EDD/IRS, exposición a demandas colectivas por horas extra y beneficios no pagados — este último riesgo es particularmente alto en California por la disponibilidad de acciones colectivas laborales (PAGA).

---

## 2. Consecuencias comparadas de una reclasificación errónea

| Jurisdicción | Consecuencia principal | Retroactividad |
|---|---|---|
| Uruguay | Aportes BPS no realizados, indemnización por despido, licencias no gozadas | Sí, típicamente hasta el máximo del plazo de prescripción laboral |
| Argentina | Multas agravadas (Ley 25.323), aportes retroactivos, posible responsabilidad solidaria si coincide con el art. 40 LDC (escenario de pagos B) | Sí |
| Chile | Cotizaciones previsionales retroactivas, indemnización por años de servicio, multas de la Dirección del Trabajo; régimen especial si aplica la Ley 21.431 | Sí |
| España / UE | Cotizaciones a la Seguridad Social retroactivas, sanciones de la Inspección de Trabajo, riesgo de acción colectiva; la Directiva 2024/2831 (una vez transpuesta) facilitará la presunción de laboralidad, aumentando este riesgo a futuro | Sí |
| EE.UU. (California) | Impuestos de nómina retroactivos, multas EDD/IRS, exposición a demandas PAGA (Private Attorneys General Act) — puede ser el riesgo económico más alto de las cinco jurisdicciones por la disponibilidad de acciones colectivas | Sí |

---

## 3. Factores de diseño que aumentan o reducen el riesgo (síntesis transversal)

| Factor | ¿Aumenta o reduce el riesgo? | Estado en Hireeo hoy |
|---|---|---|
| El prestador fija su propio precio | Reduce | **[HECHO]** confirmado — L1 |
| Exclusividad exigida (no poder trabajar para otros/competidores) | Aumenta si existe | No hay evidencia de que se exija — **[SUPUESTO, ausencia de evidencia, no política confirmada]** |
| Control de horario/disponibilidad obligatoria | Aumenta si existe | No hay evidencia de que se controle — mismo estatus que el anterior |
| Asignación algorítmica obligatoria de trabajo (la plataforma decide quién atiende a quién) | Aumenta si existe | No hay evidencia — el cliente elige al prestador, no lo asigna un algoritmo (L5) |
| Evaluación de desempeño más allá de calificación pública de clientes (ej. "score interno" que determina visibilidad o suspensión) | Aumenta si existe | `Service.level`/`featured` son mecanismos comerciales pagados, no evaluación de desempeño — pero **no se verificó** si existe algún criterio interno de suspensión por bajo desempeño más allá de moderación de contenido (`Rating.status`) |
| Uso de herramientas/materiales propios del prestador | Reduce | **[INFERENCIA]** — los oficios (electricidad, gas, fletes) requieren herramientas propias del oficio por naturaleza; no hay evidencia de que Hireeo provea herramientas |
| Posibilidad de subcontratar o delegar el trabajo a un tercero | Reduce si se permite | No investigado — pendiente (ver §5) |

---

## 4. Fuentes primarias

| ID | Fuente | Órgano | URL | Fecha | Fecha de acceso |
|---|---|---|---|---|---|
| EMP-CL-01 | Ley 21.431 (modifica el Código del Trabajo) | Diario Oficial de Chile / Ministerio del Trabajo | https://www.isl.gob.cl/beneficios/ley-n21-431-para-empresas-y-trabajadores-as-de-plataformas-digitales-de-servicios/ | 2022-03-11 (publicación); 2022-09-01 (vigencia) | 2026-07-23 |
| EMP-AR-01 | Proyecto de reforma laboral — trabajadores de plataformas digitales (en debate, Congreso de la Nación) | Cámara de Diputados / cobertura especializada | https://eleconomista.com.ar/politica/reforma-laboral-congreso-cambia-trabajadores-plataformas-digitales-n92876 ; https://chequeado.com/el-explicador/reforma-laboral-que-cambia-para-los-repartidores-y-choferes-de-apps-que-dicen-expertos-y-como-se-regula-en-otros-paises/ | 2025-2026 (proyecto en curso, no aprobado) | 2026-07-23 |
| EMP-EU-01 | Directiva (UE) 2024/2831 sobre mejora de las condiciones laborales en el trabajo en plataformas | Parlamento Europeo y Consejo | https://www.teamed.global/eu-platform-work ; https://iuslaboris.com/insights/eu-platform-work-directive-which-countries-have-implemented/ | 2024-12-01 (entrada en vigor) — plazo de transposición 2026-12-02 | 2026-07-23 |
| EMP-ES-01 | Real Decreto-ley 9/2021 ("Ley Rider") | Gobierno de España / BOE | (conocimiento jurídico consolidado — **pendiente confirmar cita exacta BOE-A-2021-XXXX antes de publicación**) | 2021-05-11 | 2026-07-23 — no reverificado con fuente primaria directa en este informe |
| EMP-US-01 | California AB5 (2019) — codifica el ABC test de *Dynamex Operations West, Inc. v. Superior Court* (2018) | Legislatura de California / Corte Suprema de California | (conocimiento jurídico consolidado — pendiente cita oficial leginfo.legislature.ca.gov) | AB5: 2019; Dynamex: 2018-04-30 | 2026-07-23 |
| EMP-US-02 | Proposition 22 y confirmación de constitucionalidad por la Corte Suprema de California | Corte Suprema de California | https://perkinscoie.com/insights/update/california-supreme-court-upholds-proposition-22 | 2024-07 | 2026-07-23 — **desarrollos posteriores (2026) no verificados con precisión, ver §1.5** |

---

## 5. Preguntas abiertas

| ID | Pregunta | Bloquea | Prioridad |
|---|---|---|---|
| EMP-Q1 | ¿Existe alguna política interna (aunque no esté en el código) que exija exclusividad, horario mínimo o disponibilidad a los prestadores? | Toda la conclusión de bajo riesgo de este documento depende de que la respuesta sea "no" | **BLOCKING** |
| EMP-Q2 | ¿Habrá una categoría de "fletes/mudanzas" u otra que pueda interpretarse como transporte/reparto bajo la Ley 21.431 (Chile) o la eventual reforma argentina? | Determina si esa categoría específica requiere análisis bajo régimen de plataformas de reparto | **HIGH** |
| EMP-Q3 | ¿Existe o se planea algún mecanismo de suspensión/desactivación de prestadores por "bajo desempeño" distinto de la moderación de contenido ilícito ya documentada? | Un mecanismo de evaluación de desempeño acercaría a Hireeo a un modelo de gestión algorítmica tipo empleador | **HIGH** |
| EMP-Q4 | ¿Se permite a los prestadores subcontratar o delegar el trabajo a terceros? | Factor de independencia adicional, no confirmado | MEDIUM |
| EMP-Q5 | Verificar con fuente primaria directa (BOE) el texto exacto del Real Decreto-ley 9/2021 y confirmar si la definición de "reparto/distribución" podría interpretarse ampliamente para incluir alguna categoría de Hireeo | Antes de descartar aplicabilidad en España | MEDIUM |
| EMP-Q6 | Verificar con fuente primaria (no secundaria) el estado exacto de la litigiosidad de Prop 22 en 2026 antes de citarlo en cualquier documento publicable | Precisión de §1.5 | MEDIUM |

---

## 6. Revisión por abogado local pendiente

Este documento es un análisis de riesgo de reclasificación, no una conclusión de que Hireeo sea o no empleador. La solidez de la conclusión favorable de §0 y §3 depende enteramente de que las preguntas abiertas de §5 (especialmente EMP-Q1 y EMP-Q3) se respondan en el sentido esperado. Requiere validación de abogado laboralista habilitado en cada una de las cinco jurisdicciones antes de cualquier afirmación pública sobre la naturaleza de la relación Hireeo-prestador. La cita de la "Ley Rider" española (EMP-ES-01) y de AB5/Dynamex (EMP-US-01) se basan en conocimiento jurídico consolidado no reverificado contra el texto oficial en este informe — deben confirmarse antes de publicación.
