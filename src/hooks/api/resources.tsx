import { Resource } from '.prisma/client';
import axios from 'axios';
import { useQuery } from 'react-query';
import { EUri } from '../../const/enums';
import { ResourceDTO } from '../../types';

export const resourceQueryKeys = {
  resources: () => ['resources'],
};

export const useResources = () => {
  return useQuery<Resource[]>(resourceQueryKeys.resources(), () =>
    axios.get<ResourceDTO>(EUri.RESOURCES).then((result) => result.data.resource)
  );
};
