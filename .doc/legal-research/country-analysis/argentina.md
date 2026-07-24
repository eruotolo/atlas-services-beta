# Argentina — análisis jurisdiccional (Fase 3.2)

- **Corte jurídico:** 2026-07-23. **Investigación:** 2026-07-23.
- **Producto evaluado:** Hireeo, marketplace de servicios. Pagos Mercado Pago, escrow 15% y KYC: `STUB/MOCK`; no hay cobro ni liquidación real. Funcionan registro/OAuth, perfiles, mensajes, coordenadas, reseñas, GTM/GA4 sin consentimiento y Gemini 2.5 Flash para asistente/clasificación.
- **Límite profesional:** investigación jurídica para due diligence, no dictamen ni asesoramiento definitivo. Revisión por abogado/a argentino/a y contador/a antes de captar usuarios, vender, facturar o procesar pagos.

## Resumen ejecutivo

La Ley 25.326 continúa vigente; la AAIP es la autoridad de aplicación. La información oficial de AAIP indica que una entidad que trata datos de argentinos, incluso no establecida localmente, debe inscribirse como responsable y registrar las bases; también exige información previa, seguridad y atención de derechos. Hireeo no tiene evidencia de registro, aviso plenamente identificable, derechos ni retención, por lo que el lanzamiento con residentes argentinos presenta una brecha prioritaria. [A-01] arts. 5–16, 21–22, 29–31; [A-02]; [A-03].

La Ley no fija en su texto vigente una notificación general de brechas a AAIP con un plazo numérico comparable al RGPD. Eso **no** equivale a que un incidente no genere deberes: subsisten seguridad/confidencialidad, daños, deber de cooperación y posible investigación de oficio; AAIP abrió una investigación de oficio por filtración masiva en 2025. Debe existir un playbook, pero no inventar un plazo legal nacional no verificado. [A-01] art. 9; [A-04].

Para B2C a distancia, la Ley 24.240/CCCN permite revocar dentro de diez días; desde 2025 la Disposición 954/2025 —que derogó la Resolución 424/2020— obliga a un **Botón de Arrepentimiento** visible en primer acceso. Suscripciones/pagos futuros también requieren información de precio, proveedor, contrato y reembolso; la presentación de Hireeo como intermediario debe corresponder a su conducta real. [A-05] arts. 4, 8 bis, 10 ter, 34, 37, 47; [A-06] arts. 1–4.

### Tres obligaciones más urgentes

1. **Privacidad y registro:** identificar al responsable, inscribir responsable/bases ante AAIP, publicar aviso por finalidades y operar derechos (acceso 10 días corridos; rectificación/supresión 5 días hábiles).
2. **Transferencias y proveedores:** contractualizar Google, OAuth, Cloudinary, Brevo, Firebase y futuros PSP; evaluar países no adecuados y usar CCM/garantías AAIP antes de exportar datos.
3. **Consumo y pagos:** colocar información B2C y botón de arrepentimiento antes de ventas/suscripciones; no habilitar cobro/escrow hasta decidir MoR, facturación/retenciones, PSP y potencial encuadre UIF/BCRA.

## Aplicabilidad y hechos de producto

| Clasificación | Hallazgo | Consecuencia jurídica limitada |
|---|---|---|
| Hecho confirmado | Cuenta, OAuth, teléfono opcional, perfil de profesional, contenido, chat, reseña, dirección y latitud/longitud. | Datos personales; geolocalización/chat requieren medidas reforzadas de minimización y seguridad aunque no estén enumerados por la ley como sensibles. |
| Hecho confirmado | GTM/GA4 se inicia sin opción previa; cookie de país; marketing por Brevo/push potencial. | Datos de navegación y posible perfilado/comunicación comercial. |
| Hecho confirmado | Gemini recibe texto libre y contexto; el agente puede crear borrador si el usuario confirma. | Controlar información a tercero, transparencia, instrucciones y evaluación de impacto/riesgo como buena práctica. |
| Hecho confirmado | Pagos, KYC y escrow no son reales. | No se concluye actual calidad de PSP, sujeto obligado UIF, agente de retención o merchant of record. |
| Inferencia | Hireeo parece determinar los fines de cuenta, chat, IA, búsqueda y analítica. | Probable responsable de esas bases, sujeto a confirmar Q1/Q3. |
| Supuesto crítico | Entidad legal, domicilio, infraestructura, DPA/CCM, entrenamiento Gemini, MoR y categorías profesionales admitidas. | No afirmar registro, transferencias, licitud, impuestos ni cumplimiento hasta validación. |

