import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const tiQueryKeys = {
  memberTrackingItems: () => ['trackingitems'],
};

const useTrackingItems = () => {
  return useQuery<TrackingItem[]>(tiQueryKeys.memberTrackingItems(), async () => {
    return axios.get('/api/trackingitem').then((result) => result.data);
  });
};

const useAddTrackingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<TrackingItem>, unknown, TrackingItem>(
    (newTrackingItem: TrackingItem) => axios.post<TrackingItem>('/api/trackingitem', newTrackingItem),
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.memberTrackingItems());
      },
    }
  );
};

const useDeleteTrackingItem = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackingItemId: number) => (await axios.delete('/api/trackingitem/' + trackingItemId)).data,
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.memberTrackingItems());
      },
    }
  );
};

export { useTrackingItems, useDeleteTrackingItem, useAddTrackingItem };
