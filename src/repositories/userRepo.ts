import { User, Role } from '@prisma/client';
import prisma from '../prisma/prisma';
import { ERole } from '../types/global';
import { IPerson } from './common/types';
import { getRoleByName } from './roleRepo';

// required to infer the return type from the Prisma Client
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

// type === User & { role?: Role };
export type UserWithRole = ThenArg<ReturnType<typeof findUserByDodId>>;
export type UserWithTrackingRecord = ThenArg<
  ReturnType<typeof findTrackingRecordsByAuthorityId>
>;

export type UserAll = ThenArg<ReturnType<typeof findUserWithAll>>;
export const findUserWithAll = async () => {
  return await prisma.user.findMany({
    include: {},
  });
};

/**
 * Get user method to query the PSQL db though the prisma client
 * for use with the @tron-p1-auth library
 *
 * @param queryString dodid
 * @returns UserWithRole
 */
export const findUserByDodId = async (queryString: string) => {
  return await prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
    include: {
      role: true,
      traineeTrackingRecords: {
        include: { trackingItem: true },
      },
    },
  });
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @param query unique db id
 * @returns UserWithRole
 */
export const findUserById = async (query: string) => {
  return await prisma.user.findUnique({
    where: {
      id: query,
    },
    include: { role: true },
  });
};

export const findUsers = async () => {
  return await prisma.user.findMany();
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @returns User[]
 */
export const getUsers = async () => prisma.user.findMany();

/**
 * Post user method to create the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const createUser = async (user: User, role?: Role) => {
  let roleConnect = {};

  if (role) {
    roleConnect = {
      roleId: role.id,
    };
  }

  return await prisma.user.create({
    data: { ...user, ...roleConnect },
  });
};

/**
 * Put User method to update the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const updateUser = async (user: User) => {
  return prisma.user.update({
    where: { id: user.id },
    data: user,
  });
};

export const updateTempestUserFromCommonApi = async (
  commonApiPerson: IPerson,
  tempestUser: User
) => {
  // turns a common api person into a tempest user
  const tempestUserToUpdate: User = Object.keys(tempestUser).reduce(
    (acc, k) => ({ ...acc, [k]: commonApiPerson[k] }),
    tempestUser
  );

  return prisma.user.update({
    where: { id: commonApiPerson.id },
    data: tempestUserToUpdate,
  });
};

export const findTrackingRecordsByTraineeId = (
  userId: string,
  includeTrackingItem = false
) => {
  return prisma.memberTrackingRecord.findMany({
    where: {
      traineeId: userId,
    },
    include: {
      trackingItem: includeTrackingItem,
      trainee: true,
      authority: true,
    },
  });
};

export const findTrackingRecordsByAuthorityId = (
  userId: string,
  includeTrackingItem = false
) => {
  return prisma.memberTrackingRecord.findMany({
    where: {
      authorityId: userId,
    },
    include: {
      trackingItem: includeTrackingItem,
      trainee: true,
      authority: true,
    },
  });
};

export async function createUserFromCommonApi(commonUser: IPerson) {
  const memberRole = await getRoleByName(ERole.MEMBER);

  const newTempestUser = await createUser(
    {
      id: commonUser.id,
      firstName: commonUser.firstName,
      lastName: commonUser.lastName,
      dodId: commonUser.dodid,
      email: commonUser.email,
    } as User,
    memberRole
  );

  return {
    ...newTempestUser,
    role: memberRole,
  } as UserWithRole;
}
