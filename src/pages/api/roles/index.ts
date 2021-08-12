import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import prisma from '../../../prisma/prisma';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource, RolesDTO } from '../../../types/global';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';

const rolesHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<RolesDTO>) => {
  const { method } = req;

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.ROLE);

  if (!permission.granted) {
    return permissionDenied(res);
  }

  const roles = await prisma.role.findMany();

  res.status(200).json({ roles });
};

export default withErrorHandlingAndAuthorization(rolesHandler, findUserByDodId);
