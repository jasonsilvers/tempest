// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma'

export default async (req: NextApiRequest, res: NextApiResponse<User[]>) => {
  res.statusCode = 200

  const users = await prisma.user.findMany();

  res.json(users)
}
