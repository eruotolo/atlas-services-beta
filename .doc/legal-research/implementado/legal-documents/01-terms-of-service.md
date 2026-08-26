# Términos de Servicio de Hireeo — Clientes / Usuarios generales

**Documento:** `legal-documents/01-terms-of-service.md`
**Audiencia:** clientes/usuarios que buscan y contratan servicios a través de Hireeo (rol `Client`).
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos — con cláusulas diferenciadas donde la investigación jurídica confirma que un texto único no sería válido en todas las jurisdicciones (ver §7).
**Versión:** v0.1-borrador
**Fecha de vigencia propuesta:** pendiente de fijar tras revisión legal — no publicar hasta resolver los `[[DECISION REQUIRED]]` de este documento.
**Dependencias técnicas:** requiere que Producto/Ingeniería confirmen el modelo de pago real (Escenario A/B, ver §4) antes de que las cláusulas de pago sean operativas; requiere flujo de aceptación/versionado de términos (hoy no confirmado en el repo).

> ⚠️ **ESTE ES UN BORRADOR DE TRABAJO, NO UN DOCUMENTO PUBLICABLE.** No debe copiarse al sitio de Hireeo sin (1) completar los campos `[[DECISION REQUIRED]]`, (2) revisión de un abogado habilitado en cada jurisdicción, y (3) validación de que cada afirmación coincide con el comportamiento real del producto en el momento de publicación (los hechos usados aquí corresponden al código auditado el 2026-07-23 y pueden quedar desactualizados).

---

## 0. Fuentes de este borrador

Cada cláusula de este documento traduce a lenguaje contractual una conclusión ya investigada y verificada en otro archivo del expediente. No se investigó nada nuevo para redactar este documento — se citan las fuentes en cada sección.

---

## 1. Quiénes son las partes

**Hireeo** es operado por [[DECISION REQUIRED: razón social, forma jurídica, país de constitución y domicilio legal de la entidad operadora — no existe esta información en el repositorio ni en la documentación del proyecto (`01-scope-assumptions-and-open-questions.md` §A.3, §B.S1, pregunta Q1, marcada `BLOCKING`). No se puede publicar un Término de Servicio sin este dato]]. Contacto: info@hireeo.app (confirmado en `frontend/src/app/layout.tsx:156`).

Un **Cliente** es cualquier persona que usa Hireeo para buscar, contactar o contratar un **Prestador** de servicios. Un **Prestador** es la persona o entidad que ofrece el servicio. Sus términos están en `02-provider-terms.md`.

## 2. Qué es Hireeo (rol de la plataforma)

Hireeo es un **marketplace de descubrimiento e intermediación** de servicios: publica perfiles de prestadores, permite la búsqueda, facilita el contacto (mensajería, teléfono, WhatsApp) y, según se explica en §4, puede o no intervenir en el pago.

**El contrato de servicio se forma entre el Cliente y el Prestador — no con Hireeo.** Hireeo provee un contrato de intermediación separado (uso de la plataforma), y esto debe mostrarse con claridad en el producto real, no solo en este texto (fuente: `marketplace/01-platform-role-and-liability-analysis.md` §6, hallazgo `[INFERENCIA]` marcado como obligación de transparencia frente al consumidor).

Hireeo puede usar un asistente de inteligencia artificial para ayudar a describir tu necesidad y sugerir prestadores. Esa sugerencia es un apoyo a la búsqueda, no una garantía de calidad, disponibilidad ni idoneidad del prestador — el asistente puede cometer errores (fuente: `marketplace/01` H4; `ai/ai-classification-and-risk-assessment.md`, no repetido aquí).

## 3. Verificación de prestadores — lo que Hireeo hace y lo que no hace hoy

[[DECISION REQUIRED: esta sección debe confirmarse contra el estado real del producto al momento de publicar]]. A la fecha de este borrador (2026-07-23):

