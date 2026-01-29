-- Drop unique constraint to allow multiple bookings per flight
-- Total players across all bookings at same time validated in code (max 4)

-- Drop the unique constraint
DROP INDEX IF EXISTS "tee_times_courseId_teeDate_teeTime_key";

-- Add a regular index for query performance
CREATE INDEX IF NOT EXISTS "tee_times_courseId_teeDate_teeTime_idx" ON "tee_times"("courseId", "teeDate", "teeTime");
