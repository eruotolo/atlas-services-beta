---
name: backend-modules-state
description: Estado actual de módulos del backend NestJS — nombres, rutas HTTP y estructura tras refactoring
type: project
---

Todos los módulos del backend fueron renombrados de español a inglés. Build limpio confirmado.

**Módulos activos en `src/modules/`**:
- `users` → `@Controller('users')`, exporta `UsersRepository`
- `services` → `@Controller('services')`, exporta `ServicesRepository`
- `ratings` → `@Controller()` con rutas `services/:serviceId/ratings` y `ratings/:id`
- `categories` → `@Controller('categories')`, exporta `CategoriesRepository`
- `subscriptions` → `@Controller('subscriptions')`, endpoint webhook en `PATCH :id/webhook`
- `prices` → `@Controller('prices')`, exporta `PricesRepository`
- `interactions` → `@Controller()` con rutas `interactions` y `services/:serviceId/stats`
- `sponsors` → `@Controller('sponsors')` (sin cambio de nombre, solo se añadió `select` explícito)
- `auth` → sin cambios

**Dependencias cruzadas**:
- `RatingsModule` → importa `ServicesRepository` como provider
- `SubscriptionsModule` → importa `ServicesRepository` y `PricesRepository` como providers
- `InteractionsModule` → importa `ServicesRepository` como provider

**Prisma**: migrado a v7.5.0. La URL de conexión se configura en `prisma.config.ts` (no en schema.prisma). El datasource en schema.prisma ya no tiene campo `url`.

**Why:** Refactoring de nomenclatura español→inglés para consistencia internacional del código.

**How to apply:** Al añadir nuevos módulos, usar nombres en inglés desde el inicio. Al importar repositories cruzados, copiarlos como providers en el módulo importador (no usar imports de módulo).
