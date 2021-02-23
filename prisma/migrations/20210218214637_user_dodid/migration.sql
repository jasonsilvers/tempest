/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[dodId]` on the table `users`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dodId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users.dodId_unique" ON "users"("dodId");
