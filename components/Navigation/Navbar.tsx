import React from 'react';
import Navigation from './Navigation';
import tw, { css, styled, theme } from 'twin.macro';

const Link = tw(Navigation.Link)`m-4`;

const Navbar: React.FC = () => {
  return (
    <div>
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Settings">Settings</Link>
    </div>
  );
};

export default Navbar;
