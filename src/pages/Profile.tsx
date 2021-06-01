import React, { useEffect } from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import usePermissions from '../hooks/usePermissions';
import MemberItemTracker from '../components/Records/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';
import { useMemberRecordTrackerState } from '../hooks/uiState';

const Profile = () => {
  const { isLoading } = usePermissions();
  const { user } = useUser<UserWithRole>();
  const resetCount = useMemberRecordTrackerState((state) => state.resetCount);

  //Used to prevent the count for the tabs incrementing each time the page is loaded
  useEffect(() => {
    return () => resetCount();
  }, []);

  if (isLoading) {
    return null;
  }

  return <MemberItemTracker userId={user.id} />;
};

export default withPageAuth(Profile);