## Leyes y autoridades vigentes

| Tema | Norma vigente, artículos/secciones | Autoridad | Relevancia para Hireeo |
|---|---|---|---|
| Datos, bases y derechos | Ley 25.326: consentimiento, calidad/finalidad, información, sensibles, seguridad, transferencias y derechos. [A-01] arts. 4–16, 21–22, 31–32. | **AAIP**, Dirección Nacional de Protección de Datos Personales. | Sí; la UI de producto y proveedores tratan datos de residentes. |
| Registro | AAIP exige inscripción del responsable antes de registrar la base; incluye entidades fuera del país que tratan datos de argentinos. [A-02]. | AAIP/RNPDP. | Sí, salvo que abogado local concluya una excepción concreta. |
| Seguridad/incidentes | Medidas técnicas/organizativas necesarias para evitar adulteración, pérdida, consulta/tratamiento no autorizado y detectar desviaciones. [A-01] art. 9. | AAIP; responsabilidad civil/penal. | Sí; no hay plazo legal nacional específico de breach confirmado en las fuentes revisadas. |
| Transferencias | País adecuado o excepción; CCM Disposición 60/2016, Res. 34/2019 y Res. 198/2023. [A-07]; [A-08]. | AAIP. | Sí, para proveedores globales; Uruguay figura como adecuado, EE. UU. no aparece como país general adecuado en la lista oficial. |
| Decisiones automatizadas | Res. AAIP 4/2019: criterio interpretativo para acceso frente a decisiones exclusivamente automatizadas con efectos jurídicos/perjuicio significativo. [A-09]. | AAIP. | IA actual clasifica/asiste y crea borrador con confirmación; no hay evidencia de decisión exclusivamente automatizada de efecto significativo. Reevaluar si ranking/suspensión/precio automatizado cambia. |
| Publicidad y comunicaciones | Ley 25.326 art. 27 y Dec. 1558/2001 anexo art. 27: datos promocionales bajo condiciones y toda comunicación a distancia debe informar retiro/bloqueo y responsable. Ley 26.951 obliga consultar No Llame cada 30 días para llamadas publicitarias. [A-01]; [A-10]; [A-11]. | AAIP. | Sí si se hace marketing por email/SMS/llamada/WhatsApp/push; distinguir mensajes transaccionales. |
| Consumo/e-commerce | Ley 24.240 y CCCN: deber de información, trato digno, oferta, revocación en contratos a distancia, cláusulas abusivas y sanciones. [A-05] arts. 4, 8 bis, 10 ter, 34, 37, 47; CCCN art. 1110. | Subsecretaría de Defensa del Consumidor y Lealtad Comercial, autoridades provinciales/locales, tribunales. | Sí para cliente consumidor y probablemente suscripción B2C. |
| Arrepentimiento | Disposición 954/2025: botón visible, primer acceso, sin registro/trámite adicional; derogó Res. 424/2020. [A-06] arts. 1, 10. | Subsecretaría de Defensa del Consumidor y Lealtad Comercial. | Sí antes de vender bienes/servicios a distancia. |
| Firma/documento | Ley 25.506: reconoce firma electrónica/digital; firma digital satisface requisito de firma, electrónica tiene valor probatorio con carga de acreditar si se desconoce. [A-12] arts. 1–12. | Secretaría de Innovación / infraestructura de firma. | Clickwrap conserva prueba; no necesita certificador salvo que se prometa firma digital. |
| PI y cibercrimen | Ley 11.723 protege software, compilaciones y obras; Ley 26.388 tipifica acceso no autorizado, divulgación y daño/fraude informático. [A-13] arts. 1–5, 71–73; [A-14]. | DNDA / Poder Judicial / fiscalías. | Sí: licencia de contenidos, notice/takedown, controles de acceso y evidencia. |
| Competencia y lealtad | Ley 27.442 de Defensa de la Competencia y Decreto 274/2019 de Lealtad Comercial. [A-23]; [A-24] arts. 1, 4–10. | CNDC / Secretaría de Industria y Comercio. | Condicional pero relevante a precios, rankings patrocinados, reseñas y alegaciones engañosas. |
| Factura/plataformas | ARCA: facturación general (RG 5762/2025) y micrositio de economía digital incluye RG 5319/2023 (IVA plataforma) y RG 4622/2019 (retenciones). [A-15]; [A-16]. | ARCA; agencias provinciales. | Condicional: comisión, suscripción, pagos y quien factura/cobra determinan obligaciones nacionales/provinciales. |
| Pagos/AML | Ley 25.246 y régimen BCRA/UIF aplican a sujetos obligados/PSP; BCRA supervisa PSPCP/PSI. [A-17]; [A-18]. | UIF/BCRA. | Condicional: contacto sin fondos no prueba encuadre; wallet, cobrar por cuenta ajena, escrow/payout pueden activarlo. |

