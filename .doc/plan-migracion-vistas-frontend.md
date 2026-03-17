# Plan Final: Limpieza de UI y Vista (Fase 6)

## Contexto de la Situación Actual
Las Fases 1 a 5 de la migración para reemplazar el uso directo de la base de datos (PrismaORM) en el frontend por un consumo al backend (NestJS) vía API REST (`apiClient`) han sido completadas a nivel de **Server Actions** y lógica central. 

Sin embargo, tras eliminar la dependencia `prisma` y el cliente generado, el proceso de compilación (`pnpm build`) arrojó múltiples errores de TypeScript (aprox. 73 errores distribuidos en 24 archivos). Estos fallos revelaron que varias vistas completas dependían fuertemente del ORM directamente y que hay problemas de compatibilidad de tipos con la nueva versión de Next.js (16.1.1).

## Objetivos Generales
1. Restaurar la compilación del frontend al 100%.
2. Descentralizar las vistas de UI que estaban muy acopladas a la DB y forzarlas a consumir la API.
3. Resolver conflictos de tipado con `revalidateTag`.
4. Arreglar u omitir scripts de testing antiguos (e.g. `setup-test-users.ts`).

---

## Plan de Acción Paso a Paso

### Paso 1: Solucionar Lints de `revalidateTag` en Server Actions
Las funciones importadas de `next/cache` en Next.js 16.1 (con experimental/Turbopack) están arrojando un error exigiendo dos argumentos para `revalidateTag`: `revalidateTag(tag: string, profile: string | CacheLifeConfig)`.
- **Acción:** Ubicar todos los archivos de mutaciones donde se usa `revalidateTag('algo')`.
- **Solución provisoria/definitiva:** Dado que el segundo parámetro no está claramente documentado o estándar sin un profile predefinido, y en Next 15+ se recomienda manejar los tags de otra manera, la solución inicial será eliminar estas llamadas, temporalmente comentar su uso, o reemplazarlas exclusivamente por `revalidatePath()`, que sigue requiriendo 1 solo argumento y es suficiente para refescar la data sin arrojar error.
- **Archivos Afectados (Muestra):**
  - `features/users/actions/mutations.ts`
  - `features/services/actions/mutations.ts`
  - `features/reviews/actions/mutations.ts`

### Paso 2: Refactorizar Componentes Públicos y de Perfil
Existen páginas fuera del admin que consumían `prisma` y ahora fallan o fallan otras validaciones.
- **Acción:** Detectar Server Components en `(public)` y `(perfil)` que se rompieron y reescribirlos usando llamadas a las queries del `apiClient` (e.g. `getServicioById`, `getUsersAll`, etc.).
- **Archivos Afectados (Verificar y limpiar):**
  - `src/app/(public)/perfil/page.tsx`
  - `src/app/(public)/perfil/ajustes/page.tsx`
  - `src/app/(public)/servicio/[slug]/page.tsx`
  - Componentes de pago/suscripciones (`Paso4SeleccionarDuracion`, `PrecioPremiumForm`).

### Paso 3: Desacoplar el Dashboard de Backoffice Administrativo (`/admin`)
El Panel Admin está profundamente acoplado a leer tablas de la DB completa (`prisma.usuario.findMany()`, `prisma.interaccion.groupBy()`, etc.).
- **Acción:** Ir vista por vista en el Admin y cambiar el origen de datos.
- **Detalles por sección:**
  - **`admin/page.tsx` (Dashboard global):** Consumir un resumen estadístico global (requiere endpoint en el backend o armar con lo disponible).
  - **`admin/usuarios`**: Usar `getAdminUsers()` para pintar las tablas págindas.
  - **`admin/servicios`**: Usar `getAdminServices()`.
  - **`admin/calificaciones`**: Usar `getTodasCalificaciones()`.
  - **`admin/interacciones`**: Usar `getInteracciones()` y metrics (adaptarlas o mockearlas temporalmente si el backend carece de ese módulo estadístico).
  - **`admin/pagos`**: Modificar los historiales usando las queries base del API Client o mock temporal.

### Paso 4: Corrección de UI y Callbacks
Algunos componentes de front (Client Components) esperan propiedades ligeramente diferentes ahora que la data viene del backend.
- **Acción:** Ajustar variables. Por ejemplo, en los formularios de publicar servicios hay un error sobre la lectura de `telefono` desde la respuesta de usuario (cuando ahora la propiedad de backend es distinta).
- **Ejemplo detectado:** `src/features/services/publish/components/Paso2TuOficio.tsx` se queja de un error con `user.telefono` que ahora debe alinearse a la interfaz `BackendUserDto` u omitirse.

### Paso 5: Ajuste de Scripts de Testing (E2E)
El script de Playwright (`tests/scripts/setup-test-users.ts`) dependía de inyectar datos falsos instalando `bcrypt` y usando el cliente directo de `prisma` del proyecto. Al eliminarlos del proyecto global, este script se rompió.
- **Acción:** Extraer este script y convertirlo en llamadas a la API REST (consumir la ruta POST `auth/register` de test, o inyectar data por medio de un endpoint seed del backend). También se puede mover la dependencia de Prisma e inyección directa hacia el ecosistema del backend.

### Paso 6: Compilación Exitosa (`pnpm build`)
- **Acción:** Ejecutar `npx tsc --noEmit` de forma iterativa y finalmente `pnpm build` para validar. El objetivo de este paso es obtener 0 errores, asgurando que Next.js compile sin la dependencia de base de datos directa y con todos sus tipos correctos.
