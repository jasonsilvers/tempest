-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "dodId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER,
    "organizationId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_record" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "user.dodId_unique" ON "user"("dodId");

-- CreateIndex
CREATE UNIQUE INDEX "user.email_unique" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role.name_unique" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "resource.name_unique" ON "resource"("name");

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD FOREIGN KEY ("parentId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_record" ADD FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("resource_name") REFERENCES "resource"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grant" ADD FOREIGN KEY ("role_name") REFERENCES "role"("name") ON DELETE CASCADE ON UPDATE CASCADE;
