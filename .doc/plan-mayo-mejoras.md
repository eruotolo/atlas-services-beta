# Plan Mayo de Mejoras — Atlas Services

Este plan consolida las mejoras y correcciones pendientes identificadas en el sistema, enfocándose en concretar la migración Multi-País (v2) y solucionar la deuda técnica heredada del desacople del ORM en el frontend.

> **Nota:** Este documento servirá como base para el trabajo del mes de Mayo. Queda abierto para sumar nuevos requerimientos y prioridades que surjan.

## 1. Fase Backend: Resolución de Bugs Críticos Multi-País
El backend actual necesita correcciones para que la API responda correctamente según el país del contexto, antes de que el frontend pueda consumirla sin errores.

- **Fix `CountryAdminGuard`**: Modificar el guard de seguridad para que lea correctamente el array de strings `adminCountries` desde el JWT en vez de esperar un array de objetos.
- **Fix `SubscriptionsService`**: Ajustar la lógica de subscripción para que asigne el precio basado en el país del usuario (`countryId`), en lugar de tomar el primer precio global disponible.
- **Fix Seed de Precios**: Actualizar `prisma/seed/prices/index.ts` para que inserte precios premium no solo para Chile, sino también para Argentina (ARS), Uruguay (UYU), España (EUR) y EE. UU. (USD), evitando crasheos en la inicialización de estos países.
- **Filtros por País en Recursos Globales**: Modificar los servicios de `Categorías` y `Sponsors` para que acepten y apliquen un filtro por `countryCode`, evitando que se filtre data no correspondiente a la región actual.

## 2. Fase Frontend: Estabilización y Multi-País
El frontend requiere estabilizarse tras la remoción directa de Prisma y adoptar transversalmente la arquitectura Multi-País.

### 2.1 Estabilización y Deuda Técnica (Errores de Consumo API)
- **Migración de caché (`revalidateTag`)**: Reemplazar temporalmente el uso de `revalidateTag` por `revalidatePath()` en las Server Actions para cumplir con las nuevas exigencias de Next.js 16.1.
- **Refactor de Vistas de Perfil y Públicas**: Corregir la lectura de propiedades (ej. `user.telefono`) en componentes como `Paso2TuOficio` y las vistas de `/perfil` que aún esperan la estructura directa de Prisma en vez de los DTOs de NestJS.
- **Refactor del Dashboard Admin (`/admin`)**: Eliminar las consultas agrupadas acopladas al ORM (ej. `prisma.interaccion.groupBy()`) y reemplazarlas por peticiones GET al backend.

### 2.2 Limpieza de Textos y Componentes Multi-País
- **Limpieza de "Hardcodes" Locales**: Remover referencias estáticas a "Chiloé", "Castro", "Ancud" y "Garantía Chilota" en `HomeHeroSection`, el buscador, los *metadatos* y los pies de página. Éstos deben ser reemplazados por textos dinámicos proveídos por `CountryProvider`.
- **Implementación de `useCountryLink`**: Actualizar más de 50 links internos estáticos (ej. `/buscar`) para que utilicen el hook o helper que antepone la ruta del país actual (ej. `/cl/buscar`).
- **Formularios Dinámicos (`LocalitySelect`)**: Sustituir constantes rígidas como `COMUNAS_CHILOE` por el componente `LocalitySelect` que carga regiones y localidades dependientes de forma dinámica desde la API geográfica del backend.

## 3. Fase Infraestructura y Testing
- **Actualización de Scripts E2E**: Reescribir el script Playwright de inicialización de usuarios de prueba (`setup-test-users.ts`), para que consuma endpoints de prueba del backend en vez de intentar conectarse localmente a una base de datos usando `bcrypt` y `prisma`.

---

## Verificación del Plan
*   **Build Frontend**: Tras corregir la Fase 1 y Fase 2, ejecutar `pnpm build` no solo debe compilar exitosamente, sino que la regeneración estática de Next.js (SSG) no debe arrojar errores "500 - Base de datos".
*   **Tests**: Ejecución exitosa de `pnpm test:e2e` para validar los flujos de login y navegación entre países.
