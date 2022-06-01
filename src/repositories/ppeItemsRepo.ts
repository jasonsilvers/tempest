import prisma from '../prisma/prisma';

export async function getPPEItemsByUserId(userId: number) {
  return prisma.personalProtectionEquipmentItem.findMany({ where: { userId } });
}
