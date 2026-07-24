# Chile — expediente jurisdiccional (Fase 3.3)

- **Fecha de corte:** 2026-07-23
- **Versión:** 0.1 — investigación jurídica condicionada.
- **Producto:** Hireeo, marketplace de servicios manuales/profesionales con IA. Pagos MercadoPago y escrow 15% están en STUB/MOCK; Gemini 2.5 Flash opera (agente con herramientas y clasificador); no hay verificación de edad; se almacenan latitud/longitud precisas; OAuth Google/Apple/Microsoft; GTM+GA4 cargan sin gate de consentimiento.

> **Revisión por abogado local pendiente.** Este es un expediente de investigación, no asesoramiento jurídico definitivo, y no declara cumplimiento. Distingue [HECHO] confirmado en repositorio, [INFERENCIA], [SUPUESTO], [OBLIGACIÓN VIGENTE], [FUTURA], [CONDICIONAL] y [RECOMENDACIÓN]. Antes de publicar avisos o activar pagos deben validarse entidad/RUT/domicilio, rol de pagos, ubicación de datos, contratos de proveedores y categorías de servicios.

## 1. Resumen ejecutivo

1. **Estado exacto Ley 21.719 al 2026-07-23:** publicada el **2024-12-13**, pero su texto permanente que reforma la Ley 19.628, crea el régimen completo y habilita la potestad sancionadora de la Agencia **no rige aún**. El artículo primero transitorio fija **2026-12-01**; hasta **2026-11-30** rige Ley 19.628 en versión actual. El Consejo de la Agencia puede prepararse antes, pero sus instrucciones sólo serán obligatorias desde esa fecha. [CL-01, disposiciones transitorias].
2. **Riesgo actual:** Hireeo trata cuenta, mensajería, contenido, analítica y geolocalización. Ley 19.628 exige finalidad, consentimiento cuando corresponda, seguridad/diligencia, secreto y canal ARCO; ausencia de CMP para GTM/GA4, política verificable, flujo ARCO y retención documentada impide afirmar cumplimiento. [CL-02, arts. 4, 7, 9–12, 16].
3. **Riesgo B2C:** Reglamento de Comercio Electrónico aplica expresamente a operadores de plataformas con servicios de terceros. Hay deber de información previa, precio total y transparencia; en consumo el intermediario de servicios responde directamente frente al consumidor por obligaciones contractuales, sin perjuicio de repetir contra prestador. [CL-05, arts. 2–3; CL-04, art. 43].
4. **Preparación no diferible:** desde 2026-12-01 Ley 21.719 será extraterritorial si se ofrecen bienes/servicios a personas en Chile o se monitorea su conducta; contempla geolocalización, decisiones automatizadas, contratos de encargado, EIPD, brechas y multas hasta 20.000 UTM o hasta 4% de ingresos anuales en reincidencia grave/gravísima de empresa no pequeña. [CL-01, arts. 1, 8 bis, 14–16 sexies, 28–35].

## 2. Aplicabilidad a Hireeo

| Actividad confirmada | Calificación y efecto |
|---|---|
| Cuentas, perfiles, teléfono, direcciones y mensajes | Hireeo es, como mínimo, responsable del banco/registro que decide estos tratamientos. [OBLIGACIÓN VIGENTE] Ley 19.628 aplica a privados que tratan datos. |
| Ubicación exacta | Dato personal y de alto riesgo. Ley vigente exige finalidad, consentimiento/diligencia y secreto; ley futura exige información clara del tipo, finalidad, duración y terceros. [VIGENTE + FUTURA] [CL-02; CL-01, art. 16 sexies]. |
| GTM/GA4 sin consentimiento | No existe una ley chilena de cookies con detalle GDPR; aun así, identificación/tracking es tratamiento de datos y exige análisis de finalidad/consentimiento bajo Ley 19.628. Es brecha de privacidad/transparencia, no conclusión automática de infracción por cada cookie. [HECHO + RIESGO] |
| IA Gemini, clasifica y crea borrador de solicitud | No hay ley horizontal de IA vigente para este uso. Desde 2026-12-01, si decide o perfila con efecto jurídico/significativo, habrá oposición, explicación, revisión humana y EIPD previa si alto riesgo. [FUTURA] [CL-01, arts. 8 bis, 15 ter]. |
| Electricidad/gas | Licencia recae principalmente en el prestador. Hireeo no debe exhibir “verificado” sin comprobación; SEC ofrece consulta/certificado de instaladores eléctricos y de gas. [VIGENTE / riesgo propio por información engañosa] [CL-16]. |
| Pagos, KYC, escrow | Hoy no hay fondos reales: no se activa por el código autorización de operador, AML ni facturación de liquidaciones. Si Hireeo liquida, retiene fondos o actúa como PSP/MoR, cambia materialmente. [CONDICIONAL] [CL-14, CL-15]. |

