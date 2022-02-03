import { findUserById } from '../repositories/userRepo';
import { userWithinOrgOrChildOrg } from './userWithinOrgorChildOrg';

type UserHasPermissionWithinOrgParam = {
  id: number;
  orgId: string;
};

export async function userHasPermissionWithinOrg(
  monitor: UserHasPermissionWithinOrgParam,
  member: UserHasPermissionWithinOrgParam
) {
  if (monitor.id === member.id) {
    return true;
  }

  let memberOrgId = member.orgId;

  if (!member.orgId) {
    const user = await findUserById(member.id);
    memberOrgId = user.organizationId;
  }

  if (monitor.id !== member.id && (await userWithinOrgOrChildOrg(monitor.orgId, memberOrgId))) {
    return true;
  }

  return false;
}
