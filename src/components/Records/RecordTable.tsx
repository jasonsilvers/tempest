import { MemberTrackingRecord } from '@prisma/client';
import React from 'react';
import tw from 'twin.macro';
import RecordRow, { RecordWithTrackingItem } from './RecordRow';

const TableHeaders = tw.thead`border-b-2 border-color[hsla(0, 0%, 0%, 0.15)]`;
const TableRow = tw.tr`text-black`;
const TableHead = tw.th`text-sm text-black text-opacity-50`;

const RecordTable: React.FC<{
  mtr: MemberTrackingRecord[];
}> = ({ mtr, children }) => {
  return (
    <>
      <TableHeaders>
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
        {mtr.map((trackingRecord: RecordWithTrackingItem) => (
          <RecordRow key={trackingRecord.id} trackingRecord={trackingRecord} />
        ))}
      </tbody>
    </>
  );
};

export default RecordTable;
