import React from 'react';
import { useMemberTrackingItem } from '../../hooks/api/memberTrackingItem';
import RecordRow from './RecordRow';

const MemberTrackingRecordSkeleton = () => {
  return <div tw="animate-pulse h-12"></div>;
};

const MemberTrackingItemRow: React.FC<{
  memberTrackingItemId: { userId: string; trackingItemId: number };
}> = ({ memberTrackingItemId }) => {
  const { data: memberTrackingItem, isLoading } = useMemberTrackingItem(
    memberTrackingItemId.userId,
    memberTrackingItemId.trackingItemId
  );

  return (
    <>
      {isLoading ? <MemberTrackingRecordSkeleton /> : null}
      {memberTrackingItem
        ? memberTrackingItem.memberTrackingRecords.map((tr) => (
            <RecordRow key={tr.id} trackingItem={memberTrackingItem.trackingItem} memberTrackingRecordId={tr.id} />
          ))
        : null}
    </>
  );
};

export default MemberTrackingItemRow;
