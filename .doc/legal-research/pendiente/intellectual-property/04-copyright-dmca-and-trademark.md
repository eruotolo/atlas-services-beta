# 04 — Copyright/DMCA (notice-and-takedown) y marcas (Fase 9)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA.
- **Fecha:** 2026-07-23
- **Versión:** 0.1
- **Alcance:** (1) procedimientos de reporte de infracción de copyright de terceros (DMCA / notice-and-takedown y equivalentes locales); (2) marcas — riesgo de "Hireeo" y riesgo de suplantación de prestadores.

> **Aviso.** Investigación técnica, no asesoramiento legal. Se distingue hecho / inferencia / supuesto / obligación.

---

## A. Copyright de terceros y notice-and-takedown

### A.1 Estado en el código (brecha HIGH)

**Hecho confirmado:** **no existe** en el código ningún mecanismo de reporte/denuncia de contenido infractor accesible al público (ni para reseñas, ni servicios, ni imágenes). La única mención es texto en el **panel admin** de reseñas, no un canal para terceros afectados.

| ID | Archivo:línea | Observación | Conclusión |
|---|---|---|---|
| CR-01 | Búsqueda negativa `dmca|takedown|report content|infring|denunciar` en `frontend/src`, `backend/src` | Sin mecanismo público | No hay notice-and-action de copyright. Coincide con `00-repository-inventory.md §5.6 [HIGH]`. |
| CR-02 | `frontend/src/features/reviews/components/admin/CalificacionForm/CalificacionForm.tsx:211` | *"Si esta publicación infringe las normas o tiene múltiples denuncias..."* | Texto en **panel admin**, no canal de denuncia para el público/titulares de derechos. |
| CR-03 | `ratings.service.ts:61-78`; `ratings.controller.ts:48-55` | Moderación **previa** de reseñas (PENDING→ACTIVE) por ADMIN | Cubre reseñas, **no** infracción de copyright en imágenes/descripciones ni denuncia externa. |
| CR-04 | `frontend/src/lib/i18n/locales/cl.json` (terms) | Contacto `legal@hireeo.app` | Existe buzón, pero **no** un procedimiento estructurado de notice-and-takedown. |

**¿La moderación de reseñas alcanza para notice-and-takedown?** **No.** La moderación previa de reseñas es un control de contenido interno (calidad/spam), no un procedimiento de **infracción de copyright de terceros**, que requiere: canal de recepción de notificaciones, elementos mínimos de la notificación, retirada expedita, **contra-notificación**, política de **infractor reincidente** (repeat infringer) y conservación de evidencia. Nada de eso existe.

### A.2 Marco legal aplicable (obligación / puerto seguro)

> Análisis preliminar; el detalle por jurisdicción se consolida en `country-analysis/` y `marketplace/`.

| Jurisdicción | Régimen de alojamiento / puerto seguro | Nota |
|---|---|---|
| **EE. UU.** | **DMCA §512** (17 U.S.C.) — puerto seguro para alojamiento **condicionado** a: designar y registrar un **agente DMCA** ante el Copyright Office, publicar el proceso, retirar expeditamente, contra-notificación y política de infractor reincidente. | Sin agente designado ni proceso → **no** hay puerto seguro DMCA. **[[DECISION REQUIRED]]** designar agente si hay usuarios/alojamiento con nexo US. |
| **UE / España** | **DSA** (Reg. UE 2022/2065) sustituye el safe harbour de alojamiento de la Directiva 2000/31: exige **mecanismo de notice-and-action** accesible, motivación de decisiones, punto de contacto y (según clasificación) sistema interno de reclamaciones. Ver [`../country-analysis/spain-eu.md`](../country-analysis/spain-eu.md). | Analizado en el país; aquí se referencia. Sin notice-and-action → riesgo de perder la exención de responsabilidad como hosting. |
| **Chile** | Régimen de limitación de responsabilidad de ISP (Ley 20.435, procedimiento **judicial** de bajada) + Ley 17.336 de propiedad intelectual. | Chile usa notificación **con orden judicial** para bajada con efecto de puerto seguro; conviene igualmente un canal voluntario. |
| **Argentina** | Sin régimen legal específico de notice-and-takedown; jurisprudencia (CSJN "Rodríguez c/ Google") exige **notificación fehaciente** para responsabilidad del intermediario. | Recomendable canal de notificación fehaciente. |
| **Uruguay** | Ley 9.739 de derecho de autor; sin régimen específico de safe harbour de plataformas. | Recomendable canal + respuesta diligente. |

