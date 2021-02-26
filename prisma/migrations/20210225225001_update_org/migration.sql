/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Organization` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_organizationId_fkey";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "organizationId",
ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Organization" ADD FOREIGN KEY ("parentId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
