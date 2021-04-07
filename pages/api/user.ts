import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { getUserByDodId, postUser } from '../../prisma/repositories/user';

export const userApi = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  const { body, method }: { body: User; method?: string } = req;
  switch (method) {
    case 'POST': {
      if (body.id) {
        res.status(400).end(`ID must be null`);
        break;
      }
      res.json(postUser(body));
      res.statusCode = 200;
      break;
    }

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuth(userApi, getUserByDodId);
