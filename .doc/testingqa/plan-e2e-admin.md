---
title: Plan E2E Admin por país
tags: [hireeo, testing, e2e, admin]
---

# Plan E2E — Admin

Referencia: [[README]]. **Precondición:** un Admin con `UserRole.countryId` distinto por cada país, además de fixtures Client/Professional. Ejecutar en los **5 países**.

## Dashboard operativo por país

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-ADM-001 | Login y `/{country}/admin`; verificar KPIs, tablas/actividad y navegación sidebar. | Sólo métricas y contenido del país asignado. |
| E2E-ADM-002 | Categorías: listar, buscar, crear, validar duplicado/campos, editar y eliminar fixture no referenciado. | CRUD scoped al país; no modifica categorías de otro país. |
| E2E-ADM-003 | Usuarios: listar, buscar/filtros, abrir formulario/direcciones y editar atributos permitidos. | No expone ni muta usuarios de otros países; roles/globales quedan restringidos. |
| E2E-ADM-004 | Servicios: listar/filtros, abrir detalle, activar/desactivar y destacar fixture. | Cambio refleja visibilidad/nivel correctos sólo en el país. |
| E2E-ADM-005 | Reseñas: filtrar `PENDING`, activar, eliminar/moderar y volver a ficha pública. | Estado y promedio/visibilidad coherentes; sin modificar reseña ajena. |
| E2E-ADM-006 | Pagos/suscripciones: listar, filtros, detalle y estadísticas. | Sólo registros nacionales; no hay acciones de gateway no autorizadas. |
| E2E-ADM-007 | Precios premium e interacciones: consultar filtros, paginación y métricas. | Lectura scoped; operaciones globales de precio no se habilitan. |

## Seguridad de scope

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-ADM-008 | Cambiar manualmente URL a `/{otro-country}/admin/*`. | `unauthorized` o denegación; ninguna petición mutante efectiva. |
| E2E-ADM-009 | Intentar `/config/*`, asignar roles, editar países o precios globales. | No acceso ni mutación. |
| E2E-ADM-010 | Usar IDs de categoría/usuario/servicio/reseña/pago de otro país mediante UI/URL. | Backend y UI preservan scope; registrar cualquier filtración como crítica. |
| E2E-ADM-011 | Sesión expirada/logout y acceso directo a dashboard. | Redirige a login; retorno respeta rol/país. |

## Evidencia

Captura antes/después de moderación y toggle, URL de cada sección, solicitudes sanitizadas y prueba cruzada negativa para cada tipo de entidad. Nunca eliminar fixtures compartidos sin autorización de limpieza.
