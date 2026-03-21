# Plan Arquitectónico: Atlas Services Multi-País

**Fecha:** 2026-03-18
**Versión:** 1.0
**Estado:** Pendiente de aprobación
**Autor:** Edgardo Ruotolo + Claude
**Continuable por cualquier IA:** Sí — este documento es autocontenido

---

## Índice

1. [Contexto y Motivación](#1-contexto-y-motivación)
2. [Diagnóstico del Estado Actual](#2-diagnóstico-del-estado-actual)
3. [Principios de Diseño](#3-principios-de-diseño)
4. [Fase A — Backend: Schema y Módulos](#4-fase-a--backend-schema-y-módulos)
5. [Fase B — Frontend: Routing Multi-País](#5-fase-b--frontend-routing-multi-país)
6. [Fase C — Frontend: Features y Componentes](#6-fase-c--frontend-features-y-componentes)
7. [Pasarelas de Pago por País](#7-pasarelas-de-pago-por-país)
8. [SEO Multi-País](#8-seo-multi-país)
9. [Panel de Administración](#9-panel-de-administración)
10. [Consideraciones Adicionales](#10-consideraciones-adicionales)
11. [Variables de Entorno Completas](#11-variables-de-entorno-completas)
12. [Orden de Implementación y Dependencias](#12-orden-de-implementación-y-dependencias)
13. [Riesgos y Mitigaciones](#13-riesgos-y-mitigaciones)
14. [Inventario de Archivos a Crear/Modificar](#14-inventario-de-archivos-a-crearmodificar)
15. [Preguntas Abiertas](#15-preguntas-abiertas)

---

## 1. Contexto y Motivación

Atlas Services nació como plataforma hiperlocal para la Isla de Chiloé, Chile (~35.000 habitantes). El objetivo es expandirse a 5 países: **Chile (CL), Argentina (AR), Uruguay (UY), España (ES) y Estados Unidos (US)**.

Este documento describe el cambio estructural completo necesario para que la plataforma sea multi-país, con:
- Datos geográficos dinámicos (no más comunas hardcoded)
- Pasarelas de pago por país (MercadoPago para LATAM, Stripe para ES/US)
- URLs por país (`/cl/...`, `/ar/...`, etc.)
- Aislamiento de servicios y usuarios por país/región
- Detección automática de país por IP en producción
- Panel de administración filtrado por país

---

## 2. Diagnóstico del Estado Actual

### Acoplamiento geográfico existente (todo debe reemplazarse)

| Archivo | Problema |
|---------|----------|
| `backend/prisma/schema.prisma` | `Service.commune: String` — string libre sin FK, sin país |
| `backend/prisma/schema.prisma` | `PremiumPrice` — sin `countryCode`, precio global único |
| `backend/prisma/schema.prisma` | `Sponsor` — sin `countryCode` |
| `backend/src/modules/services/dto/query-services.dto.ts` | Campo `comuna` sin `countryCode` |
| `backend/src/modules/prices/prices.service.ts` | `findByDuracion()` sin filtro por país |
| `backend/src/modules/subscriptions/subscriptions.service.ts` | `create()` sin routing de pago por país |
| `frontend/src/shared/types/common.ts` | Enum `Comuna` hardcoded con 10 valores de Chiloé |
| `frontend/src/shared/constants/locations.ts` | `comunaMap` de Chiloé |
| `frontend/src/features/services/lib/constants.ts` | `COMUNAS_CHILOE` constante |
| `frontend/src/app/layout.tsx` | Metadata con `geo.region: CL-LL`, locale `es_CL`, nombre "Chiloé Servicios" |
| `frontend/src/proxy.ts` | Solo maneja auth. Falta routing multi-país, redirects legacy y detección de país |
| `frontend/src/features/payments/components/PaymentBrick.tsx` | `initMercadoPago` con `locale: 'es-CL'`, sin routing por país |
| `frontend/src/app/api/webhooks/mercadopago/route.ts` | `MP_ACCESS_TOKEN` único, sin distinguir país |

### Estado actual del schema (13 tablas)

```
User, Role, UserRole, ServiceCategory, ServiceCategoryMap,
Service, Rating, Subscription, Sponsor, PremiumPrice,
Interaction, SocialMedia, PrismaService (cliente ORM)
```

### Pasarelas de pago actuales

- MercadoPago: webhook en `frontend/src/app/api/webhooks/mercadopago/route.ts` — 1 token hardcoded
- Stripe: **NO implementado**

---

## 3. Principios de Diseño

1. **Backwards-compatible migration**: Chile/Chiloé sigue funcionando sin interrupciones. La ruta `/cl` es el nuevo hogar de todo lo que hoy vive en `/`.
2. **Country-first en URL**: Prefijo ISO2 en minúsculas: `/cl`, `/ar`, `/uy`, `/es`, `/us`.
3. **Gateway pattern para pagos**: Un `PaymentGatewayService` abstrae MercadoPago y Stripe; el llamador no sabe cuál se usa.
4. **Datos geográficos como catálogo DB**: No más constantes hardcoded. `Country`, `GeoRegion`, `GeoLocality` son tablas sembradas con seeds.
5. **Admin multi-tenant**: `UserRole` agrega `countryId?` para admins por país. `SuperAdministrador` ve todo.
6. **Detección de país por headers en producción**: Cloudflare `cf-ipcountry` / Vercel `x-vercel-ip-country`. Sin llamadas externas en el request path. Cookie `atlas_country` para preferencia manual.

---

## 4. Fase A — Backend: Schema y Módulos

### 4.1 Schema Prisma Completo Actualizado

**Archivo a modificar:** `backend/prisma/schema.prisma`

Agregar 3 nuevos modelos: `Country`, `GeoRegion`, `GeoLocality`. Modificar 6 modelos existentes.

```prisma
// ─── NUEVO Enum ───────────────────────────────────────────────────────────────
enum PaymentGateway {
    MERCADOPAGO
    STRIPE
}

// ─── NUEVO: Country ──────────────────────────────────────────────────────────
model Country {
    id             String   @id @default(uuid())
    code           String   @unique  // ISO2 minúsculas: "cl", "ar", "uy", "es", "us"
    name           String            // "Chile", "Argentina", etc.
    currency       String            // "CLP", "ARS", "UYU", "EUR", "USD"
    locale         String            // "es-CL", "es-AR", "es-UY", "es-ES", "en-US"
    timezone       String            // "America/Santiago", "America/Argentina/Buenos_Aires"
    gateway        PaymentGateway    // MERCADOPAGO | STRIPE
    regionLabel    String            // "Región", "Provincia", "Departamento", "C. Autónoma", "State"
    localityLabel  String            // "Comuna", "Localidad", "Localidad", "Municipio", "City"
    active         Boolean  @default(true)
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt

    regions       GeoRegion[]
    services      Service[]
    premiumPrices PremiumPrice[]
    sponsors      Sponsor[]
    userRoles     UserRole[]

    @@map("countries")
}

// ─── NUEVO: GeoRegion ─────────────────────────────────────────────────────────
// Regiones / Estados / Departamentos / Comunidades Autónomas
model GeoRegion {
    id        String   @id @default(uuid())
    countryId String
    name      String   // "Región de Los Lagos", "Buenos Aires", "Montevideo", "Cataluña", "California"
    code      String   // "LL", "BA", "MO", "CAT", "CA" — código interno
    active    Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    country    Country       @relation(fields: [countryId], references: [id])
    localities GeoLocality[]
    services   Service[]

    @@unique([countryId, code])
    @@index([countryId])
    @@map("geo_regions")
}

// ─── NUEVO: GeoLocality ───────────────────────────────────────────────────────
// Comunas / Localidades / Ciudades / Municipios
model GeoLocality {
    id       String   @id @default(uuid())
    regionId String
    name     String   // "Castro", "Mar del Plata", "Montevideo", "Barcelona", "Los Angeles"
    slug     String   // "castro", "mar-del-plata", etc.
    active   Boolean  @default(true)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    region   GeoRegion @relation(fields: [regionId], references: [id])
    services Service[]

    @@unique([regionId, slug])
    @@index([regionId])
    @@map("geo_localities")
}

// ─── MODIFICADO: UserRole (agregar countryId nullable) ────────────────────────
model UserRole {
    id        String   @id @default(uuid())
    userId    String
    roleId    String
    countryId String?  // null = SuperAdmin global; valor = Admin de ese país

    user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    role    Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
    country Country? @relation(fields: [countryId], references: [id], onDelete: SetNull)

    @@unique([userId, roleId, countryId])
    @@index([userId])
    @@index([roleId])
    @@index([countryId])
    @@map("user_roles")
}

// ─── MODIFICADO: ServiceCategory (agregar countryCode informal) ───────────────
model ServiceCategory {
    id          String  @id @default(uuid())
    name        String
    slug        String
    icon        String?
    order       Int     @default(0)
    active      Boolean @default(true)
    countryCode String? // null = global; "cl", "ar" = solo ese país (NO es FK, es seed helper)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt

    services ServiceCategoryMap[]

    @@unique([slug, countryCode])
    @@map("service_categories")
}

// ─── MODIFICADO: Service (agregar countryId, regionId, localityId) ────────────
model Service {
    id            String       @id @default(uuid())
    userId        String
    countryId     String       // FK obligatorio a Country
    regionId      String?      // FK a GeoRegion
    localityId    String?      // FK a GeoLocality
    commune       String       // nombre textual denormalizado (compatibilidad)
    title         String
    slug          String       @unique
    description   String       @db.Text
    price         Decimal      @db.Decimal(10, 2)
    contactName   String?
    contactEmail  String?
    contactPhone  String?
    mainImage     String?
    images        String[]
    averageRating Decimal?     @db.Decimal(2, 1)
    totalRatings  Int          @default(0)
    featured      Boolean      @default(false)
    active        Boolean      @default(true)
    level         ServiceLevel @default(BASIC)
    startDate     DateTime     @default(now())
    endDate       DateTime
    createdAt     DateTime     @default(now())
    updatedAt     DateTime     @updatedAt

    user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
    country      Country              @relation(fields: [countryId], references: [id])
    region       GeoRegion?           @relation(fields: [regionId], references: [id])
    locality     GeoLocality?         @relation(fields: [localityId], references: [id])
    categories   ServiceCategoryMap[]
    ratings      Rating[]
    subscription Subscription?
    interactions Interaction[]
    socialMedia  SocialMedia[]

    @@index([countryId])
    @@index([regionId])
    @@index([localityId])
    @@index([commune])
    @@index([userId])
    @@index([averageRating])
    @@index([level])
    @@index([endDate])
    @@index([countryId, level, featured, endDate])  // índice compuesto queries típicas
    @@map("services")
}

// ─── MODIFICADO: Subscription (agregar currency y paymentGateway) ─────────────
model Subscription {
    id             String         @id @default(uuid())
    serviceId      String         @unique
    durationMonths Int
    amount         Decimal        @db.Decimal(10, 2)
    currency       String         @default("CLP")  // ISO 4217
    paymentGateway PaymentGateway @default(MERCADOPAGO)
    paymentMethod  String?
    paymentStatus  String         @default("pending")
    transactionId  String?
    startDate      DateTime       @default(now())
    endDate        DateTime
    active         Boolean        @default(true)
    createdAt      DateTime       @default(now())
    updatedAt      DateTime       @updatedAt

    service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

    @@index([serviceId])
    @@index([active])
    @@index([paymentStatus])
    @@map("subscriptions")
}

// ─── MODIFICADO: PremiumPrice (agregar countryId, currency) ──────────────────
model PremiumPrice {
    id             String   @id @default(uuid())
    countryId      String   // Precio específico por país
    durationMonths Int
    price          Decimal  @db.Decimal(10, 2)
    currency       String   // "CLP", "ARS", "UYU", "EUR", "USD"
    description    String?
    active         Boolean  @default(true)
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt

    country Country @relation(fields: [countryId], references: [id])

    @@unique([countryId, durationMonths])  // un precio por duración por país
    @@index([countryId])
    @@index([active])
    @@map("premium_prices")
}

// ─── MODIFICADO: Sponsor (agregar countryId nullable) ────────────────────────
model Sponsor {
    id           String          @id @default(uuid())
    countryId    String?         // null = global; valor = solo ese país
    name         String
    level        SponsorCategory
    imageUrl     String
    description  String?         @db.Text
    externalLink String
    startDate    DateTime        @default(now())
    endDate      DateTime
    active       Boolean         @default(true)
    createdAt    DateTime        @default(now())
    updatedAt    DateTime        @updatedAt

    country Country? @relation(fields: [countryId], references: [id], onDelete: SetNull)

    @@index([countryId])
    @@index([level])
    @@index([active])
    @@map("sponsors")
}
```

**Modelos sin cambios:** `User`, `Role`, `Rating`, `Interaction`, `SocialMedia`, `ServiceCategoryMap`

### 4.2 Migración de Datos Existentes

Ejecutar en este orden exacto (una sola migración Prisma versionada):

```sql
-- Paso 1: Crear tablas nuevas (sin eliminar nada)
-- Paso 2: Seed de 5 países (CL, AR, UY, ES, US)
-- Paso 3: Agregar columnas nullable a Service
ALTER TABLE services ADD COLUMN "countryId" TEXT;
ALTER TABLE services ADD COLUMN "regionId" TEXT;
ALTER TABLE services ADD COLUMN "localityId" TEXT;
-- Paso 4: Asignar Chile a todos los servicios existentes
UPDATE services SET "countryId" = (SELECT id FROM countries WHERE code = 'cl');
-- Paso 5: Asignar región Los Lagos
UPDATE services SET "regionId" = (
  SELECT gr.id FROM geo_regions gr
  JOIN countries c ON gr."countryId" = c.id
  WHERE c.code = 'cl' AND gr.code = 'LL'
);
-- Paso 6: Intentar match por nombre de localidad
UPDATE services SET "localityId" = (
  SELECT gl.id FROM geo_localities gl
  JOIN geo_regions gr ON gl."regionId" = gr.id
  WHERE LOWER(gl.name) = LOWER(services.commune)
  LIMIT 1
);
-- Paso 7: Hacer countryId NOT NULL
ALTER TABLE services ALTER COLUMN "countryId" SET NOT NULL;
-- Paso 8: Migrar PremiumPrice (3 pasos en una transacción)
ALTER TABLE premium_prices ADD COLUMN "countryId" TEXT;
ALTER TABLE premium_prices ADD COLUMN "currency" TEXT DEFAULT 'CLP';
UPDATE premium_prices SET "countryId" = (SELECT id FROM countries WHERE code = 'cl');
ALTER TABLE premium_prices DROP CONSTRAINT "premium_prices_durationMonths_key";
ALTER TABLE premium_prices ADD CONSTRAINT "premium_prices_countryId_durationMonths_key" UNIQUE("countryId", "durationMonths");
ALTER TABLE premium_prices ALTER COLUMN "countryId" SET NOT NULL;
```

### 4.3 Nuevo Módulo: `geo`

**Archivos a crear:**

```
backend/src/modules/geo/
├── geo.module.ts
├── geo.controller.ts
├── geo.service.ts
├── dto/
│   ├── country.dto.ts
│   ├── geo-region.dto.ts
│   └── geo-locality.dto.ts
└── seeds/
    ├── geo.seed.ts      ← seed maestro que importa los 5 países
    ├── cl.seed.ts       ← Chile: Región Los Lagos + 10 comunas de Chiloé
    ├── ar.seed.ts       ← Argentina: 23 provincias + ciudades principales
    ├── uy.seed.ts       ← Uruguay: 19 departamentos + localidades
    ├── es.seed.ts       ← España: 17 CCAA + municipios principales
    └── us.seed.ts       ← USA: 50 states + cities principales
```

**Endpoints del controller:**

```
GET /api/v1/geo/countries                        → Lista países activos
GET /api/v1/geo/countries/:code                  → Datos de un país
GET /api/v1/geo/countries/:code/regions          → Regiones de un país
GET /api/v1/geo/regions/:regionId/localities     → Localidades de una región
```

**Seeds geográficos completos — División 1 + División 2 + ciudades principales:**

> Criterio: **todas** las divisiones 1 (regiones/estados/provincias) + ciudades más importantes
> por división. Esto es la base de los filtros de búsqueda.

---

#### `cl.seed.ts` — Chile (16 regiones + comunas principales)

```typescript
export const CL_SEED = {
  country: {
    code: 'cl', name: 'Chile', currency: 'CLP',
    locale: 'es-CL', timezone: 'America/Santiago',
    gateway: 'MERCADOPAGO', regionLabel: 'Región', localityLabel: 'Comuna',
  },
  regions: [
    { name: 'Arica y Parinacota', code: 'AP', localities: [
        { name: 'Arica', slug: 'arica' }, { name: 'Putre', slug: 'putre' },
        { name: 'General Lagos', slug: 'general-lagos' },
    ]},
    { name: 'Tarapacá', code: 'TA', localities: [
        { name: 'Iquique', slug: 'iquique' }, { name: 'Alto Hospicio', slug: 'alto-hospicio' },
        { name: 'Pozo Almonte', slug: 'pozo-almonte' }, { name: 'Pica', slug: 'pica' },
    ]},
    { name: 'Antofagasta', code: 'AN', localities: [
        { name: 'Antofagasta', slug: 'antofagasta' }, { name: 'Calama', slug: 'calama' },
        { name: 'Tocopilla', slug: 'tocopilla' }, { name: 'Mejillones', slug: 'mejillones' },
        { name: 'San Pedro de Atacama', slug: 'san-pedro-de-atacama' },
    ]},
    { name: 'Atacama', code: 'AT', localities: [
        { name: 'Copiapó', slug: 'copiapo' }, { name: 'Vallenar', slug: 'vallenar' },
        { name: 'Caldera', slug: 'caldera' }, { name: 'Chañaral', slug: 'chanaral' },
        { name: 'Diego de Almagro', slug: 'diego-de-almagro' },
    ]},
    { name: 'Coquimbo', code: 'CO', localities: [
        { name: 'La Serena', slug: 'la-serena' }, { name: 'Coquimbo', slug: 'coquimbo' },
        { name: 'Ovalle', slug: 'ovalle' }, { name: 'Illapel', slug: 'illapel' },
        { name: 'Vicuña', slug: 'vicuna' }, { name: 'Andacollo', slug: 'andacollo' },
    ]},
    { name: 'Valparaíso', code: 'VA', localities: [
        { name: 'Valparaíso', slug: 'valparaiso' }, { name: 'Viña del Mar', slug: 'vina-del-mar' },
        { name: 'Quilpué', slug: 'quilpue' }, { name: 'San Antonio', slug: 'san-antonio' },
        { name: 'Quillota', slug: 'quillota' }, { name: 'Los Andes', slug: 'los-andes' },
        { name: 'La Calera', slug: 'la-calera' }, { name: 'Limache', slug: 'limache' },
    ]},
    { name: 'Metropolitana de Santiago', code: 'RM', localities: [
        { name: 'Santiago', slug: 'santiago' }, { name: 'Maipú', slug: 'maipu' },
        { name: 'Puente Alto', slug: 'puente-alto' }, { name: 'La Florida', slug: 'la-florida' },
        { name: 'Las Condes', slug: 'las-condes' }, { name: 'Ñuñoa', slug: 'nunoa' },
        { name: 'San Bernardo', slug: 'san-bernardo' }, { name: 'Peñalolén', slug: 'penalolen' },
        { name: 'Providencia', slug: 'providencia' }, { name: 'La Pintana', slug: 'la-pintana' },
        { name: 'El Bosque', slug: 'el-bosque' }, { name: 'Pudahuel', slug: 'pudahuel' },
    ]},
    { name: "O'Higgins", code: 'LI', localities: [
        { name: 'Rancagua', slug: 'rancagua' }, { name: 'San Fernando', slug: 'san-fernando' },
        { name: 'Pichilemu', slug: 'pichilemu' }, { name: 'Rengo', slug: 'rengo' },
        { name: 'Santa Cruz', slug: 'santa-cruz' },
    ]},
    { name: 'Maule', code: 'ML', localities: [
        { name: 'Talca', slug: 'talca' }, { name: 'Curicó', slug: 'curico' },
        { name: 'Linares', slug: 'linares' }, { name: 'Cauquenes', slug: 'cauquenes' },
        { name: 'Constitución', slug: 'constitucion' },
    ]},
    { name: 'Ñuble', code: 'NB', localities: [
        { name: 'Chillán', slug: 'chillan' }, { name: 'Chillán Viejo', slug: 'chillan-viejo' },
        { name: 'San Carlos', slug: 'san-carlos' }, { name: 'Bulnes', slug: 'bulnes' },
        { name: 'Yungay', slug: 'yungay' },
    ]},
    { name: 'Biobío', code: 'BI', localities: [
        { name: 'Concepción', slug: 'concepcion' }, { name: 'Talcahuano', slug: 'talcahuano' },
        { name: 'Los Ángeles', slug: 'los-angeles' }, { name: 'Hualpén', slug: 'hualpen' },
        { name: 'Coronel', slug: 'coronel' }, { name: 'Chiguayante', slug: 'chiguayante' },
        { name: 'San Pedro de la Paz', slug: 'san-pedro-de-la-paz' },
    ]},
    { name: 'La Araucanía', code: 'AR', localities: [
        { name: 'Temuco', slug: 'temuco' }, { name: 'Villarrica', slug: 'villarrica' },
        { name: 'Pucón', slug: 'pucon' }, { name: 'Angol', slug: 'angol' },
        { name: 'Padre Las Casas', slug: 'padre-las-casas' }, { name: 'Victoria', slug: 'victoria' },
    ]},
    { name: 'Los Ríos', code: 'LR', localities: [
        { name: 'Valdivia', slug: 'valdivia' }, { name: 'La Unión', slug: 'la-union' },
        { name: 'Panguipulli', slug: 'panguipulli' }, { name: 'Futrono', slug: 'futrono' },
        { name: 'Río Bueno', slug: 'rio-bueno' },
    ]},
    { name: 'Los Lagos', code: 'LL', localities: [
        { name: 'Puerto Montt', slug: 'puerto-montt' }, { name: 'Osorno', slug: 'osorno' },
        { name: 'Castro', slug: 'castro' }, { name: 'Ancud', slug: 'ancud' },
        { name: 'Puerto Varas', slug: 'puerto-varas' }, { name: 'Quellón', slug: 'quellon' },
        { name: 'Dalcahue', slug: 'dalcahue' }, { name: 'Chonchi', slug: 'chonchi' },
        { name: 'Curaco de Vélez', slug: 'curaco-de-velez' }, { name: 'Puqueldón', slug: 'puqueldon' },
        { name: 'Queilén', slug: 'queilen' }, { name: 'Quemchi', slug: 'quemchi' },
        { name: 'Quinchao', slug: 'quinchao' }, { name: 'Fresia', slug: 'fresia' },
    ]},
    { name: 'Aysén', code: 'AI', localities: [
        { name: 'Coyhaique', slug: 'coyhaique' }, { name: 'Puerto Aysén', slug: 'puerto-aysen' },
        { name: 'Chile Chico', slug: 'chile-chico' }, { name: 'Cochrane', slug: 'cochrane' },
    ]},
    { name: 'Magallanes', code: 'MA', localities: [
        { name: 'Punta Arenas', slug: 'punta-arenas' }, { name: 'Puerto Natales', slug: 'puerto-natales' },
        { name: 'Porvenir', slug: 'porvenir' },
    ]},
  ],
};
```

---

#### `ar.seed.ts` — Argentina (24 provincias + ciudades principales)

```typescript
export const AR_SEED = {
  country: {
    code: 'ar', name: 'Argentina', currency: 'ARS',
    locale: 'es-AR', timezone: 'America/Argentina/Buenos_Aires',
    gateway: 'MERCADOPAGO', regionLabel: 'Provincia', localityLabel: 'Localidad',
  },
  regions: [
    { name: 'Buenos Aires', code: 'BA', localities: [
        { name: 'La Plata', slug: 'la-plata' }, { name: 'Mar del Plata', slug: 'mar-del-plata' },
        { name: 'Bahía Blanca', slug: 'bahia-blanca' }, { name: 'Quilmes', slug: 'quilmes' },
        { name: 'Lanús', slug: 'lanus' }, { name: 'Lomas de Zamora', slug: 'lomas-de-zamora' },
        { name: 'Morón', slug: 'moron' }, { name: 'Tandil', slug: 'tandil' },
        { name: 'Tres Arroyos', slug: 'tres-arroyos' }, { name: 'Junín', slug: 'junin' },
    ]},
    { name: 'Ciudad de Buenos Aires', code: 'CABA', localities: [
        { name: 'Buenos Aires', slug: 'buenos-aires' },
        { name: 'Palermo', slug: 'palermo' }, { name: 'San Telmo', slug: 'san-telmo' },
        { name: 'Recoleta', slug: 'recoleta' }, { name: 'Caballito', slug: 'caballito' },
    ]},
    { name: 'Catamarca', code: 'CA', localities: [
        { name: 'San Fernando del Valle de Catamarca', slug: 'catamarca-capital' },
        { name: 'Andalgalá', slug: 'andalgala' },
    ]},
    { name: 'Chaco', code: 'CH', localities: [
        { name: 'Resistencia', slug: 'resistencia' }, { name: 'Barranqueras', slug: 'barranqueras' },
        { name: 'Presidencia Roque Sáenz Peña', slug: 'saenz-pena' },
    ]},
    { name: 'Chubut', code: 'CU', localities: [
        { name: 'Rawson', slug: 'rawson' }, { name: 'Comodoro Rivadavia', slug: 'comodoro-rivadavia' },
        { name: 'Trelew', slug: 'trelew' }, { name: 'Puerto Madryn', slug: 'puerto-madryn' },
        { name: 'Esquel', slug: 'esquel' },
    ]},
    { name: 'Córdoba', code: 'CB', localities: [
        { name: 'Córdoba', slug: 'cordoba' }, { name: 'Villa María', slug: 'villa-maria' },
        { name: 'Río Cuarto', slug: 'rio-cuarto' }, { name: 'San Francisco', slug: 'san-francisco' },
        { name: 'Villa Carlos Paz', slug: 'villa-carlos-paz' }, { name: 'Cosquín', slug: 'cosquin' },
    ]},
    { name: 'Corrientes', code: 'CN', localities: [
        { name: 'Corrientes', slug: 'corrientes' }, { name: 'Goya', slug: 'goya' },
        { name: 'Mercedes', slug: 'mercedes' }, { name: 'Paso de los Libres', slug: 'paso-de-los-libres' },
    ]},
    { name: 'Entre Ríos', code: 'ER', localities: [
        { name: 'Paraná', slug: 'parana' }, { name: 'Concordia', slug: 'concordia' },
        { name: 'Gualeguaychú', slug: 'gualeguaychu' }, { name: 'Colón', slug: 'colon' },
    ]},
    { name: 'Formosa', code: 'FO', localities: [
        { name: 'Formosa', slug: 'formosa' }, { name: 'Clorinda', slug: 'clorinda' },
    ]},
    { name: 'Jujuy', code: 'JU', localities: [
        { name: 'San Salvador de Jujuy', slug: 'jujuy-capital' }, { name: 'Palpalá', slug: 'palpala' },
        { name: 'San Pedro', slug: 'san-pedro-jujuy' }, { name: 'Humahuaca', slug: 'humahuaca' },
    ]},
    { name: 'La Pampa', code: 'LP', localities: [
        { name: 'Santa Rosa', slug: 'santa-rosa' }, { name: 'General Pico', slug: 'general-pico' },
    ]},
    { name: 'La Rioja', code: 'LR', localities: [
        { name: 'La Rioja', slug: 'la-rioja' }, { name: 'Chilecito', slug: 'chilecito' },
    ]},
    { name: 'Mendoza', code: 'MZ', localities: [
        { name: 'Mendoza', slug: 'mendoza' }, { name: 'San Rafael', slug: 'san-rafael' },
        { name: 'Godoy Cruz', slug: 'godoy-cruz' }, { name: 'Malargüe', slug: 'malargue' },
        { name: 'Luján de Cuyo', slug: 'lujan-de-cuyo' },
    ]},
    { name: 'Misiones', code: 'MI', localities: [
        { name: 'Posadas', slug: 'posadas' }, { name: 'Oberá', slug: 'obera' },
        { name: 'Eldorado', slug: 'eldorado' }, { name: 'Puerto Iguazú', slug: 'puerto-iguazu' },
    ]},
    { name: 'Neuquén', code: 'NQ', localities: [
        { name: 'Neuquén', slug: 'neuquen' }, { name: 'San Martín de los Andes', slug: 'san-martin-de-los-andes' },
        { name: 'Zapala', slug: 'zapala' }, { name: 'Villa la Angostura', slug: 'villa-la-angostura' },
        { name: 'Bariloche', slug: 'bariloche-nq' },
    ]},
    { name: 'Río Negro', code: 'RN', localities: [
        { name: 'Viedma', slug: 'viedma' }, { name: 'Bariloche', slug: 'bariloche' },
        { name: 'Cipolletti', slug: 'cipolletti' }, { name: 'General Roca', slug: 'general-roca' },
        { name: 'El Bolsón', slug: 'el-bolson' },
    ]},
    { name: 'Salta', code: 'SA', localities: [
        { name: 'Salta', slug: 'salta' }, { name: 'Tartagal', slug: 'tartagal' },
        { name: 'Orán', slug: 'oran' }, { name: 'Cafayate', slug: 'cafayate' },
    ]},
    { name: 'San Juan', code: 'SJ', localities: [
        { name: 'San Juan', slug: 'san-juan' }, { name: 'Rivadavia', slug: 'rivadavia-sj' },
        { name: 'Caucete', slug: 'caucete' },
    ]},
    { name: 'San Luis', code: 'SL', localities: [
        { name: 'San Luis', slug: 'san-luis' }, { name: 'Villa Mercedes', slug: 'villa-mercedes' },
    ]},
    { name: 'Santa Cruz', code: 'SC', localities: [
        { name: 'Río Gallegos', slug: 'rio-gallegos' }, { name: 'Caleta Olivia', slug: 'caleta-olivia' },
        { name: 'El Calafate', slug: 'el-calafate' },
    ]},
    { name: 'Santa Fe', code: 'SF', localities: [
        { name: 'Santa Fe', slug: 'santa-fe' }, { name: 'Rosario', slug: 'rosario' },
        { name: 'Rafaela', slug: 'rafaela' }, { name: 'Venado Tuerto', slug: 'venado-tuerto' },
        { name: 'Reconquista', slug: 'reconquista' },
    ]},
    { name: 'Santiago del Estero', code: 'SE', localities: [
        { name: 'Santiago del Estero', slug: 'santiago-del-estero' },
        { name: 'La Banda', slug: 'la-banda' }, { name: 'Termas de Río Hondo', slug: 'termas-de-rio-hondo' },
    ]},
    { name: 'Tierra del Fuego', code: 'TF', localities: [
        { name: 'Ushuaia', slug: 'ushuaia' }, { name: 'Río Grande', slug: 'rio-grande-tf' },
    ]},
    { name: 'Tucumán', code: 'TU', localities: [
        { name: 'San Miguel de Tucumán', slug: 'tucuman-capital' },
        { name: 'Tafí Viejo', slug: 'tafi-viejo' }, { name: 'Concepción', slug: 'concepcion-tu' },
        { name: 'Yerba Buena', slug: 'yerba-buena' },
    ]},
  ],
};
```

---

#### `uy.seed.ts` — Uruguay (19 departamentos + localidades principales)

```typescript
export const UY_SEED = {
  country: {
    code: 'uy', name: 'Uruguay', currency: 'UYU',
    locale: 'es-UY', timezone: 'America/Montevideo',
    gateway: 'MERCADOPAGO', regionLabel: 'Departamento', localityLabel: 'Localidad',
  },
  regions: [
    { name: 'Artigas', code: 'AR', localities: [
        { name: 'Artigas', slug: 'artigas' }, { name: 'Bella Unión', slug: 'bella-union' },
    ]},
    { name: 'Canelones', code: 'CA', localities: [
        { name: 'Canelones', slug: 'canelones' }, { name: 'Las Piedras', slug: 'las-piedras' },
        { name: 'La Paz', slug: 'la-paz-uy' }, { name: 'Pando', slug: 'pando' },
        { name: 'Ciudad de la Costa', slug: 'ciudad-de-la-costa' },
    ]},
    { name: 'Cerro Largo', code: 'CL', localities: [
        { name: 'Melo', slug: 'melo' }, { name: 'Río Branco', slug: 'rio-branco' },
    ]},
    { name: 'Colonia', code: 'CO', localities: [
        { name: 'Colonia del Sacramento', slug: 'colonia-del-sacramento' },
        { name: 'Carmelo', slug: 'carmelo' }, { name: 'Nueva Helvecia', slug: 'nueva-helvecia' },
    ]},
    { name: 'Durazno', code: 'DU', localities: [
        { name: 'Durazno', slug: 'durazno' }, { name: 'Trinidad', slug: 'trinidad-uy' },
    ]},
    { name: 'Flores', code: 'FS', localities: [
        { name: 'Trinidad', slug: 'trinidad-flores' },
    ]},
    { name: 'Florida', code: 'FD', localities: [
        { name: 'Florida', slug: 'florida-uy' },
    ]},
    { name: 'Lavalleja', code: 'LA', localities: [
        { name: 'Minas', slug: 'minas' }, { name: 'Piriápolis', slug: 'piriapolis' },
    ]},
    { name: 'Maldonado', code: 'MA', localities: [
        { name: 'Maldonado', slug: 'maldonado' }, { name: 'Punta del Este', slug: 'punta-del-este' },
        { name: 'San Carlos', slug: 'san-carlos-uy' }, { name: 'La Barra', slug: 'la-barra' },
    ]},
    { name: 'Montevideo', code: 'MO', localities: [
        { name: 'Montevideo', slug: 'montevideo' }, { name: 'Pocitos', slug: 'pocitos' },
        { name: 'Centro', slug: 'centro-mvd' }, { name: 'Punta Carretas', slug: 'punta-carretas' },
    ]},
    { name: 'Paysandú', code: 'PA', localities: [
        { name: 'Paysandú', slug: 'paysandu' }, { name: 'Guichón', slug: 'guichon' },
    ]},
    { name: 'Rivera', code: 'RV', localities: [
        { name: 'Rivera', slug: 'rivera' }, { name: 'Tranqueras', slug: 'tranqueras' },
    ]},
    { name: 'Rocha', code: 'RO', localities: [
        { name: 'Rocha', slug: 'rocha' }, { name: 'Chuy', slug: 'chuy' },
        { name: 'La Paloma', slug: 'la-paloma' }, { name: 'Lascano', slug: 'lascano' },
    ]},
    { name: 'Salto', code: 'SA', localities: [
        { name: 'Salto', slug: 'salto' }, { name: 'Constitución', slug: 'constitucion-uy' },
    ]},
    { name: 'San José', code: 'SJ', localities: [
        { name: 'San José de Mayo', slug: 'san-jose-de-mayo' },
        { name: 'Ciudad del Plata', slug: 'ciudad-del-plata' },
    ]},
    { name: 'Soriano', code: 'SO', localities: [
        { name: 'Mercedes', slug: 'mercedes-uy' }, { name: 'Dolores', slug: 'dolores-uy' },
    ]},
    { name: 'Tacuarembó', code: 'TA', localities: [
        { name: 'Tacuarembó', slug: 'tacuarembo' }, { name: 'Paso de los Toros', slug: 'paso-de-los-toros' },
    ]},
    { name: 'Treinta y Tres', code: 'TT', localities: [
        { name: 'Treinta y Tres', slug: 'treinta-y-tres' },
    ]},
  ],
};
```

---

#### `es.seed.ts` — España (17 CCAA + provincias y ciudades principales)

```typescript
export const ES_SEED = {
  country: {
    code: 'es', name: 'España', currency: 'EUR',
    locale: 'es-ES', timezone: 'Europe/Madrid',
    gateway: 'STRIPE', regionLabel: 'Comunidad Autónoma', localityLabel: 'Municipio',
  },
  regions: [
    { name: 'Andalucía', code: 'AN', localities: [
        { name: 'Sevilla', slug: 'sevilla' }, { name: 'Málaga', slug: 'malaga' },
        { name: 'Córdoba', slug: 'cordoba-es' }, { name: 'Granada', slug: 'granada' },
        { name: 'Almería', slug: 'almeria' }, { name: 'Jaén', slug: 'jaen' },
        { name: 'Cádiz', slug: 'cadiz' }, { name: 'Huelva', slug: 'huelva' },
        { name: 'Marbella', slug: 'marbella' }, { name: 'Jerez de la Frontera', slug: 'jerez' },
    ]},
    { name: 'Aragón', code: 'AR', localities: [
        { name: 'Zaragoza', slug: 'zaragoza' }, { name: 'Huesca', slug: 'huesca' },
        { name: 'Teruel', slug: 'teruel' },
    ]},
    { name: 'Asturias', code: 'AS', localities: [
        { name: 'Oviedo', slug: 'oviedo' }, { name: 'Gijón', slug: 'gijon' },
        { name: 'Avilés', slug: 'aviles' },
    ]},
    { name: 'Islas Baleares', code: 'IB', localities: [
        { name: 'Palma', slug: 'palma' }, { name: 'Ibiza', slug: 'ibiza' },
        { name: 'Manacor', slug: 'manacor' }, { name: 'Mahón', slug: 'mahon' },
    ]},
    { name: 'Canarias', code: 'CN', localities: [
        { name: 'Las Palmas de Gran Canaria', slug: 'las-palmas' },
        { name: 'Santa Cruz de Tenerife', slug: 'santa-cruz-tenerife' },
        { name: 'Arona', slug: 'arona' }, { name: 'San Cristóbal de La Laguna', slug: 'la-laguna' },
    ]},
    { name: 'Cantabria', code: 'CB', localities: [
        { name: 'Santander', slug: 'santander' }, { name: 'Torrelavega', slug: 'torrelavega' },
    ]},
    { name: 'Castilla-La Mancha', code: 'CM', localities: [
        { name: 'Toledo', slug: 'toledo' }, { name: 'Albacete', slug: 'albacete' },
        { name: 'Ciudad Real', slug: 'ciudad-real' }, { name: 'Cuenca', slug: 'cuenca' },
        { name: 'Guadalajara', slug: 'guadalajara-es' },
    ]},
    { name: 'Castilla y León', code: 'CL', localities: [
        { name: 'Valladolid', slug: 'valladolid' }, { name: 'Salamanca', slug: 'salamanca' },
        { name: 'Burgos', slug: 'burgos' }, { name: 'León', slug: 'leon' },
        { name: 'Ávila', slug: 'avila' }, { name: 'Zamora', slug: 'zamora' },
        { name: 'Segovia', slug: 'segovia' }, { name: 'Palencia', slug: 'palencia' },
        { name: 'Soria', slug: 'soria' },
    ]},
    { name: 'Cataluña', code: 'CT', localities: [
        { name: 'Barcelona', slug: 'barcelona' }, { name: 'Tarragona', slug: 'tarragona' },
        { name: 'Girona', slug: 'girona' }, { name: 'Lleida', slug: 'lleida' },
        { name: 'Hospitalet de Llobregat', slug: 'hospitalet' }, { name: 'Terrassa', slug: 'terrassa' },
        { name: 'Badalona', slug: 'badalona' }, { name: 'Sabadell', slug: 'sabadell' },
    ]},
    { name: 'Comunidad Valenciana', code: 'VC', localities: [
        { name: 'Valencia', slug: 'valencia' }, { name: 'Alicante', slug: 'alicante' },
        { name: 'Castellón', slug: 'castellon' }, { name: 'Elche', slug: 'elche' },
        { name: 'Torrevieja', slug: 'torrevieja' }, { name: 'Benidorm', slug: 'benidorm' },
    ]},
    { name: 'Extremadura', code: 'EX', localities: [
        { name: 'Badajoz', slug: 'badajoz' }, { name: 'Cáceres', slug: 'caceres' },
        { name: 'Mérida', slug: 'merida' },
    ]},
    { name: 'Galicia', code: 'GA', localities: [
        { name: 'Vigo', slug: 'vigo' }, { name: 'A Coruña', slug: 'a-coruna' },
        { name: 'Santiago de Compostela', slug: 'santiago-de-compostela' },
        { name: 'Pontevedra', slug: 'pontevedra' }, { name: 'Lugo', slug: 'lugo' },
        { name: 'Ourense', slug: 'ourense' },
    ]},
    { name: 'La Rioja', code: 'RI', localities: [
        { name: 'Logroño', slug: 'logrono' }, { name: 'Calahorra', slug: 'calahorra' },
    ]},
    { name: 'Comunidad de Madrid', code: 'MD', localities: [
        { name: 'Madrid', slug: 'madrid' }, { name: 'Alcalá de Henares', slug: 'alcala-de-henares' },
        { name: 'Getafe', slug: 'getafe' }, { name: 'Móstoles', slug: 'mostoles' },
        { name: 'Alcorcón', slug: 'alcorcon' }, { name: 'Leganés', slug: 'leganes' },
        { name: 'Fuenlabrada', slug: 'fuenlabrada' }, { name: 'Torrejón de Ardoz', slug: 'torrejon-de-ardoz' },
    ]},
    { name: 'Región de Murcia', code: 'MC', localities: [
        { name: 'Murcia', slug: 'murcia' }, { name: 'Cartagena', slug: 'cartagena-es' },
        { name: 'Lorca', slug: 'lorca' },
    ]},
    { name: 'Navarra', code: 'NC', localities: [
        { name: 'Pamplona', slug: 'pamplona' }, { name: 'Tudela', slug: 'tudela' },
    ]},
    { name: 'País Vasco', code: 'PV', localities: [
        { name: 'Bilbao', slug: 'bilbao' }, { name: 'San Sebastián', slug: 'san-sebastian' },
        { name: 'Vitoria-Gasteiz', slug: 'vitoria' }, { name: 'Barakaldo', slug: 'barakaldo' },
    ]},
  ],
};
```

---

#### `us.seed.ts` — Estados Unidos (50 estados + DC + ciudades principales)

```typescript
export const US_SEED = {
  country: {
    code: 'us', name: 'United States', currency: 'USD',
    locale: 'en-US', timezone: 'America/New_York',
    gateway: 'STRIPE', regionLabel: 'State', localityLabel: 'City',
  },
  regions: [
    { name: 'Alabama', code: 'AL', localities: [
        { name: 'Birmingham', slug: 'birmingham-al' }, { name: 'Montgomery', slug: 'montgomery' },
        { name: 'Huntsville', slug: 'huntsville' }, { name: 'Mobile', slug: 'mobile' },
    ]},
    { name: 'Alaska', code: 'AK', localities: [
        { name: 'Anchorage', slug: 'anchorage' }, { name: 'Fairbanks', slug: 'fairbanks' },
        { name: 'Juneau', slug: 'juneau' },
    ]},
    { name: 'Arizona', code: 'AZ', localities: [
        { name: 'Phoenix', slug: 'phoenix' }, { name: 'Tucson', slug: 'tucson' },
        { name: 'Mesa', slug: 'mesa' }, { name: 'Scottsdale', slug: 'scottsdale' },
    ]},
    { name: 'Arkansas', code: 'AR', localities: [
        { name: 'Little Rock', slug: 'little-rock' }, { name: 'Fort Smith', slug: 'fort-smith' },
    ]},
    { name: 'California', code: 'CA', localities: [
        { name: 'Los Angeles', slug: 'los-angeles-ca' }, { name: 'San Francisco', slug: 'san-francisco' },
        { name: 'San Diego', slug: 'san-diego' }, { name: 'San Jose', slug: 'san-jose-ca' },
        { name: 'Sacramento', slug: 'sacramento' }, { name: 'Fresno', slug: 'fresno' },
        { name: 'Long Beach', slug: 'long-beach' }, { name: 'Oakland', slug: 'oakland' },
    ]},
    { name: 'Colorado', code: 'CO', localities: [
        { name: 'Denver', slug: 'denver' }, { name: 'Colorado Springs', slug: 'colorado-springs' },
        { name: 'Aurora', slug: 'aurora-co' }, { name: 'Boulder', slug: 'boulder' },
    ]},
    { name: 'Connecticut', code: 'CT', localities: [
        { name: 'Bridgeport', slug: 'bridgeport' }, { name: 'New Haven', slug: 'new-haven' },
        { name: 'Hartford', slug: 'hartford' },
    ]},
    { name: 'Delaware', code: 'DE', localities: [
        { name: 'Wilmington', slug: 'wilmington-de' }, { name: 'Dover', slug: 'dover' },
    ]},
    { name: 'District of Columbia', code: 'DC', localities: [
        { name: 'Washington', slug: 'washington-dc' },
    ]},
    { name: 'Florida', code: 'FL', localities: [
        { name: 'Miami', slug: 'miami' }, { name: 'Orlando', slug: 'orlando' },
        { name: 'Tampa', slug: 'tampa' }, { name: 'Jacksonville', slug: 'jacksonville' },
        { name: 'Fort Lauderdale', slug: 'fort-lauderdale' }, { name: 'Naples', slug: 'naples-fl' },
    ]},
    { name: 'Georgia', code: 'GA', localities: [
        { name: 'Atlanta', slug: 'atlanta' }, { name: 'Augusta', slug: 'augusta' },
        { name: 'Savannah', slug: 'savannah' },
    ]},
    { name: 'Hawaii', code: 'HI', localities: [
        { name: 'Honolulu', slug: 'honolulu' }, { name: 'Hilo', slug: 'hilo' },
    ]},
    { name: 'Idaho', code: 'ID', localities: [
        { name: 'Boise', slug: 'boise' }, { name: 'Nampa', slug: 'nampa' },
    ]},
    { name: 'Illinois', code: 'IL', localities: [
        { name: 'Chicago', slug: 'chicago' }, { name: 'Aurora', slug: 'aurora-il' },
        { name: 'Rockford', slug: 'rockford' }, { name: 'Joliet', slug: 'joliet' },
    ]},
    { name: 'Indiana', code: 'IN', localities: [
        { name: 'Indianapolis', slug: 'indianapolis' }, { name: 'Fort Wayne', slug: 'fort-wayne' },
        { name: 'Evansville', slug: 'evansville' },
    ]},
    { name: 'Iowa', code: 'IA', localities: [
        { name: 'Des Moines', slug: 'des-moines' }, { name: 'Cedar Rapids', slug: 'cedar-rapids' },
    ]},
    { name: 'Kansas', code: 'KS', localities: [
        { name: 'Wichita', slug: 'wichita' }, { name: 'Overland Park', slug: 'overland-park' },
        { name: 'Kansas City', slug: 'kansas-city-ks' },
    ]},
    { name: 'Kentucky', code: 'KY', localities: [
        { name: 'Louisville', slug: 'louisville' }, { name: 'Lexington', slug: 'lexington' },
    ]},
    { name: 'Louisiana', code: 'LA', localities: [
        { name: 'New Orleans', slug: 'new-orleans' }, { name: 'Baton Rouge', slug: 'baton-rouge' },
        { name: 'Shreveport', slug: 'shreveport' },
    ]},
    { name: 'Maine', code: 'ME', localities: [
        { name: 'Portland', slug: 'portland-me' }, { name: 'Augusta', slug: 'augusta-me' },
    ]},
    { name: 'Maryland', code: 'MD', localities: [
        { name: 'Baltimore', slug: 'baltimore' }, { name: 'Rockville', slug: 'rockville' },
        { name: 'Frederick', slug: 'frederick' },
    ]},
    { name: 'Massachusetts', code: 'MA', localities: [
        { name: 'Boston', slug: 'boston' }, { name: 'Worcester', slug: 'worcester' },
        { name: 'Springfield', slug: 'springfield-ma' }, { name: 'Cambridge', slug: 'cambridge-ma' },
    ]},
    { name: 'Michigan', code: 'MI', localities: [
        { name: 'Detroit', slug: 'detroit' }, { name: 'Grand Rapids', slug: 'grand-rapids' },
        { name: 'Ann Arbor', slug: 'ann-arbor' }, { name: 'Lansing', slug: 'lansing' },
    ]},
    { name: 'Minnesota', code: 'MN', localities: [
        { name: 'Minneapolis', slug: 'minneapolis' }, { name: 'Saint Paul', slug: 'saint-paul' },
        { name: 'Rochester', slug: 'rochester-mn' },
    ]},
    { name: 'Mississippi', code: 'MS', localities: [
        { name: 'Jackson', slug: 'jackson-ms' }, { name: 'Gulfport', slug: 'gulfport' },
    ]},
    { name: 'Missouri', code: 'MO', localities: [
        { name: 'Kansas City', slug: 'kansas-city-mo' }, { name: 'St. Louis', slug: 'st-louis' },
        { name: 'Springfield', slug: 'springfield-mo' },
    ]},
    { name: 'Montana', code: 'MT', localities: [
        { name: 'Billings', slug: 'billings' }, { name: 'Missoula', slug: 'missoula' },
    ]},
    { name: 'Nebraska', code: 'NE', localities: [
        { name: 'Omaha', slug: 'omaha' }, { name: 'Lincoln', slug: 'lincoln-ne' },
    ]},
    { name: 'Nevada', code: 'NV', localities: [
        { name: 'Las Vegas', slug: 'las-vegas' }, { name: 'Reno', slug: 'reno' },
        { name: 'Henderson', slug: 'henderson' },
    ]},
    { name: 'New Hampshire', code: 'NH', localities: [
        { name: 'Manchester', slug: 'manchester-nh' }, { name: 'Nashua', slug: 'nashua' },
    ]},
    { name: 'New Jersey', code: 'NJ', localities: [
        { name: 'Newark', slug: 'newark' }, { name: 'Jersey City', slug: 'jersey-city' },
        { name: 'Trenton', slug: 'trenton' }, { name: 'Hoboken', slug: 'hoboken' },
    ]},
    { name: 'New Mexico', code: 'NM', localities: [
        { name: 'Albuquerque', slug: 'albuquerque' }, { name: 'Santa Fe', slug: 'santa-fe-nm' },
        { name: 'Las Cruces', slug: 'las-cruces' },
    ]},
    { name: 'New York', code: 'NY', localities: [
        { name: 'New York City', slug: 'new-york-city' }, { name: 'Buffalo', slug: 'buffalo' },
        { name: 'Rochester', slug: 'rochester-ny' }, { name: 'Yonkers', slug: 'yonkers' },
        { name: 'Albany', slug: 'albany' }, { name: 'Brooklyn', slug: 'brooklyn' },
    ]},
    { name: 'North Carolina', code: 'NC', localities: [
        { name: 'Charlotte', slug: 'charlotte' }, { name: 'Raleigh', slug: 'raleigh' },
        { name: 'Greensboro', slug: 'greensboro' }, { name: 'Durham', slug: 'durham' },
    ]},
    { name: 'North Dakota', code: 'ND', localities: [
        { name: 'Fargo', slug: 'fargo' }, { name: 'Bismarck', slug: 'bismarck' },
    ]},
    { name: 'Ohio', code: 'OH', localities: [
        { name: 'Columbus', slug: 'columbus-oh' }, { name: 'Cleveland', slug: 'cleveland' },
        { name: 'Cincinnati', slug: 'cincinnati' }, { name: 'Toledo', slug: 'toledo-oh' },
    ]},
    { name: 'Oklahoma', code: 'OK', localities: [
        { name: 'Oklahoma City', slug: 'oklahoma-city' }, { name: 'Tulsa', slug: 'tulsa' },
    ]},
    { name: 'Oregon', code: 'OR', localities: [
        { name: 'Portland', slug: 'portland-or' }, { name: 'Salem', slug: 'salem-or' },
        { name: 'Eugene', slug: 'eugene' },
    ]},
    { name: 'Pennsylvania', code: 'PA', localities: [
        { name: 'Philadelphia', slug: 'philadelphia' }, { name: 'Pittsburgh', slug: 'pittsburgh' },
        { name: 'Allentown', slug: 'allentown' }, { name: 'Harrisburg', slug: 'harrisburg' },
    ]},
    { name: 'Rhode Island', code: 'RI', localities: [
        { name: 'Providence', slug: 'providence' }, { name: 'Cranston', slug: 'cranston' },
    ]},
    { name: 'South Carolina', code: 'SC', localities: [
        { name: 'Charleston', slug: 'charleston-sc' }, { name: 'Columbia', slug: 'columbia-sc' },
        { name: 'Greenville', slug: 'greenville-sc' },
    ]},
    { name: 'South Dakota', code: 'SD', localities: [
        { name: 'Sioux Falls', slug: 'sioux-falls' }, { name: 'Rapid City', slug: 'rapid-city' },
    ]},
    { name: 'Tennessee', code: 'TN', localities: [
        { name: 'Nashville', slug: 'nashville' }, { name: 'Memphis', slug: 'memphis' },
        { name: 'Knoxville', slug: 'knoxville' }, { name: 'Chattanooga', slug: 'chattanooga' },
    ]},
    { name: 'Texas', code: 'TX', localities: [
        { name: 'Houston', slug: 'houston' }, { name: 'San Antonio', slug: 'san-antonio-tx' },
        { name: 'Dallas', slug: 'dallas' }, { name: 'Austin', slug: 'austin' },
        { name: 'Fort Worth', slug: 'fort-worth' }, { name: 'El Paso', slug: 'el-paso' },
    ]},
    { name: 'Utah', code: 'UT', localities: [
        { name: 'Salt Lake City', slug: 'salt-lake-city' }, { name: 'West Valley City', slug: 'west-valley-city' },
        { name: 'Provo', slug: 'provo' },
    ]},
    { name: 'Vermont', code: 'VT', localities: [
        { name: 'Burlington', slug: 'burlington-vt' }, { name: 'Montpelier', slug: 'montpelier' },
    ]},
    { name: 'Virginia', code: 'VA', localities: [
        { name: 'Virginia Beach', slug: 'virginia-beach' }, { name: 'Norfolk', slug: 'norfolk' },
        { name: 'Richmond', slug: 'richmond-va' }, { name: 'Arlington', slug: 'arlington-va' },
    ]},
    { name: 'Washington', code: 'WA', localities: [
        { name: 'Seattle', slug: 'seattle' }, { name: 'Spokane', slug: 'spokane' },
        { name: 'Tacoma', slug: 'tacoma' }, { name: 'Bellevue', slug: 'bellevue' },
    ]},
    { name: 'West Virginia', code: 'WV', localities: [
        { name: 'Charleston', slug: 'charleston-wv' }, { name: 'Huntington', slug: 'huntington-wv' },
    ]},
    { name: 'Wisconsin', code: 'WI', localities: [
        { name: 'Milwaukee', slug: 'milwaukee' }, { name: 'Madison', slug: 'madison' },
        { name: 'Green Bay', slug: 'green-bay' },
    ]},
    { name: 'Wyoming', code: 'WY', localities: [
        { name: 'Cheyenne', slug: 'cheyenne' }, { name: 'Casper', slug: 'casper' },
    ]},
  ],
};
```

### 4.4 Nuevo Módulo: `payments` (Backend)

**Archivos a crear:**

```
backend/src/modules/payments/
├── payments.module.ts
├── payments.controller.ts    ← POST /payments/webhook/mercadopago, POST /payments/webhook/stripe
├── payments.service.ts       ← resuelve qué gateway usar según country.gateway
└── gateways/
    ├── payment-gateway.interface.ts
    ├── mercadopago.gateway.ts
    └── stripe.gateway.ts
```

**Interface del gateway:**

```typescript
// payment-gateway.interface.ts
export interface IPaymentGateway {
  createPreference(params: CreatePreferenceParams): Promise<PaymentPreferenceResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatusResult>;
}

export interface CreatePreferenceParams {
  amount: number;
  currency: string;
  description: string;
  serviceId: string;
  durationMonths: number;
  payerEmail: string;
  countryCode: string;
  successUrl: string;
  failureUrl: string;
}

export interface PaymentPreferenceResult {
  preferenceId: string;
  initPoint: string;      // URL de pago (MP) o client_secret (Stripe)
  gateway: 'MERCADOPAGO' | 'STRIPE';
}
```

**Resolución de gateway:**

```typescript
// payments.service.ts
resolveGateway(countryCode: string): IPaymentGateway {
  const mpCountries = ['cl', 'ar', 'uy'];
  const stripeCountries = ['es', 'us'];
  if (mpCountries.includes(countryCode)) return this.mercadoPagoGateway;
  if (stripeCountries.includes(countryCode)) return this.stripeGateway;
  throw new BadRequestException(`País ${countryCode} sin gateway configurado`);
}
```

**MercadoPagoGateway — selección de token por país:**

```typescript
// mercadopago.gateway.ts
private getClient(countryCode: string): MercadoPagoConfig {
  const tokens: Record<string, string> = {
    cl: this.configService.get('MP_ACCESS_TOKEN_CL'),
    ar: this.configService.get('MP_ACCESS_TOKEN_AR'),
    uy: this.configService.get('MP_ACCESS_TOKEN_UY'),
  };
  const token = tokens[countryCode];
  if (!token) throw new InternalServerErrorException(`MP_ACCESS_TOKEN_${countryCode.toUpperCase()} no configurado`);
  return new MercadoPagoConfig({ accessToken: token });
}
```

### 4.5 Modificaciones a Módulos Existentes

**`backend/src/modules/services/dto/query-services.dto.ts`:**

```typescript
// AGREGAR estos campos
@IsOptional()
@IsString()
@Length(2, 2)
countryCode?: string;    // "cl", "ar", etc.

@IsOptional()
@IsString()
regionCode?: string;

@IsOptional()
@IsString()
localitySlug?: string;

// MANTENER para compatibilidad:
// commune?: string  (deprecado, usar localitySlug)
```

**`backend/src/modules/services/services.service.ts` — `findAll()`:**

```typescript
const where: Prisma.ServiceWhereInput = {
  active: true,
  endDate: { gte: new Date() },
  ...(query.countryCode && { country: { code: query.countryCode } }),
  ...(query.regionCode && { region: { code: query.regionCode } }),
  ...(query.localitySlug && { locality: { slug: query.localitySlug } }),
  // Compatibilidad legacy:
  ...(query.comuna && !query.localitySlug && { commune: query.comuna }),
};
```

**`backend/src/modules/services/dto/create-service.dto.ts`:**

```typescript
// AGREGAR:
@IsString()
@Length(2, 2)
countryCode: string;

@IsOptional()
@IsString()
regionCode?: string;

@IsOptional()
@IsString()
localitySlug?: string;
```

**`backend/src/modules/subscriptions/dto/create-subscription.dto.ts`:**

```typescript
@IsString()
@Length(2, 2)
countryCode: string;
```

**`backend/src/modules/subscriptions/subscriptions.service.ts` — `create()`:**

Resolver gateway según `countryCode`, buscar precio por `countryId + durationMonths`, guardar `currency` y `paymentGateway` en la suscripción.

**`backend/src/modules/prices/prices.service.ts`:**

```typescript
// NUEVO método (reemplaza findByDuracion):
findByCountryAndDuration(countryId: string, durationMonths: number) {
  return this.prisma.premiumPrice.findUnique({
    where: { countryId_durationMonths: { countryId, durationMonths } },
  });
}

// NUEVO método para frontend:
findAllByCountry(countryCode: string) {
  return this.prisma.premiumPrice.findMany({
    where: { active: true, country: { code: countryCode } },
    orderBy: { durationMonths: 'asc' },
  });
}
```

**Nuevo guard:** `backend/src/common/guards/country-admin.guard.ts`

```typescript
@Injectable()
export class CountryAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.roles.includes('SuperAdministrador')) return true;
    const requestedCountry =
      request.params.countryCode ||
      request.query.countryCode ||
      request.body?.countryCode;
    return user.adminCountries?.includes(requestedCountry) ?? false;
  }
}
```

---

## 5. Fase B — Frontend: Routing Multi-País

### 5.1 Nueva Estructura de Rutas

```
frontend/src/app/
├── layout.tsx                                    ← Layout raíz (sin geo)
├── page.tsx                                      ← Redirect → detectar país → /[country]
├── (country)/
│   └── [country]/                                ← "cl", "ar", "uy", "es", "us"
│       ├── layout.tsx                            ← CountryLayout: valida + CountryProvider
│       ├── (public)/
│       │   ├── page.tsx                          ← /cl (home)
│       │   ├── buscar/page.tsx
│       │   ├── servicio/[slug]/page.tsx
│       │   ├── publicar/page.tsx
│       │   ├── login/page.tsx
│       │   ├── registro/page.tsx
│       │   ├── perfil/page.tsx
│       │   ├── suscripcion-pro/page.tsx
│       │   └── (estaticas)/
│       │       ├── como-funciona/
│       │       ├── contacto/
│       │       ├── privacidad/
│       │       ├── terminos/
│       │       ├── ayuda/
│       │       └── quienes-somos/
│       └── (admin)/
│           └── admin/
│               ├── layout.tsx                    ← Valida admin con scope de país
│               ├── page.tsx
│               ├── servicios/
│               ├── usuarios/
│               ├── categorias/
│               ├── calificaciones/
│               ├── pagos/
│               ├── precios-premium/
│               ├── sponsors/
│               └── interacciones/
└── api/
    ├── auth/[...nextauth]/route.ts
    ├── upload/route.ts
    ├── country-detect/route.ts                   ← NUEVO: fallback IP detection
    └── webhooks/
        ├── mercadopago/route.ts                  ← Modificado: token por país
        └── stripe/route.ts                       ← NUEVO
```

### 5.2 proxy.ts — Detección y Redirección (Next.js 16)

> **IMPORTANTE:** Next.js 16 depreca `middleware.ts` y adopta `proxy.ts` como convención oficial.
> El proyecto ya usa `proxy.ts` correctamente. Se **modifica** el archivo existente para agregar
> la lógica multi-país, manteniendo la protección de rutas auth ya implementada.
> Runtime: **solo Node.js** (Edge Runtime fue removido en Next.js 16).

**Archivo MODIFICADO:** `frontend/src/proxy.ts`

```typescript
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const SUPPORTED_COUNTRIES = ['cl', 'ar', 'uy', 'es', 'us'];
const DEFAULT_COUNTRY = 'cl';

const BYPASS_PREFIXES = ['/api', '/_next', '/favicon', '/manifest', '/robots', '/sitemap'];

// Rutas legacy (sin prefijo de país) → redirigir a /cl/...
const LEGACY_PATHS = [
    '/buscar', '/publicar', '/login', '/registro', '/perfil',
    '/servicio', '/suscripcion-pro', '/unauthorized', '/admin',
    '/como-funciona', '/contacto', '/privacidad', '/terminos',
    '/ayuda', '/quienes-somos',
];

// Rutas protegidas por rol (dentro de /:country/)
const routeRoles: Record<string, string[]> = {
    '/admin': ['SuperAdministrador'],
    '/perfil': ['Usuario', 'SuperAdministrador'],
};

function checkAccess(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Lógica de ruteo compleja
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Bypass completo para assets/api
    if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // 2. Redirects legacy → /cl/...
    const isLegacy = LEGACY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isLegacy) {
        return NextResponse.redirect(new URL(`/cl${pathname}`, req.url), 301);
    }

    // 3. Redirect raíz → /:country detectado
    if (pathname === '/') {
        const country = detectCountry(req);
        return NextResponse.redirect(new URL(`/${country}`, req.url), 302);
    }

    // 4. Validar país soportado
    const firstSegment = pathname.split('/')[1];
    if (!SUPPORTED_COUNTRIES.includes(firstSegment)) {
        return NextResponse.next();
    }

    // 5. Protección de rutas auth (con prefijo /:country/)
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const pathWithoutCountry = '/' + pathname.split('/').slice(2).join('/');

    if (token?.error === 'RefreshTokenExpired') {
        if (!pathWithoutCountry.startsWith('/login')) {
            return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
        }
        return NextResponse.next();
    }

    if (pathWithoutCountry.startsWith('/admin')) {
        if (!token) return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
        const userRoles = (token.roles as string[]) || [];
        if (!checkAccess(userRoles, routeRoles['/admin'])) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
        // CountryAdminGuard: Administrador solo accede a su país
        if (
            !userRoles.includes('SuperAdministrador') &&
            token.adminCountries &&
            !(token.adminCountries as string[]).includes(firstSegment)
        ) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
    }

    if (pathWithoutCountry.startsWith('/perfil')) {
        if (!token) return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
        const userRoles = (token.roles as string[]) || [];
        if (!checkAccess(userRoles, routeRoles['/perfil'])) {
            return NextResponse.redirect(new URL(`/${firstSegment}/unauthorized`, req.url));
        }
    }

    if (pathWithoutCountry.startsWith('/publicar')) {
        if (!token) return NextResponse.redirect(new URL(`/${firstSegment}/login`, req.url));
    }

    if (pathWithoutCountry === '/login' && token) {
        const userRoles = (token.roles as string[]) || [];
        if (userRoles.includes('SuperAdministrador')) {
            return NextResponse.redirect(new URL(`/${firstSegment}/admin`, req.url));
        }
        return NextResponse.redirect(new URL(`/${firstSegment}/perfil`, req.url));
    }

    return NextResponse.next();
}

function detectCountry(request: NextRequest): string {
    // 1. Cookie de preferencia del usuario
    const cookie = request.cookies.get('atlas_country')?.value;
    if (cookie && SUPPORTED_COUNTRIES.includes(cookie)) return cookie;

    // 2. Cloudflare header (producción)
    const cf = request.headers.get('cf-ipcountry')?.toLowerCase();
    if (cf && SUPPORTED_COUNTRIES.includes(cf)) return cf;

    // 3. Vercel header (producción)
    const vercel = request.headers.get('x-vercel-ip-country')?.toLowerCase();
    if (vercel && SUPPORTED_COUNTRIES.includes(vercel)) return vercel;

    // 4. Accept-Language heurística
    const lang = request.headers.get('accept-language') || '';
    if (lang.includes('es-AR')) return 'ar';
    if (lang.includes('es-UY')) return 'uy';
    if (lang.includes('es-ES')) return 'es';
    if (lang.includes('en-US') || lang.includes('en-us')) return 'us';

    // 5. Fallback: Chile (MVP market)
    return DEFAULT_COUNTRY;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 5.3 CountryProvider y Contexto

**Archivo NUEVO:** `frontend/src/lib/providers/CountryProvider.tsx`

```typescript
'use client';

import { createContext, useContext } from 'react';

export interface CountryConfig {
  code: string;           // "cl"
  name: string;           // "Chile"
  currency: string;       // "CLP"
  locale: string;         // "es-CL"
  timezone: string;       // "America/Santiago"
  gateway: 'MERCADOPAGO' | 'STRIPE';
  regionLabel: string;    // "Región"
  localityLabel: string;  // "Comuna"
}

const CountryContext = createContext<CountryConfig | null>(null);

export function CountryProvider({
  children,
  countryConfig,
}: {
  children: React.ReactNode;
  countryConfig: CountryConfig;
}) {
  return (
    <CountryContext.Provider value={countryConfig}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): CountryConfig {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used inside CountryProvider');
  return ctx;
}
```

### 5.4 CountryLayout

**Archivo NUEVO:** `frontend/src/app/(country)/[country]/layout.tsx`

```typescript
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CountryProvider } from '@/lib/providers/CountryProvider';
import { getCountryConfig } from '@/features/geo/actions/queries';
import { COUNTRY_SEO_CONFIG } from '@/features/geo/lib/countryUtils';

const VALID_COUNTRIES = ['cl', 'ar', 'uy', 'es', 'us'];

export function generateStaticParams() {
  return VALID_COUNTRIES.map(country => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const seo = COUNTRY_SEO_CONFIG[country];
  if (!seo) return {};

  return {
    metadataBase: new URL(seo.url),
    title: { default: seo.siteName, template: `%s | ${seo.siteName}` },
    description: seo.description,
    other: { 'geo.region': seo.geoRegion, 'DC.language': seo.locale },
    openGraph: { locale: seo.ogLocale },
    alternates: {
      canonical: seo.url,
      languages: {
        'es-CL': process.env.NEXT_PUBLIC_APP_URL_CL!,
        'es-AR': process.env.NEXT_PUBLIC_APP_URL_AR!,
        'es-UY': process.env.NEXT_PUBLIC_APP_URL_UY!,
        'es-ES': process.env.NEXT_PUBLIC_APP_URL_ES!,
        'en-US': process.env.NEXT_PUBLIC_APP_URL_US!,
      },
    },
  };
}

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  if (!VALID_COUNTRIES.includes(country)) notFound();

  const countryConfig = await getCountryConfig(country);
  if (!countryConfig) notFound();

  return (
    <CountryProvider countryConfig={countryConfig}>
      {children}
    </CountryProvider>
  );
}
```

---

## 6. Fase C — Frontend: Features y Componentes

### 6.1 Nueva Feature: `geo`

```
frontend/src/features/geo/
├── actions/
│   ├── index.ts
│   └── queries.ts         ← getCountryConfig, getRegionsByCountry, getLocalitiesByRegion
├── components/
│   ├── CountrySwitcher.tsx ← selector de país en Navbar
│   └── LocalitySelect.tsx  ← reemplaza select de comunas hardcoded
├── types/
│   └── geoTypes.ts
└── lib/
    └── countryUtils.ts     ← formatPrice, COUNTRY_CONFIG, COUNTRY_SEO_CONFIG
```

**`countryUtils.ts` — funciones clave:**

```typescript
export const COUNTRY_CONFIG = {
  cl: { currency: 'CLP', locale: 'es-CL', currencySymbol: '$', localityLabel: 'Comuna', regionLabel: 'Región' },
  ar: { currency: 'ARS', locale: 'es-AR', currencySymbol: '$', localityLabel: 'Localidad', regionLabel: 'Provincia' },
  uy: { currency: 'UYU', locale: 'es-UY', currencySymbol: '$', localityLabel: 'Localidad', regionLabel: 'Departamento' },
  es: { currency: 'EUR', locale: 'es-ES', currencySymbol: '€', localityLabel: 'Municipio', regionLabel: 'C. Autónoma' },
  us: { currency: 'USD', locale: 'en-US', currencySymbol: '$', localityLabel: 'City', regionLabel: 'State' },
};

export function formatPrice(amount: number, countryCode: string): string {
  const config = COUNTRY_CONFIG[countryCode];
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: countryCode === 'cl' ? 0 : 2,
  }).format(amount);
}
```

**`LocalitySelect.tsx`** — reemplaza el select de comunas hardcoded:
- Recibe el `country` del `CountryContext`
- Carga regiones al montar (query a `GET /geo/countries/:code/regions`)
- Al seleccionar región, carga localidades (query a `GET /geo/regions/:id/localities`)
- Devuelve `{ localitySlug, localityName, regionCode }`

### 6.2 Actualización del Schema Zod de Servicios

**Archivo:** `frontend/src/features/services/schemas/servicioSchemas.ts`

```typescript
// ELIMINAR: z.object({ ... comuna: z.string() ... })
// REEMPLAZAR commune handling por:
export const servicioCreateSchema = z.object({
  // ... campos existentes ...
  countryCode: z.string().length(2, 'Código de país inválido'),
  regionCode: z.string().optional(),
  localitySlug: z.string().optional(),
  commune: z.string().min(1, 'Localidad es requerida'), // nombre textual para display
});
```

### 6.3 PaymentRouter — Componente Inteligente de Pagos

**Archivo NUEVO:** `frontend/src/features/payments/components/PaymentRouter.tsx`

```typescript
'use client';
import { useCountry } from '@/lib/providers/CountryProvider';
import PaymentBrickMP from './PaymentBrickMP';
import PaymentBrickStripe from './PaymentBrickStripe';

export default function PaymentRouter(props: PaymentRouterProps) {
  const { gateway, code } = useCountry();
  if (gateway === 'MERCADOPAGO') return <PaymentBrickMP {...props} countryCode={code} />;
  return <PaymentBrickStripe {...props} countryCode={code} />;
}
```

**Renombrar:** `PaymentBrick.tsx` → `PaymentBrickMP.tsx` con estas modificaciones:
- Recibe `countryCode: string`
- Selecciona public key del env: `NEXT_PUBLIC_MP_PUBLIC_KEY_{CL|AR|UY}`
- Usa `locale` del `CountryConfig`

**Archivo NUEVO:** `frontend/src/features/payments/components/PaymentBrickStripe.tsx`
Implementa Stripe Payment Element con `loadStripe(publishableKey)`.

### 6.4 Webhooks Actualizados

**`frontend/src/app/api/webhooks/mercadopago/route.ts` — modificación:**

```typescript
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country') || 'cl';

  const tokenMap: Record<string, string | undefined> = {
    cl: process.env.MP_ACCESS_TOKEN_CL,
    ar: process.env.MP_ACCESS_TOKEN_AR,
    uy: process.env.MP_ACCESS_TOKEN_UY,
  };

  const accessToken = tokenMap[countryCode];
  if (!accessToken) return NextResponse.json({ error: 'País no soportado' }, { status: 400 });

  const client = new MercadoPagoConfig({ accessToken });
  // ... resto igual al handler actual
}
```

**Archivo NUEVO:** `frontend/src/app/api/webhooks/stripe/route.ts`
Handler de webhooks Stripe con verificación de firma (`stripe.webhooks.constructEvent`).

### 6.5 Componentes con Precios a Actualizar

Todos deben usar `formatPrice(amount, countryCode)` de `countryUtils.ts`:

- `frontend/src/app/(country)/[country]/(public)/suscripcion-pro/page.tsx`
- `frontend/src/features/payments/components/PaymentBrickMP.tsx`
- `frontend/src/features/services/components/cards/ServiceCard.tsx`
- `frontend/src/features/services/publish/components/Paso4SeleccionarDuracion.tsx`

---

## 7. Pasarelas de Pago por País

### Tabla de routing

| País | Código | Gateway | Moneda |
|------|--------|---------|--------|
| Chile | cl | MercadoPago | CLP |
| Argentina | ar | MercadoPago | ARS |
| Uruguay | uy | MercadoPago | UYU |
| España | es | Stripe | EUR |
| Estados Unidos | us | Stripe | USD |

### Configuración de webhooks en cada plataforma

**MercadoPago** — configurar 3 webhooks (uno por país):
- URL: `https://tu-dominio.com/api/webhooks/mercadopago?country=cl`
- URL: `https://tu-dominio.com/api/webhooks/mercadopago?country=ar`
- URL: `https://tu-dominio.com/api/webhooks/mercadopago?country=uy`

**Stripe** — configurar 2 endpoints (o 1 con países en metadata):
- URL: `https://tu-dominio.com/api/webhooks/stripe`

### Flujo de pago completo

1. Usuario en `/cl/suscripcion-pro` → `useCountry()` devuelve `{ gateway: 'MERCADOPAGO', currency: 'CLP', code: 'cl' }`
2. Frontend llama a `POST /api/v1/subscriptions` con `{ countryCode: 'cl', ... }`
3. Backend resuelve `MercadoPagoGateway` con token CL, crea preferencia
4. Frontend renderiza `PaymentBrickMP` con public key CL
5. MP llama al webhook `?country=cl` → se procesa con token CL
6. Backend actualiza `Subscription.paymentStatus = 'completed'`, activa PREMIUM

---

## 8. SEO Multi-País

### Configuración por país en `countryUtils.ts`

```typescript
export const COUNTRY_SEO_CONFIG: Record<string, CountrySEOConfig> = {
  cl: {
    siteName: 'Atlas Servicios Chile',
    description: 'Encuentra electricistas, carpinteros, gasfíter y más en Chiloé y Chile',
    url: process.env.NEXT_PUBLIC_APP_URL_CL || 'https://www.atlasservicios.cl',
    geoRegion: 'CL-LL',
    locale: 'es-CL',
    ogLocale: 'es_CL',
    countryName: 'Chile',
  },
  ar: { ... locale: 'es-AR', currency: 'ARS', ... },
  uy: { ... locale: 'es-UY', currency: 'UYU', ... },
  es: { ... locale: 'es-ES', currency: 'EUR', ... },
  us: { ... locale: 'en-US', currency: 'USD', ... },
};
```

### Hreflang

El `generateMetadata` del `CountryLayout` genera automáticamente `<link rel="alternate" hreflang="...">` via el campo `alternates.languages` de Next.js.

### Sitemap

Modificar `frontend/src/app/(public)/sitemap.ts` para generar URLs por país con el dominio correcto.

### Schema.org

El JSON-LD Organization se genera dinámicamente en `CountryLayout` con `addressCountry: country.toUpperCase()` y `inLanguage: config.locale`.

---

## 9. Panel de Administración

### Roles y Acceso

| Rol | `countryId` en UserRole | Acceso |
|-----|------------------------|--------|
| `SuperAdministrador` | `null` | Todos los países, todas las funciones |
| `Administrador` | `<countryId>` | Solo ese país |

### Cambios en Admin UI

1. **CountryFilter en sidebar**: SuperAdmin puede seleccionar país o "Todos". AdminPais ve solo su país.
2. **Columna "País"** en todas las tablas (servicios, usuarios, pagos, etc.)
3. **Queries con scope**: `countryCode?: string` como parámetro opcional en todos los actions admin.
4. **CountryAdminGuard** en backend: verifica scope antes de retornar datos.

### JWT expandido para admins

El payload del token debe incluir `adminCountries: string[]` para validación en el `CountryAdminGuard`.

---

## 10. Consideraciones Adicionales

### Monedas y Formato

| País | Moneda | Decimales | Ejemplo |
|------|--------|-----------|---------|
| CL | CLP | 0 | $25.000 |
| AR | ARS | 2 | $1.500,00 |
| UY | UYU | 2 | $800,00 |
| ES | EUR | 2 | 45,00 € |
| US | USD | 2 | $35.00 |

Usar `Intl.NumberFormat` — sin dependencias extra.

### Timezones

Mostrar fechas (`createdAt`, `endDate`) en la timezone del país. Usar `Intl.DateTimeFormat` con `timeZone: countryConfig.timezone`.

### Terminología de Categorías por País

Los nombres de algunas categorías difieren por país. Estrategia: `ServiceCategory.countryCode` para variantes locales. Ejemplo: "Gasfíter" (CL) vs "Plomero" (AR/UY) vs "Fontanero" (ES) vs "Plumber" (US).

### Performance con Multi-País

- **Índice compuesto obligatorio**: `(countryId, level, featured, endDate)` en `Service` — ya incluido en el schema.
- **Cache tags por país**: `tags: ['servicios-cl']` en lugar de `tags: ['servicios']` globales.
- **ISR por ruta**: `revalidate: 60` para búsqueda, `revalidate: 300` para homes por país.
- **Geo endpoints cacheables agresivamente**: `revalidate: 86400` (1 día).

### Autenticación Cross-Country

Los usuarios son globales — el `userId` aplica en todos los países. Al crear un servicio, se envía `countryCode` en el payload. No hay sesiones separadas por país.

### Términos Legales por País

Las páginas `/[country]/privacidad` y `/[country]/terminos` deben tener contenido por país. Implementar como archivos `.mdx` por país o condicionales en el componente.

### Google Analytics / GTM

**Recomendado:** Variables de entorno `NEXT_PUBLIC_GTM_ID_CL`, `NEXT_PUBLIC_GTM_ID_AR`, etc. Renderizado condicional en `CountryLayout`.

### Dominio: ¿Único o Múltiple?

**Pendiente de decisión del usuario** (ver Sección 15). Afecta estrategia de cookies, CORS, SEO y facturación.

---

## 11. Variables de Entorno Completas

### Backend — `.env.example` actualizado

```bash
# Servidor
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=30d
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=

# MercadoPago — por país
MP_ACCESS_TOKEN_CL=APP_USR-...
MP_ACCESS_TOKEN_AR=APP_USR-...
MP_ACCESS_TOKEN_UY=APP_USR-...

# Stripe — por país
STRIPE_SECRET_KEY_ES=sk_...
STRIPE_SECRET_KEY_US=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Geolocalización IP (opcional — solo si no se usan headers Cloudflare/Vercel)
IP_API_KEY=
```

### Frontend — `.env.example` actualizado

```bash
# Backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_KEY=

# Auth
AUTH_SECRET=
AUTH_URL=http://localhost:3000

# MercadoPago — por país (public keys)
NEXT_PUBLIC_MP_PUBLIC_KEY_CL=APP_USR-...
NEXT_PUBLIC_MP_PUBLIC_KEY_AR=APP_USR-...
NEXT_PUBLIC_MP_PUBLIC_KEY_UY=APP_USR-...

# MercadoPago — por país (server tokens, solo server-side)
MP_ACCESS_TOKEN_CL=APP_USR-...
MP_ACCESS_TOKEN_AR=APP_USR-...
MP_ACCESS_TOKEN_UY=APP_USR-...

# Stripe — por país
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_ES=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_US=pk_...
STRIPE_SECRET_KEY_ES=sk_...
STRIPE_SECRET_KEY_US=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage y Email — sin cambios
BLOB_READ_WRITE_TOKEN=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
CONTACT_EMAIL=

# IA
GEMINI_API_KEY=

# URLs de producción por país (SEO, Sitemap, Schema.org)
NEXT_PUBLIC_APP_URL_CL=https://www.atlasservicios.cl
NEXT_PUBLIC_APP_URL_AR=https://www.atlasservicios.ar
NEXT_PUBLIC_APP_URL_UY=https://www.atlasservicios.uy
NEXT_PUBLIC_APP_URL_ES=https://www.atlasservicios.es
NEXT_PUBLIC_APP_URL_US=https://www.atlasservices.us
NEXT_PUBLIC_APP_URL=http://localhost:3000  # fallback desarrollo

# GTM por país (opcional)
NEXT_PUBLIC_GTM_ID_CL=GTM-XXXXXXX
NEXT_PUBLIC_GTM_ID_AR=GTM-XXXXXXX
NEXT_PUBLIC_GTM_ID_UY=GTM-XXXXXXX
NEXT_PUBLIC_GTM_ID_ES=GTM-XXXXXXX
NEXT_PUBLIC_GTM_ID_US=GTM-XXXXXXX
```

---

## 12. Orden de Implementación y Dependencias

```
Fase A — Backend (fundación):
  A1. Schema Prisma: Country, GeoRegion, GeoLocality + modificaciones a 6 modelos
  A2. Seed geográfico: 5 países con regiones y localidades
  A3. Migración de datos: servicios existentes → Chile
  A4. Módulo geo: controller + service + endpoints
  A5. Modificar PremiumPrice: countryId + nuevo unique constraint
  A6. Modificar PricesService: findByCountryAndDuration, findAllByCountry
  A7. Modificar Sponsor: countryId nullable
  A8. Modificar Service: countryId + regionId + localityId
  A9. Modificar ServicesService + QueryServicesDto: filtro por country
  A10. Modificar CreateServiceDto: countryCode + regionCode + localitySlug
  A11. Modificar SubscriptionsService: routing de pago
  A12. Módulo payments: IPaymentGateway + MercadoPagoGateway + StripeGateway
  A13. Modificar UserRole: countryId nullable
  A14. Crear CountryAdminGuard
  A15. Expandir JWT payload con adminCountries[]

Fase B — Frontend (routing):
  B1. Modificar proxy.ts: agregar routing multi-país + redirects 301 legacy + detección de país
  B2. Crear CountryProvider + useCountry hook
  B3. Crear [country]/layout.tsx: validación + CountryProvider + generateMetadata
  B4. Mover todas las páginas de (public) y (admin) al nuevo path [country]/
  B5. Actualizar todos los <Link href="..."> con prefijo /[country]
  B6. Mover páginas (estaticas) al nuevo path

Fase C — Frontend (features):
  C1. Crear feature geo: queries, LocalitySelect, CountrySwitcher, countryUtils
  C2. Actualizar servicioSchemas.ts: commune → countryCode + localitySlug
  C3. Actualizar PublicarWizard con LocalitySelect dinámico
  C4. Crear PaymentRouter + renombrar PaymentBrickMP + crear PaymentBrickStripe
  C5. Actualizar variables de entorno MP: una por país
  C6. Actualizar webhook MP para multi-país
  C7. Crear webhook Stripe
  C8. Actualizar queries de precios: pasar countryCode
  C9. Actualizar formateo de precios: formatPrice(amount, countryCode) en todo
  C10. Actualizar metadata SEO raíz: eliminar geo hardcoded de layout.tsx
  C11. Actualizar queries admin: aceptar countryCode
  C12. Actualizar admin layout: verificar scope de país
  C13. Agregar CountrySwitcher al Navbar

Dependencias críticas:
  A1 → A2 → A3 (orden estricto)
  A1+A2 → A4, A5, A7, A8, A9, A10 (en paralelo)
  A5 → A6 → A11
  A8+A9 → C2 → C3
  A11+A12 → C4 → C6+C7
  B2+B3 → B4 → B5+B6
  B2 → C9 (useCountry disponible)
  A4 → C1 (endpoints geo disponibles)
```

---

## 13. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Migración de datos rompe servicios existentes | Alto | Mantener `commune: String` denormalizado. FK `countryId` primero nullable → NOT NULL después del UPDATE masivo |
| Rutas legacy sin `/cl` rompen SEO y bookmarks | Alto | Redirects 301 en middleware desde día 1. Actualizar sitemap antes de deploy |
| Múltiples tokens MP mal configurados | Alto | Validar en startup (`MercadoPagoGateway.constructor()`) que las 3 env vars existen. Failfast explícito |
| Performance degradada con múltiples países | Medio | Índice compuesto `(countryId, level, featured, endDate)`. EXPLAIN ANALYZE antes de deploy |
| Admin confunde países en gestión | Medio | Badge de país en cada fila de tabla. `CountryAdminGuard` en backend como segunda línea |
| `PremiumPrice` unique constraint falla en migración | Medio | DROP constraint antiguo ANTES de agregar el nuevo en una sola migración transaccional |
| Stripe webhooks sin verificación de firma | Alto | `stripe.webhooks.constructEvent(payload, sig, secret)` es obligatorio — nunca omitir |
| Detección de país incorrecta en desarrollo | Bajo | `DEFAULT_COUNTRY = 'cl'` en desarrollo. Agregar flag `NEXT_PUBLIC_FORCE_COUNTRY=ar` para testing local |
| Links internos sin prefijo de país en componentes reutilizados | Medio | Crear hook `useCountryLink(path)` que antepone `/${countryCode}` automáticamente |

---

## 14. Inventario de Archivos a Crear/Modificar

### Backend — NUEVOS

```
backend/src/modules/geo/geo.module.ts
backend/src/modules/geo/geo.controller.ts
backend/src/modules/geo/geo.service.ts
backend/src/modules/geo/dto/country.dto.ts
backend/src/modules/geo/dto/geo-region.dto.ts
backend/src/modules/geo/dto/geo-locality.dto.ts
backend/src/modules/geo/seeds/geo.seed.ts
backend/src/modules/geo/seeds/cl.seed.ts
backend/src/modules/geo/seeds/ar.seed.ts
backend/src/modules/geo/seeds/uy.seed.ts
backend/src/modules/geo/seeds/es.seed.ts
backend/src/modules/geo/seeds/us.seed.ts
backend/src/modules/payments/payments.module.ts
backend/src/modules/payments/payments.service.ts
backend/src/modules/payments/payments.controller.ts
backend/src/modules/payments/gateways/payment-gateway.interface.ts
backend/src/modules/payments/gateways/mercadopago.gateway.ts
backend/src/modules/payments/gateways/stripe.gateway.ts
backend/src/common/guards/country-admin.guard.ts
```

### Backend — MODIFICADOS

```
backend/prisma/schema.prisma                                        ← +3 modelos, ~6 tablas modificadas
backend/src/modules/services/dto/create-service.dto.ts             ← +countryCode, regionCode, localitySlug
backend/src/modules/services/dto/query-services.dto.ts             ← +countryCode, regionCode, localitySlug
backend/src/modules/services/services.service.ts                   ← filtros por country en findAll
backend/src/modules/subscriptions/dto/create-subscription.dto.ts   ← +countryCode
backend/src/modules/subscriptions/subscriptions.service.ts         ← routing de pago
backend/src/modules/prices/prices.service.ts                       ← findByCountryAndDuration
backend/src/modules/auth/strategies/jwt.strategy.ts                ← +adminCountries en payload
backend/src/app.module.ts                                          ← importar GeoModule, PaymentsModule
backend/.env.example                                               ← tokens por país
```

### Frontend — MODIFICADO (routing)

```
frontend/src/proxy.ts  ← Agregar routing multi-país + redirects 301 + detección de país por IP/cookie
```

### Frontend — NUEVOS

```
frontend/src/lib/providers/CountryProvider.tsx
frontend/src/app/(country)/[country]/layout.tsx
frontend/src/app/(country)/[country]/(public)/page.tsx
frontend/src/features/geo/actions/index.ts
frontend/src/features/geo/actions/queries.ts
frontend/src/features/geo/components/CountrySwitcher.tsx
frontend/src/features/geo/components/LocalitySelect.tsx
frontend/src/features/geo/lib/countryUtils.ts
frontend/src/features/geo/types/geoTypes.ts
frontend/src/features/payments/components/PaymentRouter.tsx
frontend/src/features/payments/components/PaymentBrickStripe.tsx
frontend/src/app/api/webhooks/stripe/route.ts
```

### Frontend — MODIFICADOS (alto impacto)

```
frontend/src/app/layout.tsx                                         ← eliminar metadata geo hardcoded
frontend/src/app/page.tsx                                           ← redirect con detección de país
frontend/src/features/payments/components/PaymentBrick.tsx          ← renombrar a PaymentBrickMP.tsx
frontend/src/app/api/webhooks/mercadopago/route.ts                  ← token por country query param
frontend/src/shared/types/common.ts                                 ← eliminar enum Comuna
frontend/src/shared/constants/locations.ts                          ← eliminar comunaMap
frontend/src/features/services/lib/constants.ts                     ← eliminar COMUNAS_CHILOE
frontend/src/features/services/schemas/servicioSchemas.ts           ← actualizar campos geo
frontend/src/features/services/actions/queries.ts                   ← pasar countryCode
frontend/src/features/services/publish/[wizard steps]               ← LocalitySelect dinámico
frontend/src/features/services/components/cards/ServiceCard.tsx     ← formatPrice
frontend/src/app/(country)/[country]/(public)/suscripcion-pro/      ← formatPrice + countryCode
frontend/.env.example                                               ← variables por país
```

### Frontend — MOVIDAS (de ruta actual a [country]/)

Todas las páginas en `app/(public)/` y `app/(admin)/admin/` se mueven a:
`app/(country)/[country]/(public)/` y `app/(country)/[country]/(admin)/admin/`

---

## 15. Preguntas Abiertas

Estas decisiones afectan el diseño y deben resolverse antes de implementar:

1. **¿Dominio único o múltiple?**
   - Opción A: `atlasservices.com/cl`, `atlasservices.com/ar` (1 dominio, prefijos)
   - Opción B: `atlasservicios.cl`, `atlasservicios.ar`, `atlasservicios.uy`, `atlasservicios.es`, `atlasservices.us` (dominios separados por país)
   - **Impacto:** Cookie `atlas_country`, configuración CORS en backend, facturación de dominios, estrategia SEO

2. **¿Roll-out gradual o todos los países simultáneos?**
   - Gradual: agregar un campo `Country.launchStatus: 'ACTIVE' | 'COMING_SOON'` para mostrar páginas "próximamente" sin habilitar funcionalidad completa
   - Simultaneo: todos los países habilitados desde el deploy

3. **¿Categorías globales o por país desde el inicio?**
   - Global: mismas categorías, traducciones diferentes
   - Por país: taxonomías distintas desde el seed
   - **Recomendación:** Empezar con categorías globales (`countryCode: null`) + variantes específicas cuando sea necesario

4. **¿`ServiceCategory.countryCode` como string o FK a `Country`?**
   - El plan usa string informal para simplificar seeds
   - FK daría integridad referencial pero agrega complejidad en seeds y queries
   - **Recomendación:** String informal con validación en application layer

5. **¿Subdominio para admin o path?**
   - Actual: `atlasservices.com/cl/admin`
   - Alternativa: `admin.atlasservices.com` con selector de país
   - **Recomendación:** Mantener `/admin` en path para no complicar autenticación
