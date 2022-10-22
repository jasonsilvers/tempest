import { Organization } from '.prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { EOrganizationsIncludes, EUri } from '../../const/enums';
import { OrganizationWithChildrenAndUsers } from '../../repositories/organizationRepo';
import { OrgsDTO } from '../../types';

export const organizationQueryKeys = {
  organizations: (include: EOrganizationsIncludes = EOrganizationsIncludes.USER_OWNED) => ['organizations', include],
  organization: (id: number) => ['organization', id],
};

export const useOrgsLoggedInUsersOrgAndDown = () => {
  return useQuery<Organization[]>(organizationQueryKeys.organizations(), () =>
    axios.get<OrgsDTO>(EUri.ORGANIZATIONS).then((response) => response.data.organizations)
  );
};

export const useOrgsAll = () => {
  return useQuery<Organization[]>(organizationQueryKeys.organizations(EOrganizationsIncludes.ALL), () =>
    axios.get<OrgsDTO>('/api/organizations?include=all').then((response) => response.data.organizations)
  );
};

export const useOrg = (organizationId: number) => {
  return useQuery<OrganizationWithChildrenAndUsers>(
    organizationQueryKeys.organization(organizationId),
    async () => {
      return axios
        .get<OrganizationWithChildrenAndUsers>(EUri.ORGANIZATIONS + organizationId + '/?include=users&include=children')
        .then((res) => {
          return res.data;
        });
    },
    { enabled: !!organizationId }
  );
};

export const useCreateOrg = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Organization>, unknown, Organization>(
    (newOrganization: Organization) => axios.post<Organization>(EUri.ORGANIZATIONS, newOrganization),
    {
      onError: () => {
        snackbar.enqueueSnackbar('Error adding Organization. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(organizationQueryKeys.organizations());
      },
    }
  );
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation(async (organizationId: number) => (await axios.delete(EUri.ORGANIZATIONS + organizationId)).data, {
    onSettled: () => {
      queryClient.invalidateQueries(organizationQueryKeys.organizations());
    },
  });
};
type PartialOrganization = Partial<Organization>;
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  return useMutation<Organization, unknown, PartialOrganization>(
    (updatedOrganization: PartialOrganization) =>
      axios
        .put<Organization>(EUri.ORGANIZATIONS + updatedOrganization.id, updatedOrganization)
        .then((response) => response.data),
    {
      onSuccess: () => {
        snackbar.enqueueSnackbar('Updated Organization', { variant: 'success' });
      },
      onError: () => {
        snackbar.enqueueSnackbar('Error updating Organization. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(organizationQueryKeys.organizations());
      },
    }
  );
};
