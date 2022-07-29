-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('CATALOG');

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "types" "OrganizationType"[];

-- AlterTable
ALTER TABLE "training_record" ADD COLUMN     "organizationId" INTEGER;

-- AddForeignKey
ALTER TABLE "training_record" ADD CONSTRAINT "training_record_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
