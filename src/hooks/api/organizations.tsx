import { Organization } from '.prisma/client';
import axios from 'axios';
import { useQuery } from 'react-query';
import { OrgsDTO, EUri } from '../../types/global';

export const organizationQueryKeys = {
  organizations: () => ['organizations'],
  organization: (id: string) => ['organization', id],
};

export const useOrgs = () => {
  return useQuery<Organization[]>(organizationQueryKeys.organizations(), () =>
    axios.get<OrgsDTO>(EUri.ORGANIZATIONS).then((response) => response.data.organizations)
  );
};

export const useOrg = (organizationId: string) => {
  return useQuery<Organization>(
    organizationQueryKeys.organization(organizationId),
    () => axios.get<Organization>(EUri.ORGANIZATIONS + organizationId).then((res) => res.data),
    { enabled: !!organizationId }
  );
};