El análisis previo de calificación de plataforma está en [marketplace/01-platform-role-and-liability-analysis.md](../marketplace/01-platform-role-and-liability-analysis.md); este expediente no lo repite.

## 3. Protección de datos: vigente hoy versus reforma futura

| Materia | Vigente al 2026-07-23 | Entra en vigor 2026-12-01 | Acción Hireeo |
|---|---|---|---|
| Ley/autoridad | Ley 19.628; no existe aún Agencia con fiscalización plena de privados. Tutela judicial del art. 16. | Ley 21.719 modifica/reemplaza sustancialmente Ley 19.628 y crea Agencia de Protección de Datos Personales (APDP). | Operar con ley actual y ejecutar transición. |
| Alcance territorial | La ley actual no contiene regla expresa oferta/monitoreo extraterritorial. | Cubre responsable/mandatario sin establecimiento que ofrezca bienes/servicios a titulares en Chile o monitoree conducta. [CL-01, art. 1]. | Definir entidad/controlador y canal de contacto Chile. |
| Base/finalidad | Consentimiento expreso o por escrito, salvo autorización legal; datos para finalidad de recolección. [CL-02, arts. 4, 9]. | Consentimiento libre, informado, específico, previo e inequívoco; contrato, obligación legal, interés legítimo y defensa de derechos. [CL-01, arts. 12–13]. | Inventario de finalidades y prueba de consentimiento. |
| Derechos | Información, modificación, cancelación/eliminación y bloqueo; pronunciamiento en **2 días hábiles** o amparo judicial. [CL-02, arts. 12–16]. | Acceso, rectificación, supresión, oposición, portabilidad y bloqueo. [CL-01, arts. 4–8]. | Canal autenticado, SLA interno de 2 días hábiles hoy y registro de solicitudes. |
| Sensibles/menores | Sensibles prohibidos salvo ley, consentimiento o beneficios de salud. [CL-02, art. 10]. Sin regla general específica de edad. | Menores de 14: consentimiento representante; adolescentes <16: sensible requiere representante. [CL-01, art. 16 quáter]. | Edad mínima, bloqueo/consentimiento verificable antes de lanzamiento; minimizar chat/IA. |
| Geolocalización/IA | Sin artículo específico; aplican consentimiento/finalidad/diligencia. | Deber informativo específico; decisión automatizada significativa: oposición, explicación, intervención humana y revisión. [CL-01, arts. 8 bis, 14 ter, 16 sexies]. | Aviso granular, inventario IA y prohibir decisiones sólo por IA hasta evaluación. |
| Seguridad/brecha | Diligencia art. 11 y secreto art. 7; **sin plazo general de notificación de brecha** para este privado. | Seguridad basada en riesgo, privacidad por diseño y reporte a APDP sin dilaciones indebidas si riesgo razonable; aviso a titulares en casos definidos. [CL-01, arts. 14 quáter–sexies]. | Plan de incidentes, logs y contratos de aviso de proveedores. |
| Encargados/transferencias | Sin régimen general detallado de contrato de encargado o adecuación internacional. | Contrato responsable–encargado con objeto, duración, finalidad, datos, titulares y obligaciones; subencargo escrito. Transferencias reguladas/fiscalizables. [CL-01, arts. 15 bis, 28–29]. | DPA/mapa de regiones y transferencias. |
| EIPD/DPO/cumplimiento | Sin obligación general equivalente. | EIPD previa si alto riesgo; modelo preventivo es voluntario, pero certificado atenúa y exige delegado. [CL-01, arts. 15 ter, 48–52]. | EIPD IA+ubicación y dueño de privacidad. |
| Registro | Registro Civil mantiene registro de bancos de datos previsto en actual art. 22; no se identificó inscripción general de Hireeo privado. | Registro Civil debe eliminarlo dentro de 60 días previos; APDP tendrá registro de sanciones/cumplimiento. [CL-01, trans. art. 3]. | No solicitar registro inexistente; vigilar instrucciones APDP. |
| Sanciones | Ley 19.628 art. 23: sanción judicial limitada por arts. 17–18 (datos comerciales), hasta **50 UTM**, más responsabilidad civil. No son multas APDP futuras. | Leve hasta **5.000 UTM**, grave **10.000 UTM**, gravísima **20.000 UTM**; subsanar máximo 60 días o recargo 50%; reincidencia hasta 3x y empresa no pequeña reincidente grave/gravísima: mayor entre multa o **2%/4%** ingresos anuales. [CL-01, arts. 34–36]. | Programa preventivo y presupuesto, sin presentar montos futuros como actuales. |

