import React from 'react';
import { useUser, withPageAuth } from '@tron/nextjs-auth-p1';
import { EPermission, EResource } from '../types/global';
import usePermissions from '../hooks/usePermissions';
import MemberRecordTracker from '../components/Profile/MemberRecordTracker';
import { UserWithRole } from '../repositories/userRepo';
import tw from 'twin.macro';

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
      <h1 tw="text-4xl mt-14">My Training</h1>
      <MemberRecordTracker trackingRecord={user.traineeTrackingRecords} />
    </>
  );
};

export default withPageAuth(Profile);
