import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { EResource, ERole } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import {
  findUserByEmail,
  getAllUsersFromUsersOrgCascade,
  getUsers,
  LoggedInUser,
} from '../../../repositories/userRepo';
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

  if (req.user.role.name === ERole.ADMIN) {
    const allUsers = await getUsers();
    return res.status(200).json({ users: allUsers });
  }

  const users = await getAllUsersFromUsersOrgCascade(req.user.organizationId);

  res.status(200).json({ users });
};

export default withTempestHandlers(usersApiHandler, findUserByEmail);
