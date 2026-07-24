# Gap assessment (umbrales EE.UU.) y reglas de retención (Fase 4.5 y 4.8)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — la parte de umbrales EE.UU. está verificada; la parte de retención es **enteramente condicionada** porque no hay datos de negocio confirmados sobre volumen de usuarios ni contratos con proveedores.

## 1. Gap assessment — ¿Hireeo alcanza los umbrales de las leyes estatales de privacidad de EE.UU.?

Regla del encargo: **no tratar un umbral no alcanzado como obligación actual**. Esta tabla existe para monitorear, no para asumir aplicabilidad.

| Estado | Ingresos brutos anuales (umbral) | Volumen de datos (umbral) | Entrada en vigor | ¿Reconocer Global Privacy Control? | ¿Aplica hoy a Hireeo? |
|---|---|---|---|---|---|
| California (CCPA/CPRA) | US$ 26,625 millones (ajustado 2025-01-01) | 100.000+ consumidores/hogares, **o** 50%+ de ingresos por venta/compartición de datos | 2020 (CCPA) / 2023-01-01 (CPRA) | **Sí**, desde 2024-07-01 | **NO** — Hireeo no reporta ingresos ni volumen de usuarios en California que se acerquen a estos umbrales (supuesto: no hay evidencia de operación en EE.UU. con ese volumen). Monitorear si Hireeo lanza en `/us`. |
| Colorado (CPA) | Sin umbral de ingresos | 100.000 consumidores, **o** 25.000 consumidores + ingresos por venta de datos. Desde 2025-10-01: **sin umbral** si se procesan datos sensibles o se venden datos | 2023-07-01 | Fomentado, no obligatorio por ley | **NO** por volumen — pero la excepción de "datos sensibles sin umbral" (desde oct. 2025) merece atención si Hireeo trata categorías sensibles de prestadores/usuarios en EE.UU. |
| Connecticut (CTDPA) | Sin umbral de ingresos | Original: 100.000 o (25.000 + 25% ingresos). **Desde 2026-07-01**: 35.000 consumidores, o **sin umbral** si se procesan datos sensibles o se venden datos | 2023-07-01 / ampliación 2026-07-01 | Sí, desde la ampliación de 2026-07-01 | **NO** por volumen, mismo comentario que Colorado sobre datos sensibles |
| Virginia (VCDPA) | Sin umbral de ingresos | 100.000 consumidores, o 25.000 + 50% ingresos por venta de datos | 2023-01-01 | No explícito, pero exige opt-out general | **NO** |
| Utah (UCPA) | US$ 25 millones **Y** (100.000 consumidores o 25.000 + 50% ingresos por venta de datos) | Doble condición — ambas deben cumplirse | 2023-12-31 | No | **NO** |
| Texas (TDPSA) | **Sin umbral** de ingresos | **Sin umbral** de volumen — única exención: empresa con menos de 500 empleados (definición SBA) | 2024-07-01 | Sí, desde 2025-01-01 (primero en exigirlo) | **NO aplicable si Hireeo tiene menos de 500 empleados** — dado el tamaño actual del equipo, la exención probablemente aplica, pero debe confirmarse el conteo real de empleados |
| Oregon (OCPA) | Sin umbral de ingresos | 100.000 consumidores, o 25.000 + 25% ingresos por venta de datos | 2024-07-01 | Esperado (marco multiestatal) | **NO** |

### Qué monitorear (no una obligación actual)

- Volumen de usuarios activos por estado de EE.UU., una vez que `/us` esté operativo.
- Número de empleados de Hireeo (relevante específicamente para la exención de Texas).
- Si Hireeo llega a vender o compartir datos con terceros con fines publicitarios — varias leyes bajan el umbral a cero cuando eso ocurre.

## 2. Reglas de retención — condicionadas (NO son plazos definitivos)

El encargo original prohíbe inventar plazos de retención. Esta tabla propone **valores condicionados** que deben confirmarse antes de convertirse en política:

