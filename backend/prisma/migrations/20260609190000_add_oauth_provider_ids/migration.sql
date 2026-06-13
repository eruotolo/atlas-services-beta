-- AlterTable
ALTER TABLE "users" ADD COLUMN "googleId" TEXT,
                    ADD COLUMN "appleId" TEXT,
                    ADD COLUMN "microsoftId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "users_appleId_key" ON "users"("appleId");
CREATE UNIQUE INDEX "users_microsoftId_key" ON "users"("microsoftId");
