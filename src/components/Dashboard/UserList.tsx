import { TablePagination } from '@mui/material';
import React from 'react';
import { UseQueryResult } from 'react-query';
import tw from 'twin.macro';
import DashboardPopMenu from '../../lib/ui';
import { IDashboardState } from '../../pages/Dashboard';
import { LoggedInUser, UserWithAll } from '../../repositories/userRepo';
import { EStatus } from './Enums';

const UserTable = tw.div``;
const UserTableHeader = tw.div`flex text-sm mb-4`;
const UserTableRow = tw.div`border-t h-12 flex items-center justify-center py-2`;

const UserTableColumn = tw.div``;
const UserTableColumnHeader = tw.div`text-lg font-bold`;

const StatusPillVariant = {
  Done: {
    color: tw`bg-[#6FD9A6]`,
    textColor: tw`text-white`,
  },
  Overdue: {
    color: tw`bg-[#FB7F7F]`,
    textColor: tw`text-white`,
  },
  Upcoming: {
    color: tw`bg-[#F6B83F]`,
    textColor: tw`text-white`,
  },
  None: {
    color: tw`border border-gray-400`,
    textColor: tw`text-gray-400`,
  },
};

const StatusPill = ({ variant, count }: { variant: EStatus; count: number }) => {
  return (
    <div
      css={[
        StatusPillVariant[variant].color,
        StatusPillVariant[variant].textColor,
        tw`rounded-full h-5 w-5 flex items-center justify-center text-sm`,
      ]}
    >
      {count}
    </div>
  );
};

type UserListProps = {
  usersQuery: UseQueryResult<UserWithAll[]>;
  dashboardState: IDashboardState;
  loggedInUser: LoggedInUser;
};

export const UserList = ({ usersQuery, dashboardState, loggedInUser }: UserListProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <>
      <UserTable>
        <UserTableHeader>
          <UserTableColumnHeader tw="w-1/3">Name</UserTableColumnHeader>
          <UserTableColumnHeader tw="w-1/6">Rank</UserTableColumnHeader>
          <UserTableColumnHeader tw="w-1/6 flex justify-center">Status</UserTableColumnHeader>
          <UserTableColumnHeader tw="ml-auto mr-4">Actions</UserTableColumnHeader>
        </UserTableHeader>
        {usersQuery.isLoading ? '...Loading' : ''}
        {dashboardState.filteredUserList?.length === 0 ? 'No Members Found' : ''}
        {dashboardState.filteredUserList?.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((user) => (
          <UserTableRow key={user.id} tw="text-base flex">
            <UserTableColumn tw="w-1/3">
              {`${user.lastName}, ${user.firstName} ${user.id === loggedInUser.id ? '(You)' : ''}`}
            </UserTableColumn>
            <UserTableColumn tw="w-1/6">{user.rank}</UserTableColumn>
            <UserTableColumn tw="w-1/6 flex justify-center">
              <div tw="flex space-x-2">
                <StatusPill variant={EStatus.OVERDUE} count={dashboardState.counts[user.id]?.Overdue} />
                <StatusPill variant={EStatus.UPCOMING} count={dashboardState.counts[user.id]?.Upcoming} />
                <StatusPill variant={EStatus.DONE} count={dashboardState.counts[user.id]?.Done} />
              </div>
            </UserTableColumn>
            <UserTableColumn tw="ml-auto mr-6">
              <DashboardPopMenu userId={user.id} />
            </UserTableColumn>
          </UserTableRow>
        ))}
      </UserTable>
      <TablePagination
        component="div"
        count={dashboardState?.filteredUserList ? dashboardState?.filteredUserList?.length : 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
      />
    </>
  );
};
