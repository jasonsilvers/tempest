import { Drawer, Fab } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColumns,
  GridRowModel,
  GridRowParams,
  GridValueGetterParams,
} from '@mui/x-data-grid';
import { Organization, OrganizationType } from '@prisma/client';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import 'twin.macro';
import { AddIcon, DeleteIcon } from '../../assets/Icons';
import { useDeleteOrganization, useOrgs, useUpdateOrganization } from '../../hooks/api/organizations';
import { OrgWithCounts } from '../../repositories/organizationRepo';
import { AddNewOrganizationDialog } from './AddNewOrganizationDialog';
import { OrgDetailEdit } from './OrgDetailEdit';

export const OrganizationList = () => {
  const { data: orgs, isLoading } = useOrgs();
  const [sidebarState, setSidebarState] = useState({ orgId: null, open: false });

  const deleteOrg = useDeleteOrganization();
  const updateOrg = useUpdateOrganization();
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const deleteCellAction = (params: GridRowParams) => {
    const disabled = params.row?._count?.users > 0 || params.row?._count?.children > 0;

    return [
      // eslint-disable-next-line react/jsx-key
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        disabled={disabled}
        onClick={() => {
          deleteOrg.mutate(params.row.id, {
            onSuccess: () => {
              enqueueSnackbar('Organization Deleted', { variant: 'success' });
            },
            onError: (error: { response: { status: number; data: { message: string } } }) => {
              if (error.response.status === 409) {
                enqueueSnackbar(error.response.data.message, { variant: 'error' });
              }
            },
          });
        }}
      />,
    ];
  };
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

  const processRowUpdate = useCallback((updatedRow: GridRowModel<Organization>, oldRow: GridRowModel<Organization>) => {
    const { id, name, shortName, types } = updatedRow;
    if (oldRow.name !== name || oldRow.shortName !== shortName || oldRow.types !== types) {
      const newRow = { id, name, shortName, types };
      if (!name || !shortName) {
        throw new Error('Organization names cannot be empty');
      }
      updateOrg.mutate(newRow);
      return newRow;
    }
    return oldRow;
  }, []);

  const handleUpdateError = (e: Error) => {
    enqueueSnackbar(e.message, { variant: 'error' });
  };
  if (isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div>
      <div tw="h-[750px] pt-5">
        <DataGrid
          rows={orgs}
          columns={columns}
          disableVirtualization
          onRowClick={(params) => setSidebarState({ orgId: params.row.id, open: true })}
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
            org={orgs.find((org) => org.id === sidebarState.orgId)}
            closeEdit={() => setSidebarState({ orgId: null, open: false })}
          />
        )}
      </Drawer>
      <AddNewOrganizationDialog orgs={orgs} dialogIsOpen={dialogIsOpen} setDialogIsOpen={setDialogIsOpen} />
    </div>
  );
};