### Obligaciones actuales concretas

| Obligación vigente | Aplicación/plazo | Evidencia y brecha |
|---|---|---|
| Ley 19.628 arts. 4 y 9: consentimiento/finalidad | Documentar cuenta, perfil, mensajes, ubicación, IA y analítica; obtener consentimiento cuando no haya excepción. Antes de recolectar/usar. | Finalidad/retención no documentadas; GTM/GA4 sin gate. |
| Arts. 7 y 11: secreto/diligencia | Restringir conversaciones, dirección y ubicación; medidas proporcionales. Permanente. | Bcrypt, cifrado de credenciales y rate limiting; MFA admin, backups y plan de incidente no confirmados. |
| Arts. 12–16: ARCO/amparo | Acceso, origen, destinatarios, finalidad, rectificación/cancelación/bloqueo. Pronunciamiento **2 días hábiles**. | No se identificó flujo de derechos. |
| Art. 10: sensibles | No pedir/usar salud, ideología, biometría o vida sexual salvo excepción/legal o consentimiento. | Chat/IA libre puede recibirlos; minimización/filtros no confirmados. |
| LPC art. 28 B: marketing | Email con asunto, identidad y baja válida; llamadas/SMS/mensajería con baja expedita. Tras baja, prohibido enviar. [CL-06]. | Brevo/push existen; finalidad comercial y lista de supresión no confirmadas. |

## 4. Consumo, comercio electrónico y contratos

El Reglamento de Comercio Electrónico (DS 6/2021) alcanza a vendedores y **operadores** de plataforma de terceros. Debe haber información clara, accesible y previa sobre servicio, precio/tarifa total, costos, disponibilidad, condiciones, identidad/contacto y datos del vendedor según el rol. [CL-05, arts. 1–3 y Tít. II].

- **Información, oferta y precio:** Ley 19.496 arts. 3 letra b), 12 y 30 exige información veraz/oportuna, respetar términos ofrecidos y mostrar valor total con impuestos. Separar precio de prestador, comisión Hireeo, patrocinio, impuestos y pago. [CL-04].
- **Intermediario:** art. 43 prevé responsabilidad directa del proveedor intermediario frente a consumidor por obligaciones contractuales, con repetición. Un aviso “sólo conecta” no excluye la regla si Hireeo califica como intermediario/proveedor. [CL-04].
- **Retracto:** art. 3 bis contempla 10 días desde recepción o contratación y antes de prestación; exclusión sólo cuando proceda y se comunique conforme reglamento. Para servicios presenciales, conservar evidencia de inicio/ejecución y consentimiento, sujeto a revisión local. [CL-04; CL-07].
- **Enforcement relevante:** Corte de Apelaciones de La Serena condenó a Ripley por cancelación unilateral de marketplace; SERNAC informa indemnización $300.000 y multa 5 UTM. Es una señal sobre conducta/contrato propio, no regla automática de cada listado tercero. [CL-17].
- **Sanciones LPC:** infracción sin sanción especial llega hasta **300 UTM** (art. 24), además de indemnización y mecanismos individuales/colectivos. [CL-04].

