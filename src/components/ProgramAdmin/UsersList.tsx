import { Drawer } from '@mui/material';
import { DataGrid, GridColumns, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useOrgsLoggedInUsersOrgAndDown } from '../../hooks/api/organizations';
import { UserWithAll } from '../../repositories/userRepo';
import { UserDetailEdit } from './UserDetailEdit';

import { UseQueryResult } from 'react-query';
import 'twin.macro';

type UserListProps = {
  usersListQuery: UseQueryResult<UserWithAll[], unknown>;
};

const UsersList: React.FC<UserListProps> = ({ usersListQuery }) => {
  const [sidebarState, setSidebarState] = useState({ userId: null, open: false });
  const orgsListQuery = useOrgsLoggedInUsersOrgAndDown();

  const columns: GridColumns<UserWithAll> = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return `${params.row.lastName}, ${params.row.firstName}`;
        },
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 1,
      },
      {
        field: 'primaryOrg',
        headerName: 'Primary Org',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return orgsListQuery?.data?.find((org) => org.id === params.row.organizationId)?.name;
        },
      },
      {
        field: 'reportingOrg',
        headerName: 'Reporting Org',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return orgsListQuery?.data?.find((org) => org.id === params.row.reportingOrganizationId)?.name;
        },
      },
      {
        field: 'role',
        headerName: 'Role',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.role.name;
        },
      },
    ],
    [orgsListQuery.data]
  );

  if (!usersListQuery || usersListQuery?.isLoading || orgsListQuery?.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div tw="h-[750px] pt-5">
      <DataGrid
        sx={{ border: 'none' }}
        rows={usersListQuery?.data}
        columns={columns}
        disableVirtualization
        onRowClick={(params) => setSidebarState({ userId: params.row.id, open: true })}
        components={{
          Toolbar: GridToolbar,
        }}
      />
      <Drawer
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="right"
        open={sidebarState.open}
      >
        {sidebarState.open && (
          <UserDetailEdit
            key={sidebarState.userId}
            closeEdit={() => setSidebarState({ userId: null, open: false })}
            user={usersListQuery?.data?.find((member) => member.id === sidebarState.userId)}
          />
        )}
      </Drawer>
    </div>
  );
};

export { UsersList };
