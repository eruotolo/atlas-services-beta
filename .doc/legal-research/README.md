# Expediente de Due Diligence Legal Internacional — Hireeo

## Alcance

Este expediente documenta una investigación y auditoría de cumplimiento del marketplace **Hireeo** para las jurisdicciones de lanzamiento: Uruguay, Argentina, Chile, España/UE y Estados Unidos (federal + estatal/local relevante). No constituye asesoría legal. Todo borrador de documento jurídico requiere revisión de un abogado habilitado en cada jurisdicción antes de publicarse.

- **Fecha de corte de la investigación:** 2026-07-23.
- **Versión del expediente:** v1.0 — primera pasada completa de las 16 fases del encargo (`prompt.md`). Sigue habiendo `[[DECISION REQUIRED]]` y preguntas `BLOCKING` sin resolver — ver estado por sección abajo y `00-executive-summary.md`.
- **Metodología y encargo original:** [`prompt.md`](./prompt.md).
- **Limitaciones:** la investigación se basa en el estado del repositorio a la fecha de corte y en fuentes públicas vigentes a esa fecha. Los hechos de negocio no confirmables en el código (entidad legal, procesador de pagos definitivo, retenciones, contratos con proveedores, etc.) se marcan como supuestos pendientes de validación por el equipo — ver `01-scope-assumptions-and-open-questions.md` y el checklist maestro en `checklists/00-pre-launch-blocking-checklist.md`.

## Cómo leer este expediente

1. Empieza por [`00-executive-summary.md`](./00-executive-summary.md) — resumen para fundadores: los 10 riesgos principales, 7 bloqueadores de lanzamiento, exposición por país y próximos pasos.
2. [`01-scope-assumptions-and-open-questions.md`](./01-scope-assumptions-and-open-questions.md) — la "Ficha de producto confirmada" y el cuestionario de 17 preguntas abiertas (Q1-Q17) con prioridad.
3. `02`–`09` son los registros maestros: mapa de datos, entidades, obligaciones globales, matriz de riesgo, hoja de ruta de remediación, índice de evidencia, registro de fuentes y trazabilidad de implementación.
4. Las carpetas temáticas (`privacy/`, `cookies/`, `ai/`, `marketplace/`, `consumer-and-commercial/`, `payments-tax/`, `intellectual-property/`, `security/`, `vendors-and-transfers/`, `employment-and-platform-work/`, `accessibility-and-content/`) contienen el detalle por tema, cada una con sus propias fuentes primarias y preguntas abiertas.
5. `country-analysis/` contiene el detalle por país (Uruguay, Argentina, Chile, España/UE, EE.UU. federal+estatal) y la matriz comparativa.
6. `code-audit/00-repository-inventory.md` contiene el inventario técnico del repositorio (Fase 1.1).
7. `legal-documents/` contiene los 18 borradores de cara al usuario y B2B exigidos por la Fase 14 — **ninguno es publicable sin revisión legal local**; todos usan `[[DECISION REQUIRED]]` para los campos no confirmables (124 marcas en total, ver `appendices/quality-control-report.md` §11).
8. `checklists/` contiene el checklist maestro de bloqueadores pre-lanzamiento y un checklist rápido por país.
9. `appendices/quality-control-report.md` documenta la auditoría de coherencia final (Fase 16), incluyendo los errores de investigación detectados y corregidos durante el proceso.

## Nota sobre el método de investigación de esta sesión

Buena parte de las Fases 4, 7, 8 y 10, y la totalidad de la Fase 14 (documentos legales) y del tema de clasificación laboral, se produjeron en esta sesión combinando: (a) un agente Haiku 4.5 en una terminal separada para recopilar fuentes primarias puntuales, (b) verificación cruzada por Sonnet 5 de los hallazgos más sorprendentes o de mayor impacto antes de incorporarlos, y (c) 5 agentes en paralelo (fork de Sonnet 5) para completar Seguridad/Proveedores, Clasificación Laboral, y los 3 grupos del paquete de 18 documentos legales. Este método detectó y corrigió varios errores de citación de la investigación delegada a Haiku — el detalle completo está en `appendices/quality-control-report.md` §12.

## Registro de cambios

