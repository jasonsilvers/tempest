import React, { LegacyRef, useRef, useState } from 'react';
import tw from 'twin.macro';
import MemberTrackingItemTable from './MemberTrackingItemTable';
import HeaderUser from './RecordHeader';
import Tab from './Tab';
import { Link } from '../../lib/ui';
import { ECategories } from '../../types/global';
import { AddMemberTrackingItemDialog } from './AddMemberTrackingItemDialog';
import { useMemberRecordTrackerState } from '../../hooks/uiState';

// Twin macro styles for table and headers
const Header = tw.h1`text-2xl font-bold text-black`;

const TabContainer = tw.div`flex space-x-3 justify-between min-w-min border-b border-color[#AEAEAE]`;

const TabAndTableContainer = tw.div`flex flex-col min-w-min max-w-max`;

/**
 *
 * Training Record Functional Component
 */
const MemberItemTracker: React.FC<{ userId: string }> = ({ userId }) => {
  const [openAddNewModal, setAddNewModal] = useState(false);

  const [categoryCount, activeCategory, toggleTab] = useMemberRecordTrackerState((state) => [
    state.count,
    state.activeCategory,
    state.setActiveCategory,
  ]);

  const TabAndTableRef: LegacyRef<HTMLDivElement> = useRef();

  return (
    <div tw="mr-5 pr-10 w-9/12">
      <HeaderUser />
      <Header>Training Record</Header>
      <TabAndTableContainer ref={TabAndTableRef}>
        <TabContainer id="Filter Tabs">
          <Tab category={ECategories.ALL} onClick={toggleTab} activeCategory={activeCategory}>
            All
          </Tab>
          <Tab
            category={ECategories.OVERDUE}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={categoryCount.Overdue}
          >
            Overdue
          </Tab>
          <Tab
            category={ECategories.UPCOMING}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={categoryCount.Upcoming}
          >
            Upcoming
          </Tab>
          <Tab
            category={ECategories.DONE}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={categoryCount.Done}
          >
            Done
          </Tab>
          <Tab
            category={ECategories.SIGNATURE_REQUIRED}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={categoryCount.SignatureRequired}
          >
            Awaiting Signature
          </Tab>
          <Tab
            category={ECategories.DRAFT}
            onClick={toggleTab}
            activeCategory={activeCategory}
            count={categoryCount.Draft}
          >
            Drafts
          </Tab>
          <Link
            tw="italic font-semibold"
            component="button"
            variant="body2"
            onClick={() => {
              setAddNewModal(true);
            }}
          >
            Add New +
          </Link>
        </TabContainer>

        <MemberTrackingItemTable userId={userId} />
      </TabAndTableContainer>
      {openAddNewModal ? (
        <AddMemberTrackingItemDialog
          forMemberId={userId}
          handleClose={() => setAddNewModal(false)}
        ></AddMemberTrackingItemDialog>
      ) : null}
    </div>
  );
};

export default MemberItemTracker;
