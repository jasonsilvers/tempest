import { Role } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function getRoleByName(name: string) {
  return prisma.role.findUnique({
    where: {
      name,
    },
  });
}

export async function getRoles() {
  return prisma.role.findMany({ include: { _count: { select: { user: true } } } });
}

export async function createRole(newRole: Omit<Role, 'id'>) {
  return prisma.role.create({
    data: newRole,
  });
}

export async function deleteRole(roleId: number) {
  return prisma.role.delete({ where: { id: roleId } });
}
