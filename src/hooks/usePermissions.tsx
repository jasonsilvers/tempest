import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import { useCallback } from 'react';
import { LoggedInUser } from '../repositories/userRepo';
import { EFuncAction, EResource } from '../const/enums';
import { useGrants } from './api/grants';

const usePermissions = () => {
  const { user, isLoading: userIsLoading } = useUser<LoggedInUser>();
  let isLoading = true;

  const grantsQuery = useGrants();

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
