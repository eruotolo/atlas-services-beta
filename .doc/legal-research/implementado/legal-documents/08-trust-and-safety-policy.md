# 08 — Política de Confianza y Seguridad: reportes, moderación y apelaciones (borrador)

- **Audiencia:** clientes, prestadores y terceros afectados por contenido en Hireeo.
- **Cobertura:** global, con obligaciones reforzadas en España/UE (DSA arts. 16-17, 20-22, ya confirmadas en `marketplace/01` §5).
- **Versión:** v0.1 — borrador.
- **Fecha de vigencia propuesta:** **no publicar hasta que exista al menos un canal de reporte real** — ver advertencia de §0.
- **Dependencias técnicas:** canal de reporte de contenido/comportamiento abusivo (hoy sin evidencia de existir, `marketplace/02-trust-and-safety-program.md` §0); registro de decisiones de moderación más allá de `Rating.status`.

> **Aviso.** Este documento describe un **diseño propuesto**, no un proceso ya operativo. El propio encargo de esta auditoría advierte explícitamente: *"diseñar un notice-and-action visible, accesible y auditable, sin prometer revisión inmediata si el equipo no la puede operar"*. Este borrador respeta esa advertencia — no promete plazos que Trust & Safety no pueda cumplir hoy.

---

## 0. Estado real (léase antes de publicar)

**Hecho confirmado (`marketplace/01` §5 y `marketplace/02` §0):** hoy no existe un canal formal de notice-and-action ni un registro de decisiones de moderación documentado en el repositorio, más allá de `Rating.status` (PENDING→ACTIVE) e `IntegrationAuditLog`. Todo lo que sigue en este documento es una **propuesta de diseño**, condicionada a que se implemente antes de publicarse como compromiso público.

## 1. Cómo reportar contenido o comportamiento

`[[DECISION REQUIRED]]` Canal a implementar — propuesta: un enlace/botón de "Reportar" visible en cada perfil, servicio, reseña y conversación, que dirija a un formulario o a un correo dedicado.

Al recibir un reporte, Hireeo:

1. Envía una confirmación de recepción al denunciante.
2. Evalúa si el contenido encaja en la Política de Uso Aceptable (`07-acceptable-use-policy.md`).
3. Si corresponde, retira o restringe el contenido y **comunica el motivo por escrito** a quien lo publicó (exigencia del art. 17 DSA para la UE, buena práctica para el resto — ya confirmado en `marketplace/01` §5).
4. Registra la decisión (quién, cuándo, motivo, evidencia) — necesario para poder demostrar diligencia ante un reclamo de consumo o una autoridad.

## 2. Plazos

`[[DECISION REQUIRED]]` **No se fija aquí un plazo público de respuesta** hasta que Trust & Safety confirme que puede operarlo de forma sostenida. Un SLA interno (propuesto en `marketplace/02` §2: 5 días hábiles) puede usarse como objetivo operativo, pero no debe publicarse como garantía al usuario hasta que el equipo lo pueda cumplir consistentemente.

## 3. Apelaciones

Quien reciba una decisión de moderación en su contra puede solicitar revisión dentro de la plataforma antes de escalar a una autoridad o vía judicial (mecanismo alineado con el art. 20 DSA para la UE, buena práctica para el resto). `[[DECISION REQUIRED]]`: definir el canal y responsable interno de resolver apelaciones.

## 4. Trusted flaggers (solo si aplica en la UE)

Ya confirmado en `marketplace/03-minors-content-and-mandatory-reporting.md` §4: el art. 22 del DSA (priorizar reportes de "trusted flaggers" reconocidos) aplica a cualquier proveedor, sin importar el tamaño — no está condicionado a ser una Very Large Online Platform. Si un trusted flagger designado reporta contenido, Hireeo debe priorizar su revisión.

## 5. Qué reportamos a autoridades

- **Contenido de explotación de menores (CSAM):** ver el tratamiento diferenciado por país ya confirmado en `marketplace/03-minors-content-and-mandatory-reporting.md` §1 — en EE.UU. existe obligación legal de reportar a NCMEC; en las demás jurisdicciones de lanzamiento, el deber es de colaboración general con la autoridad, no de reporte proactivo obligatorio a la fecha de este borrador.
- **Contenido manifiestamente ilícito** notificado por autoridad competente, conforme al régimen de cada país ya descrito en `marketplace/01` §5.

## 6. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Implementar el canal de reporte antes de publicar esta política.
- `[[DECISION REQUIRED]]` Confirmar y comprometerse a un plazo de respuesta operable antes de publicarlo como SLA.
- `[[DECISION REQUIRED]]` Definir el responsable interno de moderación y apelaciones (rol, no persona).

## 7. Revisión por abogado local pendiente

No publicar esta política prometiendo un proceso que hoy no existe. Cada plazo y mecanismo debe confirmarse operativo antes de publicación, y el texto final debe ser revisado por abogado local en cuanto a la exigencia DSA (UE) y los deberes generales de retirada (AR/CL/UY).
