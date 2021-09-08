import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByDodId, getUsersWithMemberTrackingRecords, LoggedInUser } from '../../../repositories/userRepo';
import { EResource } from '../../../types/global';
const usersApiHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.USER);

  if (!permission.granted) {
    return permissionDenied(res);
  }

  const users = await getUsersWithMemberTrackingRecords();
  res.json({ users });
};

export default withTempestHandlers(usersApiHandler, findUserByDodId);
