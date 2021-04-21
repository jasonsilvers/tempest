import prisma from '../prisma/prisma';

export async function getRoleByName(name: string) {
  return await prisma.role.findUnique({
    where: {
      name,
    },
  });
}
