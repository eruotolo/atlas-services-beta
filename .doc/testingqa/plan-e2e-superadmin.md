---
title: Plan E2E SuperAdmin global y por país
tags: [hireeo, testing, e2e, superadmin]
---

# Plan E2E — SuperAdmin

Referencia: [[README]]. **Precondición:** una cuenta SuperAdmin global y fixtures reversibles de los cinco países. Este rol prueba configuración global una vez y dashboard administrativo en los **5 países**.

## Configuración global

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-SUP-001 | Login y `/config`; comprobar módulos y navegación. | Acceso global, sesión estable y ningún redirect incorrecto a profile/admin. |
| E2E-SUP-002 | Países: listar, buscar, crear/editar fixture, activar/desactivar y revisar labels, moneda, gateway y paymentsEnabled. | Configuración persiste y afecta sólo los flujos previstos; no desactivar país real sin autorización. |
| E2E-SUP-003 | Categorías globales/por país: crear, editar, traducción `nameEn` cuando aplique, asignación y eliminar fixture. | Datos correctos en el selector y búsqueda del país objetivo. |
| E2E-SUP-004 | Usuarios: buscar, editar, asignar/quitar Client/Professional/Admin/SuperAdmin con scope, reloguear cuentas de prueba. | Roles y redirección/scope resultantes son exactos; no dejar privilegios residuales. |
| E2E-SUP-005 | Servicios y reseñas: filtros globales, moderación, activar/desactivar/destacar y ver resultado público. | Mutación trazable al país/entidad correctos. |
| E2E-SUP-006 | Precios Premium: CRUD de fixture para duración y país, validar moneda/gateway desde wizard, revertir fixture. | Precio de servidor se muestra sólo donde corresponde; no acepta monto del navegador. |
| E2E-SUP-007 | Pagos, interacciones e integraciones: vistas, filtros, métricas y formularios/validaciones sin revelar secretos. | Datos y permisos globales correctos; credenciales se enmascaran. |

## Dashboards nacionales y controles

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-SUP-008 | Abrir `/{country}/admin/*` para cada país y repetir smoke de categorías, usuarios, servicios, reseñas, pagos e interacciones. | Bypass de rol permite acceso, pero cada vista muestra sólo el país URL/contexto. |
| E2E-SUP-009 | Cambiar entre `/config` y países, refrescar y abrir deep links. | Contexto global/nacional no contamina navegación ni datos. |
| E2E-SUP-010 | Intentar acciones destructive sobre fixtures compartidos y cancelar; confirmar únicamente fixtures aislados y restaurar estado. | Diálogos previenen borrado accidental; auditoría/evidencia completa. |

## Reglas de seguridad

- Nunca usar SuperAdmin para ocultar un fallo de autorización Admin: ejecutar [[plan-e2e-admin]] con cuentas scoped independientes.
- Las pruebas de activación de país, roles, precios e integraciones requieren ventana de mantenimiento o entorno aislado; si no existe, marcar `BLOCKED`.
- Verificar explícitamente que páginas públicas, moneda y gateway responden a cualquier cambio controlado y se restauran al finalizar.
