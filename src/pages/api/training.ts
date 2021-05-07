import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../prisma/repositories/user';
import { createTrackingItem } from '../../prisma/repositories/training';

export const trackingApiHandler = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  const { body, method }: { body; method?: string } = req;
  switch (method) {
    // HTTP POST method case to create a TrackingItem
    case 'POST': {
      // Id must be null other wise prisma will throw an exception if it exists in DB
      if (body.id) {
        res.status(400).end(`ID must be null`);
        break;
      }
      // Call the repository and create the TrackingItem
      const trackingItem = await createTrackingItem(body);
      res.json(trackingItem);
      res.statusCode = 200;
      break;
    }

    // Disallow all methods except POST
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuth(trackingApiHandler, findUserByDodId);
