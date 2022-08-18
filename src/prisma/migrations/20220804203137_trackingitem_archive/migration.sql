-- CreateEnum
CREATE TYPE "TrackingItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "training_record" ADD COLUMN     "status" "TrackingItemStatus" NOT NULL DEFAULT E'ACTIVE';
