import { Organization } from '.prisma/client';
import axios from 'axios';
import { useQuery } from 'react-query';
import { OrgsDTO, EUri } from '../../types/global';

export const organizationQueryKeys = {
  many: () => ['organizations'],
  single: (id: string) => ['organization', id],
};

export const useOrgs = () => {
  return useQuery<Organization[]>(organizationQueryKeys.many(), () =>
    axios.get<OrgsDTO>(EUri.ORGANIZATIONS).then((response) => response.data.organizations)
  );
};

export const useOrg = (organizationId: string) => {
  return useQuery<Organization>(
    organizationQueryKeys.single(organizationId),
    () => axios.get<Organization>(EUri.ORGANIZATIONS + organizationId).then((res) => res.data),
    { enabled: !!organizationId }
  );
};
