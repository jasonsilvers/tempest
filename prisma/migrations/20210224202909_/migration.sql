/*
  Warnings:

  - You are about to drop the column `resourceId` on the `permission` table. All the data in the column will be lost.
  - You are about to drop the column `authorId` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `accessControlId` on the `role2` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "permission" DROP CONSTRAINT "permission_resourceId_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "role2" DROP CONSTRAINT "role2_accessControlId_fkey";

-- AlterTable
ALTER TABLE "permission" DROP COLUMN "resourceId",
ADD COLUMN     "resource_id" INTEGER;

-- AlterTable
ALTER TABLE "post" DROP COLUMN "authorId",
ADD COLUMN     "author_id" INTEGER;

-- AlterTable
ALTER TABLE "role2" DROP COLUMN "accessControlId",
ADD COLUMN     "access_control_id" INTEGER;

-- AddForeignKey
ALTER TABLE "permission" ADD FOREIGN KEY ("resource_id") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role2" ADD FOREIGN KEY ("access_control_id") REFERENCES "accesscontrol2"("id") ON DELETE SET NULL ON UPDATE CASCADE;
