# 07 — Política de Uso Aceptable (borrador)

- **Audiencia:** clientes y prestadores que usan Hireeo.
- **Cobertura:** global (las 5 jurisdicciones de lanzamiento).
- **Versión:** v0.1 — borrador de investigación técnico-jurídica.
- **Fecha de vigencia propuesta:** condicionada a que Producto confirme el catálogo real de categorías habilitadas (`TS-Q1` de `marketplace/02-trust-and-safety-program.md`).
- **Dependencias técnicas:** el bloqueo automático de categorías prohibidas en la publicación de servicios **no está implementado** (propuesta de diseño, no hecho confirmado).
- **Hechos que requieren confirmación:** catálogo definitivo de categorías de servicio (`schema.prisma` → `Category`/`Service`); si se habilitarán categorías sensibles (ej. cuidado de menores).

> **Aviso.** Borrador de investigación. Requiere revisión de abogado local antes de publicación. La matriz de categorías de §1 es una propuesta de producto, no una lista legal exhaustiva verificada país por país — así lo advierte `marketplace/02-trust-and-safety-program.md` §6.

---

## 1. Qué no puede publicarse ni contratarse en Hireeo

Basado directamente en la matriz de severidad ya definida en `marketplace/02-trust-and-safety-program.md` §1, traducida a lenguaje de política:

### 1.1 Prohibido de forma absoluta

No está permitido publicar ni solicitar, a través de Hireeo, ninguno de los siguientes servicios o contenidos:

- Servicios sexuales o de naturaleza sexual.
- Cualquier servicio o contenido que involucre o facilite la explotación de menores.
- Venta o intermediación de armas.
- Venta o intermediación de drogas ilegales.
- Servicios que requieran licencia médica, legal o financiera que Hireeo no pueda verificar.
- Juegos de azar no autorizados/licenciados.

Hireeo se reserva el derecho de retirar de forma inmediata cualquier publicación que encaje en esta categoría, sin necesidad de aviso previo.

### 1.2 Servicios regulados — requieren verificación antes de publicar

Los siguientes oficios están sujetos a licencias/matrículas obligatorias en las jurisdicciones de Hireeo (ya tabuladas por país en `marketplace/01-platform-role-and-liability-analysis.md` §4) y **requieren verificación de la credencial correspondiente antes de que el prestador pueda publicarlos**:

- Electricidad.
- Gas.
- Construcción/obras.
- Transporte/fletes.

`[[DECISION REQUIRED]]`: hasta que el flujo de verificación de credenciales contra registros oficiales esté operativo (hoy no confirmado como implementado), Hireeo debe decidir si permite la publicación de estas categorías sin verificación (con el riesgo de facilitación ya señalado en `marketplace/01` §4) o las mantiene bloqueadas.

### 1.3 Categorías sensibles

Categorías que, de habilitarse, requerirían un aviso adicional o restricción de edad (ej. servicios en presencia de menores). `[[DECISION REQUIRED]]`: Producto debe confirmar si estas categorías existirán antes de que esta sección tenga contenido definitivo.

## 2. Conducta prohibida en la plataforma (independiente de la categoría de servicio)

- Publicar información falsa o engañosa sobre la identidad, credenciales o el servicio ofrecido.
- Suplantar la identidad de otro prestador, cliente o de la propia marca Hireeo.
- Publicar o solicitar reseñas falsas, o manipular el sistema de calificaciones.
- Acosar, amenazar o intimidar a otro usuario a través de la mensajería de la plataforma.
- Divulgar información personal de otro usuario sin su consentimiento (doxxing).
- Usar la plataforma para actividades fraudulentas, incluyendo triangulación de pagos o solicitud de pagos fuera de plataforma con intención de evadir controles.

## 3. Consecuencias del incumplimiento

El proceso de moderación, notificación y apelación ante el incumplimiento de esta política se rige por `08-trust-and-safety-policy.md` — no se repite aquí.

## 4. Decisiones de negocio pendientes

- `[[DECISION REQUIRED]]` Catálogo definitivo de categorías habilitadas.
- `[[DECISION REQUIRED]]` Si se bloquea la publicación de categorías reguladas sin verificación de credencial, o se publican con una advertencia hasta que el flujo de verificación exista.

## 5. Revisión por abogado local pendiente

La lista de §1.1 se basa en categorías comúnmente prohibidas en marketplaces similares, no en una revisión exhaustiva de la legalidad de cada servicio en las 5 jurisdicciones — debe validarse contra la normativa sectorial de cada país antes de publicarse como política definitiva.
