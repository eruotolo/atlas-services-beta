# Uruguay — análisis jurisdiccional (Fase 3.1)

- **Corte jurídico:** 2026-07-23. **Investigación:** 2026-07-23.
- **Producto evaluado:** Hireeo, marketplace de servicios manuales/profesionales. Los pagos Mercado Pago, escrow/comisión del 15% y KYC están en `STUB/MOCK`; no hay dinero real ni liquidación a prestadores. Sí se tratan datos de cuentas, perfiles, direcciones/geolocalización, chat, reseñas, tracking GTM/GA4 y entradas de Gemini 2.5 Flash.
- **Alcance y límite:** informe de investigación, no asesoramiento jurídico definitivo. La aplicación concreta, en especial tributaria, financiera, laboral y de consumo, requiere revisión por abogado/a habilitado/a en Uruguay antes del lanzamiento.

## Resumen ejecutivo

La Ley N.º 18.331 y su reglamentación alcanzan al operador que trata datos de personas situadas en Uruguay, aun si está radicado fuera del país. Para Hireeo el riesgo inmediato es alto: no hay evidencia de inscripción de las bases ante URCDP, aviso de privacidad compatible, mecanismo de derechos, inventario/contratos de transferencias ni gestión operativa de incidentes; la base con perfiles, mensajería, ubicación y analítica es suficiente para activar el régimen. [U-01] arts. 5–17, 23 y 35; [U-03] arts. 1–9.

Las transferencias a Google (Gemini/GTM/GA4/Firebase), Cloudinary, OAuth, Brevo y posiblemente Stripe requieren clasificar país/importador/rol y documentar la base. La inscripción de la base es requisito previo incluso para transferencias; si el destino no es adecuado, se requieren garantías y, según el mecanismo escogido, autorización URCDP. Las políticas deben informar destino, rol del importador, plazo, base y operaciones. [U-04] resuelve 1–3; [U-05].

En B2C, Hireeo y, según cómo se presente, cada prestador pueden ser proveedores frente al consumidor. Deben identificar claramente proveedor y condiciones, informar antes de contratar y habilitar el desistimiento de cinco días hábiles para contratos a distancia, con la regla de servicios parcialmente ejecutados; los términos no pueden renunciar derechos ni limitar indebidamente responsabilidad. [U-07] arts. 6, 16, 31; [U-08] arts. 1–3. La arquitectura de pagos actual no activa por sí misma licencia de pagos ni obligaciones AML de PSP; sí debe congelarse el despliegue de escrow/recepción/liquidación de fondos hasta determinar quién es merchant of record y si Hireeo entra en perímetro BCU/UIAF.

### Tres obligaciones más urgentes

1. **Antes de captar usuarios uruguayos:** registrar responsable y bases, publicar aviso de privacidad veraz y habilitar derechos/retención; no declarar prácticas no implementadas.
2. **Antes de seguir usando terceros internacionales:** mapa de transferencias, DPA/encargo, evaluación de adecuación y cláusulas/autorización URCDP cuando correspondan; actualizar la información al titular.
3. **Antes de contratar/cobrar:** identidad legal y contacto del proveedor, términos B2C, flujo de desistimiento/reembolso y decisión formal de rol de marketplace/MoR; no activar escrow ni cobros sin revisión BCU, AML y DGI.

## Hechos confirmados, inferencias y supuestos

