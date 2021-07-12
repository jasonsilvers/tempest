import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { updateLastLogin, LoggedInUser } from '../../repositories/userRepo';
import { returnUser } from '../../repositories/loginRepo';
import { withErrorHandlingAndAuthorization } from '../../middleware/withErrorHandling';

const loginHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse<LoggedInUser>) => {
  const user = await updateLastLogin(req.user.id);

  res.status(200).json(user);
};

export default withErrorHandlingAndAuthorization(loginHandler, returnUser);
