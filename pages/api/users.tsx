// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User, Organization, Prisma } from "@prisma/client";
import { AccessControl } from "accesscontrol";
import { NextApiRequest, NextApiResponse } from "next";
import { NextAPIRequestWithAuthorization } from "../../lib/p1Auth/server/types/types";
import prisma from "../../prisma/prisma";
import jwtInterceptor from "../../middleware/utils";
import withApiAuth from "../../lib/p1Auth/server/with-api-auth";

function hasRoleAndCanReadResource(
  ac: AccessControl,
  role: string,
  resource: string
) {
  return ac.hasRole(role) && ac.can(role).createAny(resource);
}

type UserWithRole = Prisma.UserGetPayload<{
  include: { Role: {include: {grants: true}} };
}>;


export const users = async (
  req: NextAPIRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<User[] | Object>
) => {


  console.log(req.user.Role)

  const ac = new AccessControl(req.user.Role.grants)

  console.log(ac)

  if (req.user) {
    res.statusCode = 200;
    const users = await prisma.user.findMany();
    res.json(users);
  } else {
    res.statusCode = 401;
    res.json({ suck: "you do" });
  }
};

export default withApiAuth<UserWithRole>(
  users,
  (query): Promise<UserWithRole> =>
    prisma.user.findUnique({
      where: { dodId: query },
      include: { Role: { include: { grants: true } } },
    })
);
