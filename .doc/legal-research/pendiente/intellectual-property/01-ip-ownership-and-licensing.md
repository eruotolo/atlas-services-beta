# 01 — Titularidad de IP y cadena de derechos (Fase 9)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con IA.
- **Fecha:** 2026-07-23
- **Versión:** 0.1 (borrador de descubrimiento)
- **Método:** inspección no destructiva del repositorio. No se modificó código ni configuración.
- **Alcance:** titularidad del software, marca, dominio, activos creativos y cadena de derechos (fundadores, contratistas, contributors). El inventario de licencias open source vive en [`02-open-source-license-inventory.md`](./02-open-source-license-inventory.md); contenido de usuarios e IA en [`03-user-content-and-ai-generated-content.md`](./03-user-content-and-ai-generated-content.md); copyright/DMCA/marcas en [`04-copyright-dmca-and-trademark.md`](./04-copyright-dmca-and-trademark.md).

> **Aviso.** Expediente de investigación técnica, no asesoramiento legal. Todo borrador jurídico requiere revisión de abogado habilitado por jurisdicción. Se distingue **hecho confirmado** (evidencia en repo), **inferencia técnica**, **supuesto pendiente** y **obligación jurídica**.

---

## A. Resumen ejecutivo

La titularidad de la IP de Hireeo **no está formalizada en el repositorio**. No existe archivo `LICENSE` ni `NOTICE` en la raíz del monorepo ni en los submódulos frontend/backend; no hay acuerdos de cesión de IP de fundadores o contratistas, ni prueba de titularidad sobre marca, dominio o activos creativos. La **única mención en código a una razón social** es el pie de página `© 2026 HIREEO INC · BUILT FOR LATAM`, una afirmación de entidad ("Hireeo Inc") que **no está respaldada** por ningún documento de constitución en el repo. Esto convierte la titularidad en un **supuesto BLOCKING** (S1 de [`../01-scope-assumptions-and-open-questions.md`](../01-scope-assumptions-and-open-questions.md)) para cualquier documento legal publicable.

Las tres brechas más urgentes de este archivo:

1. **[BLOCKING]** Ausencia de entidad legal documentada + afirmación no verificada "HIREEO INC" en el footer → riesgo de publicidad de una entidad inexistente o no constituida y de imposibilidad de identificar al titular del software/marca.
2. **[BLOCKING]** Ausencia de cadena de cesión de IP (fundadores, contratistas, contributors) → el código, diseño, copy y prompts podrían no pertenecer a la entidad que opera Hireeo.
3. **[HIGH]** Ausencia de `LICENSE`/`NOTICE` y de proceso de aprobación de licencias (SBOM) → titularidad del software no declarada y obligaciones de atribución de terceros sin gestionar (ver [`02`](./02-open-source-license-inventory.md)).

---

## B. Tabla de evidencia (fuente primaria del repositorio)

| ID | Archivo:línea | Fragmento / observación | Conclusión limitada |
|---|---|---|---|
| IP-01 | `frontend/src/lib/i18n/locales/cl.json:700` (y `ar/es/us/uy.json:700`) | `"copyrightLine": "© 2026 HIREEO INC · BUILT FOR LATAM"` | Única afirmación de razón social en código: "HIREEO INC". No verificada. |
| IP-02 | `frontend/src/features/auth/components/AuthShell/AuthShell.tsx:48` | `© 2026 HIREEO · BUILT FOR LATAM` | Aviso de copyright inconsistente (sin "INC") en pantalla de auth. |
| IP-03 | `frontend/src/app/layout.tsx:156-157` | `email: 'info@hireeo.app'`, `foundingDate: '2025'` (JSON-LD Organization) | Marca y dominio `hireeo.app`; "founding 2025" en metadata, no en registro mercantil. |
| IP-04 | Búsqueda negativa `LICENSE*`/`NOTICE*` en raíz, `frontend/`, `backend/` | No existe | Titularidad del software no formalizada; sin archivo de aviso de terceros. |
| IP-05 | `appmobile/LICENSE:1-3` | `The MIT License (MIT) — Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)` | El **único** `LICENSE` del repo es el de la plantilla Expo, **no** un otorgamiento de Hireeo. Atribuye copyright a Expo, no a Hireeo. |
| IP-06 | `frontend/src/lib/i18n/locales/cl.json` (terms §7) | Contacto legal: `legal@hireeo.app` | Existe buzón legal declarado (canal, no entidad). |
| IP-07 | `backend/src/modules/ai-agents/prompts/hireeo-system.prompt.ts:1-19` | System prompt propietario de Hireeo | Activo creativo (prompt) generado internamente; sin registro de autoría/cesión. |
| IP-08 | Búsqueda negativa: razón social / RUT / CIF / NIF / domicilio | Sin coincidencias | No hay entidad legal ni domicilio en código (confirma S1 BLOCKING). |

