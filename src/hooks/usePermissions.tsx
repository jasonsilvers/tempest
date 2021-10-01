import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { Grants } from '../repositories/grantsRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { EFuncAction, EResource, EUri } from '../const/enums';
import { GrantsDTO } from '../types';

const usePermissions = () => {
  const { user, isLoading: userIsLoading } = useUser<LoggedInUser>();
  let isLoading = true;

  const grantsQuery = useQuery<Grants>(
    'grants',
    () => axios.get<GrantsDTO>(EUri.PERMISSIONS).then((result) => result.data.grants),
    {
      enabled: !!user,
      staleTime: 100000,
    }
  );

  let ac: AccessControl;

  const permissionCheck = useCallback(
    (userRole: string, permission: EFuncAction, resource: EResource) => {
      try {
        return ac?.can(userRole)[permission](resource);
      } catch (error) {
        return { granted: false };
      }
    },
    [grantsQuery.data]
  );

  let role: string;

  if (grantsQuery.data) {
    ac = new AccessControl(grantsQuery.data);
    role = user?.role?.name;
  }

  if (!userIsLoading && grantsQuery.data) {
    isLoading = false;
  }

  return { ...grantsQuery, isLoading, ac, role, permissionCheck, user };
};

export { usePermissions };
