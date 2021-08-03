import React, { useState } from 'react';
import tw from 'twin.macro';
import { tiQueryKeys, useTrackingItems } from '../hooks/api/trackingItem';
import { QueryClient } from 'react-query';
import { dehydrate } from 'react-query/hydration';
import { TrainingItemRow, TrainingItemHeader } from '../components/TrainingItems/TrainingItemRow';
import { Button, SearchBar } from '../lib/ui';
import { AddTrackingItemDialog } from '../components/TrainingItems/Dialog/AddTrackingItemDialog';
import { usePermissions } from '../hooks/usePermissions';
import { EFuncAction, EResource } from '../types/global';

const H1 = tw.h1`text-xl text-primary font-family[DM Sans] mb-2`;

const TrackingItems = () => {
  const { data: trackingItems } = useTrackingItems();
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { user, permissionCheck, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const deletePermission = permissionCheck(user.role.name, EFuncAction.DELETE_ANY, EResource.TRACKING_ITEM);

  console.log(deletePermission.granted);

  return (
    <div tw="flex flex-col max-width[1440px] min-width[800px] pr-5">
      <div tw="flex items-center mb-5">
        <H1>Global Training Catalog</H1>
        <SearchBar
          tw="ml-auto"
          value={search}
          onChange={(searchValue) => setSearch(searchValue)}
          onCancelSearch={() => setSearch('')}
        />
        <Button tw="h-12 ml-10" variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          + Create New Training
        </Button>
      </div>
      <div tw="border-radius[10px] border overflow-hidden">
        <TrainingItemHeader />
        {trackingItems
          ?.filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
          )
          .map((trackingItem) => (
            <TrainingItemRow key={trackingItem.id} trackingItem={trackingItem} canDelete={deletePermission.granted} />
          ))}
      </div>
      <AddTrackingItemDialog isOpen={openDialog} handleClose={() => setOpenDialog(false)}></AddTrackingItemDialog>
    </div>
  );
};
export default TrackingItems;

export async function getStaticProps() {
  const prisma = require('../prisma/prisma');
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(tiQueryKeys.trackingItems(), () => prisma?.trackingItem.findMany() ?? []);

  return {
    props: {
      dehydrateState: dehydrate(queryClient),
    },
    revalidate: 30,
  };
}
