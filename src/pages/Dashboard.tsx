import { MemberTrackingRecord, Organization } from '.prisma/client';
import dayjs from 'dayjs';
import React, { useEffect, useReducer } from 'react';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import tw from 'twin.macro';
import { SearchIcon } from '../assets/Icons';
import { EStatus } from '../components/Dashboard/Enums';
import { Actions, AllCounts, StatusCounts, UserCounts } from '../components/Dashboard/Types';
import { EFuncAction, EResource } from '../const/enums';
import { useOrgs } from '../hooks/api/organizations';
import { useUsers } from '../hooks/api/users';
import { usePermissions } from '../hooks/usePermissions';
import { Autocomplete, Card, InputAdornment, DashboardPopMenu, TextField } from '../lib/ui';
import { MemberTrackingItemWithAll } from '../repositories/memberTrackingRepo';
import { getUsersWithMemberTrackingRecords, UserWithAll } from '../repositories/userRepo';
import { removeOldCompletedRecords } from '../utils';
import { getStatus } from '../utils/status';

const UserTable = tw.div``;
const UserTableHeader = tw.div`flex text-sm text-gray-400 mb-4 pl-2 border-b border-gray-400`;
const UserTableRow = ({ isOdd, children }: { isOdd: boolean; children: React.ReactNode }) => {
  return <div css={[isOdd && tw`bg-gray-100`, tw`pl-2 flex py-2 justify-center items-center`]}>{children}</div>;
};

const UserTableColumn = tw.div``;

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

const determineOverallUserCounts = (userCounts: UserCounts, newCounts: StatusCounts) => {
  if (userCounts.Overdue > 0) {
    newCounts.Overdue = newCounts.Overdue + 1;
  }

  if (userCounts.Overdue === 0 && userCounts.Upcoming > 0) {
    newCounts.Upcoming = newCounts.Upcoming + 1;
  }

  if (userCounts.Upcoming === 0 && userCounts.Overdue === 0 && userCounts.Done > 0) {
    newCounts.Done = newCounts.Done + 1;
  }
};

interface IDashboardState {
  userList: UserWithAll[];
  filteredUserList: UserWithAll[];
  counts: StatusCounts;
  nameFilter: string;
  statusFilter: EStatus;
  organizationIdFilter: string;
}

interface IFilters {
  nameFilter: string;
  statusFilter: EStatus;
  OrganizationIdFilter: string;
}

const applyNameFilter = (userList: UserWithAll[], nameFilter: string) => {
  if (nameFilter === '') {
    return userList;
  }

  return userList.filter((user) => {
    return user.firstName.toLowerCase().includes(nameFilter) || user.lastName.toLowerCase().includes(nameFilter);
  });
};

const applyStatusFilter = (userList: UserWithAll[], statusFilter: EStatus, counts: StatusCounts) => {
  if (statusFilter === EStatus.ALL) {
    return userList;
  }

  return userList.filter((user) => {
    const userCounts = counts[user.id];

    switch (statusFilter) {
      case EStatus.OVERDUE:
        if (userCounts.Overdue > 0) {
          return true;
        }

        return false;

      case EStatus.UPCOMING:
        if (userCounts.Upcoming > 0) {
          return true;
        }

        return false;

      case EStatus.DONE:
        if (userCounts.Done > 0 && userCounts.OverDue === 0 && userCounts.Upcoming === 0) {
          return true;
        }

        return false;
      default:
        return false;
    }
  });
};

const applyOrganizationFilter = (userList: UserWithAll[], organizationIdFilter: string) => {
  if (!organizationIdFilter) {
    return userList;
  }

  return userList.filter((user) => {
    return user.organizationId === organizationIdFilter;
  });
};

const applyFilters = (userList: UserWithAll[], filters: IFilters, counts: StatusCounts) => {
  return applyNameFilter(
    applyStatusFilter(applyOrganizationFilter(userList, filters.OrganizationIdFilter), filters.statusFilter, counts),
    filters.nameFilter
  );
};

const filterReducer = (state: IDashboardState, action: Actions): IDashboardState => {
  switch (action.type) {
    case 'filterByName': {
      return {
        ...state,
        nameFilter: action.nameFilter,
        filteredUserList: applyFilters(
          state.userList,
          {
            nameFilter: action.nameFilter,
            OrganizationIdFilter: state.organizationIdFilter,
            statusFilter: state.statusFilter,
          },
          state.counts
        ),
      };
    }
    case 'filterByStatus': {
      return {
        ...state,
        statusFilter: action.statusFilter,
        filteredUserList: applyFilters(
          state.userList,
          {
            nameFilter: state.nameFilter,
            OrganizationIdFilter: state.organizationIdFilter,
            statusFilter: action.statusFilter,
          },
          state.counts
        ),
      };
    }
    case 'filterByOrganization': {
      return {
        ...state,
        organizationIdFilter: action.organizationIdFilter,
        filteredUserList: applyFilters(
          state.userList,
          {
            nameFilter: state.nameFilter,
            OrganizationIdFilter: action.organizationIdFilter,
            statusFilter: state.statusFilter,
          },
          state.counts
        ),
      };
    }
    case 'setUserList': {
      return {
        ...state,
        userList: action.userList,
        filteredUserList: applyFilters(
          action.userList,
          {
            nameFilter: state.nameFilter,
            OrganizationIdFilter: state.organizationIdFilter,
            statusFilter: state.statusFilter,
          },
          state.counts
        ),
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
  const orgsQuery = useOrgs();

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

      determineOverallUserCounts(userCounts, newCounts);
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
      {/* <div tw="flex space-x-8 pb-5">
        <MemberCountCards
          isLoading={users?.isLoading}
          counts={dashboardState.counts}
          variant={dashboardState.statusFilter}
          dispatch={dispatch}
        />
      </div> */}
      <div tw="flex space-x-2 pb-5">
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
          <Autocomplete
            options={orgsQuery.data ?? []}
            getOptionLabel={(option) => option.name}
            onChange={(event, value: Organization) =>
              dispatch({ type: 'filterByOrganization', organizationIdFilter: value?.id })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                tw="w-full bg-white rounded"
                variant="outlined"
                label="Organizations"
                name="organizations_textfield"
                id="organizations_textfield"
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
        </div>
      </div>

      <Card tw="p-5">
        <UserTable>
          <UserTableHeader>
            <UserTableColumn tw="w-1/3 text-lg">Name</UserTableColumn>
            <UserTableColumn tw="w-1/6 text-lg">Rank</UserTableColumn>
            <UserTableColumn tw="w-1/6 flex text-lg justify-center">Status</UserTableColumn>
            <UserTableColumn tw="ml-auto mr-4 text-lg">Actions</UserTableColumn>
          </UserTableHeader>
          {dashboardState.filteredUserList?.length === 0 ? 'No Members Found' : ''}
          {dashboardState.filteredUserList?.map((user, index) => (
            <UserTableRow isOdd={!!(index % 2)} key={user.id} tw="text-base mb-2 flex">
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
      </Card>
    </main>
  );
};

export default DashboardPage;

export const getStaticProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(['users'], () => getUsersWithMemberTrackingRecords());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
};
