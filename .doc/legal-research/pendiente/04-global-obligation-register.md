# Registro global de obligaciones (Fase 15)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — consolida las obligaciones ya identificadas y citadas con fuente primaria en los documentos temáticos de este expediente. Este registro **no repite las citas completas** (URL/fecha/artículo) — esas viven en el documento de origen indicado en la columna "Detalle en". Aquí se listan la obligación, su estado de vigencia, el sistema/proceso afectado, el propietario sugerido y la acción.

**Leyenda de estado:** `MANDATORY NOW` (obligación vigente hoy) · `MANDATORY BY FUTURE DATE` (vigente pero con fecha de entrada en vigor futura) · `CONDITIONAL` (se activa solo si ocurre un hecho de negocio) · `RECOMMENDED` (buena práctica, no obligación legal directa) · `NOT APPLICABLE WITH RATIONALE` (no aplica hoy, con razón explícita)

## 1. Entidad legal y gobierno corporativo

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-01 | Constituir/confirmar la entidad legal operadora y su domicilio antes de publicar cualquier documento legal | `MANDATORY NOW` | Todas | Términos de Servicio, Política de Privacidad, facturación | Founders / Legal | `01-scope-assumptions-and-open-questions.md` Q1; `intellectual-property/01-ip-ownership-and-licensing.md` §C |
| OBL-02 | Corregir la inconsistencia entre el footer del sitio ("© 2026 HIREEO INC") y la ausencia de constitución documentada de esa entidad | `MANDATORY NOW` | Todas | `frontend` footer | Legal / Founders | `intellectual-property/01-ip-ownership-and-licensing.md` §B, IP-08 |
| OBL-03 | Ejecutar cesiones de propiedad intelectual de fundadores/contratistas hacia la entidad operadora | `MANDATORY NOW` (una vez resuelto OBL-01) | Todas | Código, marca, diseño, copy | Legal | `intellectual-property/01-ip-ownership-and-licensing.md` §D |

## 2. Privacidad y datos personales

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-04 | Registrar/declarar la base de datos ante la autoridad correspondiente donde exista ese requisito (URCDP en Uruguay) | `CONDITIONAL` — depende de confirmar entidad (OBL-01) | Uruguay | Base de usuarios | Legal | `country-analysis/uruguay.md` §Registro |
| OBL-05 | Publicar aviso de privacidad veraz que describa solo prácticas confirmadas | `MANDATORY NOW`, pero **no publicable hoy** por datos BLOCKING pendientes | Todas | Política de Privacidad | Legal / Product | `legal-documents/03-privacy-policy-global.md` §0 |
| OBL-06 | Habilitar un canal operativo para solicitudes de derechos (acceso/rectificación/eliminación/portabilidad/oposición) con el plazo más exigente aplicable (5 días hábiles, Uruguay/Argentina) | `MANDATORY NOW` en cuanto haya usuarios de esos países; **no implementado hoy** | Uruguay, Argentina, España/UE, California | Backend — no existe endpoint | Product / Engineering / Legal | `privacy/rights-request-protocol.md` |
| OBL-07 | No transferir datos a Chile sin garantías alternativas (SCC) — Chile no tiene decisión de adecuación de la UE | `MANDATORY NOW` si hay flujo UE↔Chile con datos reales | España/UE ↔ Chile | Infraestructura / proveedores | Engineering / Legal | `privacy/international-transfers-inventory.md` §1 |
| OBL-08 | Confirmar si el uso de Gemini (Google) es en tier pago o gratuito por país — determina si el input del usuario entrena los modelos de Google fuera de la UE/EEE/Suiza/Reino Unido | `MANDATORY NOW` — es un hecho de contrato pendiente de confirmar, no una decisión de diseño | Todas salvo UE/EEE/UK (que ya tienen protección contractual estándar de Google) | `ai-agents.service.ts`, `chatbot.service.ts` | Legal / Engineering | `intellectual-property/03-user-content-and-ai-generated-content.md` §"Uso de datos para entrenamiento"; `ai/ai-data-and-model-governance.md` §3 |
| OBL-09 | Notificar brechas de seguridad a la autoridad competente dentro de 72 horas (Uruguay/Argentina/España-UE) o 30 días calendario (California, desde 2026-01-01) | `MANDATORY NOW` — se activa automáticamente ante cualquier incidente, con o sin capacidad operativa confirmada | Uruguay, Argentina, España/UE, California | Sin proceso de detección confirmado | Security / Legal | `privacy/breach-notification-protocol.md`; `security/incident-response-legal-playbook.md` |
| OBL-10 | Designar y acreditar un Delegado de Protección de Datos ante la URCDP si Hireeo supera 35.000 usuarios en Uruguay o trata datos sensibles como actividad principal | `CONDITIONAL` — umbral no alcanzado hoy según la evidencia disponible | Uruguay | — | Legal | `privacy/dpo-and-governance.md` §1-2 |
| OBL-11 | Implementar barrera de edad / mecanismo de verificación proporcional para menores | `MANDATORY NOW` — riesgo transversal, sin control hoy | Todas, con énfasis en EE.UU. (COPPA <13) y España (LOPDGDD <14) | Registro de usuarios | Product / Legal | `accessibility-and-content/02-minors-and-age-verification-policy.md` |

