import { User, Role, Prisma } from '@prisma/client';
import prisma from '../prisma/prisma';
import { ERole, EUserIncludes } from '../const/enums';
import { IPerson } from './common/types';
import { getRoleByName } from './roleRepo';
const dayjs = require('dayjs');

export const findUserByIdReturnAllIncludes = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
      organization: true,
      traineeTrackingRecords: {
        include: {
          trackingItem: true,
        },
      },
      authorityTrackingRecords: true,
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

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      role: true,
    },
  });
};

export const findUserByIdWithMemberTrackingItems = async (id: string, variant: EUserIncludes) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      memberTrackingItems: {
        include: {
          trackingItem: variant === EUserIncludes.TRACKING_ITEM,
        },
      },
    },
  });
};

export const findUserByDodId = async (queryString: string) => {
  return prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
    include: {
      role: true,
      organization: true,
    },
  });
};

/**
 * Get user method to query the PSQL db though tπuhe prisma client
 *
 * @param query unique db id
 * @returns UserWithRole
 */

export const findUsers = async () => {
  return prisma.user.findMany({
    include: {
      role: true,
      organization: true,
    },
  });
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @returns User[]
 */
export const getUsers = async () => prisma.user.findMany();

export const getUsersWithMemberTrackingRecordsByOrgId = async (organizationId: string) => {
  return prisma.user.findMany({
    where: {
      organizationId,
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: {
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
};

export const getUsersWithMemberTrackingRecords = async () => {
  return prisma.user.findMany({
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: {
            orderBy: {
              order: 'desc',
            },
          },
        },
      },
    },
  });
};

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

  return prisma.user.create({
    data: { ...user, ...roleConnect },
  });
};

/**
 * Put User method to update the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const updateUser = async (userId: string, data: User) => {
  return prisma.user.update({
    where: { id: userId },
    data,
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
  } as LoggedInUser;
}

export async function updateLastLogin(id: string) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      lastLogin: dayjs().toDate(),
    },
    include: {
      role: true,
      organization: true,
    },
  });
}

export async function updateUserRole(id: string, roleName: string) {
  const role = await prisma.role.findUnique({
    where: {
      name: roleName,
    },
  });

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      roleId: role.id,
    },
    include: {
      role: true,
      organization: true,
    },
  });
}

// required to infer the return type from the Prisma Client
export type UserWithMemberTrackingItems = Prisma.PromiseReturnType<typeof findUserByIdWithMemberTrackingItems>;
export type UserWithAll = Prisma.PromiseReturnType<typeof findUserByIdReturnAllIncludes>;
export type LoggedInUser = Prisma.PromiseReturnType<typeof findUserByDodId>;
export type UsersWithMemberTrackingRecords = Prisma.PromiseReturnType<typeof getUsersWithMemberTrackingRecordsByOrgId>;
