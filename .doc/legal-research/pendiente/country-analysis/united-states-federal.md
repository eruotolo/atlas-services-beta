# Estados Unidos — marco federal (Fase 3.5)

- **Corte jurídico e investigación:** 2026-07-23. Jurisdicción: Estados Unidos federal.
- **Producto confirmado:** Hireeo es un marketplace de servicios con datos de cuenta, mensajes, perfil público, coordenadas precisas, GTM/GA4 sin gate y Gemini 2.5 Flash que clasifica y puede crear un borrador de solicitud. Pagos, KYC y escrow son `STUB/MOCK`; no hay cobro ni custodia real. No existe fecha de nacimiento ni verificación de edad.
- **Límite:** investigación de due diligence, no asesoramiento legal ni determinación de cumplimiento. La aplicación exige revisión por counsel estadounidense y, para pagos, especialista BSA/licencias estatales antes de lanzar.

## Resumen ejecutivo

Los riesgos federales actuales más importantes son: (1) **COPPA**, porque la ausencia de una barrera de edad no permite saber ni impedir que se recoja persistent identifiers, geolocalización, chat y datos de cuenta de menores de 13 años; (2) prácticas engañosas/desleales bajo FTC Act §5 por IA, reseñas, listados patrocinados, credenciales no verificadas y tracking; y (3) marketing, contenido y accesibilidad (CAN-SPAM/TCPA si se envían comunicaciones; DMCA y ADA Title III si el servicio se dirige al público). [F-01]–[F-08].

El modelo actual sin dinero real no permite concluir que Hireeo sea MSB o money transmitter. Si se activa el escrow y la liquidación, debe realizarse un análisis hecho por hecho: FinCEN ha reconocido una exclusión para ciertos escrow integrales a la venta, pero no es una autorización general; además subsisten BSA/OFAC y licencias estatales de money transmission. [F-10]–[F-12].

La Sección 230 no se repite aquí: véase `marketplace/01-platform-role-and-liability-analysis.md` §2.5. Como límite operativo, la inmunidad no cubre deberes propios, IP ni necesariamente contenido/sugerencias creadas por el agente Gemini; no debe usarse como sustituto de controles de IA, consumo o seguridad.

### Tres riesgos federales urgentes

1. **COPPA/menores:** establecer edad mínima y una pantalla neutral de edad antes de registrar, trackear o enviar prompts; si el producto se dirige a menores de 13 o se tiene conocimiento real, obtener consentimiento parental verificable antes del tratamiento.
2. **FTC §5 + IA/tracking:** no alegar “verificado”, “mejor”, “seguro” ni resultados IA no sustentados; divulgar patrocinio y la interacción con IA; impedir GA4/GTM no esencial hasta la señal/consentimiento estatal aplicable y evaluar sensitive data/geolocalización.
3. **Marketing/UGC:** separar mensajes transaccionales y comerciales, CAN-SPAM opt-out en 10 días hábiles, consentimiento TCPA antes de robotexts/calls, y poner DMCA agent/política de reincidentes antes de escalar contenido de usuarios.

## Aplicabilidad al producto y obligaciones concretas

