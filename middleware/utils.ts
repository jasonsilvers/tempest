import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import jwt_decode from "jwt-decode";
import { Access, AccessControl } from "accesscontrol";
import cors from "./cors";
import { Grant, NextAPIRequestWithAuthorization, P1Token } from "./types";
import prisma from "../lib/prisma";

const dev = process.env.NODE_ENV === "development";

function getDodIdFromToken(jwt: string) {
  if (jwt === null || jwt === undefined) {
    return null;
  }

  const decodedJwt: P1Token = jwt_decode(jwt);
  const splitJWT = decodedJwt.usercertificate.split(".");

  return splitJWT[splitJWT.length - 1];
}

const jwtInterceptor = (handler: NextApiHandler) => async (
  req: NextAPIRequestWithAuthorization,
  res: NextApiResponse
) => {
  if (dev) {
    await cors(req, res);
  }

  const jwt = req.headers.authorization?.split(" ")[1];
  const dodId = getDodIdFromToken(jwt);

  console.log('DOD ID-', dodId)

  const user = await prisma.user.findFirst({
    where: { dodId },
    include: {organization: true}
  });

  console.log(user)

  const role = await prisma.role.findFirst({
    where: { id: user.roleId},
    include: {
      grant: {
        select: {
          action: true,
          attributes: true,
          resource: true,
          role: true
        }
      }
    }

  });

  // const permissions = role.permissions.map(permission => {
  //   return {
  //     role: permission.roleName,
  //     resource: permission.resourceName,
  //     action: permission.name,
  //     attributes: permission.attributes.join(', ')
  //   } as Grant
  // })
  
  console.log(role.grant)

  const ac = new AccessControl(role.grant);

  ac.grant

  req.ac = ac;

  return handler(req, res);
};

export default jwtInterceptor;
