/*
  Warnings:

  - You are about to drop the column `accessControlId` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the `AccessControl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_accessControlId_fkey";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "accessControlId";

-- DropTable
DROP TABLE "AccessControl";