| Tipo | Hecho o conclusión limitada | Evidencia / consecuencia |
|---|---|---|
| Confirmado | Registro recoge nombre, email, contraseña, teléfono opcional y país; hay OAuth Google/Apple/Microsoft. | `02-product-and-data-map.md` §§3.1 y 4. |
| Confirmado | Se procesan dirección y coordenadas precisas, mensajería, publicaciones, reseñas, `metadata` de interacciones, tokens push y analítica. | `02-product-and-data-map.md` §§3.2–3.11. |
| Confirmado | GTM/GA4 se cargan sin una puerta de consentimiento; IA Gemini procesa texto libre y puede crear borrador de `ServiceRequest` tras confirmación. | Ídem §§1 y 3.9–3.12. |
| Confirmado | Pagos/escrow y KYC están simulados; no hay cobro real ni almacenamiento PCI conocido. | `01-scope-assumptions-and-open-questions.md`, E-08 a E-11. |
| Inferencia razonable | Hireeo determina fines y medios de cuenta, búsqueda, chat, seguridad, IA y analítica; sería responsable para esos tratamientos, sujeto a validar entidad operadora. | Q1 y Q3 siguen **BLOCKING**. |
| Supuesto pendiente | País de establecimiento, región de PostgreSQL/backups/Cloudinary, contrato Gemini y entrenamiento de inputs/outputs. | Q1, Q4, Q5, Q9. No se afirma adecuación ni licitud de la transferencia. |

## Marco vigente y autoridades

| Tema | Norma vigente y exigencia material | Autoridad | Aplicabilidad a Hireeo |
|---|---|---|---|
| Datos personales | Ley N.º 18.331: legalidad, veracidad, finalidad, consentimiento previo informado, seguridad, reserva y responsabilidad; información y derechos; registro; transferencias; sanciones. [U-01] arts. 5–17, 19–23, 35. | **URCDP** (Agesic). | Sí, datos de visitantes, usuarios, prestadores, admin y terceros incluidos en contenidos. |
| Alcance, seguridad y brechas | Ley N.º 19.670 arts. 37–40, reglamentada por Decreto N.º 64/020: alcance para ciertos sujetos fuera del país, responsabilidad proactiva, privacidad por diseño/default, EIPD en hipótesis del art. 6, delegado en supuestos legales y brechas. [U-02]; [U-03] arts. 1–9. | URCDP. | Sí; confirmar entidad y si se activan casos de delegado/EIPD obligatorio. |
| Registro y transferencia | Bases deben inscribirse; transferencia internacional exige nivel adecuado, excepción legal o autorización con garantías. Res. 70/023 exige informar importador/destino/plazo/base/operaciones y reafirma el registro previo. [U-01] arts. 6, 23; [U-04]. | URCDP. | Sí: Google, Apple, Microsoft, Cloudinary, Brevo, Firebase y futuros PSP/KYC. |
| Consumo y e-commerce | Ley N.º 17.250, Decreto N.º 244/000 y Decreto N.º 167/021 incorporando GMC 37/19: información clara, suficiente, veraz, en español, antes del contrato; identidad/contacto, precio/cargos, condiciones, confirmación. [U-07] arts. 6, 16, 28, 31; [U-08]. | MEF, Área Defensa del Consumidor; tribunales. | Sí si cliente contrata servicio o suscripción como destinatario final. |
| Documento/firma | Ley N.º 18.600 reconoce actos y negocios electrónicos, firma electrónica y avanzada bajo equivalencia funcional. [U-09] arts. 3–4. | Unidad de Certificación Electrónica/Agesic. | Términos clickwrap pueden formar evidencia contractual; firma avanzada solo si se exige mayor prueba. |
| Propiedad intelectual | Ley N.º 9.739 protege reproducción, distribución, comunicación y puesta a disposición; incluye almacenamiento electrónico. [U-10] art. 2. | MEC / Poder Judicial. | Sí para software, fotos, perfiles, reseñas y outputs IA; exige licencia de usuario y canal de reporte. |
| Ciberdelitos | Ley N.º 20.327 tipifica acceso, interceptación, vulneración/divulgación de datos y agrava, entre otros, datos personales. [U-11] arts. 6 y concordantes. | Fiscalía / Poder Judicial. | No crea registro general para Hireeo; hace material la prevención, preservación y respuesta a accesos no autorizados. |
| Ciberseguridad | Ley N.º 20.212 arts. 78–80 prevé obligaciones y registro de incidentes para entidades vinculadas a servicios/sectores críticos, no para un marketplace ordinario salvo calificación futura. [U-12]. | Agesic/CERTuy. | **Condicional:** no hay evidencia de sector crítico. Marco 5.0 y ENC 2024–2030 son referencia, no obligación general privada. [U-13]. |
| Pagos/AML | Ley N.º 19.574 (modificada, entre otras, por Ley N.º 20.469 de 2026) regula sujetos obligados y debida diligencia; BCU supervisa sujetos del art. 12. [U-14] arts. 12–21; [U-15]. | BCU/SSF, UIAF, SENACLAFT. | **Condicional:** intermediación de contactos sin custodiar fondos no demuestra que Hireeo sea sujeto obligado. Recibir, transferir o custodiar fondos puede cambiar resultado. |
| IVA/factura | Decreto N.º 144/018 regula renta/IVA de servicios digitales y mediación/intermediación por plataformas; CFE se rige por Res. DGI 798/2012 y modificaciones. [U-16]; [U-17]. | DGI. | **Condicional:** no hay operación/cobro real. La comisión, suscripción o actuar a nombre propio exige dictamen tributario y diseño de CFE. |
| Competencia/publicidad | Ley N.º 18.159 prohíbe prácticas anticompetitivas; Ley 17.250 prohíbe publicidad engañosa dentro del régimen de consumo. [U-07] arts. 24–25; [U-19] arts. 1–6. | Comisión de Promoción y Defensa de la Competencia / MEF. | Sí: rankings/patrocinios/precios deben identificarse y no engañar. |

