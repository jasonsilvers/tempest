import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { TrackingItemsDTO } from '../../types';

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
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<TrackingItem>, unknown, TrackingItem>(
    (newTrackingItem: TrackingItem) => axios.post<TrackingItem>(EUri.TRACKING_ITEMS, newTrackingItem),
    {
      onError: () => {
        snackbar.enqueueSnackbar('Error adding TrackingItem. Please try again!', { variant: 'error' });
      },
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

type PartialTrackingItem = {
  id: number;
  location: string;
};
const useUpdateTrackingItem = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<TrackingItem, unknown, PartialTrackingItem>(
    (updatedTrackingItem: PartialTrackingItem) =>
      axios
        .put<TrackingItem>(EUri.TRACKING_ITEMS + updatedTrackingItem.id, updatedTrackingItem)
        .then((response) => response.data),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Updated Tracking Item', { variant: 'success' });
      },

      onError: () => {
        snackbar.enqueueSnackbar('Error updating Tracking Item. Please try again!', { variant: 'error' });
      },

      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.trackingItems());
      },
    }
  );
};

export { useTrackingItems, useDeleteTrackingItem, useAddTrackingItem, useUpdateTrackingItem };
