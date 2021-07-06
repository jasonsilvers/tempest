import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findGrants } from '../../../repositories/grantsRepo';
import { GrantsDTO } from '../../../types/global';

const grantsHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<GrantsDTO>) => {
  res.statusCode = 200;

  const grants = await findGrants();

  res.json({ grants });
};

export default withApiAuth(grantsHandler, findUserByDodId);
