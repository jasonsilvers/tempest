import { Grant, Prisma } from '@prisma/client';
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

export type Grants = Prisma.PromiseReturnType<typeof findGrants>;
