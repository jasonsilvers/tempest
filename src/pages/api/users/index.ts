import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import {
  findUserByEmail,
  getUsersWithMemberTrackingRecordsByOrgId,
  LoggedInUser,
  UsersWithMemberTrackingRecords,
} from '../../../repositories/userRepo';
import { EResource } from '../../../const/enums';
import { getOrganizationTree } from '../../../repositories/organizationRepo';
import { Organization } from '@prisma/client';
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

  let organizations: Organization[];

  try {
    organizations = await getOrganizationTree(req.user.organizationId);
  } catch (e) {
    console.log(e);
  }

  let users: UsersWithMemberTrackingRecords = [];

  for (const organizaton of organizations) {
    const fetchedUsers = await getUsersWithMemberTrackingRecordsByOrgId(organizaton.id);

    if (fetchedUsers.length > 0) {
      users = [...users, ...fetchedUsers];
    }
  }

  res.json({ users });
};

export default withTempestHandlers(usersApiHandler, findUserByEmail);
