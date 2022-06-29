import { Role } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function getRoleByName(name: string) {
  return prisma.role.findUnique({
    where: {
      name,
    },
  });
}

export function getRoles() {
  return prisma.role.findMany({ include: { _count: { select: { user: true } } } });
}

export function createRole(newRole: Omit<Role, 'id'>) {
  return prisma.role.create({
    data: newRole,
  });
}

export function deleteRole(roleId: number) {
  return prisma.role.delete({ where: { id: roleId } });
}
