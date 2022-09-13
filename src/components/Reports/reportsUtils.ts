import { MemberTrackingRecord } from '@prisma/client';
import { MemberTrackingItemWithAll } from '../../repositories/memberTrackingRepo';
import { getStatus } from '../../utils/status';
import { StatusCounts, UserCounts, AllCounts } from '../Dashboard/Types';

export const addMemberCounts = (
  mti: MemberTrackingItemWithAll,
  mtr: MemberTrackingRecord,
  specificCountsForMember: UserCounts
) => {
  if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
    const status = getStatus(mtr.completedDate, mti.trackingItem.interval);
    specificCountsForMember[status] = specificCountsForMember[status] + 1;
  }
};

export const addOverallCounts = (
  mti: MemberTrackingItemWithAll,
  mtr: MemberTrackingRecord,
  membersCount: StatusCounts
): AllCounts => {
  if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
    const status = getStatus(mtr.completedDate, mti.trackingItem.interval);

    membersCount[status] = membersCount[status] + 1;
  }
  return membersCount;
};
