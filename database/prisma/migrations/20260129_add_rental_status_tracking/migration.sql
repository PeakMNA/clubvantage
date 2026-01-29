-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('NONE', 'REQUESTED', 'PAID', 'ASSIGNED', 'RETURNED');

-- AlterTable
ALTER TABLE "tee_time_players" ADD COLUMN "cartStatus" "RentalStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "tee_time_players" ADD COLUMN "caddyStatus" "RentalStatus" NOT NULL DEFAULT 'NONE';
