import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import jwt_decode from "jwt-decode";
import { Access, AccessControl } from "accesscontrol";
import cors from "./cors";
import { NextAPIRequestWithAuthorization, P1Token } from "./types";
import prisma from "../lib/prisma";

const dev = process.env.NODE_ENV === "development";

function getDodIdFromToken(jwt: string) {

  if (jwt === null || jwt === undefined) {
    return null
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

  console.log('test')
  console.log(req.headers)

  const jwt = req.headers.authorization?.split(" ")[1];
  const dodId = getDodIdFromToken(jwt);

  console.log('test')

  // const user = await prisma.user.findFirst({
  //   where: { dodId },
  // });

  //decode jwt
  //get userId
  //look up user in database
  //get role and permission
  //use role and permission to create Access Control object
  //attach access control object to req

  //Load ONLY users roles/permissions?
  //OR
  //Load all permissions and get users role?

  const roles = await prisma.role.findMany()

  console.log(roles)

  // const acFromDb2 = await prisma.accessControl2.findMany()

  // console.log(acFromDb2)

  let grantsObject = {
    admin: {
      record: {
        "create:any": ["*"],
        "read:any": ["*"],
        "update:any": ["*"],
        "delete:any": ["*"],
      },
    },
  };

  let userObject = {
    user: {
      record: {
        "read:own": ["*"],
        "update:own": ["*"],
      },
    },
  };

  const ac = new AccessControl(userObject);

  req.ac = ac;

  return handler(req, res);
};

export default jwtInterceptor;
