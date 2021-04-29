import { MemberTrackingRecord } from '.prisma/client';
import prisma from '../prisma/prisma';

export const updateMemberTrackingRecord = async (
  id: number,
  memberTrackingRecord: MemberTrackingRecord
) => {
  let completedDate = null;
  if (memberTrackingRecord.authoritySignedDate) {
    completedDate = memberTrackingRecord.traineeSignedDate;
  }

  if (memberTrackingRecord.traineeSignedDate) {
    completedDate = memberTrackingRecord.authoritySignedDate;
  }

  return prisma.memberTrackingRecord.update({
    where: { id },
    data: memberTrackingRecord,
  });
};

export const deleteMemberTrackingRecord = async (id: number) => {
  return await prisma.memberTrackingRecord.delete({
    where: {
      id,
    },
  });
};

export const findMemberTrackingRecordById = async (id: number) => {
  return await prisma.memberTrackingRecord.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Post Member Tracking Record method to update the PSQL db though the prisma client
 *
 * @param mtr : Member Tracking Record
 * @returns MemberTrackingRecord
 */
export const createTrackingRecord = async (mtr: MemberTrackingRecord) => {
  return prisma.memberTrackingRecord.create({
    data: mtr,
  });
};
