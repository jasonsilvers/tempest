import { MemberTrackingItem, MemberTrackingRecord, User } from '@prisma/client';
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

enum ECategories {
  ALL = 'All',
  DONE = 'Done',
  UPCOMING = 'Upcoming',
  OVERDUE = 'Overdue',
  SIGNATURE_REQUIRED = 'SignatureRequired',
}

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
    return ECategories.OVERDUE;
  } else if (numberOfDaysAfterCompleted > interval - upComing) {
    return ECategories.UPCOMING;
  } else {
    return ECategories.DONE;
  }
};

// Twin macro styles for table and headers
const Header = tw.h1`text-2xl font-bold text-black`;

const TabContainer = tw.div`flex space-x-3 justify-between min-w-min border-b border-color[#AEAEAE]`;

// initial object keyed by tracking item status
const initSortedCategoryObject: {
  [K in RecordWithTrackingItemStatus]:
    | RecordWithTrackingItem[]
    | MemberTrackingRecord[];
} = {
  [ECategories.ALL]: [],
  [ECategories.DONE]: [],
  [ECategories.UPCOMING]: [],
  [ECategories.OVERDUE]: [],
  [ECategories.SIGNATURE_REQUIRED]: [],
};

/**
 * Function to sort tracking items by category
 * Needs a React Dispatch function to update component state correctly
 * @param trackingRecord
 * @param setState
 */
const sortMemberTrackingItemstrackingItemsByCategory = (
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
      trackingRecord.status = ECategories.SIGNATURE_REQUIRED;
      temp[ECategories.SIGNATURE_REQUIRED].push(trackingRecord);
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
const MemberItemTracker: React.FC<{
  trackingItems: MemberTrackingItem[];
}> = ({ trackingItems }) => {
  // Query to fetch all users then save the data keyed by user id

  const [sortedByCategory, setSortedByCategory] = useState(
    initSortedCategoryObject
  );

  const [activeCategory, setActiveCategory] = useState(ECategories.ALL);

  // sort on initial load
  // and if the tracking Records change then lets re-sort

  const toggleTab = (newCategory: ECategories) => {
    setActiveCategory(newCategory);
  };

  return (
    <div tw={'mr-5 pr-10 w-9/12'}>
      <HeaderUser />
      <Header>Training Record</Header>
      <div tw="flex flex-col min-w-min max-w-max">
        <TabContainer id="Filter Tabs">
          <Tab
            category={ECategories.ALL}
            onClick={toggleTab}
            activeCategory={activeCategory}
          >
            All
          </Tab>
          <Tab
            category={ECategories.OVERDUE}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={sortedByCategory['Overdue'].length}
          >
            Overdue
          </Tab>
          <Tab
            category={ECategories.UPCOMING}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={sortedByCategory['Upcoming'].length}
          >
            Upcoming
          </Tab>
          <Tab
            category={ECategories.DONE}
            onClick={toggleTab}
            activeCategory={activeCategory}
          >
            Done
          </Tab>
          <Tab
            category={ECategories.SIGNATURE_REQUIRED}
            onClick={toggleTab}
            activeCategory={activeCategory}
          >
            Awaiting Signature
          </Tab>
        </TabContainer>

        <RecordTable mtr={sortedByCategory[activeCategory]} />
      </div>
    </div>
  );
};

export default MemberItemTracker;
