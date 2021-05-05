import { MemberTrackingRecord } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import usePermissions from '../../hooks/usePermissions';
import { EPermission, EResource } from '../../types/global';
import RecordCard, { RecordWithTrackingItem } from './RecordCard';

// styled twin elements
const Container = tw.div`text-black w-full flex flex-wrap`;

const RecordCards: React.FC<{
  mtr: MemberTrackingRecord[];
}> = ({ mtr }) => {
  const { userRole, permissionCheck } = usePermissions();

  const canSignAuth = permissionCheck(
    userRole,
    EPermission.UPDATE,
    EResource.RECORD
  ).granted;

  return (
    <Container
      style={
        mtr.length > 1
          ? { justifyContent: 'space-evenly' }
          : { justifyContent: 'start' }
      }
    >
      {/* Map though items and create Table Data Rows */}
      {mtr.map((trackingRecord: RecordWithTrackingItem) => (
        <>
          <br />
          <RecordCard
            key={trackingRecord.id}
            trackingRecord={trackingRecord}
            canSignAuth={canSignAuth}
          />
        </>
      ))}
    </Container>
  );
};

export default RecordCards;
