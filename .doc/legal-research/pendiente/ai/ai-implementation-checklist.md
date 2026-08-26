# ai/ai-implementation-checklist — Checklist de implementación de IA (Fase 6.2)

- **Fecha:** 2026-07-23 · **Versión:** 0.1
- **Insumos:** todos los documentos de `ai/`, `country-analysis/spain-eu.md`, archivos US, `code-audit/00-repository-inventory.md`.

> Checklist **ejecutable y priorizado**, con **criterio de aceptación verificable**. `[[DECISION REQUIRED]]` marca lo que exige decisión de negocio. Prioridades: **P0** (bloqueador de lanzamiento), **P1**, **P2**, **P3/continuo**.

---

## Leyenda de estado de obligación
- **MANDATORY NOW** — exigible hoy.
- **MANDATORY BY DATE** — exigible en fecha futura conocida.
- **CONDITIONAL** — se activa por un hecho (país, pago, biometría, cambio de finalidad).
- **RECOMMENDED** — buena práctica / preparación enterprise.

---

## P0 — Bloqueadores de lanzamiento

| ID | Acción | Norma / fuente | Estado obligación | Criterio de aceptación | Propietario |
|---|---|---|---|---|---|
| **AI-CHK-01** | Implementar **aviso de interacción con IA** en agente (A) y clasificadores (B, C, F) | AI Act art. 50.1 (2026-08-02); Utah GenAI (vigente); FTC §5 | MANDATORY BY 2026-08-02 (UE) / NOW (Utah) | Test E2E: la UI del chat muestra "Asistente con IA" antes del primer mensaje, de forma persistente y en todos los países | Product + Eng |
| **AI-CHK-02** | Confirmar **contrato/DPA con Google** (entrenamiento, región, subprocesadores) y qué producto se usa (Vertex vs. AI Studio) | GDPR 28/44-49; AI Act GPAI; 25.326/18.331 | MANDATORY NOW | DPA firmado adjunto; cláusula de no-entrenamiento **o** decisión informada; SCC+TIA documentados | Legal + Eng · **[[DECISION REQUIRED]]** |
| **AI-CHK-03** | **Confirmación por código** antes de que el agente cree `ServiceRequest`/`Quote` (no depender del prompt) | GDPR art. 22; Disp. AAIP 2/2023; consumo | MANDATORY NOW | La tool no escribe sin token/paso de confirmación de UI; test que verifica que sin confirmación no se crea registro | Eng · **[[DECISION REQUIRED — diseño UX de confirmación]]** |
| **AI-CHK-04** | Atar `userId` al **JWT del solicitante** en la tool de escritura (no confiar en el DTO) | GDPR 32; IDOR (`code-audit` §5.1) | MANDATORY NOW | La tool ignora `userId` del payload y usa el del token; test de IDOR | Eng |
| **AI-CHK-05** | **Autenticar + throttle** las Server Actions de IA del frontend (C–F) | Seguridad; `code-audit` §5.2 [HIGH] | MANDATORY NOW | Llamada sin sesión válida es rechazada; rate limit por usuario; verificado en test | Eng |
| **AI-CHK-06** | **Minimización** de PII antes de enviar al modelo (A–D) | GDPR 5.1.c; 18.331; 25.326 | MANDATORY NOW | Capa de redacción/límite documentada; no se envía historial completo sin filtrar | Eng + Privacy · **[[DECISION REQUIRED — alcance]]** |

---

## P1 — Antes del lanzamiento (alta prioridad)

| ID | Acción | Norma / fuente | Estado | Criterio de aceptación | Propietario |
|---|---|---|---|---|---|
| **AI-CHK-07** | Activar `safetySettings` de Gemini + **moderación de output** de texto libre (A, D) | Consumo; FTC §5; DSA | MANDATORY NOW (UE) / RECOMMENDED | Todas las llamadas fijan `safetySettings`; output de texto libre pasa filtro antes de mostrar | Eng |
| **AI-CHK-08** | Defensa **anti prompt injection**: delimitar input, instrucciones defensivas, validar salida contra fuentes reales (extender patrón de B/C a A, F) | Seguridad (GDPR 32) | MANDATORY NOW | Suite de pruebas de injection documentada; el agente no ejecuta instrucciones embebidas en el input | Eng |
| **AI-CHK-09** | **Marcado de contenido IA o revisión editorial** de la descripción SEO (E) | AI Act 50.2 (2026-08-02); FTC §5; consumo | MANDATORY BY 2026-08-02 / NOW (engaño) | Cada descripción generada lleva badge de IA **o** requiere edición del prestador; prompt sin afirmaciones no verificables | Product + Legal · **[[DECISION REQUIRED]]** |
| **AI-CHK-10** | **Logging minimizado** de tool calls que escriben (A) | Accountability AI Act; responsabilidad proactiva LatAm | RECOMMENDED (fuerte) | Cada `create` de la IA queda registrado (userId, timestamp, params) sin contenido sensible | Eng · **[[DECISION REQUIRED — retención]]** |
| **AI-CHK-11** | Canal de **reporte de incidentes de IA** (interno + botón de usuario) | AI Act (buena práctica); DSA notice-and-action | MANDATORY (UE, vía DSA) / RECOMMENDED | Buzón interno + botón funcional que genera ticket | Trust & Safety · **[[DECISION REQUIRED]]** |
| **AI-CHK-12** | **DPIA** que cubra el Sistema A y el flujo de escritura | GDPR art. 35 | CONDITIONAL (muy probable) | DPIA documentada y firmada por DPO antes de `/es` | DPO |
| **AI-CHK-13** | Pruebas de **exactitud, alucinación, sesgo, robustez multilingüe** con umbrales | Gobernanza desplegador; AAIP; Estrategia UY | RECOMMENDED (fuerte) | Resultados registrados en AI Decision Log; umbrales definidos | Eng + AI Risk Owner |

