import React from "react";
import AppBar from "../../UI Lib/AppBar";
import { useUser } from "@tron/nextjs-auth-p1";

import { Header, Link } from "./Navigation";
import { User } from ".prisma/client";
import tw from "twin.macro";

const Welcome = tw.div`ml-auto mr-4`

const Navbar: React.FC = () => {
  const { user } = useUser<User>();
  return (
    // user?
    <AppBar>
      <Header goToUrl="/">Tempest</Header>
      <Link goToUrl="/Dashboard">Dashboard</Link>
      <Link goToUrl="/Profile">Profile</Link>
      <Link goToUrl="/Contact">Contact</Link>
      <Link goToUrl="/Settings">Settings</Link>
      <Welcome>Welcome - {user?.name}</Welcome>
    </AppBar>
    // : null
  );
};

export default Navbar;
