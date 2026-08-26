# Estados Unidos — matriz estatal y local (Fase 3.5)

- **Corte jurídico e investigación:** 2026-07-23. La matriz aplica a residentes, no sólo a la entidad donde Hireeo se constituya. Se debe reevaluar cada trimestre por crecimiento, marketing y pagos.
- **Regla de lectura:** `ACTUAL` no significa que Hireeo supera el umbral; `CONDICIONAL` exige medir residentes/ingresos/venta de datos. Ninguna ley estatal se presenta como cumplida: no hay entidad, conteos, avisos, CMP, contratos DPA ni política de retención confirmados.
- **Producto:** marketplace con IA Gemini, geolocalización exacta y GTM/GA4 sin gate; no hay verificación de edad. Pagos/escrow/KYC son mock. No es plataforma de empleo.

## Resumen ejecutivo y priorización

Priorizar primero **California, Colorado, Connecticut, Texas, Utah e Illinois**, aunque Hireeo sea pequeño: combinan alta exposición de residentes, geolocalización/ads/IA, reglas de opt-out o IA ya vigentes y riesgo de consumo/biometría. Después instrumentar un núcleo multijurisdiccional para Delaware, Oregon, Montana, New Jersey, Maryland, Minnesota, Nebraska, New Hampshire, Kentucky, Indiana, Iowa, Tennessee, Rhode Island y Florida, activado por umbral.

Las tres brechas estatales más urgentes son: **(1)** edad/menores y geolocalización/sensitive data (CT, CA y otras), **(2)** bloquear/opt-out de targeted advertising y honrar GPC donde aplique (CO y CT ya lo requieren para controllers cubiertos), y **(3)** documentación y control de IA ante Colorado AI Act y Texas TRAIGA; California ADMT significativo empieza 2027-01-01, no ahora. Las leyes de renovación automática deben diseñarse con un estándar de cancelación simple, consentimiento y prueba desde la primera suscripción.

## Matriz de privacidad integral — vigencia y gatillo

