/*
  Warnings:

  - You are about to drop the column `roleId` on the `resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resource" DROP CONSTRAINT "resource_roleId_fkey";

-- AlterTable
ALTER TABLE "resource" DROP COLUMN "roleId",
ADD COLUMN     "role_Id" INTEGER;

-- AddForeignKey
ALTER TABLE "resource" ADD FOREIGN KEY ("role_Id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
