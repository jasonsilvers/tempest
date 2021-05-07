import React from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { EPermission, EResource } from '../types/global';
import usePermissions from '../hooks/usePermissions';

const Profile = () => {
  const { isLoading, role, permissionCheck } = usePermissions();

  const permission = permissionCheck(
    role,
    EPermission.CREATE,
    EResource.RECORD
  );

  if (isLoading) {
    return null;
  }

  if (!permission?.granted) {
    return <h1>You do not have access to this page</h1>;
  }

  return <h1>Profile</h1>;
};

export default withPageAuth(Profile);
