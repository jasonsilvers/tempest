import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import {
  findUserByDodId,
  getUsersWithMemberTrackingRecordsByOrgId,
  LoggedInUser,
  UsersWithMemberTrackingRecords,
} from '../../../repositories/userRepo';
import { EResource } from '../../../const/enums';
import { getOrganizationTree } from '../../../repositories/organizationRepo';
const usersApiHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const userPromises: Promise<UsersWithMemberTrackingRecords>[] = [];

  const organizations = await getOrganizationTree(req.user.organizationId);

  organizations.forEach(async (organization) => {
    userPromises.push(getUsersWithMemberTrackingRecordsByOrgId(organization.id));
  });

  let users: UsersWithMemberTrackingRecords = [];

  await Promise.all(userPromises).then((allUserData) => {
    users = allUserData.flat();
  });

  res.json({ users });
};

export default withTempestHandlers(usersApiHandler, findUserByDodId);
