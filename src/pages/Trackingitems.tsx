import { TrackingItem } from '.prisma/client';
import { Button } from '@material-ui/core';
import React from 'react';
import faker from 'faker';
import tw from 'twin.macro';
import { tiQueryKeys, useAddTrackingItem, useDeleteTrackingItem, useTrackingItems } from '../hooks/api/trackingItem';
import { QueryClient } from 'react-query';
import prisma from '../prisma/prisma';
import { dehydrate } from 'react-query/hydration';

const H1 = tw.h1`text-2xl`;
const H2 = tw.h2`text-xl pt-4`;

const TrackingItems = () => {
  const { data: trackingItems } = useTrackingItems();
  const { mutate: create, isLoading: isLoadingCreate } = useAddTrackingItem();
  const { mutate: del, isLoading: isLoadingDelete } = useDeleteTrackingItem();

  const handleCreate = () => {
    const newTrackingItem = {
      title: faker.commerce.productAdjective() + ' ' + faker.commerce.productName() + ' training',
      description: faker.commerce.productDescription(),
      interval: faker.datatype.number({ min: 1, max: 365 }),
    } as TrackingItem;

    create(newTrackingItem);
  };

  return (
    <>
      <H1 tw="text-2xl">List of tracking items {isLoadingCreate || isLoadingDelete ? '...loading' : null}</H1>
      {trackingItems?.map((trackingItem) => (
        <div key={trackingItem.id}>
          <p>{trackingItem.title}</p>
          <p>{trackingItem.description}</p>
          <p>{trackingItem.interval}</p>
          <button tw="text-pink-400" onClick={() => del(trackingItem.id)}>
            Delete
          </button>
        </div>
      ))}

      <H2 tw="text-xl pt-4">Create Tracking Item</H2>
      <Button variant="outlined" onClick={handleCreate}>
        Create
      </Button>
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