## Obligaciones operativas y plazos

### Privacidad, IA y comunicaciones

| Obligación actual | Activador y plazo | Acción verificable para Hireeo |
|---|---|---|
| Registro de base/responsable antes del tratamiento. | La formación de bases es lícita si están inscritas; URCDP reafirma condición previa a tratamiento/transferencia. [U-01] art. 6; [U-04] resuelve 3. | Registrar las bases aplicables y contacto del responsable; conservar certificado y cambios. Confirmar si existe exención concreta antes de invocarla. |
| Aviso y base de legitimación; consentimiento cuando sea la base aplicable. | Antes de recolectar: informar finalidad, existencia, destinatarios, identidad/domicilio del responsable y derechos; datos sensibles tienen régimen reforzado. [U-01] arts. 8–10, 13. | Separar cuenta/contrato, seguridad, ubicación, perfiles públicos, IA, marketing y GA4. No usar casilla genérica para finalidades incompatibles. |
| Responder derechos. | Acceso: 5 días hábiles; rectificación/inclusión/supresión: 5 días hábiles; hábeas data si incumple. [U-01] arts. 14–17. | Portal/correo autenticado, registro de tickets, verificación de identidad, excepción documentada y borrado/anonimización que incluya terceros/backups conforme política aprobada. |
| Seguridad y brechas. | Iniciar acciones de minimización dentro de 24 h de constatar incidente; comunicar a URCDP dentro de 72 h desde conocido si incide en datos; comunicar titulares cuando corresponda. [U-03] arts. 3–4; [U-02]. | Playbook 24/72, responsable on-call, evidencia, matriz de riesgo, plantillas y obligación contractual del proveedor de notificar inmediatamente. No hay evidencia de este proceso. |
| Privacidad por diseño/default, EIPD y delegado cuando corresponda. | Decreto 64/020, arts. 5–9; EIPD para tratamientos de alto riesgo del art. 6. | Evaluar EIPD antes de producción para geolocalización, perfiles/ranking, IA con herramientas, gran escala y transferencias a no adecuados; decisión de DPO/delegado por abogado local. |
| Transferencia internacional. | Verificar destino adecuado o excepción/garantías; informar elementos de transferencia; contratos con cláusulas apropiadas para no adecuados. [U-01] art. 23; [U-04]; [U-05]. | Inventario proveedor→país→rol→dato→retención; DPA y cláusulas; no inferir que Google/EE. UU. es adecuado sin verificar importador concreto y mecanismo vigente. |
| Marketing electrónico. | La Ley 18.331 cubre finalidad/consentimiento y derecho de supresión de publicidad directa; no se localizó en esta fase un régimen uruguayo general de opt-in email equivalente a LSSI. [U-01] arts. 5, 9, 13, 16. | Antes de campañas, obtener consentimiento o validar otra base, incluir identidad y baja efectiva, lista de supresión, y separar transaccional de comercial. **Revisión local pendiente** sobre canal/SMS/WhatsApp. |

