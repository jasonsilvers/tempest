import axios, { AxiosResponse } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { Grants } from '../../repositories/grantsRepo';
import { GrantsDTO } from '../../types';
import { Grant } from '@prisma/client';
import { useSnackbar } from 'notistack';

export const grantsQueryKeys = {
  grants: () => ['grants'],
  grant: (id: number) => ['grant', id],
};

export const useGrants = () => {
  return useQuery<Grants>(grantsQueryKeys.grants(), () =>
    axios.get<GrantsDTO>(EUri.PERMISSIONS).then((result) => result.data.grants)
  );
};

export type NewGrant = Omit<Grant, 'id'>;

export const useAddGrant = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Grant>, unknown, NewGrant>(
    (grant: NewGrant) => axios.post<Grant>(EUri.PERMISSIONS, grant),
    {
      onSettled: () => {
        queryClient.invalidateQueries(grantsQueryKeys.grants());
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error adding TrackingItem. Please try again!', { variant: 'error' });
      },
    }
  );
};

export const useUpdateGrant = () => {
  const queryClient = useQueryClient();
  return useMutation<Grant, unknown, Grant>(
    (grant: Grant) => axios.put(EUri.PERMISSIONS + `${grant.id}`, grant).then((response) => response.data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(grantsQueryKeys.grants());
      },
    }
  );
};

export const useDeleteGrant = () => {
  const queryClient = useQueryClient();

  return useMutation(async (grantId: number) => (await axios.delete(EUri.PERMISSIONS + grantId)).data, {
    onSettled: () => {
      queryClient.invalidateQueries(grantsQueryKeys.grants());
    },
  });
};
