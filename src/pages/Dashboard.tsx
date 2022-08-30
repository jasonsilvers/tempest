import { InputAdornment, TextField } from '@mui/material';
import { MemberTrackingItemStatus, MemberTrackingRecord } from '@prisma/client';
import React, { useEffect, useReducer } from 'react';
import 'twin.macro';
import { SearchIcon } from '../assets/Icons';
import { DashboardFilter } from '../components/Dashboard/DashboardFilter';
import { EStatus } from '../components/Dashboard/Enums';
import { MassAssign } from '../components/Dashboard/MassAssign';
import { MassSign } from '../components/Dashboard/MassSign';
import { Report } from '../components/Dashboard/Report';
import { Actions, AllCounts, StatusCounts, UserCounts } from '../components/Dashboard/Types';
import { UserList } from '../components/Dashboard/UserList';
import { EFuncAction, EResource } from '../const/enums';
import { useUsers } from '../hooks/api/users';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../lib/ui';
import { MemberTrackingItemWithAll } from '../repositories/memberTrackingRepo';
import { UserWithAll } from '../repositories/userRepo';
import { removeOldCompletedRecords } from '../utils';
import { getStatus } from '../utils/status';

const initialCounts: StatusCounts = {
  All: 0,
  Overdue: 0,
  Upcoming: 0,
  Done: 0,
};

const determineMemberCounts = (
  mti: MemberTrackingItemWithAll,
  mtr: MemberTrackingRecord,
  membersCount: StatusCounts,
  specificCountsForMember: UserCounts
): AllCounts => {
  if (mtr.authoritySignedDate && mtr.traineeSignedDate) {
    const status = getStatus(mtr.completedDate, mti.trackingItem.interval);
    specificCountsForMember[status] = specificCountsForMember[status] + 1;
    membersCount[status] = membersCount[status] + 1;
  }
  return membersCount;
};

export interface IDashboardState {
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
    return user.reportingOrganizationId === organizationIdFilter;
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
  const usersQuery = useUsers();

  const [dashboardState, dispatch] = useReducer(filterReducer, {
    userList: usersQuery.data,
    filteredUserList: [],
    counts: initialCounts,
    nameFilter: '',
    organizationIdFilter: null,
    statusFilter: EStatus.ALL,
  });

  const permission = permissionCheck(loggedInUser?.role?.name, EFuncAction.READ_ANY, EResource.USER);

  useEffect(() => {
    dispatch({ type: 'setUserList', userList: usersQuery.data });
  }, [usersQuery.data]);

  useEffect(() => {
    const membersCount = { ...initialCounts };
    usersQuery?.data?.forEach((user) => {
      membersCount.All = membersCount.All + 1;
      const specificCountsForMember = {
        Overdue: 0,
        Upcoming: 0,
        Done: 0,
      };
      membersCount[user.id] = specificCountsForMember;
      user.memberTrackingItems
        .filter((mti) => mti.status === MemberTrackingItemStatus.ACTIVE)
        .forEach((mti) => {
          const mtrWithOldCompletedRecordsRemoved = removeOldCompletedRecords(mti.memberTrackingRecords);
          mtrWithOldCompletedRecordsRemoved.forEach((mtr) => {
            determineMemberCounts(mti, mtr, membersCount, specificCountsForMember);
          });
        });
    });

    dispatch({ type: 'setCounts', counts: membersCount });
  }, [usersQuery?.data]);

  if (isLoading) {
    return <p tw="p-5">Loading...</p>;
  }

  if (!permission.granted) {
    return <div>you are not allowed to view this page</div>;
  }

  return (
    <main tw="grid grid-cols-12 gap-4 w-[1200px] p-6 h-auto">
      <div tw="col-span-8">
        <Card tw="p-0">
          <div tw="w-full py-5 px-4">
            <TextField
              tw="bg-white rounded w-full"
              id="SearchBar"
              label="Search"
              size="small"
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
          <UserList usersQuery={usersQuery} dashboardState={dashboardState} loggedInUser={loggedInUser} />
        </Card>
      </div>

      <div tw="col-span-4 row-span-2 pb-[19em] space-y-4">
        <Card tw="h-16 px-4">
          <DashboardFilter dispatch={dispatch} />
        </Card>
        <Report memberList={dashboardState.filteredUserList} counts={dashboardState.counts} />
        <MassSign usersQuery={usersQuery} />
      </div>

      <div tw="col-span-8">
        <MassAssign usersQuery={usersQuery} />
      </div>
    </main>
  );
};

export default DashboardPage;
