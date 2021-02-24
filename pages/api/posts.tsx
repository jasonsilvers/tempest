// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async (req: NextApiRequest, res: NextApiResponse<Post[]>) => {
  res.statusCode = 200;
  const posts = await prisma.post.findMany();

  res.json(posts);
};
