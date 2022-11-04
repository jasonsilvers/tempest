import { getOrganizationAndDown } from '../repositories/organizationRepo';
import { FindUserById, LoggedInUser } from '../repositories/userRepo';
import { userWithinOrgOrChildOrg } from './userWithinOrgorChildOrg';

const userIsInOrgOrReportingOrgOfRequestingUser = async (
  requestUserOrgId: number,
  userOrgId: number,
  userReportingOrgId: number
) => {
  const requestUserOrgAndDown = await getOrganizationAndDown(requestUserOrgId);

  const test =
    userWithinOrgOrChildOrg(requestUserOrgAndDown, userOrgId) ||
    userWithinOrgOrChildOrg(requestUserOrgAndDown, userReportingOrgId);

  return test;
};

export async function loggedInUserHasPermissionOnUser(requestUser: LoggedInUser, forUser: FindUserById) {
  if (requestUser.id === forUser.id) {
    return true;
  }

  return await userIsInOrgOrReportingOrgOfRequestingUser(
    requestUser.organizationId,
    forUser.organizationId,
    forUser.reportingOrganizationId
  );
}
