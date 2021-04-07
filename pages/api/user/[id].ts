import { User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/prisma';
import { getUserById, putUser } from '../../../prisma/repositories/user';

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  const {
    query: { id },
    method,
    body,
  } = req;

  let userId = 0;

  if (typeof id === 'string') {
    userId = parseInt(id);
  }

  switch (method) {
    case 'GET': {
      const user = await getUserById(userId);

      res.status(200).json(user);
      break;
    }
    case 'PUT': {
      const user = await putUser(body);
      res.status(200).json(user);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
