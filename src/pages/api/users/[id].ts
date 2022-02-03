import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { ITempestApiError } from '../../../const/enums';
import { deleteUserAction, getUserAction, putUserAction, userSchema } from '../../../controllers/userController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';

async function userQueryHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) {
  switch (req.method) {
    case 'GET': {
      return getUserAction(req, res);
    }

    case 'PUT': {
      return putUserAction(req, res);
    }

    case 'DELETE': {
      return deleteUserAction(req, res);
    }

    default:
      throw new MethodNotAllowedError(req.method);
  }
}

export default withTempestHandlers(userQueryHandler, findUserByEmail, userSchema);
