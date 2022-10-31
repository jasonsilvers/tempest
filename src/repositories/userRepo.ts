import { MemberTrackingItemStatus, Organization, Prisma, Role, User } from '@prisma/client';
import { EMtrVariant, EUserResources } from '../const/enums';
import prisma from '../prisma/prisma';
import { getOrganizationAndDown } from './organizationRepo';

const dayjs = require('dayjs');

export const findUserByIdReturnAllIncludes = async (userId: number) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      role: true,
      organization: true,
      reportingOrganization: true,
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

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      role: true,
      organization: true,
      reportingOrganization: true,
    },
  });
};

export const findUserByIdWithMemberTrackingItems = async (
  id: number,
  resource: EUserResources,
  variant: EMtrVariant
) => {
  const whereInProgressVariant = { where: { OR: [{ traineeSignedDate: null }, { authoritySignedDate: null }] } };
  const whereCompletedVariant = { where: { NOT: [{ traineeSignedDate: null }, { authoritySignedDate: null }] } };
  let whereVariant = { where: {} };

  if (variant === EMtrVariant.IN_PROGRESS) {
    whereVariant = whereInProgressVariant;
  }

  if (variant === EMtrVariant.COMPLETED || variant === EMtrVariant.ARCHIVED) {
    whereVariant = whereCompletedVariant;
  }

  const statusWhere =
    variant !== EMtrVariant.ARCHIVED ? MemberTrackingItemStatus.ACTIVE : MemberTrackingItemStatus.INACTIVE;

  return prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      memberTrackingItems:
        resource === EUserResources.MEMBER_TRACKING_ITEMS
          ? {
              where:
                variant === EMtrVariant.ALL
                  ? {}
                  : {
                      status: statusWhere,
                    },
              include: {
                trackingItem: true,
                memberTrackingRecords: {
                  ...whereVariant,
                  orderBy: {
                    order: 'desc',
                  },
                  include: {
                    trackingItem: true,
                    authority: true,
                    trainee: true,
                  },
                },
              },
            }
          : {},
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      role: true,
      organization: true,
      reportingOrganization: true,
    },
  });
};

/**
 * Get user method to query the PSQL db though the prisma client
 *
 * @returns User[]
 */
export const getUsers = async () =>
  prisma.user.findMany({
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
        },
      },
    },
  });

export const getUsersWithMemberTrackingRecordsByOrgId = async (organizationId: number) => {
  return prisma.user.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      lastName: 'asc',
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
    orderBy: {
      lastName: 'asc',
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
        },
      },
    },
  });
};

export const getAllDetachedUsers = async () => {
  return prisma.user.findMany({
    where: {
      organizationId: null,
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
        },
      },
    },
  });
};

export const getAllUsersFromUsersOrgCascade = async (organizationId: number) => {
  let organizations: Organization[];

  try {
    organizations = await getOrganizationAndDown(organizationId);
  } catch (e) {
    throw new Error('There was an error getting organization tree');
  }

  const organizationIds = organizations.map((org) => org.id);

  return prisma.user.findMany({
    where: {
      organizationId: {
        in: organizationIds,
      },
    },
    orderBy: {
      lastName: 'asc',
    },
    include: {
      role: true,
      memberTrackingItems: {
        include: {
          trackingItem: true,
          memberTrackingRecords: true,
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

export const deleteUser = async (userId: number) => {
  return prisma.user.delete({
    where: {
      id: userId,
    },
  });
};

/**
 * Put User method to update the PSQL db though the prisma client
 *
 * @param user
 * @returns User
 */
export const updateUser = async (userId: number, data: Partial<User>) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

export const findTrackingRecordsByTraineeId = (userId: number, includeTrackingItem = false) => {
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

export const findTrackingRecordsByAuthorityId = (userId: number, includeTrackingItem = false) => {
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

export async function updateLastLogin(id: number) {
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

export async function updateUserRole(id: number, roleName: string) {
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
      reportingOrganization: true,
    },
  });
}

// required to infer the return type from the Prisma Client
export type UserWithMemberTrackingItems = Prisma.PromiseReturnType<typeof findUserByIdWithMemberTrackingItems>;
export type FindUserById = Prisma.PromiseReturnType<typeof findUserById>;
export type UserWithAll = Prisma.PromiseReturnType<typeof findUserByIdReturnAllIncludes>;
export type LoggedInUser = Prisma.PromiseReturnType<typeof findUserByEmail>;
export type UsersWithMemberTrackingRecords = Prisma.PromiseReturnType<typeof getUsersWithMemberTrackingRecordsByOrgId>;
