import { Resource } from '.prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { EUri } from '../../const/enums';
import { ResourceDTO } from '../../types';
import { useSnackbar } from 'notistack';

export const resourceQueryKeys = {
  resources: () => ['resources'],
  resource: (id: number) => ['resource', id],
};

export const useResources = () => {
  return useQuery<Resource[]>(resourceQueryKeys.resources(), () =>
    axios.get<ResourceDTO>(EUri.RESOURCES).then((result) => result.data.resource)
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
