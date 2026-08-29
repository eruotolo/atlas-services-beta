---
title: Informe T1.3 — Fechas rotas (INC-012 / P3)
date: 2026-08-29
tags:
  - hireeo
  - testing
  - incidencias
  - fechas
aliases:
  - T1.3 fechas interceptor
---

# Informe T1.3 — endpoints con fechas rotas (insumo F5 / INC-008)

Causa: `SerializeInterceptor` global (`backend/src/main.ts`) corre `stripSensitiveFields` sobre **toda** respuesta HTTP. Un `Date` de Prisma caía en `Object.entries` → `{}`. El guard `instanceof Date` → `toISOString()` cubre el borde de salida; no hace falta convertir en cada servicio.

`chat.service.ts` no se tocó: `date` (`lastMessage.createdAt`) y `lastMessageAt` siguen siendo `Date` crudos y ahora salen ISO en el interceptor.

## Confirmados en E2E (síntoma visible)

| Superficie UI | Endpoint HTTP | Campos Date | INC |
|---|---|---|---|
| `/{country}/profile/messages` (lista) | `GET /api/v1/chat/conversations` | `lastMessage.date`, `lastMessageAt` | INC-012 (500) |
| `/{country}/profile/messages/[id]` | `GET /api/v1/chat/conversations/:id/messages` | `data[].createdAt` | INC-007.2 |
| Alta de conversación | `POST /api/v1/chat/conversations` | `lastMessageAt` | mismo interceptor |
| Envío REST de mensaje | `ChatService.createMessage` (HTTP/gateway según ruta) | `createdAt` | mismo interceptor en HTTP |
| `/{country}/profile/leads` | `GET /api/v1/service-requests/available` | `createdAt` (y nested de `include`) | INC-008 |
| `/{country}/profile/quotes` | `GET /api/v1/service-requests` | `createdAt` + `quotes[].createdAt` | INC-008 |

Tras el guard, esos campos deben ser string ISO 8601, nunca `{}`. T5.5 (INC-008) es **verificación de UI**, no un segundo fix de serialización, salvo que `formatDate` siga lanzando `RangeError` con input no-fecha.

## Cubiertos por el mismo fix (Date crudo de Prisma, sin `.toISOString()` previo)

| Módulo | Endpoint | Archivo de servicio | Campos típicos |
|---|---|---|---|
| quotes | `POST /quotes`, `GET /quotes/my-quotes`, `GET /quotes/request/:serviceRequestId`, `PATCH /quotes/:id/accept` | `quotes.service.ts` | `createdAt`, `updatedAt` |
| service-requests | `POST /service-requests`, `GET /service-requests`, `GET /service-requests/:id` | `service-requests.service.ts` | `createdAt`, `updatedAt` |
| users | `GET /users`, `GET /users/me`, `GET /users/:id`, `PATCH /users/:id` | `users.service.ts` | `createdAt`, `updatedAt` |
| favorites | `GET /users/me/favorites`, `POST /users/me/favorites/:serviceId` | `favorites.service.ts` | `savedAt` / `createdAt` |
| ratings | `GET /ratings`, `GET /services/:serviceId/ratings`, `POST /services/:serviceId/ratings`, `PATCH /ratings/:id` | `ratings.service.ts` | `createdAt`, `updatedAt`, `respondedAt` |
| services (listado / admin / propio) | `GET /services`, `GET /users/:id/services`, create/update | `services.service.ts` | `startDate`, `endDate`, `updatedAt`, `createdAt` |
| crm | `GET /crm/dashboard` | `crm.service.ts` | fechas de leads/quotes incluidas |
| subscriptions | `GET /subscriptions`, `GET /subscriptions/:id` | `subscriptions.service.ts` | `createdAt` y fechas de periodo |
| auth | respuestas de usuario (p. ej. registro) | `auth.service.ts` | `createdAt` |
| moderation / DSR / fiscal | controladores homónimos | `*.service.ts` | `createdAt` / `updatedAt` |

## Ya convertían a ISO en el servicio (no dependían del bug, el guard es idempotente sobre string)

- Ficha pública de servicio (`services.service.ts`): `reviews[].date` y `reviews[].respondedAt` ya usan `.toISOString()`. El resto del mismo payload (`startDate`, `endDate`, `updatedAt`, `subscription.endDate`) **sí** era Date crudo y queda cubierto por el interceptor.

## Fuera de este borde (no HTTP / no payload JSON)

- `Buffer`: webhooks Stripe/MP/KYC (`rawBody`) y crypto interno. No se serializa en respuestas JSON.
- `Map` / `Set`: lookups internos (upload mime, países de pasarela, users/integrations). No salen en el interceptor.
- `BigInt`: **cero usos** en `backend/`.
- Gateway Socket.IO: `JSON.stringify(Date)` ya produce ISO; el `{}` era exclusivo del interceptor HTTP.

## Pendiente de F5

Re-probar en UI: mensajes con conversación real, leads (`/profile/leads`) y cotizaciones (`/profile/quotes`). Si alguna pantalla sigue en NaN, el fallo es `formatDate` (frontend), no el backend.
