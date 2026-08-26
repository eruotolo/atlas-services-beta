# accessibility-and-content/01 — Auditoría de accesibilidad y gap WCAG 2.2 AA (Fase 13)

- **Proyecto:** Hireeo — marketplace multi-país de servicios manuales con dos integraciones de IA (Gemini 2.5 Flash).
- **Fecha de corte / ejecución:** 2026-07-23
- **Versión:** 0.1 (borrador de investigación técnico-jurídica).
- **Método:** inspección **manual y estática** del código de `frontend/src` (solo lectura). No se modificó código.
- **Insumos previos:** `../01-scope-assumptions-and-open-questions.md`, `../02-product-and-data-map.md`, `../country-analysis/spain-eu.md` §6 (EAA — Ley 11/2023, vigente 2025-06-28, **no se repite**), `../country-analysis/united-states-federal.md` (ADA Title III / Section 508, **no se repite**).

> **Aviso.** Documento de investigación, no asesoramiento legal. Requiere revisión de abogado habilitado por jurisdicción. Marcadores: **[HECHO]** (evidencia archivo:línea), **[INFERENCIA]** técnica, **[SUPUESTO]** pendiente, **[OBLIGACIÓN]** vigente, **[BUENA PRÁCTICA]**.

---

## 0. Limitación metodológica declarada (IMPORTANTE — leer primero)

**No se ejecutó ninguna auditoría automatizada real (axe-core, Lighthouse, WAVE, Pa11y) ni pruebas manuales con lector de pantalla o navegación por teclado en un navegador.** El frontend es un submódulo Git y la aplicación no está desplegada ni corriendo en este entorno de auditoría. Por tanto:

- Todos los hallazgos de este documento provienen de **inspección estática del código fuente** (lectura de componentes JSX/TSX). Esto detecta con fiabilidad la **ausencia** de atributos de accesibilidad (labels, ARIA, roles, alt), pero **no** mide contraste de color real renderizado, orden de foco efectivo, comportamiento con lector de pantalla, ni fallos que solo aparecen en runtime.
- **No se afirma un "resultado de auditoría" ni un porcentaje de conformidad.** Afirmar conformidad WCAG sin ejecución sería inventar evidencia.
- **Siguiente paso obligatorio [OBLIGACIÓN operativa]:** ejecutar un audit automatizado (axe-core/Lighthouse) sobre las páginas clave con la app corriendo, **más** una revisión manual con teclado y lector de pantalla (NVDA/VoiceOver), antes del lanzamiento en `/es` (EAA) y del tráfico en EE. UU. (riesgo de litigio ADA Title III). Los hallazgos estáticos de abajo definen el mínimo a corregir; el audit runtime puede revelar más.

---

## 1. Marco legal aplicable (síntesis — detalle en country-analysis)

| Jurisdicción | Norma | Estándar técnico | Estado | Fuente |
|---|---|---|---|---|
| **España / UE** | European Accessibility Act — Directiva (UE) 2019/882; **Ley 11/2023**; RD 193/2023 | EN 301 549 / **WCAG 2.1 AA** (2.2 AA como buena práctica) | **VIGENTE 2025-06-28** (servicios nuevos); legacy hasta 2030-06-28 | `../country-analysis/spain-eu.md` §6 |
| **EE. UU.** | ADA Title III (42 USC §§12181-12189); DOJ web guidance 2022 | Sin reglamento federal WCAG general para privados; **WCAG 2.2 AA** como criterio técnico defensivo | Riesgo de litigio civil vigente; alcance por circuito | `../country-analysis/united-states-federal.md` (ADA/Section 508) |
| **Chile / Argentina / Uruguay** | Sin obligación de accesibilidad web B2C directamente equivalente al EAA a la fecha **[SUPUESTO — verificar normativa de discapacidad local]** | WCAG 2.2 AA como buena práctica | — | Pendiente country-analysis CL/AR/UY |

**Estándar técnico recomendado transversal:** **WCAG 2.2 AA**. Satisface simultáneamente el EAA (que exige 2.1 AA) y el criterio defensivo ADA, y es el nivel que un audit runtime debe verificar. Superficies en alcance: registro/login, publicación de servicio, búsqueda, perfil de servicio, chat, pagos/checkout, consentimientos, reportes y contenido generado por usuarios.

