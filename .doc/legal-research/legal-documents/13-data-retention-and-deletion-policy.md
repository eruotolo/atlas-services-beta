# 13 — Política de Retención y Eliminación de Datos (interna) y procedimiento de derechos de titulares

**Audiencia:** interna (Legal, Ingeniería, Soporte, Dirección) — **no es un documento público**.
**Jurisdicción/cobertura:** Uruguay, Argentina, Chile, España/UE, Estados Unidos.
**Versión:** v0.1 — borrador.
**Fecha de vigencia propuesta:** no aplica hasta que se resuelvan las dependencias técnicas de §2.
**Estado:** 🟡 borrador — depende enteramente de decisiones de producto/ingeniería aún no confirmadas.

## 0. Hechos que requieren confirmación antes de publicación/adopción

Este documento **no fija plazos de retención definitivos**. Traduce a formato de política interna las tablas condicionadas ya construidas en `privacy/gap-assessment-and-retention-rules.md` §2 y el protocolo de derechos de `privacy/rights-request-protocol.md`. Todo valor marcado `[[DECISION REQUIRED]]` bloquea la publicación de este documento como política operativa real.

## 1. Reglas de retención por categoría (heredadas de `privacy/gap-assessment-and-retention-rules.md` §2 — no se reinventan aquí)

| Categoría de dato | Plazo propuesto | Estado |
|---|---|---|
| Datos de cuenta activa | Mientras exista relación contractual | `[[DECISION REQUIRED: confirmar si existe proceso de eliminación de cuentas inactivas]]` |
| Datos tras eliminación de cuenta | Propuesta: 30-90 días de período de gracia antes de eliminación definitiva | `[[DECISION REQUIRED: decisión de Producto — no existe hoy este flujo en el código]]` |
| Facturación e impuestos | No fijado — depende de normativa fiscal específica por país (Fase 8, `payments-tax/02-vat-digital-tax-and-invoicing.md`) | `[[DECISION REQUIRED: contador local por país]]` |
| Logs de seguridad/acceso | Propuesta: 90-180 días (práctica de industria, no mínimo legal) | `[[DECISION REQUIRED: confirmar si existen logs hoy y por cuánto tiempo se conservan técnicamente]]` |
| Backups | No fijado | `[[DECISION REQUIRED: Ingeniería debe confirmar configuración real de backups — BLOCKING]]` |
| Mensajería entre usuarios | No fijado — sin base legal específica identificada | `[[DECISION REQUIRED: pendiente de política de moderación, marketplace/02-trust-and-safety-program.md]]` |

**Regla de aplicación mientras no se resuelvan los puntos anteriores:** no eliminar datos que puedan ser evidencia de una disputa activa, un incidente de seguridad en investigación (ver documento 14) o una obligación fiscal/AML pendiente (ver `payments-tax/03-aml-kyc-thresholds.md`).

## 2. Procedimiento de derechos de titulares (heredado de `privacy/rights-request-protocol.md` — no se reinvestiga aquí)

| Paso | Acción | Plazo aplicable |
|---|---|---|
| 1 | Recepción de la solicitud por el canal designado | `[[DECISION REQUIRED: canal oficial — email, formulario o ticket, ver RIGHTS-Q1]]` |
| 2 | Autenticación del solicitante | `[[DECISION REQUIRED: mecanismo de autenticación, ver RIGHTS-Q2]]` |
| 3 | Registro interno con fecha de recepción | Inmediato — sin esto no se puede demostrar cumplimiento del plazo |
| 4 | Resolución | **SLA interno recomendado: 5 días hábiles** (estándar más exigente entre las jurisdicciones — Uruguay y Argentina exigen 5 días hábiles; España/UE 30 días; California 45 días) |
| 5 | Notificación al titular y cierre del registro | Dentro del mismo SLA |

**Excepción Chile:** el plazo de 30 días corridos de la Ley 21.719 **no está vigente hoy** (entra en vigor 2026-12-01). Mientras tanto aplica el régimen de la Ley 19.628 — `[[DECISION REQUIRED: auditar el plazo vigente bajo Ley 19.628, ver RIGHTS-Q3, pendiente]]`.

## 3. Responsable interno

`[[DECISION REQUIRED: asignar responsable de tramitar solicitudes de derechos y de demostrar cumplimiento del plazo — ver RIGHTS-Q4]]`.

## 4. Dependencias técnicas

- No existe hoy un endpoint/formulario de derechos en el repositorio (`backend/src/modules/`).
- No existe hoy un flujo de eliminación de cuentas inactivas ni de "período de gracia" post-eliminación.
- La configuración real de backups no está confirmada — sin esto, no se puede saber cuánto tiempo persisten los datos "eliminados" en copias de respaldo.

## 5. Revisión por abogado local pendiente

Este documento no puede activarse como política operativa hasta que se resuelvan los `[[DECISION REQUIRED]]` de §1-§3, y hasta que un abogado habilitado en cada jurisdicción confirme los plazos fiscales/AML de retención obligatoria (Uruguay DGI, Argentina AFIP/ARCA, España AEAT) que hoy no están investigados con el detalle suficiente para fijarse en una política.
