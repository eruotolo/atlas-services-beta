---
title: Plan E2E Professional por país
tags: [hireeo, testing, e2e, professional]
---

# Plan E2E — Professional

Referencia: [[README]] y [[plan-e2e-publicacion-multipais]]. **Precondición:** Professional por país, Client solicitante y datos de categoría/geo/precio activos. Ejecutar en los **5 países**.

## Publicación y servicios propios

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-PRO-001 | Abrir `/{country}/publish` autenticado; validar que omite Datos y completa Oficio. | Solo el dueño crea el servicio en su país. |
| E2E-PRO-002 | Wizard Básico completo: categorías, título, IA opcional revisada, descripción, imágenes principal/galería, precio, geo, contacto, redes y términos. | Validaciones, previews, persistencia y ficha/listado público correctos. |
| E2E-PRO-003 | Wizard Premium: elegir 1/3/6/9/12 meses disponibles, volver, cancelar y completar sandbox. | CL/AR/UY MercadoPago; ES/US Stripe; importe viene del servidor y webhook habilita Premium/featured. |
| E2E-PRO-004 | Mis servicios: filtrar, abrir, editar todos los campos incluidos región/localidad e imágenes, guardar/cancelar. | Solo modifica el servicio propio, sin perder datos ni país. |
| E2E-PRO-005 | Activar/desactivar y eliminar servicio propio; comprobar búsqueda/detalle y confirmación. | Estado público cambia; eliminación exige confirmación y no afecta servicios ajenos. |
| E2E-PRO-006 | Reintentar publicación con datos inválidos, upload fallido, categoría/geo ausente, doble submit y pago no habilitado. | Error comprensible, sin servicio/suscripción incompleta o duplicada. |

## Dashboard Professional

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-PRO-007 | Perfil y ajustes: actualizar datos, contraseña y navegación dashboard. | Persistencia propia y sesión válida tras cambios. |
| E2E-PRO-008 | Leads/CRM: estado vacío, carga de solicitudes elegibles, mover/accionar estados disponibles. | Solo solicitudes de categorías/país elegibles; no se cruzan clientes. |
| E2E-PRO-009 | Cotizaciones: abrir solicitud, validaciones de precio/mensaje, crear una, impedir segunda y verificar Client. | Cotización única propia, moneda correcta y visibilidad bilateral. |
| E2E-PRO-010 | Mensajes: iniciar/retomar conversación con Client y verificar tiempo real, orden, recarga y autorización. | Socket y persistencia correctos; URL ajena denegada. |
| E2E-PRO-011 | Reseñas/estadísticas de cada servicio: leer, responder reseña propia y verificar métricas. | No puede responder/modificar reseñas de terceros; datos se actualizan. |
| E2E-PRO-012 | KYC: estado inicial, iniciar sandbox Stripe Identity, cancelar/reintentar, webhook de prueba y estado final. | Estado sólo propio; ausencia de credenciales se reporta `BLOCKED`, no se suplanta. |

## Aislamiento y handoff

1. Probar acciones sobre IDs/URLs de otro Professional: edición, toggle, eliminación, estadísticas, quote y respuesta de reseña deben denegarse.
2. Ejecutar el ciclo completo Client → solicitud → Professional quote → Client aceptación → pago sandbox si corresponde, una vez por país.
3. Tras cada publicación, comprobar de forma negativa que no se lista en los otros cuatro países.
