import React from 'react';
import { useMemberTrackingItem } from '../../hooks/api/memberTrackingItem';
import RecordRow from './RecordRow';

const MemberTrackingItemRow: React.FC<{
  memberTrackingItemId: { userId: string; trackingItemId: number };
}> = ({ memberTrackingItemId }) => {
  const { data: memberTrackingItem, isLoading } = useMemberTrackingItem(
    memberTrackingItemId.userId,
    memberTrackingItemId.trackingItemId
  );

  return (
    <>
      {isLoading ? <div>...loading</div> : null}
      {memberTrackingItem ? (
        memberTrackingItem.memberTrackingRecords.map((tr) => (
          <RecordRow key={tr.id} trackingItem={memberTrackingItem.trackingItem} memberTrackingRecordId={tr.id} />
        ))
      ) : (
        <div>No Data</div>
      )}
    </>
  );
};

export default MemberTrackingItemRow;
