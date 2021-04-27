import { MemberTrackingRecord, TrackingItem } from '@prisma/client';
import dayjs from 'dayjs';
import React from 'react';
import tw from 'twin.macro';
import RecordTable from './RecordTable';

export const status = (completedDate: Date, interval: number) => {
  const numberOfDaysAfterCompleted = dayjs().diff(completedDate, 'day');
  const DEFAULT_INTERVAL_SMALL = 14;
  const DEFAULT_INTERVAL_MEDIUM = 30;
  const DEFAULT_MIN_INTERVAL = 60;
  const upComing =
    interval <= DEFAULT_MIN_INTERVAL
      ? DEFAULT_INTERVAL_SMALL
      : DEFAULT_INTERVAL_MEDIUM;

  if (numberOfDaysAfterCompleted > interval) {
    return 'Overdue';
  } else if (numberOfDaysAfterCompleted > interval - upComing) {
    return 'Upcoming';
  } else {
    return 'Completed';
  }
};

const MemberRecordTracker: React.FC<{
  trackingRecord: MemberTrackingRecord[];
}> = ({ trackingRecord }) => {
  return <RecordTable trackingRecord={trackingRecord} />;
};

export default MemberRecordTracker;
