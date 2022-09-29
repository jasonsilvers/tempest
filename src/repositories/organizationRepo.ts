import { Organization } from '.prisma/client';
import { Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function findOrganizations() {
  return prisma.organization.findMany({ include: { _count: { select: { users: true, children: true } } } });
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

export async function createOrganizations(organization: Organization) {
  return prisma.organization.create({
    data: organization,
  });
}

export async function deleteOrganization(organizationId: number) {
  return prisma.organization.delete({ where: { id: organizationId } });
}

export async function updateOrganization(organizationId: number, organization: Partial<Organization>) {
  return prisma.organization.update({ where: { id: organizationId }, data: organization });
}

//Users org and down
export async function getOrganizationAndDown(organizationId: number) {
  return prisma.$queryRaw<Organization[]>(
    Prisma.sql`
    WITH RECURSIVE orgs AS (
      SELECT 
        id,
        org_name AS name,
        org_short_name AS "shortName",
        parent_id AS "parentId",
        types
      FROM 
        organization
      where 
        id = ${organizationId}
      UNION
        SELECT
          o.id,
          o.org_name,
          o.org_short_name,
          o.parent_id,
          o.types
        FROM
          organization o
        JOIN orgs ON orgs.id = o.parent_id
      
      ) SELECT * from orgs`
  );
}

//Users org and up
export async function getOrganizationAndUp(organizationId: number) {
  return prisma.$queryRaw<Organization[]>(
    Prisma.sql`with recursive orgParent as (
      select
        *
      from organization
      where
        id =${organizationId}

      union

      select
        organization.*
      from organization
      join orgParent on orgParent.parent_id = organization.id
    )

    select
      *
    from orgParent 
    order by
      id;`
  );
}

export type OrganizationWithChildrenAndUsers = Prisma.PromiseReturnType<typeof findOrganizationById>;
export type OrgsWithCounts = Prisma.PromiseReturnType<typeof findOrganizations>;
export type OrgWithCounts = Organization & {
  _count: {
    children: number;
    users: number;
  };
};
