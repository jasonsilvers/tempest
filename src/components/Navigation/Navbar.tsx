import React, { useMemo } from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import { TempestDrawer } from '../../lib/ui';
import { DashboardIcon, DescriptionIcon, PersonIcon } from '../../assets/Icons';
import { useQueryClient } from 'react-query';

const Navbar: React.FC = () => {
  const { user } = useUser<User>();
  const queryClient = useQueryClient();

  useMemo(() => {
    if (user) {
      queryClient.setQueryData('loggedInUser', user);
    }
  }, [user]);

  return (
    <TempestDrawer>
      <Header goToUrl="/">Tempest</Header>
      {user ? (
        <div tw="space-y-9">
          <Link goToUrl="/Dashboard" icon={<DashboardIcon fontSize="large" />}>
            <div>Dashboard</div>
          </Link>
          <Link goToUrl={`/Profile/${user.id}`} icon={<PersonIcon fontSize="large" />}>
            <div>My Profile</div>
          </Link>
          <Link goToUrl="/Trackingitems" icon={<DescriptionIcon fontSize="large" />}>
            <div>Global Training Catalog</div>
          </Link>
        </div>
      ) : null}
    </TempestDrawer>
  );
};
export default Navbar;
