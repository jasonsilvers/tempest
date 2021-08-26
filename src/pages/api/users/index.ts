import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';
import { findUserByDodId, getUsersWithMemberTrackingRecords, LoggedInUser } from '../../../repositories/userRepo';
import { EResource } from '../../../types/global';
const usersApiHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { method } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = ac.can(req.user.role.name).readAny(EResource.USER);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const users = await getUsersWithMemberTrackingRecords();
      res.json({ users });
      break;
    }

    // Disallow all methods except POST
    default:
      throw new MethodNotAllowedError(method);
  }
};

export default withErrorHandlingAndAuthorization(usersApiHandler, findUserByDodId);
