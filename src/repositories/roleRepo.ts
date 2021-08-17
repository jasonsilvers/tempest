import prisma from '../prisma/prisma';

export async function getRoleByName(name: string) {
  return prisma.role.findUnique({
    where: {
      name,
    },
  });
}

export async function getRoles() {
  return prisma.role.findMany();
}
