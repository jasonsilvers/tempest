import { NextApiResponse } from "next";
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from "@tron/nextjs-auth-p1";
import { User } from "@prisma/client";
import { getUser } from "../../prisma/repositories/user";
import prisma from "../../prisma/prisma";

const grants = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  res.statusCode = 200;

  const grants = await prisma.grant.findMany({
    select: { action: true, attributes: true, resource: true, role: true },
  });

  res.json(grants);
};

export default withApiAuth(grants, getUser);
