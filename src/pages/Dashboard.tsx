import { MemberTrackingRecord, Organization } from '.prisma/client';
import { InputAdornment, TablePagination, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useReducer } from 'react';
import tw from 'twin.macro';
import { SearchIcon } from '../assets/Icons';
import { EStatus } from '../components/Dashboard/Enums';
import { Actions, AllCounts, StatusCounts, UserCounts } from '../components/Dashboard/Types';
import { OrganizationSelect } from '../components/OrganizationSelect';
import { EFuncAction, EResource } from '../const/enums';
import { useUsers } from '../hooks/api/users';
import { usePermissions } from '../hooks/usePermissions';
import DashboardPopMenu, { Card } from '../lib/ui';
import { MemberTrackingItemWithAll } from '../repositories/memberTrackingRepo';
import { UserWithAll } from '../repositories/userRepo';
import { removeOldCompletedRecords } from '../utils';
import { getStatus } from '../utils/status';

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

const initialCounts: StatusCounts = {
  All: 0,
  Overdue: 0,
  Upcoming: 0,
  Done: 0,
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

const determineMemberCounts = (
  mti: MemberTrackingItemWithAll,
  mtr: MemberTrackingRecord,
  newCounts: StatusCounts,
  userCounts: UserCounts
): AllCounts => {
  if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
    const status = getStatus(mtr.completedDate, mti.trackingItem.interval);
    userCounts[status] = userCounts[status] + 1;
  } else {
    const today = dayjs();
    const dateTrainingGivenToMember = dayjs(mtr.createdAt);

    const differenceInDays = today.diff(dateTrainingGivenToMember, 'days');
    if (differenceInDays && differenceInDays > 30) {
      userCounts.Overdue = userCounts.Overdue + 1;
    } else {
      userCounts.Upcoming = userCounts.Upcoming + 1;
    }
  }

  return newCounts;
};

interface IDashboardState {
  userList: UserWithAll[];
  filteredUserList: UserWithAll[];
  counts: StatusCounts;
  nameFilter: string;
  statusFilter: EStatus;
  organizationIdFilter: number;
}

interface IFilters {
  nameFilter: string;
  OrganizationIdFilter: number;
}

const applyNameFilter = (userList: UserWithAll[], nameFilter: string) => {
  if (nameFilter === '') {
    return userList;
  }

  return userList.filter((user) => {
    return user.firstName.toLowerCase().includes(nameFilter) || user.lastName.toLowerCase().includes(nameFilter);
  });
};

const applyOrganizationFilter = (userList: UserWithAll[], organizationIdFilter: number) => {
  if (!organizationIdFilter) {
    return userList;
  }

  return userList.filter((user) => {
    return user.organizationId === organizationIdFilter;
  });
};

const applyFilters = (userList: UserWithAll[], filters: IFilters) => {
  return applyNameFilter(applyOrganizationFilter(userList, filters.OrganizationIdFilter), filters.nameFilter);
};

const filterReducer = (state: IDashboardState, action: Actions): IDashboardState => {
  switch (action.type) {
    case 'filterByName': {
      return {
        ...state,
        nameFilter: action.nameFilter,
        filteredUserList: applyFilters(state.userList, {
          nameFilter: action.nameFilter,
          OrganizationIdFilter: state.organizationIdFilter,
        }),
      };
    }
    case 'filterByOrganization': {
      return {
        ...state,
        organizationIdFilter: action.organizationIdFilter,
        filteredUserList: applyFilters(state.userList, {
          nameFilter: state.nameFilter,
          OrganizationIdFilter: action.organizationIdFilter,
        }),
      };
    }
    case 'setUserList': {
      return {
        ...state,
        userList: action.userList,
        filteredUserList: applyFilters(action.userList, {
          nameFilter: state.nameFilter,
          OrganizationIdFilter: state.organizationIdFilter,
        }),
      };
    }

    case 'setCounts': {
      return {
        ...state,
        counts: action.counts,
      };
    }

    default:
      return state;
  }
};

const DashboardPage: React.FC = () => {
  const { user: loggedInUser, permissionCheck, isLoading } = usePermissions();
  const users = useUsers();
  const [dashboardState, dispatch] = useReducer(filterReducer, {
    userList: [],
    filteredUserList: [],
    counts: initialCounts,
    nameFilter: '',
    organizationIdFilter: null,
    statusFilter: EStatus.ALL,
  });

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const permission = permissionCheck(loggedInUser?.role?.name, EFuncAction.READ_ANY, EResource.USER);

  useEffect(() => {
    dispatch({ type: 'setUserList', userList: users.data });
  }, [users.data]);

  useEffect(() => {
    const newCounts = { ...initialCounts };
    users?.data?.forEach((user) => {
      newCounts.All = newCounts.All + 1;
      const userCounts = {
        Overdue: 0,
        Upcoming: 0,
        Done: 0,
      };
      newCounts[user.id] = userCounts;
      user.memberTrackingItems.forEach((mti) => {
        const mtrWithOldCompletedRecordsRemoved = removeOldCompletedRecords(mti.memberTrackingRecords);
        mtrWithOldCompletedRecordsRemoved.forEach((mtr) => {
          determineMemberCounts(mti, mtr, newCounts, userCounts);
        });
      });
    });

    dispatch({ type: 'setCounts', counts: newCounts });
  }, [users?.data]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!permission.granted) {
    return <div>you are not allowed to view this page</div>;
  }

  return (
    <main tw="pr-14 max-width[900px] min-width[720px]">
      <Card tw="px-5 pt-5">
        <Typography variant="h6">Member List</Typography>
        <div tw="pb-8"></div>
        <div tw="flex space-x-2 pb-8">
          <div tw="w-1/2">
            <TextField
              tw="bg-white rounded w-full"
              id="SearchBar"
              label="Search"
              value={dashboardState.nameFilter}
              onChange={(event) => dispatch({ type: 'filterByName', nameFilter: event.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div tw="w-1/2">
            <OrganizationSelect
              onChange={(_event, value: Organization) =>
                dispatch({ type: 'filterByOrganization', organizationIdFilter: value?.id })
              }
            />
          </div>
        </div>

        <UserTable>
          <UserTableHeader>
            <UserTableColumnHeader tw="w-1/3">Name</UserTableColumnHeader>
            <UserTableColumnHeader tw="w-1/6">Rank</UserTableColumnHeader>
            <UserTableColumnHeader tw="w-1/6 flex justify-center">Status</UserTableColumnHeader>
            <UserTableColumnHeader tw="ml-auto mr-4">Actions</UserTableColumnHeader>
          </UserTableHeader>
          {users.isLoading ? '...Loading' : ''}
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
          count={dashboardState.filteredUserList ? dashboardState.filteredUserList.length : 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </main>
  );
};

export default DashboardPage;
