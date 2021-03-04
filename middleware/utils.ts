import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import jwt_decode from "jwt-decode";
import { AccessControl } from "accesscontrol";
import cors from "./cors";
import {
  NextAPIRequestWithAuthorization,
  P1Token,
  UserDTO,
} from "./types";
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

  if (!jwt) {
    console.log('it does not have a jwt')
    res.statusCode = 500
    return res.json('No Authorization header')

  }
  const dodId = getDodIdFromToken(jwt);

  const user = await prisma.user.findFirst({
    where: { dodId },
    include: { organization: true },
  });

  const role = await prisma.role.findUnique({
    where: { id: user?.roleId },
    include: {
      grants: {
        select: {
          action: true,
          attributes: true,
          resource: true,
          role: true,
        },
      },
    },
  });

  const ac = new AccessControl(role.grants);

  const userDTO: UserDTO = {
    ...user,
    grants: role.grants
  };

  req.user = userDTO;
  req.accessControl = ac;

  return handler(req, res);
};

export default jwtInterceptor;
