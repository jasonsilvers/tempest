import { PersonalProtectionEquipmentItem } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { PPEItemsDTO } from '../../types';

export const ppeQueryKeys = {
  items: () => ['ppe'],
};

export const usePpeItems = (userId: number) => {
  return useQuery<PersonalProtectionEquipmentItem[]>(
    ppeQueryKeys.items(),
    async () => {
      return axios.get<PPEItemsDTO>(EUri.PPE_ITEMS + `/?userId=${userId}`).then((result) => result.data.ppeItems);
    },
    { enabled: !!userId }
  );
};

export const useCreatePpeItem = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<
    AxiosResponse<PersonalProtectionEquipmentItem>,
    unknown,
    Omit<PersonalProtectionEquipmentItem, 'id'>
  >(
    (newPpeItem: Omit<PersonalProtectionEquipmentItem, 'id'>) =>
      axios.post<PersonalProtectionEquipmentItem>(EUri.PPE_ITEMS, newPpeItem),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Added PPE Item!', { variant: 'success' });
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error adding PPE Item. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(ppeQueryKeys.items());
      },
    }
  );
};

export const useUpdatePpeItem = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<PersonalProtectionEquipmentItem, unknown, PersonalProtectionEquipmentItem>(
    (ppeItem: PersonalProtectionEquipmentItem) =>
      axios
        .put<PersonalProtectionEquipmentItem>(EUri.PPE_ITEMS + ppeItem.id, ppeItem)
        .then((response) => response.data),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Updated PPE Item!', { variant: 'success' });
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error updating PPE Item. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(ppeQueryKeys.items());
      },
    }
  );
};

export const useDeletePpeItem = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation(async (ppeItemId: number) => (await axios.delete(EUri.PPE_ITEMS + ppeItemId)).data, {
    onSuccess: () => {
      snackbar.enqueueSnackbar('Deleted PPE Item!', { variant: 'success' });
    },
    onSettled: () => {
      queryClient.invalidateQueries(ppeQueryKeys.items());
    },
    onError: () => {
      snackbar.enqueueSnackbar('Error deleting PPE Item. Please try again!', { variant: 'error' });
    },
  });
};