**Datos sensibles y menores.** La Ley 18.331 define datos sensibles (origen racial/étnico, preferencias políticas, convicciones religiosas/morales, afiliación sindical e información de salud o vida sexual) y prohíbe su tratamiento salvo supuestos legales. [U-01] arts. 4 y 18. La geolocalización precisa y chat no son listados automáticamente como sensibles, pero elevan riesgo y pueden contener datos sensibles. No hay verificación de edad; el grooming está tipificado [U-18], por lo que se requiere decisión de edad mínima, flujo de reporte y controles antes de permitir categorías de riesgo.

### Consumo, marketplace y contrato electrónico

1. En una página o app B2C, mostrar antes de contratar: razón social/nombre comercial, domicilio físico y electrónico, identificación, características del servicio, precio total/moneda/cargos, disponibilidad, términos, medios de pago, ejecución, restricciones y canal de reclamación. Decreto 167/021, arts. 1–3 [U-08]. La identidad legal de Hireeo es desconocida: **bloqueador de lanzamiento**.
2. El consumidor puede rescindir/resolver sin responsabilidad dentro de **cinco días hábiles** desde contrato o entrega (a su opción); en servicio parcialmente prestado paga solo lo ejecutado y el anticipo no ejecutado se devuelve inmediatamente. El contrato debe informar claramente ese derecho y domicilio; sin la información puede ejercerlo en cualquier momento. [U-07] art. 16. Las exclusiones del art. 16-BIS se revisan por tipo de servicio y no se presumen para servicios físicos del marketplace.
3. Diferenciar en interfaz y términos el contrato **Hireeo–usuario** (acceso a plataforma/suscripción) del contrato **cliente–prestador** (servicio). Decir “solo intermediario” no elimina responsabilidad si Hireeo fija precio, cobra, promete ejecución o controla la prestación. Esto es una inferencia jurídica a validar, no un hecho confirmado.
4. Contratos de adhesión B2C: no imponer renuncia de derechos, cambios unilaterales o limitaciones de responsabilidad abusivas. [U-07] arts. 28 y 31. Para prestadores empresariales (B2B) puede haber mayor autonomía, pero subsisten datos, publicidad, competencia, impuestos y responsabilidades por contenidos.

### Pagos, facturación, AML y plataforma

| Estado actual / conclusión | Condición de activación | Decisión requerida |
|---|---|---|
| Sin cobro real ni custodia confirmada, no se concluye que Hireeo sea PSP, empresa de transferencia de fondos ni sujeto obligado AML. | Activar checkout, recibir fondos propios/de terceros, saldo, escrow, payout o KYC regulatorio. | Obtener dictamen BCU/UIAF antes de producción; definir MoR, flujo de fondos, PSP licenciado, segregación, reembolsos, PCI, KYC/KYB y reportes. |
| El KYC Stripe stub no justifica recolectar identidad/biometría. | KYC de profesionales o pagos reales. | Contrato/DPA, necesidad, aviso, verificación de rol y no guardar documentos no necesarios. |
| La comisión 15% simulada puede ser ingreso por intermediación; las suscripciones y comisión alteran IVA/IRAE/IRNR y facturación. | Primera operación remunerada, entidad local/no residente, facturación a usuario/prestador. | Dictamen DGI; alta fiscal, RUT si corresponde, CFE y reglas de documentación por cuenta propia/ajena. [U-16]–[U-17]. |

## Sanciones, enforcement y riesgos de litigio

