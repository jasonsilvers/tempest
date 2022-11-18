import CallMergeIcon from '@mui/icons-material/CallMerge';
import { Drawer, IconButton, Typography } from '@mui/material';
import {
  DataGrid,
  GridColumns,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { useOrgsLoggedInUsersOrgAndDown } from '../../hooks/api/organizations';
import { UserWithAll } from '../../repositories/userRepo';
import { UserDetailEdit } from '../ProgramAdmin/UserDetailEdit';
import { UseQueryResult } from 'react-query';
import 'twin.macro';
import { MergeAccount } from '../MergeAccount';

type AdminUserListProps = {
  usersListQuery: UseQueryResult<UserWithAll[], unknown>;
};

const AdminUsersList: React.FC<AdminUserListProps> = ({ usersListQuery }) => {
  const [sidebarState, setSidebarState] = useState({ userId: null, open: false });
  const [dialogisOpen, setDialogIsOpen] = useState<boolean>(false);
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
  const GridToolBarMerge = (): JSX.Element => {
    return (
      <IconButton onClick={() => setDialogIsOpen(true)} tw="text-primary border leading-relaxed">
        <CallMergeIcon fontSize="small" />
        <Typography tw="font-normal font-light uppercase text-sm">Merge</Typography>
      </IconButton>
    );
  };

  const CustomToolBar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <GridToolBarMerge />
      </GridToolbarContainer>
    );
  };

  return (
    <div tw="h-[750px] pt-5">
      <MergeAccount isOpen={dialogisOpen} setIsOpen={setDialogIsOpen} />
      <DataGrid
        sx={{ border: 'none' }}
        rows={usersListQuery?.data}
        columns={columns}
        disableVirtualization
        onRowClick={(params) => setSidebarState({ userId: params.row.id, open: true })}
        components={{
          Toolbar: CustomToolBar,
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

export { AdminUsersList };
