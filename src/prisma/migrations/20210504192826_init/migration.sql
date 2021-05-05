-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "dodId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "roleId" INTEGER,
    "organizationId" UUID,

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
    "trainee_id" UUID,
    "completed_date" TIMESTAMP(3),
    "next_record_id" INTEGER,
    "tracking_item_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" UUID,

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
CREATE TABLE "_TagToUser" (
    "A" INTEGER NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_OrganizationToTemplate" (
    "A" UUID NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user.dodId_unique" ON "user"("dodId");

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "member_tracking_record_next_record_id_unique" ON "member_tracking_record"("next_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization.name_unique" ON "organization"("name");

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
ALTER TABLE "user" ADD FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("authority_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("trainee_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("next_record_id") REFERENCES "member_tracking_record"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_tracking_record" ADD FOREIGN KEY ("tracking_item_id") REFERENCES "training_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD FOREIGN KEY ("parentId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD FOREIGN KEY ("trackingItemId") REFERENCES "training_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_tracking_item" ADD FOREIGN KEY ("templateId") REFERENCES "template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("resource_name") REFERENCES "resource"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("role_name") REFERENCES "role"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("A") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationToTemplate" ADD FOREIGN KEY ("B") REFERENCES "template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
