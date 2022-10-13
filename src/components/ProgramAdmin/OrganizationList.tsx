import { Drawer, Fab } from '@mui/material';
import { DataGrid, GridColumns, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid';
import { OrganizationType } from '@prisma/client';
import { useMemo, useState } from 'react';
import 'twin.macro';
import { AddIcon } from '../../assets/Icons';
import { useOrgsUserOrgAndDown } from '../../hooks/api/organizations';
import { OrgWithCounts } from '../../repositories/organizationRepo';
import { LoggedInUser } from '../../repositories/userRepo';
import { AddNewOrganizationDialog } from './AddNewOrganizationDialog';
import { OrgDetailEdit } from './OrgDetailEdit';

type OrganizationListProps = {
  loggedInUser: LoggedInUser;
};

export const OrganizationList: React.FC<OrganizationListProps> = ({ loggedInUser }) => {
  const { data: orgs, isLoading } = useOrgsUserOrgAndDown();
  const [sidebarState, setSidebarState] = useState({ orgId: null, open: false });

  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const orgCatalogValue = Object.values(OrganizationType);
  const columns: GridColumns<OrgWithCounts> = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'shortName', headerName: 'Short Name', flex: 1 },
      {
        field: 'parentId',
        headerName: 'Parent',
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return orgs?.find((org) => org.id === params.value)?.name;
        },
      },
      {
        field: 'types',
        headerName: 'Type',
        flex: 1,
        type: 'singleSelect',
        valueOptions: orgCatalogValue,
      },
    ],
    []
  );

  if (isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div>
      <div tw="h-[750px] pt-5">
        <DataGrid
          sx={{ border: 'none' }}
          rows={orgs}
          columns={columns}
          disableVirtualization
          onRowClick={(params) => setSidebarState({ orgId: params.row.id, open: true })}
          components={{
            Toolbar: GridToolbar,
          }}
          disableDensitySelector
          disableColumnSelector
        />
      </div>
      <div tw="flex justify-center p-5">
        <Fab color="secondary" onClick={() => setDialogIsOpen(true)}>
          <AddIcon />
        </Fab>
      </div>
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
          <OrgDetailEdit
            key={sidebarState.orgId}
            orgFromList={orgs.find((org) => org.id === sidebarState.orgId)}
            closeEdit={() => setSidebarState({ orgId: null, open: false })}
          />
        )}
      </Drawer>
      <AddNewOrganizationDialog
        orgs={orgs}
        dialogIsOpen={dialogIsOpen}
        setDialogIsOpen={setDialogIsOpen}
        loggedInUser={loggedInUser}
      />
    </div>
  );
};
