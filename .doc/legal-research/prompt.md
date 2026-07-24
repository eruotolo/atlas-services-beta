# Megaprompt para Claude Code — Due Diligence Legal Internacional de Hireeo

&gt; **Propósito.** Copia el bloque siguiente y ejecútalo desde la raíz del repositorio de Hireeo. Está diseñado para una investigación y auditoría de cumplimiento de un marketplace de servicios impulsado por IA. No sustituye el asesoramiento de abogados habilitados en cada jurisdicción; su finalidad es producir un expediente de investigación verificable, una evaluación técnica y borradores que abogados locales puedan revisar y adaptar.

```text

# MISIÓN Y ESTÁNDAR DE TRABAJO

Actúa como una práctica multidisciplinaria de due diligence tecnológica internacional, compuesta por especialistas en privacidad, protección de consumidores, plataformas digitales, comercio electrónico, inteligencia artificial, propiedad intelectual, ciberseguridad, pagos, tributación digital, competencia, derecho laboral y litigios. Tu objetivo es preparar a Hireeo para una revisión de inversionistas, clientes enterprise, auditores, autoridades regulatorias y potenciales reclamantes.

No eres un generador de plantillas. Antes de redactar cualquier documento jurídico debes investigar, inspeccionar y verificar. No afirmes que Hireeo cumple una ley si no puedes enlazar esa afirmación con evidencia del repositorio, de la configuración de proveedores o con una decisión operativa documentada. No inventes funcionalidades, proveedores, certificados, ubicaciones de datos, bases jurídicas, periodos de retención, medidas de seguridad, flujos de cobro ni prácticas empresariales.

Trabaja con rigor de abogado y auditor:

- Distingue siempre entre: (1) hecho confirmado, (2) inferencia técnica razonable, (3) supuesto pendiente de confirmar, (4) obligación jurídica, (5) guía/regla no vinculante y (6) recomendación de buena práctica.

- Usa fuentes primarias y vigentes como primera opción: textos consolidados de leyes, reglamentos, diarios oficiales, sentencias, autoridades supervisoras, organismos laborales, fiscales y de consumo. Usa fuentes secundarias solo para contexto y nunca como único sustento de una conclusión material.

- Registra URL, organismo emisor, fecha de publicación/actualización, fecha de acceso, jurisdicción, idioma y artículos/secciones relevantes para cada conclusión importante.

- Verifica la vigencia a la fecha de ejecución. Identifica normas en vigor, con entrada en vigor futura, propuestas, guías consultivas y normas derogadas. No trates un proyecto de ley como obligación actual.

- Cuando un asunto dependa de un hecho de negocio o de configuración que no esté en el repositorio, formula la pregunta exacta, explica el riesgo de seguir sin respuesta y continúa usando un supuesto marcado. No detengas toda la auditoría por faltas de información.

- No eludas el análisis complejo con cláusulas genéricas de “cumplir la ley aplicable”. Explica qué ley, a quién aplica, qué activa la obligación, el riesgo, el responsable y la acción verificable.

- Identifica conflictos entre jurisdicciones y propone el estándar global más protector cuando sea viable, junto con excepciones locales necesarias.

- No des asesoramiento individual ni presentes borradores como asesoramiento definitivo. En todos los entregables jurídicos incluye un bloque de “revisión por abogado local pendiente” y una lista de hechos que deben validarse antes de publicación.

La aplicación es **Hireeo**, un Hub/Marketplace de Servicios con capacidades de IA. No la clasifiques como plataforma de reclutamiento ni supongas que procesa CVs, selecciona empleados o toma decisiones de contratación, salvo que la evidencia del repositorio lo demuestre. Su función puede incluir, según se confirme: conectar clientes con prestadores, perfiles, publicación y descubrimiento de servicios, mensajería, calificaciones, contenidos, reservas, pagos, suscripciones, comisiones, automatizaciones y resultados o recomendaciones generados por IA.

Las jurisdicciones de lanzamiento son Uruguay, Argentina, Chile, España y Estados Unidos. Diseña el expediente para expansión internacional posterior. En Estados Unidos analiza nivel federal y estatal/local cuando resulte material; no lo reduzcas a una sola “ley estadounidense”.

# REGLAS DE ALCANCE, SEGURIDAD Y SALIDA

## Ubicación única de salida

Guarda **todos** los hallazgos, fuentes, matrices, borradores, inventarios, preguntas, evidencias y documentos generados exclusivamente en:

`.doc/legal-research/`

Crea los directorios necesarios. No escribas documentos legales fuera de esa carpeta. Usa Markdown legible, enlaces relativos, tablas cuando aporten claridad y fechas ISO `YYYY-MM-DD`). No sobrescribas investigación previa: conserva versiones, incorpora un registro de cambios y fecha cada actualización.

## Estructura mínima obligatoria

```text

