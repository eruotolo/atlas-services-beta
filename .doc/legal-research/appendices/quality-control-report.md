# Informe de control de calidad (Fase 16)

**Última actualización:** 2026-07-23
**Ejecutado por:** Sonnet 5 (coordinador de esta sesión), sobre el trabajo propio y el de 5 agentes en paralelo (fork) + 3 sesiones de investigación delegadas a un agente Haiku 4.5 en una terminal separada.

Este informe recorre los controles internos exigidos por `prompt.md` Fase 16, con hallazgos reales, no una descripción genérica del proceso.

## 1. ¿Toda afirmación de política se compara con evidencia de código/configuración/decisión aceptada?

**Verificado con muestreo, no exhaustivamente.** Los documentos de `legal-documents/` usan sistemáticamente `[[DECISION REQUIRED]]` (124 marcas totales, ver §7) para los campos no confirmables, en vez de inventar hechos. Ejemplo verificado: `legal-documents/06-ai-responsible-policy.md` L.24 marca explícitamente que el texto sobre "confirmación del usuario antes de que la IA escriba en base de datos" **no debe publicarse** hasta que el control técnico exista — es exactamente el estándar de rigor exigido por el encargo.

**Hallazgo:** no se auditaron los 18 documentos línea por línea contra el código — el volumen (más de 100 páginas de borradores) hace inviable una verificación exhaustiva en esta sesión. Se recomienda una segunda pasada de QC humana antes de publicación.

## 2. ¿Toda conclusión legal material tiene fuente primaria, vigencia y enlace?

**Mayormente sí, con excepciones ya señaladas explícitamente dentro de los propios documentos.** Durante esta sesión se detectaron y corrigieron tres errores de citación que habían llegado desde investigación delegada a un modelo económico (Haiku 4.5) sin verificación cruzada:

1. Números de Decisión de la Comisión Europea sobre adecuación de Uruguay y Argentina, citados incorrectamente — corregidos contra EUR-Lex (`privacy/international-transfers-inventory.md` §0).
2. El umbral de exención de DAC7 (30 transacciones/€2.000), que Haiku afirmó aplicable a bienes y servicios por igual — es **falso**, solo aplica a bienes (`payments-tax/02-vat-digital-tax-and-invoicing.md` §2). Esta corrección tiene consecuencia práctica material: elimina una exención que los prestadores de Hireeo habrían asumido erróneamente tener.
3. La cita del caso judicial que confirma el marco EU-US Data Privacy Framework, inicialmente sin número de asunto verificable — completada como *T-553/23, Latombe c. Comisión* tras verificación contra CURIA.

**Persisten citas marcadas explícitamente como no verificadas independientemente** (no se ocultan, se señalan en cada documento): Ley 10/2025 de España, AB 2863 de California, Disposición 377/2026 de Argentina, y varias leyes estatales de EE.UU. de fuente secundaria. **Antes de publicar, deben verificarse contra texto oficial.**

## 3. ¿Se confundió reclutamiento con marketplace de servicios?

**No.** Ningún documento del expediente trata a Hireeo como plataforma de reclutamiento/selección de personal. El tema de clasificación laboral (`employment-and-platform-work/`) se trata correctamente como riesgo de **reclasificación de un prestador independiente**, no como gestión de empleados — es la distinción correcta que exige el encargo.

## 4. ¿Las jurisdicciones se tratan separadamente, y EE.UU. incluye análisis estatal material?

**Sí.** `country-analysis/united-states-federal.md` y `united-states-state-local-matrix.md` están separados; el resto de fases (privacidad, pagos, empleo) distinguen explícitamente California, Texas, Colorado, Connecticut, Utah y Oregon con umbrales propios, no un bloque único "EE.UU.".

## 5. ¿Las fechas futuras (GDPR/AI Act, reformas locales, leyes estatales) se presentan correctamente como no vigentes?

**Sí, de forma consistente.** Ejemplos verificados: Ley 21.719 de Chile marcada repetidamente como "entra en vigor 2026-12-01 — hoy no vigente"; AI Act art. 50 marcado "desde 2026-08-02"; Verifactu de España marcado "obligatorio desde 2027-01-01, todavía no vigente"; Directiva (UE) 2024/2831 marcada con plazo de transposición 2026-12-02 sin que ningún Estado miembro la haya transpuesto.

**Hallazgo de calidad relevante:** la investigación de `marketplace/03-minors-content-and-mandatory-reporting.md` encontró fuentes contradictorias sobre si el Parlamento Europeo votó a favor o en contra de extender la excepción de ePrivacy para CSAM. El documento **no oculta la contradicción** — la señala explícitamente y separa el hecho operativo verificado (la excepción venció el 2026-04-03) de la narrativa política incierta. Esto es el comportamiento correcto ante fuentes contradictorias.

## 6. ¿El consentimiento de cookies y las preferencias coinciden con la implementación observada?

**Sí — y el hallazgo es negativo (una brecha, no un cumplimiento).** `cookies/cookie-and-tracker-audit.md` (de una fase anterior a esta sesión) ya identificó que GTM/GA4 cargan sin consentimiento previo. `legal-documents/05-cookie-policy-and-consent-spec.md` no promete un comportamiento de consentimiento que no exista — señala la brecha como bloqueador (Q8, `OBL-12`).

