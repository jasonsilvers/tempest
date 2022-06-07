import { Grant, Prisma } from '@prisma/client';
import { NewGrant } from '../hooks/api/grants';
import prisma from '../prisma/prisma';

export async function findGrants() {
  return prisma.grant.findMany();
}

export async function updateGrant(id: number, newData: Omit<Grant, 'id'>) {
  return prisma.grant.update({
    where: {
      id,
    },
    data: newData,
  });
}

export async function createGrant(newGrant: NewGrant) {
  return prisma.grant.create({ data: newGrant });
}

export async function deleteGrant(id: number) {
  return prisma.grant.delete({ where: { id } });
}

export type Grants = Prisma.PromiseReturnType<typeof findGrants>;
