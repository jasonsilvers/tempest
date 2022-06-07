import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { getResource } from '../../../repositories/resourceRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { ResourceDTO } from '../../../types';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';

const resourceHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<ResourceDTO>
) => {
  if (req.method !== 'GET') {
    throw new MethodNotAllowedError(req.method);
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.ADMIN_PAGE);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const resource = await getResource();

  res.status(200).json({ resource });
};

export default withTempestHandlers(resourceHandler, findUserByEmail);
