# Brechas de hireeo respecto de Chiloé Servicios

Fecha: 2026-10-11. Tarjeta CA-177. Autores: Matías Reyes (UI, definiciones, accesibilidad e integración) y Valentina Ortiz (patrones y decisiones aprendidas). Solo investigación. Este es el único archivo nuevo. No hay commit ni push.

**Hecho** es lo comprobado en archivos (ruta y, si aplica, SHA). No significa que se haya ejecutado la pantalla. **Opinión** es beneficio, prioridad, diseño propuesto y costo. Una opinión no autoriza un cambio de código.

Escala de costo, común a las dos fases. **Opinión**, órdenes de magnitud: **S** = un primitivo o un bloque de CSS, cerca de 1–2 jornadas; **M** = varios call sites, un contrato o una familia de pantallas, cerca de 3–7 jornadas; **L** = modelo nuevo, migración de URLs o cambio de negocio, del orden de semanas. No incluye traducción profesional, revisión jurídica ni certificación de pasarelas.

Prioridad: **P1** corrige consistencia, confianza o accesibilidad básica. **P2** es capacidad nueva o una decisión de producto. **P3** es impacto acotado o no conviene copiar el archivo. Dentro de cada nivel, primero el costo menor.

## Pregunta

Qué le falta a hireeo (`next-atlas-services`: frontend en el submódulo `frontend/src`, backend en el submódulo `backend/`) para ser la versión internacional y perfeccionada de Chiloé Servicios (`next-chiloeservicios`), que aquí es solo referencia de lectura. La app móvil (`appmobile/`) queda fuera salvo mención.

## Hipótesis

**Opinión, contrastada con los hechos de abajo.** hireeo ya es el esqueleto internacional: país en la URL, moneda y huso por país, pasarelas distintas, diccionarios, `Field` accesible y diálogos Radix. Chiloé, partido del mismo paquete hireeo, cerró después tokens de CSS, controles de una sola altura y un conjunto de correcciones de producto (imagen de respaldo, fecha real del sitemap, rechazo de geo inválida, reseña atómica, reglas que el CI puede mirar). La brecha no es rehacer hireeo como clon de Chiloé. Es llevar esas correcciones al modelo de país / región / ciudad, moneda e idioma que hireeo ya tiene, sin perderlo.

Los hechos de UI sostienen la mitad de tokens y primitivos. Los hechos de patrones sostienen la mitad de producto. No alcanzan, solos, para afirmar que cada formulario de feature está peor: ahí el inventario solo comparó bytes.

## Metodología

**Hecho.** Lectura estática. No se instalaron dependencias, no hubo build ni pruebas, no se abrió el navegador ni se consultó producción.

Se reutilizó el inventario de la primera pasada y no se rehízo: [auditoría de componentes y definiciones](../../next-chiloeservicios/.doc/2026-10-11-auditoria-componentes-chiloeservicios-vs-atlas-hireeo.md), commit `87f5ddbb277adce4c584e38f2b6aab9b471bdca7` en `main` de Chiloé (solo ese documento). El árbol de componentes que ese inventario leyó es el de `0e148cc`, salvo `SearchPageClient.tsx` de Chiloé, que ya estaba modificado sin commit y ninguna de las dos fases usa ese diff.

HEADs leídos el 2026-10-11:

| Repo | SHA | Qué se leyó ahí |
| --- | --- | --- |
| next-chiloeservicios | `87f5ddbb277adce4c584e38f2b6aab9b471bdca7` | Inventario, primitivos hireeo, `globals.css`, `AGENTS.md`, rutas, imagen, reseñas, geo, búsqueda, pagos, analytics. |
| next-atlas-services (padre) | `844a06535ec7af89eb1e4a13277902ac6166a2e7` | `AGENTS.md` de HEAD (la sección 8 está por encima del hunk sin commit de la KB de cruce; ese hunk no se tocó). |
| submódulo `frontend` | `d8d8fec273af8de467d1a18fd3a559390f096476` | `frontend/src` de UI, design system, geo, ficha, sitemap, diccionarios. |
| submódulo `backend` | `fbe918e261616cc54f05a6ce74fc16d16ee6bb8a` | Servicios, ratings, pagos, suscripciones, geo, interacciones, email. No se auditó cada regla jurídica. |
| `appmobile` | `fb130fba1715ee3617a61f78721aba477eec77bc` | Fuera de alcance. Solo se constató que existe. |

**Hecho.** La fase de UI releyó, entre otros, `Btn`, `Field`, `Input`, `Select`, `Stars`, `Card`, `Icon`, `PhoneInput`, `LocalitySelect`, `countryUtils.ts`, los dos `globals.css`, la página `design-system` y la ausencia de `DESIGN.md`. La fase de patrones contrastó con código los planes y el `git log` reciente de Chiloé; un plan no se tomó como prueba de que el código esté así. Al integrar, se corrigió un error del parcial de UI: hireeo **sí** tiene diccionarios en `frontend/src/lib/i18n/` (cinco JSON y `getDictionary`). No hay `next-intl` en el `package.json`, y eso no equivale a «no hay catálogo».

**Hecho.** hireeo no tiene `DESIGN.md` (no está en la raíz ni en `frontend/`). Chiloé tampoco lo tiene en la raíz. La guía visual de hireeo es `AGENTS.md` sección 8, `frontend/src/app/globals.css` y la ruta `frontend/src/app/design-system/page.tsx`.

## Resumen ejecutivo

33 brechas: 21 de UI y definiciones (U-01 a U-21) y 12 de patrones (P-01 a P-12). El orden de la tabla es la prioridad de esta auditoría. **Opinión.**

