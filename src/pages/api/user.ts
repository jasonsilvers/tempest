import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId, createUser } from '../../repositories/userRepo';

export const userApiHandler = async (
  req: NextApiRequestWithAuthorization<User, User>,
  res: NextApiResponse
) => {
  const { body, method }: { body: User; method?: string } = req;
  switch (method) {
    // HTTP POST method case to create a user
    case 'POST': {
      // Id must be null other wise prisma will throw an exception if it exists in DB
      if (body.id) {
        res.status(400).end(`ID must be null`);
        break;
      }
      // Call the repository and create the user
      const user = await createUser(body);
      res.json(user);
      res.statusCode = 200;
      break;
    }

    // Disallow all methods except POST
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuth(userApiHandler, findUserByDodId);