## 3. Cookies y tracking

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-12 | Bloquear GTM/GA4 y cualquier script no esencial hasta obtener consentimiento previo | `MANDATORY NOW` — hoy cargan sin consentimiento según la Fase 5 (`cookies/cookie-and-tracker-audit.md`) | España/UE (ePrivacy/LSSI/AEPD); efecto reputacional en el resto | Frontend — gestor de tags | Engineering / Legal | `cookies/cookie-and-tracker-audit.md`; `legal-documents/05-cookie-policy-and-consent-spec.md` |
| OBL-13 | Reconocer Global Privacy Control (GPC) como señal de opt-out vinculante | `MANDATORY BY FUTURE DATE` en algunos estados de EE.UU. (Texas desde 2025-01-01, ya vigente; Connecticut desde 2026-07-01) y `RECOMMENDED` en el resto | California, Texas, Connecticut, Colorado, Oregon | Frontend | Engineering | `privacy/gap-assessment-and-retention-rules.md` §1 |

## 4. IA

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-14 | Alfabetización en IA del personal que opera/mantiene el asistente de IA | `MANDATORY NOW` (vigente desde 2025-02-01, AI Act art. 4) | España/UE | Equipo de Ingeniería/Producto | Legal / People | `country-analysis/spain-eu.md` L.158 |
| OBL-15 | Aviso de transparencia cuando el usuario interactúa con un sistema de IA (chatbot/asistente) | `MANDATORY BY FUTURE DATE` (AI Act art. 50, desde 2026-08-02) | España/UE; `RECOMMENDED` en el resto | Frontend — chat/asistente | Product / Legal | `country-analysis/spain-eu.md` §5.3; `legal-documents/06-ai-responsible-policy.md` |
| OBL-16 | No afirmar que existe supervisión humana significativa de las decisiones de IA si el control técnico no está implementado | `MANDATORY NOW` (deber de no engañar, no una obligación positiva de construir el control — pero construirlo es la única forma de sostener la afirmación) | Todas | `ai-agents.service.ts` | Product / Legal | `ai/ai-classification-and-risk-assessment.md` §2.1 (AIR-06); `legal-documents/06-ai-responsible-policy.md` |

