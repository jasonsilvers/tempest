import { MemberTrackingRecord, TrackingItem, User } from '.prisma/client';

type MemberTrackingRecordWithAll = MemberTrackingRecord & {
  trackingItem: TrackingItem;
  authority: User;
  trainee: User;
};

export const removeOldCompletedRecords = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  const inProgressMemberTrackingRecords = memberTrackingRecords.filter(
    (mtr) => mtr.authoritySignedDate === null || mtr.traineeSignedDate === null || mtr.completedDate === null
  );

  const latestCompleteMemberTrackingRecord = memberTrackingRecords
    .filter((mtr) => mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null && mtr.completedDate !== null)
    .sort((firstMtr, secondMtr) => {
      if (firstMtr.completedDate < secondMtr.completedDate) {
        return 1;
      }

      if (firstMtr.completedDate > secondMtr.completedDate) {
        return -1;
      }

      return 0;
    })[0];

  return [...inProgressMemberTrackingRecords, latestCompleteMemberTrackingRecord].filter((mtr) => mtr !== undefined);
};
