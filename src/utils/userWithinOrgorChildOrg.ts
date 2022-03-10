import { isOrgChildOf } from './isOrgChildOf';

export async function userWithinOrgOrChildOrg(reqUserOrganizationId: number, userOrganizationId: number) {
  if (reqUserOrganizationId === userOrganizationId || (await isOrgChildOf(userOrganizationId, reqUserOrganizationId))) {
    return true;
  }

  return false;
}