| # | Brecha | Área | Costo | Prioridad |
| --- | --- | --- | --- | --- |
| 1 | U-01 Tokens de tipo, radio, sombra, alto y foco en CSS | UI | S | P1 |
| 2 | U-02 `Btn` con espera, solo icono y variante enlace | UI | S | P1 |
| 3 | U-03 Foco visible global y movimiento reducido completo | UI | S | P1 |
| 4 | U-04 Mostrar u ocultar contraseña | UI | S | P1 |
| 5 | U-05 Estrellas editables | UI | S | P1 |
| 6 | U-06 `EmptyState` y `Banner` | UI | S | P1 |
| 7 | U-07 Confirmación en diálogo, no `window.confirm` | UI | S | P1 |
| 8 | U-08 No hay `DESIGN.md` y la paleta escrita no coincide con el token | Definiciones | S | P1 |
| 9 | P-04 Imagen de respaldo única, también en la vista compartida | Patrones | S–M | P1 |
| 10 | P-01 Homologar controles sin perder RHF ni el `Field` de hireeo | Patrones | M | P1 |
| 11 | P-03 `lastModified` real en el sitemap | Patrones | M | P1 |
| 12 | P-07 Rechazar una selección geográfica inválida | Patrones | M | P1 |
| 13 | P-12 Usar el diccionario y el país que ya existen en ficha y mensajes | Patrones | M | P1 |
| 14 | P-10 Reglas aprendidas como controles de regresión | Patrones | M | P1 |
| 15 | U-10 Variantes de `Card` | UI | S | P2 |
| 16 | U-11 `Textarea`, radios en píldora y checkbox con etiqueta sobre Radix | UI | S | P2 |
| 17 | U-12 Dropzone de archivo que no sea imagen | UI | S | P2 |
| 18 | U-13 Skeletons compuestos | UI | S | P2 |
| 19 | U-14 `Stat` con enlace y tono; el fallback de formato no puede ser Chile | UI | S | P2 |
| 20 | U-15 `PhoneInput` más ancho, sin Chile como default mudo | UI | S | P2 |
| 21 | U-16 Cadenas en español dentro de primitivos ya multi-país | UI | S | P2 |
| 22 | U-17 Modo oscuro de éxito, aviso, peligro y sombras | UI | S | P2 |
| 23 | U-18 Componente de migas, sin la URL de comunas | UI | S | P2 |
| 24 | U-09 `Select` con búsqueda, sin copiar comunas | UI | M | P2 |
| 25 | P-11 Separar vida de la ficha, premium y duración comercial | Patrones | M, L si cambia el negocio | P2 |
| 26 | P-02 URL pública, slugs y migas | Patrones | L | P2 |
| 27 | P-05 Reseña de invitado atómica, correo aparte del éxito | Patrones | L | P2 |
| 28 | P-06 Visitas de página distintas de clics de contacto | Patrones | L | P2 |
| 29 | P-08 Búsqueda tolerante a tildes, sin índice en memoria | Patrones | L | P2 |
| 30 | P-09 Reclamar la propiedad de una ficha importada | Patrones | L, condicional | P2 |
| 31 | U-19 Seis iconos que faltan en el mapa propio | UI | S | P3 |
| 32 | U-20 No hace falta un `Modal` casero: ya está Radix | UI | S | P3 |
| 33 | U-21 Shell de dashboard de Chiloé | UI | L | P3 |

## Inventario

**Hecho.** Conteos del documento de la primera pasada (commit `87f5ddb`), criterio: un `.tsx` bajo una carpeta `components`, sin `index.tsx`, cada archivo cuenta. No se recontaron en esta pasada.

| | Chiloé | hireeo (`frontend/src`) |
| --- | ---: | ---: |
| Componentes | 164 | 156 |
| Mismo nombre | 70 nombres | 71 archivos (el segundo `PageHeader` de cuenta) |
| Solo en este lado | 94 | 85 |
| Idénticos byte a byte | 1 (`Mono`) | 1 (`Mono`) |

Convención de carpeta: Chiloé 86 con carpeta igual al archivo y 78 planos. hireeo 154 y 2 (`ui/checkbox/Checkbox.tsx`, `ui/table/Table.tsx`). El detalle de homónimos, exclusivos, tokens y la tabla de primitivos está en el enlace de arriba. Esta pasada no lo copia.

**Hecho de la integración.** El inventario decía que el `Input` de hireeo usa `.form-input`. La clase existe en `frontend/src/app/globals.css` (`rounded-2xl`, `py-3`). El componente `frontend/src/shared/components/hireeo/Input/Input.tsx` no la usa: el input es `bg-transparent py-2 text-[13px]` dentro de una caja `rounded-lg` (releído al integrar). Las dos frases son ciertas y no son la misma pieza.

## Brechas de UI y definiciones

Rutas de Chiloé relativas a `src/`. Rutas de hireeo relativas a `frontend/src/`.

### U-01 — Tokens ejecutables — P1 — S

- **Hecho en Chiloé.** `app/globals.css`: `--text-*`, `--radius-control` 0.625rem, `--radius-card`, `--radius-sheet`, `--shadow-card`, `--shadow-raised`, `--control-height` 2.75rem, `--focus`, `--focus-ring`. `.form-input`, `.form-select` y `.form-textarea` usan radio y alto comunes.
- **Hecho en hireeo.** Esas variables no están. La escala y los radios viven en constantes de `app/design-system/_sections/TipografiaSection.tsx` y `EspaciadoSection.tsx`, no como CSS que un componente pueda usar. `.form-input` y `.form-select` no comparten ritmo. `.form-phone-input` fija `h-[50px]`. `Btn` usa radios en píxeles. Ver también el `Input` de la nota del inventario.
- **Opinión — beneficio.** Una sola altura y un solo anillo. La página `/design-system` deja de ser la única fuente.
- **Opinión — costo.** S declarar las variables y aplicarlas a `.form-*`, `Btn` e `Input`. Recorrer cada feature es P-01 (M), no este costo.
- **Internacionalización.** Los tokens no llevan idioma. Una escala en rem aguanta textos más largos que `text-[13px]`. El anillo usa el accent de hireeo (`#2d4e8f`), no el azul `#3b82f6` de Chiloé.
- **No copiar.** La paleta azul y verde de Chiloé ni `--accent-rgb` atado a ese azul.

### U-02 — `Btn` — P1 — S

- **Hecho en Chiloé.** `shared/components/hireeo/Btn/Btn.tsx`: variante `link`, `loading` con `aria-busy`, `iconOnly` que exige `aria-label`. El spinner importa Lucide.
- **Hecho en hireeo.** El mismo path: variantes `primary`, `secondary`, `ghost`, `accent`, `danger`, `dangerSolid`. No hay `loading`, `iconOnly` ni `link`.
- **Opinión — beneficio.** El envío en curso se anuncia y el botón de solo icono tiene nombre.
- **Opinión — costo.** S. Props opcionales. El spinner sale de un SVG propio, no de Lucide. `Icon` cae a `alert` si el nombre no existe (`hireeo/Icon/Icon.tsx`).
- **Internacionalización.** `aria-busy` no necesita idioma. Si hay una palabra visible, sale del diccionario (`lib/i18n/`). El `aria-label` lo pasa quien llama.
- **No copiar.** `lucide-react` ni el acento azul del botón.

### U-03 — Foco y movimiento — P1 — S

- **Hecho en Chiloé.** `app/globals.css`: `:focus-visible` con `var(--focus)`, cursor pointer en `button` y `[role='button']` no deshabilitados, y `prefers-reduced-motion` con duración `0.01ms` en todos los elementos.
- **Hecho en hireeo.** No hay esas dos reglas de base. El media query solo anula `.stagger-item`, `.page-fade-in`, las palabras del hero, `.scroll-top-fab` y el hover de `.card-hover`.
- **Opinión — beneficio.** El teclado ve el foco en cualquier control. Quien pide menos movimiento lo obtiene en toda la página.
- **Opinión — costo.** S, un bloque de CSS. El color del anillo es el accent de hireeo.
- **Internacionalización.** No hay texto.
- **No copiar.** El `--focus-ring` azul de Chiloé (`rgb(59 130 246 / 0.35)`).

### U-04 — Contraseña — P1 — S

- **Hecho en Chiloé.** `hireeo/Input/Input.tsx`: `passwordToggle`, `aria-label` «Mostrar contraseña» / «Ocultar contraseña», iconos `eye` y `eyeOff`.
- **Hecho en hireeo.** Ese prop no está. El mapa propio no tiene `eyeOff` (inventario).
- **Opinión — beneficio.** Un solo control para revisar la contraseña.
- **Opinión — costo.** S, más el SVG `eyeOff` (U-19).
- **Internacionalización.** Los dos rótulos de Chiloé están en español fijo. En hireeo son claves del diccionario (`us.json` ya existe; no se copia la frase).
- **No copiar.** Esas cadenas ni Lucide.

