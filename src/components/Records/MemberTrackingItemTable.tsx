import React, { useLayoutEffect } from 'react';
import tw from 'twin.macro';
import { useMemberTrackingItems } from '../../hooks/api/memberTrackingItem';
import { useMemberRecordTrackerState } from '../../hooks/uiState';
import MemberTrackingItemRow from './MemberTrackingItemRow';

// styled twin elements
const Container = tw.div`text-black pt-6 text-left flex space-y-5 flex-col flex[0 0 100%]`;

const MemberTrackingItemTable: React.FC<{
  userId: string;
}> = ({ userId }) => {
  const memberTrackingItemsQuery = useMemberTrackingItems(userId);
  const resetCount = useMemberRecordTrackerState((state) => state.resetCount);

  useLayoutEffect(() => {
    resetCount();
  }, []);

  return (
    <Container>
      {/* Map though items and create Table Data Rows */}
      {memberTrackingItemsQuery.data && memberTrackingItemsQuery.isSuccess
        ? memberTrackingItemsQuery.data?.map((mti) => (
            <MemberTrackingItemRow key={`${mti.userId}${mti.trackingItemId}`} memberTrackingItemId={mti} />
          ))
        : null}
    </Container>
  );
};

export default MemberTrackingItemTable;
