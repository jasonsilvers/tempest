import React from 'react';
import { withPageAuth } from '@tron/nextjs-auth-p1';
import { Resource } from '../types/global';
import usePermissions from '../hooks/usePermissions';
import Link from 'next/link';



const Profile = () => {
  const { ac, isLoading, userRole } = usePermissions();


  const permission = ac?.can(userRole).create(Resource.RECORD);
  

  if (isLoading) {
    return null;
  }

  if (permission?.granted) {
    return (
    <div>
    <h1>Profile</h1>
    <Link href="/TrackingItem"> Training Items </Link>
    </div>
    )
  }

  return <h1>You do not have access to this page</h1>;
};

export default withPageAuth(Profile);


