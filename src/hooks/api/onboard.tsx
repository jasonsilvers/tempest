import { Organization } from '@prisma/client';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { organizationQueryKeys } from './organizations';

export const useOnboardOrg = () => {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  return useMutation<AxiosResponse<Organization>, unknown, Organization>(
    (newOrganization: Organization) => axios.post<Organization>(EUri.ONBOARD, newOrganization),
    {
      onError: () => {
        snackbar.enqueueSnackbar('Error Onboarding. Please try again!', { variant: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries(organizationQueryKeys.organizations());
      },
    }
  );
};
