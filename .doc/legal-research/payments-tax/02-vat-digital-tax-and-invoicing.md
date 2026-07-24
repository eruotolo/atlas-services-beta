# IVA/impuestos digitales, facturación electrónica y DAC7 (Fase 8)

**Última actualización:** 2026-07-23
**Fuente base:** investigación de fuentes primarias por agente Haiku 4.5 (`payments-tax/haiku-research-fase8-raw.md`), con corrección crítica verificada por Sonnet 5 en §2.
**Estado:** 🟡 borrador normativo — **no es asesoría tributaria definitiva**; requiere contador/abogado tributario local antes de cualquier decisión de facturación real.

## 1. Tasas de IVA — resumen verificado

| País | IVA general | Nota sobre servicios digitales/intermediación |
|---|---|---|
| Uruguay | **22%** (tasa básica); 10% tasa mínima | IVA 22% sobre intermediación de servicios; adicionalmente IRNR (Impuesto a la Renta de No Residentes) 12% o 6% según si el prestador es o no residente — a confirmar caso por caso |
| Argentina | **21%** | 21% sobre servicios digitales prestados por no residentes cuya utilización ocurra en Argentina (Ley 27.430); adicionalmente Impuesto a los Ingresos Brutos (IIBB), que es **provincial** (no nacional) — la alícuota varía por provincia (ej. ~2% en Buenos Aires para servicios digitales de no residentes, según lo reportado) |
| Chile | **19%** (ya confirmado en `country-analysis/chile.md`, DL 825 art. 8 letra n) | Sin cambios |
| España | **21%** (tipo general) | 10% y 4% son tipos reducidos que no aplicarían a servicios de intermediación de un marketplace |

**Grado de confianza:** las tasas generales de IVA (22% UY, 21% AR, 19% CL, 21% ES) coinciden con conocimiento jurídico-tributario consolidado y son de baja probabilidad de error. Los recargos específicos (IRNR de Uruguay, IIBB provincial de Argentina) no se verificaron contra el texto legal íntegro — se citan tal como los reportó el agente de investigación, marcados como pendientes de confirmación por un contador local.

## 2. DAC7 (Unión Europea) — CORRECCIÓN CRÍTICA

**La investigación inicial contenía un error material que se corrige aquí.**

- **Lo que reportó el agente Haiku 4.5:** que el umbral de exención de DAC7 (30 transacciones **o** €2.000 anuales) aplica **igual** a la venta de bienes y a los servicios personales.
- **Lo que se verificó de forma independiente (Sonnet 5, cruzando múltiples fuentes especializadas en DAC7):** el umbral de exención de minimis (30 transacciones y €2.000) **aplica únicamente a la venta de bienes**. Para las demás actividades reportables — que incluyen expresamente **servicios personales**, alquiler de inmuebles y alquiler de medios de transporte — **no existe umbral mínimo**, salvo una excepción marginal por "vendedor exento" no relevante aquí.

### Consecuencia práctica para Hireeo (inferencia directa del hecho corregido)

Hireeo es un marketplace de **servicios personales**. Si Hireeo llega a operar con intermediación de pagos real en España/UE (Escenario B de `payments-tax/01-payment-architecture-scenarios-and-licensing.md`), **DAC7 no exime a los prestadores de bajo volumen** — en principio, cualquier prestador con al menos una transacción reportable debería incluirse en el reporte anual de la plataforma a la autoridad tributaria. Esto es una obligación de **volumen alto** (reportar sobre prácticamente todos los prestadores activos en la UE), no una obligación acotada a "grandes" prestadores.

## 3. Marco DAC7 — datos verificados

