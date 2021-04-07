import { User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
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
      if (!body.id) {
        res.status(400).end('User must have id to update');
        break;
      }
      if (body.id === userId) {
        const user = await putUser(body);
        res.status(200).json(user);
        break;
      } else {
        res.status(400).end('User Obj and Query must match for id');
        break;
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
