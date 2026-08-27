---
title: Matriz de decisiones — Fase 0 remediación legal
date: 2026-08-27
tags:
  - hireeo
  - legal
  - pendiente
  - decision
status: pendiente-de-respuesta
---

# Matriz de decisiones — Fase 0 (Legal/Founders)

Documento de trabajo para que Edgardo lo envíe a Legal/Founders. Consolida las preguntas
bloqueantes ya identificadas en el [[legal-research/README|expediente de due diligence]] y
las agrupa por la fase del [[plan-remediacion-legal-frontend|plan de remediación legal del
frontend]] que destraban. No sustituye la revisión de abogados locales. Cada fila enlaza al
documento de investigación con el detalle completo — no se repite el análisis aquí.

## Cómo usar esta matriz

Cada fila necesita una respuesta de Legal/Founders en la columna **Decisión**. Mientras una
fila BLOCKING no tenga decisión, la fase que depende de ella permanece `blocked` en el DAG
de orquestación (`run_50ec0d2ef755` en Orca) y no se dispatchea ningún worker de código
sobre ella.

## Bloque A — Preguntas transversales (Q1-Q5, BLOCKING)

Fuente: `.doc/legal-research/pendiente/01-scope-assumptions-and-open-questions.md` líneas 111-115.

| # | Pregunta | Por qué bloquea | Decisión (Legal/Founders) |
|---|---|---|---|
| Q1 | ¿Razón social, país de constitución, domicilio y representante legal del operador de Hireeo? | Sin esto no se puede redactar Términos ni Política de Privacidad, ni identificar al responsable/controlador. Bloquea Fase 1 (textos de consentimiento finales) y Fase 7 (retirar borrador). | **Respondido 2026-08-27 (Edgardo):** Crow Advance EIRL, RUT 78.456.748-6, empresa constituida en Chile. Ambas oficinas van en **todos** los países (son las oficinas reales de la empresa, no direcciones específicas por país): Centenario 493, Ciudad de Chonchí, Isla Grande de Chiloé, Región Los Lagos, Chile — y 113 Winding Way, Telford, PA, Estados Unidos. Falta aún: representante legal, antes de retirar el borrador de Términos/Privacidad. |
| Q2 | Cuando pagos salga de *stub*: ¿quién es merchant of record, quién liquida al prestador, quién retiene la comisión del 15%? | Determina licencias de dinero, PCI, DAC7/IVA y responsabilidad de consumo. Bloquea Fase 6 completa. | **Respondido parcialmente 2026-08-27 (Edgardo):** Todavía sin definir MoR/liquidación — hoy los 5 países arrancan gratis (sin pagos reales). Mecanismo previsto: al cargar credenciales de pasarela en `/config/integrations`, el sistema de pagos de ese país se activa y **la parte legal de pagos de ese país debe condicionarse automáticamente a esa activación** (no mostrar/exigir textos de comisión, DAC7, PCI, etc. mientras la integración de pago del país esté inactiva). Sigue BLOCKING para Fase 6 completa hasta que se resuelva MoR real, pero ya da una regla de diseño concreta: la UI/textos de pagos deben leer el estado de la integración de pasarela por país, no un flag estático. |
| Q3 | ¿Hireeo es responsable/controlador, encargado o corresponsable en cada tratamiento (cuenta, mensajería, pagos, IA)? | Define bases jurídicas, DPA, ROPA y avisos. Bloquea el contrato backend de Fase 3 (centro de privacidad). | |
| Q4 | ¿El contrato con Google (Gemini) prohíbe entrenar con inputs/outputs y define ubicación de datos/subprocesadores? | Afecta GDPR, transferencias internacionales y EU AI Act. Bloquea el texto final de Fase 5 (avisos de IA). | |
| Q5 | ¿Dónde se alojan PostgreSQL, backups y Cloudinary (región)? ¿Hay transferencias fuera de UE/LatAm? | Bloquea el análisis de transferencias internacionales (SCC/TIA), insumo de Fase 1 y Fase 3. | |

## Bloque B — Edad mínima (bloquea Fase 2)

Fuente: `.doc/legal-research/pendiente/accessibility-and-content/02-minors-and-age-verification-policy.md`.

