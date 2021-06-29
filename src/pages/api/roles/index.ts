import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import prisma from '../../../prisma/prisma';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource } from '../../../types/global';

const rolesHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  res.statusCode = 200;

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).readAny(EResource.ROLE);

  if (!permission.granted) {
    return permissionDenied(res);
  }

  const roles = await prisma.role.findMany();

  res.json({ roles });
};

export default withApiAuth(rolesHandler, findUserByDodId);
