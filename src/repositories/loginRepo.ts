import { P1_JWT } from '@tron/nextjs-auth-p1';
import { ERole } from '../types/global';
import { getPersonFromCommonApi, createPersonFromJwt } from './common/commonRepo';
import { UserWithRole, findUserByDodId, updateUserRole, createUserFromCommonApi } from './userRepo';

export async function returnUser(queryString: string, jwt: P1_JWT): Promise<UserWithRole> {
  const tempestUser = await findUserByDodId(queryString);

  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (tempestUser) {
    if (isAdmin) {
      return await updateUserRole(tempestUser.id, ERole.ADMIN);
    }
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
