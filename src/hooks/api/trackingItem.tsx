import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const useTrackingItems = () => {
  return useQuery<TrackingItem[]>('trackingitem', async () => {
    return axios.get('/api/trackingitem').then((result) => result.data);
  });
};

const useAddTrackingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<TrackingItem>, unknown, TrackingItem>(
    (newTrackingItem: TrackingItem) =>
      axios.post<TrackingItem>('/api/trackingitem', newTrackingItem),
    {
      onSettled: () => {
        queryClient.invalidateQueries('trackingitem');
      },
    }
  );
};

const useDeleteTrackingItem = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackingItemId: number) =>
      (await axios.delete('/api/trackingitem/' + trackingItemId)).data,
    {
      onSettled: () => {
        queryClient.invalidateQueries('trackingitem');
      },
    }
  );
};

export { useTrackingItems, useDeleteTrackingItem, useAddTrackingItem };
