import React, { createContext, LegacyRef, useContext, useRef, useState } from 'react';
import tw from 'twin.macro';
import MemberTrackingItemTable from './MemberTrackingItemTable';
import { ECategories } from '../../types/global';
import { ITabProps } from './Tab';

// Twin macro styles for table and headers
const Header = tw.h1`text-xl font-bold text-black mb-2`;

const TabContainer = tw.div`flex space-x-10 border-b border-color[#AEAEAE]`;

const TabAndTableContainer = tw.div`flex flex-col `;

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
  categories: ECategories[];
  setActiveCategory: (activeCategory: ECategories) => void;
  increaseCategoryCount: (category: ECategories) => void;
  decreaseCategoryCount: (category: ECategories) => void;
}

const MemberItemTrackerContext = createContext<IMemberTrackerContextState>(null);

const MemberItemTrackerContextProvider: React.FC<{ categories: ECategories[] }> = ({ children, categories }) => {
  const [count, setCount] = useState({
    Archived: 0,
    Done: 0,
    Draft: 0,
    Overdue: 0,
    SignatureRequired: 0,
    Upcoming: 0,
  });
  const [activeCategory, setActiveCategory] = useState(ECategories.ALL);
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
      value={{
        count,
        activeCategory,
        setActiveCategory,
        categories,
        resetCount,
        increaseCategoryCount,
        decreaseCategoryCount,
      }}
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
}> = ({ userId, title, children }) => {
  const TabAndTableRef: LegacyRef<HTMLDivElement> = useRef();

  const categories = React.Children.map(children, (child: React.ReactElement<ITabProps>) => child.props.category);

  return (
    <MemberItemTrackerContextProvider categories={categories}>
      <div tw="mr-5 pr-10 w-full">
        <Header>{title}</Header>
        <TabAndTableContainer ref={TabAndTableRef}>
          <TabContainer id="Filter Tabs">{children}</TabContainer>

          <MemberTrackingItemTable userId={userId} />
        </TabAndTableContainer>
      </div>
    </MemberItemTrackerContextProvider>
  );
};

export default MemberItemTracker;
