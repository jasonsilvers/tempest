import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import { EPermission, EResource } from '../types/global';
import usePermissions from '../hooks/usePermissions';
import MemberRecordTracker from '../components/Records/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';

const Profile = () => {
  const { isLoading, userRole, permissionCheck } = usePermissions();
  const { user } = useUser<UserWithRole>();
  console.log(user);

  const permission = permissionCheck(
    userRole,
    EPermission.CREATE,
    EResource.RECORD
  );

  if (isLoading) {
    return null;
  }

  if (!permission?.granted) {
    return <h1>You do not have access to this page</h1>;
  }

  return (
    <>
      <MemberRecordTracker trackingRecord={user.traineeTrackingRecords} />
    </>
  );
};

export default withPageAuth(Profile);
