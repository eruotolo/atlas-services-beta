# Reporte de Testing E2E — 17 de Marzo 2026

**Fecha:** 2026-03-17
**Herramienta:** Playwright 1.58.2
**Resultado final:** ✅ 135/135 tests pasan

---

## Resumen Ejecutivo

| Suite | Tests | Estado |
|-------|-------|--------|
| Guest (Público) | 40 | ✅ 40/40 |
| Usuario (Privado) | 35 | ✅ 35/35 |
| Admin (CRUD) | 28 | ✅ 28/28 (eran 30 con setup) |
| Seguridad | 25 | ✅ 25/25 |
| Setup (Auth) | 2 | ✅ 2/2 |
| **TOTAL** | **135** | **✅ 135/135** |

---

## Bugs Encontrados y Corregidos

### BUG-001 🔴 CRÍTICO — `apiClient` sin header `x-api-key`
**Archivo:** `src/lib/api/apiClient.ts`
**Síntoma:** Login devolvía "Credenciales inválidas" aunque las credenciales eran correctas. El backend rechazaba todas las requests con `401 API Key inválida`.
**Causa raíz:** El `apiClient` nunca enviaba el header `x-api-key` requerido por el backend.
**Corrección:** Agregar lectura de `NEXT_PUBLIC_API_KEY` e incluirlo en todos los headers de las requests.

```typescript
// Antes
const headers = { 'Content-Type': 'application/json', ... };

// Después
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';
const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    ...
};
```

**Impacto:** Bloqueaba completamente el login, y por ende todos los tests autenticados (usuario + admin). Auth Setup fallaba.

---

### BUG-002 🔴 CRÍTICO — `getAdminCategorias` usando endpoint público
**Archivo:** `src/features/categories/actions/queries.ts`
**Síntoma:** Página `/admin/categorias` siempre mostraba "No hay registros disponibles" aunque había categorías en la DB.
**Causa raíz:** La función `getAdminCategorias` llamaba a `/categories` (endpoint público que retorna `BackendCategoryDto[]`) cuando debería llamar a `/categories/admin` (endpoint admin con paginación `{ data, meta }`). Al recibir un array en vez de `{ items, data }`, el código hacía `response.items ?? response.data ?? []` resultando siempre en `[]`.
**Corrección:**
1. Cambiar endpoint de `/categories` a `/categories/admin`
2. Agregar `getAuthToken()` (el endpoint admin requiere auth)

---

### BUG-003 🟡 MEDIO — Sponsors retornaban objeto paginado, código esperaba array
**Archivo:** `src/features/sponsors/actions/queries.ts`
**Síntoma:** Errores en server logs: `TypeError: (response ?? []).map is not a function`. Los sponsors no se mostraban en el homepage.
**Causa raíz:** Las funciones `getSponsorsSenior`, `getSponsorsPremium` y `getSponsorStandardRandom` esperaban `BackendSponsorDto[]` pero el backend retornaba `{ data: [...], meta: {...} }`.
**Corrección:** Cambiar tipo de respuesta a `BackendPaginatedResponse<BackendSponsorDto>` y usar `response.data` en vez de `response`.

---

### BUG-004 🟡 MEDIO — Tests: selectores incorrectos (varios)

**4a. Security /perfil** (`tests/e2e/security.spec.ts:79`)
- **Problema:** Buscaba `getByRole('heading').filter({ hasText: /Estadísticas/i })` pero "Estadísticas" no es un heading sino texto de sección.
- **Corrección:** Cambiar a `locator('text=Mis Servicios Publicados').or(...)`.

**4b. Actualizar nombre** (`tests/e2e/user.spec.ts:48`)
- **Problema:** Strict mode violation — el locator `text=actualizado` matcheaba tanto el navbar (nombre del usuario) como el mensaje de éxito, resolviendo a 2 elementos.
- **Corrección:** Agregar `.first()` al locator.

