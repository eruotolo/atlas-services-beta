# Política de Privacidad de Hireeo — Global + Anexos por País

**Documento:** `legal-documents/03-privacy-policy-global.md`
**Audiencia:** todos los usuarios de Hireeo (clientes, prestadores, visitantes).
**Jurisdicción/cobertura:** núcleo global + anexos separados para Uruguay, Argentina, Chile, España/UE y Estados Unidos.
**Versión:** v0.1-borrador
**Fecha de vigencia propuesta:** pendiente de fijar tras revisión legal — **no publicable en su estado actual** porque faltan datos BLOCKING (ver §0).
**Dependencias técnicas:** requiere resolver Q1 (entidad legal), Q5 (ubicación de datos), Q9 (DPA/SCC con proveedores), Q10 (retención) de `01-scope-assumptions-and-open-questions.md` antes de que este documento sea operativo.

> ⚠️ **BORRADOR DE TRABAJO — NO PUBLICABLE.** Este documento refleja fielmente lo ya investigado y verificado en `privacy/*` y `cookies/*`. No inventa plazos de retención, bases jurídicas definitivas ni garantías de seguridad que no estén confirmadas.

---

## 0. Bloqueadores para publicar (no avanzar sin esto)

| Bloqueador | Fuente | Prioridad |
|---|---|---|
| No hay entidad legal (responsable/controlador) identificada | `01-scope-assumptions-and-open-questions.md` Q1 | `BLOCKING` |
| No hay confirmación de ubicación física de los datos (servidores, backups, Cloudinary) | Q5 | `BLOCKING` |
| No hay DPA/SCC firmados confirmados con los subprocesadores | Q9 | `BLOCKING` |
| No hay periodos de retención definidos | Q10; `privacy/gap-assessment-and-retention-rules.md` §2 | `BLOCKING` |
| No existe un canal implementado para ejercer derechos de titulares | `privacy/rights-request-protocol.md` §0 | `BLOCKING` |

## 1. Núcleo global

### 1.1 Responsable del tratamiento

[[DECISION REQUIRED: razón social, domicilio y contacto del responsable — no existe en el repo, ver `privacy/data-inventory-and-ropa-draft.md` "Datos del responsable"]]. Contacto de privacidad: info@hireeo.app (confirmado).

### 1.2 Qué datos recopilamos (síntesis del ROPA — no repetir el detalle, referenciar)

Este documento resume; el detalle completo por actividad de tratamiento está en `privacy/data-inventory-and-ropa-draft.md` (AT-01 a AT-12). Categorías principales: datos de cuenta (nombre, email, credenciales), datos de perfil de prestador, contenido publicado, mensajería entre usuarios, datos de interacción/contacto, geolocalización (incluye **coordenadas precisas** en direcciones — dato de mayor riesgo, `AT-07`), datos de pago (hoy no operativos, `AT-08`), identificadores de analítica (Google, hoy sin consentimiento — ver §1.5), datos de uso del asistente de IA (`AT-11`).

### 1.3 Para qué usamos tus datos y con qué base legal

[[DECISION REQUIRED: la base jurídica de cada tratamiento (ejecución de contrato, interés legítimo, consentimiento, obligación legal) está propuesta como "candidata" en el ROPA (`privacy/data-inventory-and-ropa-draft.md`), no confirmada como determinación final — no se puede publicar esta sección afirmando bases jurídicas sin que Legal las confirme actividad por actividad]].

### 1.4 Con quién compartimos tus datos

Subprocesadores confirmados en el código (`01-scope-assumptions-and-open-questions.md` E-15): Stripe, MercadoPago, Stripe Identity (KYC), Firebase (push), Google Gemini (IA), Cloudinary (imágenes), Brevo (email transaccional), Google/Apple/Microsoft (login OAuth), Google Tag Manager/Analytics.

**No podemos afirmar hoy que existan DPA/SCC firmados con estos proveedores** — es un supuesto pendiente de confirmar (S7 de `01-scope-assumptions-and-open-questions.md`). [[DECISION REQUIRED: no publicar una lista de "garantías de transferencia" sin que estén realmente firmadas]].

### 1.5 Cookies y analítica — divulgación obligatoria (hecho confirmado, no atenuar)

**Hecho confirmado por auditoría de código:** hoy Google Tag Manager y Google Analytics 4 se cargan en cada visita **sin gate de consentimiento previo** (`cookies/cookie-and-tracker-audit.md` C-01, clasificado `CRITICAL`). Este es un incumplimiento activo en España/UE (LSSI art. 22.2, GDPR) y una brecha frente al criterio prudente esperado en Chile/Argentina/Uruguay. **No se debe publicar esta Política de Privacidad afirmando "solo usamos cookies con tu consentimiento" mientras esto siga siendo cierto en el código** — sería una afirmación falsa y agravaría el riesgo legal en lugar de mitigarlo.

**Cláusula honesta mientras la brecha exista (transitoria, hasta que se implemente la CMP de `cookies/consent-design-spec.md`):**
> "Actualmente estamos implementando un sistema de gestión de consentimiento de cookies. Hasta que esté disponible, algunos servicios de analítica pueden cargarse antes de tu elección explícita. Puedes consultar el detalle completo en nuestra [Política de Cookies]."

[[DECISION REQUIRED: Legal y Producto deben decidir si se publica esta Política de Privacidad ANTES de resolver la brecha C-01, dado el riesgo de que publicar la política sin resolver la brecha técnica documente el incumplimiento en lugar de ocultarlo — recomendación: resolver C-01 primero]].

