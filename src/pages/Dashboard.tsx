import { InputAdornment, TextField } from '@mui/material';
import { MemberTrackingItemStatus, Organization } from '@prisma/client';
import React, { useEffect, useReducer } from 'react';
import 'twin.macro';
import { SearchIcon } from '../assets/Icons';
import { DashboardFilter } from '../components/Dashboard/DashboardFilter';
import { EStatus } from '../components/Dashboard/Enums';
import { MassAssign } from '../components/Dashboard/MassAssign';
import { MassSign } from '../components/Dashboard/MassSign';
import { Report } from '../components/Dashboard/Report';
import { Actions, StatusCounts } from '../components/Dashboard/Types';
import { UserList } from '../components/Dashboard/UserList';
import { OrganizationList } from '../components/ProgramAdmin/OrganizationList';
import { addMemberCounts, addOverallCounts } from '../components/Reports/reportsUtils';
import { EFuncAction, EResource } from '../const/enums';
import { useOrgsLoggedInUsersOrgAndDown } from '../hooks/api/organizations';
import { useUsers } from '../hooks/api/users';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../lib/ui';
import { UserWithAll } from '../repositories/userRepo';
import { removeOldCompletedRecords } from '../utils';
import { isOrgChildOfClient } from '../utils/isOrgChildOf';

const initialCounts: StatusCounts = {
  All: 0,
  Overdue: 0,
  Upcoming: 0,
  Done: 0,
};

export interface IDashboardState {
  userList: UserWithAll[];
  filteredUserList: UserWithAll[];
  counts: StatusCounts;
  nameFilter: string;
  statusFilter: EStatus;
  organizationIdFilter: number;
  organizationList: Organization[];
}

interface IFilters {
  nameFilter: string;
  organizationIdFilter: number;
}

const applyNameFilter = (userList: UserWithAll[], nameFilter: string) => {
  if (nameFilter === '') {
    return userList;
  }

  return userList.filter((user) => {
    return user?.firstName?.toLowerCase().includes(nameFilter) || user?.lastName?.toLowerCase().includes(nameFilter);
  });
};

function findOrganizationByIdClient(id: number, organizationList: Organization[]) {
  if (!organizationList) {
    return null;
  }

  return organizationList?.find((org) => org.id === id);
}

const applyOrganizationFilter = (
  userList: UserWithAll[],
  organizationIdFilter: number,
  organizationList: Organization[]
) => {
  if (!organizationIdFilter || !OrganizationList || OrganizationList.length === 0) {
    return userList;
  }

  const filteredUserList = userList?.filter((user) => {
    if (user.organizationId === organizationIdFilter) {
      return true;
    }

    if (
      isOrgChildOfClient(user.organizationId, organizationIdFilter, organizationList, findOrganizationByIdClient) ||
      isOrgChildOfClient(
        user.reportingOrganizationId,
        organizationIdFilter,
        organizationList,
        findOrganizationByIdClient
      )
    ) {
      return true;
    }

    return false;
  });

  return filteredUserList;
};

const applyFilters = (userList: UserWithAll[], filters: IFilters, organizationList: Organization[]) => {
  return applyNameFilter(
    applyOrganizationFilter(userList, filters.organizationIdFilter, organizationList),
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
            organizationIdFilter: state.organizationIdFilter,
          },
          state.organizationList
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
            organizationIdFilter: action.organizationIdFilter,
          },
          state.organizationList
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
            organizationIdFilter: state.organizationIdFilter,
          },
          state.organizationList
        ),
      };
    }

    case 'setOrganizationList': {
      return {
        ...state,
        organizationList: action.Organizations,
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
  const orgsQuery = useOrgsLoggedInUsersOrgAndDown();

  const [dashboardState, dispatch] = useReducer(filterReducer, {
    userList: usersQuery.data,
    filteredUserList: [],
    counts: initialCounts,
    nameFilter: '',
    organizationIdFilter: null,
    organizationList: null,
    statusFilter: EStatus.ALL,
  });

  const permission = permissionCheck(loggedInUser?.role?.name, EFuncAction.READ_ANY, EResource.USER);

  useEffect(() => {
    dispatch({ type: 'setUserList', userList: usersQuery.data });
    dispatch({ type: 'filterByOrganization', organizationIdFilter: loggedInUser?.organizationId });
  }, [usersQuery.data, loggedInUser]);

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
            addMemberCounts(mti, mtr, membersCount[user.id]);
            addOverallCounts(mti, mtr, membersCount);
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

      <div tw="col-span-4 row-span-3 pb-[19em] space-y-4">
        <Card tw="h-16 px-4">
          <DashboardFilter
            dispatch={dispatch}
            initOrg={dashboardState.organizationIdFilter ?? loggedInUser.organizationId}
            orgList={orgsQuery.data}
          />
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
