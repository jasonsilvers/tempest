import { Organization } from '.prisma/client';
import axios from 'axios';
import { useQuery } from 'react-query';
import { OrgsDTO, EUri } from '../../types/global';

export const useOrgs = () => {
  return useQuery<Organization[]>('organizations', () =>
    axios.get<OrgsDTO>(EUri.ORGANIZATIONS).then((response) => response.data.organizations)
  );
};
