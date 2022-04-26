import { NextApiResponse } from 'next';
import {
  deleteOrganizationAction,
  getOrganizationAction,
  ITempestOrganizationIdApiRequest,
} from '../../../controllers/organizationController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';

export const organizationIdApiHandler = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse
) => {
  switch (req.method) {
    case 'GET': {
      return getOrganizationAction(req, res);
    }

    // case 'PUT': {
    //   return putUserAction(req, res);
    // }

    case 'DELETE': {
      return deleteOrganizationAction(req, res);
    }

    default:
      throw new MethodNotAllowedError(req.method);
  }
};

export default withTempestHandlers(organizationIdApiHandler, findUserByEmail);
