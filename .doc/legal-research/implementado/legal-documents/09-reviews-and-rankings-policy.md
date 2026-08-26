# 09 — Política de Reseñas y Rankings, Publicidad/Patrocinio (borrador)

- **Audiencia:** clientes, prestadores y (para la parte de patrocinio) anunciantes.
- **Cobertura:** global; obligaciones específicas verificadas para EE.UU. (FTC) y España/UE (DSA/P2B).
- **Versión:** v0.1 — borrador.
- **Fecha de vigencia propuesta:** condicionada a que exista un proceso real de moderación de reseñas más allá del flag `Rating.status` (ver `marketplace/02-trust-and-safety-program.md` §3).
- **Hechos que requieren confirmación:** si Hireeo activará resultados patrocinados o precios personalizados (`consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §3 — no hay evidencia de que exista hoy).

> **Aviso.** Borrador de investigación, no asesoría legal.

---

## 1. Reglas de reseñas

- Las reseñas deben corresponder a una experiencia real de contratación en la plataforma.
- Está prohibido publicar, solicitar o incentivar reseñas falsas, o suprimir reseñas negativas legítimas — esto es una obligación directamente vinculada a la **FTC Rule on Consumer Reviews (16 CFR Part 465)**, ya citada y verificada en `country-analysis/united-states-federal.md`, y aplicable con independencia de si el usuario está en EE.UU. como estándar global de buena práctica.
- El dueño de un servicio no puede autoevaluarse — regla ya confirmada en memoria de proyecto (reseñas colectivas, el dueño no se autoreseña).
- Toda reseña pasa por un estado de moderación (`Rating.status`: PENDING→ACTIVE) antes de publicarse — **hecho confirmado** del código, aunque el proceso de moderación específico contra reseñas falsas **no está documentado como implementado** (`marketplace/02` §3).

## 2. Transparencia de ranking

- Cuando el orden en que se muestran los prestadores esté influido por pago, destacado o patrocinio (`Service.featured`, `level`, `Sponsor` — ya identificados como hecho H3 en `marketplace/01` §0), Hireeo debe **identificarlo visiblemente** como contenido destacado/patrocinado.
- Esta obligación de transparencia de ranking está confirmada para la UE bajo DSA arts. 26-27 y P2B (ya citada en `country-analysis/spain-eu.md`), y bajo la FTC Act §5 para EE.UU. (ya citada en `country-analysis/united-states-federal.md`) — se adopta aquí como estándar global.

## 3. Publicidad y patrocinio

- Todo contenido patrocinado debe etiquetarse como tal ("Patrocinado" / "Destacado") de forma clara para el usuario.
- `[[DECISION REQUIRED]]`: Hireeo no tiene hoy evidencia de un programa de resultados patrocinados o afiliados activo (`consumer-and-commercial/01` §3). Esta sección se activa solo si se lanza esa función — no se debe publicar como si ya existiera.

## 4. Precios personalizados

`[[DECISION REQUIRED]]`: no hay evidencia de que Hireeo use precios personalizados hoy. Si se implementa, debe divulgarse al consumidor conforme a las reglas de transparencia de precio ya citadas en `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §1.

## 5. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Diseñar el proceso de detección de reseñas falsas más allá de la moderación manual actual.
- `[[DECISION REQUIRED]]` Confirmar si se lanzarán resultados patrocinados o precios personalizados antes de activar §3-4 de esta política.

## 6. Revisión por abogado local pendiente

Las obligaciones de transparencia de ranking y reseñas citadas tienen fuente verificada (FTC Rule, DSA/P2B). El resto de esta política es diseño propio y requiere validación legal antes de publicarse.