- El KYC de identidad de prestadores está implementado como **stub** (no operativo) — fuente: `marketplace/01` H5, `payments-tax/01-payment-architecture-scenarios-and-licensing.md`. **No se debe afirmar en el texto publicado que los prestadores están "verificados" si esto sigue sin ser operativo.**
- No hay verificación de licencias/matrículas profesionales contra registros oficiales para oficios regulados (electricidad, gas, construcción, transporte) — fuente: `marketplace/01` §4, H6. Si esto cambia, la cláusula debe actualizarse para reflejarlo.
- **Cláusula propuesta (mientras no haya verificación operativa):** "Hireeo no garantiza la identidad, las credenciales, los seguros ni las licencias profesionales de los Prestadores. Es responsabilidad del Cliente verificar que el Prestador cuenta con las habilitaciones requeridas para el servicio contratado, especialmente en oficios regulados."

## 4. Pagos — cláusula condicionada al modelo real (Escenario A o B)

Hoy los pagos están en **stub/mock** (`escrow.service.ts:8,57-60`, `payments.service.ts`) — no hay cobro real. Esta sección tiene dos variantes; **usar solo la que corresponda al modelo activo al momento de publicar**, y no publicar ninguna hasta que `PAY-Q1`/`PAY-Q2` (`payments-tax/01` §4) estén resueltos:

**Variante A — "Hireeo solo conecta" (si el pago ocurre directamente entre Cliente y Prestador, fuera de la plataforma):**
> "El pago del servicio se acuerda y se realiza directamente entre el Cliente y el Prestador. Hireeo no procesa, retiene ni garantiza ningún pago."

**Variante B — "Hireeo cobra/retiene vía escrow" (si se activa el flujo con comisión del 15%):**
> "Hireeo procesa el pago a través de [[DECISION REQUIRED: nombre del PSP contratado — no confirmado]], que actúa como [[DECISION REQUIRED: merchant of record o agregador — no confirmado, ver `payments-tax/01` §2, PAY-Q1]]. Hireeo cobra una comisión de intermediación del 15% sobre el valor del servicio."

**No publicar ninguna variante mixta ni ambigua** — el rol de Hireeo frente al consumidor cambia sustancialmente entre A y B (fuente: `marketplace/01` §7, con riesgo agravado de responsabilidad solidaria en Argentina bajo el art. 40 de la Ley 24.240 si se activa el Escenario B).

## 5. Cancelación, reembolsos y no-show

- **No existe hoy una política de no-show implementada en el producto** (fuente: `consumer-and-commercial/01-precontractual-info-warranties-and-disclosures.md` §2, `CONS-Q1`). [[DECISION REQUIRED: Producto debe definir la política de reembolso/reprogramación cuando el Prestador no se presenta antes de publicar esta sección]].
- **Derecho de desistimiento (compra a distancia):** varía por país y debe reflejar los plazos ya confirmados en `country-analysis/comparative-matrix.md` (Uruguay: 5 días hábiles; Argentina/Chile: 10 días; España/UE: 14 días), con las excepciones de servicio ya ejecutado que cada país reconoce. **No copiar un plazo único de 14 días para las cinco jurisdicciones** — sería incorrecto para Uruguay, Argentina y Chile.

## 6. Limitación de responsabilidad — por qué esta cláusula NO puede ser una exclusión total

**Hecho ya confirmado, no reinterpretar:** en ninguna de las cinco jurisdicciones puede excluirse válidamente, frente a un consumidor, la responsabilidad por dolo o culpa grave, por daños a la vida o integridad física, ni derogar derechos legales de consumo (desistimiento, garantía legal, información) — fuente: `marketplace/01` §6, verificado como obligación en UE, Chile, Argentina y Uruguay; en EE.UU. la validez es estatal y tampoco cubre negligencia grave.

**Cláusula propuesta (no una exclusión total tipo "as-is"):**
> "Hireeo actúa como intermediario y no es parte del contrato de servicio entre el Cliente y el Prestador. En la máxima medida permitida por la ley aplicable, Hireeo no será responsable por la calidad, seguridad, legalidad o resultado del servicio prestado por el Prestador. Esta limitación no excluye la responsabilidad por dolo, culpa grave, daños a la salud o integridad física, ni ningún derecho irrenunciable del consumidor bajo la ley aplicable."

