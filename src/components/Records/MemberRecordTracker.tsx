import { MemberTrackingRecord, User } from '@prisma/client';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import tw from 'twin.macro';
import RecordTable from './RecordTable';
import {
  RecordWithTrackingItem,
  RecordWithTrackingItemStatus,
} from './RecordRow';
import HeaderUser from './RecordHeader';
import Tab from './Tab';
import RecordCards from './RecordCards';

/**
 * Function to get the status text of a tracking item
 * Function will return Completed, Upcoming or overdue based on time since completed date vs the interval
 * @param completedDate
 * @param interval
 * @returns
 */
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
    return 'Done';
  }
};

// Twin macro styles for table and headers
const Header = tw.h1`text-2xl font-bold text-black`;

const TabContainer = tw.div`flex space-x-16 border-b border-color[#AEAEAE]`;

// initial object keyed by tracking item status
const initSortedCategoryObject: {
  [K in RecordWithTrackingItemStatus]:
    | RecordWithTrackingItem[]
    | MemberTrackingRecord[];
} = {
  All: [],
  Done: [],
  Upcoming: [],
  Overdue: [],
  SignatureRequired: [],
};

/**
 * Function to sort tracking items by category
 * Needs a React Dispatch function to update component state correctly
 * @param trackingRecord
 * @param setState
 */
const sortMemberTrackingRecordsByCategory = (
  trackingRecord: RecordWithTrackingItem,
  setState: React.Dispatch<
    React.SetStateAction<typeof initSortedCategoryObject>
  >
) => {
  // update state
  setState((current) => {
    const temp = { ...current };
    // if neither signature block is signed sort the item to Signature Required
    if (
      !trackingRecord.traineeSignedDate ||
      !trackingRecord.authoritySignedDate
    ) {
      trackingRecord.status = 'SignatureRequired';
      temp['SignatureRequired'].push(trackingRecord);
    } else {
      // else grab the text from the status function in order to sort this tracking item accordingly
      const category = status(
        trackingRecord.completedDate,
        trackingRecord.trackingItem.interval
      );
      trackingRecord.status = category;
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

  const [activeCategory, setActiveCategory] = useState('All');

  // sort on initial load
  // and if the tracking Records change then lets re-sort
  useMemo(() => {
    if (trackingRecords) {
      setSortedByCategory((current) => ({ ...current, All: trackingRecords }));
      trackingRecords.forEach((tr: RecordWithTrackingItem) =>
        sortMemberTrackingRecordsByCategory(tr, setSortedByCategory)
      );
    }
  }, [trackingRecords]);

  const toggleTab = (e: React.MouseEvent) => {
    setActiveCategory(e.currentTarget.id);
  };

  return (
    <div tw={'mr-5'}>
      <HeaderUser />
      <Header>Training Record</Header>
      <TabContainer tw={'flex space-x-16'} id="Filter Tabs">
        <Tab onClick={toggleTab} activeCategory={activeCategory}>
          All
        </Tab>
        <Tab
          onClick={toggleTab}
          activeCategory={activeCategory}
          count={sortedByCategory['Overdue'].length}
        >
          Overdue
        </Tab>
        <Tab
          onClick={toggleTab}
          activeCategory={activeCategory}
          count={sortedByCategory['Upcoming'].length}
        >
          Upcoming
        </Tab>
        <Tab onClick={toggleTab} activeCategory={activeCategory}>
          Done
        </Tab>
      </TabContainer>

      <RecordTable mtr={sortedByCategory[activeCategory]} />
      {/* <RecordCards mtr={sortedByCategory[activeCategory]} /> */}
    </div>
  );
};

export default MemberRecordTracker;
