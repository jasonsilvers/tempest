import { TrackingItem } from '.prisma/client';
import { Button } from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import tw from 'twin.macro';

const Contact = (props) => {
  const queryClient = useQueryClient();

  const { data: trackingItems } = useQuery<TrackingItem[]>(
    'trackingitem',
    async () => {
      return axios.get('/api/trackingitem').then((result) => result.data);
    }
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (newTrackingItem: TrackingItem) =>
      axios.post<TrackingItem>('/api/trackingitem', newTrackingItem),
    {
      onSettled: () => {
        queryClient.invalidateQueries('trackingitem');
      },
    }
  );

  const { mutate: del, isLoading: isLoadingDelete } = useMutation(
    async (trackingItemId: number) =>
      (await axios.delete('/api/trackingitem/' + trackingItemId)).data,
    {
      onSettled: () => {
        queryClient.invalidateQueries('trackingitem');
      },
    }
  );

  const handleCreate = () => {
    const newTrackingItem = {
      title: 'new tracking item - ' + new Date(),
      description: 'This is a new tracking item',
      interval: 234,
    } as TrackingItem;

    create(newTrackingItem);
  };

  return (
    <>
      <h1 tw="text-2xl">
        List of tracking items{' '}
        {isLoadingCreate || isLoadingDelete ? '...loading' : null}
      </h1>
      {trackingItems?.map((trackingItem) => (
        <div key={trackingItem.id}>
          <p>{trackingItem.title} </p>
          <button onClick={() => del(trackingItem.id)}>Delete</button>
        </div>
      ))}

      <h2 tw="text-xl pt-4">Create Tracking Item</h2>
      <Button variant="outlined" onClick={handleCreate}>
        Create
      </Button>
    </>
  );
};
export default Contact;
