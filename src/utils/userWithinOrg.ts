import { isOrgChildOf } from './isOrgChildOf';

export async function userWithinOrgOrChildOrg(reqUserOrganizationId: string, userOrganizationId: string) {
  if (reqUserOrganizationId === userOrganizationId || (await isOrgChildOf(userOrganizationId, reqUserOrganizationId))) {
    return true;
  }

  return false;
}

type UserHasPermissionWithinOrgParam = {
  id: string;
  orgId: string;
};

export async function userHasPermissionWithinOrg(
  monitor: UserHasPermissionWithinOrgParam,
  member: UserHasPermissionWithinOrgParam
) {
  if (monitor.id === member.id) {
    return true;
  }

  if (monitor.id !== member.id && (await userWithinOrgOrChildOrg(monitor.orgId, member.orgId))) {
    return true;
  }

  return false;
}
