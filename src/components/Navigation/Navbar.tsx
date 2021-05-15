import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import { TempestDrawer } from '../../lib/ui';

const Navbar: React.FC = () => {
  const { user, isLoading } = useUser<User>();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TempestDrawer>
      <Header goToUrl="/">Tempest</Header>
      {user ? (
        <div tw="space-y-9">
          <Link goToUrl="/Dashboard">Dashboard</Link>
          <Link goToUrl="/Profile">Profile</Link>
          <Link goToUrl="/Contact">Contact</Link>
          <Link goToUrl="/Settings">Settings</Link>
        </div>
      ) : null}
    </TempestDrawer>
  );
};
export default Navbar;