### Diferencias B2C/B2B y documentos requeridos

Un prestador profesional no es consumidor al contratar para su giro, salvo supuestos especiales (por ejemplo, micro/pequeña empresa como destinatario final). Deben existir términos separados para prestadores que regulen comisión, ranking/patrocinio, contenido, licencia profesional, impuestos, suspensión, soporte y tratamiento de datos. No se pueden trasladar derechos inderogables del consumidor al prestador.

| Documento/control | Estado requerido |
|---|---|
| Términos B2C y de prestador B2B: operador, contraparte, rol, precio/comisión, retracto/cancelación y reclamos | **P0 — falta entidad/RUT/domicilio.** |
| Privacidad, ubicación, IA, canal ARCO y contacto responsable | **P0 — necesario hoy; actualización 2026-12-01.** |
| Cookies/analítica y control GTM/GA4 | **P0 — hoy no hay gate.** |
| DPA/seguridad/subencargo/borrado/aviso incidente con proveedores | **P0 — contrato/región no confirmados.** |
| Política IP/contenido, avisos y retiro/logs | **P1 — no hay canal formal documentado.** |
| Contrato PSP/MoR, chargebacks, DTE, KYC y AML | **BLOQUEANTE antes de pagos reales.** |

## 5. Ciberseguridad, delitos, IP y firma

| Marco | Estado/aplicación |
|---|---|
| **Ley 21.663, Marco de Ciberseguridad** | Vigente. Aplica a servicios esenciales y operadores de importancia vital (OIV). Incluye infraestructura digital, servicios digitales y TI gestionados por terceros, pero Hireeo no debe autoasumir cobertura: confirmar si encuadra o ANCI lo califica. Si aplica, incidente significativo: alerta ≤3 h, actualización ≤72 h (≤24 h para OIV con servicio esencial afectado), informe ≤15 días; OIV además SGC, planes, simulacros, certificación y delegado. [CL-08, arts. 4–9, 27]. |
| **Ley 21.459, Delitos Informáticos** | Vigente desde 2022-06-20. Tipifica acceso/interceptación ilícita, ataque a sistema/datos, falsificación y fraude; incorpora delitos al régimen de responsabilidad penal de personas jurídicas. Requiere controles, preservación de evidencia y canal de denuncia. [CL-09, arts. 1–21]. |
| **Ley 17.336, PI** | Fotos/reseñas/contenido tercero requieren licencia, prohibición de infracción y canal de avisos. Régimen ISP arts. 85 P–U tiene condiciones/medidas judiciales y no es inmunidad general marketplace. Si califica como ISP, aviso art. 85 U se comunica al usuario en 5 días hábiles. [CL-11]. |
| **Ley 19.799, firma electrónica** | Contrato electrónico con firma electrónica es válido como escrito (art. 3), salvo solemnidades/presencia/familia; firma avanzada para instrumento público y prueba reforzada. Conservar aceptación/versionado; no afirmar firma avanzada por simple clickwrap. [CL-10, arts. 1–5]. |

## 6. Pagos, AML, impuestos y competencia

- **Pagos/CMF:** hoy STUB/MOCK no activa inscripción propia. Si Hireeo liquida/paga a prestadores, retiene fondos o actúa como PSP, CMF exige autorización/registro a quien liquida/paga prestaciones de tarjeta a afiliados (LGB art. 2; CNF III.J.2). Mercado Pago Operadora es vigente en registro CMF, sin cubrir automáticamente flujo propio de Hireeo. [CL-14; CL-15].
- **AML:** Ley 19.913 art. 3 lista a emisoras/operadoras de tarjetas/sistemas similares; art. 40 exige registro UAF y funcionario responsable a sujetos obligados. Marketplace que sólo deriva a PSP no aparece por sí solo listado; confirmar antes de escrow, wallet o liquidación. [CL-18].
- **IVA digital:** DL 825 art. 8 letra n), incorporado por Ley 21.210, grava intermediación de servicios en Chile. SII confirma IVA 19% y régimen simplificado para proveedor extranjero remoto que presta a beneficiarios locales no contribuyentes IVA; la categoría incluye operadores de plataforma. [CL-12; CL-13].
- **Facturación:** si entidad chilena cobra comisión o actúa por mandato, determinar emisor de DTE, liquidación-factura y débito IVA antes de lanzar; no adoptar diseño tributario sin especialista. [CL-19; CL-20].
- **Cambio 2026:** desde **2026-07-01**, operadores pueden exigir Registro de Actividades de Subsistencia a prestadores elegibles; no sustituye inicio de actividades/tributación si corresponde. [CL-21].
- **Competencia/publicidad:** DL 211 sólo sería material ante conducta anticompetitiva; el foco actual es no falsear ranking, reseñas, precio ni patrocinio bajo LPC. [CONDICIONAL].