### U-05 — Estrellas — P1 — S

- **Hecho en Chiloé.** `hireeo/Stars/Stars.tsx`: `value` y `onChange`, además de la lectura. El inventario contó marcas `aria` en el archivo.
- **Hecho en hireeo.** El mismo path solo pinta iconos en un `span`. No hay `onChange` ni `aria` en el archivo.
- **Opinión — beneficio.** Mostrar y elegir una nota es la misma pieza. El flujo de reseñas (P-05) no inventa otro control.
- **Opinión — costo.** S. Sin `onChange`, el uso actual no cambia.
- **Internacionalización.** «Nota 4 de 5» es una clave con el número, no una frase copiada.
- **No copiar.** Textos de reseña ni reglas de moderación. Eso es P-05.

### U-06 — Estado vacío y banner — P1 — S

- **Hecho en Chiloé.** `hireeo/EmptyState/EmptyState.tsx` y `hireeo/Banner/Banner.tsx`. El `AGENTS.md` de Chiloé los manda en la tabla «Esto ya existe».
- **Hecho en hireeo.** No existen en el paquete hireeo.
- **Opinión — beneficio.** Vacíos y errores de formulario se ven igual en todos los países.
- **Opinión — costo.** S. El texto lo pasa quien llama.
- **Internacionalización.** Título, descripción y botón llegan traducidos.
- **No copiar.** Vacíos que hablen de comunas, Castro o pesos chilenos.

### U-07 — Confirmación — P1 — S

- **Hecho en Chiloé.** `hireeo/ConfirmDialog/ConfirmDialog.tsx` y `useConfirm`. En `src/` no quedó un `window.confirm`. Sí quedó un `window.alert` en `features/moderation/components/admin/ModerationTable.tsx`.
- **Hecho en hireeo.** `features/services/components/profile/MyServiceItem/MyServiceItem.tsx` usa `window.confirm` con una frase fija en español. El diálogo accesible ya está en `shared/components/Dialog/Dialog.tsx` (Radix) y en `shared/components/admin/Modal/Modal.tsx` (Radix). No hay `ConfirmDialog` en el paquete hireeo.
- **Opinión — beneficio.** La pregunta se puede enfocar y traducir. El `confirm` del navegador no sigue el idioma de `/{country}`.
- **Opinión — costo.** S: un wrapper sobre el `Dialog` que ya existe y un solo call site.
- **Internacionalización.** Título y mensaje son props o claves. La frase de borrar el servicio no se deja en español dentro de `/us`.
- **No copiar.** El `Modal` propio de Chiloé (`role="dialog"` a mano). Radix ya aporta foco y rol.

### U-08 — Guía escrita — P1 — S

- **Hecho.** No hay `DESIGN.md` en ninguno de los dos repos (raíz de Atlas, `frontend/` y raíz de Chiloé).
- **Hecho en hireeo.** `AGENTS.md` sección 8 escribe accent `bg-blue-600` y éxito `bg-green-500`, y Next.js 16.1. `frontend/package.json` declara `next` `16.3.3`. `--accent` es `#2d4e8f` y `--success` es `#16a34a`. `design-system/_sections/ColorSection.tsx` documenta `#2D4E8F`. La misma sección 8 ya pide textos no atados a un país y geo desde la API.
- **Hecho en Chiloé.** La tabla «Esto ya existe» es más concreta y también está corrida: manda `TermsCheckbox` en `features/auth/components/` y el archivo está en `shared/components/legal/TermsCheckbox.tsx`; prohíbe Lucide en features y el inventario contó 29 archivos de features que lo importan.
- **Opinión — beneficio.** Quien escriba UI deja de recibir dos paletas.
- **Opinión — costo.** S, un documento corto o un párrafo. Esta auditoría no edita `AGENTS.md`: ya tenía cambios ajenos.
- **Internacionalización.** Se conserva la regla de textos genéricos y de geo por API. El documento no lista comunas ni CLP como marca.
- **No copiar.** La frase de shadcn de Chiloé, la ruta vieja de `TermsCheckbox`, ni la paleta `#3B82F6`.

### U-09 — `Select` con búsqueda — P2 — M

- **Hecho en Chiloé.** `hireeo/Select/Select.tsx`: combobox, `options`, simple o `multiple`, `searchPlaceholder` con default `'Buscar...'`. No acepta `<option>`.
- **Hecho en hireeo.** El mismo path es un `<select>` nativo. `features/geo/components/LocalitySelect/LocalitySelect.tsx` ya carga región y localidad por API y usa `regionLabel` / `localityLabel`. El placeholder está en español: ``Selecciona ${regionLabel}``.
- **Opinión — beneficio.** Un país con muchas ciudades no depende solo del nativo. El nativo ya es operable por teclado: la brecha es de capacidad, no de «inaccesible».
- **Opinión — costo.** M. Las APIs no compilan cruzadas. Hay que sumar búsqueda sin romper quien pasa `<option>`.
- **Internacionalización.** «Buscar...» no se copia. Las opciones siguen en la API geo. Etiquetas: `Comuna`/`Región` en `cl`, `City`/`State` en `us` (`features/geo/lib/countryUtils.ts`).
- **No copiar.** El listado de comunas, el slug `/buscar/{comuna}/…` (`lib/routes.ts` de Chiloé) y `FieldTrigger`.

### U-10 — `Card` — P2 — S

- **Hecho en Chiloé.** `hireeo/Card/Card.tsx`: `variant` `default` | `tint` | `raised`, `padding` `sm` | `md` | `lg`.
- **Hecho en hireeo.** El mismo path: `padding` número o string (default 20) y `hover`. No acepta `variant="raised"`.
- **Opinión — beneficio.** Menos padding recalculado en cada pantalla.
- **Opinión — costo.** S si las variantes se suman y el padding numérico se queda. Pasar todas las cards sería M y no hace falta.
- **Internacionalización.** No hay texto. Las sombras, si se tokenizan, no tienen que clonar los alfa de Chiloé (el inventario midió 0.04 contra 0.05 y 0.08 contra 0.06).
- **No copiar.** `bg-gray-50` como si fuera la card de hireeo.

### U-11 — Textarea, radios y checkbox — P2 — S

- **Hecho en Chiloé.** `hireeo/Textarea`, `hireeo/RadioPillGroup` y `hireeo/Checkbox` con `label`, `description` y `error`.
- **Hecho en hireeo.** Esos tres no están en el paquete. El checkbox es `shared/components/ui/checkbox/Checkbox.tsx` (Radix).
- **Opinión — beneficio.** Campo largo, elección única y error de checkbox sin un tercer sistema. Radix se conserva.
- **Opinión — costo.** S. El checkbox con etiqueta es un envoltorio, no un reemplazo.
- **Internacionalización.** Etiquetas y errores son props.
- **No copiar.** El checkbox casero en lugar de Radix. Los textos de términos van por país (P-12).

