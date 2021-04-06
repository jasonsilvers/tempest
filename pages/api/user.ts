import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { getUser } from '../../prisma/repositories/user';
import prisma from '../../prisma/prisma';

export const userApi = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  const { body, method } : { body:User, method?: string } = req;
  const user = await prisma.user.create({
      data: body,
    });
  switch (method) {
    case 'POST': {
      if (body.id) {
        res.status(400).end(`ID must be null`);
        break;
      }
      res.statusCode = 200;
      res.json(user);
      break;
    }

    default:
      res.setHeader('Allow', ['POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuth(userApi, getUser);
