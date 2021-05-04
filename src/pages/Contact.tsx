import { TrackingItem } from '.prisma/client';
import axios from 'axios';
import React from 'react';
import { useQuery } from 'react-query';

const Contact = (props) => {
  const { data: trackingItems } = useQuery<TrackingItem[]>(
    'tracking',
    async () => {
      return axios.get('/api/tracking').then((result) => result.data);
    }
  );

  return (
    <>
      <h1>List of tracking items</h1>
      {trackingItems?.map((trackingItem) => (
        <p key={trackingItem.id}>{trackingItem.title}</p>
      ))}
    </>
  );
};
export default Contact;