## Obligaciones concretas y plazos

### Datos personales, cookies, IA y comunicaciones

| Obligación | Plazo legal / condición | Evidencia o medida requerida |
|---|---|---|
| Inscribir responsable y bases. | Antes del registro de una base; AAIP lo describe como requisito previo, inclusive para responsables no establecidos que tratan datos argentinos. [A-02]. | Certificado RNPDP, inventario base/finalidad/responsable, procedimiento de actualización/baja. |
| Informar y obtener consentimiento cuando sea exigible. | Previo a la recolección: finalidad, destinatarios, responsable/domicilio, carácter obligatorio/facultativo y derechos. [A-01] arts. 5–6; [A-03]. | Aviso de privacidad, registro de consentimientos, formulario separado por finalidades; no afirmar base contractual sin términos reales. |
| Datos sensibles. | Prohibido tratarlos salvo excepciones legales; salud, vida sexual, origen racial/étnico, opiniones políticas, convicciones religiosas/filosóficas/morales y afiliación sindical. [A-01] art. 7. | Filtrar/prohibir esos datos en prompts y contenido, ruta de reporte y acceso restringido. Geolocalización precisa no es art. 7 por sí sola, pero tratarla como alta sensibilidad operativa. |
| Derechos de titulares. | Acceso: **10 días corridos**; rectificación/actualización/supresión: **5 días hábiles**. [A-03]. | Canal autenticado, casos/timestamps, exportación y corrección/borrado documentados; la supresión puede no proceder ante interés/derecho legítimo, a evaluar caso a caso. |
| Seguridad y gestión de incidente. | Art. 9 exige medidas necesarias; **sin plazo general de notificación de breach identificado** en ley vigente revisada. [A-01]. | IRP, registro de accesos, evaluación de daño, conservación de evidencia, canal AAIP; evaluar aviso a titulares/autoridad con abogado. |
| Transferencia internacional. | Antes de transferir a destino no adecuado, aplicar excepción o garantías/CCM; AAIP provee cláusulas. [A-07]; [A-08]. | Mapa exportador/importador, datos, país, finalidad, DPA, CCM y revisión de subencargados. La página AAIP prevé autorización en casos contractuales no-modelo. [A-03]. |
| Cookies/GA4 y publicidad comportamental. | Ley 25.326 no contiene una regla nacional de cookies equivalente a ePrivacy en las fuentes examinadas; siguen información, consentimiento cuando corresponda, finalidad y derechos. | CMP/centro de preferencias y bloqueo previo de trackers no esenciales como control prudente; validar interpretación AAIP local antes de política pública. |
| Comunicaciones comerciales. | Toda comunicación promocional debe permitir retiro/bloqueo y revelar responsable; para llamadas, cotejar No Llame cada 30 días, salvo excepciones. [A-10]; [A-11] arts. 7–8. | Consentimiento/preferencia, lista de supresión, baja inmediata y auditoría mensual No Llame si hay telefonía. |

