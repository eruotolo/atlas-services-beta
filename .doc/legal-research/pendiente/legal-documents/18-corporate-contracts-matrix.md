# 18 — Matriz de contratos corporativos necesarios

**Audiencia:** interna (Dirección, Legal) — hoja de ruta de contratos a formalizar.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador.
**Estado:** 🟡 borrador — consolida brechas ya identificadas en `intellectual-property/01-ip-ownership-and-licensing.md` §D, `employment-and-platform-work/` (si existe), y los documentos 15-17 de esta misma carpeta.

## Matriz: contrato → parte → estado actual → prioridad → dependencia

| Contrato | Parte(s) | Estado actual | Prioridad | Dependencia |
|---|---|---|---|---|
| Cesión de IP de fundadores a la entidad operadora | Fundadores ↔ entidad Hireeo | **No documentado** en el repo (`intellectual-property/01` §D) | `BLOCKING` | Requiere primero confirmar qué entidad legal existe (`[[DECISION REQUIRED]]`, ver `01-scope-assumptions-and-open-questions.md` Q1/Q3 y `intellectual-property/01` §C.3 — "Hireeo Inc" no está confirmada como entidad real) |
| Acuerdos de IP/confidencialidad con contratistas y freelancers (código, diseño, copy) | Contratistas ↔ Hireeo | **No documentado** (`intellectual-property/01` §D) | `BLOCKING` | Ninguna — puede redactarse en paralelo a la definición de entidad |
| Contrato de empleo / contratista con cláusula de cesión IP ("work made for hire" adaptada por jurisdicción) | Empleados/contratistas ↔ Hireeo | **No documentado**; nota jurídica ya señalada: los derechos morales son irrenunciables en UY/AR/CL/ES — no puede resolverse con una cláusula única estilo EE.UU. (`intellectual-property/01` §D) | `HIGH` | `[[DECISION REQUIRED: pendiente de employment-and-platform-work/ — si esa fase aún no está completa en este expediente, tratar esta fila como no resuelta y no asumir una relación laboral o de prestador independiente sin evidencia]]` |
| NDA (acuerdo de confidencialidad general) | Empleados/contratistas/proveedores/inversores ↔ Hireeo | **No documentado en el repo** — no es verificable desde código de todos modos (documento externo) | `MEDIUM` | Ninguna |
| DPA / Anexo de tratamiento de datos | Hireeo ↔ cada cliente empresarial y cada proveedor/subencargado | **No documentado** — ver plantilla en el documento 15 de esta carpeta | `HIGH` | Documento 15 (`15-dpa-and-subprocessor-annex.md`); depende de `vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §2 (ningún proveedor confirmado contractualmente) |
| Acuerdos con proveedores (Stripe, MercadoPago, Google, Cloudinary, Brevo, Vercel) | Hireeo ↔ cada proveedor | Uso técnico confirmado en código; **contrato/DPA no confirmado** (`vendors-and-transfers/vendor-inventory-and-dpa-checklist.md` §2) | `BLOCKING` para los de pagos (Stripe/MercadoPago) y base de datos; `HIGH` para el resto | Documento 15 |
| Contrato con PSP definiendo merchant of record | Hireeo ↔ PSP elegido | **No definido** — pagos en stub/mock | `BLOCKING` | `payments-tax/01-payment-architecture-scenarios-and-licensing.md` (PAY-Q1/PAY-Q2) |
| Registro de marca "Hireeo" | Hireeo ↔ INAPI/INPI/DINAPI/OEPM-EUIPO/USPTO según país | **No verificable desde el repo si existe registro** (`intellectual-property/01` §C.2) | `HIGH` | `[[DECISION REQUIRED: confirmar estado registral por país]]` |
| Titularidad del dominio `hireeo.app` | Hireeo | **No verificable desde el repo a nombre de quién está registrado** | `HIGH` | Misma dependencia que la entidad legal (Q1/Q3) |
| Seguro de responsabilidad civil (general) | Hireeo | **No documentado / no evidenciable desde código** | `MEDIUM` (buena práctica, no obligación legal identificada per se) | Relacionado con `marketplace/01-platform-role-and-liability-analysis.md` §6 (seguros como buena práctica) |
| Seguro cibernético (data breach / ciberseguro) | Hireeo | **No documentado** | `MEDIUM` | Relacionado con documento 14 (respuesta a incidentes) |
| Licencias/permisos de propiedad intelectual de terceros (fuentes, iconos, imágenes de placeholder) | Hireeo ↔ proveedores de assets | **Riesgo confirmado**: imágenes de placeholder desde `images.unsplash.com`, `placehold.co`, `loremflickr.com` en producción sin licencia verificada (`intellectual-property/01` §C.4) | `HIGH` | `intellectual-property/02-open-source-license-inventory.md` |

## Bloqueadores transversales (ya identificados en otras fases, consolidados aquí)

1. **Entidad legal no confirmada** — bloquea la cesión de IP de fundadores, el registro de marca/dominio a nombre correcto, y la calificación de "Hireeo Inc" del footer como afirmación válida o potencialmente engañosa.
2. **Relación laboral vs. prestador independiente no confirmada** — bloquea qué tipo de contrato (empleo vs. servicios) corresponde a cada colaborador; depende de que `employment-and-platform-work/` complete este análisis.
3. **Ningún proveedor tiene DPA/contrato confirmado** — bloquea el documento 15 completo.

## Revisión por abogado local pendiente

Esta matriz es una hoja de ruta de qué contratos faltan, no una opinión sobre la validez o el contenido específico que cada contrato debe tener en cada jurisdicción — en particular, la cláusula de cesión de IP para empleados/contratistas debe redactarse por un abogado local en cada país dado que los derechos morales son irrenunciables en Uruguay, Argentina, Chile y España.
