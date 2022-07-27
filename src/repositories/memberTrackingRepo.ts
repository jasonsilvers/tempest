import { MemberTrackingItem, MemberTrackingRecord, Prisma } from '.prisma/client';
import prisma from '../prisma/prisma';
import { ECategories } from '../const/enums';
import { filterObject } from '../utils/filterObject';

export const updateMemberTrackingRecord = async (id: number, memberTrackingRecord: MemberTrackingRecord) => {
  return prisma.memberTrackingRecord.update({
    where: { id },
    data: { ...memberTrackingRecord },
  });
};

export const deleteMemberTrackingRecord = async (id: number) => {
  return prisma.memberTrackingRecord.delete({
    where: {
      id,
    },
  });
};

export const deleteAllMemberTrackingRecordsForUserId = async (userId: number) => {
  return prisma.memberTrackingRecord.deleteMany({
    where: {
      traineeId: userId,
    },
  });
};

export const deleteAllMemberTrackingItemsForUserId = async (userId: number) => {
  return prisma.memberTrackingItem.deleteMany({
    where: {
      userId,
    },
  });
};

export const findMemberTrackingRecords = async (trackingItemId: number, userId: number) => {
  return prisma.memberTrackingRecord.findMany({
    where: {
      memberTrackingItem: {
        userId,
        trackingItemId,
      },
    },
  });
};

export type MemberTrackingRecordWithUsers = Prisma.PromiseReturnType<typeof findMemberTrackingRecordById>;

export const findMemberTrackingRecordById = async (id: number, withTrackingItem = false) => {
  return prisma.memberTrackingRecord.findUnique({
    where: {
      id,
    },
    include: {
      memberTrackingItem: {
        include: {
          user: true,
        },
      },
      trackingItem: withTrackingItem,
      authority: true,
      trainee: true,
    },
  });
};

/**
 * Post Member Tracking Record method to update the PSQL db though the prisma client
 *
 * @param mtr : Member Tracking Record
 * @returns MemberTrackingRecord
 */
export const createMemberTrackingRecord = async (
  newMtr: Partial<MemberTrackingRecord>,
  { includeTrackingItem } = { includeTrackingItem: false }
) => {
  const count = await prisma.memberTrackingRecord.count({
    where: {
      trackingItemId: newMtr.trackingItemId,
    },
  });
  const filteredData = filterObject(newMtr, ['trackingItemId', 'traineeId']);
  const newMtrData: Prisma.MemberTrackingRecordCreateInput = {
    ...filteredData,
    order: count + 1,
    memberTrackingItem: {
      connect: {
        userId_trackingItemId: {
          userId: newMtr.traineeId,
          trackingItemId: newMtr.trackingItemId,
        },
      },
    },
  };

  return prisma.memberTrackingRecord.create({
    data: newMtrData,
    include: {
      trackingItem: includeTrackingItem,
    },
  });
};

export const findMemberTrackingItemById = async (
  trackingItemId: number,
  userId: number,
  { withMemberTrackingRecords = false, withTrackingItems = false } = {}
) => {
  return prisma.memberTrackingItem.findUnique({
    where: {
      userId_trackingItemId: {
        userId,
        trackingItemId,
      },
    },
    include: {
      user: true,
      trackingItem: withTrackingItems,
      memberTrackingRecords: withMemberTrackingRecords
        ? {
            include: {
              authority: true,
              trackingItem: withTrackingItems,
            },
            orderBy: {
              order: 'desc',
            },
          }
        : false,
    },
  });
};

export const updateMemberTrackingItem = async (trackingItemId: number, userId: number, data: MemberTrackingItem) => {
  return prisma.memberTrackingItem.update({
    data,
    where: {
      userId_trackingItemId: {
        userId,
        trackingItemId,
      },
    },
  });
};

export const deleteMemberTrackingItem = async (trackingItemId: number, userId: number) => {
  return prisma.memberTrackingItem.delete({
    where: {
      userId_trackingItemId: {
        userId,
        trackingItemId,
      },
    },
  });
};

export const createMemberTrackingItem = async (newMti: MemberTrackingItem) => {
  return prisma.memberTrackingItem.create({
    data: newMti,
    include: {
      memberTrackingRecords: true,
    },
  });
};

export const findMemberTrackingItemByUserId = async (userId: number, trackingItemId: number) => {
  return prisma.memberTrackingItem.findUnique({
    include: {
      memberTrackingRecords: true,
    },
    where: {
      userId_trackingItemId: {
        userId,
        trackingItemId,
      },
    },
  });
};

/**
 * GIVE ME EVERYTHING TYPE
 */
export type MemberTrackingItemWithAll = Prisma.PromiseReturnType<typeof findMemberTrackingItemByIdAll>;

export const findMemberTrackingItemByIdAll = async (userId: number, trackingItemId: number) => {
  return prisma.memberTrackingItem.findUnique({
    where: {
      userId_trackingItemId: { trackingItemId, userId },
    },
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
  });
};

export const countMemberTrackingRecordsForMemberTrackingItem = (trackingItemId: number, userId: number) => {
  return prisma.memberTrackingRecord.aggregate({
    _count: {
      trackingItemId: true,
    },
    where: {
      traineeId: userId,
      trackingItemId,
    },
  });
};

export type MemberTrackingItemWithMTRStatus = MemberTrackingItemWithAll & {
  status: {
    [ECategories.OVERDUE]: number;
    [ECategories.DONE]: number;
    [ECategories.SIGNATURE_REQUIRED]: number;
    [ECategories.UPCOMING]: number;
    [ECategories.TODO]: number;
    [ECategories.ARCHIVED]: number;
  };
};
