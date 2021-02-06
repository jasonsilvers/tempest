// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import prisma from '../../lib/prisma'

export default async (req, res) => {
  res.statusCode = 200

  const posts = await prisma.post.findMany();

  res.json(posts)
}