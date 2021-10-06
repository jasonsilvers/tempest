import { findOrganizationById } from '../repositories/organizationRepo';

export async function isOrgChildOf(childOrganizationId: string, organizationId: string): Promise<boolean> {
  if (childOrganizationId === null) {
    return false;
  }

  const childOrganization = await findOrganizationById(childOrganizationId);
  let parentId = childOrganization.parentId;

  while (parentId) {
    if (parentId === organizationId) {
      return true;
    }

    const organization = await findOrganizationById(parentId);

    if (organization) {
      parentId = organization.parentId;
    } else {
      return false;
    }
  }

  return false;
}
