# 11 — Aviso de Seguridad y Divulgación Responsable de Vulnerabilidades (borrador)

- **Audiencia:** investigadores de seguridad, público general.
- **Cobertura:** global.
- **Versión:** v0.1 — borrador básico. `[[DECISION REQUIRED: alinear con security/responsible-disclosure-policy.md cuando esté disponible]]` — a la fecha de redacción de este documento, el playbook interno de seguridad existente es `security/security-and-privacy-controls-gap.md` e `security/incident-response-legal-playbook.md`, pero no hay todavía una política de divulgación responsable dedicada; este aviso público se redactó de forma autónoma y debe revisarse contra esa política interna en cuanto exista.
- **Fecha de vigencia propuesta:** condicionada a que exista un canal real de recepción de reportes de seguridad.
- **Hechos que requieren confirmación:** si existe hoy algún canal (aunque sea informal) para que un investigador reporte una vulnerabilidad; quién internamente triaria esos reportes.

> **Aviso.** Borrador básico redactado sin poder confirmar contra una política interna de divulgación responsable ya aprobada — no existía al momento de escribir este documento. Requiere alineación posterior y revisión legal antes de publicarse.

---

## 1. Cómo reportar una vulnerabilidad

`[[DECISION REQUIRED]]` Canal a implementar. Propuesta provisional: correo dedicado (ej. `security@hireeo.app`) hasta que exista un programa formal.

Al reportar, se solicita incluir:

- Descripción de la vulnerabilidad y pasos para reproducirla.
- Impacto potencial (qué datos o funciones se verían afectados).
- Si es posible, una prueba de concepto no destructiva.

## 2. Qué NO hacer al investigar (reglas de buena fe)

- No acceder, modificar ni eliminar datos de otros usuarios.
- No ejecutar pruebas que puedan degradar el servicio para otros usuarios (sin ataques de denegación de servicio).
- No divulgar públicamente la vulnerabilidad antes de que Hireeo confirme su corrección o antes de un plazo razonable acordado (`[[DECISION REQUIRED]]`: definir plazo de "coordinated disclosure", propuesta habitual en la industria: 90 días).

## 3. Compromiso de Hireeo

`[[DECISION REQUIRED]]` — no se puede prometer aquí un plazo de respuesta específico sin que el equipo de seguridad confirme que puede operarlo. Se recomienda, como mínimo:

- Confirmar recepción del reporte.
- Informar cuándo se ha corregido o por qué no se considera una vulnerabilidad.
- No iniciar acciones legales contra un investigador que reporte de buena fe y respete las reglas de §2 (política de "puerto seguro" para investigadores, buena práctica estándar de la industria).

## 4. Relación con el playbook interno de incidentes

Este aviso público es la cara visible del proceso; el manejo interno (triage, contención, notificación a autoridades si aplica) se rige por `security/incident-response-legal-playbook.md`, ya existente, y por las obligaciones de notificación de brechas ya confirmadas en `privacy/breach-notification-protocol.md` (Fase 4) — no se repiten aquí.

## 5. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Implementar el canal de reporte antes de publicar este aviso.
- `[[DECISION REQUIRED]]` Definir plazo de coordinated disclosure.
- `[[DECISION REQUIRED]]` Alinear este documento con `security/responsible-disclosure-policy.md` en cuanto exista una versión interna aprobada.

## 6. Revisión por abogado local pendiente

El "puerto seguro" para investigadores de buena fe (§3) debe redactarse con cuidado para no crear una exención de responsabilidad más amplia de la que Legal esté dispuesto a otorgar. Requiere revisión antes de publicarse.
