# Chiloé Servicios

**Plataforma hiperlocal de servicios para la Isla de Chiloé, Chile**

Aplicación web que conecta usuarios con proveedores de servicios manuales (electricistas, carpinteros, gásfiter, fletes, mudanzas) en una comunidad de ~35,000 habitantes.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura DDD](#-arquitectura-ddd-domain-driven-design)
- [Procedimiento de Cambios en Base de Datos](#-procedimiento-de-cambios-en-base-de-datos)
- [Comandos Útiles](#-comandos-útiles)

---

## 🎯 Descripción del Proyecto

### Características Principales

- **Búsqueda de servicios**: Usuarios encuentran proveedores locales por categoría, comuna y precio
- **Publicación de servicios**: Proveedores ofertan sus servicios (básico/premium)
- **Calificaciones y reseñas**: Sistema de estrellas (1-5) y comentarios
- **Monetización**: Suscripciones premium y espacios publicitarios
- **Sistema de contacto**: Teléfono y redes sociales del proveedor

### Stack Tecnológico

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Server Actions, Prisma ORM, PostgreSQL
- **Autenticación**: Auth.js (NextAuth) con Email/Password y Google OAuth
- **Validación**: Zod para schemas de datos
- **Linting**: Biome + Prettier
- **Despliegue**: Vercel

---

## 🏗 Arquitectura DDD (Domain-Driven Design)

Este proyecto utiliza **Domain-Driven Design** para organizar el código de manera modular, escalable y mantenible.

### ¿Qué es DDD?

Domain-Driven Design es un enfoque de desarrollo que organiza el código alrededor de los **dominios del negocio** en lugar de capas técnicas. Cada dominio encapsula su propia lógica, componentes y reglas de negocio.

### Estructura de Carpetas DDD

```
src/
├── app/                          # Next.js App Router (Presentation Layer)
│   ├── (admin)/                 # Grupo de rutas administrativas
│   ├── (public)/                # Grupo de rutas públicas
│   └── (auth)/                  # Grupo de rutas de autenticación
│
├── features/                     # DOMINIOS DEL NEGOCIO
│   ├── services/                # 📦 Dominio: Servicios
│   │   ├── actions/             # Server Actions (queries + mutations)
│   │   │   ├── index.ts         # Exportaciones públicas
│   │   │   ├── queries.ts       # Lectura de datos (getServicios, etc)
│   │   │   └── mutations.ts     # Escritura de datos (crear, actualizar, eliminar)
│   │   ├── components/          # Componentes React del dominio
│   │   │   ├── admin/           # Componentes exclusivos del panel admin
│   │   │   │   ├── AdminServicioForm.tsx
│   │   │   │   └── ServiciosTable.tsx
│   │   │   ├── cards/           # Cards de visualización
│   │   │   │   └── ServiceCard.tsx
│   │   │   └── forms/           # Formularios compartidos
│   │   │       ├── base/        # Componente base (privado)
│   │   │       │   └── ServicioFormBase.tsx
│   │   │       └── shared/      # Sub-componentes reutilizables
│   │   │           └── SocialNetworksInput.tsx
│   │   ├── hooks/               # Custom hooks del dominio
│   │   │   ├── useImageUpload.ts
│   │   │   └── useSocialNetworks.ts
│   │   ├── lib/                 # Utilidades y constantes
│   │   │   ├── constants.ts     # COMUNAS_CHILOE, TIPOS_RED_SOCIAL
│   │   │   └── helpers.ts
│   │   ├── schemas/             # Validación con Zod
│   │   │   └── servicioSchemas.ts
│   │   ├── types/               # Tipos TypeScript
│   │   │   ├── servicioTypes.ts
│   │   │   └── shared.ts
│   │   └── publish/             # Sub-dominio: Publicación pública
│   │       ├── actions/
│   │       └── components/
│   │
│   ├── users/                   # 📦 Dominio: Usuarios
│   │   ├── actions/
│   │   │   ├── queries.ts       # Obtener usuarios, perfil
│   │   │   └── mutations.ts     # Crear, actualizar perfil
│   │   ├── components/
│   │   │   ├── admin/           # Gestión de usuarios (admin)
│   │   │   └── profile/         # Componentes de perfil
│   │   │       ├── UserServicioForm.tsx
│   │   │       └── MisServicios.tsx
│   │   ├── schemas/
│   │   │   └── userSchemas.ts
│   │   └── types/
│   │
│   ├── categories/              # 📦 Dominio: Categorías
│   │   ├── actions/
│   │   ├── components/
│   │   └── schemas/
│   │
│   ├── reviews/                 # 📦 Dominio: Calificaciones
│   │   ├── actions/
│   │   ├── components/
│   │   └── schemas/
│   │
│   └── payments/                # 📦 Dominio: Pagos y Suscripciones
│       ├── actions/
│       ├── components/
│       └── schemas/
│
├── shared/                       # Shared Kernel (código compartido entre dominios)
│   ├── components/              # Componentes globales (Navbar, Footer, Modal)
│   ├── lib/                     # Utilidades globales
│   └── types/                   # Tipos compartidos
│
└── prisma/                       # Capa de Persistencia
    ├── schema.prisma            # Esquema de base de datos
    ├── migrations/              # Migraciones versionadas
    └── seed.ts                  # Datos iniciales
```

### Principios DDD Aplicados

#### 1. **Separación por Dominios**

Cada carpeta en `features/` representa un dominio del negocio:

- **`services/`**: Todo lo relacionado con servicios ofertados
- **`users/`**: Gestión de usuarios y proveedores
- **`categories/`**: Categorías de servicios
- **`reviews/`**: Calificaciones y reseñas
- **`payments/`**: Pagos y suscripciones

#### 2. **Encapsulación de Lógica**

Cada dominio contiene todo lo necesario para funcionar:

```typescript
features/services/
├── actions/          // ✅ Lógica de negocio (queries + mutations)
├── components/       // ✅ UI específica del dominio
├── hooks/            // ✅ Lógica reutilizable del dominio
├── schemas/          // ✅ Validaciones del dominio
└── types/            // ✅ Tipos TypeScript del dominio
```

**Ejemplo: Crear un servicio**

```typescript
// features/services/actions/mutations.ts
export async function crearServicio(data: ServicioInput) {
    // 1. Validación con schema del dominio
    const validated = servicioCreateSchema.parse(data);

    // 2. Lógica de negocio del dominio
    const slug = generateSlug(validated.titulo);

    // 3. Persistencia
    const servicio = await prisma.servicio.create({ data: validated });

    return { success: true, servicio };
}
```

#### 3. **Shared Kernel (Código Compartido)**

El directorio `shared/` contiene componentes y utilidades usadas por **múltiples dominios**:

- `Modal`, `Navbar`, `Footer` → Componentes de layout
- Utilidades de fecha, formato, etc.
- Tipos globales (Result, PaginatedResponse)

**Regla**: Solo va a `shared/` si **2 o más dominios** lo necesitan.

#### 4. **Inyección de Dependencias**

Los componentes de dominio no dependen de implementaciones específicas. Ejemplo:

```typescript
// ✅ CORRECTO: El componente base recibe la acción por props
<ServicioFormBase
  onSubmit={actualizarServicio}  // Inyectado desde el padre
/>

// ❌ INCORRECTO: El componente importa la acción directamente
import { actualizarServicio } from '@/features/services/actions'
```

**Beneficio**: Un formulario puede usarse en Admin (con permisos diferentes) y en Usuario sin duplicar código.

#### 5. **Composición sobre Condicionales**

En lugar de llenar componentes con `if (isAdmin)`, usamos composición:

```
ServicioFormBase (componente reutilizable)
       ↓
   ┌───────┴───────┐
   ↓               ↓
AdminServicioForm  UserServicioForm
(wrapper admin)    (wrapper usuario)
```

Cada wrapper:

- Inyecta su propia Server Action
- Inyecta elementos específicos (selector de usuario en admin)
- Configura estilos y variantes

**Resultado**: Cero condicionales en el componente base.

### Flujo de Datos en DDD

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                     (app/ directory)                      │
│                                                           │
│  Page Component (Server Component)                       │
│         ↓                                                │
│  Llama a Server Action del dominio                       │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                          │
│                 (features/ directory)                     │
│                                                           │
│  Server Action (mutations.ts)                            │
│    1. Valida con Zod schema                              │
│    2. Aplica lógica de negocio                           │
│    3. Llama a Prisma para persistencia                   │
│    4. Revalida cache (revalidatePath)                    │
└───────────────────────────┬──────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER                        │
│                   (prisma/ directory)                     │
│                                                           │
│  Prisma ORM → PostgreSQL                                 │
└──────────────────────────────────────────────────────────┘
```

### Ventajas de Esta Arquitectura

✅ **Escalabilidad**: Agregar nuevos dominios no afecta los existentes
✅ **Mantenibilidad**: Cambios en un dominio no rompen otros
✅ **Testabilidad**: Cada dominio se puede testear independientemente
✅ **Reutilización**: Shared Kernel evita duplicación
✅ **Claridad**: La estructura refleja el negocio, no capas técnicas
✅ **Colaboración**: Equipos pueden trabajar en dominios diferentes sin conflictos

### Ejemplo Real: Formulario de Servicios

**Problema**: Teníamos 3 formularios casi idénticos (Admin, Usuario, Wizard público) con ~950 líneas duplicadas.

**Solución DDD**:

```
features/services/components/forms/
├── base/
│   └── ServicioFormBase.tsx          ← Lógica y UI compartida (privado)
├── shared/
│   └── SocialNetworksInput.tsx       ← Sub-componente reutilizable
└── (wrappers en cada contexto)

features/services/components/admin/
└── AdminServicioForm.tsx              ← Wrapper que inyecta lógica de admin

features/users/components/profile/
└── UserServicioForm.tsx               ← Wrapper que inyecta lógica de usuario
```

**Resultado**: Un cambio en el formulario base se propaga automáticamente a:

- Admin → Crear Servicio
- Admin → Editar Servicio
- Usuario → Crear Servicio
- Usuario → Editar Servicio

---

## 🗄️ Procedimiento de Cambios en Base de Datos

Este procedimiento garantiza que los cambios en la estructura de la base de datos se apliquen **sin pérdida de datos** y con un historial versionado.

### ⚠️ REGLA DE ORO

```
🏠 LOCAL  → db:migrate        (crea migraciones)
🚀 PROD   → db:migrate:deploy (aplica migraciones)

❌ NUNCA uses db:push en producción con datos reales
```

---

### Flujo Completo: De Desarrollo a Producción

#### **FASE 1: Desarrollo Local (Crear Cambios)**

**1. Modifica el Schema de Prisma**

Edita `prisma/schema.prisma` con tus cambios.

**Ejemplo**: Agregar campo `verificado` a la tabla `Usuario`

```prisma
model Usuario {
    id         String  @id @default(cuid())
    email      String  @unique
    nombre     String
    verificado Boolean @default(false) // ✨ NUEVO CAMPO
    // ... resto de campos
}
```

**2. Verifica tu Conexión Local**

Asegúrate de que `.env.local` apunta a tu base de datos **LOCAL**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chiloe_dev"
```

**3. Crea y Aplica la Migración Localmente**

```bash
pnpm db:migrate
```

Te pedirá un nombre descriptivo para la migración:

```
✔ Enter a name for the new migration: › agregar_campo_verificado
```

**¿Qué hace este comando?**

- ✅ Crea un archivo SQL en `prisma/migrations/TIMESTAMP_agregar_campo_verificado/migration.sql`
- ✅ Aplica los cambios a tu base de datos local
- ✅ Regenera el cliente de Prisma (`@prisma/client`) automáticamente

**4. Verifica la Migración Generada**

Revisa el archivo SQL generado:

```sql
-- prisma/migrations/20260116123456_agregar_campo_verificado/migration.sql
ALTER TABLE "Usuario" ADD COLUMN "verificado" BOOLEAN NOT NULL DEFAULT false;
```

**5. Prueba tu Aplicación Localmente**

```bash
pnpm dev
```

Verifica que todo funcione correctamente con el nuevo campo:

- ✅ Crea un nuevo usuario → debe tener `verificado: false`
- ✅ Lee usuarios existentes → deben tener `verificado: false` (valor por defecto)
- ✅ No hay errores de TypeScript (el cliente Prisma ya tiene el nuevo tipo)

---

#### **FASE 2: Subir Cambios (Git)**

**6. Añade los Archivos de Migración al Control de Versiones**

```bash
# Añadir schema y migraciones
git add prisma/schema.prisma
git add prisma/migrations

# Commit con mensaje descriptivo
git commit -m "feat(db): agregar campo verificado a Usuario"

# Push a tu rama
git push origin features/agregar-verificacion
```

**⚠️ IMPORTANTE**: Los archivos de migración **DEBEN** estar en Git para que producción pueda aplicarlos.

---

#### **FASE 3: Aplicar en Producción (Deploy Seguro)**

**7. Asegúrate de Tener Backup**

```bash
# Si usas Postgres directamente, crea un backup antes de cualquier cambio
pg_dump -U usuario -h host -d chiloe_prod > backup_antes_migracion.sql

# O usa las herramientas de tu proveedor (Vercel Postgres, Neon, Supabase)
```

**8. Verifica las Variables de Entorno en Producción**

En tu plataforma de despliegue (Vercel, Railway, etc.), verifica que `DATABASE_URL` apunte a la base de datos **de producción**:

```env
DATABASE_URL="postgresql://user:pass@prod-server.com:5432/chiloe_prod"
```

**9. Aplica las Migraciones en Producción**

**Opción A: Si usas Vercel (recomendado para Next.js)**

Agrega un script `postinstall` en `package.json`:

```json
{
    "scripts": {
        "postinstall": "prisma generate && prisma migrate deploy"
    }
}
```

Cada vez que hagas deploy, Vercel ejecutará automáticamente:

1. `prisma generate` → Regenera el cliente
2. `prisma migrate deploy` → Aplica migraciones pendientes

**Opción B: Manualmente en tu servidor**

```bash
# 1. Asegúrate de estar en producción (verifica DATABASE_URL)
echo $DATABASE_URL

# 2. Aplica migraciones pendientes (SOLO las que no se han aplicado)
pnpm db:migrate:deploy

# 3. Regenera el cliente de Prisma
pnpm db:generate

# 4. Reinicia la aplicación (si es necesario)
pm2 restart chiloe-app  # O el método que uses
```

**¿Qué hace `db:migrate:deploy`?**

- ✅ Lee las migraciones en `prisma/migrations/`
- ✅ Verifica cuáles ya están aplicadas en la tabla `_prisma_migrations`
- ✅ Aplica **solo** las pendientes en orden cronológico
- ✅ **NO crea nuevas migraciones** (solo aplica las existentes)
- ✅ Es **seguro** para producción (no hace cambios destructivos sin migraciones)

**10. Verifica que Todo Funcione**

```bash
# Verifica que la migración se aplicó
psql $DATABASE_URL -c "\d Usuario"  # Debe mostrar el campo 'verificado'

# Prueba la aplicación en producción
curl https://tu-app.vercel.app/api/health
```

---

### 🚨 Casos Especiales

#### **Caso 1: Renombrar una Columna (SIN perder datos)**

**❌ INCORRECTO** (Prisma lo interpreta como eliminar + crear):

```prisma
model Usuario {
    // Antes: email
    // Después: correo  ← Prisma eliminaría 'email' y crearía 'correo'
    correo String @unique
}
```

**✅ CORRECTO** (Instrucción explícita):

1. Modifica el schema:

```prisma
model Usuario {
    correo String @unique @map("email") // Mapea 'correo' a la columna 'email' existente
}
```

2. Crea una migración vacía:

```bash
pnpm db:migrate
# Nombre: renombrar_email_a_correo
```

3. Edita el SQL generado manualmente:

```sql
-- prisma/migrations/.../migration.sql
ALTER TABLE "Usuario" RENAME COLUMN "email" TO "correo";
```

4. Aplica localmente:

```bash
pnpm db:migrate
```

#### **Caso 2: Eliminar una Columna con Datos**

**⚠️ CUIDADO**: Eliminar una columna borra todos sus datos.

**Proceso seguro**:

1. **Antes de eliminar**, guarda los datos:

```sql
-- Backup de la columna 'telefonoViejo'
CREATE TABLE backup_telefonos AS
SELECT id, telefonoViejo FROM "Usuario";
```

2. Elimina del schema y migra:

```prisma
model Usuario {
    // telefonoViejo String  ← Eliminado
}
```

```bash
pnpm db:migrate
# Nombre: eliminar_telefono_viejo
```

#### **Caso 3: Cambiar Tipo de Columna**

**Ejemplo**: Cambiar `precio` de `Int` a `Decimal`

```prisma
model Servicio {
    // Antes: precio Int
    // Después:
    precio Decimal @db.Decimal(10, 2)
}
```

Prisma intentará convertir automáticamente. Si falla:

```sql
-- Edita la migración generada
ALTER TABLE "Servicio"
ALTER COLUMN "precio" TYPE DECIMAL(10,2)
USING precio::decimal;
```

---

### 📋 Checklist de Seguridad para Producción

Antes de aplicar cambios en producción, verifica:

- [ ] ✅ Tengo un backup de la base de datos
- [ ] ✅ Probé la migración en local/staging
- [ ] ✅ La migración no elimina columnas con datos importantes
- [ ] ✅ Todos los campos nuevos tienen valores por defecto o son opcionales
- [ ] ✅ `DATABASE_URL` apunta a la base de datos correcta
- [ ] ✅ Las migraciones están en Git y en el servidor
- [ ] ✅ Usaré `db:migrate:deploy` (NO `db:push`)
- [ ] ✅ Tengo un plan de rollback si algo sale mal

---

### 🔄 Rollback (Deshacer Cambios)

Si una migración falla en producción:

**Opción 1: Revertir a la Migración Anterior**

```bash
# Ver migraciones aplicadas
pnpm db:migrate:status

# Marcar la última migración como no aplicada
psql $DATABASE_URL -c "DELETE FROM _prisma_migrations WHERE migration_name = '20260116_problema';"

# Revertir manualmente los cambios SQL
psql $DATABASE_URL -f rollback.sql
```

**Opción 2: Crear una Migración de Reversión**

```bash
# Revertir el schema localmente
# Luego crear una nueva migración
pnpm db:migrate
# Nombre: revertir_cambio_problema
```

---

### 📚 Resumen de Comandos

| Comando                  | Cuándo Usarlo                      | Dónde              |
| ------------------------ | ---------------------------------- | ------------------ |
| `pnpm db:migrate`        | Crear nueva migración              | **Local**          |
| `pnpm db:migrate:deploy` | Aplicar migraciones existentes     | **Producción**     |
| `pnpm db:push`           | Prototipado rápido (sin historial) | **Solo Local/Dev** |
| `pnpm db:generate`       | Regenerar cliente de Prisma        | **Local y Prod**   |
| `pnpm db:studio`         | Explorar datos con GUI             | **Local**          |
| `pnpm db:seed`           | Poblar datos iniciales             | **Local**          |

---

## 💻 Comandos Útiles

### Desarrollo

```bash
pnpm dev              # Servidor de desarrollo (localhost:3000)
pnpm build            # Compilar para producción
pnpm start            # Servidor de producción
pnpm lint             # Linter (Biome)
pnpm format           # Formatear código (Prettier)
```

### Base de Datos

```bash
pnpm db:migrate       # Crear y aplicar migración (dev)
pnpm db:generate      # Generar cliente Prisma
pnpm db:migrate:deploy # Aplicar migraciones (producción)
pnpm db:studio        # GUI para explorar datos
pnpm db:seed          # Poblar datos de prueba
```

### Git Workflow

```bash
git checkout -b features/nueva-funcionalidad
# ... hacer cambios ...
git add .
git commit -m "feat: descripción del cambio"
git push origin features/nueva-funcionalidad
# ... crear Pull Request ...
```

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

Desarrollado para la comunidad de Chiloé, Chile.
