import { Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function findGrants() {
  return prisma.grant.findMany({
    select: { action: true, attributes: true, resource: true, role: true },
  });
}

export type Grants = Prisma.PromiseReturnType<typeof findGrants>;
