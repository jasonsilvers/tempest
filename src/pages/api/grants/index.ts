import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../../repositories/userRepo';
import { findGrants } from '../../../repositories/grantsRepo';
import { GrantsDTO } from '../../../types/global';

const grantsHandler = async (req: NextApiRequestWithAuthorization<User>, res: NextApiResponse<GrantsDTO>) => {
  res.statusCode = 200;

  const grants = await findGrants();

  res.json({ grants });
};

export default withApiAuth(grantsHandler, findUserByDodId);
