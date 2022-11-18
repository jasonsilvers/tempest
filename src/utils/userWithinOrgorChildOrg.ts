import { Organization } from '@prisma/client';

export function userWithinOrgOrChildOrg(reqUsersOrgAndDown: Organization[], userOrganizationId: number) {
  return reqUsersOrgAndDown.some((org) => org.id === userOrganizationId);
}