## 7. Autoridades, registros y autorizaciones

| Autoridad | Competencia | Registro/acción |
|---|---|---|
| APDP | Futura desde 2026-12-01: fiscalización, instrucciones, reclamos/sanciones Ley 21.719. | Vigilar instrucciones; no asumir inscripción general. |
| Consejo para la Transparencia / tribunales civiles | Régimen actual Ley 19.628 y amparo judicial. | Canal ARCO y evidencia de respuesta. |
| SERNAC / JPL | Consumo, publicidad, e-commerce, reclamos/acciones. | Términos, información, soporte/evidencia. |
| SEC | Licencias/certificados eléctrico y gas. | Verificar RNII en categorías riesgo. |
| ANCI / CSIRT | Ley 21.663 si esencial/OIV. | Confirmar calificación; si aplica, reportes. |
| CMF / BCCh | Operadores/emisores tarjeta/PSP. | Autorización sólo si realiza actividad regulada. |
| UAF | ROS/sujetos obligados. | Sólo si encuadra Ley 19.913 art. 3. |
| SII | IVA digital, DTE, declaración/pago. | Registro simplificado/DTE según entidad y flujo. |

## 8. Controles técnicos y operativos

1. **P0:** edad mínima, privacidad/ubicación, inventario-finalidad, ARCO con SLA 2 días y prueba de respuestas.
2. **P0:** impedir GTM/GA4 no esencial hasta decisión documentada; inventariar tags, IP, eventos, transferencias y retención.
3. **P0:** DPA con Gemini/Google, Cloudinary, Brevo, Firebase, OAuth y PSP; mapa de regiones, subencargos, borrado y brechas.
4. **P0:** mostrar operador/contraparte, costos, patrocinio; confirmación contractual y retracto. No activar escrow sin MoR, CMF/UAF, IVA/DTE.
5. **P1:** registrar modelo/prompt/herramienta, revisión humana/apelación; bloquear electricidad/gas sin credencial SEC y vencimiento.
6. **P1:** MFA admin, backup/restauración, playbook y ejercicios; revisar calificación ANCI.

## 9. Enforcement, reformas y proyectos

| Fuente/fecha | Relevancia y límite |
|---|---|
| Corte de Apelaciones de La Serena, caso Ripley, divulgado por SERNAC 2024-12-12 | Cancelación unilateral marketplace: SERNAC informa $300.000 daño moral + 5 UTM. Relevante a conducta contractual propia, no responsabilidad automática por tercero. [CL-17]. |
| SERNAC, PVC Ripley, Res. Ex. 602 de 2024-10-03 | Cobro de retiro no informado en marketplace; refuerza transparencia de cargos/T&C. [CL-22]. |
| Ley 21.719 | **Ley publicada, obligación futura, no proyecto:** entrada 2026-12-01. Reglamentos/instrucciones pendientes no permiten tratarla como vigente hoy. [CL-01]. |
| Ley 21.663 | **Vigente**, pero obligación específica Hireeo es condicional a art. 4/OIV; no se halló resolución que lo califique. [CL-08]. |

## 10. Preguntas abiertas

