# ai/ai-incident-response — Respuesta a incidentes de IA (Fase 6.2)

- **Fecha:** 2026-07-23 · **Versión:** 0.1
- **Insumos:** `ai-safety-security-and-misuse.md`, `ai-governance-framework.md`.
- **Relación:** complementa (no reemplaza) el playbook general de brechas de `security/` (Fase 11) y las obligaciones de notificación de datos por país.

> Etiquetas: **[OBLIGACIÓN]**, **[BUENA PRÁCTICA]**, **[[DECISION REQUIRED]]**. Este documento define el proceso; **no** envía notificaciones reales.

---

## 1. Qué cuenta como incidente de IA

| Tipo | Ejemplo en Hireeo |
|---|---|
| **Acción no autorizada del agente** | `crearBorradorSolicitud` crea registros sin confirmación del usuario (tool abuse / alucinación). |
| **Salida dañina o ilícita** | El agente (A) o `getSmartServiceSuggestion` (D) devuelve contenido ofensivo, peligroso o difamatorio. |
| **Contenido engañoso publicado** | Descripción SEO (E) con afirmaciones falsas que generan reclamo de consumo. |
| **Prompt injection exitoso** | Un usuario redirige el comportamiento del agente o extrae instrucciones. |
| **Fuga de datos vía IA** | PII enviada a Google fuera de la base/contrato; exposición por Server Action sin auth. |
| **Sesgo / discriminación** | Sugerencias sistemáticamente sesgadas de proveedores. |
| **Fallo del proveedor / cambio de modelo** | Cambio de versión de Gemini que degrada o altera el comportamiento (regresión). |
| **Abuso de cuota / DoS económico** | Explotación de Server Actions sin auth para agotar la API key. |

---

## 2. Canal de reporte

- **Interno [OBLIGACIÓN]:** canal único (p. ej. `ai-incident@` **[[DECISION REQUIRED — buzón/cola]]**) donde ingeniería, soporte y Trust & Safety reportan incidentes de IA.
- **De usuarios [OBLIGACIÓN/BUENA PRÁCTICA]:** botón "reportar respuesta de IA" en la UI del chat (enlaza con `ai-user-transparency.md` §5) y mención en la Política de IA. Debe integrarse con el mecanismo general de **notice-and-action** que hoy **falta** (`code-audit` §5.6 [HIGH]).
- **De proveedor:** suscripción a los avisos de seguridad/deprecación de Google (Enlace de proveedor, `ai-governance-framework.md` §2).

---

## 3. Flujo de respuesta

```
DETECCIÓN → TRIAGE → CONTENCIÓN → INVESTIGACIÓN → REMEDIACIÓN → NOTIFICACIÓN (si aplica) → POSTMORTEM
```

### 3.1 Triage (clasificación de severidad)
| Severidad | Criterio | Ejemplo |
|---|---|---|
| **SEV-1** | Datos personales expuestos, escritura masiva no autorizada, o daño real a usuario | Fuga de PII a tercero; creación masiva de solicitudes fraudulentas |
| **SEV-2** | Salida dañina/engañosa mostrada/publicada, injection con impacto | Contenido ofensivo del agente; descripción engañosa reclamada |
| **SEV-3** | Degradación funcional sin daño a persona | Regresión por cambio de modelo; falso positivo de clasificación |

**Objetivo de respuesta [[DECISION REQUIRED — SLAs]]:** p. ej. SEV-1 triage < 1 h; SEV-2 < 8 h; SEV-3 < 48 h.

### 3.2 Contención (acciones inmediatas disponibles)
- **Desactivar la tool de escritura** del agente (quitar `crearBorradorSolicitud` del set de tools — cambio de una línea en `ai-agents.service.ts:37`).
- **Desactivar la función de IA afectada** (feature flag / retirar el endpoint o Server Action).
- **Revocar/rotar la API key** de Gemini si hay abuso de cuota o sospecha de fuga.
- **Rollback** al prompt/modelo previo (una vez versionado — `ai-data-and-model-governance.md` §5).

### 3.3 Investigación
- Reconstruir qué ocurrió con los **logs de tool calls** (una vez implementado el logging minimizado — pendiente hoy) y los registros de `ServiceRequest`/`Quote` creados.
- Preservar evidencia (registros de DB, timestamps, `userId`), sin copiar contenido sensible innecesario a los informes.

### 3.4 Notificación (coordinar con Fase 11 y por país)
- Si el incidente de IA implica **brecha de datos personales**, se activan los deberes de notificación: **AEPD 72 h** (GDPR 33-34), y los regímenes de **Chile (19.628/21.719), Argentina (25.326/AAIP), Uruguay (18.331/URCDP)** y **breach-notice estatales de EE. UU.** — ver el playbook de `security/` y los análisis por país. **[OBLIGACIÓN condicional]**
- No hay obligación específica de notificar "incidentes de IA" como tal hoy (no somos alto riesgo bajo AI Act), pero **sí** si constituyen brecha de datos o daño al consumidor.

---

## 4. Postmortem

Para SEV-1 y SEV-2 [OBLIGACIÓN interna / accountability]:
- Informe con: qué pasó, causa raíz, sistemas afectados, datos implicados, usuarios afectados, acciones de contención y remediación, y **cambios preventivos** (control técnico añadido).
- Registrar en el **AI Decision Log** (`ai-governance-framework.md` §3).
- Revisión por el **Comité de IA**; actualizar el AI Change Review si procede.
- Sin cultura de culpa; foco en el control faltante.

---

## 5. Criterios de aceptación

| # | Requisito | Verificable |
|---|---|---|
| 1 | Canal de reporte interno definido y monitoreado | Buzón/cola existe; responsable asignado |
| 2 | Botón de reporte de IA en la UI | Funcional; genera ticket |
| 3 | Runbook de contención (desactivar tool/función, rotar key, rollback) | Documentado y probado |
| 4 | Logging de tool calls que escriben | Presente y consultable (dep. de `ai-data-and-model-governance` §2) |
| 5 | Integración con notificación de brechas | Enlazado al playbook de `security/` |
| 6 | Plantilla de postmortem | Existe; usada en SEV-1/2 |

---

## 6. Decisiones de negocio pendientes

- **[[DECISION REQUIRED]]** Buzón/cola del canal de incidentes de IA y responsable de guardia.
- **[[DECISION REQUIRED]]** SLAs de triage por severidad.
- **[[DECISION REQUIRED]]** Alcance del logging de IA (metadatos vs. contenido) y su retención — cruza con minimización.