### U-12 — Archivo que no es imagen — P2 — S

- **Hecho en Chiloé.** `hireeo/FileDropzone/FileDropzone.tsx`.
- **Hecho en hireeo.** No está. Sí están `ImageDropzone` e `admin/ImageCropperModal`.
- **Opinión — beneficio.** Un PDF no pasa por el recortador de fotos.
- **Opinión — costo.** S. No se migran las imágenes que ya tienen dropzone.
- **Internacionalización.** `label` y `error` son props. El mensaje de tamaño, si existe, lleva unidad traducida.
- **No copiar.** El crop, la galería y la imagen por defecto. Eso es P-04.

### U-13 — Skeleton — P2 — S

- **Hecho en Chiloé.** `hireeo/Skeleton/Skeleton.tsx`: `Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonStat`.
- **Hecho en hireeo.** Existe la clase `.skeleton` en los dos `globals.css`. No existe el componente.
- **Opinión — beneficio.** La espera se ve igual y, con U-03, queda quieta si el usuario pide menos movimiento.
- **Opinión — costo.** S.
- **Internacionalización.** Si el skeleton tiene nombre para el lector, es una clave.
- **No copiar.** El layout de una home o de una búsqueda por comuna.

### U-14 — `Stat` y el fallback a Chile — P2 — S

- **Hecho en Chiloé.** `hireeo/Stat/Stat.tsx` tiene `href` y `tone`. `shared/lib/utils.ts` formatea solo con `es-CL` y `CLP`, y `calcularIngresoNeto` usa IVA 19 % y comisión Mercado Pago 3,19 %.
- **Hecho en hireeo.** `Stat` no tiene `href` ni `tone` y no formatea dinero. `features/geo/lib/countryUtils.ts` ya tiene `formatPrice` y `formatDate` por país (`CLP`, `ARS`, `UYU`, `EUR`, `USD`, con huso). Si el código no está, las tres funciones caen a `COUNTRY_CONFIG.cl`. `getDictionary` también cae a `cl` (`lib/i18n/getDictionary.ts`).
- **Opinión — beneficio.** La métrica puede ser un enlace. El monto llega de `formatPrice`, no de un formato nuevo. El fallback mudo a Chile es el hueco internacional, no la falta de `Intl`.
- **Opinión — costo.** S.
- **Internacionalización.** `value` preformateado con el país de la ruta. País desconocido no debería volverse CLP en silencio.
- **No copiar.** `formatCurrency` en CLP ni el cálculo de IVA chileno.

### U-15 — `PhoneInput` — P2 — S

- **Hecho en hireeo.** `shared/components/ui/PhoneInput/PhoneInput.tsx`: 5 países (`CL`, `AR`, `UY`, `ES`, `US`), prop `defaultCountryCode`, iconos propios. Sin código, el default es `COUNTRIES[0]` (Chile).
- **Hecho en Chiloé.** `shared/components/ui/PhoneInput.tsx`: 27 países, sin `defaultCountryCode`, default también Chile, iconos Lucide.
- **Opinión — beneficio.** hireeo ya tiene el gancho que Chiloé no tiene. Le falta catálogo y le sobra el default Chile cuando la ruta no se pasa. `countryUtils.ts` ya guarda `phonePlaceholder` por país.
- **Opinión — costo.** S atar la lista a esa config. Una libreta mundial con máscaras no está en ninguno de los dos y no es un port.
- **Internacionalización.** El país inicial es el de la URL. El nombre del país sale del idioma. El valor guardado sigue siendo prefijo internacional. No se valida como celular chileno.
- **No copiar.** El array de Chiloé como fuente, el orden «Chile primero» ni Lucide.

### U-16 — Español fijo en piezas multi-país — P2 — S

- **Hecho en hireeo.** `hireeo/Field/Field.tsx` escribe «opcional». `LocalitySelect` escribe «Selecciona» aunque en `us` la etiqueta sea `State`. `app/design-system/_sections/ComponentesSection.tsx` muestra `hint="CLP"` y `suffix="CLP"`. El diccionario de navegación y home ya existe (`lib/i18n/locales/us.json` está en inglés; `getDictionary` cae a `cl`).
- **Hecho en Chiloé.** El `Field` también dice «opcional». No hay un catálogo equivalente que copiar: Chiloé concentra formato en `shared/lib/date.ts` y `utils.ts` con reglas chilenas (P-12).
- **Opinión — beneficio.** `/us` deja de mezclar «Selecciona State» con un ejemplo en pesos.
- **Opinión — costo.** S en estos tres sitios, reusando el diccionario. Cubrir ficha, errores y SEO es P-12 (M).
- **Internacionalización.** Plantilla «Selecciona {label}» / «Select {label}». El demo del design system no enseña CLP como moneda del sistema. Fechas de contenido con `formatDate` y el huso del país, no `es-CL` fijo.
- **No copiar.** Mails de Chiloé en CLP y Mercado Pago (`shared/lib/email/email.ts`) ni el admin «Comunas y localidades».

### U-17 — Modo oscuro de los estados — P2 — S

- **Hecho en Chiloé.** `.dark` recolorea success, warning y danger, y redefine las dos sombras.
- **Hecho en hireeo.** `.dark` recolorea neutros y accent. No redefine success, warning, danger ni sombras. Esos tokens sí existen en claro.
- **Opinión — beneficio.** Un error no queda con el verde de día sobre fondo de noche.
- **Opinión — costo.** S, cuatro variables. Hay que mirar contraste.
- **Internacionalización.** No hay texto.
- **No copiar.** El verde `#10b981` de Chiloé. Se oscurece el `#16a34a` que hireeo ya usa.

### U-18 — Migas como componente — P2 — S

- **Hecho en Chiloé.** `shared/components/Breadcrumbs/Breadcrumbs.tsx` emite `BreadcrumbList`. La URL de la ficha es otra cosa: `/buscar/{comuna}/{categoría}/{slug}` (`lib/routes.ts`). El patrón completo está en P-02.
- **Hecho en hireeo.** Ese componente no existe. `countryUtils.ts` ya arma `/${country}${path}`. `ServiceSubNav` lleva a home y categoría, con lugar textual, y la ficha le pasa `regionName={null}` (P-02).
- **Opinión — beneficio.** Una lista `{href, label}` reusable. Adaptar cada página es parte de P-02, no de este costo.
- **Opinión — costo.** S el componente.
- **Internacionalización.** Cada etiqueta llega traducida. El primer segmento es el país, no una comuna.
- **No copiar.** `comunaSlug` en la ruta ni la miga «Castro / Gasfitería».

### U-19 — Iconos que faltan — P3 — S

- **Hecho.** hireeo dibuja 70 nombres en SVG (`shared/components/icons`) y no depende de Lucide ni de `react-icons`. Chiloé declara 58 vía Lucide. Solo Chiloé: `ban`, `eyeOff`, `flag`, `menu`, `moreVertical`, `share`. Si el nombre no está, hireeo muestra `alert` (U-02). Chiloé todavía tiene 41 archivos que importan `lucide-react` (inventario).
- **Opinión — beneficio.** Bajo, hasta que una pantalla los pida. `eyeOff` se adelanta con U-04.
- **Opinión — costo.** S, seis SVG en el mapa que ya existe.
- **Internacionalización.** Sin texto. `languages`, que hireeo ya tiene, no se cambia por una bandera de Chile.
- **No copiar.** Lucide, los imports directos de features de Chiloé, ni `react-icons`.

