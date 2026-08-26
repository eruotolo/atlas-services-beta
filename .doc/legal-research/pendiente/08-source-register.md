# Registro de fuentes (Fase 15)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador. Este registro consolida las fuentes **transversales** (citadas desde más de un documento del expediente) con un identificador único (`SRC-xx`). Las fuentes específicas de un solo país/tema (identificadas como `U-xx`, `A-xx`, `CL-xx`, `ES-xx`/`S-xx`, `F-xx`, `PRIV-xx`, `TRANS-xx`, `BREACH-xx`, `DPO-xx`, `GAP-xx`, `TAX-xx`, `AML-xx`, `IP-xx`, etc.) viven en la sección "Fuentes primarias" de su documento de origen — no se duplican aquí porque el volumen (varios cientos de citas individuales) haría este registro inmanejable y redundante. Este documento es el índice de las fuentes que **más de un** documento necesita citar.

| ID | Fuente | Órgano emisor | Jurisdicción | Idioma | Vigencia a la fecha de este informe | Documentos que la citan |
|---|---|---|---|---|---|---|
| SRC-01 | Reglamento (UE) 2016/679 (GDPR) | Parlamento Europeo y Consejo | UE | ES/EN | Vigente | `privacy/*`, `country-analysis/spain-eu.md`, `ai/*`, `legal-documents/03,15` |
| SRC-02 | Reglamento (UE) 2022/2065 (Digital Services Act, DSA) | Parlamento Europeo y Consejo | UE | ES/EN | Vigente (obligaciones básicas); umbral VLOP no alcanzado por Hireeo | `marketplace/*`, `country-analysis/spain-eu.md`, `legal-documents/08,09` |
| SRC-03 | Reglamento (UE) 2024/1689 (AI Act) | Parlamento Europeo y Consejo | UE | ES/EN | Vigente por tramos (art. 4 desde 2025-02-01; art. 50 desde 2026-08-02) | `ai/*`, `country-analysis/spain-eu.md`, `legal-documents/06` |
| SRC-04 | Directiva 93/13/CEE (cláusulas abusivas) | Consejo de la UE | UE | ES/EN | Vigente | `consumer-and-commercial/03`, `legal-documents/01` |
| SRC-05 | Directiva (UE) 2019/2161 (Omnibus) | Parlamento Europeo y Consejo | UE | ES/EN | Vigente (transposición nacional variable) | `consumer-and-commercial/02` |
| SRC-06 | Directiva (UE) 2021/514 (DAC7) | Consejo de la UE | UE | ES/EN | Vigente desde 2023-01-01 | `payments-tax/02`, `legal-documents/15,16` |
| SRC-07 | Decisión de Ejecución (UE) 2023/1795 (EU-US Data Privacy Framework) | Comisión Europea | UE/EE.UU. | EN | Vigente, confirmada por sentencia T-553/23 (2025-09-03) | `privacy/international-transfers-inventory.md` |
| SRC-08 | Decisión de Ejecución 2012/484/UE (adecuación Uruguay) | Comisión Europea | UE/Uruguay | EN | Vigente, reafirmada COM(2024) 7 final | `privacy/international-transfers-inventory.md` |
| SRC-09 | Decisión 2003/490/CE (adecuación Argentina) | Comisión Europea | UE/Argentina | EN | Vigente, reafirmada COM(2024) 7 final | `privacy/international-transfers-inventory.md` |
| SRC-10 | Directiva (UE) 2024/2831 (trabajo en plataformas digitales) | Parlamento Europeo y Consejo | UE | ES/EN | Vigente desde 2024-12-01; plazo de transposición nacional hasta 2026-12-02 (sin transponer a la fecha de este informe) | `employment-and-platform-work/01` |
| SRC-11 | Federal Arbitration Act, 9 U.S.C. § 2 | Congreso de EE.UU. | EE.UU. | EN | Vigente | `consumer-and-commercial/03`, `legal-documents/01` |
| SRC-12 | *AT&T Mobility LLC v. Concepcion*, 563 U.S. 333 (2011) | Corte Suprema de EE.UU. | EE.UU. | EN | Vigente (precedente no revocado) | `consumer-and-commercial/03`, `legal-documents/01` |
| SRC-13 | FTC Act §5, 15 U.S.C. §45 + FTC Rule on Consumer Reviews (16 CFR Part 465) | Federal Trade Commission | EE.UU. | EN | Vigente | `country-analysis/united-states-federal.md`, `marketplace/02`, `legal-documents/09` |
| SRC-14 | ROSCA, 15 U.S.C. cap. 110 | Congreso de EE.UU. | EE.UU. | EN | Vigente (la "Click-to-Cancel Rule" de la FTC que la reforzaba fue anulada el 2025-07-08 por el 8vo Circuito, verificado independientemente) | `consumer-and-commercial/02` |
| SRC-15 | California Consumer Privacy Act / CPRA, Cal. Civ. Code §1798.100 et seq. | Estado de California | EE.UU. (CA) | EN | Vigente | `privacy/*`, `legal-documents/04` |
| SRC-16 | 18 U.S.C. § 2258A (reporte obligatorio de CSAM a NCMEC) | Congreso de EE.UU. | EE.UU. | EN | Vigente | `marketplace/03` |
| SRC-17 | Ley 18.331 (Protección de Datos Personales) + Decreto 64/2020 | Uruguay (Poder Legislativo/Ejecutivo) | Uruguay | ES | Vigente | `privacy/*`, `country-analysis/uruguay.md` |
| SRC-18 | Ley 17.250 (Relaciones de Consumo) + Ley 20.212 (reforma renovación automática, 2024-01-01) | Uruguay | Uruguay | ES | Vigente | `consumer-and-commercial/*`, `country-analysis/uruguay.md` |
| SRC-19 | Ley 25.326 (Protección de Datos Personales) | Argentina (Congreso) | Argentina | ES | Vigente | `privacy/*`, `country-analysis/argentina.md` |
| SRC-20 | Ley 24.240 (Defensa del Consumidor) | Argentina (Congreso) | Argentina | ES | Vigente | `consumer-and-commercial/*`, `country-analysis/argentina.md` |
| SRC-21 | Ley 27.739 (reforma AML/lavado de activos, 2024-03-15) | Argentina (Congreso) | Argentina | ES | Vigente, verificada independientemente | `payments-tax/03` |
| SRC-22 | Ley 19.496 (Protección al Consumidor) | Chile | Chile | ES | Vigente | `consumer-and-commercial/*`, `country-analysis/chile.md` |
| SRC-23 | Ley 21.719 (Protección de Datos Personales) | Chile | Chile | ES | **NO vigente todavía** — entra en vigor 2026-12-01 | `privacy/*`, `country-analysis/chile.md` |
| SRC-24 | Ley 21.521 (Ley Fintech) | Chile | Chile | ES | Vigente (plazo de registro CMF vencido 2025-02-03) | `payments-tax/*` |
| SRC-25 | Ley 37/1992 (IVA) | España | España | ES | Vigente | `payments-tax/02` |

## Nota de método

Cada documento temático mantiene su propia tabla de "Fuentes primarias" con URL, fecha de publicación/actualización, fecha de acceso y artículo exacto — ese es el nivel de detalle citable, no este registro. Este documento sirve para responder rápidamente "¿qué documentos dependen de esta norma?" antes de actualizar el expediente si una de estas normas cambia.
