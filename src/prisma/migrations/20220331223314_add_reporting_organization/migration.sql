-- AlterTable
ALTER TABLE "user" ADD COLUMN     "reporting_organization_id" INTEGER;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_reporting_organization_id_fkey" FOREIGN KEY ("reporting_organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
