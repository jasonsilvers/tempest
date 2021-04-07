import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../prisma/repositories/user';

const login = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  res.statusCode = 200;
  res.json(req.user);
};

export default withApiAuth(login, findUserByDodId);
