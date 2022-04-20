import React, { useMemo, useState } from 'react';
import { tiQueryKeys, useDeleteTrackingItem, useTrackingItems } from '../hooks/api/trackingItem';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { Box, Popper, Paper, Typography, Fab } from '@mui/material';
import { AddTrackingItemDialog } from '../components/TrainingItems/Dialog/AddTrackingItemDialog';
import { usePermissions } from '../hooks/usePermissions';
import { EFuncAction, EResource } from '../const/enums';
import { getTrackingItems } from '../repositories/trackingItemRepo';

import tw from 'twin.macro';
import { AddIcon, DeleteIcon } from '../assets/Icons';
import { DataGrid, GridActionsCellItem, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { TrackingItemInterval } from '../utils/daysToString';

const H1 = tw.h1`text-2xl mb-2`;
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

const TrackingItems = () => {
  const { data: trackingItems } = useTrackingItems();
  const [openDialog, setOpenDialog] = useState(false);
  const { user, permissionCheck, isLoading } = usePermissions();
  const { mutate: del } = useDeleteTrackingItem();
  const { enqueueSnackbar } = useSnackbar();

  const canDeleteTrackingItem = permissionCheck(user?.role.name, EFuncAction.DELETE_ANY, EResource.TRACKING_ITEM);
  const canCreateTrackingItem = permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM);

  const columns = useMemo(
    () => [
      {
        headerName: 'Title',
        field: 'title',
        renderCell: renderCellExpand,
        flex: 0.5,
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
        flex: 1,
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

  if (isLoading) {
    return <div>...loading</div>;
  }

  return (
    <div tw="flex flex-col max-width[1440px] min-width[800px] pr-5">
      <div tw="flex items-center pb-10">
        <H1>Global Training Catalog</H1>
        <div tw="flex ml-auto">
          {canCreateTrackingItem?.granted ? (
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
            autoHeight
            columns={columns}
            rows={trackingItems}
            disableVirtualization
            components={{ Toolbar: GridToolbar }}
          />
        )}
      </div>
      <AddTrackingItemDialog isOpen={openDialog} handleClose={() => setOpenDialog(false)}></AddTrackingItemDialog>
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
