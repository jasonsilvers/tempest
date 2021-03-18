import React from 'react';
import Navigation from './Navigation';
import tw, { css, styled, theme } from 'twin.macro';

const Link = tw(Navigation.Link)`m-4`;

const Navbar: React.FC = () => {
  return (
    <Navigation>
      <Navigation.Prev />
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Settings">Settings</Link>
    </Navigation>
  );
};

export default Navbar;
