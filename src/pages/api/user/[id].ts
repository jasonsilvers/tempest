import { User } from '@prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied } from '../../../middleware/utils';
import {
  findUserByDodId,
  findUserById,
  updateUser,
  UserWithRole,
} from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

async function userQueryHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const {
    query: { id },
    method,
    body,
  } = req;

  // Set userId to 0
  let userId: string;

  // query params are sent as a string.  Lets check then parse the id
  if (typeof id === 'string') {
    userId = id;
  }

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

    // PUT Method to update a single user
    case 'PUT': {
      // If the json body of the User does not have an id then return 400 bad request
      if (!body.id) {
        res.status(400).end('User must have id to update');
        break;
      }
      // if the Query id and JSON body id match then process the update
      if (body.id === userId) {
        const user = await updateUser(body);
        res.status(200).json(user);
        break;
      }
      // If the Query id and JSON body do not match
      // Then return a 400 bad request
      // We do this to ensure we know that this request was intentional
      else {
        res.status(400).end('User Obj and Query must match for id');
        break;
      }
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(userQueryHandler, findUserByDodId);
