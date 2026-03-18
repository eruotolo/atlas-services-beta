---
name: webhook-guard
description: WebhookGuard implementado en common/guards — protege endpoint de pago
type: project
---

`WebhookGuard` implementado en `src/common/guards/webhook.guard.ts`. Valida el header `x-webhook-secret` contra la variable de entorno `WEBHOOK_SECRET`.

Aplicado en `SubscriptionsController.updatePaymentStatus` (`PATCH subscriptions/:id/webhook`).

`WEBHOOK_SECRET` definido en `.env.local`.

**Why:** El endpoint de webhook de pasarela de pago era público — cualquiera podía invocar el cambio de estado de pago sin autenticación.

**How to apply:** Usar `@UseGuards(WebhookGuard)` en cualquier endpoint que reciba callbacks externos de terceros (pasarelas, proveedores de SMS, etc.).
