-- CreateTable
CREATE TABLE "AccessControl2" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
