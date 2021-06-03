import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { findUserByDodId, findUserById, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

async function userQueryHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const { query, method } = req;

  // Set userId to 0
  const userId = query.id as string;

  const ac = await getAc();

  switch (method) {
    // Get Method to return a single user by id
    case 'GET': {
      const permission =
        req.user.id !== userId
          ? ac.can(req.user.role.name).readAny(EResource.USER)
          : ac.can(req.user.role.name).readOwn(EResource.USER);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const user = await findUserById(userId);
      res.status(200).json(user);
      break;
    }

    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(userQueryHandler, findUserByDodId);