---

## P2 — Consolidación y preparación

| ID | Acción | Norma / fuente | Estado | Criterio de aceptación | Propietario |
|---|---|---|---|---|---|
| **AI-CHK-14** | **Alfabetización en IA** del equipo | AI Act art. 4 (VIGENTE 2025-02-02) | MANDATORY NOW | Registro de formación con fecha/asistentes | People + Eng |
| **AI-CHK-15** | Designar **AI Risk Owner** y **AI Decision Log** | Gobernanza | MANDATORY NOW | Persona nombrada; registro operativo | Dirección · **[[DECISION REQUIRED]]** |
| **AI-CHK-16** | **Consolidar los 3 SDKs** y centralizar la API key | Seguridad/gobernanza | RECOMMENDED | Un solo SDK/punto de acceso a Gemini; key desde almacén cifrado, no `process.env` | Eng |
| **AI-CHK-17** | **Versionado de prompts** + fijación de versión de modelo + plan de rollback | Gobernanza de cambios | RECOMMENDED | Prompts versionados con changelog; procedimiento de rollback probado | Eng |
| **AI-CHK-18** | Quitar `// @ts-nocheck` de la ruta que escribe en DB | Calidad/seguridad | RECOMMENDED | `service-requests.tool.ts` sin `@ts-nocheck` o `create` aislado en service tipado | Eng |
| **AI-CHK-19** | **Política de IA** pública + condiciones de uso de funciones de IA | AI Act 50; GDPR 13-14; consumo | MANDATORY (UE) | Documento publicado y enlazado (Fase 14) | Legal · **[[DECISION REQUIRED — dep. Q1 entidad]]** |
| **AI-CHK-20** | Advertencia en UI de **no compartir datos sensibles** en el chat | FTC (buena práctica); minimización | RECOMMENDED | Texto presente en la UI del agente | Product |

---

## P3 — Continuo / condicional

| ID | Acción | Disparador | Estado |
|---|---|---|---|
| **AI-CHK-21** | Reevaluar clasificación si la IA pasa a **decidir acceso económico** (ranking/suspensión/precio determinantes) | Cambio de finalidad (M4) | CONDITIONAL — AI Act Anexo III; Colorado AI Act; Texas TRAIGA |
| **AI-CHK-22** | Guardrail **BIPA / biometría** antes de activar KYC real con selfie | Activación de KYC | CONDITIONAL — BIPA, TX, CA |
| **AI-CHK-23** | Preparar **ADMT** (inventario, opt-out, notice) | Producto cambia + California | MANDATORY BY 2027-01-01 (si decisión significativa) |
| **AI-CHK-24** | Monitorear **leyes de IA en trámite** (Chile Boletín 16.821-19; ley IA Uruguay; guías AAIP) | Aprobación/vigencia | CONDITIONAL — reevaluar al entrar en vigor |
| **AI-CHK-25** | Revisión trimestral del inventario y clasificación de IA | Cadencia | RECOMMENDED (continuo) |

---

## Resumen de decisiones de negocio requeridas

1. **[[DECISION REQUIRED]]** Producto Google usado y términos de entrenamiento (Vertex AI vs. Gemini API/AI Studio) — **AI-CHK-02**.
2. **[[DECISION REQUIRED]]** ¿Se firma DPA/SCC con Google? — **AI-CHK-02**.
3. **[[DECISION REQUIRED]]** Diseño de la confirmación por código del Sistema A (UX) — **AI-CHK-03**.
4. **[[DECISION REQUIRED]]** Alcance de la minimización de PII enviada al modelo — **AI-CHK-06**.
5. **[[DECISION REQUIRED]]** Sistema E: marcado de IA vs. revisión editorial obligatoria — **AI-CHK-09**.
6. **[[DECISION REQUIRED]]** Política y retención de logging de IA — **AI-CHK-10**.
7. **[[DECISION REQUIRED]]** Canal/buzón y SLAs de incidentes de IA — **AI-CHK-11**.
8. **[[DECISION REQUIRED]]** Persona del AI Risk Owner y (probable) DPO — **AI-CHK-15**.
9. **[[DECISION REQUIRED]]** Aviso de IA global vs. solo `/es`+Utah — **AI-CHK-01**.

---

## Nota de trazabilidad

Cada control cita su evidencia de código en los documentos de origen (`ai-system-inventory.md` §7 registro de evidencia; `code-audit/00-repository-inventory.md` §5.2). Ningún control afirma cumplimiento actual: el estado observado es **"no implementado"** salvo los controles positivos ya señalados (throttling y `JwtAuthGuard` en los controllers backend, guardrails anti-alucinación en prompts, validación de slug contra catálogo). Requiere revisión de abogado habilitado por jurisdicción antes de cualquier publicación.