| ID | Pregunta | Efecto | Prioridad |
|---|---|---|---|
| CL-Q1 | ¿Entidad/RUT/domicilio que opera Hireeo y responsable de datos/proveedor? | Avisos, T&C, IVA y representación. | **BLOCKING** |
| CL-Q2 | ¿Región PostgreSQL/backups y DPA/transferencias con proveedores? | Brecha actual y contrato obligatorio futuro. | **BLOCKING** |
| CL-Q3 | ¿Habrá pagos, retención, liquidación/MoR propio? | CMF/UAF/IVA/DTE/consumo. | **BLOCKING antes de cobros** |
| CL-Q4 | ¿Edad mínima y verificación/consentimiento proporcional? | Menores y seguridad/consumo. | **P0** |
| CL-Q5 | ¿Qué decisiones IA toma sobre ranking, precio, suspensión/elegibilidad? | Art. 8 bis/EIPD futuro y sesgo. | **P0** |
| CL-Q6 | ¿Qué oficios riesgo se habilitan y cómo se verifica licencia/seguro? | Riesgo sectorial/consumo. | **P0** |
| CL-Q7 | ¿Quién envía marketing y cómo se guarda baja? | LPC art. 28 B. | **P1** |
| CL-Q8 | ¿ANCI califica entidad/actividad como esencial u OIV? | Plazos 3 h/72 h/15 d. | **P1** |

## 11. Matriz de obligaciones y evidencia

| Obligación/acción | Evidencia de cierre | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|
| Ley 19.628 arts. 4, 7, 9–12, 16: finalidad, ARCO, secreto/diligencia | Inventario, aviso, ticket ARCO, prueba SLA 2 días, matriz RBAC | Legal + Product + Engineering | **P0** | Antes lanzamiento CL |
| Ley 19.628 art. 10: sensibles | Guía IA/soporte, minimización prompts, escalamiento/consentimiento | Privacy + AI + Trust & Safety | **P0** | Antes lanzamiento CL |
| LPC/DS 6: información/precio/contraparte/retracto | Maquetas aprobadas, T&C CL, confirmación/versionado, test de comisión/impuesto | Legal + Product + Finance | **P0** | Antes lanzamiento CL |
| LPC art. 28 B: baja marketing | Registro consentimiento/fuente, enlace baja, lista supresión y test Brevo/push | Marketing + Engineering | **P0** | Antes primera campaña |
| Ley 21.719: encargados, brechas, transferencias | ROPA, DPA, mapa transferencias, EIPD IA/ubicación, simulacro | Privacy + Security + Procurement | **P0** | **2026-10-15** |
| Ley 21.719 arts. 8 bis/15 ter: IA significativa | Inventario decisiones, impacto, explicación/revisión humana/EIPD | AI + Legal + Product | **P1** | **2026-10-15** |
| Ley 21.719 arts. 34–35: prevención | Dueño privacidad, capacitación, protocolo/auditoría; evaluar certificado | Legal + Security + HR | **P1** | **2026-11-15** |
| SEC/consumo: servicios regulados | Política categorías, RNII, expiración/bloqueo automático | Trust & Safety + Operations | **P1** | Antes habilitar electricidad/gas |
| Ley 21.663: alcance/plan | Memo ANCI/OIV; si aplica delegado, CSIRT y playbook | Security + Legal | **P1** | 30 días antes lanzamiento |
| CMF/UAF/SII: pagos reales | Diagrama fondos, PSP/MoR, opinión local, IVA/DTE/KYC/AML | Finance + Legal + Payments | **BLOCKING** | Antes de salir de STUB/MOCK |

## 12. Fuentes primarias (acceso 2026-07-23)