| Régimen vigente | Activador y deber | Plazo / sanción / evidencia requerida |
|---|---|---|
| **FTC Act §5**, 15 USC §45 | Prohíbe prácticas desleales o engañosas. Aplica a afirmaciones de seguridad/privacidad, rankings, reseñas, patrocinio, “KYC verificado”, diseño de cancelación y afirmaciones sobre IA. La FTC también aplica su Rule on Consumer Reviews (16 CFR Part 465) frente a reseñas falsas/suprimidas. [F-01], [F-02]. | Sin plazo fijo. Crear expediente de sustento de claims, etiquetado de `Sponsor/featured`, moderación de reseñas y evaluación/guardrails de Gemini. Remedios incluyen orden, redress y sanciones civiles si hay infracción de orden/regla aplicable. |
| **COPPA**, 15 USC §§6501–6506; 16 CFR Part 312 | Operador de sitio/servicio dirigido a niños menores de 13, o con conocimiento real de que recolecta su información. “Personal information” cubre identificadores persistentes y geolocalización. Antes de recolectar: aviso directo y consentimiento parental verificable, minimización, seguridad, acceso/borrado. [F-03]. | **Antes de recolectar** datos de niño conocido. La regla actualizada se publicó 2025-04-22; sus cambios tienen periodo de cumplimiento de un año salvo disposición distinta. [F-04]. Sin edad gate, el riesgo depende de si Hireeo es dirigido a niños o adquiere conocimiento real, hecho pendiente. |
| **CAN-SPAM**, 15 USC §§7701–7713 | Todo email comercial, B2C y B2B: headers/asunto no engañosos, identificación publicitaria cuando corresponda, dirección postal válida y mecanismo de baja. [F-05]. | Respetar baja en **10 días hábiles** y mantenerla operativa 30 días; FTC informa hasta **USD 53.088 por email** infractor (monto sujeto a actualización). Contratar Brevo no transfiere responsabilidad. |
| **TCPA**, 47 USC §227 y reglas FCC | Llamadas/textos con autodialer/artificial/prerecorded voice para telemarketing; consentimientos y reglas dependen de tecnología/contenido. [F-06]. | **Antes de campañas** de SMS/llamadas. No hay evidencia de SMS o llamadas automáticas; WhatsApp/contacto entre usuarios no equivale por sí solo a campaña TCPA, pero debe revisarse el flujo técnico. Mantener prueba de consentimiento y revocación. |
| **E-SIGN**, 15 USC §7001 | Aceptación electrónica de términos es generalmente válida; si una ley exige entregar información al consumidor por escrito, el consentimiento a recibirla electrónicamente exige divulgaciones y consentimiento demostrable. [F-07]. | Antes de sustituir avisos/contratos legalmente requeridos por electrónico: registrar versión, fecha, manifestación afirmativa, capacidad de acceso y método para retirar consentimiento. |
| **DMCA**, 17 USC §512 | Safe harbor para hosting/listados/fotos/chat de terceros es condicionado: agente designado registrado y publicado, política razonablemente implementada de repeat infringers, notice/counter-notice y retirada expeditiva. [F-08]. | Antes de UGC a escala: registro de agente, canal, log de notice/acción; contraaviso → restaurar entre 10 y 14 días hábiles salvo acción judicial. No cubre contenido generado por Hireeo/IA ni otras causas. |
| **Take It Down Act**, Pub. L. 119-12 §3 (TIDA) | Desde 2026-05-19, plataformas cubiertas que alojan contenido íntimo no consentido/deepfakes deben tener aviso/proceso de retirada. [F-09]. | Aplicabilidad depende de si Hireeo “regularly hosts” ese contenido. Incluir canal de abuso y política de prohibición desde el lanzamiento; la FTC informa posible multa de USD 53.088 por violación. |
| **ADA Title III**, 42 USC §§12181–12189 | Negocios abiertos al público deben proporcionar igualdad de acceso; DOJ sostiene que se extiende a bienes/servicios ofrecidos en web. El alcance exacto de website-only sigue variando entre circuitos. [F-13], [F-14]. | No hay reglamento federal general de WCAG para private websites. Adoptar WCAG 2.2 AA como criterio técnico, pruebas de teclado/lectores, captions y proceso de accommodations. **Section 508** es requisito de agencias federales y ciertos contratistas, no obligación general de Hireeo privado. |
| **FCRA**, 15 USC §1681 et seq. | **No aplicable hoy con evidencia disponible.** Se activaría si Hireeo usa un consumer report/background check para elegibilidad, empleo, crédito/seguro u otro propósito cubierto. | No usar reputación, KYC, licencia o datos de terceros para decisiones cubiertas sin análisis FCRA, permisos, disclosures y adverse-action process. Marketplace no es plataforma de empleo confirmada. |
| **BSA/FinCEN, OFAC** | **Condicional antes de pagos.** Money transmitter no tiene umbral de actividad; el encuadre depende de aceptar/transmitir valor. FinCEN reconoce que un escrow integral a venta puede quedar fuera, según hechos. OFAC puede aplicar responsabilidad civil estricta. [F-10]–[F-12]. | Antes de escrow/payout: dictamen FinCEN + licencias estatales, rol PSP/MoR, AML program si procede, KYC/KYB, SAR/registro si procede y screening de sanciones basado en riesgo. |

## IA, publicidad y decisiones automatizadas

