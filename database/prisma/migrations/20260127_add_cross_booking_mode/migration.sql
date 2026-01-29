-- CreateEnum
CREATE TYPE "BookingMode" AS ENUM ('EIGHTEEN', 'CROSS');

-- AlterTable: GolfScheduleConfig - Add booking mode columns
ALTER TABLE "golf_schedule_configs" ADD COLUMN "weekdayBookingMode" "BookingMode" NOT NULL DEFAULT 'EIGHTEEN';
ALTER TABLE "golf_schedule_configs" ADD COLUMN "weekendBookingMode" "BookingMode" NOT NULL DEFAULT 'EIGHTEEN';

-- AlterTable: GolfScheduleSeason - Add booking mode override columns
ALTER TABLE "golf_schedule_seasons" ADD COLUMN "weekdayBookingMode" "BookingMode";
ALTER TABLE "golf_schedule_seasons" ADD COLUMN "weekendBookingMode" "BookingMode";

-- AlterTable: GolfScheduleSpecialDay - Add booking mode override column
ALTER TABLE "golf_schedule_special_days" ADD COLUMN "bookingMode" "BookingMode";

-- AlterTable: TeeTime - Add starting hole column
ALTER TABLE "tee_times" ADD COLUMN "startingHole" INTEGER NOT NULL DEFAULT 1;
