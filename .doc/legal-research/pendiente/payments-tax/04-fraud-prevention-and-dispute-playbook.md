# Prevención de fraude y playbook de disputas de pago (Fase 8)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — este documento es mayormente de **diseño operativo** (buena práctica), no de obligación legal directa; se apoya en los hechos ya confirmados de `marketplace/01-platform-role-and-liability-analysis.md` (H2, H5) y en `payments-tax/01-payment-architecture-scenarios-and-licensing.md`.

## 0. Alcance

Los mecanismos de chargeback, reserva y conciliación **dependen enteramente del PSP** que se contrate (Stripe, MercadoPago, dLocal, etc.) — no son configurables por Hireeo de forma independiente. Este documento no inventa reglas de chargeback propias; describe qué debe **confirmarse contractualmente** con el PSP y qué controles antifraude son buena práctica independientemente del PSP elegido.

## 1. Chargebacks, reservas y conciliación — preguntas al PSP (no respondidas aún)

| Elemento | Qué confirmar con el PSP elegido | Prioridad |
|---|---|---|
| Ventana de chargeback | Plazo durante el cual un cliente puede disputar un cargo (típicamente 120-540 días según red de tarjeta) | `HIGH` — condiciona cuánto tiempo Hireeo debe conservar evidencia de la transacción |
| Reserva de fondos | ¿El PSP retiene un porcentaje de la comisión de Hireeo como reserva ante disputas? | `MEDIUM` |
| Responsable de la disputa | ¿Quién responde ante un chargeback — Hireeo (si es MoR) o el prestador directamente? | `BLOCKING` — depende de PAY-Q1/PAY-Q2 |
| Evidencia exigida | Qué evidencia acepta el PSP para defender un chargeback (comprobante de servicio prestado, confirmación del cliente, mensajería) | `MEDIUM` |

## 2. Prevención de fraude — controles recomendados (buena práctica, no obligación legal específica)

Estos controles no derivan de una norma citada, sino de práctica estándar de la industria de marketplaces; se documentan aquí porque su ausencia puede agravar la exposición bajo los regímenes de consumo y protección de datos ya confirmados en otras fases:

- **Cuentas sintéticas / suplantación de prestadores:** verificación de identidad antes de habilitar el cobro (hoy en stub vía Stripe Identity, `kyc.service.ts:22-47` — no operativo). Sin esto, un prestador falso podría cobrar y desaparecer.
- **Reseñas falsas:** ya identificado como riesgo en `country-analysis/united-states-federal.md` (FTC Rule on Consumer Reviews, 16 CFR Part 465) y en la matriz comparativa (transparencia de ranking). Requiere moderación activa, no solo el flag `Rating.status` existente.
- **Triangulación / phishing dirigido a usuarios:** monitorear patrones de contacto fuera de plataforma seguidos de solicitudes de pago directo — mitigación de producto, no legal.
- **Disputas entre cliente y prestador por servicio no conforme:** requiere el flujo de no-show/garantía ya señalado en `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §2 — sin eso, cualquier disputa de pago carecerá de evidencia clara de qué se contrató y qué se ejecutó.

## 3. Playbook mínimo de respuesta a fraude (propuesta, no implementada)

1. Canal de reporte de fraude visible para clientes y prestadores (no confirmado que exista hoy).
2. Registro interno de incidentes de fraude con fecha, monto, partes involucradas y resolución — para poder demostrar diligencia ante un chargeback o reclamo de consumo.
3. Umbral de escalamiento a Legal/Dirección si el patrón de fraude supera cierto volumen (a definir junto con Trust & Safety, Fase 10).

## 4. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| FRAUD-Q1 | ¿Existe hoy algún canal de reporte de fraude o disputa, aunque sea informal (soporte por email)? | `MEDIUM` |
| FRAUD-Q2 | ¿Qué PSP se contratará y cuáles son sus términos de chargeback/reserva? (repite PAY-Q1, es la misma decisión pendiente) | `BLOCKING` |

## 5. Revisión por abogado local pendiente

Este documento es principalmente operativo. La única pieza con contenido legal directo (FTC Rule on Consumer Reviews) ya está citada y verificada en `country-analysis/united-states-federal.md`; no se repite la verificación aquí.
