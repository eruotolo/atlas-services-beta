# Política de divulgación responsable de vulnerabilidades (Fase 11)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador de política **propuesta** — no existe evidencia en el repo de un canal de reporte de seguridad hoy (`[SUPUESTO]`: no se encontró `security.txt`, dirección de contacto de seguridad ni política pública durante esta investigación; esto es ausencia de evidencia, no una confirmación exhaustiva de que no exista en ningún otro canal fuera del repositorio).

## 1. Por qué este documento (marco de referencia)

Se apoya en el vocabulario de ISO/IEC 29147 (divulgación de vulnerabilidades) e ISO/IEC 30111 (proceso de gestión de vulnerabilidades) como **guías no vinculantes**, no como obligación legal. La obligación legal real de Hireeo ante una vulnerabilidad que produce una brecha de datos personales ya está cubierta en `privacy/breach-notification-protocol.md` y `security/incident-response-legal-playbook.md` — este documento es sobre **cómo recibir** el reporte de un investigador externo de buena fe, no sobre qué hacer una vez confirmado el incidente.

## 2. Elementos propuestos de la política

| Elemento | Propuesta | Nota |
|---|---|---|
| Canal de reporte | Dirección de correo dedicada (ej. `security@hireeo.app`) o formulario — **a crear, no existe hoy** | `[SUPUESTO]` pendiente de decisión de producto |
| Alcance | Qué activos están dentro del alcance (dominios de producción de `hireeo.app`) y cuáles están explícitamente fuera (ej. servicios de terceros como Stripe/MercadoPago — reportar directamente al proveedor) | Debe alinearse con el inventario de `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` |
| Expectativa de respuesta | Propuesta: acuse de recibo en un plazo definido (ej. 3-5 días hábiles) y actualización de estado periódica — **no prometer un plazo que el equipo no pueda operar**, mismo principio ya aplicado en `privacy/rights-request-protocol.md` |
| Conducta esperada del investigador | No acceder, modificar ni exfiltrar datos de terceros más allá de lo necesario para demostrar la vulnerabilidad; no divulgar públicamente antes de coordinar con Hireeo (embargo razonable) | Práctica estándar de la industria (buena práctica, no obligación legal) |
| "Safe harbor" para investigadores de buena fe | Propuesta: compromiso de Hireeo de no iniciar acciones legales contra quien reporte de buena fe y dentro del alcance definido | **Advertencia legal importante** — ver §3 |
| Reconocimiento | Opcional: listar investigadores que reportaron responsablemente (con su consentimiento) | Buena práctica, no obligatorio |

## 3. Advertencia legal sobre el "safe harbor" (importante, no minimizar)

Un compromiso público de no perseguir legalmente a investigadores de buena fe **reduce el riesgo de disuadir reportes legítimos**, pero:

- **No es un escudo legal absoluto.** Un compromiso unilateral de Hireeo no puede impedir que un fiscal o una autoridad de un país distinto persiga a un investigador bajo su propia legislación de delitos informáticos (ya identificada de forma general en los análisis por país de `country-analysis/*.md`, sección "delitos informáticos"/"ciberseguridad" de cada jurisdicción — no se repite aquí el detalle penal específico, que queda fuera del alcance de esta fase).
- **No se investigó en este documento** el detalle penal específico de acceso no autorizado a sistemas informáticos en cada una de las 5 jurisdicciones (sería una nueva línea de investigación, no solicitada en este encargo puntual) — se deja como pregunta abierta (§4).
- Un "safe harbor" mal redactado (demasiado amplio) puede exponer a Hireeo si alguien alega actuar "de buena fe" tras causar daño real — el alcance (§2) debe ser específico y las condiciones claras.

## 4. Preguntas abiertas

| # | Pregunta | Prioridad |
|---|---|---|
| DISC-Q1 | ¿Hireeo quiere operar un canal de reporte de seguridad? (decisión de producto, no legal) | `MEDIUM` |
| DISC-Q2 | Si se publica un "safe harbor", investigar el marco penal específico de acceso no autorizado a sistemas en las 5 jurisdicciones antes de redactar el texto final — no se hizo en esta fase | `MEDIUM` — solo relevante si se decide publicar la política |

## 5. Revisión por abogado local pendiente

El texto de "safe harbor" (§2-§3) no debe publicarse sin revisión de un abogado que evalúe el riesgo penal/civil específico de cada jurisdicción de lanzamiento — este documento señala la existencia del riesgo, no lo resuelve.
