import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiMessage } from '../../../const/enums';
import { AppError, MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { deleteUser, findUserByEmail, LoggedInUser, updateUser } from '../../../repositories/userRepo';
import { jwtParser } from '../../../utils/jwtUtils';

const mergeUserAccountsPostSchema = {
  body: Joi.object({
    winningAccountEmail: Joi.string().email().required(),
    losingAccountEmail: Joi.string().email().required(),
  }),
};

const mergeUserAccountsSchema = {
  post: mergeUserAccountsPostSchema,
};

const mergeUserAccountApiHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { body, method } = req;
  
  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }
  
  const jwt = jwtParser(req);
  
  const isAdmin =
  jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');
  
  if (!isAdmin) {
    throw new PermissionError();
  }
  console.log(body.losingAccountEmail, body.winningAccountEmail)

  const winningAccount = await findUserByEmail(body.winningAccountEmail);
  const losingAccount = await findUserByEmail(body.losingAccountEmail);
  const newEmailFromLosingAccount = losingAccount.email;

  console.log(winningAccount, losingAccount, newEmailFromLosingAccount);
  
  try {
    await updateUser(losingAccount.id, { email: `Archive_${losingAccount.email}` });
  } catch (e) {
    throw new AppError(500, 'There was a problem merging the accounts, please try again.');
  }
  try {
    await updateUser(winningAccount.id, { email: newEmailFromLosingAccount });
    await deleteUser(losingAccount.id);
  } catch (e) {
    await updateUser(losingAccount.id, {email: losingAccount.email})
    throw new AppError(500, 'There was a problem merging the accounts, please try again.');
  }
  
  return res.status(200).json({ message: 'ok' });
};

export default withTempestHandlers(mergeUserAccountApiHandler, findUserByEmail, mergeUserAccountsSchema);
