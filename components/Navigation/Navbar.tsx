import React from 'react';
import Navigation from './Navigation';
import tw, { css, styled, theme } from 'twin.macro';
import UserIcon from './Asset/UserIcon.svg'

const Header = tw(Navigation.Header)`mx-4 text-blue-100`;
const Link = tw(Navigation.Link)`mx-8`;
const Profile = tw(Navigation.Profile)`ml-auto items-center px-10`;



const Navbar: React.FC = () => {
  return (
    <Navigation>
      <Header goToUrl="/">Tempest</Header> 
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Settings">Settings</Link>
      <Profile goToUrl="/Profile">Steave</Profile>
    </Navigation>
  );
};

export default Navbar;
