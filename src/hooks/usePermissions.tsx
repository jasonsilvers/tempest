import { useUser } from '@tron/nextjs-auth-p1';
import { AccessControl } from 'accesscontrol';
import { useCallback } from 'react';
import { LoggedInUser } from '../repositories/userRepo';
import { EAction, EFuncAction, EResource, ERole } from '../const/enums';
import { useGrants } from './api/grants';
import { extendACRoles } from '../utils/AcRoleExtension';

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
    try {
      ac = new AccessControl(grantsQuery.data);
      extendACRoles(ac);
    } catch (error) {
      console.log(error, 'error creating access control list, attempting to clean grants');
      const cleanedUpGrants = grantsQuery.data.filter((grant) =>
        Object.values(EAction).some((action) => action === grant.action)
      );

      ac = new AccessControl(cleanedUpGrants);
      console.log('grants successfully cleaned');
    }
    role = user?.role?.name;
  }

  if (!userIsLoading && grantsQuery.data) {
    isLoading = false;
  }

  return { ...grantsQuery, isLoading, ac, role, permissionCheck, user };
};

export { usePermissions };