### U-20 — `Modal` del paquete — P3 — S

- **Hecho en Chiloé.** `hireeo/Modal/Modal.tsx` declara `role="dialog"` y `aria-modal`.
- **Hecho en hireeo.** El homónimo es el `Modal` de admin (Radix). El de producto es `shared/components/Dialog` (Radix, con `size`).
- **Opinión — beneficio.** Poco, si las pantallas usan `Dialog`. Un alias solo ayuda a quien busca el nombre viejo.
- **Opinión — costo.** S un reexport. No es P1 porque el foco ya está.
- **Internacionalización.** El título es prop.
- **No copiar.** El overlay y el foco a mano de Chiloé.

### U-21 — Shell de dashboard — P3 — L

- **Hecho en Chiloé.** `DashboardShell`, header, sidebar, nav móvil, `StatsGrid`, `admin/AdminHeader` (inventario).
- **Hecho en hireeo.** `AdminSidebar` en `features/admin` y shell de cuenta distintos. El admin ya va por país. No se comparó la API de los shells.
- **Opinión — beneficio.** Incierto sin abrir las dos pantallas.
- **Opinión — costo.** L. Arrastra nombres de sección.
- **Internacionalización.** Si algún día se unifica, el menú sale del diccionario y el alcance es el país de la URL.
- **No copiar.** El ítem «Comunas y localidades», el WhatsApp de soporte con número local, ni las features que solo están en Chiloé (`claims`, `sponsors` y el mapa Leaflet) como si fueran primitivos. Moderación, cotizaciones y solicitudes **sí existen** en el backend de hireeo: no son brecha (P-09).

## Brechas de patrones y decisiones aprendidas

Misma forma. Los SHA de commit de Chiloé que aparecen aquí son los que la fase de patrones leyó en el historial como origen de la corrección. El comportamiento citado es el del código en el HEAD de la tabla de metodología, no el del mensaje de commit por sí solo.

### P-01 — Homologar controles — P1 — M

- **Hecho en Chiloé.** Los tokens de U-01 y la regla de usar `hireeo/` están en el código. `.doc/realizados/homologacion-formularios.md` registra las fases; el encabezado del documento todavía dice «propuesta». `fd23eb5` introdujo la biblioteca.
- **Hecho en hireeo.** Alturas distintas (U-01). `features/services/components/forms/base/ServicioFormBase/ServicioFormBase.tsx` conserva un textarea con estilo propio. Sí existe `shared/components/Form/Form.tsx`: `useZodForm` une React Hook Form y Zod. El `Field` conecta `htmlFor`, `aria-invalid` y `aria-describedby`.
- **Opinión — beneficio.** La misma altura en público, perfil y admin, sin volver a estados manuales.
- **Opinión — costo.** M por el alcance y la revisión visual. Depende de U-01 y no lo reemplaza.
- **Internacionalización.** Etiquetas, «opcional», hints y errores desde `lib/i18n/`. Teléfono en E.164 con presentación local. Direcciones con campos por país. Probar inglés largo.
- **No copiar.** Placeholders de Ancud, la palabra «gásfiter» para todos los mercados, el +56 fijo ni una altura rígida para el texto multilínea.

### P-02 — URL, slugs y migas — P2 — L

- **Hecho en Chiloé.** `lib/routes.ts`, `features/services/lib/servicePath.ts`, `serviceSlug.ts` y `searchBreadcrumbs.ts` centralizan la ficha en `/buscar/{comuna}/{categoría}/{servicio}`. `next.config.ts` redirige 308 las landings viejas `/servicios/…` y `/comunas/…`. `282140f` incorporó el flujo. El componente de migas es U-18.
- **Hecho en hireeo.** La ficha vive en `app/(country)/[country]/(public)/service/[slug]/page.tsx`. `ServiceSubNav` no recibe región (`regionName={null}`). El backend exige país al resolver el slug y el schema es único por país (`backend/src/modules/services/services.service.ts`). `frontend/src/proxy.ts` usa 307 y `no-store` cuando el país sale de cookie o geo.
- **Opinión — beneficio.** Búsqueda, ficha, enlace compartido y SEO cuentan la misma jerarquía. Una URL larga no acredita, por sí sola, mejor ranking.
- **Opinión — costo.** L: migración, contrato y compatibilidad. Se puede conservar `/service/{slug}` y enriquecer las migas, o pasar a `/{country}/search/{region}/{city}/{category}/{slug}`. Es decisión.
- **Internacionalización.** Ids estables, slugs por país e idioma, región para ciudades homónimas, una sola canónica, alias y 308 solo donde el destino ya es estable.
- **No copiar.** El vocabulario `/buscar` y `comuna`. Tampoco la pérdida de enlaces viejos: `.doc/api/deploy-9c45be9-verificacion.md` en Chiloé documenta 404 esperados en `/servicio/…` antiguas. No hay prueba de 308 para todas las fichas viejas. No sustituir el 307 de `proxy.ts` por un 308.

### P-03 — Sitemap — P1 — M

- **Hecho en Chiloé.** `features/services/lib/sitemapServices.ts` usa `updatedAt` real, caché diaria y tag `sitemap`. `searchCanonical.ts` resuelve la canónica de búsqueda. La ficha emite `LocalBusiness`, `Service` y reseñas con `shared/components/JsonLd/JsonLd.tsx`. Commits `ecc4585`, `115efa5`, `041d35f`.
- **Hecho en hireeo.** `app/sitemap.ts` ya limita cada ficha a su país y asigna `new Date()` a cada `lastModified`, también a las fichas (releído al integrar: cuatro asignaciones). La ficha ya tiene canónica, OG/Twitter y `LocalBusiness`, con `<` escapado a `\u003c`. No es una ausencia de SEO.
- **Opinión — beneficio.** «Última modificación» deja de ser la hora de la petición.
- **Opinión — costo.** M: exponer el timestamp, invalidar y revisar rutas. No se promete mejor ranking.
- **Internacionalización.** Origin configurable, URLs por país, locale y moneda en el dato estructurado, títulos traducidos. No se emiten `alternates` entre servicios distintos que compartan slug. La fecha de contenido va en ISO.
- **No copiar.** El dominio chiloeservicios.cl, coordenadas de Chiloé, CLP ni un umbral de indexación pensado para un solo mercado.

### P-04 — Imagen de respaldo — P1 — S–M

