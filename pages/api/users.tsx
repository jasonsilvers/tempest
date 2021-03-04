// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from '@prisma/client';
import { AccessControl } from 'accesscontrol';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { NextAPIRequestWithAuthorization } from '../../middleware/types';
import jwtInterceptor from '../../middleware/utils';

function hasRoleAndCanReadResource(
  ac: AccessControl,
  role: string,
  resource: string
) {
  return ac.hasRole(role) && ac.can(role).createAny(resource);
}

export const users = async (
  req: NextAPIRequestWithAuthorization,
  res: NextApiResponse<User[] | Object>
) => {

  const permission = hasRoleAndCanReadResource(req.accessControl, 'admin', 'record');

  if (permission.granted) {
    res.statusCode = 200;
    const users = await prisma.user.findMany();
    res.json(users);
  } else {
    res.statusCode = 401;
    res.json({ suck: 'you do' });
  }
};

export default jwtInterceptor(users);
