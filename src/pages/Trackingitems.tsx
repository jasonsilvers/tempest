import React, { useState } from 'react';
import tw from 'twin.macro';
import { tiQueryKeys, useAddTrackingItem, useDeleteTrackingItem, useTrackingItems } from '../hooks/api/trackingItem';
import { QueryClient } from 'react-query';
import prisma from '../prisma/prisma';
import { dehydrate } from 'react-query/hydration';
import { TrainingItemRow, TrainingItemHeader } from '../components/TrainingItems/TrainingItemRow';
import SearchBar from '../components/Search/SearchBar';

const H1 = tw.h1`text-xl text-primary font-family[DM Sans] mb-2`;

const TrackingItems = () => {
  const { data: trackingItems } = useTrackingItems();
  const { mutate: create, isLoading: isLoadingCreate } = useAddTrackingItem();
  const { mutate: del, isLoading: isLoadingDelete } = useDeleteTrackingItem();
  const [search, setSearch] = useState('');

  return (
    <>
      <H1>Global Training Catalog {isLoadingCreate || isLoadingDelete ? '...loading' : null}</H1>
      <SearchBar
        value={search}
        onChange={(searchValue) => setSearch(searchValue)}
        onCancelSearch={() => setSearch('')}
      />
      <TrainingItemHeader />
      {trackingItems
        ?.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
        .map((trackingItem) => (
          <TrainingItemRow key={trackingItem.id} trackingItem={trackingItem} />
        ))}
    </>
  );
};
export default TrackingItems;

export async function getStaticProps() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(tiQueryKeys.memberTrackingItems(), () => prisma.trackingItem.findMany());

  return {
    props: {
      dehydrateState: dehydrate(queryClient),
    },
    revalidate: 30,
  };
}
