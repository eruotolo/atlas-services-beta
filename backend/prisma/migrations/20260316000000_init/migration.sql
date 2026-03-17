-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ServiceLevel" AS ENUM ('BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "SponsorCategory" AS ENUM ('SENIOR', 'PREMIUM', 'STANDARD');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('VIEW_PHONE', 'VIEW_EMAIL', 'CALL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "SocialMediaType" AS ENUM ('WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'TIKTOK', 'TWITTER', 'YOUTUBE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_category_map" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_category_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "commune" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "mainImage" TEXT,
    "images" TEXT[],
    "averageRating" DECIMAL(2,1),
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "level" "ServiceLevel" NOT NULL DEFAULT 'BASIC',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "CommentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "transactionId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "SponsorCategory" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "externalLink" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "premium_prices" (
    "id" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "premium_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "type" "SocialMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE INDEX "service_category_map_serviceId_idx" ON "service_category_map"("serviceId");

-- CreateIndex
CREATE INDEX "service_category_map_categoryId_idx" ON "service_category_map"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "service_category_map_serviceId_categoryId_key" ON "service_category_map"("serviceId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_commune_idx" ON "services"("commune");

-- CreateIndex
CREATE INDEX "services_userId_idx" ON "services"("userId");

-- CreateIndex
CREATE INDEX "services_averageRating_idx" ON "services"("averageRating");

-- CreateIndex
CREATE INDEX "services_level_idx" ON "services"("level");

-- CreateIndex
CREATE INDEX "services_endDate_idx" ON "services"("endDate");

-- CreateIndex
CREATE INDEX "ratings_serviceId_idx" ON "ratings"("serviceId");

-- CreateIndex
CREATE INDEX "ratings_userId_idx" ON "ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_serviceId_userId_key" ON "ratings"("serviceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_serviceId_key" ON "subscriptions"("serviceId");

-- CreateIndex
CREATE INDEX "subscriptions_serviceId_idx" ON "subscriptions"("serviceId");

-- CreateIndex
CREATE INDEX "subscriptions_active_idx" ON "subscriptions"("active");

-- CreateIndex
CREATE INDEX "subscriptions_paymentStatus_idx" ON "subscriptions"("paymentStatus");

-- CreateIndex
CREATE INDEX "sponsors_level_idx" ON "sponsors"("level");

-- CreateIndex
CREATE INDEX "sponsors_active_idx" ON "sponsors"("active");

-- CreateIndex
CREATE UNIQUE INDEX "premium_prices_durationMonths_key" ON "premium_prices"("durationMonths");

-- CreateIndex
CREATE INDEX "premium_prices_active_idx" ON "premium_prices"("active");

-- CreateIndex
CREATE INDEX "premium_prices_durationMonths_idx" ON "premium_prices"("durationMonths");

-- CreateIndex
CREATE INDEX "interactions_serviceId_idx" ON "interactions"("serviceId");

-- CreateIndex
CREATE INDEX "interactions_type_idx" ON "interactions"("type");

-- CreateIndex
CREATE INDEX "interactions_createdAt_idx" ON "interactions"("createdAt");

-- CreateIndex
CREATE INDEX "social_media_serviceId_idx" ON "social_media"("serviceId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_category_map" ADD CONSTRAINT "service_category_map_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_category_map" ADD CONSTRAINT "service_category_map_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media" ADD CONSTRAINT "social_media_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

