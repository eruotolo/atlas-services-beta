# Plan: Desacople Backend con NestJS

## Objetivo

Separar la lógica de negocio y acceso a datos del frontend Next.js hacia un backend dedicado con NestJS + Prisma ORM, alojado en `/backend`. El frontend en `/frontend` consumirá el backend via API REST.

## Estructura de Carpetas

```
next-atlas-services/
├── frontend/        # Next.js (existente)
├── backend/         # NestJS (nuevo)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── usuarios/
│   │   │   ├── servicios/
│   │   │   ├── categorias/
│   │   │   ├── calificaciones/
│   │   │   ├── suscripciones/
│   │   │   ├── sponsors/
│   │   │   ├── interacciones/
│   │   │   └── precios/
│   │   ├── prisma/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   └── filters/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/      # Mismo schema que frontend/prisma/
│   └── ...
└── docker-database/
```

---

## Fases de Implementación

### Fase 1: Inicialización del proyecto NestJS

- [ ] Crear proyecto NestJS en `/backend` con `nest new`
- [ ] Configurar TypeScript strict mode
- [ ] Instalar y configurar Prisma ORM
- [ ] Copiar/vincular el schema de `/frontend/prisma/schema.prisma` a `/backend/prisma/schema.prisma`
- [ ] Configurar variables de entorno (`DATABASE_URL`, `DIRECT_DATABASE_URL`, `JWT_SECRET`, `PORT`)
- [ ] Instalar dependencias base: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`, `class-validator`, `class-transformer`

### Fase 2: Módulo Prisma

- [ ] Crear `PrismaModule` y `PrismaService` (singleton global)
- [ ] Configurar `onModuleInit` y `onModuleDestroy` para gestión de conexión
- [ ] Exportar `PrismaModule` como global

### Fase 3: Autenticación y Seguridad

- [ ] Crear módulo `auth` con:
  - Registro de usuario (`POST /auth/register`)
  - Login con email/password (`POST /auth/login`) → retorna JWT
  - Refresh token (`POST /auth/refresh`)
  - Estrategia `JwtStrategy` (passport-jwt)
  - Estrategia `LocalStrategy` (passport-local)
- [ ] Crear `JwtAuthGuard` para proteger rutas
- [ ] Crear `RolesGuard` basado en el modelo `Role` / `UserRole` del schema
- [ ] Crear decorador `@Roles()` y `@CurrentUser()`
- [ ] Hash de contraseñas con `bcrypt`
- [ ] Validar tokens en cada request protegido

### Fase 4: Módulos de Recursos (CRUD)

Cada módulo sigue la estructura: `module`, `controller`, `service`, `dto` (create/update/response).

#### 4.1 Módulo `usuarios`
- [ ] `GET /usuarios/:id` — perfil público
- [ ] `PATCH /usuarios/:id` — actualizar perfil propio (protegido)
- [ ] `DELETE /usuarios/:id` — eliminar cuenta (protegido)

#### 4.2 Módulo `categorias`
- [ ] `GET /categorias` — listar categorías activas
- [ ] `POST /categorias` — crear (solo admin)
- [ ] `PATCH /categorias/:id` — editar (solo admin)
- [ ] `DELETE /categorias/:id` — eliminar (solo admin)

#### 4.3 Módulo `servicios`
- [ ] `GET /servicios` — listar con filtros: `comuna`, `categoriaSlug`, `nivel`, `destacado`, paginación
- [ ] `GET /servicios/:slug` — detalle por slug
- [ ] `POST /servicios` — crear (protegido)
- [ ] `PATCH /servicios/:id` — editar propio (protegido)
- [ ] `DELETE /servicios/:id` — eliminar propio (protegido)
- [ ] Lógica de `fechaFin` (máximo 12 meses desde `fechaInicio`)
- [ ] Lógica de `calificacionPromedio` y `totalCalificaciones` (actualización automática)

#### 4.4 Módulo `calificaciones`
- [ ] `GET /servicios/:id/calificaciones` — listar calificaciones de un servicio
- [ ] `POST /servicios/:id/calificaciones` — crear (protegido, 1 por usuario por servicio)
- [ ] `DELETE /calificaciones/:id` — eliminar propia o como admin (protegido)
- [ ] Hook post-creación: recalcular `calificacionPromedio` en `Servicio`

#### 4.5 Módulo `suscripciones`
- [ ] `GET /suscripciones/:id` — detalle (protegido, dueño o admin)
- [ ] `POST /suscripciones` — iniciar suscripción premium (protegido)
- [ ] `PATCH /suscripciones/:id` — actualizar estado de pago (webhook de pasarela)
- [ ] Integración con pasarela de pago (Mercado Pago / WebPay) — placeholder para webhook

#### 4.6 Módulo `sponsors`
- [ ] `GET /sponsors` — listar sponsors activos (público)
- [ ] `POST /sponsors` — crear (solo admin)
- [ ] `PATCH /sponsors/:id` — editar (solo admin)
- [ ] `DELETE /sponsors/:id` — eliminar (solo admin)

#### 4.7 Módulo `precios`
- [ ] `GET /precios` — listar precios premium activos (público)
- [ ] `POST /precios` — crear/actualizar precio (solo superadmin)
- [ ] `PATCH /precios/:id` — editar (solo superadmin)

#### 4.8 Módulo `interacciones`
- [ ] `POST /interacciones` — registrar interacción (`VER_TELEFONO`, `VER_EMAIL`, `LLAMAR`, `WHATSAPP`)
- [ ] `GET /servicios/:id/estadisticas` — métricas agrupadas por tipo (solo dueño del servicio o admin)

### Fase 5: Validación y Serialización

- [ ] Configurar `ValidationPipe` global con `class-validator`
- [ ] Configurar `ClassSerializerInterceptor` global para excluir campos sensibles (`password`)
- [ ] Usar `@Exclude()` en DTO de respuesta para `Usuario`
- [ ] DTOs con `@IsString()`, `@IsEmail()`, `@IsEnum()`, `@IsOptional()`, etc.

### Fase 6: Seguridad

- [ ] Configurar `helmet` (headers HTTP seguros)
- [ ] Configurar `cors` para permitir solo el origen del frontend
- [ ] Rate limiting con `@nestjs/throttler`: límites en endpoints de auth y registro
- [ ] Variables de entorno validadas con `@nestjs/config` + Joi o Zod
- [ ] No exponer stack traces en producción (`app.useGlobalFilters`)

### Fase 7: Documentación API

- [ ] Configurar Swagger con `@nestjs/swagger`
- [ ] Decorar controllers y DTOs con `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- [ ] Disponible en `GET /api/docs` (solo en desarrollo)

