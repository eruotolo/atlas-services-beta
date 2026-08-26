# Aviso de Privacidad de Estados Unidos (California y otros estados)

**Documento:** `legal-documents/04-us-privacy-notices.md`
**Audiencia:** residentes de Estados Unidos, en particular California y los demás estados con leyes de privacidad integrales.
**Jurisdicción/cobertura:** Estados Unidos — federal y estatal.
**Versión:** v0.1-borrador
**Fecha de vigencia propuesta:** pendiente — ver §1, este documento explica por qué probablemente **no aplica aún** de forma sustantiva.
**Dependencias técnicas:** monitoreo de volumen de usuarios/ingresos en EE.UU., ninguna hoy confirmada.

> ⚠️ **BORRADOR DE TRABAJO.** Este documento es deliberadamente breve: la investigación ya confirmada en `privacy/gap-assessment-and-retention-rules.md` §1 concluye que Hireeo **no alcanza hoy los umbrales** de ninguna ley estatal de privacidad integral de EE.UU. Redactar un aviso CCPA extenso y detallado ahora sería desproporcionado y podría crear obligaciones de transparencia sobre prácticas que aún no están definidas.

---

## 1. Por qué esto no aplica hoy (y cuándo se reevalúa)

| Ley estatal | Umbral que activaría la obligación | ¿Hireeo lo alcanza hoy? |
|---|---|---|
| California (CCPA/CPRA) | US$ 26,625M de ingresos, o 100.000+ consumidores, o 50%+ ingresos por venta/compartición de datos | **No** — sin evidencia de operación en California con ese volumen |
| Colorado, Connecticut, Virginia, Utah, Oregon | Umbrales de 25.000-100.000+ consumidores según el estado | **No** |
| Texas | Sin umbral de ingresos ni volumen — única exención es tener menos de 500 empleados | **Probablemente no aplica** por la exención de pequeña empresa, pero [[DECISION REQUIRED: confirmar conteo real de empleados de Hireeo]] |

Fuente completa: `privacy/gap-assessment-and-retention-rules.md` §1.

**Qué monitorear para reevaluar este documento (no es una obligación hoy, es un disparador de revisión):**
- Volumen de usuarios activos por estado, una vez que `/us` esté operativo en producción.
- Número de empleados de Hireeo (relevante para la exención de Texas).
- Si Hireeo llega a vender o compartir datos con fines publicitarios — varias leyes bajan el umbral a cero en ese caso (ej. Colorado y Connecticut desde sus enmiendas de 2025-2026).

## 2. Aviso base (mínimo, no específico de CCPA, mientras no se activen los umbrales)

**Cláusula propuesta — transparencia general sin comprometerse a derechos estatutarios que no aplican aún:**
> "Si eres residente de Estados Unidos, recopilamos y usamos tu información según se describe en nuestra Política de Privacidad global. Actualmente evaluamos si nuestras operaciones alcanzan los umbrales de las leyes estatales de privacidad (como la CCPA de California). Si esto cambia, actualizaremos este aviso con los derechos específicos que correspondan (acceso, eliminación, portabilidad, opt-out de venta/compartición de datos)."

## 3. Qué NO incluir en este borrador (para no sobre-prometer)

- No incluir un mecanismo de "Do Not Sell or Share my Personal Information" como si fuera operativo — no existe hoy evidencia de venta/compartición de datos con fines publicitarios en el código (`cookies/cookie-and-tracker-audit.md` clasifica a Google Analytics como riesgo de "sale/share" **no confirmado**, marcado `[SUPUESTO]`).
- No incluir honrar Global Privacy Control (GPC) como una promesa activa — es una **recomendación de diseño** en `cookies/consent-design-spec.md` §2.4, todavía no implementada.
- No prometer un plazo de respuesta de 45 días como derecho estatutario CCPA si Hireeo no alcanza el umbral — sería otorgar voluntariamente una obligación que la ley no exige, lo cual es una decisión de negocio válida pero debe ser explícita, no accidental. [[DECISION REQUIRED: ¿Hireeo quiere ofrecer estos derechos voluntariamente como estándar global, o limitarlos a donde la ley lo exige? Ya existe una recomendación en `privacy/rights-request-protocol.md` §3.4 de operar bajo el estándar más exigente (5 días hábiles) como SLA global — esa decisión, si se toma, haría este aviso más simple: los mismos derechos para todos, sin importar el estado]].

## 4. Revisión periódica de este documento

[[DECISION REQUIRED: definir con qué frecuencia se revisa este documento contra el volumen real de usuarios en EE.UU. — se recomienda revisión trimestral una vez que `/us` esté en producción]].

---

## Hechos que requieren confirmación antes de publicar

1. Conteo real de empleados de Hireeo (relevante para la exención de Texas).
2. Decisión de negocio: ¿ofrecer los mismos derechos de privacidad a todos los usuarios globalmente, o solo donde la ley de EE.UU. lo exija? (§3)
3. Volumen de usuarios por estado una vez operativo `/us`.

## Revisión por abogado local pendiente

Este documento debe revisarse cada vez que cambie el volumen de operación en EE.UU. — no es un documento estático. Un abogado de privacidad de EE.UU. debe confirmar si la exención de Texas aplica realmente y si conviene ofrecer derechos voluntariamente antes de alcanzar los umbrales legales.
