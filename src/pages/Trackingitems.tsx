import { Box, Fab, MenuItem, Paper, Popper, Select, SelectChangeEvent, Tab, Tabs, Typography } from '@mui/material';
import { GridRenderCellParams, GridRowModel, GridToolbar } from '@mui/x-data-grid';
import { Organization, TrackingItem, TrackingItemStatus } from '@prisma/client';
import React, { useCallback, useEffect, useState } from 'react';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import 'twin.macro';
import { a11yProps, TabPanel } from '../../src/components/Devtools/index';
import { AddIcon } from '../assets/Icons';
import { ActiveItems } from '../components/TrainingItems/ActiveItems';
import { ArchivedItems } from '../components/TrainingItems/ArchivedItems';
import { AddTrackingItemDialog } from '../components/TrainingItems/Dialog/AddTrackingItemDialog';
import { EFuncAction, EResource } from '../const/enums';
import { useOrgs } from '../hooks/api/organizations';
import { tiQueryKeys, useTrackingItems, useUpdateTrackingItem } from '../hooks/api/trackingItem';
import { usePermissions } from '../hooks/usePermissions';
import { getTrackingItems } from '../repositories/trackingItemRepo';
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
    //Global catalog items will have organization id of null but also check that the selected catalog is set to the global catalog which is the first one in the list
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
  const [tabValue, setTabValue] = useState<number>(0);
  const { user, permissionCheck, isLoading } = usePermissions();
  const updateTrackingItem = useUpdateTrackingItem();
  const activeTrackingItems = trackingItems
    ? trackingItems.filter((ti) => ti.status === TrackingItemStatus.ACTIVE)
    : [];
  const inactiveTrackingItems = trackingItems
    ? trackingItems.filter((ti) => ti.status === TrackingItemStatus.INACTIVE)
    : [];

  const canCreateTrackingItem =
    permissionCheck(user?.role.name, EFuncAction.CREATE_ANY, EResource.TRACKING_ITEM)?.granted &&
    orgsWithCatalogs?.length > 0;

  useEffect(() => {
    if (orgsFromServer?.length > 0) {
      const returnedOrgsWithCatalogs = determineOrgsWithCatalogs(user, orgsFromServer);

      setOrgsWithCatalogs(returnedOrgsWithCatalogs);
    }
  }, [orgsFromServer, user]);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        <div>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
            <Tab label="Active Items" {...a11yProps(0)} />
            <Tab label="Archived" {...a11yProps(1)} />
          </Tabs>
        </div>
        <TabPanel value={tabValue} index={0}>
          {activeTrackingItems.length === 0 ? (
            <div tw="p-5">No Records</div>
          ) : (
            //disableVirtualization is for testing!! It won't render the actions without it. Need to workout a way to remove and still be able to test
            <ActiveItems
              rows={filterRows(activeTrackingItems, selectedCatalog)}
              processRowUpdate={processRowUpdate}
              components={{ Toolbar: GridToolbar }}
              renderCellExpand={renderCellExpand}
            />
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {inactiveTrackingItems.length === 0 ? (
            <div tw="p-5">No Records</div>
          ) : (
            //disableVirtualization is for testing!! It won't render the actions without it. Need to workout a way to remove and still be able to test
            <ArchivedItems
              rows={filterRows(inactiveTrackingItems, selectedCatalog)}
              processRowUpdate={processRowUpdate}
              components={{ Toolbar: GridToolbar }}
              renderCellExpand={renderCellExpand}
            />
          )}
        </TabPanel>
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
