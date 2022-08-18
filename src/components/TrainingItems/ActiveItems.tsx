import { DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import { GridActionsCellItem, DataGrid, GridRowParams } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useState, useMemo } from 'react';
import { DeleteIcon, ArchiveIcon } from '../../assets/Icons';
import { EFuncAction, EResource, ETrackingItemVerb } from '../../const/enums';
import { useUpdateTrackingItemStatus, useDeleteTrackingItem } from '../../hooks/api/trackingItem';
import { usePermissions } from '../../hooks/usePermissions';
import { TrackingItemInterval } from '../../utils/daysToString';
import 'twin.macro';
import ConfirmDialog from '../Dialog/ConfirmDialog';

export const ActiveItems = ({ rows, processRowUpdate, components, renderCellExpand, selectedCatalog }) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, trackingItemId: null });
  const [archiveConfirmation, setArchiveConfirmation] = useState({ isOpen: false, trackingItemId: null });

  const { user, permissionCheck, isLoading } = usePermissions();
  const { mutate: del } = useDeleteTrackingItem();
  const { mutate: archive } = useUpdateTrackingItemStatus(ETrackingItemVerb.ARCHIVE);
  const { enqueueSnackbar } = useSnackbar();

  const canDeleteTrackingItem = permissionCheck(user?.role.name, EFuncAction.DELETE_ANY, EResource.TRACKING_ITEM);
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
        getActions: (params: GridRowParams) => {
          if (user.role.name !== 'admin' && selectedCatalog === 0 && canDeleteTrackingItem && canUpdateTrackingItem) {
            return [];
          }
          const memberTrackingItemCount: boolean = params.row?._count?.memberTrackingItem > 0;

          const filterActionIcon = (mtiCount: boolean) => {
            return !mtiCount ? (
              <GridActionsCellItem
                key={params.row?.id}
                icon={<DeleteIcon tw="text-secondary" />}
                label="Delete"
                onClick={() => {
                  setDeleteConfirmation({ isOpen: true, trackingItemId: params.row.id });
                }}
              />
            ) : (
              <GridActionsCellItem
                key={params?.row.id}
                icon={<ArchiveIcon tw="text-secondary" />}
                label="Archive"
                onClick={() => {
                  setArchiveConfirmation({ isOpen: true, trackingItemId: params.row.id });
                }}
              />
            );
          };
          return [
            // eslint-disable-next-line react/jsx-key
            filterActionIcon(memberTrackingItemCount),
          ];
        },
      },
    ],

    [canDeleteTrackingItem, canUpdateTrackingItem, selectedCatalog]
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
      {deleteConfirmation.isOpen && (
        <ConfirmDialog
          key="deleteDialog"
          open={deleteConfirmation.isOpen}
          handleNo={() => {
            setDeleteConfirmation({ isOpen: false, trackingItemId: null });
          }}
          handleYes={() => {
            del(deleteConfirmation.trackingItemId, {
              onSuccess: () => {
                enqueueSnackbar('Training Deleted', { variant: 'success' });
              },
              onError: () => {
                enqueueSnackbar('Error deleting training item. Please try again', { variant: 'error' });
              },
            });
            setDeleteConfirmation({ isOpen: false, trackingItemId: null });
          }}
        >
          <DialogTitle tw="text-primary text-center font-semibold">Warning!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to permantently delete this training item? Once deleted it cannot be recovered.
            </DialogContentText>
          </DialogContent>
        </ConfirmDialog>
      )}
      {archiveConfirmation.isOpen && (
        <ConfirmDialog
          key="archvieDialog"
          open={archiveConfirmation.isOpen}
          handleNo={() => {
            setArchiveConfirmation({ isOpen: false, trackingItemId: null });
          }}
          handleYes={() => {
            archive(archiveConfirmation.trackingItemId, {
              onSuccess: () => {
                enqueueSnackbar('Training Archived', { variant: 'success' });
              },
              onError: () => {
                enqueueSnackbar('Error archiving. Please try again!', { variant: 'error' });
              },
            });
            setArchiveConfirmation({ isOpen: false, trackingItemId: null });
          }}
        >
          <DialogContent>
            <DialogContentText>Are you sure you would like to send this training item to Archived?</DialogContentText>
          </DialogContent>
        </ConfirmDialog>
      )}
    </>
  );
};
