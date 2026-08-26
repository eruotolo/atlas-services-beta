# Playbook legal de respuesta a incidentes (Fase 11)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador operativo — **propuesta de proceso, no un proceso ya implementado**. Usa los plazos ya confirmados en `privacy/breach-notification-protocol.md` (no se reinvestigan aquí) y los hechos de código ya confirmados en `security/security-and-privacy-controls-gap.md` §5 y `marketplace/01-platform-role-and-liability-analysis.md` (H2, H5).

## 0. Punto de partida — qué existe hoy y qué no (hecho confirmado)

`security/security-and-privacy-controls-gap.md` §5 ya concluyó, sobre evidencia de código:

| Capacidad necesaria para operar este playbook | Estado confirmado |
|---|---|
| Monitoreo/alertas/SIEM | ❌ **No confirmado en el código** — puede existir en infraestructura de producción no auditada, pero no hay evidencia |
| Backups/recuperación | ❌ **No confirmado en el código** |
| Plan de respuesta a incidentes | ❌ **No confirmado en el repo** |
| Registro de auditoría de secretos/integraciones | ✅ `IntegrationAuditLog` en toda mutación (`integrations.service.ts`) |
| Verificación de firma en webhooks (backend) | ✅ Stripe/MercadoPago/KYC con HMAC timing-safe fail-closed |
| Verificación de firma en webhooks (frontend) | ❌ MercadoPago frontend sin verificación — `webhooks/mercadopago/route.ts:14-61` |

**Consecuencia directa:** este playbook describe el proceso que Hireeo **debería** tener. No se debe comunicar a clientes/inversores/auditores que existe un proceso de detección de incidentes operativo — eso sería una afirmación no respaldada por evidencia, exactamente lo que el encargo de este expediente prohíbe.

## 1. Árbol de decisión — de la detección a la notificación

```
DETECCIÓN
  │  (hoy: sin SIEM confirmado → depende de reporte manual, log de errores,
  │   IntegrationAuditLog, o aviso de un tercero/usuario/PSP)
  ▼
TRIAGE (¿es un incidente de seguridad con datos personales involucrados?)
  │
  ├─ NO → registrar como incidente técnico sin obligación de notificación de
  │        privacidad; continuar con gestión técnica normal.
  │
  └─ SÍ → continuar
        ▼
CONTENCIÓN INMEDIATA
  │  Revocar credenciales/tokens comprometidos, aislar el sistema afectado,
  │  preservar evidencia (logs, capturas) ANTES de remediar — la evidencia
  │  se necesita tanto para el análisis como para demostrar diligencia ante
  │  una autoridad.
  ▼
EVALUACIÓN DE RIESGO (¿hay riesgo para los derechos de las personas afectadas?)
  │  Criterio ya confirmado por jurisdicción en `breach-notification-protocol.md`:
  │  UY/AR/UE = "riesgo para derechos" (sin umbral numérico);
  │  CL = mismo criterio, pero norma aún no vigente (2026-12-01);
  │  US-CA = cualquier brecha de información personal no encriptada.
  │
  ├─ Riesgo improbable (documentar el análisis, con fecha y responsable) →
  │   no se notifica a autoridad, pero se conserva el registro del análisis.
  │
  └─ Riesgo confirmado o no descartable → continuar
        ▼
CLASIFICAR JURISDICCIÓN(ES) AFECTADA(S)
  │  ¿Qué usuarios/países están en los datos comprometidos? Determina qué
  │  plazo de la tabla de `breach-notification-protocol.md` §1 aplica.
        ▼
NOTIFICACIÓN — usando los plazos YA CONFIRMADOS (no reinvestigar):
  │
  ├─ Uruguay/Argentina/UE afectados → reloj de 72 horas desde que se tiene
  │   conocimiento/certeza razonable. Es el plazo más exigente del conjunto.
  │
  ├─ California (EE.UU.) afectada → 30 días calendario a residentes;
  │   15 días al Attorney General si son >500 residentes.
  │
  ├─ Chile afectada → régimen de Ley 21.719 aún no vigente (2026-12-01);
  │   hoy aplica el régimen general de la ley de protección al consumidor/
  │   datos previa — **requiere confirmar cuál es el régimen actualmente
  │   vigente antes de fijar un plazo**, ver `RIGHTS-Q3` en
  │   `privacy/rights-request-protocol.md` (misma brecha de información).
  │
  └─ Múltiples jurisdicciones simultáneamente → aplicar el plazo más corto
      del conjunto afectado (regla de estándar más protector ya adoptada
      en `breach-notification-protocol.md` §2).
        ▼
NOTIFICACIÓN A AFECTADOS (si el riesgo lo exige)
  │  Plantilla pendiente de redactar en Fase 14 (`legal-documents/`).
        ▼
POSTMORTEM Y CIERRE
     Registrar: causa raíz, cronología, quién decidió qué y cuándo,
     evidencia conservada, medidas correctivas, y si se notificó o no
     (con la justificación del análisis de riesgo).
```

## 2. Roles — propuesta (no asignados hoy)

| Rol | Responsabilidad en el playbook | ¿Asignado hoy? |
|---|---|---|
| Detector/reportante | Cualquier persona (interna o externa) que identifica el incidente | N/A — no hay canal formal, ver `responsible-disclosure-policy.md` |
| Responsable de triage | Decide si el hecho constituye un incidente de datos personales | ❌ No confirmado — **BLOCKING** para poder operar el playbook |
| Responsable de contención técnica | Ingeniería — revoca accesos, aísla sistemas | ❌ No confirmado quién específicamente |
| Responsable de decisión legal (notificar o no, a quién) | Legal/Dirección | ❌ No confirmado |
| Responsable de redactar y enviar la notificación | Legal + Comunicación | ❌ No confirmado |

## 3. Evidencia mínima a conservar por incidente (para poder demostrar diligencia)

1. Fecha y hora exacta en que se tomó conocimiento (marca el inicio del plazo de 72 horas donde aplique).
2. Qué sistemas/datos se vieron afectados y de qué usuarios (por país).
3. Las acciones de contención tomadas y cuándo.
4. El análisis de riesgo (aunque la conclusión sea "no notificar").
5. Copia de cualquier notificación enviada a autoridad o a afectados.

## 4. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| IR-Q1 | ¿Quién sería el responsable de triage/decisión legal si ocurriera un incidente hoy? | `BLOCKING` — sin esto, el playbook no tiene dueño |
| IR-Q2 | ¿Existe algún mecanismo de monitoreo/alertas en la infraestructura de producción (fuera del código, ej. en Vercel/proveedor de base de datos) no visible en este repo? | `HIGH` |
| IR-Q3 | Confirmar el régimen de brecha de datos vigente en Chile mientras la Ley 21.719 no entra en vigor (repite `RIGHTS-Q3`) | `HIGH` |

## 5. Revisión por abogado local pendiente

Los plazos usados en este playbook ya están verificados en `privacy/breach-notification-protocol.md`. El diseño del proceso (§1-§3) es una propuesta operativa que requiere que Ingeniería confirme capacidades reales de detección y que Dirección asigne los roles de §2 antes de que este documento pueda considerarse un playbook operativo real, y no solo un borrador.
