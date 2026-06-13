-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isKycVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kycVerifiedAt" TIMESTAMP(3);