| Estado | Ley / vigencia al 2026-07-23 | Gatillo de aplicabilidad resumido | Obligaciones relevantes para Hireeo |
|---|---|---|---|
| **California** | CCPA/CPRA, **ACTUAL**. | Empresa con $25M ingresos globales, 100k consumidores/hogares, o 50% de ingresos por vender/compartir PI (medir). [S-01]. | Aviso al recolectar, derechos, limitación de sensitive PI, contratos service provider/contractor, seguridad razonable, `Do Not Sell or Share`/GPC si vende/compartir para publicidad dirigida. Las regulaciones CPPA son efectivas 2026-01-01; risk assessments aplicables desde esa fecha y ADMT de decisiones significativas desde **2027-01-01**. [S-02]. |
| **Colorado** | Colorado Privacy Act, **ACTUAL** desde 2023-07-01. | 100k consumidores/año o 25k + ingreso por venta. [S-03]. | Aviso, derechos, consentimiento para sensitive data, data-protection assessment para processing de riesgo, opt-out de venta/targeted ads/profiling; GPC/UOOM desde 2024-07-01 para controllers cubiertos. |
| **Connecticut** | CTDPA, **ACTUAL**; expansiones efectivas **2026-07-01**. | Desde 2026: 35k residentes, venta, o sensitive data fuera de pago según AG; medir exacto. [S-04]. | Derechos, DPA, consentimiento sensitive, opt-out preference signals desde 2025-01-01, protecciones de menores y profiling/assessment ampliados. AG reporta enforcement e investigaciones de chatbots/menores. |
| **Virginia** | VCDPA, **ACTUAL** desde 2023-01-01. | 100k consumidores o 25k + 50% venta. | Aviso, derechos, opt-out venta/ads/profiling, consentimiento sensitive, DPIA; AG enforcement, sin private right general. |
| **Utah** | UCPA, **ACTUAL** desde 2023-12-31. | $25M ingresos + 100k consumidores o 25k + 50% venta. [S-05]. | Aviso, acceso/borrado/portabilidad/opt-out venta/targeted ads; menos amplio que CO/CT. El Utah AI Policy Act es vigente desde 2024-05-01 y SB 226 (2025) añadió disclosure de generative AI en transacciones de consumo/servicios regulados desde 2025-05-07. [S-06]. |
| **Texas** | TDPSA, **ACTUAL** desde 2024-07-01; TRAIGA **ACTUAL** desde 2026-01-01. | TDPSA: entidad no exenta que procesa datos de residentes; exención small business federal, salvo venta sensitive. | Derechos, aviso, consentimiento sensitive, opt-out venta/ads/profiling y contrato processor. TRAIGA prohíbe ciertos usos/discriminación ilegal/biometría sin consentimiento y exige disclosures limitados; AG es enforcement, no private right. [S-07]. |
| **Oregon** | OCPA, **ACTUAL** desde 2024-07-01. | 100k consumidores o 25k + 25% ingreso por venta. | Derechos, DPA, consentimiento sensitive, opt-out; revisar obligaciones de menores/precise location y cure period vigente al momento. |
| **Montana** | MCDPA, **ACTUAL** desde 2024-10-01. | 50k consumidores o 25k + 25% ingreso venta. | Núcleo de derechos, consentimiento sensitive, opt-out, DPA; AG enforcement. |
| **Delaware** | DPDPA, **ACTUAL** desde 2025-01-01. | 35k consumidores o 10k + 20% ingreso venta. [S-08]. | Derechos, sensitive data/minors, DPA, opt-out y contract controls; sin private right general. |
| **New Jersey** | NJDPA, **ACTUAL** desde 2025-01-15. | 100k consumidores o 25k + ingreso por venta. | Aviso, derechos, consentimiento sensitive, opt-out/DPA y processor contracts; confirmar reglamentación AG. |
| **Maryland** | MODPA, **ACTUAL** desde 2025-10-01. | 35k consumidores o 10k + 20% ingreso venta. [S-09]. | Minimización/limitaciones de sensitive data, derechos, DPA y prohibiciones más estrictas; violación es unfair/abusive/deceptive trade practice. |
| **Minnesota** | MCDPA, **ACTUAL** desde 2025-07-31 (algunas obligaciones escalonadas). | 100k consumidores o 25k + 25% ingreso venta; small-business rule tiene matices. | Derechos, privacy notice, DPA, consentimiento sensitive, universal opt-out y obligaciones de profiling; validar fecha de cada capítulo antes de campaña. |
| **Nebraska** | NEDPA, **ACTUAL** desde 2025-01-01. | Generalmente businesses que no son small business, con reglas especiales de sensitive data. | Derechos, aviso, opt-out, consentimiento sensitive, processor contracts; AG enforcement. |
| **New Hampshire** | NHPA, **ACTUAL** desde 2025-01-01. | 35k consumidores o 10k + 25% ingreso venta. | Derechos, privacy notice, opt-outs, sensitive consent, DPA; AG enforcement/cure sujeto a ley. |
| **Kentucky** | KCDPA, **ACTUAL** desde 2026-01-01. | 100k consumidores o 25k + 50% ingreso venta. [S-10]. | Derechos, privacy notice, opt-out venta/ads/profiling, sensitive consent/DPA; AG exclusivo, sin private right. |
| **Indiana** | ICDPA, **ACTUAL** desde 2026-01-01. | 100k consumidores o 25k + 50% ingreso venta. | Núcleo Virginia-like: derechos, opt-out, sensitive consent, DPA, processor contract; AG enforcement. |
| **Iowa** | ICDPA, **ACTUAL** desde 2025-01-01. | 100k consumidores o 25k + 50% ingreso venta. | Derechos/notice y opt-out de venta; estándar menos estricto, AG enforcement. |
| **Tennessee** | TIPA, **ACTUAL** desde 2025-07-01. | $25M ingresos + 175k consumidores o 25k + 50% ingreso venta. | Derechos, opt-out, sensitive consent, DPA; affirmative defense por NIST privacy framework si se implementa/mantiene. |
| **Rhode Island** | RI Data Transparency & Privacy Protection Act, **ACTUAL** desde 2026-01-01. | $1M ingresos + 35k consumidores o 10k + 20% ingreso venta. | Derechos/notice/opt-out; confirmar excepciones y cure antes de aplicación práctica. |
| **Florida** | Digital Bill of Rights, **ACTUAL** desde 2024-07-01. | Alcance estrecho: grandes compañías (≈$1B ingresos globales y criterios adicionales). | Monitorear, pero probablemente no activada para startup; no asumir exención sin métricas. |

