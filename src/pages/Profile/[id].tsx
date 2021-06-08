import React, { useEffect } from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import usePermissions from '../../hooks/usePermissions';
import MemberItemTracker from '../../components/Records/MemberRecordTracker';
import { useMemberRecordTrackerState } from '../../hooks/uiState';
import HeaderUser from '../../components/Records/RecordHeader';
import { useRouter } from 'next/router';
import { EAction, EResource } from '../../types/global';

const Profile = () => {
  const {
    query: { id },
  } = useRouter();
  const resetCount = useMemberRecordTrackerState((state) => state.resetCount);

  const { permissionCheck, role, isLoading, user } = usePermissions();

  const userId = id?.toString();
  //Used to prevent the count for the tabs incrementing each time the page is loaded
  useEffect(() => {
    return () => resetCount();
  }, []);

  if (isLoading) {
    return <div>Loading Profile</div>;
  }

  const persmission =
    user.id !== id
      ? permissionCheck(role, EAction.READ_ANY, EResource.PROFILE)
      : permissionCheck(role, EAction.READ_OWN, EResource.PROFILE);

  if (!persmission?.granted) {
    return <div>You do not have permission to view that profile</div>;
  }

  return (
    <>
      <HeaderUser />
      <MemberItemTracker userId={userId} />
    </>
  );
};

export default withPageAuth(Profile);
