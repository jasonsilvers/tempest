import { Typography } from '@mui/material';
import { MemberTrackingRecord } from '@prisma/client';
import React, { useEffect, useReducer } from 'react';
import 'twin.macro';
import { EStatus } from '../components/Dashboard/Enums';
import { MassAssign } from '../components/Dashboard/MassAssign';
import { Actions, AllCounts, StatusCounts, UserCounts } from '../components/Dashboard/Types';
import { UserList } from '../components/Dashboard/UserList';
import { DashboardFilter } from '../components/Dashboard/DashboardFilter';
import { EFuncAction, EResource } from '../const/enums';
import { useUsers } from '../hooks/api/users';
import { usePermissions } from '../hooks/usePermissions';
import { Card } from '../lib/ui';
import { MemberTrackingItemWithAll } from '../repositories/memberTrackingRepo';
import { UserWithAll } from '../repositories/userRepo';
import { removeOldCompletedRecords } from '../utils';
import { getStatus } from '../utils/status';
import { MassSign } from '../components/Dashboard/MassSign';

const initialCounts: StatusCounts = {
  All: 0,
  Overdue: 0,
  Upcoming: 0,
  Done: 0,
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
  }

  return newCounts;
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
  const usersQuery = useUsers();

  const [dashboardState, dispatch] = useReducer(filterReducer, {
    userList: [],
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
    const newCounts = { ...initialCounts };
    usersQuery?.data?.forEach((user) => {
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
  }, [usersQuery?.data]);

  if (isLoading) {
    return <p tw="p-5">Loading...</p>;
  }

  if (!permission.granted) {
    return <div>you are not allowed to view this page</div>;
  }

  return (
    <main tw="grid grid-cols-12 gap-4 w-[1200px] p-5">
      <div tw="col-span-8">
        <Card tw="p-5">
          <Typography variant="h6">Member List</Typography>
          <div tw="py-8">
            <DashboardFilter dashboardState={dashboardState} dispatch={dispatch} />
          </div>
          <UserList usersQuery={usersQuery} dashboardState={dashboardState} loggedInUser={loggedInUser} />
        </Card>
      </div>

      <div tw="col-span-4 row-span-2">
        <MassSign usersQuery={usersQuery} />
      </div>

      <div tw="col-span-8">
        <MassAssign usersQuery={usersQuery} />
      </div>
    </main>
  );
};

export default DashboardPage;
