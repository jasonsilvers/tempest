import { Organization } from '.prisma/client';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function findOrganizations() {
  return prisma.organization.findMany();
}

export async function findOrganizationById(
  id: number,
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

export async function getOrganizationTree(organizationId: number) {
  return prisma.$queryRaw<Organization[]>(
    Prisma.sql`
    WITH RECURSIVE orgs AS (
      SELECT 
        id,
        org_name,
        org_short_name
      FROM 
        organization
      where 
        id = ${organizationId}
      UNION
        SELECT
          o.id,
          o.org_name,
          o.org_short_name
        FROM
          organization o
        JOIN orgs ON orgs.id = o.parent_id
      
      ) SELECT * from orgs`
  );
}
