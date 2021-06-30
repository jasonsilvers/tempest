import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../../repositories/userRepo';
import { findGrants } from '../../../repositories/grantsRepo';

const grantsHandler = async (req: NextApiRequestWithAuthorization<User>, res: NextApiResponse) => {
  res.statusCode = 200;

  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log(ip);

  const grants = await findGrants();

  res.json(grants);
};

export default withApiAuth(grantsHandler, findUserByDodId);