### Consumidor, contratos y plataforma

1. **Información B2C:** antes de confirmar, identificar proveedor real (Hireeo/prestador), precio total, moneda, impuestos/cargos, características, duración, condiciones, cancelación, reclamo y soporte. El operador sin razón social/domicilio confirmados no puede satisfacer esto de modo verificable.
2. **Arrepentimiento:** el consumidor tiene diez días corridos para revocar contratos a distancia; la Disposición 954/2025 exige botón a simple vista, lugar destacado y primer acceso, sin login ni trámite adicional. [A-05] art. 34; [A-06] art. 1. Diseñar confirmación y código de trámite; la norma anterior 424/2020 está derogada y no debe citarse como vigente.
3. **Términos:** en B2C no usar renuncias de derechos, limitaciones absolutas, cambios unilaterales o selección de fuero que resulten abusivos. [A-05] arts. 37 y 47. En B2B con profesionales hay mayor libertad, pero no desplaza privacidad, competencia, impuestos, IP ni responsabilidad por afirmaciones propias.
4. **Marketplace:** separar ficha de prestador, precio y condiciones de su servicio de la suscripción/comisión de Hireeo. Si Hireeo cobra, ofrece garantía, fija el precio o gestiona reembolsos, su exposición como proveedor/intermediario aumenta; esta es evaluación condicionada, no calificación definitiva.
5. **Reseñas/patrocinios:** identificar resultados pagos/premium, mantener evidencia de reseñas y proceso de reporte/rectificación; evitar afirmaciones de verificación que el KYC stub no sustenta.

### Pagos, impuestos, AML y facturación — sólo cuando se active el flujo

| No aplica hoy / activador | Análisis condicionado y control de lanzamiento |
|---|---|
| Cobro real de suscripción o comisión | Determinar si Hireeo presta servicio propio, actúa por cuenta/orden del prestador o como vendedor/MoR. Revisar IVA, Ganancias, Ingresos Brutos y factura electrónica con contador argentino. ARCA mantiene reglas específicas para operaciones por plataformas. [A-15]–[A-16]. |
| Marketplace recibe, mantiene o distribuye fondos / escrow | No proceder hasta dictamen BCRA/UIF y contrato con PSP. Definir fondos de terceros, segregación, KYC/KYB, monitoreo, refund, chargeback, PCI y reportes. |
| KYC Stripe / identidad de profesionales | Sólo recolectar el resultado estrictamente necesario; evaluar si el fundamento es fraude/contrato/obligación y si Hireeo/Stripe son responsables o encargados. No usar “AML” como fundamento sin encuadre de sujeto obligado. |
| Facturación prestador-cliente | Definir qué comprobante emite cada parte, si Hireeo documenta a nombre propio/ajeno y obligaciones locales/provinciales; guardar solo lo necesario. |

## Sanciones, enforcement y precedentes relevantes

- **Datos/No Llame:** Ley 25.326 art. 31 permite apercibimiento, suspensión, multa de $1.000 a $100.000, clausura o cancelación del archivo; Res. AAIP 126/2024 fija graduación (leve $1.000–80.000; grave $80.001–90.000; muy grave $90.001–100.000, con otras medidas). Los montos nominales no deben presentarse como exposición total: se suman daños, acciones de hábeas data y efectos reputacionales. [A-01]; [A-19].
- **Consumo:** el incumplimiento puede ser sancionado bajo Ley 24.240 y exponer a daños; las autoridades nacionales/provinciales pueden intervenir. [A-05] arts. 45–47.
- **Enforcement relevante:** AAIP publica infractores y sanciones firmes, actualizado 2026-07-03 [A-20], y en 2025 inició investigación de oficio ante una presunta filtración masiva aun sin notificación formal recibida [A-04]. Son indicadores de supervisión, no precedentes idénticos ni prueba de responsabilidad de Hireeo.
- **Penal:** acceso no autorizado a sistema/dato restringido y revelación ilegítima de datos pueden ser delito (Ley 26.388). [A-14].

