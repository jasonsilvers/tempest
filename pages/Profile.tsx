import React from "react";
import { useUser, withPageAuth } from "@tron/nextjs-auth-p1";
import { UserWithGrants } from "../prisma/repositories/user";

const Profile = () => {
  const { user } = useUser<UserWithGrants>();

  console.log(user);

  return <h1>Profile</h1>;
};

export default withPageAuth(Profile);
