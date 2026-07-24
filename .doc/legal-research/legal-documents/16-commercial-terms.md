# 16 — Términos comerciales: pagos, reembolsos, cancelaciones, suscripciones, comisiones e impuestos

**Audiencia:** clientes y prestadores (documento de cara al usuario — versión final pendiente de aprobación legal).
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador **condicionado**.
**Estado:** 🟡 borrador — **no publicable hoy**. Los pagos y el escrow están en stub/mock (`marketplace/01-platform-role-and-liability-analysis.md`, hecho H2: `escrow.service.ts:8,57-60`). Este documento no puede completarse hasta que se resuelva el modelo de PSP/merchant of record.

## 0. Condición bloqueante (hecho confirmado)

Este documento depende enteramente de dos preguntas aún sin respuesta, ya identificadas en `payments-tax/01-payment-architecture-scenarios-and-licensing.md` §4:

- **PAY-Q1 (BLOCKING):** ¿qué PSP se usará en cada país y quién asume el rol de merchant of record?
- **PAY-Q2 (BLOCKING):** ¿Hireeo retendrá fondos en cuenta propia (Escenario B) o el split payment lo hace el PSP directamente (Escenario A)?

Hasta que estas preguntas se resuelvan, las secciones siguientes son un **esqueleto condicionado**, no cláusulas listas para publicar.

## 1. Comisión

`[[DECISION REQUIRED: confirmar el porcentaje real de comisión — el repo simula 15%, pero eso es un valor de prueba, no una decisión de negocio confirmada]]`. Si se confirma, debe mostrarse de forma clara y visible antes de que el cliente confirme la contratación (deber de información precontractual ya citado en `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §1).

## 2. Reembolsos y cancelaciones

Depende de la política de no-show/garantía ya señalada como decisión de producto pendiente en `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §2 — `[[DECISION REQUIRED: política propia de no-show/reprogramación]]`. Los plazos de desistimiento/retracto por país (Uruguay 5 días hábiles, Argentina/Chile 10 días, España/UE 14 días) ya están confirmados en `country-analysis/comparative-matrix.md` y no se reinvestigan aquí.

## 3. Suscripciones (si se activan — hoy no existen)

Ver `consumer-and-commercial/02-subscriptions-and-auto-renewal.md` para el marco completo por país. Resumen aplicable si Hireeo lanza suscripciones:

- Cancelación por el mismo canal usado para suscribirse.
- Mostrar precio, periodicidad y condiciones de cancelación antes de solicitar datos de pago.
- Uruguay: no imponer plazo de preaviso al usuario para cancelar (Ley 20.212, verificado).
- `[[DECISION REQUIRED: SUB-Q1 — ¿Hireeo planea lanzar suscripciones? ¿En qué plazo?]]`

## 4. Impuestos y facturación

Ver `payments-tax/02-vat-digital-tax-and-invoicing.md` (verificado: IVA 22% Uruguay, 21% Argentina, 19% Chile, 21% España). **Corrección crítica ya incorporada:** bajo DAC7 (UE), no hay umbral de exención para prestadores de servicios personales — cualquier prestador activo en la UE debe incluirse en el reporte anual si Hireeo opera con pagos reales allí. Esto implica que el proceso de alta de un prestador en España/UE debe capturar NIF/domicilio fiscal desde el primer registro, no solo para "grandes" prestadores.

## 5. Chargebacks y disputas de pago

Ver `payments-tax/04-fraud-prevention-and-dispute-playbook.md` §1 — depende enteramente de los términos del PSP elegido (ventana de chargeback, reserva de fondos, responsable de la disputa). `[[DECISION REQUIRED: repite PAY-Q1]]`.

## 6. Cláusula de resolución de disputas

**No puede ser una cláusula única para las cinco jurisdicciones.** Ya confirmado en `consumer-and-commercial/03-dispute-resolution-and-arbitration.md`: el arbitraje obligatorio con renuncia a acción de clase es ejecutable en EE.UU. (FAA + *AT&T Mobility v. Concepcion*) pero presuntamente abusivo e inválido en Uruguay, Argentina, Chile y España/UE. Este documento debe tener una cláusula diferenciada para usuarios de EE.UU. y otra para el resto, que dirija a la vía de consumo local.

## 7. Registro de dependencias técnicas y de negocio

| Dependencia | Documento fuente |
|---|---|
| Modelo de PSP/MoR | `payments-tax/01-payment-architecture-scenarios-and-licensing.md` |
| Umbrales fiscales/DAC7 | `payments-tax/02-vat-digital-tax-and-invoicing.md` |
| AML/KYC | `payments-tax/03-aml-kyc-thresholds.md` |
| Política de no-show | `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` |
| Resolución de disputas | `consumer-and-commercial/03-dispute-resolution-and-arbitration.md` |

## 8. Revisión por abogado local pendiente

Este documento **no debe publicarse** en su estado actual — es un esqueleto que depende de decisiones de negocio no tomadas (PAY-Q1, PAY-Q2, SUB-Q1) y de verificación fiscal por contador local en cada país. Publicarlo hoy expondría a Hireeo a afirmar condiciones comerciales que no puede cumplir operativamente.