## Reformas, proyectos y fechas futuras — no obligaciones actuales

| Ítem | Estado y fecha | Tratamiento correcto |
|---|---|---|
| Proyecto integral de nueva Ley de Datos (Mensaje 87/2023) | **Proyecto**, no sustituye Ley 25.326. AAIP conserva la página del proyecto. [A-21]. | No usar RGPD-like obligaciones o multas proyectadas como exigencia actual. Monitorear trámite legislativo. |
| Expediente 0098-D-2026 | Proyecto presentado 2026-03-02 para modificar arts. 2 y 4 sobre datos sensibles/calidad. [A-22]. | No vigente; seguir estado parlamentario. |
| Disposición 954/2025 | **Vigente desde publicación 2025-09-04** y derogó Res. 424/2020. [A-06]. | Obligación actual de botón de arrepentimiento cuando haya venta/servicio a distancia. |
| RG ARCA 5762/2025 y cambios operativos 2026 | Régimen de facturación vigente y modificaciones posteriores; aplicación depende de sujeto/operación. [A-15]. | Validar fecha/regla concreta con contador antes de facturar; no es obligación accionable mientras el flujo siga mock. |

## Controles técnicos y operativos recomendados / necesarios

- Registro AAIP y aviso local con razón social/domicilio, finalidades, datos obligatorios/opcionales, destinatarios, transferencias y canal de derechos. Usar inventario de datos existente como borrador, no como aviso publicable.
- Cumplir SLA interno más corto que legal (p. ej., triage 24 h) para derechos; eliminar cuenta/contenido/identificadores conforme política aprobada, con excepciones tributarias/litigios documentadas.
- Bloquear scripts GA4/GTM no esenciales hasta preferencia; no mezclar consentimiento de analítica con aceptación de términos. Aplicar opt-out de marketing y No Llame donde proceda.
- Para Gemini: minimización/redacción de prompt, aviso de interacción IA, confirmación humana del borrador, guardrails para servicios regulados, evaluación de contenido y contrato que confirme uso de datos/retención/subprocesadores. No hay base para afirmar que Google no entrena.
- RBAC, MFA de admins, logs, cifrado/transporte, política de incidentes, pruebas de backup/restore, DPAs y control de subprocesadores. Los controles existentes de bcrypt/throttling no sustituyen estos procesos.
- Antes de producir un flujo financiero: PSP bajo contrato, MoR decidido, flujo de dinero diagramado, conciliación, soporte, devoluciones, impuestos y autorización/registro aplicable validados.

## Preguntas abiertas

| ID | Pregunta y riesgo | Prioridad |
|---|---|---|
| A-Q1 | ¿Quién es la entidad responsable, domicilio y representante? Impide registro, privacidad, términos y factura. | **BLOCKING** |
| A-Q2 | ¿Dónde se alojan/respaldan datos y qué DPA/CCM hay con cada proveedor? | **BLOCKING** |
| A-Q3 | ¿Quién cobra/liquida y quién es MoR al salir de mock? Impide conclusión BCRA/UIF/ARCA/consumo. | **BLOCKING** |
| A-Q4 | ¿Qué clasificación, ranking o suspensión automática se introducirá y con qué intervención humana? | HIGH |
| A-Q5 | ¿Edad mínima y verificación? No hay control actual. | HIGH |
| A-Q6 | ¿Marketing por email/SMS/telefonía/WhatsApp/push, base y procesos de opt-out/No Llame? | HIGH |
| A-Q7 | ¿Qué categorías reguladas, verificación de licencias, seguros y moderación de servicios se admitirán? | HIGH |

