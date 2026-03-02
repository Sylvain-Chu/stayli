-- Migration: Remove 'blocked' value from BookingStatus enum
-- Any existing bookings with status='blocked' are set to 'cancelled'
UPDATE "Booking" SET "status" = 'cancelled'::"BookingStatus" WHERE "status" = 'blocked'::"BookingStatus";

-- AlterEnum (standard Prisma pattern: create new type, migrate, drop old)
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('confirmed', 'pending', 'cancelled');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'confirmed'::"BookingStatus_new";
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
COMMIT;
