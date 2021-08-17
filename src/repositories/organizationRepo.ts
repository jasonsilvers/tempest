import { Organization } from '.prisma/client';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function findOrganizations() {
  return prisma.organization.findMany();
}

export async function findOrganizationById(
  id: string,
  { withChildren, withUsers }: { withChildren?: boolean; withUsers?: boolean } = {
    withChildren: false,
    withUsers: false,
  }
) {
  return prisma.organization.findUnique({ where: { id }, include: { children: withChildren, users: withUsers } });
}

export type OrganizationWithChildren = Prisma.PromiseReturnType<typeof findOrganizationById>;

export async function createOrganizations(organization: Organization) {
  return prisma.organization.create({
    data: organization,
  });
}
