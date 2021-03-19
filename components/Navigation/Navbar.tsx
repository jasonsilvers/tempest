import React from 'react';
import AppBar from '../../UI Lib/AppBar';
import { useUser } from '../../lib/p1Auth/client/UserContextProvider';

import { Header, Link } from './Navigation';

const Navbar: React.FC = () => {
  const { user } = useUser();
  return (
    // user?
    <AppBar>
      <Header goToUrl="/">Tempest</Header>
      <Link goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Settings">Settings</Link>
    </AppBar>
    // : null
  );
};

export default Navbar;
