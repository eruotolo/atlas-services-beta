# Protocolo de solicitudes de derechos de titulares (Fase 4.4)

**Última actualización:** 2026-07-23
**Fuente base:** investigación de fuentes primarias recopilada por agente Haiku 4.5 (`privacy/haiku-research-fase4-raw.md`), verificada contra fuentes oficiales por Sonnet 5 antes de su inclusión aquí.
**Estado:** 🟡 borrador — condicionado a que el flujo de autenticación de identidad del solicitante (hoy inexistente en el repo, ver `01-scope-assumptions-and-open-questions.md`) se implemente antes de publicar como política operativa.

## 0. Advertencia de alcance

Este documento describe **plazos y obligaciones legales de origen normativo**, no un procedimiento ya implementado en Hireeo. No existe hoy en el repositorio (`backend/src/modules/`) un endpoint, flujo o formulario para ejercer derechos de acceso/rectificación/eliminación/portabilidad/oposición. Antes de publicar cualquier aviso al usuario que prometa estos plazos, Producto/Ingeniería debe confirmar el canal real (ver §5, Preguntas abiertas).

## 1. Matriz comparativa de plazos

| Jurisdicción | Norma | Plazo de respuesta | Prórroga | Canal exigido | Coste al titular | Apelación |
|---|---|---|---|---|---|---|
| Uruguay | Ley 18.331 art. 12 | **5 días hábiles** desde recepción | No especificada en la ley | Formulario URCDP o correo electrónico; sin canal único obligatorio | No especificado | Acción de habeas data si se excede el plazo; sin apelación administrativa formal reglada |
| Argentina | Ley 25.326 arts. 16-18 | **5 días hábiles** desde recepción (supresión/rectificación) | No especificada | Sin canal único obligatorio | No especificado | Acción de habeas data; mecanismo administrativo de graduación de sanciones vía Res. AAIP 126/2024 (régimen sancionatorio, no de apelación del titular) |
| Chile | Ley 21.719 arts. 26-28 (**entra en vigor 2026-12-01** — HOY NO VIGENTE, rige aún Ley 19.628) | **30 días corridos** desde recepción | +30 días corridos en casos justificados | Ante el responsable del tratamiento | No especificado | Ante la nueva Agencia de Protección de Datos Personales (APDP) |
| España / UE | GDPR art. 12(3) y 15-21 | **1 mes (30 días)** desde recepción | +2 meses adicionales en casos complejos o múltiples solicitudes | "Medios fácilmente accesibles" — sin canal único obligatorio | Gratuito, salvo solicitud manifiestamente infundada o excesiva (art. 12(5)) | Ante la autoridad de control (AEPD) y, subsidiariamente, tribunales |
| EE.UU. — California (CCPA/CPRA) | Cal. Civ. Code § 1798.100-130 | **45 días calendario** desde recepción (acuse de recibo en 10 días hábiles) | +45 días adicionales si es "razonablemente necesario" | Debe aceptar múltiples métodos; sin canal único obligatorio | Gratuito, salvo solicitudes repetitivas o manifiestamente infundadas | Revisión humana ante negativa (mecanismo interno); exenciones por FERPA/GLBA/CCRA |

## 2. Hechos confirmados vs. supuestos

- **Hecho confirmado (normativo):** los plazos de la tabla anterior están respaldados por texto legal primario (ver fuentes en §4).
- **Supuesto pendiente de confirmar (producto):** qué canal usará Hireeo para recibir y tramitar estas solicitudes (email dedicado, formulario en `/perfil`, ticket de soporte). **No existe evidencia en el repo de un flujo de derechos implementado.**
- **Supuesto pendiente de confirmar (producto):** quién internamente asume el rol de responsable de tramitar la solicitud dentro del plazo (¿Soporte? ¿Legal? ¿un rol admin específico?).
- **Inferencia técnica razonable:** dado que Hireeo no opera aún en Chile con Ley 21.719 vigente, el plazo aplicable en Chile hoy es el de la Ley 19.628 vigente (no auditada en detalle en esta fase — **BLOCKING**, ver §5).

## 3. Diseño de protocolo propuesto (condicionado a decisión de producto)

