import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { EUri } from '../../const/enums';
import { Grants } from '../../repositories/grantsRepo';
import { GrantsDTO } from '../../types';
import { Grant } from '@prisma/client';

export const grantsQueryKeys = {
  grants: () => ['grants'],
  grant: (id: number) => ['grant', id],
};

export const useGrants = () => {
  return useQuery<Grants>(grantsQueryKeys.grants(), () =>
    axios.get<GrantsDTO>(EUri.PERMISSIONS).then((result) => result.data.grants)
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
