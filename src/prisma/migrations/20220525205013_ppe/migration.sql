-- CreateTable
CREATE TABLE "PersonalProtectionEquipmentItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "provided" BOOLEAN NOT NULL,
    "providedDetails" TEXT NOT NULL,
    "inUse" BOOLEAN NOT NULL,
    "inUseDetails" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PersonalProtectionEquipmentItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PersonalProtectionEquipmentItem" ADD CONSTRAINT "PersonalProtectionEquipmentItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