## 5. Consumo y comercio electrónico

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-17 | Mostrar identidad del proveedor, precio total y condiciones antes de contratar | `MANDATORY NOW` — no se puede satisfacer sin OBL-01 | Todas | Frontend — checkout/ficha de servicio | Product / Legal | `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §1 |
| OBL-18 | Habilitar desistimiento/retracto: 5 días hábiles (Uruguay), 10 días (Argentina/Chile), 14 días (España/UE) | `MANDATORY NOW` | Uruguay, Argentina, Chile, España/UE | Flujo de contratación | Product / Legal | `country-analysis/comparative-matrix.md` fila "Comercio electrónico y desistimiento B2C" |
| OBL-19 | No exigir plazo de preaviso al usuario para cancelar una renovación automática | `MANDATORY NOW` desde 2024-01-01 | Uruguay | Suscripciones — no implementadas hoy | Product / Legal | `consumer-and-commercial/02-subscriptions-and-auto-renewal.md` §1 |
| OBL-20 | No usar cláusula única de arbitraje obligatorio + renuncia a acción de clase para las 5 jurisdicciones — es inválida fuera de EE.UU. | `MANDATORY NOW` | Uruguay, Argentina, Chile, España/UE (inválida); EE.UU. (válida) | Términos de Servicio | Legal | `consumer-and-commercial/03-dispute-resolution-and-arbitration.md` §2 |

## 6. Pagos e impuestos

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-21 | No retener fondos de terceros ni operar escrow real sin resolver el modelo de PSP/MoR y las licencias asociadas | `CONDITIONAL` — hoy en stub/mock, la obligación se activa al salir de stub | Todas | `escrow.service.ts` | Finance / Legal / Engineering | `payments-tax/01-payment-architecture-scenarios-and-licensing.md` |
| OBL-22 | Reportar a la autoridad tributaria los datos de prestadores bajo DAC7 sin umbral de exención (a diferencia de la venta de bienes) | `MANDATORY BY FUTURE DATE` — se activa cuando haya intermediación de pagos real en España/UE | España/UE | Backend — recolección de NIF/domicilio fiscal de cada prestador | Finance / Legal | `payments-tax/02-vat-digital-tax-and-invoicing.md` §2 |
| OBL-23 | Registrarse como sujeto obligado AML ante BCRA/UIF si Hireeo retiene fondos en Argentina | `CONDITIONAL` | Argentina | Escrow — no implementado | Finance / Legal | `payments-tax/03-aml-kyc-thresholds.md` §2 |

## 7. Trust & Safety y contenido

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-24 | Mecanismo de notificación de contenido ilícito + motivación de decisiones de retirada | `MANDATORY NOW` (DSA arts. 16-17, UE); `RECOMMENDED`/deber general de colaboración en el resto | España/UE | No existe canal formal hoy | Trust & Safety / Product | `marketplace/01-platform-role-and-liability-analysis.md` §5; `marketplace/02-trust-and-safety-program.md` §2 |
| OBL-25 | Reportar CSAM detectado a NCMEC tan pronto como sea razonablemente posible | `MANDATORY NOW` (si opera en EE.UU. con mensajería) | Estados Unidos | `Conversation` (mensajería) | Trust & Safety / Legal | `marketplace/03-minors-content-and-mandatory-reporting.md` §1 |
| OBL-26 | Verificar credenciales/matrícula de prestadores en oficios regulados (electricidad, gas, construcción, transporte) antes de habilitar publicación | `MANDATORY NOW` como deber de diligencia; `MANDATORY NOW` bajo DSA art. 30/31 en la UE | Todas | No implementado — solo KYC de identidad en stub | Trust & Safety / Engineering | `marketplace/01-platform-role-and-liability-analysis.md` §4 |

## 8. Clasificación laboral

| ID | Obligación | Estado | Jurisdicción | Sistema/proceso afectado | Propietario | Detalle en |
|---|---|---|---|---|---|---|
| OBL-27 | No imponer exclusividad, horario fijo ni control de "cómo" se presta el servicio a los prestadores | `RECOMMENDED` como control de diseño para mantener la calificación de contratista independiente — se convierte en obligación de facto si se quiere evitar reclasificación | Todas, con énfasis en España (jurisprudencia Glovo) y EE.UU. (AB5/Prop 22, estado incierto) | Producto — política de relación con prestadores | Product / Legal | `employment-and-platform-work/01-worker-classification-risk.md`; `02-provider-relationship-controls.md` |
| OBL-28 | Transponer o monitorear la Directiva (UE) 2024/2831 de trabajo en plataformas (plazo de transposición: 2026-12-02, ningún Estado miembro la ha transpuesto aún) | `MANDATORY BY FUTURE DATE` | España/UE | — | Legal | `employment-and-platform-work/01-worker-classification-risk.md` |

## 9. Notas de cierre

Este registro es representativo, no exhaustivo carácter por carácter — cada fila apunta al documento que contiene la cita primaria completa (URL, fecha de publicación, artículo). Para el detalle de fuentes, ver `08-source-register.md`. Para la priorización temporal, ver `06-remediation-roadmap.md`.
