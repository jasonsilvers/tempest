import { TablePagination } from '@mui/material';
import React from 'react';
import tw from 'twin.macro';
import { EMtrVariant } from '../../../const/enums';
import { useMemberTrackingItemsForUser } from '../../../hooks/api/users';
import { TableData, TableHeaderRow, Token } from '../TwinMacro/Twin';
import MemberTrackingItemRow from './MemberTrackingItemRow';

// styled twin elements
const Container = tw.div`bg-white text-black pt-4 text-left flex flex-col overflow-y-auto overflow-x-hidden max-width[1440px] rounded-lg h-full`;

const RecordRowSkeleton = () => {
  return (
    <div role="progressbar" title="progressbar" tw="border border-gray-300 ">
      <div tw="animate-pulse flex h-12 justify-items-center items-center px-2">
        <Token tw="bg-gray-400 pr-2" />
        <div tw="h-4 w-40 bg-gray-400 rounded-sm"></div>
        <div tw="ml-auto flex space-x-4">
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
          <div tw="h-2 w-14 bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
};

const MemberTrackingRecordSkeleton = tw.div`animate-pulse h-40`;

const LoadingSkeleton = () => {
  return (
    <MemberTrackingRecordSkeleton>
      <RecordRowSkeleton />
      <RecordRowSkeleton />
      <RecordRowSkeleton />
    </MemberTrackingRecordSkeleton>
  );
};

const MemberTrackingItemTable: React.FC<{
  userId: number;
  variant: EMtrVariant;
}> = ({ userId, variant }) => {
  const memberTrackingItemsQuery = useMemberTrackingItemsForUser(userId, variant);

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
        <TableData tw="w-1/3 text-primarytext font-bold">Training Title</TableData>
        <TableData tw="w-24 text-primarytext font-bold">Recurrence</TableData>
        <div tw="flex justify-between">
          <TableData tw="w-32 text-primarytext font-bold">Completion Date</TableData>
          <TableData tw="w-16 pl-1 text-primarytext font-bold">Due Date</TableData>
        </div>
        <div tw="flex ml-auto">
          {variant === EMtrVariant.IN_PROGRESS ? (
            <>
              <TableData tw="w-32 pl-2 text-primarytext font-bold">Authority Signature</TableData>
              <TableData tw="w-32 text-primarytext font-bold">Member Signature</TableData>
              <TableData tw="w-8"></TableData>
            </>
          ) : (
            <>
              <TableData tw="w-72 pr-10 font-bold">Signatures</TableData>
              <TableData tw="w-4"></TableData>
            </>
          )}
        </div>
      </TableHeaderRow>
      {/* Map though items and create Table Data Rows */}
      {memberTrackingItemsQuery.data?.length == 0 ? <div tw="p-4">Nothing to show</div> : null}
      {memberTrackingItemsQuery.data && memberTrackingItemsQuery.isSuccess ? (
        memberTrackingItemsQuery.data
          ?.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map((mti) => <MemberTrackingItemRow key={`${mti.userId}${mti.trackingItemId}`} memberTrackingItem={mti} />)
      ) : (
        <LoadingSkeleton />
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
