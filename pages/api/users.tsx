// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from "@prisma/client";
import { AccessControl } from "accesscontrol";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { NextAPIRequestWithAuthorization } from "../../middleware/types";
import jwtInterceptor from "../../middleware/utils";

function hasRoleAndCanReadResource (ac: AccessControl, role: string, resource: string) {
  return ac.hasRole(role) && ac.can(role).createAny(resource)
}

const users = async (req: NextAPIRequestWithAuthorization, res: NextApiResponse<User[]>) => {
  res.statusCode = 200;

  console.log(req.ac)
  const permission = hasRoleAndCanReadResource(req.ac, 'admin', 'record')

  console.log('this is the attributes', permission)

  const canBlah = permission.attributes.some(attribute => attribute === 'blah' || attribute === '!blah')

  const record = {
    name: 'fire extinguisher',
    blah: 'super blah'
  }

  const filteredList = permission.filter(record)
  console.log('filtered list', filteredList)

  console.log('This is the permission', permission.granted)

  console.log(!!filteredList.blah)

  const users = await prisma.user.findMany();

  res.json(users);
};

export default jwtInterceptor(users)

