import { LoggedInUser } from '../repositories/userRepo';
import { Organization, OrganizationType } from '@prisma/client';

const findOrgsWithCatalog = (
  orgBranch: Organization[],
  orgsFromServer: Organization[],
  orgsUserCanAddTrackingItems: Organization[]
) => {
  if (orgBranch === null || orgBranch?.length === 0) {
    return;
  }

  for (const organization of orgBranch) {
    if (organization.types.includes(OrganizationType.CATALOG)) {
      orgsUserCanAddTrackingItems.push(organization);
    }
    const newBranch = orgsFromServer.filter((orgFromServer) => orgFromServer.parentId === organization.id);
    findOrgsWithCatalog(newBranch, orgsFromServer, orgsUserCanAddTrackingItems);
  }
};

export const determineOrgsWithCatalogs = (user: LoggedInUser, orgsFromServer: Organization[]) => {
  const orgsUserCanAddTrackingItems: Organization[] = [];

  const usersOrg = orgsFromServer?.find((orgFromServer) => orgFromServer.id === user?.organizationId);

  if (usersOrg?.types?.includes(OrganizationType.CATALOG)) {
    orgsUserCanAddTrackingItems.push(usersOrg);
  }
  const usersOrgTree = orgsFromServer?.filter((orgFromServer) => orgFromServer.parentId === usersOrg?.id);

  findOrgsWithCatalog(usersOrgTree, orgsFromServer, orgsUserCanAddTrackingItems);
  return orgsUserCanAddTrackingItems;
};