## Matriz obligación → evidencia → propietario → prioridad → fecha objetivo

| Obligación / estado | Evidencia actual o faltante | Propietario sugerido | Prioridad | Fecha objetivo |
|---|---|---|---|---|
| Registro AAIP de responsable/bases — **MANDATORY NOW** | No hallado; entidad legal Q1 pendiente. | Legal + Privacy | P0 | Antes de alta de residentes AR |
| Información, consentimiento y derechos 10/5 — **MANDATORY NOW** | No hay aviso/flujo/retención verificados. | Legal + Product + Engineering | P0 | 0–14 días / pre-lanzamiento |
| Seguridad e incident response — **MANDATORY NOW** | Bcrypt/rate-limit sí; IRP/MFA/logging/backups no confirmados. | Security + Privacy | P0 | 0–14 días |
| Transferencias/DPA/CCM — **MANDATORY NOW/CONDITIONAL** | Proveedores globales y regiones/contratos no confirmados. | Privacy + Procurement + Security | P0 | Antes de producción AR |
| Cookies/analítica y marketing — **MANDATORY/CONDITIONAL** | GTM/GA4 sin gate; marketing no confirmado. | Product + Marketing + Engineering | P1 | 14 días / antes de campaña |
| Botón de arrepentimiento e información B2C — **MANDATORY BEFORE SALE** | No se halló botón, identidad legal ni T&C publicables. | Legal + Product + Operations | P0 | Antes de suscripción/servicio pagado |
| Contrato con prestadores, reseñas y servicios prohibidos — **CONDITIONAL** | KYC stub, no hay licencias/seguros/reportes confirmados. | Trust & Safety + Legal | P1 | Pre-lanzamiento |
| BCRA/UIF/ARCA, factura y retenciones — **CONDITIONAL BEFORE PAYMENTS** | Pagos/escrow mock y MoR desconocido. | Finance + Payments + Legal | P0 | Antes de activar pago |

## Fuentes primarias y oficiales

Consultadas el **2026-07-23**, jurisdicción **Argentina**, idioma español. Las páginas informativas oficiales se identifican expresamente y no reemplazan el texto normativo enlazado.