---

## C. Análisis por categoría de activo

### C.1 Software (código fuente)

- **Hecho confirmado:** el monorepo se compone de tres submódulos git (`hireeo-front`, `hireeo-back`, `hireeo-mobile`, ver [`../code-audit/00-repository-inventory.md`](../code-audit/00-repository-inventory.md)). Todos marcados `"private": true` en sus `package.json`. **No** hay `LICENSE` propio en frontend/backend.
- **Inferencia técnica:** al no publicar licencia y marcar los paquetes como privados, el software es, por defecto, "todos los derechos reservados" del autor (los contribuyentes). Esto es adecuado para software propietario, pero **no** resuelve *quién* es el titular: por defecto los derechos nacen en cada autor/contribuyente hasta que exista una cesión.
- **Riesgo:** sin cesión de IP, la entidad operadora puede no ser titular del código que explota comercialmente. Un fundador o contratista saliente podría reclamar derechos sobre su contribución.
- **Obligación / recomendación:** ejecutar cesiones de IP (ver §D) y añadir un archivo de aviso de propiedad y de terceros (ver [`02`](./02-open-source-license-inventory.md)).

### C.2 Marca "Hireeo" y dominio

- **Hecho confirmado:** la marca denominativa "Hireeo" y el dominio `hireeo.app` se usan de forma consistente en producto (layout, footer, prompts, correos `info@`/`legal@`/`privacidad@hireeo.app`).
- **Supuesto pendiente [HIGH]:** no se puede verificar desde el repositorio si "Hireeo" está **registrada como marca** en INAPI (CL), INPI (AR), DINAPI (UY/futuro PY), OEPM/EUIPO (ES/UE) o USPTO (US), ni si el dominio está a nombre de la entidad operadora. → **[[DECISION REQUIRED]]** confirmar estado registral de marca por jurisdicción y titularidad del dominio. Detalle de riesgo marcario en [`04`](./04-copyright-dmca-and-trademark.md).

### C.3 Entidad "Hireeo Inc" (footer)

- **Hecho confirmado:** el footer localizado en los 5 países declara `© 2026 HIREEO INC` (IP-01).
- **Inferencia técnica:** el sufijo "Inc" sugiere una sociedad tipo *corporation* (EE. UU.). Contrasta con "BUILT FOR LATAM" y con la ausencia total de datos de constitución.
- **Riesgo:** publicar un aviso de copyright a nombre de una entidad que **puede no estar constituida** (o estarlo en otra forma/jurisdicción) es una afirmación potencialmente engañosa y complica identificar al responsable del tratamiento (Q1/Q3 BLOCKING de `../01`). La inconsistencia "HIREEO INC" (footer) vs "HIREEO" (AuthShell) agrava el punto.
- **[[DECISION REQUIRED]]** Confirmar: ¿existe "Hireeo Inc"? ¿país de constitución, número de registro, domicilio? ¿es la titular del software, la marca y el dominio, y la operadora de la plataforma? Hasta confirmarlo, el aviso de copyright del código **no debe tratarse como prueba de titularidad**.

### C.4 Activos creativos (UI, copy, prompts, iconografía)

- **Hecho confirmado:** existen activos propios: textos legales i18n, system prompt de IA (IP-07), diseño de UI. `CLAUDE.md` exige iconos vía MCP `icons0`; no obstante `react-icons@^5.5.0` figura como dependencia (nota de gobernanza, ver [`02`](./02-open-source-license-inventory.md)).
- **Riesgo / supuesto [HIGH]:** no hay registro de autoría ni de licencia de fuentes tipográficas, imágenes o iconos usados. Las imágenes de demo provienen de `images.unsplash.com`, `placehold.co`, `loremflickr.com` (`frontend/next.config.ts` `remotePatterns`, ver `00-repository-inventory.md §3`) — **contenido de terceros que no debe llegar a producción sin verificar licencia**. → **[[DECISION REQUIRED]]** inventariar y licenciar fuentes/imágenes/iconos de producción; retirar assets de placeholder.

