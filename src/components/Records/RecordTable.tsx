import { MemberTrackingRecord } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import usePermissions from '../../hooks/usePermissions';
import { EPermission, EResource } from '../../types/global';
import RecordRow, { RecordWithTrackingItem } from './RecordRow';

// styled twin elements
const Table = tw.table`text-black text-left w-full`;

const RecordTable: React.FC<{
  mtr: MemberTrackingRecord[];
}> = ({ mtr }) => {
  const { userRole, permissionCheck } = usePermissions();

  const canSignAuth = permissionCheck(
    userRole,
    EPermission.UPDATE,
    EResource.RECORD
  ).granted;

  return (
    <Table>
      {/* Map though items and create Table Data Rows */}
      {mtr.map((trackingRecord: RecordWithTrackingItem) => (
        <>
          <br />
          <RecordRow
            key={trackingRecord.id}
            trackingRecord={trackingRecord}
            canSignAuth={canSignAuth}
          />
        </>
      ))}
    </Table>
  );
};

export default RecordTable;
