---
title: Testing E2E por rol y país
tags:
  - hireeo
  - testing
  - e2e
  - qa
---

# Testing E2E por rol y país

Este índice coordina la ejecución manual y futura automatización Playwright de Hireeo. Los recorridos se documentan por actor para conservar responsabilidades, permisos y evidencia separados.

> [!important] Alcance
> Ejecutar cada caso aplicable para `cl`, `ar`, `uy`, `es` y `us`. Paraguay no forma parte de la matriz hasta que esté activo. El producto público y el dashboard se validan con interfaz real; no se crean sesiones ni entidades mediante API salvo la preparación controlada de fixtures.

## Planes por rol

| Rol | Plan | Superficie |
|---|---|---|
| Público | [[plan-e2e-publico]] | Web pública, autenticación y límites de acceso |
| Client | [[plan-e2e-client]] | Web autenticada y dashboard de cliente |
| Professional | [[plan-e2e-professional]] | Publicación, dashboard, CRM y suscripción |
| Admin | [[plan-e2e-admin]] | Dashboard operativo limitado por país |
| SuperAdmin | [[plan-e2e-superadmin]] | Configuración global y dashboards nacionales |

También se conserva [[plan-e2e-publicacion-multipais]] como recorrido especializado de alta y publicación anónima; sus casos se incorporan como dependencia del plan Professional.

## Matriz obligatoria

| Código | País | Región / localidad | Moneda | Pago Premium |
|---|---|---|---|---|
| `cl` | Chile | Región / Comuna | CLP | MercadoPago |
| `ar` | Argentina | Provincia / Localidad | ARS | MercadoPago |
| `uy` | Uruguay | Departamento / Localidad | UYU | MercadoPago |
| `es` | España | Comunidad autónoma / Localidad | EUR | Stripe |
| `us` | Estados Unidos | Estado / Localidad | USD | Stripe |

## Preparación y datos

1. Usar un entorno E2E aislado, con backend, frontend y base de datos disponibles, geo/categorías/precios sembrados para los cinco países y proveedores externos en sandbox.
2. Preparar cuentas independientes: Client y Professional por país; Admin scoped por país; un SuperAdmin global. No escribir contraseñas, tokens ni correos reales en los planes ni evidencias.
3. Crear fixtures etiquetados `E2E-<ROL>-<PAIS>-<timestamp>`: servicios, solicitudes, cotizaciones, reseñas, conversaciones, favoritos y direcciones. La limpieza se hará únicamente por un procedimiento previamente autorizado.
4. Antes de cada caso, abrir contexto limpio o `storageState` correspondiente; conservar Network, Console y trace. En mutaciones, registrar código HTTP y resultado funcional, nunca credenciales ni JWT.

## Credenciales de prueba (solo entorno local)

> [!warning] Uso exclusivo local
> Aplica únicamente al entorno local descrito en las incidencias (`frontend` `http://localhost:3334`, `backend` `http://localhost:4445/api/v1`, DB local `docker-database` puerto `5435`). No es una credencial real ni de producción — Hireeo aún no despliega a producción.

Contraseña estándar reseteada el 2026-08-28 para las 25 cuentas seed (`admin.{cl,ar,uy,es,us}`, `client{1,2}.{cl,ar,uy,es,us}`, `pro{1,2}.{cl,ar,uy,es,us}`, todas `@hireeo.app`):

```
Hireeo2026!Test
```

El reseteo también incrementó `tokenVersion` de cada cuenta, invalidando cualquier sesión JWT previa.

**SuperAdmin de fixture (creada 2026-08-28):** `superadmin.test@hireeo.app`, rol `SuperAdmin` global (`countryId = NULL`), misma contraseña estándar de arriba. Se creó una cuenta dedicada en vez de reutilizar las 3 cuentas `SuperAdmin` reales preexistentes en la DB local (emails personales, con contraseña propia) — esas no se tocan ni se usan para testing automatizado.

## Convenciones de caso y evidencia

- ID: `E2E-<ROL>-<ÁREA>-NNN`; el mismo caso se ejecuta una vez por país cuando diga **5 países**.
- Resultado: `PASS`, `FAIL`, `BLOCKED` o `NOT-APPLICABLE`, con país, usuario/fixture, fecha y URL final.
- Evidencia mínima: captura del estado final, trace/har ante fallo, Console sin errores relevantes y solicitudes de mutación sanitizadas.
- Toda incidencia debe registrar paso, esperado, observado, país, rol, severidad, reproducción y artefactos. Un fallo compartido obliga a revalidar los cinco países afectados tras corregirse.

## Criterios transversales de aprobación

- La URL mantiene el prefijo correcto `/{country}` y no expone datos ni contenido de otro país.
- Región, localidad, categorías, moneda y gateway proceden de la configuración/datos reales del país; no se aceptan fixtures hardcodeados en la UI.
- Un rol solo puede ejecutar sus acciones propias y las rutas prohibidas redirigen o muestran `unauthorized` sin mutar datos.
- Cada wizard cubre validación, retroceso/cancelación cuando exista, éxito, error recuperable y persistencia posterior.
- La evidencia demuestra el resultado desde la UI, no solo una respuesta de API.

## Remediación de incidencias (2026-08-29)

El [[../tareaspendientes/grok-e2e-incidencias|plan canónico de remediación]] cerró 23 de las 24 incidencias únicas de código detectadas en estos planes (una, INC-019, quedó en modo mitigación por Gate `G-COUNTRY` — ver el plan para el detalle). Cada informe de incidencias por rol tiene su propio bloque "Estado de resolución" con el detalle y la evidencia de cada fix.

Informes de apoyo generados durante la remediación:
- [Informe de fechas (T1.3)](./informe-fechas-t1.3.md) — endpoints con fechas rotas por el bug del interceptor de serialización (INC-012), insumo de la verificación de INC-008.
- [Informe de inventario de países (T7.1)](./informe-inventario-paises-t7.1.md) — los 17 puntos hardcodeados que motivaron el modo mitigación de INC-019.
- Snapshot de base de datos previo a la remediación en `snapshots/` (fuera de git, no versionado).

## Automatización posterior

Parametrizar los casos por país en Playwright, con selectores de rol o `data-testid` estables, fixtures aislados y trazas/video/screenshot al fallar. Separar los casos que interactúan con Stripe, MercadoPago, Cloudinary, Gemini o Stripe Identity: ejecutarlos en sandbox y simular solo cuando el proveedor no ofrezca un flujo E2E seguro.