- **Hecho en Chiloé.** `features/services/lib/serviceImage.ts` normaliza vacíos y placehold.co, prioriza principal, luego galería, luego `/images/servicio-default.webp`, y arma la URL absoluta de OG. `ServiceImage.tsx` recupera `onError`. Hay test. Commits `a272aa4`, `b27b2b1`. Un informe en `.doc/api/` documenta placeholders en producción; esta pasada no repitió esa consulta.
- **Hecho en hireeo.** `features/services/actions/queries.ts` y favoritos conservan `https://placehold.co/600x400/3B82F6/FFFFFF?text=Sin+Imagen` (releído al integrar). La ficha usa `imagenPrincipal` o `hireeo-og.png`, aparte de la card. `ServiceGallery` rellena huecos y no es el mismo resolver.
- **Opinión — beneficio.** La card, la ficha y la vista compartida no muestran recursos distintos ni un texto «Sin+Imagen» en español dentro de la URL.
- **Opinión — costo.** S si es solo el helper y la card. M si entra galería, listados, mapa y OG.
- **Internacionalización.** Imagen neutra, sin texto incrustado. El alt se traduce. El archivo se sirve del origin o del CDN. Se mantienen los límites de `backend/src/modules/upload/`.
- **No copiar.** Una foto de Chiloé, el texto español en el placeholder, ni guardar la imagen de respaldo como si el proveedor la hubiera subido.

### P-05 — Reseña de invitado — P2 — L

- **Hecho en Chiloé.** `features/reviews/actions/mutations.ts` crea cuenta y reseña `PENDIENTE` en una `$transaction` y después separa el éxito del correo fallido. `585e0e7` corrige esa atomicidad. `016232d` impide la autorreseña. El informe de deploy de ese commit dice que no se envió reseña ni correo real en producción.
- **Hecho en hireeo.** El frontend pide token y el invitado va al login (`ReviewToggleForm`). El backend ya rechaza autorreseña y duplicado, expone solo `ACTIVE` y el schema tiene `PENDING` (`backend/src/modules/ratings/`). Brevo ya está en `backend/src/modules/email/email.service.ts`. No hace falta otro transporte.
- **Opinión — beneficio.** Menos fricción si el producto quiere reseñas de fuera de la plataforma. El correo que falla no debe verse como reseña no guardada.
- **Opinión — costo.** L: identidad, abuso, contrato, transacción y aviso. Hace falta un sí de producto.
- **Internacionalización.** Consentimiento y textos por país e idioma. El país es el del servicio. Timestamps en UTC, visualización local. Recuperación por enlace de un solo uso.
- **No copiar.** Mandar la contraseña en claro por email. Tampoco el remitente de Chiloé ni el consentimiento redactado para Chile.

### P-06 — Visitas y clics — P2 — L

- **Hecho en Chiloé.** `app/api/analytics/collect/route.ts`, `PageViewTracker`, filtro de bots, hash de sesión, purga y modelo `Visita`. Retención por defecto 90 días. `180e656`. Las interacciones de contacto van aparte. El filtro de bots está en el colector de páginas, no quedó verificado en cada clic.
- **Hecho en hireeo.** `backend/src/modules/interactions/` tiene métricas por país y clics. `ServiceBookingCard` registra `CALL`. No apareció un modelo `Visita` ni un colector de páginas. El rate limit global no clasifica bots.
- **Opinión — beneficio.** Separar visita, contacto y contratación. Un clic no es una conversión.
- **Opinión — costo.** L.
- **Internacionalización.** País del catálogo distinto del país aproximado del visitante. Retención y consentimiento configurables. Huso para los rangos del panel. Nombres de evento estables.
- **No copiar.** 90 días como regla legal universal, ni un país deducido solo de la IP.

### P-07 — Geo inválida — P1 — M

- **Hecho en Chiloé.** `features/geo/lib/validateGeoSelection.ts` rechaza comuna inactiva o inexistente y localidad ajena. `resolvePublicSearchGeo.ts` devuelve `invalidFilter` en lugar de ampliar resultados. `73cc043`, `0120878`.
- **Hecho en hireeo.** `resolveRegionAndLocality` en `backend/src/modules/services/services.service.ts` busca región por país y ciudad por región, y devuelve ids `undefined` si no encuentra. No arroja en ese helper. La búsqueda ya filtra país, región y localidad, y carga localidades al elegir región. No falta la arquitectura. Hay geocodificación y radio (`backend/src/modules/geo/location-resolver.service.ts`, `providers/geocoding.service.ts`).
- **Opinión — beneficio.** «No informado» y «informado inválido» no se confunden. El riesgo de que una selección mala se omita en silencio no se reprodujo con una escritura real: es inferencia a partir del helper.
- **Opinión — costo.** M, con pruebas de alta y edición.
- **Internacionalización.** País, división administrativa y localidad se verifican en el servidor. Las etiquetas salen de `countryUtils`. No todos los países tienen los mismos niveles. Un centro de ciudad no es una dirección. Coordenada 0 no es lo mismo que null.
- **No copiar.** Tablas o enums de comunas chilenas. Conservar radio y geocodificación de hireeo.

### P-08 — Búsqueda tolerante — P2 — L

- **Hecho en Chiloé.** `features/services/lib/serviceSearch.ts` normaliza tildes, quita una ese final y acepta una edición en palabras largas. El índice cabe en memoria con TTL de 30 s. `c09118f`.
- **Hecho en hireeo.** El backend usa Prisma `contains` con `mode: insensitive` sobre título, descripción y nombre. En ese código no está la normalización de Chiloé. No se miró el collation de la base desplegada.
- **Opinión — beneficio.** Mejores coincidencias sin apagar el filtro geográfico y sin cargar el catálogo internacional en cada proceso.
- **Opinión — costo.** L. Hay que medir relevancia antes de elegir tecnología (Postgres u otro).
- **Internacionalización.** Normalización y sinónimos por idioma. «Gásfiter», «plomero» y «plumber» no son el mismo string. Ciudades homónimas se separan con la región (P-02).
- **No copiar.** Quitar una ese como stemmer universal, ni el índice en memoria pensado para un catálogo chico.

### P-09 — Reclamar una ficha importada — P2 — L, condicional

- **Hecho en Chiloé.** `features/claims/lib/claimRules.ts` y el ciclo de `SolicitudReclamo` / `EnlaceAcceso`: tomar la ficha o retirarla, token de un uso, verificación al teléfono ya publicado. Importación en `app/api/import/servicios/route.ts`. `89fcbee`, `c5bce04`.
- **Hecho en hireeo.** No apareció ese flujo de propiedad de una ficha importada. Sí existen moderación, cotizaciones, solicitudes, escrow, fiscalidad, KYC, derechos del titular y credenciales (`backend/src/modules/moderation/`, `quotes/`, `service-requests/`, `escrow/`, `fiscal-profiles/`, `kyc/`, `data-subject-requests/`, `professional-credentials/`). No son brechas.
- **Opinión — beneficio.** Solo si hireeo va a sembrar directorios. Si no hay importación, se pospone.
- **Opinión — costo.** L, y condicionado a esa decisión.
- **Internacionalización.** Licitud del dato por mercado, teléfono E.164, canal de verificación que exista en ese país, plazo e idioma, derecho a retirar.
- **No copiar.** Datos extraídos de Chiloé, ni un SMS en lugar del KYC que hireeo ya tiene.

### P-10 — Regresión de lo aprendido — P1 — M

