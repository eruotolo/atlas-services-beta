---
title: Plan E2E Client por país
tags: [hireeo, testing, e2e, client]
---

# Plan E2E — Client

Referencia: [[README]]. **Precondición:** una cuenta Client y servicios Professional publicados por país. Ejecutar todos los casos en los **5 países**.

## Dashboard y perfil

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-CLI-001 | Login y carga de `/{country}/profile`; probar navegación lateral y refresco de sesión. | Solo muestra datos propios y mantiene país. |
| E2E-CLI-002 | Editar perfil con datos válidos, inválidos y cancelación; cambiar contraseña y volver a iniciar sesión. | Validación antes de guardar; persistencia propia; contraseña anterior revocada. |
| E2E-CLI-003 | Direcciones: crear, editar, seleccionar/eliminar; región → localidad dependiente. | Geo del país, sin direcciones duplicadas ni de otro usuario. |
| E2E-CLI-004 | Abrir favoritos, estado vacío, añadir/quitar desde ficha y persistir tras recarga. | Solo favoritos propios; ficha y listado se sincronizan. |
| E2E-CLI-005 | Abrir mensajes, conversación y estado vacío. | Conversaciones propias; deep link a conversación ajena se niega. |

## Contratación y relación con Professional

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-CLI-006 | Buscar, abrir ficha y guardar/quitar favorito. | Mutación correcta, UI coherente y país aislado. |
| E2E-CLI-007 | Iniciar chat desde ficha, enviar/recibir mensaje con Professional fixture, recargar y abrir conversación. | Socket autenticado; mensajes ordenados/persistentes y no visibles para tercero. |
| E2E-CLI-008 | Crear reseña: campos inválidos, envío válido, verificar `PENDING`; impedir duplicado/servicio propio cuando aplique. | Reseña queda pendiente y no pública hasta moderación. |
| E2E-CLI-009 | Completar wizard de solicitud: categoría, descripción, presupuesto/ubicación/campos disponibles, validaciones, retroceso, cancelar y enviar. | Una `ServiceRequest` propia con datos/país correctos; sin duplicado por doble clic. |
| E2E-CLI-010 | Abrir cotizaciones, ver respuesta Professional, aceptar una y comprobar rechazo de alternativas. | Solo dueño puede aceptar; solicitud pasa al estado esperado. |
| E2E-CLI-011 | Si aparece checkout de escrow tras cotización aceptada, recorrer sandbox, cancelación y retorno. | Gateway según país, montos no manipulables y estado consistente tras webhook/sandbox. |

## Cambio de rol y autorización

| ID | Recorrido E2E | Resultado esperado |
|---|---|---|
| E2E-CLI-012 | Abrir modal “convertirse en Professional”; cancelar, validar, confirmar y reloguear. | Cambio explícito al mismo país, navegación Professional y sin roles duplicados. |
| E2E-CLI-013 | Intentar `/publish`, leads, servicios propios, admin y config como Client. | Solo la transición autorizada habilita Professional; admin/config nunca accesibles. |
| E2E-CLI-014 | Probar URLs de profile con otro prefijo de país. | Layout/proxy fuerza el país de la sesión o deniega; no mezcla datos. |

## Evidencia de cierre

Por país: captura de perfil, dirección, favorito, solicitud/cotización y conversación; evidencias sanitizadas de cada mutación y prueba negativa de acceso cruzado.
