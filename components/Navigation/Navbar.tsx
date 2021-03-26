import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import tw from 'twin.macro';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const Welcome = tw.div`ml-auto mr-4 text-red-500`;

const Navbar: React.FC = () => {
  const { user } = useUser<User>();

  return (
    <AppBar>
      <Toolbar>
        <Header goToUrl="/">Tempest</Header>
        {user ? (
          <>
            <Link goToUrl="/Dashboard">Dashboard</Link>
            <Link goToUrl="/Profile">Profile</Link>
            <Link goToUrl="/Contact">Contact</Link>
            <Link goToUrl="/Settings">Settings</Link>
            <Welcome>Welcome - {user.name}</Welcome>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
