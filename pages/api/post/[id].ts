import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  let postId: number = 0;

  if (typeof id === "string") {
    postId = parseInt(id);
  }

  console.log(postId)

  switch (method) {
    case "GET":
      const user = await prisma.post.findUnique({
        where: { id: postId },
      });

      res.status(200).json(user);
      break;

    case "POST":
      
      break;
    case "PUT":
      const {title, content, authorId } = req.body
      const result = await prisma.post.create({
        data: {
          title,
          content,
          author: {connect: {id: authorId}}
        }
      })
      res.status(200).json({ postId, title: title || `content ${content}` })
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
