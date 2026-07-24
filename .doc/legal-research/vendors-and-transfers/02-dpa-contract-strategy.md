# Estrategia de contratos DPA/SCC con proveedores (Fase 12)

**Última actualización:** 2026-07-23
**Estado:** 🟡 borrador — complementa `vendor-inventory-and-dpa-checklist.md` (que ya lista el inventario de proveedores y un checklist punto por punto). Este documento no repite ese inventario; agrega la **estrategia** de qué cláusula negociar, por qué, y con qué prioridad. **Ningún DPA/SCC está firmado hoy** — no se declara lo contrario en ningún punto de este documento.

## 1. Las ocho piezas de cláusula que exige el encargo — qué significa cada una en la práctica de Hireeo

| Cláusula | Qué debe decir, en concreto, para Hireeo | Por qué es la pieza más fácil de omitir |
|---|---|---|
| **Objeto y duración del tratamiento** | Qué datos, con qué finalidad y por cuánto tiempo trata el proveedor en nombre de Hireeo | Suele estar en el DPA estándar del proveedor — verificar que coincide con el uso real, no solo aceptar el genérico |
| **Instrucciones documentadas** | El proveedor solo puede tratar los datos según las instrucciones de Hireeo (documentadas por escrito, incluida la transferencia internacional) | Casi siempre ausente en la práctica — Hireeo rara vez documenta instrucciones explícitas más allá de "usar el servicio"; sin esto, el proveedor podría alegar que actuó dentro de un margen no acordado |
| **Confidencialidad** | El personal del proveedor con acceso a los datos está sujeto a un deber de confidencialidad (contractual o legal) | Suele venir en el DPA estándar; verificar que cubre también a subcontratistas del proveedor |
| **Seguridad (medidas técnicas y organizativas)** | Referencia a medidas concretas (cifrado, control de acceso) — no una cláusula genérica de "seguridad razonable" | El checklist ya cubierto en `security/vendor-security-review.md` alimenta esta cláusula |
| **Sub-encargados** | Autorización general o específica, con **derecho de objeción** de Hireeo y obligación de que el proveedor imponga las mismas obligaciones al sub-encargado | El derecho de objeción casi nunca se ejerce en la práctica porque nadie lo revisa — debe asignarse a un responsable interno |
| **Asistencia en derechos de titulares y brechas** | El proveedor debe ayudar a Hireeo a responder solicitudes de derechos (`privacy/rights-request-protocol.md`) y notificar brechas **dentro de un plazo compatible** con los plazos legales de Hireeo (72h en UY/AR/UE) | Es la cláusula más crítica y la más fácil de aceptar sin negociar — si el DPA estándar del proveedor dice "notificaremos sin demora injustificada" sin plazo numérico, Hireeo no puede garantizar su propio plazo de 72h |
| **Auditoría / evidencia de cumplimiento** | Derecho de Hireeo a solicitar evidencia (certificaciones, informes SOC 2/ISO) o a auditar | Normalmente limitado por el proveedor a "aceptar su certificación existente" — razonable para proveedores grandes (Google, Stripe), pero debe registrarse cuál es la evidencia aceptada |
| **Transferencia, devolución y eliminación al término** | Qué pasa con los datos cuando termina el contrato — devolución, eliminación certificada, plazo | Frecuentemente ausente o vago — sin esto, Hireeo no puede demostrar que cumplió su propia política de retención tras cambiar de proveedor |

**Nota sobre "responsabilidad" y "requisitos de seguridad":** no se tratan como cláusulas aparte porque ya están cubiertas — responsabilidad se resuelve con la combinación de las cláusulas de instrucciones + auditoría (quién responde si el proveedor se desvía de las instrucciones), y requisitos de seguridad se resuelven con el cuestionario de `security/vendor-security-review.md`.

## 2. Priorización — no todos los proveedores requieren la misma urgencia

| Nivel | Proveedores (de `vendor-inventory-and-dpa-checklist.md`) | Por qué este nivel |
|---|---|---|
| **Tier 1 — antes de cualquier lanzamiento con datos reales** | Base de datos (PostgreSQL/Neon), Stripe, MercadoPago, Google Gemini | Tratan el 100% de los datos personales (DB) o datos financieros/sensibles (pagos, IA con texto libre) |
| **Tier 2 — antes de expansión a UE o antes de escalar volumen** | Google Analytics 4, Google Tag Manager, Cloudinary, Brevo, Firebase/FCM | Volumen alto de exposición pero no financiero/sensible directo; GA4/GTM ya están marcados `CRITICAL` en `security-and-privacy-controls-gap.md` por operar sin consentimiento — ese es un problema de código/producto, no solo de contrato |
| **Tier 3 — antes de auditoría enterprise/inversionista** | Vercel, OAuth (Google/Apple/Azure), OpenStreetMap, Cloudflare CDN | Menor volumen de datos sensibles por proveedor, pero forman parte de cualquier revisión de due diligence externa |

## 3. Transferencias internacionales — vínculo con `privacy/international-transfers-inventory.md`

- Para los proveedores con sede en EE.UU. (Google, Stripe, Cloudinary, Vercel, Firebase): la base de transferencia depende de si el proveedor específico está certificado en el **EU-US Data Privacy Framework** (Decisión 2023/1795, ya analizada en `privacy/international-transfers-inventory.md`) — **debe verificarse proveedor por proveedor**, no asumirse para "EE.UU." como bloque.
- Si un proveedor no está certificado en el DPF, la base de transferencia debe ser **Cláusulas Contractuales Tipo (SCC)** de la Comisión Europea — y estas **no existen hoy** para ningún proveedor de Hireeo (no hay contrato firmado). No declarar lo contrario.
- Para Brevo (sede en Francia/UE, según lo reportado en el inventario): no aplicaría transferencia fuera del EEE si se confirma que el procesamiento ocurre en la UE — **pendiente de confirmar la región real de procesamiento**, no asumir por la nacionalidad de la empresa matriz.

## 4. Qué NO hace este documento

- No firma ni implementa ningún DPA — es una guía de negociación.
- No sustituye el cuestionario técnico de `security/vendor-security-review.md` — este documento es sobre la cláusula contractual; ese otro es sobre la evidencia técnica que la respalda.
- No resuelve las preguntas `BLOCKING` ya identificadas en `vendor-inventory-and-dpa-checklist.md` §4 (proveedor/región de la base de datos, existencia de DPA firmado) — las hereda como bloqueadores.

## 5. Revisión por abogado local pendiente

La estrategia de §1-§3 es un marco de negociación. El texto final de cada cláusula debe ser revisado por un abogado antes de firmarse, especialmente la cláusula de transferencias internacionales si involucra España/UE.
