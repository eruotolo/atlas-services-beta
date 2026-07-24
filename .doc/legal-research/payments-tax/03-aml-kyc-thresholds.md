# AML/KYC — umbrales de sujeto obligado por país (Fase 8)

**Última actualización:** 2026-07-23
**Fuente base:** investigación de fuentes primarias por agente Haiku 4.5 (`payments-tax/haiku-research-fase8-raw.md`), con verificación selectiva por Sonnet 5.
**Estado:** 🟡 borrador — extiende `payments-tax/01-payment-architecture-scenarios-and-licensing.md` §3.

## 1. Resumen por país

| País | Regulador | ¿Un marketplace que solo conecta (Escenario A) es sujeto obligado? | ¿Un marketplace que retiene fondos vía escrow (Escenario B) es sujeto obligado? | Norma clave |
|---|---|---|---|---|
| Uruguay | BCU (supervisa financieras) / SENACLAFT (supervisa no financieras) | Probablemente no — pero **no hay una respuesta clara en ley base**; requiere análisis caso por caso | Probablemente sí, si retiene fondos de terceros — umbral de reporte de operaciones individuales reportado en ~US$ 10.000 (**no verificado independientemente**) | Ley 18.060 y resoluciones BCU/SENACLAFT |
| Argentina | BCRA (supervisa PSP/billeteras) / UIF (recibe reportes) | No, si no maneja fondos | **Sí** — la Ley 27.739 (15-mar-2024, **verificada independientemente por Sonnet 5**) incorporó explícitamente a los "Proveedores de Servicios de Pago" como sujetos obligados ante la UIF | Ley 27.739 (modifica Ley 25.246) |
| Chile | CMF (registro y autorización) / UAF (recibe reportes) | No, si no maneja fondos ni opera un "sistema transaccional alternativo" | Sí, si actúa como intermediario de pagos o sistema transaccional alternativo bajo la Ley Fintech — requería registro ante la CMF con plazo ya vencido (2025-02-03) para quienes operaban a esa fecha | Ley 21.521 (Ley Fintech, 2023) |
| EE.UU. | FinCEN (federal) + reguladores estatales | Depende del estado y de si califica como Money Services Business (MSB) | Muy probablemente sí — la mayoría de money transmitters/agregadores que manejan fondos de terceros califican como MSB ante FinCEN, además del licenciamiento estatal de §1 de `01-payment-architecture-scenarios-and-licensing.md` | Bank Secrecy Act (BSA) + leyes estatales de money transmission |

## 2. Hecho confirmado con mayor solidez

**Argentina** es el caso con evidencia más sólida: la Ley 27.739 (15 de marzo de 2024) es real y verificable — modifica la Ley 25.246 (marco AML base) e incorpora explícitamente a los "Proveedores de Servicios de Pago" (no solo proveedores de servicios de activos virtuales) como sujetos obligados ante la UIF. **Se confirmó de forma independiente contra fuentes cruzadas** (comunicados oficiales de argentina.gob.ar y análisis de estudios jurídicos).

## 3. Qué no está verificado independientemente

- El umbral de "USD 10.000 por operación" reportado para Uruguay no se verificó contra la norma primaria — es una cifra plausible (coincide con el estándar internacional GAFI/FATF de reporte de operaciones en efectivo) pero debe confirmarse antes de citarla como obligación específica.
- El detalle exacto de qué categoría de la Ley 21.521 chilena (Ley Fintech) aplicaría a un marketplace de servicios que opera escrow — la ley regula 7 categorías distintas de servicios financieros y **no se confirmó cuál encaja exactamente con el modelo de Hireeo** sin dictamen local.

## 4. Implicación directa (inferencia, no hecho normativo)

Los cuatro países convergen en un mismo patrón: **la obligación AML se activa cuando la plataforma maneja fondos de terceros**, no por el solo hecho de operar un marketplace de descubrimiento. Esto refuerza la recomendación ya hecha en `01-payment-architecture-scenarios-and-licensing.md` §2: usar un PSP ya registrado/licenciado como agregador reduce, pero no elimina, la necesidad de que Hireeo evalúe su propio estatus AML en cada país antes de manejar fondos directamente.

## 5. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| AML-Q1 | Confirmar contra texto primario BCU/SENACLAFT el umbral de reporte de operaciones en Uruguay | `MEDIUM` |
| AML-Q2 | Determinar en cuál de las 7 categorías de la Ley 21.521 (Chile) encajaría el modelo de escrow de Hireeo, si se activa el Escenario B | `HIGH` — condiciona si se necesita registro CMF |

## 6. Revisión por abogado local pendiente

La conclusión de Argentina (§2) tiene alta confianza. Uruguay y Chile requieren dictamen local antes de asumir aplicabilidad o inaplicabilidad — este documento identifica el marco regulatorio correcto, no resuelve la calificación final.