| ID | Fuente, organismo, fecha, jurisdicción, artículos | URL |
|---|---|---|
| CL-01 | **Ley 21.719**, Ministerio Secretaría General de la Presidencia, DO 2024-12-13, Chile; arts. 1, 8 bis, 12–16 sexies, 28–36, 48–52 y transitorios. Vigencia diferida 2026-12-01. | https://www.bcn.cl/leychile/navegar?i=1209272 |
| CL-02 | **Ley 19.628**, Ministerio Secretaría General de la Presidencia, DO 1999-08-28, Chile; versión vigente hasta 2026-11-30; arts. 4, 7, 9–12, 16, 23. | https://www.bcn.cl/leychile/navegar?idNorma=141599 |
| CL-03 | **Ley 21.806**, Ministerio Secretaría General de la Presidencia, DO 2026-02-05, Chile; transición/designación APDP. | https://www.bcn.cl/leychile/navegar?i=1221118 |
| CL-04 | **Ley 19.496/DFL 3**, Ministerio de Economía, texto refundido DO 2021-05-31, Chile; arts. 3, 3 bis, 12, 24, 28 B, 30, 43. | https://www.bcn.cl/leychile/navegar?idNorma=1160403 |
| CL-05 | **DS 6/2021, Reglamento Comercio Electrónico**, Ministerio de Economía, DO 2021-09-23, Chile; arts. 1–3 y Tít. II. | https://www.bcn.cl/leychile/navegar?idNorma=1165504 |
| CL-06 | **DS 62/2020, Reglamento No Molestar**, Ministerio de Economía, DO 2020-02-13, Chile; art. 1/LPC art. 28 B. | https://www.bcn.cl/leychile/navegar?idNorma=1142343 |
| CL-07 | **DS 52/2024**, Ministerio de Economía, DO 2024-08-27, Chile; exclusión retracto. | https://www.bcn.cl/leychile/navegar?idNorma=1206144 |
| CL-08 | **Ley 21.663**, Ministerio del Interior y Seguridad Pública, DO 2024-04-08, Chile; arts. 4–9, 11, 27, 37–39. | https://www.bcn.cl/leychile/navegar?idNorma=1202434 |
| CL-09 | **Ley 21.459**, Ministerio de Justicia, DO 2022-06-20, Chile; arts. 1–21. | https://www.bcn.cl/leychile/navegar?idNorma=1177743 |
| CL-10 | **Ley 19.799**, Ministerio de Economía, DO 2002-04-12, Chile; arts. 1–5. | https://www.bcn.cl/leychile/navegar?idNorma=196640 |
| CL-11 | **Ley 17.336**, Ministerio de Educación, Chile; arts. 85 P–U. | https://www.bcn.cl/leychile/navegar?idNorma=28933 |
| CL-12 | **DL 825**, Ministerio de Hacienda, Chile; art. 8 letra n). | https://www.bcn.cl/leychile/navegar?idNorma=6369 |
| CL-13 | **SII, IVA servicios digitales**, Servicio de Impuestos Internos, Chile, consultado 2026-07-23. | https://www.sii.cl/destacados/international_transactions/4562-4572-esp-4569.html |
| CL-14 | **CMF, autorización operadores de tarjetas**, Comisión para el Mercado Financiero, Chile, consultado 2026-07-23; LGB art. 2/CNF III.J.2. | https://www.cmfchile.cl/portal/principal/613/w3-article-29353.html |
| CL-15 | **CNF III.J**, Banco Central de Chile, vigente/consultado 2026-07-23. | https://www.bcentral.cl/areas/sistemas-de-pagos |
| CL-16 | **RNII/consulta instaladores**, SEC, Chile, consultado 2026-07-23. | https://wlhttp.sec.cl/validadorInstaladores/sec/consulta.do |
| CL-17 | **SERNAC: fallo marketplace Ripley**, SERNAC, publicado 2024-12-12, Chile; sentencia CA La Serena. | https://www.sernac.cl/604/w3-article-83673.html |
| CL-18 | **Ley 19.913**, Ministerio de Hacienda, Chile; arts. 3 y 40. | https://www.bcn.cl/leychile/navegar?idNorma=219119 |
| CL-19 | **SII, liquidación factura**, SII, Chile, actualizado 2026. | https://www.sii.cl/destacados/liquidacion_factura/ |
| CL-20 | **SII, factura electrónica**, SII, Chile, consultado 2026-07-23. | https://www.sii.cl/destacados/factura_electronica/index.html |
| CL-21 | **SII, Registro Actividades de Subsistencia**, SII, Chile, consultado 2026-07-23; operador desde 2026-07-01. | https://www.sii.cl/destacados/subsistencia/ |
| CL-22 | **SERNAC, PVC Ripley marketplace**, SERNAC, Res. Ex. 602 de 2024-10-03. | https://www.sernac.cl/portal/609/w3-article-82285.html |

## 13. Registro de cambios

- **2026-07-23:** creación del expediente. Se verificó la vigencia diferida de Ley 21.719 al 2026-12-01 y se separaron los deberes presentes, futuros y condicionales.
