# 14 — Política interna de respuesta a incidentes y notificación de brechas

**Audiencia:** interna (Ingeniería, Legal, Dirección, Soporte) — **no es un documento público**.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador.
**Estado:** 🟡 borrador — operacionaliza `security/incident-response-legal-playbook.md` y `privacy/breach-notification-protocol.md` en un procedimiento con roles asignables. No reinvestiga plazos ya confirmados.

## 0. Base de este documento

Este documento traduce a formato de política interna el árbol de decisión ya construido en `security/incident-response-legal-playbook.md` §1. Si ese documento cambia, este debe actualizarse en la misma sesión de trabajo — no debe haber dos versiones contradictorias del mismo procedimiento.

## 1. Procedimiento paso a paso

| Paso | Acción | Responsable (propuesto) | Plazo |
|---|---|---|---|
| 1. Detección | Cualquier persona interna o externa reporta un posible incidente | Cualquiera → escala a Responsable de Triage | Inmediato |
| 2. Triage | Determinar si constituye un incidente de seguridad con datos personales involucrados | `[[DECISION REQUIRED: asignar Responsable de Triage — IR-Q1, BLOCKING]]` | Mismo día hábil |
| 3. Contención inmediata | Revocar credenciales/tokens comprometidos, aislar el sistema afectado, **preservar evidencia antes de remediar** | Ingeniería | Inmediato tras confirmar el incidente |
| 4. Evaluación de riesgo | Determinar si hay riesgo para los derechos de las personas afectadas (criterio ya confirmado por país en `privacy/breach-notification-protocol.md` §1) | `[[DECISION REQUIRED: Responsable de decisión legal — IR-Q1]]` | Dentro de las primeras 24-48 horas para no comprometer el plazo de 72h |
| 5. Clasificación de jurisdicción(es) afectada(s) | Determinar qué usuarios/países están en los datos comprometidos | Legal + Ingeniería | Junto con el paso 4 |
| 6. Notificación a autoridad | Aplicar el plazo más corto del conjunto de jurisdicciones afectadas (regla del estándar más protector, ya adoptada) | Legal | **72 horas** si hay Uruguay/Argentina/UE afectados (el más exigente); 30 días si es únicamente California |
| 7. Notificación a afectados (si el riesgo lo exige) | Usar plantilla — ver §3 | Legal + Comunicación | Según el plazo aplicable de la autoridad correspondiente |
| 8. Postmortem y cierre | Registrar causa raíz, cronología, decisiones, evidencia conservada, medidas correctivas | Responsable de Triage + Ingeniería | Dentro de los 15 días posteriores al cierre del incidente |

## 2. Tabla de plazos por jurisdicción (referencia directa — no reinvestigar)

Ver `privacy/breach-notification-protocol.md` §1 para la tabla completa con fuentes. Resumen operativo:

- Uruguay / Argentina / España-UE → **72 horas** a la autoridad desde que se tiene conocimiento/certeza razonable.
- California → **30 días calendario** a residentes; **15 días** al Attorney General si son >500 residentes.
- Chile → régimen aún no vigente (Ley 21.719 entra en vigor 2026-12-01); `[[DECISION REQUIRED: confirmar régimen vigente bajo la ley actual — IR-Q3, repite RIGHTS-Q3]]`.

## 3. Plantilla de notificación (borrador mínimo — requiere completar campos)

**A la autoridad de protección de datos competente:**

> Se notifica un incidente de seguridad detectado el [FECHA] a las [HORA]. Afecta a [NÚMERO/CATEGORÍA] de personas en [PAÍS(ES)]. Los datos involucrados son [CATEGORÍAS DE DATOS]. Las medidas de contención tomadas fueron [DESCRIPCIÓN]. El análisis de riesgo preliminar indica [RESULTADO]. Contacto para seguimiento: [RESPONSABLE].

**A los usuarios afectados (si el riesgo lo exige):**

> [[DECISION REQUIRED: redactar plantilla de cara al usuario — depende del tono de marca y de si Legal aprueba el nivel de detalle a comunicar]]

## 4. Evidencia mínima a conservar por incidente

1. Fecha y hora exacta en que se tomó conocimiento.
2. Sistemas/datos afectados y de qué usuarios (por país).
3. Acciones de contención y cuándo se tomaron.
4. El análisis de riesgo, incluso si la conclusión es "no notificar".
5. Copia de cualquier notificación enviada.

## 5. Roles pendientes de asignación (BLOCKING)

| Rol | ¿Asignado? |
|---|---|
| Responsable de triage | `[[DECISION REQUIRED]]` |
| Responsable de contención técnica | `[[DECISION REQUIRED]]` |
| Responsable de decisión legal (notificar o no) | `[[DECISION REQUIRED]]` |
| Responsable de redactar/enviar notificaciones | `[[DECISION REQUIRED]]` |

Este documento **no puede operar** sin resolver esta tabla — es la misma brecha ya señalada como `BLOCKING` en `security/incident-response-legal-playbook.md` §2.

## 6. Dependencias técnicas

No hay evidencia en el repo de SIEM, monitoreo/alertas o plan de respuesta a incidentes ya implementado (`security/security-and-privacy-controls-gap.md` §5). Este documento describe el proceso que Hireeo **debería** tener, no uno que ya opera. No comunicar a inversores/auditores/clientes que existe un proceso de detección operativo sin esta confirmación.

## 7. Revisión por abogado local pendiente

Los plazos usados aquí ya están verificados en `privacy/breach-notification-protocol.md`. Este documento no puede considerarse una política operativa real hasta que Dirección asigne los roles de §5 e Ingeniería confirme las capacidades de detección de §6.
