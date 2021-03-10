// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../prisma/prisma";

export default async (req: NextApiRequest, res: NextApiResponse<Post[]>) => {
  console.log("Made call");
  
  res.statusCode = 200;
  const posts = await prisma.post.findMany();

  res.json(posts);
};
