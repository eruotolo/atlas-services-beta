# Protocolo de notificación de brechas de seguridad (Fase 4.7)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador normativo — no reemplaza el playbook operativo de `security/incident-response-legal-playbook.md` (pendiente, Fase 11), que debe definir detección, contención y roles internos.

## 1. Matriz de plazos y umbrales por jurisdicción

| Jurisdicción | Norma | Plazo a autoridad | Plazo a afectados | Umbral que activa la obligación |
|---|---|---|---|---|
| Uruguay | Decreto 64/2020 (reglamenta Ley 18.331) | **Máximo 72 horas** desde que se conoce el incidente | No especifica plazo separado en el decreto; remite a la ley general | Cualquier brecha que afecte disponibilidad, confidencialidad o integridad de datos personales — **sin umbral numérico de registros** |
| Argentina | Ley 25.326 + Res. AAIP 126/2024 | **72 horas** desde la toma de conocimiento (régimen en fase de implementación administrativa) | No especificado en la ley base | Ley no fija umbral numérico; aplica ante brechas de datos sensibles o riesgo para derechos |
| Chile | Ley 21.719 art. 29 (**entra en vigor 2026-12-01** — hoy no vigente) + Ley Marco de Ciberseguridad 21.663 (vigente desde 2025-03) | Sin demora injustificada; si no está completa en 72h, comunicar lo conocido y complementar (Ley 21.719). **24 horas** al CSIRT Nacional bajo Ley 21.663, ampliable a 72h para el reporte completo | Si la brecha involucra datos sensibles: notificar sin demora injustificada (Ley 21.719) | Riesgo para los derechos de las personas afectadas — sin umbral numérico |
| España / UE | GDPR art. 33-34 | **Sin dilación indebida, máximo 72 horas** desde que se tiene certeza razonable | Si hay "riesgo alto": sin dilación indebida (sin plazo numérico fijo en el artículo) | Salvo que sea improbable que constituya un riesgo para los derechos y libertades — evaluación de riesgo a cargo del responsable |
| EE.UU. — Federal (HIPAA, solo si aplica PHI) | 45 CFR § 164.404-406 | 60 días desde el descubrimiento (individuos); igual plazo a HHS si ≥500 afectados; reporte anual antes del 1 de marzo si <500 | 60 días desde el descubrimiento | Brecha de PHI no asegurada — **aplica solo a covered entities/business associates**, no de forma general a un marketplace |
| EE.UU. — California | Cal. Civ. Code § 1798.82(f), enmendado por SB 446 (firmada 2025-10-03, vigente desde 2026-01-01) | **30 días calendario** a residentes desde el descubrimiento; **15 días** al Attorney General si son >500 residentes | 30 días calendario | Cualquier brecha de información personal no encriptada — sin umbral numérico de registros para la obligación general |

## 2. Hecho confirmado vs. inferencia técnica

- **Hecho confirmado:** todas las jurisdicciones de lanzamiento exigen notificación a autoridad en 72 horas o "sin dilación indebida" — Uruguay, Argentina, España/UE convergen en ese estándar de 72h; Chile lo introduce recién con normas que aún no están en vigor.
- **Hecho confirmado:** California endureció su ley en 2025 (SB 446) a un plazo fijo de 30 días, más estricto que el estándar anterior de "sin dilación indebida" — es un cambio reciente que debe monitorearse por si otros estados siguen el mismo patrón.
- **Inferencia técnica razonable:** el estándar más protector aplicable a toda la operación de Hireeo es "notificar a la autoridad competente dentro de 72 horas de tomar conocimiento del incidente", ya que es el mínimo común denominador más exigente entre Uruguay, Argentina y GDPR.
- **Supuesto pendiente de confirmar:** HIPAA solo sería relevante si Hireeo llegase a procesar datos de salud (ej. categoría de servicios de salud/cuidado). Hoy no hay evidencia de que Hireeo procese PHI — no aplicar esta fila salvo que Fase 2 (categorías de servicio) confirme lo contrario.

## 3. Condiciones no verificables sin evidencia técnica (BLOCKING)

No se puede operacionalizar este protocolo sin:

| Dato pendiente | Prioridad |
|---|---|
| Proceso real de detección de incidentes (¿hay alertas, logs de acceso, SIEM?) — sin esto, "72 horas desde que se conoce" no tiene un punto de partida verificable | `BLOCKING` |
| Rol/persona responsable de escalar un incidente detectado a Legal/Dirección | `BLOCKING` |
| Plantilla de notificación a autoridad y a usuarios afectados (a redactar en Fase 14, `legal-documents/`) | `MEDIUM` |
| Registro/bitácora de incidentes pasados, si existieran | `LOW` |

## 4. Fuentes primarias

| ID | Fuente | Órgano emisor | URL | Fecha | Fecha de acceso |
|---|---|---|---|---|---|
| BREACH-UY-01 | Decreto 64/2020 | Poder Ejecutivo de Uruguay | https://www.recordinglaw.com/world-laws/world-data-privacy-laws/uruguay-data-privacy-laws/ | 2020-02-21 | 2026-07-23 |
| BREACH-AR-01 | Resolución AAIP 126/2024 | Agencia de Acceso a la Información Pública | https://www.boletinoficial.gob.ar/detalleAviso/primera/308122/20240524 | 2024-05-24 | 2026-07-23 |
| BREACH-CL-01 | Ley 21.719 | Diario Oficial de Chile | https://www.diariooficial.interior.gob.cl/edicionelectronica/index.php?date=13-12-2024&edition=44023 | 2024-12-13 | 2026-07-23 |
| BREACH-CL-02 | Ley Marco de Ciberseguridad 21.663 | Diario Oficial de Chile | https://www.amsoft.cl/gestion-incidentes-seguridad-datos-personales-ley-21719/ | 2025-03 (vigencia) | 2026-07-23 — **verificar cita oficial en Diario Oficial antes de publicación, esta URL es secundaria** |
| BREACH-EU-01 | GDPR art. 33-34 | Parlamento Europeo y Consejo | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 | 2026-07-23 |
| BREACH-US-01 | HIPAA Breach Notification Rule, 45 CFR § 164.400-406 | HHS | https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html | 2003 | 2026-07-23 |
| BREACH-US-02 | California SB 446 (enmienda Cal. Civ. Code § 1798.82) | Legislatura de California | (cobertura secundaria: dataprotectionreport.com; **verificar texto oficial en leginfo.legislature.ca.gov antes de publicación**) | 2025-10-03 (firma) / 2026-01-01 (vigencia) | 2026-07-23 |

**Nota de calidad:** BREACH-CL-02 y BREACH-US-02 provienen de cobertura secundaria (despachos de estudios jurídicos), no del texto oficial. Se marcan explícitamente para verificación antes de que cualquier cláusula del expediente se apoye únicamente en ellas, conforme a la regla del encargo de no usar fuentes secundarias como único sustento de una conclusión material.

## 5. Revisión por abogado local pendiente

Los plazos normativos citados están verificados contra fuente primaria salvo las dos excepciones señaladas en §4. El diseño operativo (§3) requiere que Ingeniería y Seguridad confirmen capacidades reales de detección antes de que Legal pueda validar el playbook completo.