**Conclusión:** aunque los regímenes difieren (DMCA en US, DSA en UE, judicial en CL, fehaciente en AR/UY), **todos** se benefician de un **canal único de notificación de infracción** con proceso documentado. Hoy no existe. Un mecanismo global de notice-and-action (con especificidades locales) es la mitigación más eficiente. → **[[DECISION REQUIRED]]** definir el procedimiento y, para US, decidir sobre el agente DMCA.

---

## B. Marcas

### B.1 Marca "Hireeo" — pregunta abierta (HIGH)

- **Hecho confirmado:** uso comercial consistente de "Hireeo" y dominio `hireeo.app`; aviso `© 2026 HIREEO INC` (ver [`01`](./01-ip-ownership-and-licensing.md) IP-01).
- **No verificable en el repositorio:** si "Hireeo" está **registrada** como marca en INAPI (CL), INPI (AR), DINAPI (UY), OEPM (ES) / **EUIPO** (marca de la UE), USPTO (US), ni si hay conflictos con marcas anteriores similares. No puedo confirmar registros marcarios reales. **Pregunta abierta.**
- **Riesgo:** (a) usar "Inc"/símbolos sin registro puede inducir a error; (b) lanzar en 5 países sin *clearance* de marca expone a oposición o cese de uso por un titular anterior; (c) el `.app` no sustituye el registro marcario.
- **[[DECISION REQUIRED]]** Encargar búsqueda de disponibilidad (*trademark clearance*) y registro de "Hireeo" en las clases pertinentes (probable Niza 35/42/45) por jurisdicción de lanzamiento; confirmar titularidad del dominio a nombre de la entidad.

### B.2 Uso nominativo y nombres de prestadores

- **Hecho / inferencia:** los prestadores publican con sus propios nombres comerciales y pueden mencionar marcas de terceros (p. ej. "reparo electrodomésticos marca X"). El **uso nominativo** legítimo (referirse a una marca para describir un servicio) es admisible, pero el ToS debería regular el uso de marcas de terceros por los prestadores y prohibir su uso engañoso.
- **Brecha:** el ToS no aborda uso de marcas de terceros ni el uso de la marca "Hireeo" por prestadores/afiliados (lineamientos de marca). → tratar en Fase 14.

### B.3 Suplantación de prestadores (impersonation) — riesgo real

- **Hecho confirmado (agravantes técnicos):** el registro **no verifica email** (`emailVerified` ausente) ni identidad al publicar (KYC es **stub**); `GET /users/:id` expone email/teléfono de prestadores; el chat/perfiles no tienen verificación → **facilita crear perfiles falsos suplantando a un prestador real** o a la propia marca Hireeo. Ver `00-repository-inventory.md §5.1` (verificación de email ausente) y §5.3 (KYC stub).
- **Riesgo:** perfiles falsos que usurpan identidad/marca de un prestador legítimo (daño reputacional, fraude al cliente, responsabilidad de la plataforma). También suplantación de la marca "Hireeo" (phishing con dominios similares — no verificable en repo).
- **Mitigación (coordinar Fase 10/11):** verificación de email (control técnico), KYC real para prestadores, señal de "verificado", canal de denuncia de suplantación, y — a nivel marca — monitoreo de dominios/typosquatting. → **[[DECISION REQUIRED]]** definir el nivel de verificación de prestadores antes del lanzamiento.

---

## C. Matriz obligación → propietario → prioridad

| # | Acción | Propietario | Prioridad |
|---|---|---|---|
| 1 | Diseñar procedimiento global de notice-and-action de copyright (recepción, retirada, contra-notificación, reincidente, evidencia) | Legal / Trust & Safety | HIGH |
| 2 | Decidir designación de agente **DMCA** ante US Copyright Office (si hay nexo US) | Legal | HIGH (condicional US) |
| 3 | Alinear notice-and-action con **DSA** (ver spain-eu.md) para el alcance UE | Legal | HIGH |
| 4 | *Trademark clearance* + registro de "Hireeo" por jurisdicción; confirmar dominio | Legal | HIGH |
| 5 | Implementar verificación de email + KYC real de prestadores + señal de verificado (anti-suplantación) | Engineering / Product | HIGH |
| 6 | Regular en ToS: uso de marcas de terceros por prestadores y uso de la marca Hireeo | Legal | MEDIUM |

---

## D. Revisión pendiente

Este análisis **no** confirma registros marcarios (imposible desde el repo) ni sustituye el *clearance* profesional. Los regímenes de puerto seguro (DMCA/DSA/CL judicial/AR-UY fehaciente) deben validarse por abogado local antes de publicar cualquier política de copyright. Hechos a validar: registros de marca "Hireeo"; titularidad del dominio; existencia de nexo US que active DMCA; clasificación DSA (en spain-eu.md).
