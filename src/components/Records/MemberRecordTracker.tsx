import { MemberTrackingRecord, User } from '@prisma/client';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import tw from 'twin.macro';
import RecordTable from './RecordTable';
// Error here says it can't find the import but actual running of the code works.  Error is erroneous
import ErrorIcon from '../../assets/error.svg';
import CautionIcon from '../../assets/caution.svg';
import SuccessIcon from '../../assets/success.svg';
import { RecordWithTrackingItem } from './RecordRow';

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
const Category = tw.div`text-black font-bold mb-1 flex items-center my-5`;

// text color changes extending the Category Base styles
const Overdue = tw(Category)`text-red-600`;
const SignatureRequired = tw(Category)`text-blue-500`;
const ComingDue = tw(Category)`text-yellow-400`;
const Completed = tw(Category)`text-green-400`;

const StyledErrorIcon = tw(ErrorIcon)`ml-3`;
const StyledCautionIcon = tw(CautionIcon)`ml-3`;
const StyledSuccessIcon = tw(SuccessIcon)`ml-3`;

const StyledSignatureRequired = () => (
  <SignatureRequired>
    Awaiting Signature <StyledCautionIcon />
  </SignatureRequired>
);

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

const initSortedCategoryObject = {
  Completed: [],
  Upcoming: [],
  Overdue: [],
  SignatureRequired: [],
};

const sortMemberTrackingRecordsByCategory = (
  trackingRecord: RecordWithTrackingItem,
  setState: React.Dispatch<
    React.SetStateAction<{
      Completed: RecordWithTrackingItem[];
      Upcoming: RecordWithTrackingItem[];
      Overdue: RecordWithTrackingItem[];
      SignatureRequired: RecordWithTrackingItem[];
    }>
  >
) => {
  const category = status(
    trackingRecord.completedDate,
    trackingRecord.trackingItem.interval
  );
  setState((current) => {
    const temp = { ...current };
    if (
      !trackingRecord.traineeSignedDate ||
      !trackingRecord.authoritySignedDate
    ) {
      temp['SignatureRequired'].push(trackingRecord);
    } else {
      temp[category].push(trackingRecord);
    }
    return { ...temp };
  });
};

/**
 *
 * Training Record Functional Component
 */
const MemberRecordTracker: React.FC<{
  trackingRecords: MemberTrackingRecord[];
}> = ({ trackingRecords }) => {
  // Query to fetch all users then save the data keyed by user id
  const { data } = useQuery<User[]>(
    'users',
    async () => await axios.get('/api/user').then((result) => result.data)
  );

  const [sortedByCategory, setSortedByCategory] = useState(
    initSortedCategoryObject
  );

  useEffect(() => {
    if (trackingRecords) {
      trackingRecords.forEach((tr: RecordWithTrackingItem) =>
        sortMemberTrackingRecordsByCategory(tr, setSortedByCategory)
      );
    }
  }, [trackingRecords]);

  console.log(data);
  const Header = tw.h1`text-2xl font-bold text-black`;

  const Table = tw.table`text-black text-left w-full`;
  return (
    <>
      <Header>Training Record</Header>
      <Table>
        {sortedByCategory['SignatureRequired'].length > 0 ? (
          <RecordTable mtr={sortedByCategory['SignatureRequired']}>
            <StyledSignatureRequired />
          </RecordTable>
        ) : undefined}
        {sortedByCategory['Overdue'].length > 0 ? (
          <RecordTable mtr={sortedByCategory['Overdue']}>
            <StyledOverDue />
          </RecordTable>
        ) : undefined}
        {sortedByCategory['Upcoming'].length > 0 ? (
          <RecordTable mtr={sortedByCategory['Upcoming']}>
            <StyledComingDue />
          </RecordTable>
        ) : undefined}
        {sortedByCategory['Completed'].length > 0 ? (
          <RecordTable mtr={sortedByCategory['Completed']}>
            <StyledCompleted />
          </RecordTable>
        ) : undefined}
      </Table>
    </>
  );
};

export default MemberRecordTracker;
