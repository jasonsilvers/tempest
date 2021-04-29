import { MemberTrackingRecord } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import usePermissions from '../../hooks/usePermissions';
import { EPermission, EResource } from '../../types/global';
import RecordRow, { RecordWithTrackingItem } from './RecordRow';

// styled twin elements
const TableHeaders = tw.thead`border-b-2 border-color[hsla(0, 0%, 0%, 0.15)]`;
const TableRow = tw.tr`text-black`;
const TableHead = tw.th`text-sm text-black text-opacity-50`;

const RecordTable: React.FC<{
  mtr: MemberTrackingRecord[];
}> = ({ mtr, children }) => {
  const { userRole, permissionCheck } = usePermissions();

  const canSignAuth = permissionCheck(
    userRole,
    EPermission.UPDATE,
    EResource.RECORD
  ).granted;

  return (
    <>
      <TableHeaders>
        {/* Children here are jsx elements are are intended to be the category header */}
        {/* Children must be inside the TableHeaders Element or weird dom behavior will exist */}
        {children}
        <TableRow>
          <TableHead>Type Training</TableHead>
          <TableHead>Interval</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Certification of Supervisor/Trainer</TableHead>
          <TableHead>Signature of Employee</TableHead>
        </TableRow>
      </TableHeaders>
      <tbody>
        {/* Map though items and create Table Data Rows */}
        {mtr.map((trackingRecord: RecordWithTrackingItem) => (
          <RecordRow
            key={trackingRecord.id}
            trackingRecord={trackingRecord}
            canSignAuth={canSignAuth}
          />
        ))}
      </tbody>
    </>
  );
};

export default RecordTable;