## 7. ¿Retención, eliminación, backups y derechos no se prometen sin soporte técnico?

**Sí.** `privacy/gap-assessment-and-retention-rules.md` §2 propone plazos explícitamente **condicionados**, no definitivos. `legal-documents/13-data-retention-and-deletion-policy.md` hereda esa condicionalidad. La configuración real de backups quedó marcada como `[[DECISION REQUIRED]]` en vez de asumirse.

## 8. ¿Las limitaciones de responsabilidad, arbitraje, desistimiento y exclusiones respetan derechos inderogables?

**Sí, con un hallazgo importante ya resuelto en el diseño:** una cláusula única de arbitraje obligatorio + renuncia a acción de clase sería inválida en Uruguay, Argentina, Chile y España/UE (confirmado en `consumer-and-commercial/03-dispute-resolution-and-arbitration.md`). `legal-documents/01-terms-of-service.md` §7 implementa una cláusula **diferenciada** por jurisdicción en vez de una cláusula única — verificado además por coherencia cruzada entre dos agentes distintos que trabajaron esa cláusula desde ángulos diferentes (Fase 14 grupo 1 y grupo 3), sin contradicción entre ellos.

## 9. ¿Los avisos de IA no sustituyen controles reales?

**Sí, con un hallazgo explícito.** `legal-documents/06-ai-responsible-policy.md` identificó que redactar "la IA sugiere, no decide por ti — requiere tu confirmación" sería **engañoso** mientras el control técnico de confirmación (AI-CHK-03) no exista, y lo marcó como no publicable hasta implementarse. Es exactamente el estándar que exige el encargo ("una cláusula de 'la IA puede equivocarse' no reemplaza límites de uso, validación, supervisión ni derechos de usuario").

## 10. ¿Las referencias de archivos exponen credenciales, secretos o datos personales?

**No.** Se ejecutó una búsqueda de patrones de secretos/API keys sobre todo el expediente. El único resultado fue una referencia ya existente a `clientSecret: pi_stub_...` en `01-scope-assumptions-and-open-questions.md` — es un valor de *stub* de Stripe, explícitamente documentado como tal, no un secreto real. No se encontraron tokens, contraseñas ni datos personales reales.

## 11. ¿Enlaces, tabla de contenidos, numeración y versionado son consistentes?

**Parcialmente verificado.** La numeración de `legal-documents/01` a `18` es consistente con el orden del encargo. `README.md` no fue modificado por ningún agente en paralelo (verificado) — se actualiza en un solo paso al final de esta sesión para evitar conflictos de edición concurrente.

**Discrepancia menor detectada:** el conteo total de `[[DECISION REQUIRED]]` en `legal-documents/` es **124** según grep directo, mientras que la suma de lo reportado por los 3 agentes que redactaron esos documentos fue **103** (44+38+21). La diferencia probablemente se debe a que algunos agentes contaron "decisiones únicas" y no "marcas individuales" (una misma decisión puede repetirse en varias filas de una tabla). No es un error de contenido, es una discrepancia de método de conteo — no requiere corrección de los documentos, solo se señala para que no se use ninguna de las dos cifras como una métrica precisa sin recontar.

## 12. Errores encontrados y corregidos durante esta sesión (registro acumulado)

| # | Error | Dónde se originó | Cómo se detectó | Corrección |
|---|---|---|---|---|
| 1 | Decisión de adecuación UE-Uruguay citada como "2000/495/EC (1999)" | Agente Haiku 4.5, Fase 4 | Verificación cruzada contra EUR-Lex | Corregida a Decisión de Ejecución 2012/484/UE |
| 2 | Decisión de adecuación UE-Argentina citada como "2003/822/EC" | Agente Haiku 4.5, Fase 4 | Verificación cruzada contra EUR-Lex | Corregida a Decisión 2003/490/CE |
| 3 | Cita judicial del caso EU-US DPF sin número de asunto verificable | Agente Haiku 4.5, Fase 4 | Verificación contra CURIA | Completada como T-553/23, *Latombe c. Comisión* |
| 4 | Umbral de exención de DAC7 (30 transacciones/€2.000) presentado como aplicable igual a bienes y servicios | Agente Haiku 4.5, Fase 8 | Verificación cruzada contra múltiples fuentes especializadas en DAC7 | Corregido: el umbral solo aplica a bienes; servicios personales no tienen umbral de exención |
| 5 | Autoreporte de tamaño de archivo exagerado ("2.100+ líneas" cuando el archivo real tenía 243) | Agente Haiku 4.5, Fase 4 | Verificación directa con `wc -l` | Sin impacto en contenido — se señaló como ejemplo de por qué no confiar en el autorreporte de un agente sin verificar |

## 13. Supuestos críticos pendientes de aprobación (para el resumen ejecutivo)

Ver `00-executive-summary.md` — se consolidan ahí para visibilidad de fundadores, no se repiten en este documento técnico.
