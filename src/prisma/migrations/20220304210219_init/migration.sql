-- CreateEnum
CREATE TYPE "LogEventType" AS ENUM ('AUTHORIZED', 'UNAUTHORIZED', 'API_ACCESS', 'PAGE_ACCESS', 'LOGIN', 'METHOD_NOT_ALLOWED', 'BAD_REQUEST');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "last_login" TIMESTAMP(3),
    "role_id" INTEGER,
    "organization_id" INTEGER,
    "rank" TEXT,
    "afsc" TEXT,
    "duty_title" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_tracking_record" (
    "id" SERIAL NOT NULL,
    "trainee_signed_date" TIMESTAMP(3),
    "authority_signed_date" TIMESTAMP(3),
    "authority_id" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completed_date" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "trainee_id" INTEGER NOT NULL,
    "tracking_item_id" INTEGER NOT NULL,

    CONSTRAINT "member_tracking_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_tracking_item" (
    "isActive" BOOLEAN NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "trackingItemId" INTEGER NOT NULL,

    CONSTRAINT "member_tracking_item_pkey" PRIMARY KEY ("userId","trackingItemId")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "org_name" TEXT NOT NULL,
    "org_short_name" TEXT NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_record" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "interval" INTEGER,

    CONSTRAINT "training_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_tracking_item" (
    "id" SERIAL NOT NULL,
    "require" BOOLEAN NOT NULL,
    "trackingItemId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,

    CONSTRAINT "template_tracking_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grant" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,

    CONSTRAINT "grant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_event" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "log_event_type" "LogEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,

    CONSTRAINT "log_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToTemplate" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "training_record_title_key" ON "training_record"("title");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_name_key" ON "resource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToTemplate_AB_unique" ON "_OrganizationToTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToTemplate_B_index" ON "_OrganizationToTemplate"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD CONSTRAINT "member_tracking_record_authority_id_fkey" FOREIGN KEY ("authority_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD CONSTRAINT "member_tracking_record_trainee_id_fkey" FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD CONSTRAINT "member_tracking_record_trainee_id_tracking_item_id_fkey" FOREIGN KEY ("trainee_id", "tracking_item_id") REFERENCES "member_tracking_item"("userId", "trackingItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD CONSTRAINT "member_tracking_record_tracking_item_id_fkey" FOREIGN KEY ("tracking_item_id") REFERENCES "training_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_item" ADD CONSTRAINT "member_tracking_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_item" ADD CONSTRAINT "member_tracking_item_trackingItemId_fkey" FOREIGN KEY ("trackingItemId") REFERENCES "training_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD CONSTRAINT "template_tracking_item_trackingItemId_fkey" FOREIGN KEY ("trackingItemId") REFERENCES "training_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD CONSTRAINT "template_tracking_item_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD CONSTRAINT "grant_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD CONSTRAINT "grant_resource_name_fkey" FOREIGN KEY ("resource_name") REFERENCES "resource"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_event" ADD CONSTRAINT "log_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("A") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("B") REFERENCES "template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