| Dato | Detalle |
|---|---|
| Norma | Directiva (UE) 2021/514, que modifica la Directiva 2011/16/UE (DAC) |
| Entrada en vigor | Aplicable desde el 2023-01-01 (datos del año 2023 reportados en 2024) |
| Actividades cubiertas | Venta de bienes, alquiler de bienes inmuebles, **servicios personales** (aquí encaja Hireeo), alquiler de cualquier medio de transporte |
| Umbral de exención | **Solo para venta de bienes**: exento si <30 transacciones Y <€2.000 anuales. **Sin umbral para servicios personales** |
| Datos a reportar por prestador | Nombre/razón social, domicilio fiscal, NIF/Tax ID, número total de transacciones del año, ingresos brutos totales por período |
| Propuesta de reforma (no vigente) | La Comisión Europea propuso elevar el umbral de bienes a €3.000 — **propuesta bajo revisión, no confirmar como vigente** |

## 4. Facturación electrónica obligatoria — resumen por país

| País | ¿Obligatoria? | Sistema | Desde cuándo |
|---|---|---|---|
| Uruguay | Sí, prácticamente universal | CFE (Comprobante Fiscal Electrónico), DGI | **2024-07-01** |
| Argentina | Sí, para sujetos designados por AFIP/ARCA (ampliación progresiva) | Factura Electrónica AFIP/ARCA | Vigente desde 2016 con expansión continua; **no confirmado si Hireeo caería en el alcance sin evaluación puntual del volumen/actividad** |
| España | **Todavía no** para el caso general — Verifactu entra en vigor el **2027-01-01** (empresas fuera del SII) y **2027-07-01** (resto). Quienes ya están en el SII (Suministro Inmediato de Información) están exentos porque ya envían la información telemáticamente | Verifactu (Real Decreto 1007/2023) | 2027 (todavía no vigente a la fecha de este informe) |
| Estados Unidos | **No existe obligación federal** de facturación electrónica B2B. Solo hay mandatos de e-invoicing B2G (compras del gobierno) en algunos organismos, y eso no aplica a un marketplace de consumo | N/A | N/A |

## 5. Impuesto sobre ventas en EE.UU. — marketplace facilitator laws

- **Hecho reportado (no verificado independientemente por Sonnet 5, pero coincide con la dirección general conocida de estas leyes):** la mayoría de los estados de EE.UU. aplican sus leyes de "marketplace facilitator" (que obligan a la plataforma a cobrar y remitir sales tax) principalmente a **bienes tangibles**; algunos estados están ampliando el alcance a ciertos servicios (alojamiento de corta duración, algunos servicios digitales), pero **no es un estándar uniforme**.
- **Umbral típico de nexo económico:** US$ 100.000 en ventas anuales (algunos estados usan US$ 500.000). El umbral adicional de "200 transacciones" se está eliminando progresivamente en varios estados desde 2023-2025 en favor del umbral monetario únicamente.
- **Implicación para Hireeo:** dado que Hireeo facilita **servicios** (no bienes), la aplicabilidad de estas leyes estatales depende del tipo de servicio y del estado — **no se puede asumir que aplican ni que no aplican sin un análisis estado por estado una vez que haya volumen real de operación en EE.UU.**

## 6. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| TAX-Q1 | Confirmar con contador argentino la alícuota exacta de IIBB aplicable si Hireeo opera en Buenos Aires u otra provincia | `MEDIUM` |
| TAX-Q2 | Si Hireeo opera en España/UE con intermediación de pagos real, diseñar el proceso de recolección de NIF/domicilio fiscal de cada prestador **desde el día uno** — no hay margen de "prestadores pequeños exentos" bajo DAC7 | `HIGH` — consecuencia directa de la corrección de §2 |
| TAX-Q3 | Confirmar si el volumen/actividad de Hireeo en Argentina activaría la obligación de Factura Electrónica AFIP/ARCA | `MEDIUM` |

## 7. Revisión por abogado/contador local pendiente

Este documento **no constituye asesoría tributaria**. Las tasas generales de IVA tienen alta confianza; los recargos provinciales/nacionales específicos y los umbrales de aplicabilidad requieren validación de un contador local en cada país antes de cualquier decisión de facturación o retención.
