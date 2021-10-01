import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { getRoles } from '../../../repositories/roleRepo';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { RolesDTO } from '../../../types';

const rolesHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<RolesDTO>) => {
  const { method } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.ROLE);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const roles = await getRoles();

  res.status(200).json({ roles });
};

export default withTempestHandlers(rolesHandler, findUserByDodId);