- **URCDP:** observación, apercibimiento, multa hasta **500.000 UI**, suspensión de la base hasta cinco días y clausura; graduación por gravedad/reiteración/reincidencia. [U-01] art. 35. Se debe calcular el equivalente monetario al momento de la infracción, no fijarlo en este informe.
- **Consumo:** Ley 17.250 contempla sanciones administrativas y responsabilidad civil; además, las cláusulas abusivas son ineficaces. [U-07] arts. 31, 42–47. La consecuencia concreta requiere evaluar proveedor/relación y autoridad competente.
- **Penal/ciber:** el acceso, interceptación o divulgación no autorizados pueden constituir delito; custodiadores y datos personales son circunstancias agravantes en Ley 20.327. [U-11].
- **Enforcement relevante:** la URCDP mantiene decisiones sobre transferencias y aplicó Res. 70/023 para elevar transparencia contractual; esta fase no identificó una resolución sancionatoria pública materialmente análoga a Hireeo. Se usa como señal de supervisión, no como precedente condenatorio. [U-04].

## Reformas, normas recientes y guías — separadas de obligaciones actuales

| Ítem | Estado al corte | Efecto en este análisis |
|---|---|---|
| Ley N.º 20.469, publicada 2026-04-10 | **Vigente**, modifica aspectos de Ley 19.574; no convierte automáticamente al marketplace sin pagos en sujeto obligado. [U-15]. | Revalidar AML/BCU al diseñar flujo real. |
| Res. URCDP 8/026 (2026) | **Recomendación/guía**, promueve cláusulas modelo del Consejo de Europa. [U-20]. | Puede apoyar contratación, no sustituye análisis de art. 23 ni autorización aplicable. |
| ENC 2024–2030 y Marco de Ciberseguridad 5.0 (actualizado 2026-06) | **Política/marco de referencia**, no obligación general de marketplaces privados. [U-13]. | Usar como baseline técnico voluntario. |
| Ley N.º 20.212 para sectores críticos | **Vigente**, aplicabilidad **condicional** a servicios/sectores críticos. [U-12]. | No presentar como deber actual de Hireeo sin clasificación sectorial. |

## Controles técnicos y operativos mínimos

- Deshabilitar GTM/GA4 hasta que el usuario elija la categoría no esencial; conservar prueba de preferencia y permitir retirarla. La conclusión de consentimiento específico exige revisión local, pero la separación de finalidades reduce riesgo bajo arts. 5 y 13.
- Implementar aviso por país, registro URCDP, inventario de tratamiento/transferencias, canal de derechos con SLA 5 días hábiles y política de retención aprobada. No hay evidencia actual de estos procesos.
- Minimizar datos enviados a Gemini; prohibir DNI, salud, tarjetas, contraseñas y ubicación exacta en prompts; control humano antes de que una sugerencia IA cree/afecte contratos o rankings; log minimizado y contrato del proveedor que aclare entrenamiento, región, subprocesadores e incidente.
- Documentar rol de cada prestador y validar identidad, credenciales y seguros solo si la categoría lo requiere; aviso de que no se verifican aún hasta implementar el control. Habilitar reporte/retirada/apelación para fraude, datos ilícitos, IP y menores.
- Antes de pagos reales, usar PSP contratado/licenciado, tokenización, conciliación, reglas de refund, KYC proporcional y revisión legal BCU/DGI/UIAF.

## Preguntas abiertas que requieren respuesta

| ID | Pregunta / riesgo | Prioridad |
|---|---|---|
| U-Q1 | ¿Cuál es la razón social, domicilio, establecimiento y representante de Hireeo? Sin ello no se puede completar registro, aviso ni información B2C. | **BLOCKING** |
| U-Q2 | ¿Dónde están DB/backups y cada subprocesador, qué contratos/DPA/CCM existen y Gemini usa inputs para entrenamiento? | **BLOCKING** |
| U-Q3 | ¿Quién es MoR, recibe/paga fondos, custodia escrow o factura comisión cuando salga de stub? | **BLOCKING** |
| U-Q4 | ¿Qué categorías de servicio se admitirán y qué credenciales/seguros se verifican? | HIGH |
| U-Q5 | ¿Edad mínima, método de verificación, reporte y respuesta a riesgo de menores? | HIGH |
| U-Q6 | ¿Se enviará marketing email/SMS/WhatsApp/push y cuál es la base/opt-out? | HIGH |
| U-Q7 | ¿Existe responsable de incidentes, logs, MFA admin, backups y prueba de restauración? | HIGH |

