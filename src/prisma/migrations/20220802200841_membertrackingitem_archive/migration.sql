/*
  Warnings:

  - You are about to drop the column `isActive` on the `member_tracking_item` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MemberTrackingItemStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "member_tracking_item" DROP COLUMN "isActive",
ADD COLUMN     "status" "MemberTrackingItemStatus" NOT NULL DEFAULT E'ACTIVE';
