import { Box, Fab, MenuItem, Paper, Popper, Select, SelectChangeEvent, Typography } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridRenderCellParams, GridRowModel, GridToolbar } from '@mui/x-data-grid';
import { Organization, TrackingItem } from '@prisma/client';
import { useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import 'twin.macro';
import { AddIcon, DeleteIcon } from '../assets/Icons';
import { AddTrackingItemDialog } from '../components/TrainingItems/Dialog/AddTrackingItemDialog';
import { EFuncAction, EResource } from '../const/enums';
import { useOrgs } from '../hooks/api/organizations';
import { tiQueryKeys, useDeleteTrackingItem, useTrackingItems, useUpdateTrackingItem } from '../hooks/api/trackingItem';
import { usePermissions } from '../hooks/usePermissions';
import { getTrackingItems } from '../repositories/trackingItemRepo';
import { TrackingItemInterval } from '../utils/daysToString';
import { determineOrgsWithCatalogs } from '../utils/determineOrgsWithCatalogs';
interface IGridCellExpandProps {
  value: string;
  width: number;
}

function isOverflown(element: Element): boolean {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

const GridCellExpand = React.memo(function GridCellExpand(props: IGridCellExpandProps) {
  const { width, value } = props;
  const wrapper = React.useRef<HTMLDivElement | null>(null);
  const cellDiv = React.useRef(null);
  const cellValue = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showFullCell, setShowFullCell] = React.useState(false);
  const [showPopper, setShowPopper] = React.useState(false);

  const handleMouseEnter = () => {
    const isCurrentlyOverflown = isOverflown(cellValue.current);
    setShowPopper(isCurrentlyOverflown);
    setAnchorEl(cellDiv.current);
    setShowFullCell(true);
  };

  const handleMouseLeave = () => {
    setShowFullCell(false);
  };

  React.useEffect(() => {
    if (!showFullCell) {
      return undefined;
    }

    function handleKeyDown(nativeEvent: KeyboardEvent) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === 'Escape' || nativeEvent.key === 'Esc') {
        setShowFullCell(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowFullCell, showFullCell]);

  return (
    <Box
      ref={wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        alignItems: 'center',
        lineHeight: '24px',
        width: 1,
        height: 1,
        position: 'relative',
        display: 'flex',
      }}
    >
      <Box
        ref={cellDiv}
        sx={{
          height: 1,
          width,
          display: 'block',
          position: 'absolute',
          top: 0,
        }}
      />
      <Box ref={cellValue} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Box>
      {showPopper && (
        <Popper open={showFullCell && anchorEl !== null} anchorEl={anchorEl} style={{ width, marginLeft: -17 }}>
          <Paper elevation={1} style={{ minHeight: wrapper.current?.offsetHeight - 3 }}>
            <Typography variant="body2" style={{ padding: 8 }}>
              {value}
            </Typography>
          </Paper>
        </Popper>
      )}
    </Box>
  );
});

function renderCellExpand(params: GridRenderCellParams<string>) {
  return <GridCellExpand value={params.value || ''} width={params.colDef.computedWidth} />;
}

const filterRows = (trackingItems: TrackingItem[], selectedCatalog: number) => {
  return trackingItems.filter((ti) => {
    //Global catalog items will have organization id of null but also check that the selected calot is set to the global catalog which is the first one in the list
    if (ti.organizationId === null && selectedCatalog === 0) {
      return true;
    }

    return ti.organizationId === selectedCatalog;
  });
};

const TrackingItems = () => {
  const { data: trackingItems } = useTrackingItems();
  const { data: orgsFromServer } = useOrgs();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<number>(0);
  const [orgsWithCatalogs, setOrgsWithCatalogs] = useState<Organization[]>([]);
  const { user, permissionCheck, isLoading } = usePermissions();
  const { mutate: del } = useDeleteTrackingItem();
  const updateTrackingItem = useUpdateTrackingItem();
  const { enqueueSnackbar } = useSnackbar();

  const canDeleteTrackingItem = permissionCheck(user?.role.name, EFuncAction.DELETE_ANY, EResource.TRACKING_ITEM);
  const canCreateTrackingItem =
    permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM)?.granted &&
    orgsWithCatalogs?.length > 0;

  useEffect(() => {
    if (orgsFromServer?.length > 0) {
      const returnedOrgsWithCatalogs = determineOrgsWithCatalogs(user, orgsFromServer);

      setOrgsWithCatalogs(returnedOrgsWithCatalogs);
    }
  }, [orgsFromServer, user]);

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
          if (!canDeleteTrackingItem?.granted) {
            return [];
          }

          return [
            // eslint-disable-next-line react/jsx-key
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() =>
                del(id, {
                  onSuccess: () => {
                    enqueueSnackbar('Tracking Item Deleted', { variant: 'success' });
                  },
                })
              }
            />,
          ];
        },
      },
    ],
    [canDeleteTrackingItem]
  );

  const processRowUpdate = useCallback((newRow: GridRowModel<TrackingItem>, oldRow: GridRowModel<TrackingItem>) => {
    const { id, location } = newRow;
    if (oldRow.location !== newRow.location) {
      const newLocation = { id, location };
      updateTrackingItem.mutate(newLocation);
      return newLocation;
    }
    return oldRow.location;
  }, []);

  if (isLoading) {
    return <div>...loading</div>;
  }

  const handleCatalogChange = (event: SelectChangeEvent) => {
    setSelectedCatalog(parseInt(event.target.value));
  };

  return (
    <div tw="flex flex-col max-width[1440px] min-width[800px] p-5">
      <div tw="flex items-center pb-10">
        <Select
          tw="bg-white w-56"
          labelId="tracking-item-catalog-select"
          id="tracking-item-catalog-select"
          value={selectedCatalog.toString()}
          onChange={handleCatalogChange}
          size="small"
        >
          <MenuItem value={0}>Global Training Catalog</MenuItem>
          {orgsWithCatalogs.map((catalog) => (
            <MenuItem key={catalog.id} value={catalog.id}>
              {catalog.name}
            </MenuItem>
          ))}
        </Select>
        <div tw="flex ml-auto">
          {canCreateTrackingItem ? (
            <Fab
              color="secondary"
              size="medium"
              variant="extended"
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              Create
            </Fab>
          ) : null}
        </div>
      </div>
      <div tw="border-radius[10px] bg-white">
        {trackingItems.length === 0 ? (
          <div tw="p-5">No Records</div>
        ) : (
          //disableVirtualization is for testing!! It won't render the actions without it. Need to workout a way to remove and still be able to test
          <DataGrid
            disableSelectionOnClick
            disableColumnSelector
            autoHeight
            columns={columns}
            //Uses the select organizationsWithCatalog to filter list of data
            rows={filterRows(trackingItems, selectedCatalog)}
            experimentalFeatures={{ newEditingApi: true }}
            processRowUpdate={processRowUpdate}
            disableVirtualization
            components={{ Toolbar: GridToolbar }}
          />
        )}
      </div>
      {openDialog && (
        <AddTrackingItemDialog
          isOpen={openDialog}
          handleClose={() => setOpenDialog(false)}
          defaultCatalog={selectedCatalog.toString()}
        />
      )}
    </div>
  );
};
export default TrackingItems;

export async function getServerSideProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(tiQueryKeys.trackingItems(), () => getTrackingItems());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}