**Estados sin ley integral general confirmada en esta matriz al corte:** no equivale a ausencia de deberes: siguen FTC, breach-notice, biometría, publicidad, consumo, licencia profesional y common law. El registro se concentra en leyes integrales vigentes verificadas; no trata un proyecto como obligación.

## IA, ADMT, biometría y menores — matriz separada

| Jurisdicción | Estado y alcance | Consecuencia para el agente Gemini |
|---|---|---|
| **California** | Regulaciones CPPA ADMT efectivas 2026-01-01; obligaciones de ADMT para **significant decisions** comienzan 2027-01-01. [S-02]. | Hoy el clasificador/draft no es decisión significativa confirmada. Inventariar ADMT, no usarlo para empleo/crédito/vivienda/seguro/educación sin reevaluar, y preparar opt-out/access logic antes de 2027 si el producto cambia. |
| **Colorado** | Colorado AI Act (SB 24-205, mod. SB25B-004) **vigente desde 2026-06-30**. Regula developers/deployers de high-risk AI que toma “consequential decisions” (empleo, educación, crédito, salud, vivienda, seguro, legal/essential services); riesgo, impacto, disclosures y AG enforcement. [S-11]. | No se ve una decisión consecuencial actual: marketplace de servicios ≠ empleo. No declarar N/A permanentemente; prohibir usar ranking/IA para elegibilidad laboral/crédito y documentar la clasificación. |
| **Texas** | TRAIGA HB 149, **vigente desde 2026-01-01**. [S-07]. | Sí aplica territorialmente si se desarrolla/despliega IA en Texas; controles sobre discriminación ilegal, biometría y disclosures exigidos por la ley. Revisar texto final, no el proyecto. |
| **Utah** | Utah AI Policy Act, vigente 2024-05-01; GenAI consumer-protection amendments de 2025. [S-06]. | Cuando una persona razonable pueda pensar que interactúa con humano, disclosure de GenAI en consumer transaction; disclosure en servicios regulados. Mantener banner y registro de interacción. |
| **Connecticut** | CTDPA ampliado protege menores y requiere evaluación para cierto profiling; AG investiga chatbots/online safety. [S-04]. | Por falta de edad gate, no personalizar/dirigir publicidad o manipular con IA a menores; aplicar estándar más protector hasta saber edad. |
| **Illinois** | BIPA, 740 ILCS 14/15, **ACTUAL**: aviso escrito, propósito/plazo, consentimiento antes de captar biometric identifier/information; retention/destruction policy; restricciones de disclosure y private action. [S-12]. | No usar voz, rostro, selfie, ID biométrico o Stripe Identity de modo que Hireeo capture/posea biometría sin análisis BIPA y consentimiento. El flag `isKycVerified` no demuestra captura hoy. |
| **NYC** | Local Law 144 **sólo** empleadores/agencias que usan AEDT para candidatos/empleados: bias audit anual, publicación y aviso 10 días hábiles; enforcement desde 2023-07-05. [S-13]. | **No aplica al marketplace actual.** No extender por analogía. Reabrir sólo si Hireeo facilita decisiones automatizadas de empleo. |

## Consumidor, autorrenovación y marketing — controles estatales

- **California ARL** y múltiples leyes de automatic renewal (incluidos NY, CO, CT, VA y otros) varían por estado. Como control global, antes de cobrar una suscripción: términos claros y conspicuos, consentimiento afirmativo separado, confirmación conservable, recordatorios cuando proceda, cancelación online simple, refund/escalamiento y sin dark patterns. Confirmar reglas por residencia y tipo de plan antes de producción.
- **No usar el final FTC Click-to-Cancel de 2024 como obligación vigente:** fue anulado en 2025. [S-14]. ROSCA/FTC Act y estatales siguen aplicando.
- **B2B:** algunas leyes (p. ej., CAN-SPAM) cubren B2B; leyes estatales de privacidad suelen excluir contexto comercial/empleo, pero los profesionales pueden ser consumidores para su cuenta personal. Mostrar términos distintos Client/Professional y no reutilizar datos de contacto del prestador para ads sin base/opt-out.
- **Brechas:** California y todos los estados tienen leyes de breach notification con disparadores distintos. No se elaboran plazos estatales exhaustivos aquí: antes de un incidente, establecer playbook que preserve evidencia, determine residentes/PI/cripto, avise a counsel y active matriz de notificaciones estatal.

