import { User, Role } from '@prisma/client';
import prisma from '../prisma/prisma';
import { ERole } from '../types/global';
import { IPerson } from './common/types';
import { getRoleByName } from './roleRepo';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';

// required to infer the return type from the Prisma Client
export type UserWithRole = Prisma.PromiseReturnType<typeof findUserByDodId>;
export type UserWithTrackingRecord = Prisma.PromiseReturnType<typeof findTrackingRecordsByAuthorityId>;

export type UserWithAll = Prisma.PromiseReturnType<typeof findUserByIdReturnAllIncludes>;
export type LoggedInUser = Prisma.PromiseReturnType<typeof findUserByDodId>;

export const findUserByIdReturnAllIncludes = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      memberTrackingItems: {
        include: {
          memberTrackingRecords: {
            include: {
              trackingItem: true,
              authority: true,
              trainee: true,
            },
          },
          trackingItem: true,
          user: true,
        },
      },
    },
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
      organization: true,
    },
  });
};

export interface IUserIncludeConfig {
  withMemberTrackingItems: boolean;
  withMemberTrackingRecords: boolean;
  withTrackingItems: boolean;
  // withAuthority: boolean;
}

const defaultConfig: IUserIncludeConfig = {
  withMemberTrackingItems: false,
  withMemberTrackingRecords: false,
  withTrackingItems: false,
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @param query unique db id
 * @returns UserWithRole
 */
export const findUserById = async (query: string, config?: IUserIncludeConfig) => {
  const { withMemberTrackingItems, withMemberTrackingRecords, withTrackingItems } = config ?? defaultConfig;
  return await prisma.user.findUnique({
    where: {
      id: query,
    },
    include: {
      role: true,
      memberTrackingItems: withMemberTrackingItems
        ? {
            include: {
              trackingItem: withTrackingItems,
              memberTrackingRecords: withMemberTrackingRecords
                ? {
                    include: {
                      authority: true,

                      trackingItem: withTrackingItems,
                    },
                    take: 2,
                    orderBy: {
                      order: 'desc',
                    },
                  }
                : false,
            },
          }
        : false,
    },
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

export const updateTempestUserFromCommonApi = async (commonApiPerson: IPerson, tempestUser: User) => {
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

export const findTrackingRecordsByTraineeId = (userId: string, includeTrackingItem = false) => {
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

export const findTrackingRecordsByAuthorityId = (userId: string, includeTrackingItem = false) => {
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

export async function updateLastLogin(id: string) {
  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      lastLogin: dayjs().toDate(),
    },
  });
}
