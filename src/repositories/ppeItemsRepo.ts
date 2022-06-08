import { PersonalProtectionEquipmentItem } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function findPPEItemsByUserId(userId: number) {
  return prisma.personalProtectionEquipmentItem.findMany({ where: { userId } });
}

export async function findPPEItemById(id: number) {
  return prisma.personalProtectionEquipmentItem.findUnique({ where: { id } });
}

export async function createPPEItemForUser(data: Omit<PersonalProtectionEquipmentItem, 'id'>) {
  return prisma.personalProtectionEquipmentItem.create({ data });
}

export async function updatePPEItemById(data: PersonalProtectionEquipmentItem, id: number) {
  return prisma.personalProtectionEquipmentItem.update({ data, where: { id } });
}

export async function deletePPEItemById(id: number) {
  return prisma.personalProtectionEquipmentItem.delete({ where: { id } });
}
