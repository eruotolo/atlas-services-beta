# Trazabilidad de implementación (Fase 15)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador. Traza obligación → evidencia → propietario → prioridad → fecha objetivo → estado, para las obligaciones de `04-global-obligation-register.md` que tienen una acción concreta pendiente. No repite obligaciones que ya están `NOT APPLICABLE WITH RATIONALE`.

| Obligación (ID) | Evidencia de partida | Propietario | Prioridad | Fecha objetivo | Estado |
|---|---|---|---|---|---|
| OBL-01 (entidad legal) | `EV-04`, `EV-11` | Founders / Legal | BLOCKING | 0-14 días | PENDIENTE |
| OBL-02 (corregir contradicción footer/comisión) | `EV-04`, `EV-01` | Legal / Product | BLOCKING | 0-14 días | PENDIENTE |
| OBL-03 (cesión de IP) | `intellectual-property/01` §D | Legal | HIGH | 46-90 días | PENDIENTE — depende de OBL-01 |
| OBL-05 (publicar Política de Privacidad) | `legal-documents/03` §0 | Legal | BLOCKING | Pre-lanzamiento | BORRADOR LISTO, NO PUBLICABLE |
| OBL-06 (canal de derechos) | `EV-02` (patrón de stub similar), `RIGHTS-Q1/Q2` | Product / Engineering / Legal | BLOCKING | 15-45 días | PENDIENTE |
| OBL-07 (SCC para transferencias a Chile) | `privacy/international-transfers-inventory.md` §1 | Legal / Engineering | HIGH | Pre-lanzamiento en Chile con flujo UE | PENDIENTE |
| OBL-08 (confirmar tier Gemini) | `EV-03` | Legal / Engineering | BLOCKING | 15-45 días | PENDIENTE |
| OBL-09 (notificación de brechas en plazo) | `EV-01` (patrón: sin proceso de detección) | Security / Legal | HIGH | 15-45 días (asignar rol); continuo (operar) | PENDIENTE |
| OBL-10 (DPO Uruguay) | `privacy/dpo-and-governance.md` §1 | Legal | CONDITIONAL | Al superar 35.000 usuarios en UY | NO APLICA HOY |
| OBL-11 (barrera de edad) | `accessibility-and-content/02` | Product / Legal | BLOCKING | 15-45 días | PENDIENTE |
| OBL-12 (bloquear GTM/GA4 sin consentimiento) | `cookies/cookie-and-tracker-audit.md` | Engineering / Legal | HIGH | 15-45 días | PENDIENTE |
| OBL-14 (alfabetización IA) | `country-analysis/spain-eu.md` L.158 | Legal / People | MANDATORY NOW (UE) | 46-90 días | PENDIENTE |
| OBL-15 (aviso de transparencia IA) | `legal-documents/06` | Product / Legal | MANDATORY BY 2026-08-02 (UE) | Pre-lanzamiento en UE | BORRADOR LISTO |
| OBL-16 (no prometer supervisión humana no implementada) | `EV-03`, AIR-06 | Product / Legal | BLOCKING | 0-14 días (corrección de lenguaje); continuo (implementar control real) | PENDIENTE |
| OBL-17 (información precontractual) | `EV-10` | Product / Legal | BLOCKING | Pre-lanzamiento | DEPENDE DE OBL-01 |
| OBL-20 (cláusula de disputas diferenciada) | `legal-documents/01` §7 | Legal | HIGH | Pre-lanzamiento | BORRADOR LISTO |
| OBL-21 (no operar escrow sin resolver PSP/MoR) | `EV-01` | Finance / Legal / Engineering | BLOCKING | Pre-lanzamiento (antes de cobrar) | PENDIENTE |
| OBL-22 (recolección de datos fiscales DAC7) | `payments-tax/02` §2 | Finance / Engineering | HIGH | Pre-lanzamiento en UE con pagos reales | PENDIENTE |
| OBL-24 (notice-and-action) | `marketplace/01` §5 (brecha) | Trust & Safety / Product | HIGH (UE), RECOMMENDED (resto) | 46-90 días | PENDIENTE |
| OBL-26 (verificación de licencias en oficios regulados) | `marketplace/01` §4 | Trust & Safety / Engineering | HIGH | 46-90 días | PENDIENTE |
| OBL-27 (controles de relación con prestadores) | `EV-05` (favorable) + `EMP-Q1` (pendiente) | Product / Legal | HIGH | 0-14 días (confirmar EMP-Q1) | EN VERIFICACIÓN |
| OBL-28 (monitorear Directiva 2024/2831) | `employment-and-platform-work/01` | Legal | MANDATORY BY 2026-12-02 | Continuidad trimestral | MONITOREO ACTIVO |

## Cómo usar esta tabla

Esta tabla es la vista "de ejecución" del expediente — a diferencia de `04-global-obligation-register.md` (qué obligación existe) y `05-risk-matrix.md` (qué puede salir mal), esta tabla responde "¿quién tiene que hacer qué, para cuándo, y en qué estado está hoy?". Debe actualizarse cada vez que se cierre una acción de `06-remediation-roadmap.md`.
