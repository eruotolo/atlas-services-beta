# Controles de diseño para mantener la relación B2B/profesional independiente (Fase 13)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador de buena práctica — extiende `01-worker-classification-risk.md`. **Ninguno de los controles de este documento es, por sí solo, una obligación legal** — son medidas de diseño que reducen (no eliminan) el riesgo de reclasificación analizado en `01-worker-classification-risk.md`.

## 0. Principio rector

Los tests legales revisados en `01-worker-classification-risk.md` (ABC test de California, subordinación jurídica en LATAM, criterios de la futura Directiva UE 2024/2831) convergen en un mismo eje: **cuánto control ejerce la plataforma sobre el "cómo", el "cuándo" y el "para quién" del trabajo**. Cuanto menos control efectivo (no solo contractual) ejerza Hireeo sobre esos tres ejes, más sólida es la clasificación de contratista/profesional independiente.

**Advertencia [BUENA PRÁCTICA — no reemplaza la ley]:** un Término de Servicio que declare "el prestador es un contratista independiente" **no es determinante** en ninguna de las cinco jurisdicciones si la conducta real de la plataforma indica subordinación (los tests citados en `01` se basan en los **hechos**, no en la etiqueta contractual). Este documento se enfoca en la conducta real, no en el texto contractual.

## 1. Qué NO debería hacer Hireeo (aumenta el riesgo de reclasificación)

| Práctica a evitar | Por qué aumenta el riesgo | Jurisdicción más sensible |
|---|---|---|
| Fijar o imponer el precio del servicio (más allá de la comisión de intermediación) | Elimina el indicio de "riesgo económico propio" del prestador — hoy Hireeo NO hace esto (L1 en `01`), mantenerlo así | Todas, especialmente California (ABC test, prong A) y la futura Directiva UE 2024/2831 |
| Exigir exclusividad (prohibir que el prestador trabaje para otras plataformas o clientes propios) | Es uno de los criterios explícitos de subordinación económica en LATAM y del test de Prop 22/AB5 en EE.UU. | Todas |
| Imponer un horario o disponibilidad mínima obligatoria | Indicio clásico de subordinación jurídica | Todas |
| Asignar trabajo de forma algorítmica y obligatoria (decidir qué prestador atiende a qué cliente, sin que el prestador pueda rechazar libremente) | Es exactamente el criterio central de "gestión algorítmica" que activa la presunción de laboralidad bajo la Directiva UE 2024/2831 y la Ley 21.431 de Chile | España/UE (a futuro), Chile (si aplica la categoría) |
| Evaluar el desempeño del prestador con un sistema interno que determine acceso a trabajo futuro (más allá de la calificación pública de clientes) | Se asemeja a una evaluación de desempeño de empleado; la Directiva UE 2024/2831 regula explícitamente la "gestión algorítmica del desempeño" | España/UE (a futuro) |
| Proveer las herramientas, materiales o vehículo necesarios para ejecutar el servicio | Elimina el indicio de "medios propios" del contratista independiente | Todas |
| Dar instrucciones detalladas sobre **cómo** ejecutar el servicio (más allá de estándares mínimos de calidad o seguridad) | Es el núcleo de la "subordinación técnica" en los tests de LATAM y del prong A del ABC test | Todas |
| Exigir uniforme, identificación de marca Hireeo en la ejecución del servicio, o presentarse como "empleado de Hireeo" ante el cliente | Refuerza la apariencia de relación laboral ante terceros y autoridades | Todas |

## 2. Qué SÍ puede hacer Hireeo sin activar (por sí solo) el riesgo

| Práctica permitida | Por qué no activa el riesgo, si se implementa así |
|---|---|
| Exigir verificación de identidad y de credenciales/licencias profesionales (KYC, matrícula, seguro) | Es un estándar de **confianza y seguridad del marketplace** (ya analizado en `marketplace/01` §4 y `marketplace/02-trust-and-safety-program.md`), no un control laboral — todos los marketplaces B2B/B2C exigen esto sin que implique relación laboral |
| Publicar calificaciones de clientes (`Rating`) como mecanismo de reputación pública | Es información al consumidor, no evaluación interna de desempeño — **mientras** no se use como criterio de suspensión discrecional equivalente a una sanción laboral |
| Cobrar una comisión de intermediación sobre el precio que el propio prestador fija | La comisión es el modelo de negocio del marketplace, no un indicio de control — el punto crítico es que el precio base lo sigue fijando el prestador |
| Definir categorías de servicio y requisitos mínimos de elegibilidad para publicar (ej. licencia vigente en oficios regulados) | Es un estándar de calidad/seguridad de la plataforma, análogo a un criterio de admisión, no de subordinación día a día |
| Ofrecer (no imponer) herramientas opcionales como IA de sugerencias, calendario de disponibilidad autogestionado por el prestador | Mientras el prestador decida voluntariamente usarlas y pueda operar sin ellas, no equivale a control obligatorio |
| Establecer políticas de conducta mínimas (no discriminación, prohibición de servicios ilegales, trato respetuoso al cliente) | Son estándares de plataforma exigibles a cualquier tercero que use un marketplace, no equivalentes a dirección de un empleador |
| Retener/desactivar temporalmente a un prestador por **incumplimiento de ley o fraude confirmado** (con debido proceso — ver `marketplace/02` notice-and-action) | Es una medida de confianza y seguridad, análoga a suspender a cualquier usuario que incumple términos, no una sanción disciplinaria laboral |

## 3. Recomendación de gobernanza (buena práctica)

1. **No copiar el modelo de gestión algorítmica de plataformas de delivery/rideshare** (asignación automática, tarifa fija por la plataforma) — ya está fuera del diseño actual de Hireeo según la evidencia revisada en `01-worker-classification-risk.md` §0; mantenerlo así es la mitigación más efectiva.
2. **Documentar por escrito** (para uso interno, no necesariamente público) los criterios de elegibilidad, suspensión y moderación aplicados a prestadores, distinguiéndolos explícitamente de una evaluación de desempeño laboral.
3. **Revisar este documento cuando se resuelva EMP-Q1/EMP-Q3** de `01-worker-classification-risk.md` — si la respuesta revela algún control no evidenciado en el código (ej. una política interna de exclusividad), este documento y su conclusión de riesgo deben actualizarse.
4. **Anticipar la Directiva UE 2024/2831** (transposición límite 2026-12-02) diseñando cualquier futura función de "gestión algorítmica" (asignación de trabajo, scoring interno) con supervisión humana y posibilidad de que el prestador cuestione una decisión automatizada — mismo principio ya aplicado en `ai/ai-classification-and-risk-assessment.md` para otras funciones de IA.

## 4. Preguntas abiertas

Este documento no genera preguntas nuevas — depende de las ya listadas en `01-worker-classification-risk.md` §5 (especialmente EMP-Q1, EMP-Q3, EMP-Q4).

## 5. Revisión por abogado local pendiente

Los controles de este documento son buena práctica derivada de los tests legales ya citados en `01-worker-classification-risk.md` — no sustituyen una revisión de abogado laboralista local, especialmente antes de escalar el volumen de prestadores en cualquier país o de introducir funciones de asignación automática de trabajo.