- **Hecho en Chiloé.** `AGENTS.md` prohíbe `alert`, `confirm` y `reload`, iconos directos y alturas ad hoc. `.github/scripts/dry-check.sh` y el workflow controlan que la deuda no crezca; no exigen deuda histórica en cero. `.doc/plan/07-refactor-roadmap.md` pide lint, tipos, build, revisión visual en claro y oscuro, y knip. `d92d41d`, `febf418`.
- **Hecho en hireeo.** El `AGENTS.md` de HEAD ya tiene DRY, scope de frontend y backend, contract-first, migraciones y la cautela de no correr `build` contra un `dev` vivo. `.github/workflows/ci.yml` corre build y test del backend y build del frontend. El nombre del job menciona lint y los pasos leídos no lo ejecutan. No apareció un ratchet DRY equivalente.
- **Opinión — beneficio.** Una definición de hecho comprobable, sin un checklist que obligue pruebas que no aplican. Conviene distinguir «implementado», «hay tests», «se ejecutaron» y «se vio en producción», como hacen los informes de deploy de Chiloé.
- **Opinión — costo.** M.
- **Internacionalización.** El cierre de una tarea de UI mira al menos dos países: moneda, huso, teléfono, dirección y textos. Un literal local nuevo fuera del diccionario o de `COUNTRY_CONFIG` no entra.
- **No copiar.** Reglas de agentes, autoría, ni guards de Prisma de Chiloé dentro del frontend. La base de hireeo se toca en el backend.

### P-11 — Vida de la ficha y premium — P2 — M, L si cambia el negocio

- **Hecho en Chiloé.** El listado público y el premium vigente no son el mismo filtro (`buildPublicServiceWhere.ts`). `activarPremium.ts` une suscripción y ficha en una transacción. Las duraciones de código son 1, 3, 6 y 12 meses.
- **Hecho en hireeo.** `services.service.ts` exige `endDate >= now` en el listado público y en `findBySlug`. `subscriptions.service.ts` ya actualiza en transacción al cobrar y respeta `paymentsEnabled`. `PreciosPorDuracion.tsx` admite más duraciones, entre ellas nueve meses. Mercado Pago y Stripe se eligen por grupo de países (`payments.service.ts`). Hay tests. Eso no acredita un cobro real.
- **Opinión — beneficio.** Decidir si vencer la suscripción baja la ficha o solo el destaque. Es una diferencia de reglas, no un bug confirmado: `endDate` puede ser vigencia editorial.
- **Opinión — costo.** M para la política y el contrato. L si hay que migrar datos.
- **Internacionalización.** Precio, moneda ISO y fin de período con huso explícito. Webhooks idempotentes. Rechazar moneda o importe que no cierran. Se quedan las dos pasarelas.
- **No copiar.** CLP, ni prohibir el plan de nueve meses porque Chiloé no lo tiene. Quitar una duración es decisión comercial.

### P-12 — Aplicar el contexto internacional que ya está — P1 — M

- **Hecho en Chiloé.** `shared/lib/date.ts` separa fecha civil de instante (`formatIsoDate`, `034ae89`). Las reglas de idioma del `AGENTS.md` son chilenas a propósito.
- **Hecho en hireeo.** `countryUtils.ts` ya tiene moneda, locale, huso, teléfono y etiquetas. `lib/i18n/` tiene diccionarios `cl`, `ar`, `uy`, `es` y `us`, y `getDictionary` cae a `cl` (releído al integrar). Aun así, la ficha arma el título con «en», «Servicio no encontrado», keywords en español y `priceRange: 'Cotización'`. `features/reviews/actions/mutations.ts` devuelve mensajes en español. El huso de `us` en `countryUtils` es uno solo, `America/New_York`. Los legales ya combinan base y override por país (`features/legal/lib/getLegalDocument.ts`, `features/legal/content/`).
- **Opinión — beneficio.** La ficha y los errores usan el diccionario y el `Intl` que ya están. No se instala otra librería de i18n. El huso único de Estados Unidos no alcanza para cada proveedor; antes de llamarlo bug visible hay que ver qué pantallas lo usan como zona de una persona.
- **Opinión — costo.** M.
- **Internacionalización.** País, idioma y huso no son el mismo dato. La fecha civil no se corre de día por UTC. El teléfono se normaliza y se muestra en formato local. La dirección es estructurada. El patrón base más override de los legales se queda, con revisión local del texto.
- **No copiar.** `dd-mm-yyyy`, la palabra «Cotización» como rango de precio, `America/Santiago` y +56 como valores universales. Esta lectura no verificó si cada integración está disponible en cada país.

## Lo que hireeo ya resuelve mejor y no debe perder

**Hecho**, salvo la frase marcada como opinión.

| Qué | Dónde | Qué no se hace |
| --- | --- | --- |
| `Field` con `htmlFor`, `aria-invalid` y `aria-describedby` | `hireeo/Field/Field.tsx` | No se porta el `Field` de Chiloé, que usa un `span` y no asocia el control. Solo se traduce «opcional» (U-16). |
| React Hook Form y Zod | `shared/components/Form/Form.tsx` | No se vuelve a estados manuales (P-01). |
| Radix: `Dialog`, `DropdownMenu`, checkbox, `Modal` de admin | `shared/components/Dialog`, `ui/checkbox`, `package.json` | No se reemplazan por el `Modal` casero ni por el toast casero. El toaster es `sileo` (`app/layout.tsx`, `shared/lib/notify.ts`). |
| Página `/design-system` | `app/design-system/page.tsx` | Se queda. Falta volcar a CSS lo que la página solo documenta (U-01) y quitar el demo en CLP (U-16). |
| Instrument Serif | `app/layout.tsx`, `--font-serif` en `globals.css` | Chiloé no la carga. No se quita para parecerse. Sigue como acento editorial. |
| Iconos SVG propios, con fallback a `alert` | `shared/components/icons`, `hireeo/Icon` | No se vuelve a Lucide. El fallback no cuenta como icono válido (U-19). |
| País en la URL, moneda, huso, etiquetas y pasarela | `countryUtils.ts`, `CountryProvider`, `proxy.ts` | No se reemplaza por `formatCurrency` en CLP ni por comunas. El fallback mudo a `cl` sí se corrige (U-14, P-12). |
| `defaultCountryCode` en el teléfono | `PhoneInput` | Chiloé no lo tiene. Se usa desde el país de la ruta (U-15). |
| Diccionarios `cl`/`ar`/`uy`/`es`/`us` | `lib/i18n/` | No se instala otro sistema. Se completa la cobertura (P-12). `us.json` ya tiene la navegación en inglés. |
| Legales por país | `features/legal/content/`, `getLegalDocument.ts` | No se pegan los textos chilenos. |
| Backend NestJS, Prisma y PostgreSQL, con guards y país en el dato | `backend/src`, `schema.prisma` | Las reglas de dominio nuevas van al backend, no a una Server Action con la base en el frontend. |
| Región, localidad, radio y geocodificación | `backend/src/modules/geo/`, `features/geo/` | No se aplana a una lista de comunas (P-07). |
| Mercado Pago y Stripe por grupo de países, cobro en transacción | `backend/src/modules/payments/`, `subscriptions/` | No se deja una sola pasarela chilena (P-11). El código no acredita un cobro real. |
| Chat en tiempo real | `backend/src/modules/chat/` | Chiloé lo eliminó en `027627c`. Esa eliminación no se porta. |
| Moderación, cotizaciones, solicitudes, escrow, KYC, derechos, credenciales | módulos citados en P-09 | No se cuentan como ausencias. No se auditó el cumplimiento jurídico. |
| Brevo | `backend/src/modules/email/email.service.ts` | No se inventa otro transporte (P-05). |
| Convención `Componente/Componente.tsx` | 154 de 156 archivos (inventario) | No se adoptan los 78 archivos planos de Chiloé. |
| App móvil | `appmobile/` (Expo 54, React Native 0.81.5, NativeWind) | Fuera de esta auditoría. Sus `colors.ts` no son la fuente de la UI web. |

