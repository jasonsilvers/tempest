import { useGrants, useUpdateGrant } from '../../hooks/api/grants';
import { DataGrid, GridColumns, GridRowModel } from '@mui/x-data-grid';
import { useCallback } from 'react';
import { Grant } from '@prisma/client';

const columns: GridColumns = [
  { field: 'action', headerName: 'action', flex: 1, editable: true },
  { field: 'attributes', headerName: 'attributes', flex: 1, editable: true },
  { field: 'resource', headerName: 'resource', flex: 1, editable: true },
  { field: 'role', headerName: 'Role', flex: 1, editable: true },
];

export const Grants = () => {
  const grantsQuery = useGrants();
  const mutateGrant = useUpdateGrant();

  const processRowUpdate = useCallback((newRow: GridRowModel<Grant>, oldRow: GridRowModel<Grant>) => {
    console.log(oldRow, newRow);

    if (
      oldRow.attributes !== newRow.attributes ||
      oldRow.action !== newRow.action ||
      oldRow.resource !== newRow.resource ||
      oldRow.role !== newRow.role
    ) {
      mutateGrant.mutate(newRow);

      return newRow;
    }

    return oldRow;
  }, []);

  return (
    <div style={{ height: 720, width: '100%' }}>
      <DataGrid
        rows={grantsQuery.data}
        columns={columns}
        processRowUpdate={processRowUpdate}
        experimentalFeatures={{ newEditingApi: true }}
      />
    </div>
  );
};