## Sanciones y enforcement relevante

- **California:** CCPA permite enforcement CPPA/AG y private action limitada por ciertas brechas de información no cifrada/no redactada; aplicar rangos y cure conforme texto vigente, no como multa automática. [S-01].
- **Colorado/Connecticut/Texas y demás leyes integrales:** normalmente AG exclusivo y cure/enforcement según estatuto; Texas TRAIGA autoriza AG y sanciones civiles. No hay private right general indicado para estos estatutos salvo donde la norma expresamente lo reconozca.
- **Maryland:** MODPA se califica como práctica unfair/abusive/deceptive bajo Consumer Protection Act. [S-09].
- **BIPA:** private action y daños estatutarios han generado exposición material; riesgo sólo si hay datos biométricos dentro del alcance, hecho no confirmado.
- **Connecticut:** el AG publicó 2026 que hay investigaciones activas sobre seguridad infantil, mensajería, juegos y chatbots; señal de enforcement, no determinación contra Hireeo. [S-04].

## Controles técnicos/operativos de prioridad

1. CMP que bloquee GA4/GTM no esencial hasta preferencia y soporte GPC/UOOM; registrar señal y resolver `Do Not Sell/Share` / targeted-ad opt-outs por estado.
2. Edad mínima, neutral age screen, política para menor conocido, no geolocalización/ads/prompt IA de menores sin flujo jurídico aplicable.
3. Inventario de datos/ADMT: finalidad, modelo, input/output, humanos, decisiones afectadas, data assessment y log de explicación/apelación cuando la ley lo requiera.
4. DPA con Google, analytics, OAuth, Cloudinary, Brevo, Firebase y futuros PSP; prohibir secondary use, subprocessor sin aviso y entrenamiento no confirmado.
5. Centro de derechos que pueda autenticar, exportar/corregir/borrar, opt-out ads/profiling/venta y registrar plazos por estado; añadir mecanismos de appeal donde aplique.
6. Pago futuro: geofencing/estado de residente, MoR, money-transmitter 50-state survey, BSA/OFAC/KYC y tax before escrow.

## Preguntas abiertas

| ID | Pregunta | Prioridad |
|---|---|---|
| US-S1 | ¿Cuántos residentes por estado, ingresos globales, ingresos por venta/share y small-business status? | P0 — determina CCPA/otros umbrales |
| US-S2 | ¿Hay directed-to-children marketing, categorías para menores, controles parentales o conocimiento de edad? | P0 — COPPA/CT/CA |
| US-S3 | ¿GA4/GTM se usa para targeted ads o sólo medición y se comparte PI? | P0 — CA/CO/CT/otros |
| US-S4 | ¿La IA rankea, suspende, fija precio, verifica licencias o afecta oportunidad económica? | P0 — CO/CA/TX/CT |
| US-S5 | ¿Stripe Identity tratará selfie/biometría, y quién la posee/controla? | P1 — BIPA/TX/CA |
| US-S6 | ¿Cuáles serán estados de prestación/cobro y quién custodia/liquida fondos? | P0 antes de pagos |

## Matriz obligación → evidencia → propietario → prioridad → fecha objetivo

| Obligación / estado | Evidencia actual/faltante | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|
| Medición de umbrales por estado — **MANDATORY TO DETERMINE SCOPE** | No hay entidad ni métricas de residentes/ingresos. | Legal + Finance + Data | P0 | 0–14 días y trimestral |
| GPC/opt-out/CMP — **MANDATORY IF COVERED** | GTM/GA4 cargan sin gate; venta/share/targeting desconocidos. | Product + Engineering + Privacy | P0 | Antes de tráfico/ads US |
| Sensitive data/geo/minors — **MANDATORY IF COVERED** | Lat/long y no age gate; no consent record. | Privacy + Engineering | P0 | Pre-lanzamiento |
| Colorado AI Act classification — **MANDATORY NOW IF CONSEQUENTIAL AI** | Gemini activo, pero no decision consequential confirmada. | AI Governance + Legal | P0 | 14 días; antes de ampliar IA |
| Texas TRAIGA / Utah GenAI disclosure — **MANDATORY NOW IF TERRITORIAL TRIGGER** | AI chat/classifier activo; UI disclosure no confirmado. | Product + Legal | P1 | 14–45 días |
| California ADMT readiness — **MANDATORY BY 2027-01-01 IF SIGNIFICANT DECISION** | No inventario/opt-out/notice ADMT. | AI Governance + Privacy | P1 | 2026 Q4 |
| BIPA guardrail — **MANDATORY BEFORE BIOMETRICS** | KYC stub; no evidence of biometric capture. | Payments + Privacy + Legal | P0 | Antes de activar KYC |
| Subscriptions/auto-renewal — **CONDITIONAL BEFORE SALE** | Premium model exists; no cobranza real/flow. | Product + Billing + Legal | P0 | Antes de suscripción |

