/*eslint-disable */

import { User } from '@prisma/client';
import { P1_JWT } from '@tron/nextjs-auth-p1';
import { ERole } from '../const/enums';
import { getRoleByName } from './roleRepo';
import { createUser, LoggedInUser } from './userRepo';

// Ignore any for args because they can literally be any....
export function withErrorHandling<T extends (...args: any[]) => any>(
  func: T
): (...funcArgs: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args): Promise<ReturnType<T>> => {
    try {
      return await func(...args);
    } catch (e) {
      throw new Error('There was an error making the request');
    }
  };
}
/*eslint-enable */

export async function createNewUserFromJWT(jwt: P1_JWT) {
  const memberRole = await getRoleByName(ERole.MEMBER);

  let firstName = jwt.given_name;
  let lastName = jwt.family_name;

  if (firstName === null || lastName === null) {
    firstName = 'No First Name';
    lastName = 'No Last Name';
  }

  if (jwt.email === null) {
    throw new Error('Unable to create user account without a valid email');
  }

  const newTempestUser = await createUser(
    {
      firstName,
      lastName,
      email: jwt.email,
    } as User,
    memberRole
  );

  return {
    ...newTempestUser,
    role: memberRole,
  } as LoggedInUser;
}
