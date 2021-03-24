import React from 'react';
import { useUser } from '@tron/nextjs-auth-p1';
import { Header, Link } from './Navigation';
import { User } from '.prisma/client';
import tw from 'twin.macro';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const Welcome = tw.div`ml-auto mr-4 text-red-500`;

const Navbar: React.FC = () => {
  const { user, error } = useUser<User>();

  // error ??? adf

  return user ? (
    <AppBar>
      <Toolbar>
        <Header goToUrl="/">Tempest</Header>
        <Link goToUrl="/Dashboard">Dashboard</Link>
        <Link goToUrl="/Profile">Profile</Link>
        <Link goToUrl="/Contact">Contact</Link>
        <Link goToUrl="/Settings">Settings</Link>
        <Welcome>Welcome - {user.name}</Welcome>
      </Toolbar>
    </AppBar>
  ) : null;
};

export default Navbar;
