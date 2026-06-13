-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alias" TEXT,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "apartment" TEXT,
    "zipCode" TEXT,
    "reference" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "addresses_countryId_idx" ON "addresses"("countryId");

-- CreateIndex
CREATE INDEX "addresses_regionId_idx" ON "addresses"("regionId");

-- CreateIndex
CREATE INDEX "addresses_localityId_idx" ON "addresses"("localityId");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "geo_regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "geo_localities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
