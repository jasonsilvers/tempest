import { Grant } from '@prisma/client';
import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import axios from 'axios';
import { useCallback } from 'react';
import { useQuery } from 'react-query';
import { UserWithRole } from '../repositories/userRepo';
import { EPermission, EResource } from '../types/global';

const usePermissions = () => {
  const { user } = useUser<UserWithRole>();

  const grantsQuery = useQuery<Grant[]>(
    'grants',
    () => axios.get('/api/grants').then((result) => result.data),
    {
      enabled: !!user,
      staleTime: 100000,
    }
  );

  let ac: AccessControl;

  const permissionCheck = useCallback(
    (userRole: string, permission: EPermission, resource: EResource) => {
      try {
        const type = ac?.can(userRole)[permission](resource);
        return type;
      } catch (error) {
        return { granted: false };
      }
    },
    [grantsQuery.data]
  );

  let userRole: string;

  if (grantsQuery.data) {
    ac = new AccessControl(grantsQuery.data);
    userRole = user.role.name;
  }

  return { ...grantsQuery, ac, userRole, permissionCheck };
};

export default usePermissions;
