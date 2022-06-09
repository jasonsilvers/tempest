import { Resource } from '.prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { EUri } from '../../const/enums';
import { ResourcesDTO } from '../../types';
import { useSnackbar } from 'notistack';

export const resourceQueryKeys = {
  resources: () => ['resources'],
  resource: (id: number) => ['resource', id],
};

export const useResources = () => {
  return useQuery<Resource[]>(resourceQueryKeys.resources(), () =>
    axios.get<ResourcesDTO>(EUri.RESOURCES).then((result) => result.data.resources)
  );
};

export type NewResource = Omit<Resource, 'id'>;

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Resource>, unknown, NewResource>(
    (resource: NewResource) => axios.post<Resource>(EUri.RESOURCES, resource),
    {
      onError: () => {
        snackbar.enqueueSnackbar('Error adding Resource. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(resourceQueryKeys.resources());
      },
    }
  );
};

export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation(async (resourceId: number) => (await axios.delete(EUri.RESOURCES + resourceId)).data, {
    onSettled: () => {
      queryClient.invalidateQueries(resourceQueryKeys.resources());
    },
  });
};