La investigación ya tiene una **recomendación concreta**, no parte de cero:

- **Recomendación técnica/legal:** edad mínima **18 años uniforme** para todos los países y
  roles (cliente y prestador), con age-gate declarativo (casilla "Confirmo que tengo 18 años
  o más", no premarcada) en el registro — no verificación documental general.
- Razón: supera los umbrales de consentimiento digital de las 5 jurisdicciones (COPPA <13,
  LOPDGDD España 14, GDPR base 16) y evita gestionar consentimiento parental en 5 países;
  los servicios se ejecutan en el domicilio del usuario (riesgo de seguridad presencial).

| Decisión requerida | Opciones | Decisión (negocio) |
|---|---|---|
| ¿Edad mínima 18 uniforme para todos los países y roles, o variar por país/rol? | (a) 18 uniforme [recomendado] · (b) 18 prestadores / mayoría local clientes · (c) otra | |
| ¿Se admite algún caso de menor (16-17) como cliente? | Sí / No [recomendado: No] | |

## Bloque C — Contratos backend (bloquean Fase 3, Fase 4, Fase 6)

Estos NO son decisiones de Legal — son contratos TypeScript que Backend debe definir antes
de que Frontend construya UI (regla "Contract-First"). Legal/Founders solo deben confirmar
el alcance funcional; Backend define la forma exacta.

| Contrato | Para qué fase | Alcance funcional a confirmar | Referencia de investigación |
|---|---|---|---|
| Consentimiento (CMP) | Fase 1 | Categorías de consentimiento (analítica, marketing, funcional), si se persiste server-side o solo cookie técnica | `.doc/legal-research/pendiente/cookies/consent-design-spec.md` |
| Solicitudes de derechos de titulares | Fase 3 | Acceso, rectificación, supresión, portabilidad, oposición, retiro de consentimiento — estado, plazos, método de verificación de identidad | `.doc/legal-research/pendiente/privacy/rights-request-protocol.md` |
| Caso de moderación (denuncia/decisión/apelación) | Fase 4 | Estados, responsable, motivo, evidencia, notificación, plazo de apelación; controles para contenido ilegal/urgente | `.doc/legal-research/pendiente/marketplace/` (Trust & Safety) |
| Credenciales profesionales (licencias/matrícula) | Fase 6 | Qué categorías son reguladas por país, qué credencial se exige, cómo se verifica | `.doc/legal-research/pendiente/marketplace/01-platform-role-and-liability-analysis.md` §4 |
| Perfil fiscal DAC7 (España/UE) | Fase 6 | Campos (NIF, domicilio, residencia fiscal), condicionado al escenario de pago (Q2) | `.doc/legal-research/pendiente/payments-tax/02-vat-digital-tax-and-invoicing.md` |

## Bloque D — Confirmación operativa (no bloquea código, pero condiciona Fase 7)

| Ítem | Decisión (Legal/Founders) |
|---|---|
| Responsable de triage de incidentes de seguridad asignado | |
| DPA/SCC firmados con subprocesadores (Stripe, MercadoPago, Cloudinary, Brevo, Firebase) | |
| Revisión de abogado local en las 5 jurisdicciones sobre el paquete completo de `legal-documents/` | |

## Checklist maestro relacionado

Ver `.doc/legal-research/pendiente/checklists/00-pre-launch-blocking-checklist.md` para la
lista completa de bloqueadores de publicación (no se duplica aquí).

## Siguiente paso

1. Edgardo envía esta matriz a Legal/Founders.
2. Cuando vuelvan las respuestas del Bloque A y B, se actualiza este documento y se desbloquean
   en Orca las tasks `task_ba5d2370aaaa` (Fase 2), `task_65588c014cfb` (Fase 4) y, tras backend,
   `task_6d512f7eabe4` (Fase 3).
3. El Bloque C requiere que Backend defina los contratos TypeScript antes de dispatchear
   cualquier worker de Frontend sobre esas fases.
4. Fase 6 (`task_c7a03880ef92`) permanece `blocked` hasta Q2 (modelo de pagos) y la matriz de
   categorías reguladas.
