import { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../prisma/prisma";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  const {
    query: { id },
    method,
  } = req;

  let userId = 0;

  if (typeof id === "string") {
    userId = parseInt(id);
  }

  switch (method) {
    case "GET": {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      res.status(200).json(user);
      break;
    }
    case "POST":
      break;
    case "PUT": {
      const { name, email } = req.body;
      const result = await prisma.user.create({
        data: {
          name,
          email,
        },
      });
      res.status(200).json(result);
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
