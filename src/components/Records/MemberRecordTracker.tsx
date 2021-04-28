import { MemberTrackingRecord, User } from '@prisma/client';
import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import tw from 'twin.macro';
import RecordTable from './RecordTable';
// Error here says it can't find the import but actual running of the code works.  Error is erroneous
import ErrorIcon from '../../assets/error.svg';
import CautionIcon from '../../assets/caution.svg';
import SuccessIcon from '../../assets/success.svg';

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

// Base Category style
const Category = tw.div`text-black font-bold mb-1 flex items-center`;

// text color changes extending the Category Base styles
const Overdue = tw(Category)`text-red-600`;
const ComingDue = tw(Category)`text-yellow-400`;
const Completed = tw(Category)`text-green-400`;

const StyledErrorIcon = tw(ErrorIcon)`ml-3`;
const StyledCautionIcon = tw(CautionIcon)`ml-3`;
const StyledSuccessIcon = tw(SuccessIcon)`ml-3`;

const StyledOverDue = () => (
  <Overdue>
    Overdue <StyledErrorIcon />
  </Overdue>
);

const StyledComingDue = () => (
  <ComingDue>
    Coming Due <StyledCautionIcon />
  </ComingDue>
);

const StyledCompleted = () => (
  <Completed>
    Completed
    <StyledSuccessIcon />
  </Completed>
);
/**
 *
 * Training Record Functional Component
 */
const MemberRecordTracker: React.FC<{
  trackingRecord: MemberTrackingRecord[];
}> = ({ trackingRecord }) => {
  // Query to fetch all users then save the data keyed by user id
  const { data } = useQuery<User[]>(
    'users',
    async () => await axios.get('/api/user').then((result) => result.data)
  );

  console.log(data);
  const Header = tw.h1`text-2xl font-bold text-black`;
  return (
    <>
      <Header>Training Record</Header>
      <RecordTable mtr={trackingRecord}>
        <StyledOverDue />
      </RecordTable>
      <RecordTable mtr={trackingRecord}>
        <StyledComingDue />
      </RecordTable>
      <RecordTable mtr={trackingRecord}>
        <StyledCompleted />
      </RecordTable>
    </>
  );
};

export default MemberRecordTracker;
