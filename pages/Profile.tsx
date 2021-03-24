import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import { Resource, Role } from '../types/global';
import usePermissions from '../hooks/usePermissions';
import { UserWithRole } from '../prisma/repositories/user';

const Profile = () => {
  const { ac, isLoading, userRole } = usePermissions();

  const permission = ac?.can(userRole).read(Resource.PROFILE);

  if (isLoading) {
    return null;
  }

  if (permission?.granted) {
    return <h1>Profile</h1>;
  }

  return <h1>You do not have access to this page</h1>;
};

export default withPageAuth(Profile);