### Fase 8: Adaptar el Frontend

- [ ] Eliminar Server Actions que acceden directamente a Prisma
- [ ] Crear capa de servicios en `/frontend/src/lib/api/` que consuma el backend via `fetch`
- [ ] Gestionar JWT en el frontend: almacenar en cookie httpOnly o via Auth.js
- [ ] Actualizar variables de entorno del frontend: `NEXT_PUBLIC_API_URL=http://localhost:4000`

---

## Stack del Backend

| Herramienta | Versión | Uso |
|---|---|---|
| NestJS | ^10 | Framework principal |
| Prisma ORM | ^6.10.0 | Acceso a base de datos (mismo schema) |
| PostgreSQL | — | Base de datos (mismo docker-database) |
| Passport.js | — | Autenticación |
| JWT | — | Tokens de acceso |
| bcrypt | — | Hash de contraseñas |
| class-validator | — | Validación de DTOs |
| Helmet | — | Seguridad de headers |
| Swagger | — | Documentación API |

## Puertos

- Frontend Next.js: `3000`
- Backend NestJS: `4000`
- PostgreSQL: `5432` (docker-database existente)

---

## Notas Importantes

- El schema de Prisma es **compartido**: `/backend/prisma/schema.prisma` debe ser idéntico al de `/frontend/prisma/schema.prisma`. Las migraciones se ejecutan desde el backend.
- El frontend dejará de usar Prisma directamente; solo consumirá la API REST del backend.
- Auth.js en el frontend se puede mantener para gestionar la sesión del usuario (guardando el JWT emitido por NestJS).