---

## 2. Hallazgos de inspección estática (por criterio WCAG)

> Severidad: **CRITICAL** (barrera de bloqueo para tecnología asistiva), **HIGH**, **MEDIUM**, **LOW**. "IJ" = potencial incumplimiento jurídico; "VT" = defecto técnico.

### A-01 — Etiquetas de formulario NO asociadas programáticamente (SISTÉMICO) — **CRITICAL**

- **Evidencia:** el componente base `Field` renderiza la etiqueta como un **`<span>`**, no como un `<label>`, y **no** usa `htmlFor`/`id` para asociarla al control. `frontend/src/shared/components/hireeo/Field/Field.tsx:15-26` (label en `<span>`), `:34-41` (error en `<div>` suelto).
- El componente `Input` **no emite `id` por defecto** ni `aria-describedby`. `frontend/src/shared/components/hireeo/Input/Input.tsx:11-33`.
- **Impacto:** `Field` es la primitiva base de formularios de todo el proyecto (registro, publicación, perfil, contacto, checkout). Un lector de pantalla **no anuncia la etiqueta** al enfocar el campo; el clic en la etiqueta no enfoca el input. Falla **WCAG 1.3.1 Info y relaciones (A)**, **3.3.2 Etiquetas o instrucciones (A)**, **4.1.2 Nombre, función, valor (A)**.
- **Nota:** en `RegisterPage` solo el campo contraseña recibe `id` vía `useId()` (`RegisterPage.tsx:33,101`), pero **no hay** `<label htmlFor>` que lo consuma; el `aria-label` del botón mostrar/ocultar contraseña sí es correcto (`:111`).
- **Corrección:** convertir el `<span>` de `Field` en `<label htmlFor={id}>`, generar `id` en `Input` (o recibirlo), y enlazar `hint`/`error` con `aria-describedby`. Un solo cambio en la primitiva corrige toda la app.

### A-02 — Mensajes de error no anunciados a tecnología asistiva — **HIGH**

- **Evidencia:** los errores de campo se pintan en un `<div>` sin `role="alert"` ni `aria-live` y **sin** vínculo `aria-describedby` con el input (`Field.tsx:34-41`). El error general del registro es un `<div>` plano (`RegisterPage.tsx:62-69`). En todo `frontend/src` existe **una sola** región viva (`role="alert"` en `CheckoutModal.tsx:402`).
- **Impacto:** cuando la validación de la Server Action devuelve errores, un usuario con lector de pantalla no recibe aviso ni sabe qué campo corregir. Falla **WCAG 3.3.1 Identificación de errores (A)**, **4.1.3 Mensajes de estado (AA)**.
- **Corrección:** `role="alert"`/`aria-live="assertive"` en el contenedor de error general; `aria-describedby` del input hacia el texto de error; mover foco al primer campo inválido.

### A-03 — Chat: textarea sin etiqueta y botón de envío sin nombre accesible — **HIGH**

- **Evidencia:** en `ChatWindow` el `<textarea>` solo tiene `placeholder="Escribe un mensaje..."` (sin `<label>`/`aria-label`), y el botón de envío es **solo icono** (`<Send>`) sin `aria-label` (`frontend/src/features/chat/components/ChatWindow/ChatWindow.tsx:158-168`). No hay región viva que anuncie los mensajes entrantes.
- **Impacto:** el placeholder **no sustituye** a una etiqueta accesible (desaparece al escribir); el botón se anuncia como "botón" sin propósito. Mensajes nuevos no se anuncian. Falla **1.3.1, 3.3.2, 4.1.2 (A)** y **4.1.3 (AA)**. Aplica igualmente al chat de IA (`shared/components/hireeo/ui/ChatIA/ChatIA.tsx`) — **[SUPUESTO — verificar mismos patrones]**.
- **Corrección:** `aria-label` en textarea y botón; `aria-live="polite"` en la lista de mensajes; foco gestionado tras enviar.

