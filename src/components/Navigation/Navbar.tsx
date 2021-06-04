import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import { TempestDrawer } from '../../lib/ui';

const Navbar: React.FC = () => {
  const { user } = useUser<User>();

  return (
    <TempestDrawer>
      <Header goToUrl="/">Tempest</Header>
      {user ? (
        <div tw="space-y-9">
          <Link goToUrl="/Dashboard">Dashboard</Link>
          <Link goToUrl={`/Profile/${user.id}`}>Profile</Link>
          <Link goToUrl="/Trackingitems">Tracking Items</Link>
        </div>
      ) : null}
    </TempestDrawer>
  );
};
export default Navbar;
