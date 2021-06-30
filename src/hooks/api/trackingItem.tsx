import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { TrackingItemsDTO } from '../../types/global';

const TRACKING_ITEM_RESOURCE = 'trackingitems';

export const tiQueryKeys = {
  memberTrackingItems: () => ['trackingitems'],
};

const useTrackingItems = () => {
  return useQuery<TrackingItem[]>(tiQueryKeys.memberTrackingItems(), async () => {
    return axios.get<TrackingItemsDTO>(`/api/${TRACKING_ITEM_RESOURCE}`).then((result) => result.data.trackingItems);
  });
};

const useAddTrackingItem = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<TrackingItem>, unknown, TrackingItem>(
    (newTrackingItem: TrackingItem) => axios.post<TrackingItem>(`/api/${TRACKING_ITEM_RESOURCE}`, newTrackingItem),
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
    async (trackingItemId: number) => (await axios.delete(`/api/${TRACKING_ITEM_RESOURCE}/` + trackingItemId)).data,
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.memberTrackingItems());
      },
    }
  );
};

export { useTrackingItems, useDeleteTrackingItem, useAddTrackingItem };
