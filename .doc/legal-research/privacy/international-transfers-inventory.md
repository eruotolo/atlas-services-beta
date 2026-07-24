# Inventario de transferencias internacionales de datos (Fase 4.6)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — la parte normativa (decisiones de adecuación) está verificada contra fuente oficial (EUR-Lex). La parte de inventario real de proveedores/subprocesadores está **pendiente de confirmación** (ver §3).

## 0. Corrección de fuente

La investigación inicial (`privacy/haiku-research-fase4-raw.md`, agente Haiku 4.5) citó números de Decisión de la Comisión Europea incorrectos para Uruguay y Argentina. Se verificaron contra EUR-Lex y se corrigen aquí:

| País | Decisión citada por Haiku (INCORRECTA) | Decisión real verificada en EUR-Lex |
|---|---|---|
| Uruguay | "2000/495/EC (1999)" | **Decisión de Ejecución 2012/484/UE**, de 21 de agosto de 2012 (DO L 227, 23/08/2012) |
| Argentina | "2003/822/EC" | **Decisión 2003/490/CE**, de 30 de junio de 2003 (DO L 168, 5/07/2003) |

Esto ilustra el riesgo de usar un modelo económico para investigación sin verificación posterior — no se debe citar ningún número de decisión de este expediente sin haber sido confirmado contra EUR-Lex u otra fuente oficial (ver `feedback` de este proyecto sobre orquestación Haiku→Sonnet).

## 1. Matriz de adecuación UE — jurisdicciones de lanzamiento

| Origen → Destino | Estado | Instrumento | Fecha de adopción | Revisión más reciente | Alcance/detalle |
|---|---|---|---|---|---|
| UE/EEE → **Uruguay** | ✅ Adecuación vigente | Decisión de Ejecución 2012/484/UE | 2012-08-21 | Reafirmada en el informe de revisión periódica de la Comisión, **COM(2024) 7 final** (15 de enero de 2024) | Reconoce que el marco legal uruguayo (Ley 18.331), la independencia y poderes de la URCDP, y el ejercicio efectivo de derechos ofrecen un nivel de protección esencialmente equivalente al de la UE. Permite transferencias sin garantías adicionales (SCC no necesarias). |
| UE/EEE → **Argentina** | ✅ Adecuación vigente | Decisión 2003/490/CE | 2003-06-30 | Reafirmada en COM(2024) 7 final (15 de enero de 2024); la Comisión señaló la necesidad de que Argentina modernice la Ley 25.326 (del año 2000) | Adoptada bajo la Directiva 95/46/CE (predecesora del GDPR); sigue vigente por continuidad transitoria del art. 45(9) GDPR hasta que se revise o revoque expresamente. |
| UE/EEE → **Chile** | ❌ Sin decisión de adecuación | — | — | — | Chile aprobó la Ley 21.719 (dic. 2024, entra en vigor 2026-12-01) parcialmente alineada con el GDPR. No hay decisión de adecuación de la Comisión Europea a la fecha de este informe. Cualquier transferencia UE→Chile requiere hoy garantías alternativas (SCC, cláusulas contractuales tipo) — **no asumir adecuación**. |
| UE/EEE → **Estados Unidos** | ✅ Adecuación vigente (solo para entidades certificadas) | Decisión de Ejecución (UE) 2023/1795 — EU-US Data Privacy Framework (DPF) | 2023-07-10 | Confirmada por el Tribunal General de la UE en septiembre de 2025 (asunto Latombe); litigio no cerrado — posibles impugnaciones futuras con nuevos argumentos | Aplica **solo** a organizaciones estadounidenses autocertificadas en el DPF. Si el proveedor de EE.UU. usado por Hireeo **no** está certificado en el DPF, esta adecuación no aplica y se requieren SCC. |
| UE/EEE → **España** | N/A (intra-UE) | — | — | — | No es transferencia internacional bajo GDPR. |

## 2. Implicación directa para Hireeo (inferencia técnica, no hecho confirmado)

