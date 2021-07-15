import React from 'react';
import tw from 'twin.macro';
import { useMemberTrackingItems } from '../../hooks/api/memberTrackingItem';
import MemberTrackingItemRow from './MemberTrackingItemRow';

// styled twin elements
const Container = tw.div`text-black pt-6 text-left flex space-y-5 flex-col h-64 overflow-y-auto overflow-x-hidden max-width[1440px]`;

const MemberTrackingItemTableSkeleton = tw.div`border animate-pulse bg-gray-400 h-full px-2 border-gray-300`;

const MemberTrackingItemTable: React.FC<{
  userId: string;
}> = ({ userId }) => {
  const memberTrackingItemsQuery = useMemberTrackingItems(userId);

  return (
    <Container>
      {/* Map though items and create Table Data Rows */}
      {memberTrackingItemsQuery.data && memberTrackingItemsQuery.isSuccess ? (
        memberTrackingItemsQuery.data?.map((mti) => (
          <MemberTrackingItemRow key={`${mti.userId}${mti.trackingItemId}`} memberTrackingItemId={mti} />
        ))
      ) : (
        <MemberTrackingItemTableSkeleton />
      )}
    </Container>
  );
};

export default MemberTrackingItemTable;
