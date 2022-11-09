import { Organization } from '@prisma/client';
import { OrganizationWithChildrenAndUsers } from '../repositories/organizationRepo';

export async function isOrgChildOf(
  childOrganizationId: number,
  organizationId: number,
  functionToGetOrg: (childOrganizationId: number) => Promise<OrganizationWithChildrenAndUsers>
): Promise<boolean> {
  if (childOrganizationId === null) {
    return false;
  }

  // const childOrganization = await findOrganizationById(childOrganizationId);
  const childOrganization = await functionToGetOrg(childOrganizationId);
  let parentId = childOrganization.parentId;

  while (parentId) {
    if (parentId === organizationId) {
      return true;
    }

    // const organization = await findOrganizationById(parentId);
    const organization = await functionToGetOrg(parentId);

    if (organization) {
      parentId = organization.parentId;
    } else {
      return false;
    }
  }

  return false;
}

export function isOrgChildOfClient(
  childOrganizationId: number,
  organizationId: number,
  list: Organization[],
  functionToGetOrg: (id: number, organizationList: Organization[]) => Organization
): boolean {
  if (childOrganizationId === null) {
    return false;
  }

  // const childOrganization = await findOrganizationById(childOrganizationId);
  const childOrganization = functionToGetOrg(childOrganizationId, list);
  let parentId = childOrganization.parentId;

  while (parentId) {
    if (parentId === organizationId) {
      return true;
    }

    // const organization = await findOrganizationById(parentId);
    const organization = functionToGetOrg(parentId, list);

    if (organization) {
      parentId = organization.parentId;
    } else {
      return false;
    }
  }

  return false;
}
