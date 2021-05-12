import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import { EPermission, EResource } from '../types/global';
import usePermissions from '../hooks/usePermissions';
import MemberRecordTracker from '../components/Records/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';

const Profile = () => {
  const { isLoading, role, permissionCheck } = usePermissions();
  const { user } = useUser<UserWithRole>();
  const permission = permissionCheck(
    role,
    EPermission.CREATE,
    EResource.RECORD
  );

  if (isLoading) {
    return null;
  }

  // commented out for dev
  // if (!permission?.granted) {
  //   return <h1>You do not have access to this page</h1>;
  // }

  return (
    <>
      <MemberRecordTracker trackingRecords={user.traineeTrackingRecords} />
    </>
  );
};

export default withPageAuth(Profile);
