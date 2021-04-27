import { MemberTrackingRecord, TrackingItem } from '@prisma/client';
import dayjs from 'dayjs';
import React from 'react';

type MemberTrackingRecordTracker = MemberTrackingRecord & {
  trackingItem: TrackingItem;
};

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
  return (
    <table>
      <thead>
        <tr>
          <th>All Training</th>
          <th>Current</th>
          <th>Upcoming</th>
          <th>Overdue</th>
        </tr>
      </thead>
      <tbody>
        {trackingRecord.map((entry: MemberTrackingRecordTracker) => {
          return (
            <tr key={entry.id}>
              <td>{entry.trackingItem.title}</td>
              <td>located at</td>
              <td>
                {status(entry.completedDate, entry.trackingItem.interval)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default MemberRecordTracker;
