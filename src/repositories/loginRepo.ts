import { P1_JWT } from '@tron/nextjs-auth-p1';
import { ERole } from '../const/enums';
import { LoggedInUser, updateUserRole, findUserByEmail } from './userRepo';
import { createNewUserFromJWT } from './utils';

export async function returnUser(queryString: string, jwt: P1_JWT): Promise<LoggedInUser> {
  const tempestUser = await findUserByEmail(queryString);

  const isAdmin: boolean =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (tempestUser) {
    if (isAdmin) {
      return updateUserRole(tempestUser.id, ERole.ADMIN);
    }
    return tempestUser;
  }

  return createNewUserFromJWT(jwt);
}
