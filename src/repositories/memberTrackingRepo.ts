import { MemberTrackingItem, MemberTrackingRecord, Prisma } from '.prisma/client';
import prisma from '../prisma/prisma';
import { ECategories } from '../const/enums';
import { filterObject } from '../utils/FilterObject';

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

export const findMemberTrackingRecords = async (trackingItemId: number, userId: string) => {
  return prisma.memberTrackingRecord.findMany({
    where: {
      memberTrackingItems: {
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
    memberTrackingItems: {
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
  userId: string,
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

export const updateMemberTrackingItem = async (trackingItemId: number, userId: string, data: MemberTrackingItem) => {
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

export const deleteMemberTrackingItem = async (trackingItemId: number, userId: string) => {
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

/**
 * GIVE ME EVERYTHING TYPE
 */
export type MemberTrackingItemWithAll = Prisma.PromiseReturnType<typeof findMemberTrackingItemByIdAll>;

export const findMemberTrackingItemByIdAll = async (userId: string, trackingItemId: number) => {
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

export const countMemberTrackingRecordsForMemberTrackingItem = (trackingItemId: number, userId: string) => {
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
