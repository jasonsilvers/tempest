import { TablePagination } from '@mui/material';
import React from 'react';
import tw from 'twin.macro';
import { useMemberTrackingItems } from '../../../hooks/api/memberTrackingItem';
import { TableData, TableHeaderRow } from '../TwinMacro/Twin';
import { Variant } from './MemberItemTracker';
import MemberTrackingItemRow from './MemberTrackingItemRow';

// styled twin elements
const Container = tw.div`bg-white text-black pt-4 text-left flex flex-col h-64 overflow-y-auto overflow-x-hidden max-width[1440px] rounded-lg`;

const MemberTrackingItemTableSkeleton = tw.div`border animate-pulse bg-gray-400 h-full px-2 border-gray-300`;

const MemberTrackingItemTable: React.FC<{
  userId: number;
  variant: Variant;
}> = ({ userId, variant }) => {
  const memberTrackingItemsQuery = useMemberTrackingItems(userId);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <TableHeaderRow tw="min-height[35px]">
        <TableData tw="w-60 text-primarytext font-bold">Training Title</TableData>
        <TableData tw="w-24 text-primarytext font-bold">Recurrence</TableData>
        <div tw="flex justify-between">
          <TableData tw="w-32 text-primarytext font-bold">Completion Date</TableData>
          <TableData tw="w-16 pl-1 text-primarytext font-bold">Due Date</TableData>
        </div>
        <div tw="flex ml-auto">
          {variant === 'In Progress' ? (
            <>
              <TableData tw="w-32 pl-2 text-primarytext font-bold">Authority Signature</TableData>
              <TableData tw="w-32 text-primarytext font-bold">Member Signature</TableData>
              <TableData tw="w-8"></TableData>
            </>
          ) : (
            <>
              <TableData tw="w-72 pr-10">Signatures (hover to view)</TableData>
              <TableData tw="w-4"></TableData>
            </>
          )}
        </div>
      </TableHeaderRow>
      {/* Map though items and create Table Data Rows */}
      {memberTrackingItemsQuery.data?.length == 0 ? <div tw="p-4">Nothing to show</div> : null}
      {memberTrackingItemsQuery.data && memberTrackingItemsQuery.isSuccess ? (
        memberTrackingItemsQuery.data
          ?.slice(page * rowsPerPage, (page + 2) * rowsPerPage)
          .map((mti) => <MemberTrackingItemRow key={`${mti.userId}${mti.trackingItemId}`} memberTrackingItemId={mti} />)
      ) : (
        <MemberTrackingItemTableSkeleton />
      )}

      <div tw="pt-5">
        <TablePagination
          component="div"
          count={memberTrackingItemsQuery.data ? memberTrackingItemsQuery.data.length : 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </Container>
  );
};

export default MemberTrackingItemTable;
