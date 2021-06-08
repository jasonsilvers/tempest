import { Grant } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { UserWithRole } from '../repositories/userRepo';
import { EFuncAction, EResource } from '../types/global';

const usePermissions = () => {
  const { user, isLoading: userIsLoading } = useUser<UserWithRole>();
  let isLoading = true;

  const grantsQuery = useQuery<Grant[]>('grants', () => axios.get('/api/grants').then((result) => result.data), {
    enabled: !!user,
    staleTime: 100000,
  });

  let ac: AccessControl;

  const permissionCheck = useCallback(
    (userRole: string, permission: EFuncAction, resource: EResource) => {
      try {
        const type = ac?.can(userRole)[permission](resource);
        return type;
      } catch (error) {
        return { granted: false };
      }
    },
    [grantsQuery.data]
  );

  let role: string;

  if (grantsQuery.data) {
    ac = new AccessControl(grantsQuery.data);
    role = user.role?.name;
  }

  if (!userIsLoading && !grantsQuery.isLoading) {
    isLoading = false;
  }

  return { ...grantsQuery, isLoading, ac, role, permissionCheck, user };
};

export default usePermissions;