- **Hecho confirmado:** Gemini recibe texto libre y contexto local; el agente propone proveedores y puede crear borrador de `ServiceRequest` después de confirmación. No es una herramienta de contratación laboral, crédito, vivienda, seguro, educación o empleo.
- **Conclusión:** no se identifica ahora una decisión “adversa” cubierta por FCRA ni NYC LL 144. Si el ranking/suspensión/credencial pasa a determinar acceso a trabajo o precio de forma automatizada, reabrir el análisis federal y estatal de AI/ADMT.
- **FTC:** no hay una ley federal horizontal de IA vigente al corte. FTC §5 sí prohíbe engaño o injusticia en cómo se desarrolla, afirma o usa IA. La propuesta de policy statement sobre “suppression of accuracy” de 2026-06-30 es **propuesta/consulta**, no obligación actual. [F-02].
- **Control verificable:** aviso “asistente de IA”, prohibición de datos sensibles/documentos/tarjeta en prompts, confirmación antes de tool action, pruebas de alucinación y sesgo, revisión humana de reportes/decisiones de alto impacto y versionado de prompt/modelo.

## B2C, B2B y suscripciones

- CAN-SPAM cubre también B2B. FTC Act aplica a prácticas comerciales aunque el profesional sea una empresa.
- COPPA protege al niño, no distingue B2C/B2B; el riesgo principal es el visitante/cliente menor, no el profesional empresarial.
- El final “Click-to-Cancel” de 2024 fue **anulado por el Octavo Circuito en julio de 2025**; no debe presentarse como obligación federal vigente. Permanecen ROSCA (15 USC §§8401–8405), la Negative Option Rule previa y FTC Act, además de leyes estatales de autorrenovación. [F-15].
- Para una suscripción premium B2B o B2C: mostrar precio, periodicidad, auto-renovación, cómo cancelar, conservar aceptación y hacer la cancelación tan fácil como el alta como estándar de riesgo; luego aplicar las reglas estatales más estrictas de la matriz.

## Enforcement y jurisprudencia relevante

| Fuente | Relevancia limitada |
|---|---|
| FTC, COPPA Rule finalizada 2025 | Amplía definiciones, limita monetización de datos infantiles y confirma prioridad de enforcement; no prueba que Hireeo esté dirigido a niños. [F-04]. |
| FTC, Take It Down Act guidance, 2026 | Desde mayo de 2026 FTC explica deberes de proceso de retirada y sanciones para plataformas cubiertas; relevante si se alojan imágenes/videos de usuarios. [F-09]. |
| *Custom Communications, Inc. v. FTC*, 142 F.4th 1060 (8th Cir. 2025) | Anuló la regla FTC enmendada de negative options; por eso el expediente no impone la regla 2024 como vigente. Fuente oficial FTC confirma la vacatur. [F-15]. |
| Copyright Office §512 | Explica requisitos vigentes de safe harbor, agente, repeat infringer, notice y counter-notice. [F-08]. |

## Preguntas abiertas

| ID | Pregunta / impacto | Prioridad |
|---|---|---|
| US-F1 | ¿La experiencia está dirigida a menores, hay categorías de menores o se responderá a conocimiento real de <13? | **P0 — COPPA** |
| US-F2 | ¿Se enviará SMS, llamadas con sistema automático/prerecorded voice, email comercial o push? | P0 para TCPA/CAN-SPAM |
| US-F3 | ¿Cuál es entidad operadora, base de US nexus y dónde se alojan GA4/Gemini/Cloudinary? | P0 para avisos, jurisdicción y contratos |
| US-F4 | ¿El PSP será MoR, habrá fondos de terceros/escrow/payout y qué estados de usuarios/prestadores? | P0 antes de pagos |
| US-F5 | ¿Qué datos usa Gemini, los retiene/entrena y qué resultados se presentan como recomendación propia? | P1 |
| US-F6 | ¿Qué oficios regulados se permiten y qué licencia/seguro se verificará por estado? | P1 |

## Matriz obligación → evidencia → propietario → prioridad → fecha objetivo