| Categoría de dato | Base para el plazo propuesto | Plazo propuesto (condicionado) | Qué falta confirmar |
|---|---|---|---|
| Datos de cuenta activa | Mientras exista relación contractual | Duración de la cuenta activa | Confirmar si hay proceso de eliminación de cuentas inactivas |
| Datos tras eliminación de cuenta | Prevención de fraude / disputas | Propuesta: 30-90 días de "período de gracia" antes de eliminación definitiva, sujeto a decisión de Producto | Decisión de negocio pendiente — no existe hoy este flujo en el código |
| Facturación e impuestos | Plazos de conservación contable/fiscal por país (ej. Uruguay: normativa DGI; España: normativa AEAT — **plazos exactos no investigados aún en esta fase**) | No proponer cifra sin investigar la normativa fiscal específica de cada país | `HIGH` — pendiente Fase 8 (pagos/impuestos) |
| Logs de seguridad/acceso | Necesidad de investigar incidentes (§ breach-notification-protocol.md) | Propuesta: 90-180 días, alineado a prácticas de la industria — **no es un mínimo legal confirmado** | Confirmar si existen logs hoy y por cuánto tiempo se conservan técnicamente |
| Backups | Depende de la política de infraestructura real (no confirmada) | No proponer plazo sin conocer la configuración real de backups | `BLOCKING` — requiere respuesta de Ingeniería |
| Datos de mensajería entre usuarios | Sin base legal específica identificada aún | No proponer plazo | Pendiente de análisis de moderación (Fase 10) |

## 3. Fuentes primarias (umbrales EE.UU.)

| ID | Fuente | Órgano | URL/cita | Fecha efectiva | Fecha de acceso |
|---|---|---|---|---|---|
| GAP-CA-01 | Cal. Civ. Code § 1798.140(d) | Estado de California | § 1798.140(d)(1) | 2025-01-01 (umbral actualizado) | 2026-07-23 |
| GAP-CO-01 | Colorado Privacy Act, § 12-110-102(6); HB 24-1158 | Estado de Colorado | https://coag.gov/resources/colorado-privacy-act/ | 2023-07-01 / 2025-10-01 (enmienda) | 2026-07-23 |
| GAP-CT-01 | Connecticut Data Privacy Act; HB 5287 (2026) | Estado de Connecticut | (verificar texto oficial en cga.ct.gov antes de publicación) | 2023-07-01 / 2026-07-01 | 2026-07-23 |
| GAP-VA-01 | Virginia Code § 59.1-575 | Estado de Virginia | https://law.lis.virginia.gov/vacode/59.1-575/ (verificar) | 2023-01-01 | 2026-07-23 |
| GAP-UT-01 | Utah Code § 13-61-102 | Estado de Utah | https://le.utah.gov/xcode/Title13/Chapter61/ (verificar) | 2023-12-31 | 2026-07-23 |
| GAP-TX-01 | Texas Business & Commerce Code § 521 | Estado de Texas | https://statutes.capitol.texas.gov/ (verificar) | 2024-07-01 | 2026-07-23 |
| GAP-OR-01 | Oregon Consumer Privacy Act, § 646A.500 | Estado de Oregon | https://www.oregonlegislature.gov/ (verificar) | 2024-07-01 | 2026-07-23 |

**Nota de calidad:** las citas de Colorado, Connecticut, Virginia, Utah, Texas y Oregon provienen de la investigación de Haiku con fuentes secundarias (firmas de compliance/consultoría), no de los textos legislativos oficiales de cada estado. Se marcan para verificación puntual antes de que cualquier documento de cara al usuario (`legal-documents/`) se apoye en estas cifras.

## 4. Revisión por abogado local pendiente

El gap assessment de umbrales de EE.UU. es un ejercicio de monitoreo, no una conclusión de cumplimiento. Las reglas de retención (§2) son deliberadamente provisionales — ningún valor de esta tabla debe copiarse a una Política de Privacidad publicada sin que Producto/Legal confirme los datos marcados como pendientes.
