import prisma from '../prisma/prisma';

export async function getResource() {
  return prisma.resource.findMany();
}
