import { TrackingItem, User } from '@prisma/client';
import { NextApiRequestWithAuthorization, withApiAuth } from '@tron/nextjs-auth-p1';
import {  NextApiResponse } from 'next';
import { findTrackingItemById, updateTrackingItem } from '../../../prisma/repositories/training';
import { findUserByDodId } from '../../../prisma/repositories/user';

async function trackingItemQueryHandler(
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse<TrackingItem>
) {
  const {
    query: { id },
    method,
    body,
  } = req;


  // Set trackingID to 0
  let trackingId = 0;

  // query params are sent as a string.  Lets check then parse the id
  if (typeof id === 'string') {
    trackingId = parseInt(id);
  }

  // Switch off of the different HTTP Methods we expect
  switch (method) {
    // Get Method to return a single TrackingItem by id
    case 'GET': {
      const trackingItem = await findTrackingItemById(trackingId);
      res.status(200).json(trackingItem);
      break;
    }

    // PUT Method to update a single TrackingItem
    case 'PUT': {
      // If the json body of the TrackingItem does not have an id then return 400 bad request
      if (!body.id) {
        res.status(400).end('TrackingItem must have id to update');
        break;
      }
      // if the Query id and JSON body id match then process the update
      if (body.id === trackingId) {
        const trackingItem = await updateTrackingItem(body);
        res.status(200).json(trackingItem);
        break;
      }
      // If the Query id and JSON body do not match
      // Then return a 400 bad request
      // We do this to ensure we know that this request was intentional
      else {
        res.status(400).end('TrackingItem Obj and Query must match for id');
        break;
      }
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(trackingItemQueryHandler, findUserByDodId);
