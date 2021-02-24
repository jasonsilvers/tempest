/*
  Warnings:

  - Added the required column `role2Id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role2Id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Role2" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "accessControlId" INTEGER,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Role2" ADD FOREIGN KEY ("accessControlId") REFERENCES "AccessControl2"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD FOREIGN KEY ("role2Id") REFERENCES "Role2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