.doc/legal-research/

  [README.md](http://README.md)

  [00-executive-summary.md](http://00-executive-summary.md)

  [01-scope-assumptions-and-open-questions.md](http://01-scope-assumptions-and-open-questions.md)

  [02-product-and-data-map.md](http://02-product-and-data-map.md)

  [03-legal-entity-and-role-map.md](http://03-legal-entity-and-role-map.md)

  [04-global-obligation-register.md](http://04-global-obligation-register.md)

  [05-risk-matrix.md](http://05-risk-matrix.md)

  [06-remediation-roadmap.md](http://06-remediation-roadmap.md)

  [07-evidence-index.md](http://07-evidence-index.md)

  [08-source-register.md](http://08-source-register.md)

  [09-implementation-traceability.md](http://09-implementation-traceability.md)

  country-analysis/

  privacy/

  cookies/

  ai/

  marketplace/

  consumer-and-commercial/

  payments-tax/

  intellectual-property/

  security/

  vendors-and-transfers/

  employment-and-platform-work/

  accessibility-and-content/

  code-audit/

  legal-documents/

  checklists/

  appendices/

```

En [`README.md`](http://README.md), indica el alcance, fecha de corte, versión, limitaciones, cómo leer el expediente y los documentos que requieren aprobación humana. En [`08-source-register.md`](http://08-source-register.md), conserva una tabla de fuentes con identificador único que pueda citarse desde cualquier informe. En [`07-evidence-index.md`](http://07-evidence-index.md), registra cada evidencia de repositorio: archivo, líneas/fragmento, fecha, conclusión limitada y riesgo asociado. No copies secretos, datos personales ni tokens en los informes.

## Método de investigación

1. Lee primero los archivos de instrucciones del repositorio y sus reglas locales.

2. Haz un inventario no destructivo del repositorio y de la configuración disponible. Examina frontend, backend, infraestructura como código, pipelines, variables de entorno de ejemplo, manifiestos de dependencias, esquemas de BD, migraciones, endpoints, SDKs, contratos, pruebas, documentación y configuraciones de terceros.

3. Empieza por una fase de descubrimiento de hechos. Formula preguntas de alto impacto antes de decidir bases jurídicas, periodos de retención o contenido de políticas.

4. Investiga por tema y por país. Cada conclusión material debe tener una fuente y una fecha de vigencia verificadas.

5. Traduce obligaciones a controles operativos, propietarios, evidencia requerida y cambios específicos de producto. Las políticas deben describir únicamente prácticas confirmadas o decisiones que el equipo acepte implementar.

6. Redacta al final los documentos de cara al usuario y los anexos B2B, diferenciando claramente borradores de versiones publicables tras revisión legal.

No modifiques código, configuración de producción, cuentas externas ni datos. Esta misión es de auditoría y documentación. Puedes proponer parches o especificaciones de cambios, pero no los apliques salvo instrucción posterior explícita.

# FASE 0 — GOBIERNO DEL PROYECTO, ALCANCE Y CUESTIONARIO

Genera [`01-scope-assumptions-and-open-questions.md`](http://01-scope-assumptions-and-open-questions.md) y una tabla de decisión. Determina, desde el código y la documentación, lo siguiente; para lo que no pueda verificarse, formula una pregunta concreta y marca el estado `BLOCKING`, `HIGH`, `MEDIUM` o `LOW`:

- entidad(es) legal(es), país de constitución, domicilios, marcas, responsables internos y quién actúa como operador de la plataforma;

- usuarios: visitantes, clientes, prestadores, empresas, consumidores, administradores, moderadores, afiliados, API users y menores potenciales;

- naturaleza de la relación: mero intermediario, agente, vendedor de registro, proveedor de pagos, marketplace de servicios digitales/presenciales, o combinación;

- países reales de usuarios, idioma, moneda, geolocalización, disponibilidad por país y mecanismos de geobloqueo;

- flujo completo de alta, verificación, publicación, búsqueda, contacto, contratación, reserva, pago, entrega, revisión, disputa, reembolso, suspensión y eliminación;

- modelos de ingreso: comisiones, suscripción, publicidad, destacados, créditos, afiliación, datos agregados, pagos o cualquier otro;

- qué papel desempeña cada parte en cada tratamiento: responsable/controlador, encargado/procesador, corresponsable, proveedor independiente o destinatario;

- categorías de datos, datos especialmente protegidos/sensibles, datos de niños, identidad, localización, comunicaciones, metadatos, contenido, pagos y datos inferidos;

- proveedores y subprocesadores: nube, CDN, analítica, autenticación, correo, SMS, pagos, IA, almacenamiento, soporte, error tracking, sesiones, anuncios, captcha, video, mapas y KYC;

- dónde se alojan, acceden, respaldan y transfieren los datos; retención real; eliminación; exportación; recuperación de backups; legal holds;

- IA: casos de uso, modelos/proveedores, entradas, salidas, prompts, herramientas, RAG, memoria, entrenamiento/fine-tuning, evaluación, moderación, decisión humana y controles contra uso indebido;

- contenido de usuarios: textos, imágenes, archivos, datos de terceros, reseñas, mensajes, listados y contenido generado por IA;

- pagos: quién cobra, quién liquida, si se retienen fondos, tarjetas/billeteras, procesador, impuestos, facturación, chargebacks, escrow y KYC/KYB;

- seguridad, autenticación, permisos, auditoría, cifrado, incidentes, backups, disponibilidad, soporte y acceso administrativo;

- contratos existentes, acuerdos con proveedores, DPA, SCC, términos de pagos, licencias y pólizas de seguro.

Publica una “Ficha de producto confirmada” separada de los supuestos. Esta ficha será la fuente de verdad para los borradores posteriores. Si la evidencia contradice la descripción inicial, prioriza la evidencia y explica la diferencia.

# FASE 1 — INVENTARIO TÉCNICO, MAPA DE DATOS Y PRUEBAS DE IMPLEMENTACIÓN

Produce [`02-product-and-data-map.md`](http://02-product-and-data-map.md), [`03-legal-entity-and-role-map.md`](http://03-legal-entity-and-role-map.md), `code-audit/[00-repository-inventory.md](http://00-repository-inventory.md)` y `privacy/[data-inventory-and-ropa-draft.md](http://data-inventory-and-ropa-draft.md)`.

## 1.1 Auditoría de arquitectura y código

Revisa en profundidad:

- rutas/pantallas, APIs, webhooks, colas, cron jobs, funciones serverless, SDKs, integraciones y paneles administrativos;

- formularios y campos de recolección; permisos del navegador/dispositivo; carga de archivos; búsqueda; perfiles; chat; reseñas; notificaciones y marketing;

- modelos de datos, tablas, buckets, índices de búsqueda, caches, logs, métricas, trazas, backups y exportaciones;

- autenticación, autorización, roles, sesiones, MFA, recuperación de cuentas, SSO, gestión de secretos, administración y segregación de funciones;

- cookies, local storage, píxeles, tags, gestores de consentimiento, analítica, ads, fingerprinting, mapas y reproductores externos;

- librerías, licencias, imágenes/íconos, fuentes, modelos, datasets, prompts, modelos de ML y servicios de IA;

- infraestructura, regiones, redes, almacenamiento, cifrado, WAF, rate limits, cabeceras, CORS, CSP, CSRF, validación de inputs, logs y observabilidad;

- pagos, suscripciones, impuestos, facturas, reembolsos y datos de tarjeta; verifica que no se almacenen datos PCI no necesarios;

- flujos de derechos de privacidad: acceso, rectificación, eliminación, portabilidad, oposición, retirada de consentimiento, preferencias y apelación;

- procesos de moderación, reportes, denuncia de contenido ilícito, bloqueo, investigación, motivos de decisión, notificación y apelaciones.

Para cada hallazgo cita archivo/ruta/línea cuando sea posible, describe el comportamiento observado, datos afectados, países impactados, obligación potencial, riesgo, mitigación y evidencia de verificación. Clasifica los hallazgos en `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` e `INFO`. Distingue vulnerabilidades técnicas de incumplimientos jurídicos potenciales.

## 1.2 Inventario y ciclo de vida de datos

Construye un diagrama y tablas que cubran por cada categoría: origen, titular, campo/ejemplo no real, finalidad, base jurídica candidata, rol de Hireeo, destinatarios, ubicación, transferencias, retención, mecanismo de eliminación, acceso, seguridad, derechos y evidencia. Incluye:

- datos de cuenta y verificación; perfiles de clientes y prestadores; información profesional/comercial;

- comunicaciones, tickets, reseñas, denuncias, moderación y registros de decisiones;

- información transaccional, facturación, impuestos, reembolsos, fraude y chargebacks;

- identificadores en línea, IP, cookies, dispositivos, eventos, analítica y geolocalización;

- contenidos y archivos; datos de terceros que los usuarios suban;

- prompts, inputs, outputs, embeddings, evaluaciones, telemetría y logs de IA;

- datos de soporte, seguridad, auditoría, backups y administradores.

Evalúa minimización, limitación de finalidad, precisión, separación de entornos, seudonimización, retención y destrucción verificable. Elabora un borrador de Registro de Actividades de Tratamiento (ROPA) apto para completar, sin declarar que está finalizado si faltan hechos.

# FASE 2 — CLASIFICACIÓN LEGAL DEL MODELO DE MARKETPLACE

Genera `marketplace/[01-platform-role-and-liability-analysis.md](http://01-platform-role-and-liability-analysis.md)`. Analiza, por jurisdicción, si Hireeo puede ser considerado intermediario, proveedor de alojamiento, plataforma en línea, proveedor de servicios de la sociedad de la información, marketplace, anunciante, agente, comerciante, procesador de pagos, proveedor de servicios digitales o cualquier categoría relevante.

Evalúa especialmente:

- cuándo el diseño, ranking, publicidad, precio, cobro, términos, soporte o control de la transacción aumenta la responsabilidad de la plataforma;

- deberes de información, transparencia, trazabilidad de comerciantes/prestadores, mecanismos de reporte, cooperación con autoridades, retiro de contenido/servicios ilegales y conservación de evidencias;

- servicios prohibidos, regulados o de alto riesgo (salud, legales, financieros, menores, trabajos peligrosos, alcohol/tabaco, sexual, juegos/apuestas, transporte, alojamiento, construcción, educación, seguridad, etc.); crea un marco de categorías y consulta si existirán;

- identidad, edad, capacidad legal, credenciales profesionales, licencias, seguros, impuestos y verificación de prestadores cuando proceda;

- reseñas, rankings, recomendaciones, publicidad encubierta, resultados patrocinados, dark patterns y manipulación;

- contratación a distancia, información precontractual, desistimiento, cancelación, no-show, reembolsos, garantías y solución de conflictos;

- responsabilidades entre cliente, prestador, procesador de pago y Hireeo; indemnidades y límites válidos, sin intentar excluir derechos inderogables;

- estrategias de seguros, conservación de evidencia, mediación y manejo de reclamos.

# FASE 3 — INVESTIGACIÓN JURISDICCIONAL PROFUNDA

Crea un expediente por país bajo `country-analysis/`, con al menos:

```text

country-analysis/

  [uruguay.md](http://uruguay.md)

  [argentina.md](http://argentina.md)

  [chile.md](http://chile.md)

  [spain-eu.md](http://spain-eu.md)

  [united-states-federal.md](http://united-states-federal.md)

  [united-states-state-local-matrix.md](http://united-states-state-local-matrix.md)

  [comparative-matrix.md](http://comparative-matrix.md)

```

Cada informe debe contener: resumen ejecutivo; aplicabilidad; leyes vigentes; autoridades; obligaciones concretas; plazos; registros/autorizaciones; contratos; avisos obligatorios; sanciones con fuente; jurisprudencia, resoluciones o enforcement relevante; proyectos y fechas futuras; diferencias B2C/B2B; controles técnicos/operativos; preguntas abiertas; y una matriz `obligación → evidencia → propietario → prioridad → fecha objetivo`.

## 3.1 Uruguay

Investiga, como mínimo, protección de datos personales y autoridad competente; derechos y bases de tratamiento; datos sensibles; transferencias internacionales; seguridad y breach handling; comunicaciones comerciales; comercio electrónico, consumo y contratos electrónicos; firmas; propiedad intelectual; delitos informáticos; ciberseguridad; tributación/IVA digital y facturación si aplican; regulación de plataformas/intermediarios, pagos, AML/KYC y defensa de la competencia cuando corresponda. Verifica leyes, decretos, guías y criterios de la URCDP, organismos de consumo, BCU, DGI y otros organismos pertinentes. Distingue obligaciones efectivas de prácticas recomendadas.

## 3.2 Argentina

Investiga protección de datos y autoridad (AAIP), registros si aplican, bases, derechos, datos sensibles, transferencias, cookies, seguridad e incidentes; comunicaciones y spam; defensa del consumidor, comercio electrónico, contratos a distancia, publicidad, precios, arrepentimiento y resolución de conflictos; firma digital; propiedad intelectual; lealtad comercial/competencia; régimen tributario y facturación digital de marketplace; reglas de pagos y prevención de lavado cuando sean aplicables. Incluye normativa nacional, disposiciones regulatorias relevantes y cambios legislativos/proyectos separados de la ley vigente.

## 3.3 Chile

Investiga normativa vigente y su transición/reformas de protección de datos, autoridad, fechas de entrada en vigor, obligaciones por tamaño/rol, datos sensibles, decisiones automatizadas si existen, transferencias y sanciones. Revisa consumo, comercio electrónico, reglamentos de información/contratación, SERNAC, ley de delitos informáticos, ciberseguridad e institucionalidad, firma electrónica, comunicaciones, propiedad intelectual, plataformas y pagos. Separa estrictamente la obligación actual de la futura. Identifica deberes especiales para proveedores ubicados fuera de Chile que ofrezcan servicios a residentes.

## 3.4 España y Unión Europea

Analiza el ecosistema completo de la UE cuando Hireeo se dirija a personas en España: GDPR y LOPDGDD; ePrivacy/cookies y criterios AEPD; LSSI-CE; normativa de consumidores, comercio electrónico y contenidos/servicios digitales; Digital Services Act, incluyendo calificación de marketplace/plataforma, trazabilidad de comerciantes, notice-and-action, motivos de restricciones, reportes, publicidad, interfaces oscuras, menores, quejas y mecanismos internos; Directiva Omnibus cuando corresponda; accesibilidad europea; geoblocking si aplica; P2B Regulation para relaciones con prestadores empresariales; Data Act/Data Governance Act cuando corresponda; NIS2 y obligaciones nacionales pertinentes; ciberresiliencia cuando sea aplicable; propiedad intelectual y hosting safe harbour.

Analiza a fondo el Reglamento de IA de la UE. Determina si Hireeo es proveedor, desplegador, importador, distribuidor o integrador de sistemas de IA; si un caso de uso cae en prácticas prohibidas, alto riesgo u otra categoría; si interactúa con personas, genera contenido sintético o usa sistemas de propósito general de terceros. Examina obligaciones escalonadas y fechas de aplicación, alfabetización en IA, documentación técnica, instrucciones de uso, gestión de riesgos, calidad de datos, logs, supervisión humana, exactitud/robustez/ciberseguridad, evaluación de conformidad, registro, monitoreo postcomercialización e incidentes. No etiquetes automáticamente toda función de IA como alto riesgo: sustenta la clasificación según el uso real.

Incluye GDPR Art. 22, profiling, DPIA, interés legítimo, consentimiento, transparencia, derechos, decisiones automatizadas, roles, DPA, transferencias internacionales (SCC, TIA, medidas suplementarias) y posibles representantes UE. Incluye resoluciones/guías relevantes de AEPD, EDPB, Comisión Europea, CNIL/ICO solo como orientación comparada claramente etiquetada.

## 3.5 Estados Unidos: federal, estatal y local

Elabora [`united-states-state-local-matrix.md`](http://united-states-state-local-matrix.md) con análisis de alcance por residencia, umbrales, datos, ingresos, publicidad dirigida, venta/compartición, datos sensibles, derechos, contratos con proveedores, avisos, opt-outs, evaluación de riesgos, no discriminación, biometría, grabaciones, breach notices, privacidad infantil, email/SMS y enforcement. Incluye como mínimo los marcos federales relevantes (FTC, CAN-SPAM, TCPA si hay llamadas/SMS, COPPA, E-SIGN, DMCA, ADA/Section 508 en el alcance aplicable, FCRA si el producto entra en el supuesto, AML/OFAC cuando corresponda) y los estados con leyes integrales de privacidad vigentes o con entrada en vigor conocida, dando prioridad práctica a California (CCPA/CPRA y reglamentos), Colorado, Connecticut, Virginia, Utah, Texas, Oregon, Montana, Delaware, New Jersey, Maryland, Minnesota, Nebraska, New Hampshire, Kentucky, Indiana, Iowa, Tennessee y otros vigentes a la fecha de ejecución.

Investiga por separado leyes estatales/locales de IA, decisiones automatizadas, contratación, discriminación, auditoría de sesgos, biometría, grabación de comunicaciones y privacidad de datos de salud cuando puedan activarse. Da especial atención a Nueva York City Local Law 144 solo si Hireeo facilita herramientas de decisión automatizada en empleo; no la apliques por analogía a un marketplace general. Examina BIPA/Illinois y equivalentes si se tratan identificadores biométricos. Evalúa la Sección 230 y sus límites sin presentarla como inmunidad absoluta. Incluye legislación de protección al consumidor, prácticas engañosas y requisitos de renovación automática donde existan suscripciones.

# FASE 4 — PRIVACIDAD, DATOS PERSONALES Y TRANSFERENCIAS

Genera los archivos en `privacy/` y una matriz comparativa. Haz un análisis separado para cliente, prestador, visitante, administrador, soporte y tercero cuyos datos sean subidos por usuarios.

1. Determina para cada procesamiento la finalidad, necesidad, rol, base jurídica, deber de información, consentimiento, registro, plazo de conservación y mecanismo de derechos.

2. Analiza datos sensibles/especialmente protegidos, biometría, geolocalización precisa, identidad, menores, comunicaciones privadas, datos financieros, credenciales profesionales e inferencias.

3. Evalúa legalidad del perfilado, ranking, recomendaciones, detección de fraude, personalización, moderación y marketing; privacidad por diseño y por defecto; y necesidad de DPIA/EIPD o evaluación de riesgo equivalente.

4. Elabora un protocolo de solicitudes de derechos: autenticación, canal, plazo por país, excepciones, registro, acceso, corrección, oposición, restricción, eliminación, portabilidad, opt-out y apelación.

5. Diseña reglas de retención por categoría. Separa obligación legal, prevención de fraude, disputas, backups, analítica, cuentas inactivas, logs, impuestos, facturación y legal hold. No inventes plazos: propone valores condicionados y los datos necesarios para fijarlos.

6. Analiza transferencias internacionales, accesos remotos, subprocesadores y alojamiento. Prepara inventario de transferencias y una lista de medidas: DPA, SCC/adendas, evaluación de transferencias, medidas técnicas, residencia de datos y flujo de notificaciones.

7. Revisa brechas/incidentes: detección, investigación, preservación de evidencia, evaluación de riesgo, notificación a autoridades y titulares por jurisdicción, mensajes y plazos.

8. Establece gobierno: responsables, DPO/representante cuando sea aplicable, ROPA, formación, auditorías, gestión de proveedores, políticas internas y revisiones periódicas.

Incluye un “gap assessment” para GDPR, LOPDGDD, leyes de Uruguay, Argentina y Chile, y las leyes estadounidenses aplicables por umbral. Señala cuando Hireeo no alcance los umbrales estadounidenses y explica qué datos/ingresos debe monitorear para reevaluarlo.

# FASE 5 — COOKIES, TRACKING, MARKETING Y CONSENTIMIENTO

Genera `cookies/[cookie-and-tracker-audit.md](http://cookie-and-tracker-audit.md)`, `cookies/[consent-design-spec.md](http://consent-design-spec.md)` y una tabla de cada script/cookie/SDK observado. Para cada elemento registra proveedor, nombre, finalidad, datos, inicio, duración, categoría, país/transferencia, activación antes/después de consentimiento, documentación del proveedor y corrección requerida.

Evalúa:

- reglas de consentimiento previo, granular, informado, libre, revocable y tan fácil de retirar como de aceptar; cookies estrictamente necesarias y su justificación;

- banners, centro de preferencias, rechazo equivalente, ausencia de casillas premarcadas, retención de prueba de consentimiento y re-consentimiento;

- analítica, A/B tests, session replay, pixels, fingerprinting, local storage, tags de terceros, ads conductuales, medición y conversion APIs;

- “Do Not Sell/Share”, Global Privacy Control, opt-out de publicidad dirigida y señales de preferencia aplicables en EE. UU.;

- email, SMS, push notifications, referidos, campañas, listas, consentimiento, opt-out, supresión y pruebas de permisos;

- comunicaciones transaccionales vs. comerciales y reglas aplicables por país.

Revisa implementación real: que scripts no esenciales no se carguen ni establezcan identificadores antes de consentimiento donde es exigible, y que retirar consentimiento produzca efecto operativo. Propón criterios de aceptación y pruebas automatizables.

# FASE 6 — GOBERNANZA Y CUMPLIMIENTO DE IA

Genera en `ai/` un expediente separado, no limitado a una política pública. Incluye: [`ai-system-inventory.md`](http://ai-system-inventory.md), [`ai-classification-and-risk-assessment.md`](http://ai-classification-and-risk-assessment.md), [`ai-governance-framework.md`](http://ai-governance-framework.md), [`ai-data-and-model-governance.md`](http://ai-data-and-model-governance.md), [`ai-safety-security-and-misuse.md`](http://ai-safety-security-and-misuse.md), [`ai-user-transparency.md`](http://ai-user-transparency.md), [`ai-incident-response.md`](http://ai-incident-response.md) y [`ai-implementation-checklist.md`](http://ai-implementation-checklist.md).

## 6.1 Inventario y clasificación

Para cada función de IA identificada o propuesta: nombre, finalidad, usuario afectado, proveedor/modelo, rol de Hireeo, entradas, salidas, datos personales/sensibles, herramientas/acciones, grado de automatización, intervención humana, impacto posible, región y evidencia. Incluye chatbots, asistentes, clasificación, búsqueda semántica, ranking, recomendaciones, generación de texto/imágenes/código, moderación, detección de fraude, traducción, resumen, extracción y agentes.

Evalúa: EU AI Act, GDPR Art. 22 y profiling, DSA cuando aplique, normativa de consumidores/publicidad engañosa, copyright, protección de datos, discriminación y normas sectoriales que correspondan al tipo de servicio ofertado. Para EE. UU., analiza prácticas engañosas/dañinas bajo FTC y leyes estatales materialmente aplicables. Para Chile, Argentina y Uruguay separa norma vigente, iniciativas, lineamientos oficiales y mejores prácticas.

## 6.2 Controles de IA

Propón un marco ejecutable con:

- propósito legítimo, prohibiciones de uso y evaluación antes de lanzar una nueva función;

- calidad, procedencia, minimización, licitud y documentación de datos de entrenamiento/evaluación; no afirmes que un modelo no entrena con datos si el contrato del proveedor no lo confirma;

- pruebas de exactitud, sesgo, robustez, seguridad, alucinación, regresión y comportamiento multilingüe; métricas, umbrales y periodicidad;

- supervisión humana significativa, escalamiento, explicación del rol de IA y posibilidad de cuestionar resultados cuando el impacto sea significativo;

- controles de prompt injection, exfiltración, jailbreaks, tool abuse, fugas de secretos, contenido prohibido, malware, deepfakes, impersonación y abuso a terceros;

- logs proporcionados, minimizados, protegidos y retenidos; versionado de modelo/prompt; gestión de cambios y rollback;

- incidentes de IA, canales de reporte, triage, comunicación, contención, investigación y revisión postmortem;

- contratos con proveedores de modelos, restricciones de uso, propiedad de input/output, datos para entrenamiento, ubicación, subprocesadores, SLA, cambios de modelo, indemnidad IP, seguridad y terminación;

- alfabetización y formación de empleados; comité o dueño de riesgo de IA; registro de decisiones.

No uses disclaimers para intentar resolver un riesgo que requiere un control técnico o humano. Una cláusula de “la IA puede equivocarse” no reemplaza límites de uso, validación, supervisión ni derechos de usuario.

# FASE 7 — CONSUMO, COMERCIO ELECTRÓNICO Y CONTRATOS DE MARKETPLACE

En `consumer-and-commercial/`, investiga y documenta:

- información precontractual, identidad de partes, descripción del servicio, precio total, moneda, impuestos, comisiones, disponibilidad, condiciones, confirmación y archivo del contrato;

- quién es vendedor/prestador frente a cliente, qué contrato se forma, y cómo se muestran los términos de Hireeo frente a los del prestador;

- derechos de desistimiento/retracto cuando existan, excepciones por servicios ya ejecutados o contenidos digitales, cancelación, reprogramación, reembolso, no-show y garantías legales;

- suscripciones, pruebas gratuitas, renovación automática, recordatorios, aumentos de precio, cancelación simple, créditos y saldos;

- facturación, comprobantes, precios personalizados, descuentos, afiliados y resultados patrocinados;

- controversias, mediación, arbitraje, jurisdicción, acción de clase (solo donde sea válido), reclamos de consumo y canales de atención;

- cláusulas de limitación de responsabilidad, exclusiones, indemnidad, fuerza mayor, disponibilidad, beta, modificaciones, suspensión y terminación, evaluadas por enforceability local;

- regulación de plataformas, transparencia de ranking, reseñas y publicidad; reglas B2B para prestadores que usan la plataforma.

Identifica cláusulas que no serían exigibles contra consumidores en cada jurisdicción. No copies fórmulas de EE. UU. a España o Latinoamérica sin análisis.

# FASE 8 — PAGOS, IMPUESTOS, AML/KYC Y FRAUDE

Produce un informe condicionado a la arquitectura de pagos confirmada. Determina si Hireeo solo facilita contactos, procesa pagos por cuenta de terceros, cobra su comisión, retiene fondos, ofrece wallets/escrow, liquida a prestadores o vende servicios propios.

Analiza:

- obligaciones contractuales y de privacidad del PSP; PCI DSS y alcance de tarjetas; tokenización y no almacenamiento;

- licencias financieras/transmisión de dinero, institución de pago, agregador, marketplace payment y rol de merchant of record, por país, solo cuando el flujo las active;

- KYC/KYB, prevención de fraude, AML/CFT, sanciones y screening de listas, incluyendo criterios que justifican la activación;

- chargebacks, reservas, reembolsos, conciliación, prueba de entrega y conservación de transacciones;

- IVA/IVA digital, impuestos a servicios, retenciones, facturación electrónica, reportes de plataforma/DAC7 en UE si son aplicables y umbrales/condiciones; no dar consejo tributario definitivo sin especialista local;

- estafas, phishing, triangulación, cuentas sintéticas, suplantación, reseñas falsas y disputas. Diseña un programa de prevención proporcional y un playbook de respuesta.

# FASE 9 — PROPIEDAD INTELECTUAL, DATOS Y CONTENIDO

Genera `intellectual-property/` con análisis y borradores de política. Cubre:

- titularidad del software, marca, dominio, interfaces, bases de datos, contenidos propios, API, documentación, prompts y activos creativos;

- cadena de titularidad: empleados, contratistas, fundadores, contributors, diseños, fotos, copy, datasets y modelos; cesiones, confidencialidad y derechos morales donde correspondan;

- licencias open source: inventario de dependencias directas/transitivas, obligaciones de aviso, copyleft, AGPL/network copyleft, distribución, NOTICE, SBOM y proceso de aprobación; no concluyas incompatibilidades sin revisar la licencia y modo de distribución;

- licencia de contenido de usuarios a Hireeo, representación de derechos, derecho a moderar, sublicenciar para operar y plazo post-terminación; no sobreapropiarse de contenido;

- procedimientos de copyright: agente/DMCA si aplica, notice-and-takedown, contra-notificación, repeat infringer, expedición y evidencias; mecanismos equivalentes o seguros de alojamiento bajo leyes locales;

- marcas, nominative use, nombres de prestadores, falsificación y suplantación;

- contenido generado por IA: derechos de input/output, restricción de infracción, similitud, atribución, entrenamiento, reclamos, deepfakes, voz/imagen y publicidad engañosa;

- scraping, extracción de bases de datos, robots, API, rate limits y cláusulas razonables antiabuso; evalúa límites legales y de competencia.

# FASE 10 — MODERACIÓN, CONFIANZA Y SEGURIDAD DEL MARKETPLACE

Genera un programa de Trust &amp; Safety en `marketplace/`. Incluye política de servicios/contenidos prohibidos, matrices de severidad, detección, verificación, reportes, moderación humana/automatizada, motivos de decisión, notificaciones, apelaciones, plazos, recurrencia, transparencia y conservación de evidencia.

Analiza la responsabilidad por listados, información engañosa, servicios ilegales, fraude, discriminación, acoso, amenazas, doxxing, explotación de menores, propiedad intelectual, reseñas y contenido sintético. Evalúa requisitos de DSA para la UE de forma proporcional a la clasificación real. Incluye un diseño de “notice and action” que sea visible, accesible y auditable, sin prometer revisión inmediata si el equipo no la puede operar.

# FASE 11 — CIBERSEGURIDAD, RESILIENCIA E INCIDENTES

Genera `security/[security-and-privacy-controls-gap.md](http://security-and-privacy-controls-gap.md)`, `security/[incident-response-legal-playbook.md](http://incident-response-legal-playbook.md)`, `security/[vendor-security-review.md](http://vendor-security-review.md)` y `security/[responsible-disclosure-policy.md](http://responsible-disclosure-policy.md)`. Mapea hallazgos a OWASP ASVS/API Security, NIST CSF, CIS Controls, ISO 27001/27701, SOC 2 y ENISA solo como marcos de referencia, identificando qué controles son obligación legal versus preparación enterprise.

Evalúa manejo de secretos, control de acceso, MFA, RBAC, sesiones, cifrado en tránsito/en reposo, rotación, backups, restauración, segmentación, hardening, SDLC, dependencias, SAST/DAST, logs, monitoreo, rate limiting, WAF, vulnerabilidades, pentests, respuesta a incidentes, continuidad y recuperación. Revisa con especial atención exposición de PII en logs, acceso de soporte, buckets, enlaces firmados, errores, enumeración de cuentas, IDOR, XSS, CSRF, SSRF, inyección, open redirects, CORS, webhooks, uploads y APIs de IA.

Para cada control no confirmado, no inventes que existe. Propón evidencia de auditoría y criterios de aceptación. Analiza leyes de notificación de brechas aplicables y genera árboles de decisión, plazos condicionados y plantillas internas, sin enviar notificaciones reales.

# FASE 12 — PROVEEDORES, CONTRATOS Y TRANSFERENCIAS

En `vendors-and-transfers/`, crea un inventario de todos los terceros hallados y un cuestionario/DPA checklist para los no confirmados. Para cada uno documenta: servicio, datos, rol, región, subprocesadores, finalidad, seguridad, retención, transferencia, soporte, contrato, entrenamiento de IA, breach notification, SLA, terminación y evidencia.

Prepara una estrategia de contratos: DPA, cláusulas de encargado, instrucciones, confidencialidad, asistencia en derechos/brechas, auditoría, subencargados, transferencia, devolución/eliminación, responsabilidad y requisitos de seguridad. Para UE/EEE analiza SCC y evaluación de transferencia; no declares que las SCC están implementadas sin el contrato firmado.

# FASE 13 — ACCESIBILIDAD, MENORES, DISCRIMINACIÓN Y DERECHOS HUMANOS

Analiza accesibilidad del servicio por país, en especial obligaciones y riesgo de litigio en España/UE y Estados Unidos. Audita contra WCAG 2.2 AA como estándar técnico recomendado y señala requisitos legales aplicables. Incluye formularios, registro, pagos, consentimientos, reportes, chat y contenido generado.

Define enfoque para menores: edad mínima, verificación proporcional, consentimiento parental donde se active, categorías prohibidas, publicidad, tratamiento y escalamiento. No supongas que todos los usuarios son adultos.

Evalúa discriminación, sesgos, precios, ranking, suspensión, verificación y moderación. Si el marketplace permite servicios profesionales o acceso a oportunidades económicas, analiza el impacto de decisiones automatizadas y de criterios de elegibilidad. Diseña controles de no discriminación, auditoría y apelación sin atribuir a Hireeo un estatus laboral o de empleador que no esté confirmado.

# FASE 14 — DOCUMENTACIÓN LEGAL A REDACTAR AL FINAL

Solo después de completar fases 0–13, prepara borradores en `legal-documents/`. Cada documento debe indicar su audiencia, jurisdicción/cobertura, versión, fecha de vigencia propuesta, hechos que requieren confirmación y dependencias técnicas. Mantén documentos globales con anexos locales cuando sea mejor que versiones contradictorias. Redacta en español claro; crea versión inglesa cuando el producto o país objetivo lo requiera y marca la versión controlante tras consulta legal.

El paquete mínimo, condicionado a las funcionalidades confirmadas, debe incluir:

1. Términos de Servicio de Hireeo (cliente/usuario general).

2. Términos para Prestadores, incluyendo condiciones B2B/P2B si procede.

3. Política de Privacidad global con anexos de Uruguay, Argentina, Chile, España/UE y EE. UU.

4. Aviso de Privacidad de California y demás avisos/opt-outs estadounidenses requeridos.

5. Política de Cookies, texto de banner y especificación del centro de preferencias.

6. Política de IA Responsable, aviso de transparencia de IA y condiciones de uso de funciones de IA.

7. Política de Uso Aceptable y lista de servicios/contenidos prohibidos.

8. Política de Confianza y Seguridad, reportes, moderación y apelaciones.

9. Política de Reseñas y Rankings, publicidad/patrocinio y transparencia del algoritmo cuando corresponda.

10. Política de Propiedad Intelectual, copyright, notice-and-takedown/DMCA y repeat infringer.

11. Aviso de Seguridad, divulgación responsable de vulnerabilidades y canal de reporte.

12. Aviso de Accesibilidad y procedimiento de feedback.

13. Política de Retención y Eliminación de Datos (interna) y procedimiento de derechos de titulares.

14. Política interna de respuesta a incidentes y breach notification.

15. DPA/Anexo de tratamiento para clientes empresariales y cláusulas de proveedor/subprocesador.

16. Términos comerciales: pagos, reembolsos, cancelaciones, suscripciones, comisiones e impuestos, si el flujo confirmado lo requiere.

17. Avisos de marketing, SMS/push y programa de consentimiento/supresión, si procede.

18. Matriz de contratos corporativos necesarios: cesión IP, empleo/contratistas, NDA, DPA, acuerdos de proveedores y seguros sugeridos.

No incluyas cláusulas que contradigan el comportamiento real. Para cada cláusula material agrega, en un anexo interno no público, una referencia a la política/proceso/código que debe existir para respaldarla. Resalta con [[DECISION REQUIRED]] los campos que no se pueden completar legítimamente.

# FASE 15 — MATRIZ DE RIESGO, CUMPLIMIENTO Y TRAZABILIDAD

Genera [`05-risk-matrix.md`](http://05-risk-matrix.md), [`04-global-obligation-register.md`](http://04-global-obligation-register.md), [`09-implementation-traceability.md`](http://09-implementation-traceability.md), [`06-remediation-roadmap.md`](http://06-remediation-roadmap.md) y checklists por país/tema.

## Formato obligatorio de matriz de riesgos

Incluye al menos estas columnas:

| ID | Riesgo/escenario de litigio | Hecho/evidencia | Jurisdicción | Norma/autoridad | Probabilidad | Impacto | Exposición (legal, financiera, reputacional, operativa) | Controles actuales | Brecha | Mitigación específica | Propietario | Prioridad | Dependencia | Evidencia de cierre | Estado |

Construye escenarios reales: acceso indebido a datos, tracking sin consentimiento, transferencia no documentada, servicio fraudulento, accidente entre partes, cobro/reembolso controvertido, reseña falsa, contenido ilícito, reclamación IP, salida de IA dañina/alucinada, sesgo/ranking injusto, suplantación, menor, breach, renovación oscura, precio engañoso, incumplimiento de derechos, dependencia de proveedor, pérdida de backups y suspensión injustificada. Para cada escenario no exageres: explica las condiciones que lo activan y los límites de la evidencia.

## Registro de obligaciones

Para cada obligación registra la cita precisa, fecha/estado de vigencia, aplicabilidad, requisito, evidencia, sistema/proceso afectado, propietario, frecuencia, documento de soporte, prioridad y acción. Separa `MANDATORY NOW`, `MANDATORY BY FUTURE DATE`, `CONDITIONAL`, `RECOMMENDED` y `NOT APPLICABLE WITH RATIONALE`.

## Hoja de ruta

Prioriza acciones en 0–14 días, 15–45 días, 46–90 días, pre-lanzamiento, y continuidad trimestral. Para cada acción detalla criterio de aceptación, responsable sugerido (Legal, Product, Engineering, Security, Operations, Finance, Trust &amp; Safety), dependencias y costo/efuerzo estimado cualitativo. Los bloqueadores de lanzamiento deben ser explícitos.

# FASE 16 — AUDITORÍA DE COHERENCIA Y CONTROL DE CALIDAD

Antes de dar por finalizado el expediente, ejecuta controles internos:

- compara cada afirmación de políticas con evidencia de código, configuración o decisión aceptada;

- verifica que toda conclusión legal material tenga fuente primaria, vigencia y enlace;

- verifica que no se haya confundido reclutamiento con marketplace de servicios;

- verifica que las jurisdicciones sean tratadas separadamente y que EE. UU. incluya el análisis estatal material;

- verifica que las fechas futuras de GDPR/AI Act, reformas locales y leyes estatales no se presenten como vigentes si no lo son;

- verifica que el consentimiento de cookies y preferencias coincida con la implementación observada;

- verifica que retención, eliminación, backups y derechos no se prometan sin soporte técnico;

- verifica que limitaciones de responsabilidad, arbitraje, desistimiento y exclusiones respeten derechos inderogables;

- verifica que los avisos de IA no sustituyan controles reales;

- verifica que las referencias de archivos no expongan credenciales, secretos ni datos personales;

- verifica enlaces, tabla de contenidos, numeración, versionado y trazabilidad.

Agrega `appendices/[quality-control-report.md](http://quality-control-report.md)` con errores encontrados, correcciones y elementos imposibles de verificar. Mantén una lista visible de “Supuestos críticos pendientes de aprobación” en el resumen ejecutivo.

# FORMATO DE ENTREGA AL TERMINAR

1. No respondas con una afirmación genérica de cumplimiento.

2. Deja todos los archivos dentro de `.doc/legal-research/`.

3. Actualiza el [`README.md`](http://README.md) con un índice de entregables y estado: completado, parcial, pendiente de información o requiere abogado local.

4. En [`00-executive-summary.md`](http://00-executive-summary.md), entrega un resumen para fundadores: perfil de producto confirmado, 10 riesgos principales, bloqueadores, exposición por país, decisiones requeridas, costos/esfuerzos de mitigación y próximos pasos.

5. En la respuesta final, muestra únicamente: archivos creados/actualizados, riesgos críticos, información que bloquea conclusiones y los cinco próximos pasos priorizados. Cita las rutas de los documentos.

La calidad se mide por trazabilidad, exactitud, vigencia, concreción técnica y honestidad sobre incertidumbres; no por cantidad de cláusulas ni por longitud.

```

## Nota de uso

El prompt exige que Claude Code trabaje sobre la evidencia real del repositorio y mantenga separados los requisitos vigentes, futuros y condicionados. Antes de publicar cualquier documento legal resultante, debe revisarlo un profesional habilitado en las jurisdicciones aplicables.

