import { ECategorie } from '../const/enums';
const dayjs = require('dayjs');
import { MemberTrackingRecord } from '.prisma/client';
/**
 * Function to get the status text of a tracking item
 * Function will return Completed, Upcoming or overdue based on time since completed date vs the interval
 * @param completedDate
 * @param interval
 * @returns
 */
export const getStatus = (completedDate: Date, interval: number) => {
  const numberOfDaysAfterCompleted = dayjs().diff(completedDate, 'day');
  const DEFAULT_INTERVAL_SMALL = 14;
  const DEFAULT_INTERVAL_MEDIUM = 30;
  const DEFAULT_MIN_INTERVAL = 60;
  const upComing = interval <= DEFAULT_MIN_INTERVAL ? DEFAULT_INTERVAL_SMALL : DEFAULT_INTERVAL_MEDIUM;

  if (interval === 0) {
    return ECategorie.DONE;
  }

  if (numberOfDaysAfterCompleted >= interval) {
    return ECategorie.OVERDUE;
  } else if (numberOfDaysAfterCompleted >= interval - upComing) {
    return ECategorie.UPCOMING;
  } else {
    return ECategorie.DONE;
  }
};

export const getCategory = (memberTrackingRecord: MemberTrackingRecord, trackingItemInterval: number) => {
  if (!memberTrackingRecord.completedDate) {
    return ECategorie.TODO;
  }

  if (!memberTrackingRecord.authoritySignedDate || !memberTrackingRecord.traineeSignedDate) {
    return ECategorie.SIGNATURE_REQUIRED;
  }

  return getStatus(memberTrackingRecord.completedDate, trackingItemInterval);
};

export const memberTrackingRecordIsComplete = (memberTrackingRecord: MemberTrackingRecord) => {
  return (
    memberTrackingRecord.completedDate !== null &&
    memberTrackingRecord.authoritySignedDate !== null &&
    memberTrackingRecord.traineeSignedDate !== null
  );
};
