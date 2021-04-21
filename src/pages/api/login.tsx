import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
  P1_JWT,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import {
  findUserByDodId,
  createUserFromCommonApi,
} from '../../repositories/userRepo';
import {
  createPersonFromJwt,
  getPersonFromCommonApi,
} from '../../repositories/common/commonRepo';

export const loginHandler = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  res.statusCode = 200;
  res.json(req.user);
};

export async function returnUser(queryString: string, jwt: P1_JWT) {
  const tempestUser = await findUserByDodId(queryString);

  if (tempestUser) {
    return tempestUser;
  }

  let commonPerson = await getPersonFromCommonApi(queryString);

  if (commonPerson) {
    return createUserFromCommonApi(commonPerson);
  }

  //No tempest user, no common api user - create user in both
  commonPerson = await createPersonFromJwt(jwt);
  return await createUserFromCommonApi(commonPerson);
}

export default withApiAuth(loginHandler, returnUser);
