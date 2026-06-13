# Estrategia de Rediseño del Dashboard 2026 (Premium SaaS)

Este documento define las directrices maestras para el rediseño del Panel de Administración (`/config` y futuramente `/admin`). El objetivo es migrar de un Dashboard utilitario a una experiencia Premium SaaS nivel 2026, garantizando coherencia absoluta en tipografías, formularios, tablas y modales.

## 1. Visión y Tendencias UI/UX 2026

La interfaz de 2026 abandona la densidad de datos cruda y prioriza la **claridad cognitiva** y la **materialidad**.

*   **Bento Grids Adaptativos:** Uso de tarjetas modulares asimétricas para presentar información densa de forma digerible, manteniendo el orden y limitando el ancho máximo en monitores ultra-anchos (ej. `max-w-7xl`).
*   **Materialidad y Profundidad (Glassmorphism 2.0):** En lugar de fondos grises planos, se utilizan efectos de cristal esmerilado sutil (Backdrop blur de 10-20px), con bordes translúcidos (ej. `border-white/20` o `border-slate-200/50`) y sombras suaves (`shadow-sm` que escalan a `shadow-md` al hacer hover).
*   **Diseño para la Intención (Calm Interfaces):** Uso estratégico del espacio en blanco. El Dashboard debe prever qué datos necesita ver el usuario antes de que tenga que buscarlos, utilizando micro-animaciones escalonadas para guiar el ojo sin abrumar.

## 2. Design Tokens (Fundación Visual Pro-Max)

Para mantener una coherencia estricta, NUNCA se deben usar estilos en línea (`style={{...}}`). Todo debe provenir de estos *tokens* base (integrados en `tailwind.config.ts`):

### 2.1. Tipografía (El pilar de la coherencia)
*   **Títulos y Encabezados (Modales, Secciones):** Familia sin serifas geométrica y moderna como `Satoshi`, `Inter` o `Outfit` (peso 600-700).
*   **Cuerpo (Formularios, Tablas):** `General Sans` o la misma `Inter` (peso 400-500) para máxima legibilidad.
*   **Números Relevantes (Métricas, Gráficos):** Fuente monoespaciada (ej. `Fira Code` o `JetBrains Mono`) para asegurar la alineación perfecta de datos financieros o contadores estadísticos.
*   *Regla Estricta:* Prohibido usar más de 2 familias tipográficas en toda la app. Los títulos de todos los modales deben derivar de un mismo componente base.

### 2.2. Paleta de Colores (Premium Admin)
Recomendación generada por IA para SaaS Premium:
*   **Base / Superficies:** Tonos profundos neutros o pizarras (`#1C1917` Stone 900 o `#0F172A` Slate 900 para dark mode).
*   **Fondo Principal (Modo Claro):** Blanco puro o gris levísimo `#F8FAFC` (Slate 50).
*   **Acentos (CTA / Interactivos):** Índigo (`#6366F1`) para acciones primarias y Esmeralda (`#10B981`) para confirmaciones/éxito. Alternativamente, usar el color de marca (Brand) pero con variantes calculadas (HUE shifts).
*   **Bordes:** Siempre sutiles, la interfaz debe sentirse separada por sombras y espacios, no por líneas duras.

## 3. Consistencia Quirúrgica en Componentes

Para evitar que "los formularios sean distintos y las tablas no tengan nada bonito", se deben crear o modificar los *wrappers* (envoltorios) sobre los componentes de Shadcn.

### 3.1. Ventanas Modales (Dialogs)
El mayor problema en paneles de administración son los modales Frankenstein.
*   **Layout Estricto:** 
    *   **Header:** Siempre `h-14` con un borde inferior `border-b border-border/50`. Título alineado a la izquierda, botón `X` iconográfico a la derecha.
    *   **Body:** Padding generoso y consistente (ej. `p-6`). Si hay scroll, el header y footer deben quedarse fijos.
    *   **Footer:** Botón secundario ("Cancelar") a la izquierda o junto al primario. Botón primario ("Guardar", "Confirmar") SIEMPRE a la derecha.
*   **Fondo (Backdrop):** Oscurecimiento suave con blur (`backdrop-blur-sm bg-black/40`) para enfocar la atención sin perder el contexto.

### 3.2. Tablas (Data Tables)
*   **Jerarquía Visual:** Cabeceras (`<th>`) con un fondo levísimo (ej. `bg-muted/30`) y tipografía reducida (`text-xs uppercase tracking-wider font-semibold text-muted-foreground`).
*   **Alineación de Datos:** Textos alineados a la izquierda. Números, fechas y dinero **siempre** alineados a la derecha. Estados (Badges) centrados o a la izquierda.
*   **Acciones Compactas:** Evitar poblar las filas con múltiples botones. Usar un menú "Más opciones" (3 puntos verticales) implementando el componente `DropdownMenu` de Shadcn para mantener la tabla visualmente limpia.
*   **Estados Vacíos (Empty States):** Toda tabla debe tener un estado vacío hermosamente diseñado con un icono ilustrativo y un botón de "Crear nuevo".

### 3.3. Formularios (Forms)
*   **Inputs Activos:** Todos los campos de texto deben reaccionar al foco: `focus:ring-2 focus:ring-primary/20 focus:border-primary` con una transición `transition-all duration-200`.
*   **Ubicación de Etiquetas (Labels):** Siempre encima del input (`flex-col gap-1.5`), con `text-sm font-medium`. NUNCA usar placeholders como reemplazo de etiquetas.
*   **Validación en Vivo:** Mensajes de error en color rojo tenue (`text-destructive`), debajo del input, apareciendo con animación `animate-in slide-in-from-top-1`.

## 4. Estrategia de Implementación (Hoja de Ruta)

Para aplicar esto en `/config` y `/admin` sin romper la app:

1.  **Auditoría de Shadcn:** Asegurar que todos los componentes base (Dialog, Select, Table, Input) estén unificados en `src/shared/components/ui`.
2.  **Refactorización de Temas:** Ajustar `globals.css` (variables de color de Shadcn) y `tailwind.config.ts` (radios de bordes a `0.75rem` o `1rem` para un look moderno).
3.  **Layout Wrapper 2.0:** Crear un nuevo `DashboardLayout` con un Sidebar elegante (glassmorphism) y Navbar superior fijo con migas de pan (Breadcrumbs) automáticas.
4.  **Migración de Páginas (Poco a poco):** Empezar por el `page.tsx` principal (las métricas globales) pasándolo a un Bento Grid, y luego refactorizar cada tabla de configuración una por una inyectando el nuevo diseño estricto.

## 5. Checklist de Calidad (Pre-Merge)
- [ ] No hay iconos como emojis (Obligatorio usar `Lucide-react`).
- [ ] Todo elemento interactivo tiene `cursor-pointer` y estado `hover` visible.
- [ ] Radios de bordes (`rounded-*`) consistentes (no mezclar tarjetas cuadradas con modales muy redondos).
- [ ] 0% uso de etiquetas `<div style={{...}}>` para layout o colores.
- [ ] Los modales derivan del mismo `<Dialog>` base y respetan la anatomía Header/Body/Footer.
