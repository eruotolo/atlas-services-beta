-- Multi-País: Geo Schema Migration
-- Estrategia: crear tablas nuevas → seed Chile → asignar a existentes → NOT NULL

-- ─── 1. Nuevo Enum ──────────────────────────────────────────────────────────
CREATE TYPE "PaymentGateway" AS ENUM ('MERCADOPAGO', 'STRIPE');

-- ─── 2. Drop índices obsoletos ───────────────────────────────────────────────
DROP INDEX "premium_prices_durationMonths_idx";
DROP INDEX "premium_prices_durationMonths_key";
DROP INDEX "service_categories_name_key";
DROP INDEX "service_categories_slug_key";
DROP INDEX "user_roles_userId_roleId_key";

-- ─── 3. Crear tablas nuevas ──────────────────────────────────────────────────
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "regionLabel" TEXT NOT NULL,
    "localityLabel" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "geo_regions" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_regions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "geo_localities" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geo_localities_pkey" PRIMARY KEY ("id")
);

-- ─── 4. Índices y constraints de las nuevas tablas ───────────────────────────
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");
CREATE INDEX "geo_regions_countryId_idx" ON "geo_regions"("countryId");
CREATE UNIQUE INDEX "geo_regions_countryId_code_key" ON "geo_regions"("countryId", "code");
CREATE INDEX "geo_localities_regionId_idx" ON "geo_localities"("regionId");
CREATE UNIQUE INDEX "geo_localities_regionId_slug_key" ON "geo_localities"("regionId", "slug");

ALTER TABLE "geo_regions" ADD CONSTRAINT "geo_regions_countryId_fkey"
    FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "geo_localities" ADD CONSTRAINT "geo_localities_regionId_fkey"
    FOREIGN KEY ("regionId") REFERENCES "geo_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── 5. Seed Chile (requerido antes de NOT NULL en services/premium_prices) ──
INSERT INTO "countries" ("id", "code", "name", "currency", "locale", "timezone", "gateway", "regionLabel", "localityLabel", "active", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'cl', 'Chile', 'CLP', 'es-CL', 'America/Santiago', 'MERCADOPAGO', 'Región', 'Comuna', true, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

-- ─── 6. Alteraciones en tablas con datos existentes (nullable primero) ───────

-- services: countryId nullable → update → NOT NULL
ALTER TABLE "services" ADD COLUMN "countryId" TEXT;
ALTER TABLE "services" ADD COLUMN "regionId" TEXT;
ALTER TABLE "services" ADD COLUMN "localityId" TEXT;

UPDATE "services" SET "countryId" = (SELECT "id" FROM "countries" WHERE "code" = 'cl')
WHERE "countryId" IS NULL;

ALTER TABLE "services" ALTER COLUMN "countryId" SET NOT NULL;

-- premium_prices: countryId + currency nullable → update → NOT NULL
ALTER TABLE "premium_prices" ADD COLUMN "countryId" TEXT;
ALTER TABLE "premium_prices" ADD COLUMN "currency" TEXT;

UPDATE "premium_prices" SET "countryId" = (SELECT "id" FROM "countries" WHERE "code" = 'cl')
WHERE "countryId" IS NULL;
UPDATE "premium_prices" SET "currency" = 'CLP'
WHERE "currency" IS NULL;

ALTER TABLE "premium_prices" ALTER COLUMN "countryId" SET NOT NULL;
ALTER TABLE "premium_prices" ALTER COLUMN "currency" SET NOT NULL;

-- ─── 7. Alteraciones simples (sin conflicto) ─────────────────────────────────
ALTER TABLE "service_categories" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "sponsors" ADD COLUMN "countryId" TEXT;
ALTER TABLE "subscriptions"
    ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'CLP',
    ADD COLUMN "paymentGateway" "PaymentGateway" NOT NULL DEFAULT 'MERCADOPAGO';
ALTER TABLE "user_roles" ADD COLUMN "countryId" TEXT;

-- ─── 8. Nuevos índices ────────────────────────────────────────────────────────
CREATE INDEX "premium_prices_countryId_idx" ON "premium_prices"("countryId");
CREATE UNIQUE INDEX "premium_prices_countryId_durationMonths_key" ON "premium_prices"("countryId", "durationMonths");
CREATE UNIQUE INDEX "service_categories_slug_countryCode_key" ON "service_categories"("slug", "countryCode");
CREATE INDEX "services_countryId_idx" ON "services"("countryId");
CREATE INDEX "services_regionId_idx" ON "services"("regionId");
CREATE INDEX "services_localityId_idx" ON "services"("localityId");
CREATE INDEX "services_countryId_level_featured_endDate_idx" ON "services"("countryId", "level", "featured", "endDate");
CREATE INDEX "sponsors_countryId_idx" ON "sponsors"("countryId");
CREATE INDEX "user_roles_countryId_idx" ON "user_roles"("countryId");
CREATE UNIQUE INDEX "user_roles_userId_roleId_countryId_key" ON "user_roles"("userId", "roleId", "countryId");

-- ─── 9. Foreign Keys ──────────────────────────────────────────────────────────
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_countryId_fkey"
    FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_countryId_fkey"
    FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_regionId_fkey"
    FOREIGN KEY ("regionId") REFERENCES "geo_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "services" ADD CONSTRAINT "services_localityId_fkey"
    FOREIGN KEY ("localityId") REFERENCES "geo_localities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sponsors" ADD CONSTRAINT "sponsors_countryId_fkey"
    FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "premium_prices" ADD CONSTRAINT "premium_prices_countryId_fkey"
    FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
