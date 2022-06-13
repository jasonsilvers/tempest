import { Role } from '.prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { EUri } from '../../const/enums';
import { RolesDTO } from '../../types';
import { useSnackbar } from 'notistack';

export const rolesQueryKeys = {
  roles: () => ['roles'],
  role: (id: number) => ['role', id],
};

export const useRoles = () => {
  return useQuery<Role[]>(rolesQueryKeys.roles(), () =>
    axios.get<RolesDTO>(EUri.ROLES).then((results) => results.data.roles)
  );
};

export type NewRole = Omit<Role, 'id'>;

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Role>, unknown, NewRole>((role: NewRole) => axios.post<Role>(EUri.ROLES, role), {
    onError: () => {
      snackbar.enqueueSnackbar('Error adding role. Please try again!', { variant: 'error' });
    },

    onSettled: () => {
      queryClient.invalidateQueries(rolesQueryKeys.roles());
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation(async (roleId: number) => (await axios.delete(EUri.ROLES + roleId)).data, {
    onSettled: () => {
      queryClient.invalidateQueries(rolesQueryKeys.roles());
    },
  });
};
