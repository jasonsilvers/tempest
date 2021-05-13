import { MemberTrackingRecord } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import usePermissions from '../../hooks/usePermissions';
import { EPermission, EResource } from '../../types/global';
import RecordRow, { RecordWithTrackingItem } from './RecordRow';

// styled twin elements
const Container = tw.div`text-black mt-3 text-left flex space-y-5 flex-col flex[0 0 100%]`;

const RecordTable: React.FC<{
  mtr: RecordWithTrackingItem[];
}> = ({ mtr }) => {
  const { userRole, permissionCheck } = usePermissions();

  const canSignAuth = permissionCheck(
    userRole,
    EPermission.UPDATE,
    EResource.RECORD
  ).granted;

  return (
    <Container>
      {/* Map though items and create Table Data Rows */}
      {mtr.map((trackingRecord) => (
        <RecordRow
          key={trackingRecord.id}
          trackingRecord={trackingRecord}
          canSignAuth={canSignAuth}
        />
      ))}
    </Container>
  );
};

export default RecordTable;
