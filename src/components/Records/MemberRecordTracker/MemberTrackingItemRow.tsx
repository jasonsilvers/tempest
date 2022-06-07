import React from 'react';
import { MemberTrackingItemWithAll } from '../../../repositories/memberTrackingRepo';
import RecordRow from './RecordRow';

const MemberTrackingItemRow: React.FC<{
  memberTrackingItem: MemberTrackingItemWithAll;
}> = ({ memberTrackingItem }) => {
  return (
    <>
      {memberTrackingItem
        ? memberTrackingItem.memberTrackingRecords.map((tr) => (
            <RecordRow key={tr.id} trackingItem={memberTrackingItem.trackingItem} memberTrackingRecord={tr} />
          ))
        : null}
    </>
  );
};

export default MemberTrackingItemRow;
