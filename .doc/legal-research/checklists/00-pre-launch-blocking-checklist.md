# Checklist maestro de bloqueadores pre-lanzamiento

**Última actualización:** 2026-07-23

Esta es la lista única de verificación antes de: (a) publicar cualquier documento de `legal-documents/` como versión final, o (b) salir del modo *stub/mock* de pagos. Cada ítem enlaza al documento con el detalle completo.

- [ ] Entidad legal operadora constituida/confirmada y consistente en todo el sitio (`01-scope-assumptions-and-open-questions.md` Q1)
- [ ] Contradicción "no intermediarios/sin comisiones" vs. escrow del 15% corregida en el texto público (`05-risk-matrix.md` RISK-01)
- [ ] Escenario de pago (A o B) y PSP/merchant of record definidos (`payments-tax/01-payment-architecture-scenarios-and-licensing.md`)
- [ ] Rol de tratamiento de datos (responsable/encargado) confirmado por actividad (`03-legal-entity-and-role-map.md`)
- [ ] Contrato/DPA con Google (Gemini) confirmado: tier, entrenamiento, región, subprocesadores (`ai/ai-data-and-model-governance.md`)
- [ ] Canal operativo de solicitudes de derechos de titulares implementado (`privacy/rights-request-protocol.md`)
- [ ] Barrera de edad / verificación proporcional para menores implementada (`accessibility-and-content/02-minors-and-age-verification-policy.md`)
- [ ] Responsable de triage de incidentes de seguridad asignado (`security/incident-response-legal-playbook.md`)
- [ ] Región de PostgreSQL/backups/Cloudinary confirmada (`privacy/international-transfers-inventory.md`)
- [ ] CMP con bloqueo previo de GTM/GA4 implementado antes de operar en España/UE (`cookies/cookie-and-tracker-audit.md`)
- [ ] KYC real de prestadores activado antes de habilitar categorías de servicio reguladas (`marketplace/01-platform-role-and-liability-analysis.md` §4)
- [ ] DPA/SCC firmados con subprocesadores confirmados (Stripe, MercadoPago, Cloudinary, Brevo, Firebase) (`vendors-and-transfers/vendor-inventory-and-dpa-checklist.md`)
- [ ] Recolección de datos fiscales (NIF/domicilio) de prestadores diseñada antes de operar pagos reales en la UE — DAC7 sin umbral de exención para servicios (`payments-tax/02-vat-digital-tax-and-invoicing.md`)
- [ ] Confirmación de EMP-Q1 (sin política interna de exclusividad/horario a prestadores) (`employment-and-platform-work/01-worker-classification-risk.md`)
- [ ] Revisión de abogado local en cada una de las 5 jurisdicciones sobre el paquete completo de `legal-documents/`

**Regla:** ningún documento de `legal-documents/` debe publicarse como versión final (retirar la marca "borrador") mientras queden casillas sin marcar arriba que ese documento específico dependa de.