| ID | Fuente, organismo, fecha, artículos/secciones | URL |
|---|---|---|
| A-01 | Ley N.º 25.326, Congreso/InfoLeg, sancionada 2000-10-04, texto actualizado; arts. 4–16, 21–22, 31–32. | https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto |
| A-02 | Trámites Registro Nacional de Bases, AAIP, consultado 2026-07-23; inscripción de responsable/base y responsables no establecidos. | https://www.argentina.gob.ar/aaip/datospersonales/tramites |
| A-03 | Obligaciones de responsables, AAIP, consultado 2026-07-23; información, seguridad, transferencias. | https://www.argentina.gob.ar/aaip/datospersonales/responsables/obligaciones |
| A-04 | Investigación AAIP por presunta filtración masiva, AAIP, 2025-12-23. | https://www.argentina.gob.ar/noticias/la-aaip-inicio-una-investigacion-de-oficio-ante-presunta-filtracion-masiva-de-datos |
| A-05 | Ley N.º 24.240, Congreso, texto actualizado; arts. 4, 8 bis, 10 ter, 34, 37, 45–47. | https://www.argentina.gob.ar/normativa/nacional/638/actualizacion |
| A-06 | Disposición 954/2025, Subsecretaría de Defensa del Consumidor y Lealtad Comercial, publicada 2025-09-04; arts. 1 y 10. | https://www.argentina.gob.ar/normativa/nacional/disposici%C3%B3n-954-2025-417152 |
| A-07 | Transferencias internacionales, AAIP, consultado 2026-07-23; países adecuados, Disposición 60/2016, Res. 34/2019 y CCM. | https://www.argentina.gob.ar/transferencias-internacionales |
| A-08 | Resolución AAIP 198/2023, publicada 2023-10-18; arts. 1–2, CCM. | https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-198-2023-391538/texto |
| A-09 | Resolución AAIP 4/2019, AAIP, 2019; criterio sobre decisiones automatizadas. | https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-4-2019-318874/texto |
| A-10 | Decreto 1558/2001, anexo reglamentario art. 27, InfoLeg; publicidad directa/opt-out. | https://servicios.infoleg.gob.ar/infolegInternet/anexos/65000-69999/68925/norma.htm |
| A-11 | Ley N.º 26.951, Congreso/InfoLeg, 2014-07-02; arts. 1–11. | https://servicios.infoleg.gob.ar/infolegInternet/anexos/230000-234999/233066/texact.htm |
| A-12 | Ley N.º 25.506, Congreso, 2001-11-14, texto actualizado; arts. 1–12. | https://www.argentina.gob.ar/normativa/nacional/ley-25506-70749/actualizacion |
| A-13 | Ley N.º 11.723, Congreso, 1933-09-26, texto actualizado; arts. 1–5, 71–73. | https://www.argentina.gob.ar/normativa/nacional/42755/actualizacion |
| A-14 | Ley N.º 26.388, Congreso, 2008-06-04; arts. 1–14 y tipos incorporados al CP. | https://www.argentina.gob.ar/normativa/nacional/ley-26388-141790/texto |
| A-15 | Facturación régimen general, ARCA, consultado 2026-07-23; RG 5762/2025. | https://www.arca.gob.ar/facturacion/regimen-general/comprobantes.asp |
| A-16 | Economía digital — normativa, ARCA, consultado 2026-07-23; RG 5319/2023, 4622/2019 y 4614/2019. | https://www.arca.gob.ar/economia-digital/ayuda/ |
| A-17 | Ley N.º 25.246, Congreso, texto actualizado; sujetos obligados/AML. | https://www.argentina.gob.ar/normativa/nacional/norma-62977/actualizacion |
| A-18 | Responsables de atención de PSP, BCRA, consultado 2026-07-23; PSPCP/PSI. | https://www.bcra.gob.ar/responsables-de-atencion-al-usuario-de-proveedores-servicios-de-pago-psp/ |
| A-19 | Resolución AAIP 126/2024, publicada 2024; Anexo II, graduación de sanciones. | https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-126-2024-399750/texto |
| A-20 | Registro de sanciones firmes, AAIP, actualizado 2026-07-03. | https://www.argentina.gob.ar/aaip/datospersonales/quienes-no-cumplen-con-la-ley-de-proteccion-de-datos-personales-y-el-registro |
| A-21 | Proyecto de Ley de Protección de Datos Personales, AAIP, Mensaje 87/2023; estado informativo, no ley vigente. | https://www.argentina.gob.ar/aaip/datospersonales/proyecto-ley-datos-personales |
| A-22 | Expediente 0098-D-2026, Cámara de Diputados, presentado 2026-03-02; proyecto de modificación Ley 25.326. | https://www.diputados.gov.ar/diputados/apropato/proyecto.html?exp=0098-D-2026 |
| A-23 | Ley N.º 27.442, Congreso, 2018, texto oficial; normas de defensa de la competencia. | https://www.argentina.gob.ar/normativa/nacional/ley-27442-310241/texto |
| A-24 | Decreto DNU 274/2019, Poder Ejecutivo, publicado 2019-04-22; arts. 1, 4–10. | https://www.argentina.gob.ar/normativa/nacional/decreto-274-2019-322236/texto |

## Revisión por abogado local pendiente

Antes de lanzar o publicar, validar: entidad/domicilio y alcance de registro; aplicación territorial; bases de legitimación/consentimiento y aviso; seguridad e incidentes; adecuación/CCM/autoridad para cada transferencia; Botón de Arrepentimiento y términos B2C/B2B; rol y responsabilidad de Hireeo frente a prestadores/consumidores; impuestos nacionales/provinciales, ARCA y facturación; perímetro BCRA/UIF y AML; tratamiento de menores, categorías reguladas y marketing. No se debe inferir cumplimiento de estas obligaciones por la sola existencia del código actual.
