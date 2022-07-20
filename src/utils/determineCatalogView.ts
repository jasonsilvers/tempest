import { LoggedInUser } from '../repositories/userRepo';
import { Organization } from '@prisma/client';

export const determineCatalogView = (user: LoggedInUser, orgsFromServer: Organization[]) => {
  const orgsUsersCanViewTrackingItems: Organization[] = [];
  const userOrg = user?.organization;

  orgsUsersCanViewTrackingItems.push(userOrg);
  function findParentOrgs(node) {
    if (node?.parentId) {
      orgsFromServer?.forEach((orgFromServer) => {
        if (node?.parentId === orgFromServer.id) {
          findParentOrgs(orgFromServer);
          orgsUsersCanViewTrackingItems.push(orgFromServer);
        }
      });
    }
  }
  findParentOrgs(userOrg);
  return orgsUsersCanViewTrackingItems;
};

export function getTrackingItemsForCatalog(listOfTrackignItemOptions, listOfOrgs) {
  return listOfTrackignItemOptions.filter((list) => {
    return listOfOrgs.some((list2) => {
      return list.organizationId === list2.id || list.organizationId === null;
    });
  });
}
