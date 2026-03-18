---
name: prisma-v7-config
description: Configuración de Prisma v7 en el backend — cambios breaking vs v6
type: project
---

El proyecto usa Prisma v7.5.0. Cambios breaking respecto a v6:

1. La propiedad `url` fue eliminada del bloque `datasource` en `schema.prisma`. El schema ahora solo tiene `provider = "postgresql"` sin `url`.
2. La configuración de conexión vive en `prisma.config.ts` en la raíz del backend.
3. El tipo `Decimal` se importa como `Prisma.Decimal` (desde el namespace `Prisma` de `@prisma/client`). Los paths `@prisma/client/runtime/library` ya no existen en v7.

**Why:** Prisma v7 separó la configuración de conexión del schema para soportar mejor los adapters de DB y Accelerate.

**How to apply:** Al crear interfaces que usan campos monetarios/decimales del schema, usar `Prisma.Decimal` como tipo. Al hacer `db:generate`, Prisma carga automáticamente `prisma.config.ts`.
