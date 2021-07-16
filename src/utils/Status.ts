import { ECategories } from '../types/global';
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

  if (numberOfDaysAfterCompleted >= interval) {
    return ECategories.OVERDUE;
  } else if (numberOfDaysAfterCompleted >= interval - upComing) {
    return ECategories.UPCOMING;
  } else {
    return ECategories.DONE;
  }
};

export const getCategory = (memberTrackingRecord: MemberTrackingRecord, trackingItemInterval: number) => {
  if (!memberTrackingRecord.completedDate) {
    return ECategories.TODO;
  }

  if (!memberTrackingRecord.authoritySignedDate || !memberTrackingRecord.traineeSignedDate) {
    return ECategories.SIGNATURE_REQUIRED;
  }

  return getStatus(memberTrackingRecord.completedDate, trackingItemInterval);
};