| Fecha | Cambio |
|---|---|
| 2026-07-23 | Creación de la estructura del expediente e inicio de la investigación (Fase 0). |
| 2026-07-23 | Fase 4 (privacidad) completa: `rights-request-protocol.md`, `international-transfers-inventory.md`, `breach-notification-protocol.md`, `dpo-and-governance.md`, `gap-assessment-and-retention-rules.md`. Corregidos dos números de Decisión de la Comisión Europea citados incorrectamente por investigación delegada (Uruguay, Argentina). |
| 2026-07-23 | Fase 7 (consumer-and-commercial) completa: información precontractual/garantías, suscripciones/renovación automática, resolución de disputas y arbitraje. Verificada la anulación de la FTC Click-to-Cancel Rule y la reforma uruguaya Ley 20.212. |
| 2026-07-23 | Fase 8 (payments-tax) completa: arquitectura de pagos/licencias, IVA/DAC7/facturación electrónica, umbrales AML/KYC, playbook de fraude. **Corrección crítica:** el umbral de exención de DAC7 no aplica a servicios personales (solo a bienes) — Haiku había reportado lo contrario. |
| 2026-07-23 | Fase 10 (Trust & Safety) completa: programa de confianza y seguridad, reporte obligatorio de CSAM y aplicabilidad del DSA por tamaño de plataforma. Verificado el vencimiento (2026-04-03) de la excepción temporal de ePrivacy de la UE para detección de CSAM. |
| 2026-07-23 | Fase 11 (seguridad) y complemento de Fase 12 (proveedores) completos: `security/incident-response-legal-playbook.md`, `vendor-security-review.md`, `responsible-disclosure-policy.md`, `vendors-and-transfers/02-dpa-contract-strategy.md`. |
| 2026-07-23 | Tema de clasificación laboral (nuevo, no cubierto antes): `employment-and-platform-work/01-worker-classification-risk.md` y `02-provider-relationship-controls.md`. Verificada la Directiva (UE) 2024/2831 (plazo de transposición 2026-12-02, sin transponer aún). Estado de Proposition 22 (California) marcado como no verificable con certeza por fuentes contradictorias. |
| 2026-07-23 | Fase 14 completa: los 18 documentos de `legal-documents/` (Términos de Servicio, Términos de Prestadores, Política de Privacidad global, avisos de EE.UU., Cookies, IA Responsable, Uso Aceptable, Trust & Safety, Reseñas/Ranking, IP/DMCA, Seguridad, Accesibilidad, Retención, Incident Response interno, DPA, Términos Comerciales, Marketing, Matriz de Contratos Corporativos). Todos en estado borrador con `[[DECISION REQUIRED]]` explícito donde falta un hecho de negocio. |
| 2026-07-23 | Fase 15 completa: `04-global-obligation-register.md`, `05-risk-matrix.md` (24 escenarios), `06-remediation-roadmap.md`, `07-evidence-index.md`, `08-source-register.md`, `09-implementation-traceability.md`, y `checklists/`. |
| 2026-07-23 | Fase 16 (control de calidad) completa: `appendices/quality-control-report.md`, con el registro de 5 errores de investigación detectados y corregidos durante todo el proceso. `00-executive-summary.md` redactado. README actualizado a versión v1.0. |

## Estado de entregables

> Leyenda: ✅ completado (con supuestos/bloqueadores documentados) · 🟡 parcial · ⚖️ requiere abogado local antes de publicar

| Documento | Estado |
|---|---|
| 00-executive-summary.md | ✅ |
| 01-scope-assumptions-and-open-questions.md | ✅ |
| 02-product-and-data-map.md | ✅ |
| 03-legal-entity-and-role-map.md | ✅ |
| 04-global-obligation-register.md | ✅ |
| 05-risk-matrix.md | ✅ |
| 06-remediation-roadmap.md | ✅ |
| 07-evidence-index.md | ✅ |
| 08-source-register.md | ✅ |
| 09-implementation-traceability.md | ✅ |
| country-analysis/* (7 archivos: uy, ar, cl, spain-eu, us-federal, us-state-local, comparativa) | ✅ |
| privacy/* (7 archivos) | ✅ — ROPA con datos del responsable aún `BLOCKING` |
| cookies/* (2 archivos) | ✅ |
| ai/* (8 archivos) | ✅ |
| marketplace/* (3 archivos + raw de investigación) | ✅ — matriz de severidad pendiente de validar contra catálogo real de categorías |
| consumer-and-commercial/* (3 archivos + raw) | ✅ |
| payments-tax/* (4 archivos + raw) | ✅ — condicionado a PAY-Q1/PAY-Q2 (`BLOCKING`) |
| intellectual-property/* (4 archivos) | ✅ |
| security/* (4 archivos) | ✅ |
| vendors-and-transfers/* (2 archivos) | ✅ — 2 preguntas `BLOCKING` heredadas (región DB, DPAs firmados) |
| employment-and-platform-work/* (2 archivos) | ✅ — condicionado a EMP-Q1 (`BLOCKING`) |
| accessibility-and-content/* (3 archivos) | ✅ |
| code-audit/* (1 archivo) | ✅ |
| legal-documents/* (18 archivos) | ⚖️ **borradores completos, ninguno publicable sin revisión legal local y sin resolver los 7 bloqueadores de `checklists/00-pre-launch-blocking-checklist.md`** |
| checklists/* (2 archivos) | ✅ |
| appendices/quality-control-report.md | ✅ |

## Qué falta para que esto sea publicable (no solo "completo como investigación")

Completar las 16 fases del encargo no equivale a poder publicar el paquete legal. Antes de retirar la marca de "borrador" de cualquier archivo en `legal-documents/`:

1. Resolver los 7 bloqueadores de `checklists/00-pre-launch-blocking-checklist.md`.
2. Verificar contra texto oficial las citas legislativas marcadas como "no verificadas independientemente" en varios documentos (Ley 10/2025 España, AB 2863 California, Disposición 377/2026 Argentina, entre otras — ver `appendices/quality-control-report.md` §2).
3. Contratar la revisión de un abogado habilitado en cada una de las 5 jurisdicciones.

Este README se actualiza cada vez que se resuelva un bloqueador material o se publique una versión revisada de `legal-documents/`.
