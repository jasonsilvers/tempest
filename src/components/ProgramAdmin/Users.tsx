import { Button, Drawer } from '@mui/material';
import { DataGrid, GridColumns, GridValueGetterParams } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useOrgs } from '../../hooks/api/organizations';
import { useUsers } from '../../hooks/api/users';
import { UserWithAll } from '../../repositories/userRepo';
import { UserDetailEdit } from './UserDetailEdit';

import tw from 'twin.macro';

const Users = () => {
  const [modalState, setModalState] = useState({ userId: null, open: false });

  const usersListQuery = useUsers();
  const orgsListQuery = useOrgs();

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
        field: 'primaryOrg',
        headerName: 'Primary Org',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return orgsListQuery?.data?.find((org) => org.id === params.row.organizationId)?.name;
        },
      },
      {
        field: 'secondaryOrg',
        headerName: 'Secondary Org',
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
    []
  );

  if (usersListQuery.isLoading || orgsListQuery.isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div tw="h-[750px] pt-5">
      <DataGrid
        rows={usersListQuery.data}
        columns={columns}
        disableVirtualization
        onRowClick={(params) => setModalState({ userId: params.row.id, open: true })}
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
        open={modalState.open}
      >
        {modalState.open && (
          <UserDetailEdit user={usersListQuery?.data?.find((user) => user.id === modalState.userId)} />
        )}
        <div tw="p-2 flex justify-center">
          <Button variant="outlined" color="secondary" onClick={() => setModalState({ userId: null, open: false })}>
            Cancel
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export { Users };
