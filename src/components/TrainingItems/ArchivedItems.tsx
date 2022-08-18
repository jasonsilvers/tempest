import { DialogContent, DialogContentText } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useState, useMemo } from 'react';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { EFuncAction, EResource, ETrackingItemVerb } from '../../const/enums';
import { useUpdateTrackingItemStatus } from '../../hooks/api/trackingItem';
import { usePermissions } from '../../hooks/usePermissions';
import { TrackingItemInterval } from '../../utils/daysToString';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import 'twin.macro';

export const ArchivedItems = ({ rows, processRowUpdate, components, renderCellExpand, selectedCatalog }) => {
  const [unarchiveConfirmation, setUnarchiveConfirmation] = useState({ isOpen: false, trackingItemId: null });

  const { user, permissionCheck, isLoading } = usePermissions();
  const { mutate: unarchive } = useUpdateTrackingItemStatus(ETrackingItemVerb.UNARCHIVE);
  const { enqueueSnackbar } = useSnackbar();

  const canUpdateTrackingItem = permissionCheck(user?.role.name, EFuncAction.UPDATE_ANY, EResource.TRACKING_ITEM);

  const columns = useMemo(
    () => [
      {
        headerName: 'Title',
        field: 'title',
        renderCell: renderCellExpand,
        flex: 0.8,
      },
      {
        headerName: 'Recurrence',
        field: 'interval',
        valueFormatter: ({ value }) => {
          return TrackingItemInterval[value];
        },
        width: 150,
      },
      {
        headerName: 'Description',
        field: 'description',
        renderCell: renderCellExpand,
        flex: 0.8,
      },
      {
        headerName: 'Location',
        field: 'location',
        renderCell: renderCellExpand,
        flex: 0.8,
        editable: true,
      },
      {
        field: 'actions',
        type: 'actions',
        width: 150,
        getActions: ({ id }) => {
          if (user.role.name === 'monitor' && selectedCatalog === 0 && canUpdateTrackingItem) {
            return [];
          }

          return [
            // eslint-disable-next-line react/jsx-key
            <GridActionsCellItem
              icon={<UnarchiveIcon tw="text-primary" />}
              label="UNARCHIVE"
              onClick={() => setUnarchiveConfirmation({ isOpen: true, trackingItemId: id })}
            />,
          ];
        },
      },
    ],
    [canUpdateTrackingItem, user.role.name, selectedCatalog]
  );
  if (isLoading) {
    return <div>...loading</div>;
  }
  return (
    <>
      <DataGrid
        disableSelectionOnClick
        disableColumnSelector
        autoHeight
        columns={columns}
        //Uses the select organizationsWithCatalog to filter list of data
        rows={rows}
        experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={processRowUpdate}
        disableVirtualization
        components={components}
      />

      {unarchiveConfirmation.isOpen && (
        <ConfirmDialog
          open={unarchiveConfirmation.isOpen}
          handleNo={() => {
            setUnarchiveConfirmation({ isOpen: false, trackingItemId: null });
          }}
          handleYes={() => {
            unarchive(unarchiveConfirmation.trackingItemId, {
              onSuccess: () => {
                enqueueSnackbar('UNARCHIVED', { variant: 'success' });
              },
              onError: () => {
                enqueueSnackbar('Error unarchiving. Please try again!', { variant: 'error' });
              },
            });
            setUnarchiveConfirmation({ isOpen: false, trackingItemId: null });
          }}
        >
          <DialogContent>
            <DialogContentText> Are you sure you would like to Unarchive this training item?</DialogContentText>
          </DialogContent>
        </ConfirmDialog>
      )}
    </>
  );
};