---

## D. Cadena de titularidad — cesiones y acuerdos (brecha)

| Elemento requerido | Estado en repo | Prioridad |
|---|---|---|
| Cesión de IP de **fundadores** a la entidad | No documentado | **BLOCKING** |
| Acuerdos de IP/confidencialidad con **contratistas/freelancers** (código, diseño, copy) | No documentado | **BLOCKING** |
| Cláusula "work made for hire" / cesión en contratos de **empleados** | No documentado | HIGH |
| Contributor License Agreement (CLA) o DCO para contribuyentes externos | No aplica visible / no documentado | LOW |
| Titularidad y licencia de **datasets** propios (si se crean para IA) | No hay datasets propios en repo | CONDICIONAL |
| Derechos morales: renuncia/limitación donde la ley lo permita (CL/AR/UY/ES reconocen derechos morales irrenunciables del autor) | No documentado | HIGH |

> **Nota jurídica (no cerrada):** en las jurisdicciones LatAm y España el derecho de autor nace en la persona física creadora y los **derechos morales** son, en general, irrenunciables e intransferibles; solo se ceden los derechos **patrimoniales** y requieren instrumento escrito. Una cesión válida debe redactarse por jurisdicción y **no** puede resolverse con una cláusula única estilo EE. UU. de "work made for hire". Confirmar con abogado local.

---

## E. Proceso de aprobación de licencias / SBOM (recomendación, no existente)

**Hecho confirmado:** no existe SBOM, archivo `NOTICE`, ni proceso de aprobación de licencias en el repo (IP-04; `00-repository-inventory.md §4`). Se **recomienda** (buena práctica, no obligación legal general) implementar, **antes del lanzamiento**:

1. **Generación de SBOM** (p. ej. CycloneDX/SPDX) en CI para frontend, backend y appmobile, incluyendo dependencias **transitivas** (hoy solo se revisaron las directas).
2. **Escáner de licencias** con política de "denylist" (bloquear AGPL/GPL/SSPL en código distribuido salvo aprobación) y "allowlist" (MIT/Apache-2.0/BSD/ISC).
3. **Archivo `NOTICE`/atribuciones** cuando se distribuya la app móvil (Apache-2.0 y varias MIT exigen conservar avisos de copyright — ver [`02`](./02-open-source-license-inventory.md)).
4. **Gate de aprobación** documentado: toda dependencia nueva pasa por revisión de licencia antes de merge; propietario sugerido: Engineering + Legal.

> No se afirma que este proceso exista: **no existe** a la fecha. Es una recomendación con criterio de aceptación verificable (SBOM generado en CI + política escrita).

---

## F. Matriz obligación → evidencia → propietario → prioridad

| # | Acción | Evidencia de cierre | Propietario sugerido | Prioridad |
|---|---|---|---|---|
| 1 | Confirmar/constituir entidad legal y alinear footer "HIREEO INC" | Certificado de constitución + footer corregido | Legal / Founders | **BLOCKING** |
| 2 | Ejecutar cesiones de IP (fundadores, contratistas, empleados) por jurisdicción | Acuerdos firmados en repositorio legal | Legal | **BLOCKING** |
| 3 | Confirmar titularidad de dominio y estado registral de marca por país | Whois + certificados/solicitudes de marca | Legal | HIGH |
| 4 | Añadir `LICENSE` (propietario) + `NOTICE` de terceros | Archivos en repo | Engineering | HIGH |
| 5 | Implementar SBOM + política de licencias en CI | Pipeline + política escrita | Engineering / Legal | HIGH |
| 6 | Inventariar y licenciar fuentes/imágenes/iconos de producción; retirar placeholders | Inventario de assets + licencias | Product / Design | HIGH |

---

## G. Revisión por abogado local pendiente

Este documento **no** constituye determinación de titularidad. Antes de publicar cualquier término o aviso: validar constitución de la entidad, forma y validez de las cesiones de IP por jurisdicción (derechos morales), y estado registral de marca y dominio. Hechos que deben validarse: existencia y forma de "Hireeo Inc"; titularidad del dominio `hireeo.app`; registros de marca; existencia de cualquier contrato de fundadores/contratistas fuera del repo.
