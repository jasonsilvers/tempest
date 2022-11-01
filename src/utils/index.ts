import { MemberTrackingRecordWithAll } from '../repositories/memberTrackingRepo';

export const findCompletedMemberTrackingRecord = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  return memberTrackingRecords.find(
    (mtr) => mtr.completedDate !== null && mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null
  );
};

export const findInprogressMemberTrackingRecord = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  return memberTrackingRecords.find(
    (mtr) => mtr.completedDate === null || mtr.traineeSignedDate === null || mtr.authoritySignedDate === null
  );
};

export const removeAllInProgressRecords = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  return memberTrackingRecords.filter(
    (mtr) => mtr.authoritySignedDate === null || mtr.traineeSignedDate === null || mtr.completedDate === null
  );
};

export const removeOldCompletedRecords = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  const inProgressMemberTrackingRecords = removeAllInProgressRecords(memberTrackingRecords);

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

export const removeInProgressRecords = (memberTrackingRecords: MemberTrackingRecordWithAll[]) => {
  return memberTrackingRecords.filter((mtr) => mtr.authoritySignedDate !== null && mtr.traineeSignedDate !== null);
};
