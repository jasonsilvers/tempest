import { Post } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";


// type CopyWithPartial<T, K extends keyof T> = Omit<T, K> & Partial<T>;

// type PostPartial = CopyWithPartial<Post, 'id'>

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse<Post>
) {
  const {
    query: { id },
    method,
  } = req;

  let postId = 0;

  if (typeof id === "string") {
    postId = parseInt(id);
  }

  console.log(postId);

  switch (method) {
    case "GET": {
      const user = await prisma.post.findUnique({
        where: { id: postId },
      });

      res.status(200).json(user);
      break;
    }

    case "POST":
      break;
    case "PUT": {
      const { title, content, authorId } = req.body;
      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: { connect: { id: authorId } },
        },
      });
      res
        .status(200)
        .json(result);
      break;
    }
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
