import { FindUserById, LoggedInUser } from '../repositories/userRepo';
import { userWithinOrgOrChildOrg } from './userWithinOrgorChildOrg';

const userFromParamIsInOrgOrReportingOrgOfRequestUser = async (
  requestUserOrgId: number,
  userFromParamOrgId: number,
  userFromParamReportingOrgId: number
) => {
  return (
    (await userWithinOrgOrChildOrg(requestUserOrgId, userFromParamOrgId)) ||
    (await userWithinOrgOrChildOrg(requestUserOrgId, userFromParamReportingOrgId))
  );
};

export async function loggedInUserHasPermissionOnUser(requestUser: LoggedInUser, forUser: FindUserById) {
  if (requestUser.id === forUser.id) {
    return true;
  }

  if (
    await userFromParamIsInOrgOrReportingOrgOfRequestUser(
      requestUser.organizationId,
      forUser.organizationId,
      forUser.reportingOrganizationId
    )
  ) {
    return true;
  }

  return false;
}