- Un flujo de datos **Uruguay → servidor/proveedor en la UE** (o viceversa) no requiere SCC — está cubierto por adecuación vigente.
- Un flujo **Argentina ↔ UE** tampoco requiere SCC hoy, pero depende de que Argentina no pierda la adecuación en una futura revisión (la Comisión ya señaló la necesidad de reforma legislativa).
- Un flujo **Chile ↔ UE** **sí requiere** SCC u otro mecanismo del art. 46 GDPR — no hay adecuación.
- Un flujo **Chile/Uruguay/Argentina ↔ Estados Unidos** vía un proveedor cloud/SaaS con sede en EE.UU. depende exclusivamente de si ese proveedor está certificado en el DPF — debe verificarse proveedor por proveedor, no asumirse.

## 3. Inventario real de transferencias — PENDIENTE (BLOCKING)

Este documento describe el marco normativo. **No puede completarse el inventario real de transferencias sin confirmar:**

| Dato pendiente | Por qué es necesario | Prioridad |
|---|---|---|
| Región/ubicación real de los servidores de base de datos (Prisma/Postgres) y de hosting del frontend/backend | Determina el país de origen y destino real de cada flujo de datos | `BLOCKING` |
| Lista de subprocesadores actuales (proveedor de auth, email, storage, analítica, IA) y su sede/región | Sin esto no se puede saber qué decisión de adecuación o SCC aplica a cada proveedor | `BLOCKING` |
| Estado de certificación DPF de cada proveedor con sede en EE.UU. | Determina si aplica la Decisión 2023/1795 o si se necesitan SCC | `HIGH` |
| Existencia de DPA/SCC ya firmados con los proveedores actuales | No declarar que existen SCC sin el contrato firmado (regla explícita del encargo, Fase 12) | `HIGH` |

Este inventario debe completarse junto con `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` — son la misma pregunta vista desde dos ángulos (transferencias vs. proveedores) y no deben divergir.

## 4. Fuentes primarias verificadas

| ID | Fuente | Órgano emisor | URL | Fecha | Fecha de acceso |
|---|---|---|---|---|---|
| TRANS-01 | Decisión de Ejecución 2012/484/UE | Comisión Europea | https://eur-lex.europa.eu/eli/dec/2012/484/oj/eng | 2012-08-21 | 2026-07-23 |
| TRANS-02 | Decisión 2003/490/CE | Comisión Europea | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32003D0490 | 2003-06-30 | 2026-07-23 |
| TRANS-03 | Informe sobre la primera revisión de las decisiones de adecuación — COM(2024) 7 final | Comisión Europea | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52024DC0007 | 2024-01-15 | 2026-07-23 |
| TRANS-04 | Decisión de Ejecución (UE) 2023/1795 — EU-US Data Privacy Framework | Comisión Europea | https://eur-lex.europa.eu/eli/dec_impl/2023/1795/oj/eng | 2023-07-10 | 2026-07-23 |
| TRANS-05 | Sentencia del Tribunal General, asunto **T-553/23, Latombe c. Comisión Europea** (confirma la Decisión 2023/1795) | Tribunal General de la Unión Europea (CURIA) | https://curia.europa.eu/site/upload/docs/application/pdf/2025-09/cp250106en.pdf | 2025-09-03 | 2026-07-23 |
| TRANS-06 | Ley 21.719 | Diario Oficial de Chile | https://www.diariooficial.interior.gob.cl/edicionelectronica/index.php?date=13-12-2024&edition=44023 | 2024-12-13 | 2026-07-23 |

**Nota de calidad:** el número de asunto (T-553/23) se verificó contra el comunicado de prensa oficial de CURIA. El Tribunal limitó su fallo a la validez del marco al momento de adopción de la decisión (2023) y señaló que la Comisión debe seguir revisando la vigencia del DPF — no es una validación permanente ni cierra futuras impugnaciones.

## 5. Revisión por abogado local pendiente

La clasificación de adecuación es un hecho jurídico objetivo verificable en EUR-Lex y se considera confirmado. La aplicación práctica a los flujos de datos reales de Hireeo (§3) requiere que Ingeniería confirme la infraestructura real, y luego que un abogado revise si las medidas técnicas/contractuales vigentes son suficientes.
