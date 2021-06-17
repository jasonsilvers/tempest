import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { updateLastLogin, LoggedInUser } from '../../repositories/userRepo';
import { returnUser } from '../../repositories/loginRepo';

const loginHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<LoggedInUser>) => {
  const user = await updateLastLogin(req.user.id);

  res.status(200).json(user);
};

export default withApiAuth(loginHandler, returnUser);
