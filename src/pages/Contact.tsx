import { TrackingItem } from '.prisma/client';
import { Button } from '@material-ui/core';
import axios from 'axios';
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import tw from 'twin.macro';

const Contact = (props) => {
  const queryClient = useQueryClient();

  const { data: trackingItems } = useQuery<TrackingItem[]>(
    'tracking',
    async () => {
      return axios.get('/api/tracking').then((result) => result.data);
    }
  );

  const { mutate } = useMutation(
    (newTrackingItem: TrackingItem) =>
      axios.post<TrackingItem>('/api/tracking', newTrackingItem),
    {
      onSettled: () => {
        queryClient.invalidateQueries('tracking');
      },
    }
  );

  const handleCreate = () => {
    const newTrackingItem = {
      title: 'new tracking item' + new Date(),
      description: 'This is a new tracking item',
      interval: 234,
    } as TrackingItem;

    mutate(newTrackingItem);
  };

  return (
    <>
      <h1 tw="text-2xl">List of tracking items</h1>
      {trackingItems?.map((trackingItem) => (
        <p key={trackingItem.id}>{trackingItem.title}</p>
      ))}

      <h2 tw="text-xl pt-4">Create Tracking Item</h2>
      <Button variant="outlined" onClick={handleCreate}>
        Create
      </Button>
    </>
  );
};
export default Contact;
