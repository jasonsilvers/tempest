import React, { LegacyRef, useRef } from 'react';
import tw from 'twin.macro';
import MemberTrackingItemTable from './MemberTrackingItemTable';
import { ITabProps } from './Tab';
import { MemberItemTrackerContextProvider } from './providers/MemberItemTrackerContext';
import { Typography } from '../../../lib/ui';

const TabContainer = tw.div`flex space-x-4`;

const TabAndTableContainer = tw.div`flex flex-col `;

export type Variant = 'In Progress' | 'Completed';

/**
 *
 * Training Record Functional Component
 */
const MemberItemTracker: React.FC<{
  userId: number;
  title: string;
  description: string;
  variant: Variant;
}> = ({ userId, title, description, variant, children }) => {
  const TabAndTableRef: LegacyRef<HTMLDivElement> = useRef();

  const categories = React.Children.map(children, (child: React.ReactElement<ITabProps>) => child.props.category);

  return (
    <MemberItemTrackerContextProvider categories={categories}>
      <div tw="mr-5 pr-10 w-full">
        <Typography tw="pb-2" variant="h5">
          {title}
        </Typography>
        <Typography tw="pb-2" color="#7B7B7B">
          {description}
        </Typography>
        <TabAndTableContainer tw="p-2 rounded-md" ref={TabAndTableRef}>
          <TabContainer id="Filter Tabs">{children}</TabContainer>

          <MemberTrackingItemTable userId={userId} variant={variant} />
        </TabAndTableContainer>
      </div>
    </MemberItemTrackerContextProvider>
  );
};

export default MemberItemTracker;