### A-04 — Iconos SVG sin `aria-hidden` por defecto — **MEDIUM**

- **Evidencia:** el componente `Icon` renderiza el SVG sin `aria-hidden="true"` ni `role`/`title` por defecto (`frontend/src/shared/components/hireeo/Icon/Icon.tsx:19-27`). Se usa masivamente como icono decorativo dentro de `Input`, `Btn`, etc.
- **Impacto:** iconos puramente decorativos pueden ser expuestos al árbol de accesibilidad como nodos sin nombre; iconos que **sí** portan significado (p. ej. botones solo-icono) carecen de nombre. Falla parcial **1.1.1 (A)** / **4.1.2 (A)** según uso.
- **Corrección:** `aria-hidden="true"` por defecto para uso decorativo; exigir `aria-label` en el contenedor cuando el icono es la única etiqueta (botones solo-icono).

### A-05 — Ausencia de enlace "saltar al contenido" (skip link) — **MEDIUM**

- **Evidencia:** búsqueda negativa de skip link en `frontend/src` (grep `skip.?(link|to|nav)` sin coincidencias funcionales).
- **Impacto:** usuarios de teclado deben tabular por toda la navegación en cada página. Falla **WCAG 2.4.1 Evitar bloques (A)**.
- **Corrección:** añadir skip link al inicio del `layout` que enfoque el `<main>`.

### A-06 — `<img>` / `next/image`: `alt` presente en muestra, pero sin garantía global — **LOW/MEDIUM (por verificar)**

- **Evidencia [HECHO parcial]:** en la muestra revisada las imágenes de contenido **sí** tienen `alt` descriptivo: `FeaturedServiceCard.tsx:32` (`alt={título — userName}`), `ServiceGallery.tsx:74`, `SponsorBanner.tsx:49`. Positivo.
- **Pendiente:** no se verificó el 100 % de los ~20+ usos de `<Image>`; algunos avatares/decorativos podrían faltar `alt=""`. El audit runtime lo cuantifica. **1.1.1 (A)**.

### A-07 — Contraste de color: NO evaluado — **UNKNOWN (requiere runtime)**

- La paleta usa tokens CSS (`var(--sub)`, `var(--muted)`, `text-[11px]`) con tamaños de fuente muy pequeños (11-13px) en labels, hints y errores (`Field.tsx`, `Input.tsx`). El contraste real **solo se mide renderizado**. **No se afirma** cumplimiento ni incumplimiento de **1.4.3 Contraste mínimo (AA)** / **1.4.11 Contraste no textual (AA)**; marcar para el audit automatizado.

### Controles positivos observados [HECHO]

- `<html lang={lang}>` dinámico por país/idioma (`layout.tsx:162-163`) → **3.1.1 (A)** cubierto.
- `aria-label` correcto en el toggle de contraseña (`RegisterPage.tsx:111`).
- Estilos de foco visibles (`focus-within:border-ink` en `Input.tsx:14`; `focus:ring-2` en `ChatWindow.tsx:160`) → base para **2.4.7 (AA)**, verificar consistencia global.
- `role="alert"` en `CheckoutModal.tsx:402` (patrón correcto a replicar).
- 79 usos de `aria-*`/`role` en el código → hay una base, pero desigual.

---

## 3. Tabla resumen de gaps

| ID | Criterio WCAG 2.2 | Severidad | Evidencia | ¿IJ? (EAA/ADA) |
|---|---|---|---|---|
| A-01 | 1.3.1, 3.3.2, 4.1.2 (A) | **CRITICAL** | `Field.tsx:15-26`; `Input.tsx:11-33` | Sí (sistémico) |
| A-02 | 3.3.1 (A), 4.1.3 (AA) | HIGH | `Field.tsx:34-41`; `RegisterPage.tsx:62-69` | Sí |
| A-03 | 1.3.1, 3.3.2, 4.1.2 (A), 4.1.3 (AA) | HIGH | `ChatWindow.tsx:158-168` | Sí |
| A-04 | 1.1.1, 4.1.2 (A) | MEDIUM | `Icon.tsx:19-27` | Parcial |
| A-05 | 2.4.1 (A) | MEDIUM | búsqueda negativa | Parcial |
| A-06 | 1.1.1 (A) | LOW/MEDIUM | muestra OK; global sin verificar | Por verificar |
| A-07 | 1.4.3, 1.4.11 (AA) | UNKNOWN | requiere runtime | Por verificar |

