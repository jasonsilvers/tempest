import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import usePermissions from '../hooks/usePermissions';
import MemberItemTracker from '../components/Records/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';

const Profile = () => {
  const { isLoading } = usePermissions();
  const { user } = useUser<UserWithRole>();

  if (isLoading) {
    return null;
  }

  return <MemberItemTracker userId={user.id} />;
};

export default withPageAuth(Profile);
