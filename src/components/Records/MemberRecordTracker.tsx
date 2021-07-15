import React, { LegacyRef, useRef } from 'react';
import tw from 'twin.macro';
import MemberTrackingItemTable from './MemberTrackingItemTable';
import { ITabProps } from './Tab';
import { MemberItemTrackerContextProvider } from './providers/MemberItemTrackerContext';

// Twin macro styles for table and headers
const Header = tw.h1`text-xl font-bold text-black mb-2`;

const TabContainer = tw.div`flex space-x-10 border-b border-color[#AEAEAE]`;

const TabAndTableContainer = tw.div`flex flex-col `;

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