---

## 4. Obligaciones de información y feedback (EAA) — más allá del código

Además de la conformidad técnica, el EAA (Ley 11/2023) exige **[OBLIGACIÓN vigente en `/es`]**:

1. **Declaración de accesibilidad** publicada: cómo el servicio cumple los requisitos, estado de conformidad y limitaciones conocidas.
2. **Canal de feedback de accesibilidad** (formulario/email) para que usuarios reporten barreras y soliciten alternativas.
3. Conservación de la información en formato accesible.

Hoy **no existe** ninguna de las dos en el repo (búsqueda negativa; el footer solo enlaza terms/privacy — `Footer.tsx:138-155`). Ver documento legal a redactar en Fase 14 §12 ("Aviso de Accesibilidad y procedimiento de feedback"). El **texto** de la declaración depende del resultado del audit runtime → `[[DECISION REQUIRED]]`: nivel de conformidad declarable y limitaciones.

---

## 5. Matriz: obligación → evidencia → propietario → prioridad → fecha objetivo

| # | Acción | Norma/criterio | Evidencia repo | Propietario | Prioridad | Fecha objetivo |
|---|---|---|---|---|---|---|
| 1 | Ejecutar audit axe-core/Lighthouse + prueba manual teclado/lector | EAA / ADA / WCAG 2.2 AA | app no auditada (§0) | Product + Engineering | **P1** | Pre-lanzamiento `/es` y tráfico US |
| 2 | Corregir `Field`/`Input`: `<label htmlFor>`, `id`, `aria-describedby` | 1.3.1/3.3.2/4.1.2 | A-01 | Engineering | **P1 (sistémico)** | Pre-lanzamiento |
| 3 | Errores con `role="alert"`/`aria-live` + foco a campo inválido | 3.3.1/4.1.3 | A-02 | Engineering | P1 | Pre-lanzamiento |
| 4 | Etiquetar chat (textarea + botón) y región viva de mensajes | 1.3.1/4.1.2/4.1.3 | A-03 | Engineering | P2 | Pre-lanzamiento |
| 5 | `aria-hidden` por defecto en `Icon`; nombres en botones solo-icono | 1.1.1/4.1.2 | A-04 | Engineering | P2 | Pre-lanzamiento |
| 6 | Skip link en el layout | 2.4.1 | A-05 | Engineering | P2 | Pre-lanzamiento |
| 7 | Verificar `alt` en el 100 % de imágenes; contraste en audit | 1.1.1/1.4.3 | A-06/A-07 | Engineering | P2 | Con el audit |
| 8 | Publicar declaración de accesibilidad + canal de feedback | EAA (Ley 11/2023) | ausencia | Legal + Product | P2 | Pre-lanzamiento `/es` |

---

## 6. Preguntas abiertas / decisiones requeridas

- `[[DECISION REQUIRED]]` Nivel de conformidad declarable en la declaración de accesibilidad (depende del audit runtime).
- `[[DECISION REQUIRED]]` ¿Se adopta WCAG **2.2 AA** como estándar corporativo único (recomendado) o 2.1 AA (mínimo EAA)?
- **[SUPUESTO]** Verificar si CL/AR/UY imponen accesibilidad web B2C exigible (normativa de discapacidad local) — pendiente en country-analysis respectivos.
- **[SUPUESTO]** Confirmar que `ChatIA.tsx` (IA) replica los mismos patrones de `ChatWindow` para extender A-03.

---

## 7. Revisión por abogado local pendiente

Validar antes de publicar: cuantía sancionadora EAA por CCAA de establecimiento (`../country-analysis/spain-eu.md` §10, ES-8); alcance ADA Title III según circuito federal aplicable; y el texto de la declaración de accesibilidad una vez ejecutado el audit runtime. **No declarar conformidad WCAG sin el audit ejecutado.**
