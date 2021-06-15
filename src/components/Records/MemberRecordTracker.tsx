import React, { createContext, LegacyRef, useContext, useRef, useState } from 'react';
import tw from 'twin.macro';
import MemberTrackingItemTable from './MemberTrackingItemTable';
import { Link } from '../../lib/ui';
import { ECategories } from '../../types/global';
import { AddMemberTrackingItemDialog } from './AddMemberTrackingItemDialog';
import Tab from './Tab';

// Twin macro styles for table and headers
const Header = tw.h1`text-xl font-bold text-black mb-2`;

const TabContainer = tw.div`flex space-x-3 justify-between min-w-min border-b border-color[#AEAEAE]`;

const TabAndTableContainer = tw.div`flex flex-col min-w-min max-w-max`;

interface IMemberTrackerContextState {
  count: {
    Archived: number;
    Done: number;
    Draft: number;
    Overdue: number;
    SignatureRequired: number;
    Upcoming: number;
  };
  resetCount: () => void;
  activeCategory: ECategories;
  setActiveCategory: (activeCategory: ECategories) => void;
  increaseCategoryCount: (category: ECategories) => void;
  decreaseCategoryCount: (category: ECategories) => void;
}

const MemberItemTrackerContext = createContext<IMemberTrackerContextState>(null);

const MemberItemTrackerContextProvider: React.FC<{ initialActiveCategory: ECategories }> = ({
  children,
  initialActiveCategory,
}) => {
  const [count, setCount] = useState({
    Archived: 0,
    Done: 0,
    Draft: 0,
    Overdue: 0,
    SignatureRequired: 0,
    Upcoming: 0,
  });
  const [activeCategory, setActiveCategory] = useState(initialActiveCategory ?? ECategories.ALL);
  const resetCount = () =>
    setCount({
      Archived: 0,
      Done: 0,
      Draft: 0,
      Overdue: 0,
      SignatureRequired: 0,
      Upcoming: 0,
    });
  const increaseCategoryCount = (category: ECategories) =>
    setCount((state) => ({ ...state, [category]: state[category] + 1 }));
  const decreaseCategoryCount = (category: ECategories) =>
    setCount((state) => ({ ...state, [category]: state[category] - 1 }));
  return (
    <MemberItemTrackerContext.Provider
      value={{ count, activeCategory, setActiveCategory, resetCount, increaseCategoryCount, decreaseCategoryCount }}
    >
      {children}
    </MemberItemTrackerContext.Provider>
  );
};

export const useMemberItemTrackerContext = () => useContext(MemberItemTrackerContext);

/**
 *
 * Training Record Functional Component
 */
const MemberItemTracker: React.FC<{
  userId: string;
  title: string;
  initialActiveCategory: ECategories;
}> = ({ userId, children, title, initialActiveCategory }) => {
  const [openAddNewModal, setAddNewModal] = useState(false);

  const TabAndTableRef: LegacyRef<HTMLDivElement> = useRef();

  return (
    <MemberItemTrackerContextProvider initialActiveCategory={initialActiveCategory}>
      <div tw="mr-5 pr-10 w-9/12">
        <Header>{title}</Header>
        <TabAndTableContainer ref={TabAndTableRef}>
          <TabContainer id="Filter Tabs">
            {children}
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
    </MemberItemTrackerContextProvider>
  );
};

export default MemberItemTracker;