| Obligación / estado | Evidencia actual/faltante | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|
| COPPA: edad gate + parental path — **MANDATORY IF TRIGGERED** | No hay DOB/age verification; GA4, geolocalización, cuenta, chat e IA activos. | Product + Privacy + Engineering | P0 | Antes de tráfico US |
| FTC claims/reseñas/IA — **MANDATORY NOW** | `featured/Sponsor`, KYC stub, IA activa; política/enforcement no confirmado. | Legal + Trust & Safety + Product | P0 | 0–14 días |
| CAN-SPAM/TCPA preference center — **CONDITIONAL BEFORE MARKETING** | Brevo/FCM existentes; canales y consentimiento no confirmados. | Marketing + Engineering + Legal | P0 | Antes de primera campaña |
| DMCA/TIDA policy — **MANDATORY/CONDITIONAL** | UGC (imágenes, perfiles, chat) sin canal formal identificado. | Legal + Trust & Safety | P1 | Pre-lanzamiento US |
| ADA accessibility baseline — **MANDATORY/RISK-BASED** | No se auditó accesibilidad. | Product + Engineering | P1 | Pre-lanzamiento / trimestral |
| BSA/OFAC/PSP — **CONDITIONAL BEFORE PAYMENTS** | Stripe/escrow/KYC son stub. | Finance + Payments + Legal | P0 | Antes de habilitar dinero |

## Fuentes primarias y oficiales

Consultadas 2026-07-23, Estados Unidos federal, inglés. Las guías oficiales se señalan como orientación y se usan junto con estatuto/regla.

| ID | Organismo, fecha, norma/sección | URL |
|---|---|---|
| F-01 | U.S. Code, 15 USC §45, FTC Act §5. | https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section45 |
| F-02 | FTC, consulta sobre policy statement de IA, 2026-06-30. **Propuesta, no obligación actual.** | https://www.ftc.gov/policy/public-comments/policy-statement-concerning-suppression-accuracy-artificial-intelligence-systems |
| F-03 | U.S. Code, COPPA, 15 USC §§6501–6506; FTC COPPA guidance. | https://uscode.house.gov/view.xhtml?path=/prelim@title15/chapter91&edition=prelim |
| F-04 | FTC, final rule COPPA, 2025-01; compliance guide actualizado 2025. | https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data |
| F-05 | FTC, CAN-SPAM compliance guide, consultado 2026-07-23. | https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business |
| F-06 | U.S. Code 47 USC §227; FCC TCPA materials. | https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227 |
| F-07 | U.S. Code, E-SIGN, 15 USC §7001. | https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section7001 |
| F-08 | U.S. Copyright Office, 17 USC §512 safe harbors/resources, consultado 2026-07-23. | https://www.copyright.gov/512/ |
| F-09 | FTC, Take It Down Act guidance, mayo 2026. | https://www.ftc.gov/business-guidance/resources/complying-take-it-down-act |
| F-10 | FinCEN, MSB registration/definition, consultado 2026-07-23; 31 CFR 1010.100(ff), 1022.380. | https://www.fincen.gov/resources/money-services-business-msb-registration |
| F-11 | FinCEN ruling FIN-2014-R004, 2014-04-29, internet-sale escrow. | https://www.fincen.gov/resources/statutes-regulations/administrative-rulings/application-money-services-business-1 |
| F-12 | OFAC, Framework for Compliance Commitments, 2019-05-02, actualizado en portal. | https://ofac.treasury.gov/recent-actions/20190502_33 |
| F-13 | ADA, Title III, 42 USC §§12181–12189. | https://www.ada.gov/law-and-regs/ada/ |
| F-14 | DOJ ADA web accessibility guidance, 2022-03-18. | https://www.ada.gov/resources/web-guidance/ |
| F-15 | FTC ANPRM Negative Option Rule, marzo 2026; reconoce vacatur de 2025. | https://www.ftc.gov/system/files/ftc_gov/pdf/p064202negativeoptionruleanprm.pdf |

## Revisión por abogado local pendiente

Validar antes de publicar: umbrales y nexus federal/estatal; orientación a menores/conocimiento real; tecnología usada para SMS/llamadas; clasificación de correo; entidad y contratos de proveedores; eligibility de safe harbors DMCA/§230; accesibilidad según circuito; rol PSP/MoR y licencias BSA/estatales; y cualquier categoría de servicio regulada. No activar pagos ni presentar alegaciones de verificación/IA hasta que las decisiones y controles sean comprobables.