## Fuentes primarias y oficiales

Consultadas 2026-07-23, Estados Unidos, inglés. Las URLs apuntan a legislaturas, autoridades o textos normativos; las filas de alcance son resúmenes y debe revisarse el estatuto completo antes de ejecutar.

| ID | Organismo, fecha, norma | URL |
|---|---|---|
| S-01 | California Legislature, Civil Code §§1798.100 et seq. (CCPA/CPRA), texto vigente. | https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.100. |
| S-02 | CPPA, ADMT/risk assessment/cybersecurity regulations, aprobadas 2025-09-22, efectivas 2026-01-01; calendario de compliance. | https://cppa.ca.gov/regulations/ccpa_updates.html |
| S-03 | Colorado AG, Colorado Privacy Act y UOOM/GPC, consultado 2026-07-23. | https://coag.gov/resources/colorado-privacy-act/ |
| S-04 | Connecticut AG, CTDPA y ampliaciones 2026-07-01; enforcement report 2026. | https://portal.ct.gov/ag/sections/privacy/the-connecticut-data-privacy-act/ |
| S-05 | Utah Legislature, UCPA Title 13 ch. 61, vigente; texto. | https://le.utah.gov/xcode/Title13/Chapter61/13-61.html |
| S-06 | Utah Legislature, AI Policy Act ch. 72 y SB 226 enrolled, 2025. | https://le.utah.gov/xcode/Title13/Chapter72/13-72.html |
| S-07 | Texas Legislature, HB 149 enrolled (TRAIGA), efectiva 2026-01-01. | https://capitol.texas.gov/tlodocs/89R/billtext/html/HB00149F.HTM |
| S-08 | Delaware General Assembly, HB 154/Chapter 197 (DPDPA), efectiva 2025-01-01. | https://legis.delaware.gov/BillDetail?LegislationId=140388 |
| S-09 | Maryland General Assembly, HB 567/Chapter 454 (MODPA), efectiva 2025-10-01. | https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/HB0567?ys=2024RS |
| S-10 | Kentucky Legislature, HB 15/Chapter 72, KCDPA, efectiva 2026-01-01. | https://apps.legislature.ky.gov/record/24rs/hb15.html |
| S-11 | Colorado General Assembly, SB25B-004, extiende Colorado AI Act a 2026-06-30. | https://leg.colorado.gov/bills/SB25B-004 |
| S-12 | Illinois General Assembly, BIPA 740 ILCS 14; texto codificado. | https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=3004&ChapterID=57 |
| S-13 | NYC DCWP, Local Law 144 AEDT, enforcement desde 2023-07-05. | https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page |
| S-14 | FTC, ANPRM Negative Option Rule, 2026; reconoce vacatur de la regla enmendada. | https://www.ftc.gov/system/files/ftc_gov/pdf/p064202negativeoptionruleanprm.pdf |

## Revisión por abogado local pendiente

Antes de lanzamiento debe confirmar: métricas reales para cada umbral; residencia y geofencing; si GTM/GA4 es sale/share/targeted advertising; definición de sensitive/biometric data en cada flujo; configuración y contratos de IA; leyes de autorrenovación de los estados donde se facture; survey de money-transmitter/marketplace facilitator y licencias de oficios; y plazos específicos de breach notice. Esta matriz no reemplaza una opinión legal estatal ni autoriza el lanzamiento de pagos, KYC biométrico o IA de decisiones consecuenciales.
