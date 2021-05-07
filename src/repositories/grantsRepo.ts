import prisma from '../prisma/prisma';

export async function findGrants() {
  return await prisma.grant.findMany({
    select: { action: true, attributes: true, resource: true, role: true },
  });
}