**Opinión.** El accent navy `#2d4e8f` es marca de hireeo. Igualarlo al `#3b82f6` de Chiloé sería una decisión de marca, no una brecha. Lo que está desfasado es la guía que todavía dice `bg-blue-600` (U-08).

## Qué no se copia por ser de Chiloé o de Chile

**Hecho** de que la pieza existe y está atada a un lugar. **Opinión** de que no pasa tal cual.

- Comunas y la URL `/buscar/{comuna}/{categoría}/{slug}`.
- `formatCurrency` en CLP, IVA 19 % y la comisión Mercado Pago de `calcularIngresoNeto`.
- El array de teléfonos de Chiloé, el default «el primero es Chile» y las cadenas «Mostrar contraseña», «Buscar...», «opcional», «Cotización».
- Textos legales y de consentimiento escritos para Chile. La casilla, si hace falta, lleva el texto del país.
- Mails que dicen CLP y Mercado Pago como único medio.
- Admin «Comunas y localidades», chatbot que elige comuna, WhatsApp de soporte con número local.
- Datos importados desde Chiloé y la idea de que un resultado de Google autoriza a reutilizarlos (P-09).
- Placeholders con paisaje o texto local, y el dominio o las coordenadas de Chiloé en el SEO.
- Paleta `#3b82f6` / `#10b981`, Lucide, `react-icons` y la frase de shadcn.
- El `Modal` y el `Toast` caseros.
- Quitar el chat, o prohibir el plan de nueve meses, porque Chiloé lo hizo.
- Duración de retención de 90 días y stemmer «quitar una ese» como reglas universales.
- `appmobile/` como guía de la web.

## Limitaciones

**Hecho.**

- No se recontaron los 164 y 156 componentes. Siguen siendo los del inventario en `87f5ddb`.
- No se comparó campo por campo la API de los homónimos que no son primitivos (`PublicarWizard`, `ServicioFormBase` más allá del textarea citado, tablas admin, `Navbar`, `Footer`, `DataTable`).
- No se renderizó ninguna pantalla. La accesibilidad es la del fuente.
- `SearchPageClient.tsx` de Chiloé sigue modificado sin commit. No entra en las brechas.
- El `AGENTS.md` de Atlas en disco tiene el hunk de la KB de cruce sin commit. No se editó.
- No se verificó producción de hireeo, cobros, webhooks, entregabilidad de Brevo, cobertura legal, exactitud del catálogo geográfico ni rendimiento. Los informes de deploy de Chiloé son evidencia histórica leída, no pruebas de esta pasada.
- El huso único de Estados Unidos y el `endDate` de la ficha se describen como están en el código. No se afirmó un fallo visible ni un bug de negocio sin reproducirlo.
- Valentina no pudo escribir en la tarjeta: `pnpm kanban decision` y `pnpm kanban evidencia` respondieron «No tienes permiso para editar este tablero». Lo registró por Orca. Esta integración sí escribe la evidencia, porque la tarjeta está asignada a Matías Reyes.
- El reclamo `matias-ca177-3` fue rechazado: la ejecución anterior ya estaba en SUCCEEDED. No hubo token y no hay checkpoint de ejecución. El cierre de fase quedó en decisiones de la tarjeta.
- `.doc/README.md` no se actualizó. La tarjeta pide un solo archivo nuevo.

## Próximos pasos

Propuestas para que Edgardo decida. Ninguna está aplicada. No se abrieron tarjetas.

1. Gonzalo Navarro revisa este documento en Test. El commit local en `next-atlas-services` lo hace el jefe, solo con este archivo. Sin push. `AGENTS.md` sigue fuera de ese commit.
2. Si se implementa algo, el orden que esta auditoría sostiene es: U-08 (escribir la paleta real, sin tocar el hunk ajeno de `AGENTS.md` hasta que ese cambio se resuelva), U-01 y U-03, U-02, U-04 y U-05, U-06 y U-07 sobre el `Dialog` de Radix, P-04, y después P-01, P-03, P-07 y P-12. P-12 no instala otra librería: usa `lib/i18n/` y `countryUtils.ts`.
3. Decisiones que no salen del código: la forma de la URL (P-02), si una reseña de invitado entra (P-05), si vencer el premium baja la ficha (P-11), si habrá importación de fichas (P-09) y si el accent navy se queda (recomendación de esta página: se queda).
4. P-08, P-06 y U-21 no se empiezan copiando el archivo de Chiloé. Hace falta medir búsqueda, privacidad de visitas y el shell de admin por país.
5. El commit `87f5ddb` del inventario quedó en `main` de Chiloé, sin push. Qué hacer con él sigue en la consulta abierta de la tarjeta. Esta auditoría no lo revierte ni lo mueve.

## Verificación git al cierre

**Hecho.** Después de escribir este archivo. El submódulo `frontend` no imprimió cambios. El submódulo `backend` no imprimió cambios.

Atlas (`next-atlas-services`), `git status --short`:

```
 M AGENTS.md
?? .doc/2026-10-11-brechas-de-hireeo-respecto-de-chiloeservicios.md
```

`AGENTS.md` ya estaba modificado antes de CA-177. Este trabajo no lo tocó.

Chiloé (`next-chiloeservicios`), `git status --short`:

```
 M src/features/services/components/search/SearchPageClient/SearchPageClient.tsx
?? .doc/api/deploy-67513ba-verificacion.md
?? .doc/plan/2026-10-08-auditoria-innovacion/00-decisiones.md
?? .doc/plan/2026-10-08-auditoria-innovacion/00-estado-ejecucion.md
?? .doc/plan/2026-10-08-auditoria-innovacion/01-hechos-hipotesis-opinion.md
?? .doc/plan/2026-10-08-auditoria-innovacion/02-brechas-y-recomendaciones.md
?? .doc/plan/2026-10-08-auditoria-innovacion/03-hoja-de-ruta.md
?? .doc/plan/2026-10-08-auditoria-innovacion/04-relevamiento-oferentes-informales.md
?? .doc/plan/2026-10-08-auditoria-innovacion/06-contexto-chiloe.md
?? .doc/plan/2026-10-08-auditoria-innovacion/07-anexo-alta-asistida.md
?? .doc/plan/2026-10-08-auditoria-innovacion/07-plan-google-maps.md
?? .doc/plan/2026-10-08-auditoria-innovacion/README.md
?? .doc/tmp-cards/
```

Nada nuevo en Chiloé. El documento de la primera pasada ya está en el commit `87f5ddb` y no aparece como untracked.
