# 10 — Política de Propiedad Intelectual, Copyright, DMCA/Notice-and-Takedown (borrador)

- **Audiencia:** titulares de derechos de autor, usuarios de Hireeo (clientes y prestadores), público general.
- **Cobertura:** global, con proceso específico DMCA para nexo con EE.UU. y alineación DSA para la UE.
- **Versión:** v0.1 — borrador.
- **Fecha de vigencia propuesta:** **no publicar hasta implementar el canal de notificación** — hoy no existe (ver §0).
- **Dependencias técnicas:** canal público de denuncia de infracción (hoy solo existe texto en panel admin, no un canal para terceros — `intellectual-property/04-copyright-dmca-and-trademark.md` §A.1).
- **Hechos que requieren confirmación:** si Hireeo designará un agente DMCA ante el U.S. Copyright Office (`[[DECISION REQUIRED]]`, condicionado a nexo con EE.UU.).

> **Aviso.** Basado directamente en `intellectual-property/04-copyright-dmca-and-trademark.md` (Fase 9, ya investigado) — no se reinvestiga el marco legal, se traduce a política pública.

---

## 0. Estado real (léase antes de publicar)

**Hecho confirmado:** no existe hoy ningún mecanismo de reporte de contenido infractor accesible al público — ni para reseñas, ni servicios, ni imágenes. La única mención relacionada es un texto en el panel de administración de reseñas, que no es un canal para que terceros afectados denuncien. Existe un correo de contacto legal (`legal@hireeo.app`) pero no un procedimiento estructurado.

## 1. Cómo reportar una infracción de copyright

`[[DECISION REQUIRED]]` Canal a implementar. Mientras no exista un formulario dedicado, el canal provisional es `legal@hireeo.app`. La notificación debe incluir, como mínimo:

- Identificación de la obra protegida.
- Ubicación exacta del contenido infractor en Hireeo (URL/perfil/servicio).
- Datos de contacto del denunciante.
- Declaración de buena fe de que el uso no está autorizado.
- Firma (física o electrónica).

## 2. Qué hace Hireeo al recibir una notificación válida

1. Retira o restringe el acceso al contenido de forma expedita.
2. Notifica a quien publicó el contenido, con posibilidad de **contra-notificación** si considera que el retiro fue improcedente.
3. Aplica una política de **infractor reincidente**: `[[DECISION REQUIRED]]` — definir el umbral (ej. número de retiros válidos) que activa la suspensión de una cuenta.
4. Conserva evidencia de la notificación y de la acción tomada.

## 3. Marco legal por país (síntesis — no repite la investigación de `intellectual-property/04`)

| País | Régimen | Nota |
|---|---|---|
| Estados Unidos | DMCA §512 (17 U.S.C.) — puerto seguro condicionado a designar y registrar un **agente DMCA** ante el U.S. Copyright Office | **Hoy no hay agente designado — sin puerto seguro DMCA activo.** `[[DECISION REQUIRED]]`: designar agente si hay nexo con EE.UU. |
| España / UE | DSA (Reg. UE 2022/2065) — exige notice-and-action, motivación de decisiones, punto de contacto | Ya analizado en `country-analysis/spain-eu.md` |
| Chile | Ley 20.435 (procedimiento judicial de bajada) + Ley 17.336 | Bajada con efecto de puerto seguro requiere orden judicial; conviene igualmente un canal voluntario |
| Argentina | Sin régimen legal específico; jurisprudencia ("Rodríguez c/ Google") exige notificación fehaciente | Canal de notificación fehaciente recomendado |
| Uruguay | Ley 9.739 de derecho de autor; sin régimen específico de puerto seguro | Canal + respuesta diligente recomendados |

## 4. Marcas

- "Hireeo" se usa comercialmente pero **no hay confirmación en el repositorio de registro marcario** en ninguna de las 5 jurisdicciones (`intellectual-property/04` §B.1). `[[DECISION REQUIRED]]`: encargar búsqueda de disponibilidad y registro antes de afirmar derechos exclusivos sobre la marca en esta política.
- Los prestadores pueden hacer uso nominativo legítimo de marcas de terceros al describir su servicio (ej. "reparo electrodomésticos marca X"), pero no pueden usarlas de forma engañosa ni usar la marca "Hireeo" sin autorización.

## 5. Suplantación de prestadores — advertencia

Ya identificado como riesgo real en `intellectual-property/04` §B.3: la ausencia de verificación de email y KYC real facilita la creación de perfiles falsos. Esta política de IP no resuelve ese riesgo — se coordina con Trust & Safety (`08-trust-and-safety-policy.md`) y con la verificación de credenciales (`07-acceptable-use-policy.md` §1.2).

## 6. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Implementar el canal de notificación antes de publicar.
- `[[DECISION REQUIRED]]` Designar agente DMCA si hay nexo con EE.UU.
- `[[DECISION REQUIRED]]` Definir umbral de infractor reincidente.
- `[[DECISION REQUIRED]]` Encargar clearance y registro de la marca "Hireeo".

## 7. Revisión por abogado local pendiente

Los regímenes de puerto seguro (DMCA/DSA/judicial CL/fehaciente AR-UY) deben validarse por abogado local antes de publicar. No afirmar puerto seguro DMCA sin agente designado.
