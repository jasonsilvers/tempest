import { TrackingItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EUri, ETrackingItemVerb } from '../../const/enums';
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
  return useMutation<AxiosResponse<TrackingItem>, unknown, Partial<TrackingItem>>(
    (newTrackingItem: Partial<TrackingItem>) => axios.post<TrackingItem>(EUri.TRACKING_ITEMS, newTrackingItem),
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

const useUpdateTrackingItem = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<TrackingItem, unknown, Partial<TrackingItem>>(
    (updatedTrackingItem: Partial<TrackingItem>) =>
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

const useUpdateTrackingItemStatus = (variant: ETrackingItemVerb) => {
  const queryClient = useQueryClient();

  return useMutation<TrackingItem, unknown, number>(
    (trackingItemId: number) =>
      axios.post<TrackingItem>(`${EUri.TRACKING_ITEMS}${trackingItemId}/${variant}`).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(tiQueryKeys.trackingItems());
      },
    }
  );
};

export {
  useTrackingItems,
  useDeleteTrackingItem,
  useAddTrackingItem,
  useUpdateTrackingItem,
  useUpdateTrackingItemStatus,
};
