import React from 'react';
import {withPageAuth} from '@tron/nextjs-auth-p1'

const Profile = () => {
  return <h1>Profile</h1>;
};

export default withPageAuth(Profile);
