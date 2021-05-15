import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import usePermissions from '../hooks/usePermissions';
import MemberItemTracker from '../components/Records/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';

import { useProfile } from '../hooks/api/profile';

const Profile = () => {
  const { isLoading } = usePermissions();
  const { user } = useUser<UserWithRole>();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(
    user.id
  );

  // const permission = permissionCheck(
  //   role,
  //   EPermission.CREATE,
  //   EResource.RECORD
  // );

  if (isLoading) {
    return null;
  }

  // commented out for dev
  // if (!permission?.granted) {
  //   return <h1>You do not have access to this page</h1>;
  // }

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MemberItemTracker
        trackingItems={profileData?.memberTrackingItems ?? []}
      />
    </>
  );
};

export default withPageAuth(Profile);
