import { MemberTrackingRecord } from '@prisma/client';
import dayjs from 'dayjs';
import React, { LegacyRef, useMemo, useRef, useState } from 'react';
import tw from 'twin.macro';
import RecordTable from './RecordTable';
import { RecordWithTrackingItem } from './RecordRow';
import HeaderUser from './RecordHeader';
import Tab from './Tab';
import { MemberTrackingItemWithMemberTrackingRecord } from '../../repositories/memberTrackingRepo';

export enum ECategories {
  ALL = 'All',
  DONE = 'Done',
  UPCOMING = 'Upcoming',
  OVERDUE = 'Overdue',
  SIGNATURE_REQUIRED = 'SignatureRequired',
  ARCHIVED = 'Archived',
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

  if (numberOfDaysAfterCompleted >= interval) {
    return ECategories.OVERDUE;
  } else if (numberOfDaysAfterCompleted >= interval - upComing) {
    return ECategories.UPCOMING;
  } else {
    return ECategories.DONE;
  }
};

// Twin macro styles for table and headers
const Header = tw.h1`text-2xl font-bold text-black`;

const TabContainer = tw.div`flex space-x-3 justify-between min-w-min border-b border-color[#AEAEAE]`;

// initial object keyed by tracking item status
type MemberTrackingRecordCategories = {
  [K in ECategories]: RecordWithTrackingItem[] | MemberTrackingRecord[];
};

/**
 * Function to sort tracking items by category
 * Needs a React Dispatch function to update component state correctly
 * @param trackingRecord
 * @param setState
 */
const sortMemberTrackingItemstrackingItemsByCategory = (
  trackingRecord: RecordWithTrackingItem,
  initObj: MemberTrackingRecordCategories
) => {
  // update state

  const temp = { ...initObj };
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
  // add all to the all category
  temp[ECategories.ALL].push(trackingRecord);
  return { ...temp };
};

const initStateCategories = (
  trackingItems: MemberTrackingItemWithMemberTrackingRecord[]
) => {
  let newState = {
    All: [],
    Done: [],
    Upcoming: [],
    Overdue: [],
    SignatureRequired: [],
    Archived: [],
  };

  if (trackingItems) {
    trackingItems.forEach((item) => {
      if (item.isActive) {
        // grab last two records
        // prettier-ignore
        const firstOrderRecord = item.memberTrackingRecords[0] as RecordWithTrackingItem;
        // prettier-ignore
        const secondOrderRecord = item.memberTrackingRecords[1] as RecordWithTrackingItem;
        // for long if block which is confusing when prettied
        // prettier-ignore
        if ( firstOrderRecord.authoritySignedDate && firstOrderRecord.traineeSignedDate) {
            // if both dates are signed then the secondOrderRecord is irrelevant
            newState = sortMemberTrackingItemstrackingItemsByCategory(firstOrderRecord, newState)
        }
        else{
        //   // both records are relevant
          newState = sortMemberTrackingItemstrackingItemsByCategory(firstOrderRecord, newState)
          if(secondOrderRecord){
          newState = sortMemberTrackingItemstrackingItemsByCategory(secondOrderRecord, newState)
          }
        }
      }
      // if not active push to the archive category
      else {
        newState = {
          ...newState,
          Archived: [...newState.Archived, item[0]],
        };
      }
    });
  }

  return newState;
};
const TabAndTableContainer = tw.div`flex flex-col min-w-min max-w-max`;

/**
 *
 * Training Record Functional Component
 */
const MemberItemTracker: React.FC<{
  trackingItems: MemberTrackingItemWithMemberTrackingRecord[];
}> = ({ trackingItems }) => {
  // Query to fetch all users then save the data keyed by user id

  const [sortedByCategory, setSortedByCategory] = useState(() =>
    initStateCategories(trackingItems)
  );
  const [activeCategory, setActiveCategory] = useState(ECategories.ALL);

  useMemo(() => {
    setSortedByCategory(initStateCategories(trackingItems));
  }, [trackingItems]);

  const toggleTab = (newCategory: ECategories) => {
    setActiveCategory(newCategory);
  };

  const widthRef = useRef(0);
  const TabAndTableRef: LegacyRef<HTMLDivElement> = useRef();

  // fixes the container div from collapsing if the list is empty
  useMemo(() => {
    if (TabAndTableRef.current) {
      const width = TabAndTableRef.current.clientWidth;
      const max_width = TabAndTableRef.current.style.maxWidth;
      widthRef.current = width;

      if (
        sortedByCategory[activeCategory].length > 0 && max_width !== 'max-content') {
        TabAndTableRef.current.style.maxWidth = 'max-content';
      } else {
        TabAndTableRef.current.style.maxWidth = widthRef.current + 'px';
      }
    }
  }, [activeCategory, sortedByCategory]);

  return (
    <div tw='mr-5 pr-10 w-9/12'>
      <HeaderUser />
      <Header>Training Record</Header>
      <TabAndTableContainer ref={TabAndTableRef}>
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
            count={sortedByCategory.Overdue.length}
          >
            Overdue
          </Tab>
          <Tab
            category={ECategories.UPCOMING}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={sortedByCategory.Upcoming.length}
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

        <RecordTable memberTrackingRecords={sortedByCategory[activeCategory]} />
      </TabAndTableContainer>
    </div>
  );
};

export default MemberItemTracker;
