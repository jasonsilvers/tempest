import { isOrgChildOf } from './isOrgChildOf';

export async function userWithinOrgOrChildOrg(reqUserOrganizationId: string, userOrganizationId: string) {
  if (reqUserOrganizationId === userOrganizationId || (await isOrgChildOf(userOrganizationId, reqUserOrganizationId))) {
    return true;
  }

  return false;
}
