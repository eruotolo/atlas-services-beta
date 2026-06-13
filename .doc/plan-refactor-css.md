# Plan de Refactorización UI: Tailwind v4 + Componentes CSS

## 🎯 El Problema Actual
La aplicación sufre de "deuda técnica visual" generada por el ritmo rápido de desarrollo:
1. **Redundancia de Estilos:** Uso extensivo del atributo `style={{ background: 'var(--bg)', color: 'var(--ink)' }}` conviviendo con `className` de Tailwind.
2. **Especificidad Rota:** Los estilos en línea bloquean los pseudo-estados (`hover:`, `focus:`) y complican el Dark Mode.
3. **HTML Sobrecargado ("Utility Hell"):** Docenas de clases repetidas en componentes estándar (ej. botones, tarjetas, inputs) que ensucian los archivos `.tsx` haciéndolos difíciles de leer y mantener.

## 📜 Nuevas Reglas de Oro para Estilos (Guía de Estilo Oficial)

1. **PROHIBIDO EL USO ESTÁTICO DE `style={}`**: El atributo `style` queda reservado **exclusivamente** para valores calculados matemáticamente en JS (ej. `style={{ width: \`\${progress}%\` }}`) o animaciones fluidas (framer-motion).
2. **USO DE VARIABLES DE TEMA**: Todo color semántico debe usarse a través de la clase utilitaria nativa de Tailwind (`bg-bg`, `text-ink`, `border-line`, `text-accent`), ya que Tailwind v4 mapea el `@theme` automáticamente.
3. **COMPONENTES CSS GLOBALES (Tailwind v4)**: Cualquier combinación de utilidades de Tailwind que supere las 5 clases y se repita más de 2 veces en el proyecto, será abstraída a una clase semántica en `globals.css` bajo la directiva `@layer components` (ej. `.card-base`, `.badge-accent`, `.btn-primary`).

---

## 🛠 Plan de Ejecución paso a paso

### FASE 1: Auditoría y Extracción de Componentes CSS
*   **Acción:** Analizar los archivos `.tsx` más pesados y el directorio `shared/components`.
*   **Objetivo:** Identificar patrones UI repetidos (Botones, Tarjetas de Servicio, Badges, Modales, Inputs).
*   **Implementación:** Crear estas abstracciones en `globals.css` (Tailwind v4 support) usando sintaxis `@apply` o reglas CSS directas, reduciendo drásticamente la verbosidad del DOM.

### FASE 2: Limpieza de Componentes Core (`/shared`)
*   **Acción:** Refactorizar todo el directorio `frontend/src/shared/components`.
*   **Objetivo:** Eliminar los atributos `style` forzados y sustituirlos por nuestras nuevas clases del `@theme` (`bg-bg`, `text-ink`, etc.) o los nuevos componentes CSS.
*   **Alcance:** Navbar, Footer, Botones base, Iconos, Spinners.

### FASE 3: Limpieza de Componentes de Dominio (`/features`)
*   **Acción:** Refactorizar los flujos específicos de negocio en `frontend/src/features`.
*   **Objetivo:** Limpiar la UI de reservas, pasarela de pago, buscador y las tarjetas de `ServiceCategories`.
*   **Alcance:** Componentes de `services`, `geo`, `checkout`, `ChatIA` y `search`.

### FASE 4: Vistas y Layouts (`/app`)
*   **Acción:** Revisar las páginas principales de renderizado de servidor (RSC).
*   **Objetivo:** Asegurar que las grillas (Grids), contenedores (`max-w-site`), y tipografías (Hero, Headers) sigan las nuevas reglas de componentes sin en línea.
*   **Prueba Final:** Validar exhaustivamente el **Modo Oscuro** (Dark Mode), ya que al quitar los estilos en línea, Tailwind aplicará las variables automáticas correctamente en todo el DOM.
