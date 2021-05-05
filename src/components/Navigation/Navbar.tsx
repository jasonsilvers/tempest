import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import { Drawer } from '@material-ui/core';

const Navbar: React.FC = () => {
  const { user } = useUser<User>();

  return (
    <Drawer variant="permanent">
      <Header goToUrl="/">Tempest</Header>
      {user ? (
        <div tw="space-y-9">
          <Link goToUrl="/Dashboard">Dashboard</Link>
          <Link goToUrl="/Profile">Profile</Link>
          <Link goToUrl="/Contact">Contact</Link>
          <Link goToUrl="/Settings">Settings</Link>
        </div>
      ) : null}
    </Drawer>
  );
};

export default Navbar;