Un descargo de "Hireeo solo conecta" **no** neutraliza la responsabilidad si de hecho Hireeo cobra, verifica o interviene activamente en la transacción (fuente: `marketplace/01` §6) — por eso esta cláusula debe mantenerse consistente con el Escenario de pago real elegido en §4.

## 7. Resolución de disputas — cláusula DIFERENCIADA por jurisdicción (no usar una cláusula única)

**Hecho central confirmado con alta confianza** (`consumer-and-commercial/03-dispute-resolution-and-arbitration.md` §2): una cláusula de arbitraje obligatorio con renuncia a acción de clase es ejecutable en EE.UU. pero presuntamente abusiva e inválida en Uruguay, Argentina, Chile y España/UE. **No existe una cláusula única válida para las cinco jurisdicciones.**

**7.1 — Usuarios con domicilio en Estados Unidos:**
> "Cualquier disputa derivada de estos Términos se resolverá mediante arbitraje vinculante e individual conforme a la Federal Arbitration Act (9 U.S.C. § 2). El Cliente y Hireeo renuncian a su derecho a participar en una acción de clase o colectiva."

**7.2 — Usuarios con domicilio en Uruguay, Argentina, Chile o España/UE:**
> "El Cliente puede presentar cualquier reclamo ante la autoridad de consumo de su país de residencia o ante los tribunales competentes. Hireeo puede ofrecer mediación voluntaria como alternativa, pero esta nunca será condición excluyente para acceder a la vía judicial o administrativa."

**No incluir arbitraje obligatorio en 7.2** — sería inoponible y podría usarse como evidencia de mala fe contractual (fuente citada arriba, §4 de ese documento).

## 8. Suscripciones (si se activan en el futuro)

Hireeo no tiene hoy un modelo de suscripción de clientes activo. Si se lanza en el futuro, esta sección debe completarse con las reglas ya investigadas en `consumer-and-commercial/02-subscriptions-and-auto-renewal.md` (cancelación por el mismo canal de alta, aviso de cambios de precio, y la regla específica de Uruguay que **prohíbe** exigir preaviso al consumidor para cancelar). [[DECISION REQUIRED: confirmar si/cuándo se lanza este modelo]].

## 9. Menores de edad

No existe hoy verificación de edad en el registro (`01-scope-assumptions-and-open-questions.md` E-17, Q6, `HIGH`). **Cláusula propuesta mientras no exista verificación:**
> "Los servicios de Hireeo están dirigidos a personas mayores de 18 años. Al registrarte, declaras ser mayor de edad según la ley de tu país de residencia."

Esto es una declaración contractual, **no un control técnico real** — no debe presentarse como si Hireeo verificara la edad.

## 10. Modificaciones, suspensión y terminación

Cláusula estándar de modificación de términos con aviso razonable, y de suspensión/terminación de cuentas por incumplimiento — sujeta a los límites de exclusión de responsabilidad de §6 y a que no contradiga derechos irrenunciables del consumidor. [[DECISION REQUIRED: definir plazo de aviso de cambios materiales — no hay un estándar legal único confirmado para esto, es una decisión de producto/legal]].

## 11. Ley aplicable

[[DECISION REQUIRED: la ley aplicable por defecto normalmente sería la del domicilio del consumidor bajo las normas de protección al consumidor de cada país (irrenunciable frente a consumidores) — no se puede fijar una ley aplicable única y exclusiva que desplace esto]].

---

## Hechos que requieren confirmación antes de publicar

1. Razón social, domicilio y representante legal de la entidad operadora (§1) — `BLOCKING`.
2. Modelo de pago real: Escenario A o B, y quién es merchant of record (§4) — `BLOCKING`.
3. Estado real de verificación de KYC/credenciales al momento de publicar (§3).
4. Política de no-show/reembolso (§5).
5. Plazo de aviso de cambios materiales a los Términos (§10).

## Revisión por abogado local pendiente

Este borrador no es publicable. Requiere revisión de un abogado habilitado en Uruguay, Argentina, Chile, España y Estados Unidos antes de su publicación, en particular para validar la cláusula de resolución de disputas (§7) y la limitación de responsabilidad (§6) contra la legislación de consumo vigente en cada país al momento de publicación.