## Matriz de obligación → evidencia → propietario → prioridad → fecha objetivo

| Obligación / estado | Evidencia actual o faltante | Propietario sugerido | Prioridad | Fecha objetivo |
|---|---|---|---|---|
| Inscribir bases/responsable URCDP — **MANDATORY NOW** | No se localizó registro; Q1 pendiente. | Legal + Privacy | P0 | Antes de cualquier alta de residente UY |
| Aviso, bases, derechos 5/5 días — **MANDATORY NOW** | No existe flujo de derechos/retención identificado. | Legal + Product + Engineering | P0 | 0–14 días / pre-lanzamiento |
| Breach playbook 24/72 — **MANDATORY NOW** | Sin política o runbook confirmado. | Security + Privacy | P0 | 0–14 días |
| Transferencias/contratos — **MANDATORY NOW/CONDITIONAL** | Google, OAuth, Cloudinary, Brevo, Firebase; país y DPA no confirmados. | Privacy + Procurement + Security | P0 | Antes de producción UY |
| EIPD/delegado — **CONDITIONAL** | Ubicación precisa, IA y perfiles; alcance/escala por confirmar. | Privacy + Legal | P1 | Antes de lanzar IA/geo a escala |
| Consentimiento/opt-out marketing y analítica — **MANDATORY/CONDITIONAL** | GTM/GA4 activos sin gate; marketing no confirmado. | Product + Marketing + Engineering | P1 | Antes de campañas / 14 días |
| Información B2C y desistimiento 5 días — **MANDATORY BEFORE SALE** | Identidad legal, T&C y refund no confirmados. | Legal + Product + Operations | P0 | Antes de contrato/cobro |
| Roles marketplace, moderación y credenciales — **CONDITIONAL** | KYC stub; sin verificación de prestadores o proceso de apelación. | Trust & Safety + Legal | P1 | Pre-lanzamiento |
| PSP/AML/IVA/CFE — **CONDITIONAL BEFORE PAYMENTS** | Pagos/escrow mock; comisión 15% simulada. | Finance + Legal + Payments | P0 | Antes de activar pagos |

## Fuentes primarias y oficiales

Todas fueron consultadas el **2026-07-23**, jurisdicción **Uruguay**, idioma español, salvo que se indique guía/marco.

