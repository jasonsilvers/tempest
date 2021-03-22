import { NextApiResponse } from "next";
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from "@tron/nextjs-auth-p1";
import prisma from "../../prisma/prisma";
import { User } from ".prisma/client";

const login = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  res.statusCode = 200;
  res.json(req.user);
};

const getUser = (queryString: string) => {
  return prisma.user.findUnique({
    where: {
      dodId: queryString,
    },
  });
};

export default withApiAuth(login, getUser);
