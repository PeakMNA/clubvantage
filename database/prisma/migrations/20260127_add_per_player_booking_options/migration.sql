-- AlterTable: Add per-player booking options to tee_time_players table
ALTER TABLE "tee_time_players"
ADD COLUMN IF NOT EXISTS "caddyRequest" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "cartRequest" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "rentalRequest" VARCHAR(50);

-- Set default values for existing rows
UPDATE "tee_time_players"
SET "caddyRequest" = 'NONE',
    "cartRequest" = 'NONE',
    "rentalRequest" = 'NONE'
WHERE "caddyRequest" IS NULL;