### 1.6 Transferencias internacionales

Ver `privacy/international-transfers-inventory.md` — resumen: transferencias hacia/desde Uruguay y Argentina están cubiertas por decisiones de adecuación de la UE vigentes (verificadas: Decisión 2012/484/UE para Uruguay, Decisión 2003/490/CE para Argentina); hacia Chile **no** hay adecuación (requiere SCC); hacia EE.UU. depende de si el proveedor específico está certificado en el EU-US Data Privacy Framework — **no asumir que todos los proveedores estadounidenses lo están sin verificarlo proveedor por proveedor**.

### 1.7 Cuánto tiempo conservamos tus datos

[[DECISION REQUIRED: no existen plazos de retención definidos hoy — `privacy/gap-assessment-and-retention-rules.md` §2 marca esto como condicionado, no un hecho confirmado. No publicar tabla de retención con cifras hasta que Producto/Legal las confirmen]].

### 1.8 Tus derechos

Resumen del protocolo — plazos varían por país (ver Anexos). **Canal para ejercerlos: [[DECISION REQUIRED — no existe hoy, ver `privacy/rights-request-protocol.md` §0, RIGHTS-Q1]].**

### 1.9 Seguridad

[[DECISION REQUIRED: no describir medidas de seguridad no confirmadas. Hechos confirmados que sí pueden citarse: credenciales de proveedores cifradas en base de datos (AES-256-GCM), contraseñas con bcrypt, rate limiting activo, `ApiKeyGuard` global — fuente `01-scope-assumptions-and-open-questions.md` E-06, E-14, E-15, E-21]].

### 1.10 Menores

Hireeo no está dirigido a menores de 18 años. No existe hoy verificación de edad (`01-scope-assumptions-and-open-questions.md` Q6). [[DECISION REQUIRED: esta es una declaración contractual, no un control técnico real]].

### 1.11 Cambios a esta política

[[DECISION REQUIRED: definir mecanismo de aviso de cambios materiales]].

---

## 2. Anexo — Uruguay

- **Autoridad:** URCDP (Unidad Reguladora y de Control de Datos Personales).
- **Base normativa:** Ley 18.331 y Decreto 64/2020.
- **Derechos y plazo:** acceso/rectificación/eliminación en **5 días hábiles** (`privacy/rights-request-protocol.md` §1).
- **Notificación de brechas:** hasta 72 horas a la URCDP (`privacy/breach-notification-protocol.md`).
- **DPO:** obligatorio si el tratamiento de datos sensibles es actividad principal o el volumen supera 35.000 personas (`privacy/dpo-and-governance.md` §1) — [[DECISION REQUIRED: confirmar volumen proyectado, `DPO-Q1`]].
- **Registro de bases ante URCDP:** [[DECISION REQUIRED: no confirmado si se realizó — `country-analysis/uruguay.md`]].

## 3. Anexo — Argentina

- **Autoridad:** AAIP (Agencia de Acceso a la Información Pública).
- **Base normativa:** Ley 25.326.
- **Derechos y plazo:** 5 días hábiles para supresión/rectificación.
- **Notificación de brechas:** 72 horas a la AAIP (régimen en implementación administrativa).
- **DPO:** no obligatorio hoy para privados.

## 4. Anexo — Chile

- **Autoridad hoy:** régimen de la Ley 19.628 (la Ley 21.719 entra en vigor el **2026-12-01** y no está vigente a la fecha de este borrador — no aplicar sus plazos como vigentes).
- [[DECISION REQUIRED: este anexo requiere una auditoría específica del régimen de la Ley 19.628 vigente hoy, que no se completó en detalle en esta fase — `privacy/rights-request-protocol.md` RIGHTS-Q3, `HIGH`]].
- **A partir de 2026-12-01:** plazo de 30 días corridos (+30 de prórroga), nueva Agencia de Protección de Datos Personales (APDP).

## 5. Anexo — España / Unión Europea

- **Autoridad:** AEPD (Agencia Española de Protección de Datos).
- **Base normativa:** GDPR (Reglamento (UE) 2016/679) + LOPDGDD.
- **Derechos y plazo:** 1 mes (30 días), +2 meses en casos complejos.
- **Notificación de brechas:** 72 horas a la AEPD (art. 33-34 GDPR).
- **DPO:** depende de si Hireeo hace monitoreo sistemático a gran escala — [[DECISION REQUIRED: `DPO-Q2`, análisis pendiente con Fase de IA]].
- **Transferencias:** ver §1.6 — Chile requiere SCC, EE.UU. depende de certificación DPF por proveedor.

## 6. Anexo — Estados Unidos

Ver documento separado `04-us-privacy-notices.md` para el aviso específico de California y demás estados — **Hireeo probablemente no alcanza hoy los umbrales de ninguna ley estatal de privacidad integral** (`privacy/gap-assessment-and-retention-rules.md` §1). Este anexo se limita a remitir a ese documento para no duplicar contenido.

---

## Hechos que requieren confirmación antes de publicar

Ver §0 (bloqueadores) — son condición previa a cualquier publicación, no solo a esta sección.

## Revisión por abogado local pendiente

Ningún anexo de este documento es publicable sin revisión de abogado habilitado en su jurisdicción respectiva. El anexo de Chile es el más incompleto (requiere auditoría de la Ley 19.628 vigente, no realizada en esta fase). El núcleo global (§1) no puede publicarse mientras persistan los bloqueadores de §0, en particular la brecha de consentimiento de cookies (§1.5) y la ausencia de un canal de derechos (§1.8).