1. **Canal único de entrada** (propuesta, no implementada): dirección de correo dedicada o formulario en el perfil del usuario, visible desde la Política de Privacidad.
2. **Autenticación del solicitante** antes de procesar: verificar que quien solicita es el titular de los datos (evitar suplantación). Mecanismo concreto **por definir** — no inventar aquí un flujo que no exista.
3. **Registro interno** de la solicitud con fecha de recepción, para poder demostrar cumplimiento del plazo más corto aplicable (Uruguay/Argentina: 5 días hábiles).
4. **Plazo operativo interno recomendado:** dado que Uruguay y Argentina exigen 5 días hábiles, y Hireeo es multi-país con una sola base de código, se recomienda operar bajo el estándar más exigente (5 días hábiles) como SLA interno global, con las prórrogas específicas de cada país documentadas para casos complejos.
5. **Excepciones:** documentar caso por caso cuándo una solicitud es "manifiestamente infundada o excesiva" (GDPR/CCPA) antes de cobrar o rechazar — no rechazar por defecto.

## 4. Fuentes primarias

| ID | Fuente | Órgano emisor | URL | Fecha de publicación | Fecha de acceso | Artículo |
|---|---|---|---|---|---|---|
| PRIV-RIGHTS-UY-01 | Ley 18.331 de Protección de Datos Personales | Poder Legislativo de Uruguay | https://www.impo.com.uy/bases/leyes/18331-2008/15 | 2008 | 2026-07-23 | Art. 12-13 |
| PRIV-RIGHTS-AR-01 | Ley 25.326 de Protección de Datos Personales | Congreso de Argentina | https://servicios.infoleg.gob.ar/infolegInternet/anexos/395000-399999/399750/norma.htm | 2000 | 2026-07-23 | Art. 16-18, 43-44 |
| PRIV-RIGHTS-AR-02 | Resolución AAIP 126/2024 | Agencia de Acceso a la Información Pública (AAIP) | https://www.boletinoficial.gob.ar/detalleAviso/primera/308122/20240524 | 2024-05-24 | 2026-07-23 | Régimen sancionatorio (no crea plazo nuevo de respuesta al titular) |
| PRIV-RIGHTS-CL-01 | Ley 21.719 (modifica Ley 19.628) | Diario Oficial de Chile | https://www.diariooficial.interior.gob.cl/edicionelectronica/index.php?date=13-12-2024&edition=44023 | 2024-12-13 | 2026-07-23 | Art. 26-28 — **entrada en vigor 2026-12-01, aún no vigente a la fecha de este informe** |
| PRIV-RIGHTS-EU-01 | Reglamento (UE) 2016/679 (GDPR) | Parlamento Europeo y Consejo | https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng | 2016-05-04 | 2026-07-23 | Art. 12, 15-21 |
| PRIV-RIGHTS-EU-02 | AEPD — Tus derechos de protección de datos | Agencia Española de Protección de Datos | https://www.aepd.es/preguntas-frecuentes/1-tus-derechos/2-tus-derechos-de-proteccion-de-datos | 2024 | 2026-07-23 | Guía interpretativa |
| PRIV-RIGHTS-US-01 | California Consumer Privacy Act / CPRA | Estado de California | Cal. Civ. Code § 1798.100-130 | 2020 (CCPA) / 2023-01-01 (CPRA) | 2026-07-23 | § 1798.100-130 |
| PRIV-RIGHTS-US-02 | CPPA — FAQ regulatorio | California Privacy Protection Agency | https://cppa.ca.gov/faq.html | 2024 | 2026-07-23 | § 1798.100(d) |

## 5. Preguntas abiertas (para `01-scope-assumptions-and-open-questions.md`)

| # | Pregunta | Prioridad |
|---|---|---|
| RIGHTS-Q1 | ¿Cuál será el canal oficial para recibir solicitudes de derechos (email, formulario, ticket)? | `BLOCKING` |
| RIGHTS-Q2 | ¿Qué mecanismo de autenticación se usará para verificar la identidad del solicitante? | `BLOCKING` |
| RIGHTS-Q3 | ¿Qué régimen vigente aplica hoy en Chile (Ley 19.628) mientras la Ley 21.719 no entra en vigor (2026-12-01)? Falta auditoría específica de la ley vigente actual. | `HIGH` |
| RIGHTS-Q4 | ¿Quién internamente es responsable de tramitar y de demostrar el cumplimiento del plazo? | `MEDIUM` |

## 6. Revisión por abogado local pendiente

Este documento es un borrador técnico-normativo. Requiere validación de abogado habilitado en cada una de las cinco jurisdicciones antes de convertirse en política operativa o de publicarse en un aviso al usuario. En particular: la interpretación del régimen chileno vigente (Ley 19.628) no fue auditada en esta fase y debe completarse antes de cualquier afirmación pública sobre plazos en Chile.
