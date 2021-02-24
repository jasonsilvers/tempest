/*
  Warnings:

  - You are about to drop the column `role_Id` on the `resource` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resource" DROP CONSTRAINT "resource_role_Id_fkey";

-- AlterTable
ALTER TABLE "resource" DROP COLUMN "role_Id",
ADD COLUMN     "role_id" INTEGER;

-- AddForeignKey
ALTER TABLE "resource" ADD FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