| ID | Fuente, organismo, fecha, artículos/secciones | URL |
|---|---|---|
| U-01 | Ley N.º 18.331, Parlamento/IMPO, promulgada 2008-08-11, texto actualizado; arts. 5–17, 18, 23 y 35. | https://www.impo.com.uy/bases/leyes/18331-2008 |
| U-02 | Ley N.º 19.670, Parlamento/IMPO, 2018-10-15; arts. 37–40 (modifica régimen de datos). | https://www.impo.com.uy/bases/leyes/19670-2018 |
| U-03 | Decreto N.º 64/020, Poder Ejecutivo/IMPO, 2020-02-17; arts. 1–9. | https://www.impo.com.uy/bases/decretos/64-2020 |
| U-04 | Resolución N.º 70/023, URCDP, 2023-12-05; resuelve 1–3. | https://www.gub.uy/unidad-reguladora-control-datos-personales/institucional/normativa/resolucion-n-70023 |
| U-05 | Resolución N.º 41/021, URCDP, 2021-09-08; cláusulas de transferencia; y portal de transferencias URCDP actualizado 2026-06-01. | https://www.gub.uy/unidad-reguladora-control-datos-personales/institucional/normativa/resolucion-n-41021 |
| U-06 | Guía URCDP para entidades extranjeras, URCDP/Agesic, consultada 2026-07-23; obligaciones, registro, EIPD y breach. **Guía no vinculante.** | https://www.gub.uy/unidad-reguladora-control-datos-personales/comunicacion/publicaciones/guia-para-cumplimiento-obligaciones-entidades-extranjeras/guia-para-2 |
| U-07 | Ley N.º 17.250, Parlamento/IMPO, 2000-08-11, texto actualizado; arts. 6, 16, 16-BIS, 28, 31, 42–47. | https://www.impo.com.uy/bases/leyes/17250-2000 |
| U-08 | Decreto N.º 167/021, Poder Ejecutivo/IMPO, 2021-06-02; anexo GMC 37/19, arts. 1–3. | https://www.impo.com.uy/bases/decretos/167-2021 |
| U-09 | Ley N.º 18.600, Parlamento/IMPO, 2009-09-21, texto actualizado; arts. 3–4, 21. | https://www.impo.com.uy/bases/leyes/18600-2009 |
| U-10 | Ley N.º 9.739, Parlamento/IMPO, 1937-12-17, texto actualizado; art. 2. | https://www.impo.com.uy/bases/leyes/9739-1937 |
| U-11 | Ley N.º 20.327, Parlamento/IMPO, 2024; art. 6 y tipos penales incorporados. | https://impo.impo.com.uy/bases/leyes-originales/20327-2024 |
| U-12 | Anexo II ENC Uruguay 2024–2030, Agesic, consultado 2026-07-23; Ley 20.212 arts. 78–80. | https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-ciberseguridad-del-uruguay-2024-2030/anexos/anexo-ii |
| U-13 | Marco de Ciberseguridad 5.0, Agesic, creado 2025-09-01, actualizado 2026-06. **Marco de referencia.** | https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/marco-ciberseguridad-50/marco-ciberseguridad-50 |
| U-14 | Ley N.º 19.574, Parlamento/IMPO, 2017-12-20, texto actualizado; arts. 12–21. | https://impo.impo.com.uy/bases/leyes/19574-2017 |
| U-15 | Ley N.º 20.469, Parlamento/IMPO, promulgada 2026-03-19, publicada 2026-04-10. | https://www.impo.com.uy/bases/leyes/20469-2026 |
| U-16 | Decreto N.º 144/018, Poder Ejecutivo/IMPO, 2018-05-22; tributación de servicios/plataformas y mediación. | https://www.impo.com.uy/bases/decretos/144-2018 |
| U-17 | Régimen CFE, DGI, Resolución 798/2012 y modificativas, actualizado 2025-08; información vigente consultada 2026-07-23. | https://www.efactura.dgi.gub.uy/principal/factura-electronica-normativa-resoluciones |
| U-18 | Ley N.º 19.580, Parlamento/IMPO, 2017-12-22; art. 94 (art. 277 bis CP, grooming). | https://www.impo.com.uy/bases/leyes-originales/19580-2017/94 |
| U-19 | Ley N.º 18.159, Parlamento/IMPO, 2007-07-20, texto actualizado; arts. 1–6. | https://www.impo.com.uy/bases/leyes/18159-2007 |
| U-20 | Portal de transferencias, URCDP, noticia de Resolución N.º 8/026 publicada 2026-06-01. **Referencia/guía.** | https://www.gub.uy/unidad-reguladora-control-datos-personales/tematica/transferencia |

## Revisión por abogado local pendiente

Debe validar antes de publicación o lanzamiento: entidad y establecimiento del responsable; alcance territorial y registro; calificación de datos/sensibles, consentimiento y EIPD; base/garantías/autorización de cada transferencia; texto de términos B2C/B2B y desistimiento por servicio; condición BCU/UIAF/AML de cualquier pago/escrow; IVA/IRAE/IRNR/CFE y retenciones; categorías reguladas, seguros, menores y reglas departamentales eventualmente aplicables. Este documento no autoriza cobros, transferencias ni tratamientos nuevos.
