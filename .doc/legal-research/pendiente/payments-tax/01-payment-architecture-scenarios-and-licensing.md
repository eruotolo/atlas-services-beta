# Arquitectura de pagos: escenarios, licencias y AML (Fase 8)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — extiende `marketplace/01-platform-role-and-liability-analysis.md` §7 (que ya define los Escenarios A/B) con el detalle de licencias y AML por país. No repite ese análisis conceptual.

## 0. Punto de partida (hecho confirmado desde el repo)

Hoy los pagos y el escrow están en **stub/mock** (`escrow.service.ts:8,57-60`) — no hay flujo de fondos real ni comisión efectivamente cobrada. El KYC de prestadores vía Stripe Identity también está en stub (`kyc.service.ts:22-47`). Todo lo que sigue es **condicionado**: aplica solo si/cuando Hireeo sale de mock, y depende de qué escenario elija.

## 1. Recordatorio de los dos escenarios (definidos en `marketplace/01` §7)

- **Escenario A — "solo conecta":** pago directo cliente↔prestador, fuera de la plataforma. Hireeo no es merchant of record (MoR).
- **Escenario B — "Hireeo cobra/retiene vía escrow real":** comisión 15%, split payment. Hireeo se desplaza hacia proveedor/MoR.

## 2. Licencias financieras — detalle por país (condicionado al Escenario B)

| País | Regulador | ¿Qué activa la necesidad de licencia? | Tipo de licencia relevante | Mitigación habitual |
|---|---|---|---|---|
| Uruguay | BCU (Banco Central del Uruguay) / SENACLAFT | Recepción, custodia o transferencia de fondos de terceros por cuenta propia | Institución de Intermediación Financiera o Institución Emisora de Dinero Electrónico, según el flujo — **no confirmado cuál aplicaría a Hireeo sin dictamen** | Usar un PSP ya licenciado (ej. dLocal, MercadoPago) como agregador/MoR, evitando que Hireeo retenga fondos en cuenta propia |
| Argentina | BCRA (Banco Central de la República Argentina) / UIF | Prestar servicios de pago, wallet o custodia de fondos | Proveedor de Servicios de Pago (PSP) registrado ante BCRA (Com. "A" sobre PSP); riesgo agravado de responsabilidad solidaria bajo art. 40 LDC si Hireeo se convierte en parte de la cadena de comercialización (ya señalado en `marketplace/01` §7) | Igual — usar PSP licenciado como MoR |
| Chile | CMF (Comisión para el Mercado Financiero) / UAF | Emisión de medios de pago o intermediación de fondos | Emisor u Operador de Tarjetas de Pago, o Prestador de Servicios de Pago según la Ley Fintech (Ley 21.521); Mercado Pago ya está registrado, pero **eso no cubre automáticamente un flujo propio de Hireeo** (ya señalado en `country-analysis/chile.md`) | Igual |
| España / UE | Banco de España / Autoridad Bancaria Europea (marco PSD2) | Prestación de servicios de pago a terceros | Entidad de Pago o Entidad de Dinero Electrónico autorizada bajo PSD2, o actuar como agente de una entidad ya autorizada | Usar un PSP con pasaporte europeo (ej. Stripe, Adyen) como agregador |
| Estados Unidos | Reguladores estatales de "money transmission" (varían por estado) + FinCEN (nivel federal, BSA) | Aceptar o transmitir valor de terceros | Money Transmitter License por estado (hasta 50 licencias individuales si se opera como transmisor directo); registro como Money Services Business (MSB) ante FinCEN | Usar un PSP/agregador ya licenciado (Stripe, PayPal) para evitar licenciamiento estado por estado |

**Inferencia técnica transversal:** en las cinco jurisdicciones, la mitigación más citada en la investigación previa y aquí es la misma — **usar un PSP ya licenciado como agregador o merchant of record**, evitando que Hireeo retenga fondos de terceros en una cuenta propia. Esto reduce pero no elimina el riesgo (debe confirmarse contractualmente con cada PSP quién asume el rol de MoR).

## 3. AML/KYC — cuándo se activa (ver también `payments-tax/02-vat-digital-tax-and-invoicing.md` y `03-aml-kyc-fraud-and-chargebacks.md` para los umbrales investigados)

- **Hecho confirmado:** ninguna de las cinco jurisdicciones activa automáticamente una obligación AML por el solo hecho de operar un marketplace de descubrimiento (Escenario A). La obligación se activa cuando la entidad **maneja fondos de terceros** — coincide con el umbral de necesitar licencia financiera de §2.
- **Pendiente de investigación puntual** (delegado a `03-aml-kyc-fraud-and-chargebacks.md`): el umbral exacto de registro como "sujeto obligado" AML en Uruguay (BCU/SENACLAFT), Argentina (BCRA/UIF) y Chile (CMF/UAF).

## 4. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| PAY-Q1 | ¿Qué PSP se usará en cada país y quién asume contractualmente el rol de merchant of record? | `BLOCKING` — condiciona todo este documento |
| PAY-Q2 | ¿Hireeo retendrá fondos en cuenta propia en algún momento del flujo (aunque sea transitoriamente) o el split payment lo hace el PSP directamente? | `BLOCKING` |

## 5. Revisión por abogado local pendiente

Este documento no reemplaza un dictamen local de cada país sobre si el flujo específico de Hireeo (una vez definido) requiere licencia. Es un mapa de qué preguntar, no una conclusión de que Hireeo necesita o no una licencia.
