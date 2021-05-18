import React from 'react';
import tw from 'twin.macro';
import RecordRow, { RecordWithTrackingItem } from './RecordRow';

// styled twin elements
const Container = tw.div`text-black mt-3 text-left flex space-y-5 flex-col flex[0 0 100%]`;

const RecordTable: React.FC<{
  memberTrackingRecords: RecordWithTrackingItem[];
}> = ({ memberTrackingRecords }) => {
  return (
    <Container>
      {/* Map though items and create Table Data Rows */}
      {memberTrackingRecords.map((trackingRecord) => (
        <RecordRow key={trackingRecord.id} trackingRecord={trackingRecord} />
      ))}
    </Container>
  );
};

export default RecordTable;
