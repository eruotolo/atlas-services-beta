# Cuestionario de revisión de seguridad de proveedores (Fase 11)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — checklist a aplicar antes de contratar o mientras se usa cada proveedor ya identificado en `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md`. Ninguna pregunta de este documento está respondida hoy — es la herramienta, no el resultado.

## 0. Marcos de referencia — uso REFERENCIAL, no obligación legal directa

Ninguno de estos marcos es, por sí mismo, una obligación legal en las cinco jurisdicciones de lanzamiento. Se usan como **vocabulario común de control** para estructurar la pregunta correcta a cada proveedor; la obligación legal real es la que ya está confirmada en otros documentos de este expediente (GDPR art. 28/32, leyes locales de protección de datos, PCI-DSS contractual con las redes de tarjeta).

| Marco | Qué aporta aquí | ¿Es obligación legal o preparación enterprise? |
|---|---|---|
| OWASP ASVS 4.0 | Vocabulario de controles de aplicación (autenticación, sesión, criptografía) | Preparación / buena práctica — ya usado como referencia en `security-and-privacy-controls-gap.md` |
| OWASP API Security Top 10 (2023) | Vocabulario de riesgos de API (BOLA, autorización a nivel de función) | Preparación / buena práctica |
| NIST Cybersecurity Framework 2.0 | Estructura Identify/Protect/Detect/Respond/Recover para organizar la revisión | Preparación — es un estándar voluntario en EE.UU., no una ley |
| CIS Controls | Lista priorizada de controles técnicos concretos | Preparación / buena práctica |
| ISO 27001 / 27701 | Certificación de sistema de gestión de seguridad/privacidad | **Preparación para clientes enterprise/B2B** — un cliente empresarial grande puede exigirla contractualmente, pero no es un requisito legal de las 5 jurisdicciones por sí sola |
| SOC 2 | Informe de auditoría de controles (Tipo I/II) | **Preparación para clientes enterprise/B2B** — mismo estatus que ISO 27001/27701; frecuentemente exigido en due diligence de clientes estadounidenses |
| ENISA (guías UE) | Orientación de ciberseguridad de la agencia de la UE | Guía no vinculante, salvo donde una norma UE (NIS2) remita a ella expresamente |

**Regla de uso:** si un proveedor no tiene ISO 27001/27701 o SOC 2, **no es automáticamente un incumplimiento legal** — es un dato para la matriz de riesgo (`05-risk-matrix.md`, pendiente) y para decisiones de venta B2B/enterprise, que sí pueden exigirlo contractualmente a Hireeo en cascada.

## 1. Cuestionario general — aplicar a TODO proveedor de `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md`

| # | Pregunta | Por qué importa | Obligación legal directa vinculada |
|---|---|---|---|
| 1 | ¿Dónde se almacenan y procesan los datos (región/país)? | Determina si hay transferencia internacional y qué mecanismo aplica | GDPR arts. 44-49; `privacy/international-transfers-inventory.md` |
| 2 | ¿El proveedor firma un DPA/Data Processing Agreement? | Es la base contractual exigida por ley para un encargado de tratamiento | GDPR art. 28; leyes locales de protección de datos |
| 3 | ¿Quiénes son sus sub-encargados y hay derecho de objeción? | Sin esto, Hireeo no puede controlar la cadena de tratamiento | GDPR art. 28(2)-(4) |
| 4 | ¿Cuál es su plazo de notificación de brechas hacia Hireeo? | Debe ser compatible con los plazos de `breach-notification-protocol.md` (72h en UY/AR/UE) — si el proveedor tarda más en avisar a Hireeo de lo que Hireeo tiene para avisar a la autoridad, el plazo legal de Hireeo se incumple por causa del proveedor | GDPR art. 33(2); riesgo contractual |
| 5 | ¿Tiene certificación ISO 27001/27701 o informe SOC 2 vigente? | Reduce (no elimina) el riesgo residual; relevante para ventas B2B | Preparación enterprise, no obligación legal |
| 6 | ¿Cifra los datos en tránsito y en reposo? | Control técnico básico esperado | GDPR art. 32 ("medidas técnicas apropiadas") |
| 7 | ¿Permite eliminar/exportar los datos al finalizar el contrato? | Necesario para poder cumplir derechos de eliminación/portabilidad de los titulares | GDPR art. 28(3)(g); `privacy/rights-request-protocol.md` |
| 8 | ¿Usa los datos/inputs para entrenar sus propios modelos? | Crítico para proveedores de IA — **no asumir que no entrena sin confirmación contractual explícita** | Minimización de datos; ya señalado como pendiente en `vendor-inventory-and-dpa-checklist.md` §3.3 |

## 2. Preguntas específicas por categoría de proveedor (ya inventariados)

### 2.1 Proveedores de IA (Google Gemini)
- ¿Dónde se procesan los prompts y por cuánto tiempo se retienen?
- ¿Existe un DPA específico para la API de Gemini/Google Cloud (distinto del DPA general de Google Workspace)?
- ¿Qué controles de seguridad tiene el proveedor contra prompt injection/exfiltración vía la API (relevante porque `security-and-privacy-controls-gap.md` §3 ya identificó que Hireeo interpola input crudo en los prompts — `chatbot.service.ts:56`, `matchmaking.ts:39` — sin protección propia)?

### 2.2 Proveedores de pagos (Stripe, MercadoPago)
- ¿Cuál es el alcance PCI-DSS exacto y quién es responsable de qué (ya señalado como pendiente de confirmar el SAQ aplicable)?
- ¿Qué evidencia de la transacción provee el proveedor para defender un chargeback? (repite `payments-tax/04-fraud-prevention-and-dispute-playbook.md` §1)
- ¿Cómo trata el número de documento de identidad capturado en el checkout (MercadoPago, `PaymentBrick.tsx:43`)?

### 2.3 Autenticación / identidad (Google, Apple, Azure OAuth)
- ¿Se valida el `aud` (audiencia) del token en cada proveedor? — **ya confirmado como ausente para Google y Microsoft** en `security-and-privacy-controls-gap.md` §1 (`auth.service.ts:151-166, 241-257`). Este es un hallazgo de código, no una pregunta al proveedor — se repite aquí solo para que no se pierda al construir la revisión de proveedores.

### 2.4 Almacenamiento y CDN (Cloudinary, Vercel, base de datos)
- ¿Qué región de datos está configurada? (ya marcado como pregunta abierta `BLOCKING` en `vendor-inventory-and-dpa-checklist.md` §4.1 y §4.4)
- ¿El proveedor de base de datos (Neon u otro, a confirmar) ofrece cifrado en reposo por defecto?

### 2.5 Email transaccional (Brevo)
- ¿Cuál es la política de retención de logs de envío (que hoy incluyen el email del destinatario en el log de aplicación, `email.service.ts:50`, ya señalado como hallazgo `LOW/MEDIUM`)?

## 3. Qué hacer con las respuestas (siguiente paso, no ejecutado aquí)

Las respuestas a este cuestionario alimentan:
- `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` (marcar checkboxes cuando se confirme cada punto).
- La matriz de riesgo global (`05-risk-matrix.md`, pendiente en Fase 15).

## 4. Revisión por abogado local pendiente

Este documento es una herramienta de revisión, no una conclusión. Ningún ítem debe marcarse como "cumplido" sin la evidencia contractual correspondiente.
