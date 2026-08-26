# 12 — Aviso de Accesibilidad y Procedimiento de Feedback (borrador)

- **Audiencia:** usuarios de Hireeo, especialmente en España/UE (obligación EAA vigente).
- **Cobertura:** global; obligación de publicación vigente en España/UE desde 2025-06-28 (European Accessibility Act, Ley 11/2023 — ya confirmada en `accessibility-and-content/01-accessibility-audit-and-wcag-gap.md` §1 y §4).
- **Versión:** v0.1 — borrador.
- **Fecha de vigencia propuesta:** **no antes de ejecutar el audit runtime** descrito en §0 — publicar una declaración de conformidad sin ese audit sería inventar evidencia, algo que el propio encargo de esta auditoría prohíbe expresamente.
- **Dependencias técnicas:** audit automatizado (axe-core/Lighthouse) + prueba manual con teclado/lector de pantalla, todavía no ejecutado (`accessibility-and-content/01` §0).
- **Hechos que requieren confirmación:** nivel de conformidad real una vez ejecutado el audit; si CL/AR/UY tienen obligación de accesibilidad web B2C exigible (marcado como supuesto pendiente en `accessibility-and-content/01` §6).

> **Aviso.** Borrador de investigación. **No declara conformidad WCAG** porque no se ha ejecutado ningún audit real — solo inspección estática del código (ver limitación metodológica en `accessibility-and-content/01` §0).

---

## 0. Por qué este aviso es deliberadamente incompleto

`accessibility-and-content/01-accessibility-audit-and-wcag-gap.md` identificó, por inspección estática de código (sin ejecutar herramientas de auditoría real ni pruebas con lector de pantalla), al menos una barrera **CRITICAL** (etiquetas de formulario no asociadas programáticamente, sistémica en todo el proyecto vía el componente `Field`) y varias **HIGH** (errores de formulario no anunciados a tecnología asistiva; chat sin etiquetas accesibles). Publicar una declaración de accesibilidad que afirme conformidad —total o parcial— sin corregir estos hallazgos y sin ejecutar el audit runtime sería una afirmación no sustentada. Este documento, por tanto, se limita a un compromiso de transparencia y a un canal de feedback, no a una declaración de conformidad.

## 1. Compromiso de accesibilidad (texto propuesto, sin declarar conformidad)

> Hireeo trabaja para que su servicio sea accesible para el mayor número de personas posible, incluyendo personas con discapacidad. Estamos en proceso de evaluar y mejorar la accesibilidad de nuestra plataforma conforme al estándar WCAG 2.2 AA. `[[DECISION REQUIRED: completar con el nivel de conformidad real una vez ejecutado el audit runtime — accessibility-and-content/01 §6]]`

## 2. Limitaciones conocidas (a completar tras el audit runtime)

`[[DECISION REQUIRED]]` Esta sección debe listar las barreras conocidas no corregidas al momento de publicar. Con base en los hallazgos ya identificados (sujetos a confirmación por audit runtime):

- Algunos formularios pueden no anunciar correctamente las etiquetas de campo a lectores de pantalla.
- Los mensajes de error de formularios pueden no anunciarse automáticamente a tecnología asistiva.
- El chat de mensajería puede no tener todas las etiquetas accesibles necesarias.

*(Esta lista debe actualizarse — y idealmente reducirse — antes de publicación, a medida que se corrijan los hallazgos de `accessibility-and-content/01` §2.)*

## 3. Canal de feedback de accesibilidad

`[[DECISION REQUIRED]]` Canal a implementar — hoy no existe (`accessibility-and-content/01` §4, búsqueda negativa confirmada). Propuesta: formulario o correo dedicado (ej. `accesibilidad@hireeo.app`) donde cualquier usuario pueda:

- Reportar una barrera de accesibilidad específica.
- Solicitar el contenido o servicio en un formato alternativo accesible.

Hireeo debe confirmar recepción y dar seguimiento — sin prometer un plazo que Producto/Ingeniería no pueda operar todavía.

## 4. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Ejecutar el audit runtime (axe-core/Lighthouse + prueba manual) antes de fijar el texto final de §1-2.
- `[[DECISION REQUIRED]]` Implementar el canal de feedback de §3 antes de publicar este aviso.
- `[[DECISION REQUIRED]]` Adoptar WCAG 2.2 AA como estándar corporativo único (recomendado) o 2.1 AA (mínimo exigido por el EAA) — decisión ya señalada como pendiente en `accessibility-and-content/01` §6.

## 5. Revisión por abogado local pendiente

No publicar este aviso citando un nivel de conformidad hasta ejecutar el audit runtime. La cuantía sancionadora del EAA por comunidad autónoma de establecimiento y el alcance de la ADA Title III por circuito federal deben confirmarse con abogado local antes de la publicación final, tal como ya advierte `accessibility-and-content/01` §7.
