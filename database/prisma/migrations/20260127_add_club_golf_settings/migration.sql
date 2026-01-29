-- CreateEnum
CREATE TYPE "CartPolicy" AS ENUM ('OPTIONAL', 'REQUIRED');

-- CreateEnum
CREATE TYPE "RentalPolicy" AS ENUM ('OPTIONAL', 'REQUIRED');

-- CreateTable
CREATE TABLE "club_golf_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clubId" UUID NOT NULL,
    "cartPolicy" "CartPolicy" NOT NULL DEFAULT 'OPTIONAL',
    "rentalPolicy" "RentalPolicy" NOT NULL DEFAULT 'OPTIONAL',
    "caddyDrivesCart" BOOLEAN NOT NULL DEFAULT true,
    "maxGuestsPerMember" INTEGER NOT NULL DEFAULT 3,
    "requireGuestContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_golf_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "club_golf_settings_clubId_key" ON "club_golf_settings"("clubId");

-- CreateIndex
CREATE INDEX "club_golf_settings_clubId_idx" ON "club_golf_settings"("clubId");

-- AddForeignKey
ALTER TABLE "club_golf_settings" ADD CONSTRAINT "club_golf_settings_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
