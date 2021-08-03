import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EUri, TrackingItemsDTO } from '../../types/global';

export const tiQueryKeys = {
  trackingItems: () => ['trackingitems'],
};

const useTrackingItems = () => {
  return useQuery<TrackingItem[]>(tiQueryKeys.trackingItems(), async () => {
    return axios.get<TrackingItemsDTO>(EUri.TRACKING_ITEMS).then((result) => result.data.trackingItems);
  });
};

const useAddTrackingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<TrackingItem>, unknown, TrackingItem>(
    (newTrackingItem: TrackingItem) => axios.post<TrackingItem>(EUri.TRACKING_ITEMS, newTrackingItem),
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.trackingItems());
      },
    }
  );
};

const useDeleteTrackingItem = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackingItemId: number) => (await axios.delete(EUri.TRACKING_ITEMS + trackingItemId)).data,
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.trackingItems());
      },
    }
  );
};

export { useTrackingItems, useDeleteTrackingItem, useAddTrackingItem };
