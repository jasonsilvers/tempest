import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { EResource } from '../../../../const/enums';
import { getAc } from '../../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import {
  findUserByEmail,
  getAllDetachedUsers,
  getAllUsersFromUsersOrgCascade,
  getUsers,
  LoggedInUser,
  UsersWithMemberTrackingRecords,
} from '../../../../repositories/userRepo';
import { jwtParser } from '../../../../utils/jwtUtils';

export interface ITempestUsersApiRequest<T> extends NextApiRequestWithAuthorization<T> {
  query: {
    detached: string;
    [key: string]: string | string[];
  };
}

const usersApiHandler = async (req: ITempestUsersApiRequest<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }
  const jwt = jwtParser(req);
  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  if (req.query.detached) {
    const detachedUsers = await getAllDetachedUsers();
    return res.status(200).json({ users: detachedUsers });
  }

  let users: UsersWithMemberTrackingRecords;
  if (isAdmin) {
    users = await getUsers();
  } else {
    users = await getAllUsersFromUsersOrgCascade(req.user.organizationId);
  }

  res.status(200).json({ users });
};

export default withTempestHandlers(usersApiHandler, findUserByEmail);
