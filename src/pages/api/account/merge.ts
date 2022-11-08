import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiMessage, EResource } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser, updateUser } from '../../../repositories/userRepo';

const mergeUserAccountsPostSchema = {
  body: Joi.object({
    oldEmail: Joi.string().required(),
    newEmail: Joi.string().required(),
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

  const ac = await getAc();

  const permission = ac.can(req.user.role.name).updateAny(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const replacmentEmail = body.newEmail;

  const mergeAccounts = async (oldEmail: string, newEmail: string) => {
    const firstAccount = await findUserByEmail(oldEmail);
    const secondAccount = await findUserByEmail(newEmail);
    await updateUser(secondAccount.id, { email: `Archive_${firstAccount.email}` });
    const updatedAccount = await updateUser(firstAccount.id, { email: replacmentEmail });

    return updatedAccount;
  };
  const accountWIthUpdatedEmail = await mergeAccounts(body.oldEmail, body.newEmail);
  return res.status(200).json(accountWIthUpdatedEmail);
};

export default withTempestHandlers(mergeUserAccountApiHandler, findUserByEmail, mergeUserAccountsSchema);
