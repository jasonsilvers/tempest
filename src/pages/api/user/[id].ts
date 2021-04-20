import { User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { findUserById, updateUser } from '../../../prisma/repositories/user';

export default async function userQueryHandler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  const {
    query: { id },
    method,
    body,
  } = req;

 
  const userId = id as string;


  switch (method) {
    // Get Method to return a single user by id
    case 'GET': {
      const user = await findUserById(userId);
      res.status(200).json(user);
      break;
    }

    // PUT Method to update a single user
    case 'PUT': {
      // If the json body of the User does not have an id then return 400 bad request
      if (!body.id) {
        res.status(400).end('User must have id to update');
        break;
      }
      // if the Query id and JSON body id match then process the update
      if (body.id === userId) {
        const user = await updateUser(body);
        res.status(200).json(user);
        break;
      }
      // If the Query id and JSON body do not match
      // Then return a 400 bad request
      // We do this to ensure we know that this request was intentional
      else {
        res.status(400).end('User Obj and Query must match for id');
        break;
      }
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
