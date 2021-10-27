-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('AUTHORIZED', 'UNAUTHORIZED', 'API_ACCESS', 'PAGE_ACCESS', 'LOGIN', 'METHOD_NOT_ALLOWED', 'BAD_REQUEST');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "dod_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "role_id" INTEGER,
    "organization_id" TEXT,
    "rank" TEXT,
    "afsc" TEXT,
    "duty_title" TEXT,
    "address" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_tracking_record" (
    "id" SERIAL NOT NULL,
    "trainee_signed_date" TIMESTAMP(3),
    "authority_signed_date" TIMESTAMP(3),
    "authority_id" UUID,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completed_date" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "trainee_id" UUID NOT NULL,
    "tracking_item_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_tracking_item" (
    "isActive" BOOLEAN NOT NULL,
    "userId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "trackingItemId" INTEGER NOT NULL,

    PRIMARY KEY ("userId","trackingItemId")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "parent_id" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_record" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "interval" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_tracking_item" (
    "id" SERIAL NOT NULL,
    "require" BOOLEAN NOT NULL,
    "trackingItemId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_event" (
    "id" SERIAL NOT NULL,
    "userId" UUID,
    "log_event_type" "LogEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToUser" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToTemplate" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user.dod_id_unique" ON "user"("dod_id");

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "training_record.title_unique" ON "training_record"("title");

-- CreateIndex
CREATE UNIQUE INDEX "role.name_unique" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource.name_unique" ON "resource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToTemplate_AB_unique" ON "_OrganizationToTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToTemplate_B_index" ON "_OrganizationToTemplate"("B");

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("authority_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("tracking_item_id") REFERENCES "training_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("trainee_id", "tracking_item_id") REFERENCES "member_tracking_item"("userId", "trackingItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_item" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_item" ADD FOREIGN KEY ("trackingItemId") REFERENCES "training_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD FOREIGN KEY ("parent_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD FOREIGN KEY ("trackingItemId") REFERENCES "training_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("resource_name") REFERENCES "resource"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("role_name") REFERENCES "role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_event" ADD FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("A") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("B") REFERENCES "template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