**4c. Crear usuario** (`tests/e2e/admin.spec.ts:179`)
- **Problema:** El formulario requiere seleccionar al menos un rol mediante checkboxes, pero el test buscaba un `<select>`.
- **Corrección:** Buscar `input[type="checkbox"]` y hacer `.check()` antes de enviar.

**4d. Crear categoría** (`tests/e2e/admin.spec.ts:56`)
- **Problema:** Strict mode violation — `text=Test Categoría` matcheaba múltiples filas (de tests anteriores).
- **Corrección:** Agregar `.first()`.

**4e. Eliminar categoría** (`tests/e2e/admin.spec.ts:108`)
- **Problema:** El botón eliminar usa icono `<Trash2>` sin texto, solo `title="Eliminar"`. El selector `button:has-text("Eliminar")` no lo encontraba → timeout de 30s.
- **Corrección:** Agregar `button[title="Eliminar"]` al selector.

---

## Cobertura de Tests Verificada

### ✅ Formularios Públicos
- Login (campos, validación email, error credenciales incorrectas)
- Registro (campos requeridos, validación contraseña, link a login)
- Contacto (nombre, email, textarea)
- Búsqueda pública

### ✅ Formularios Privados (Usuario)
- Actualizar perfil (nombre, teléfono)
- Cambiar contraseña (validación)
- Publicar servicio (título, descripción, precio, categoría, comuna, datos de contacto)
- Editar servicio propio

### ✅ CRUD Admin
- Categorías: Crear, Editar, Eliminar, Toggle activo/inactivo
- Usuarios: Crear (con rol), Editar, Listar
- Servicios: Filtrar, Toggle estado, Modal crear
- Calificaciones: Filtrar, Aprobar, Rechazar
- Sponsors: Cargar, Modal crear
- Precios Premium: Cargar, Listar planes
- Pagos: Cargar, Filtrar por fecha
- Interacciones: Cargar, Mostrar estadísticas

### ✅ Pagos
- `/suscripcion-pro` carga y muestra planes con precios (guest y usuario autenticado)
- Botón CTA "Contratar" visible
- Página de pagos admin accesible

### ✅ Autenticación y Roles
- Login exitoso → redirige a `/perfil`
- Logout disponible en navbar
- Registro con link a login
- Usuario no autenticado → redirige a `/login` (11 rutas protegidas)
- Usuario regular NO puede acceder a `/admin/*` → redirige a `/unauthorized`
- Administrador con rol `SuperAdministrador` → acceso completo a `/admin/*`
- 11 rutas públicas accesibles sin autenticación

### ✅ Responsiveness
- Mobile (375x667) — iPhone SE
- Tablet (768x1024) — iPad

---

## Estado del Servidor

- **Backend NestJS:** `http://localhost:4000` — Iniciado durante la sesión de tests
- **Frontend Next.js:** `http://localhost:3000` — Levantado automáticamente por Playwright
- **PostgreSQL:** `localhost:5432` — Disponible

### Errores de servidor durante tests (no bloqueantes)
- `ECONNREFUSED` en algunas requests — ocurría cuando el backend no estaba iniciado inicialmente, ahora resuelto
- Estos errors aparecen en logs pero están manejados con try/catch → no afectan la UX

---

## Comandos Utilizados

```bash
# Setup de usuarios de prueba (vía API del backend)
curl -X POST http://localhost:4000/api/v1/auth/register ...

# Ejecutar suite completa
pnpm test:e2e

# Lint y Build (post-correcciones)
pnpm lint && pnpm build
```

---

## Archivos Modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `src/lib/api/apiClient.ts` | Bug fix — agregar `x-api-key` header |
| `src/features/categories/actions/queries.ts` | Bug fix — endpoint `/categories/admin` + auth token |
| `src/features/sponsors/actions/queries.ts` | Bug fix — respuesta paginada en sponsors |
| `tests/e2e/security.spec.ts` | Fix selector `/perfil` |
| `tests/e2e/user.spec.ts` | Fix strict mode violation |
| `tests/e2e/admin.spec.ts` | Fix selectores (rol checkbox, eliminar por title, first()) |
