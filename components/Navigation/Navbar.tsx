import React from 'react';
import Navigation from './Navigation';
import tw, { css, styled, theme } from 'twin.macro';
import {useUser} from '../../lib/p1Auth/client/UserContextProvider'


const Header = tw(Navigation.Header)`mx-4 py-1 font-sans`;
const Link = tw(Navigation.Link)`mx-8 font-sans`;
// const Profile = tw(Navigation.Profile)`ml-auto items-center px-10`;



const Navbar: React.FC = () => {
  const {user} = useUser()
  return (
    // user?
    <Navigation activeLinkStyle={{color:'pink'}}>
      <Header goToUrl="/">Tempest</Header> 
      <Link activeLinkStyle={{color: 'red'}} goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Settings">Settings</Link>
      {/* <Profile goToUrl="/Profile">Steave</Profile> */}
    </Navigation>
    // : null
  );
};

export default Navbar;
