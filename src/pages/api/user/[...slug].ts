import { MemberTrackingRecord } from '@prisma/client';
import { withApiAuth } from '@tron/nextjs-auth-p1';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  findTrackingRecordsByTraineeId,
  findTrackingRecordsByAuthorityId,
  findUserByDodId,
} from '../../../repositories/userRepo';
import { EResourceType } from '../../../types/global';

async function memberTrackingRecordHandler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    query: { slug },
    method,
  } = req;

  if (slug.length > 2) {
    return res.status(404).json('Resource Not Found');
  }

  const userId = slug[0];
  const resourceType = slug[1];

  switch (method) {
    // Get Method to return a single user by id
    case 'GET': {
      let trackingRecords: MemberTrackingRecord[];
      if (resourceType === EResourceType.TRAINEE_RECORDS) {
        trackingRecords = await findTrackingRecordsByTraineeId(userId, true);
      } else if (resourceType === EResourceType.AUHTORITY_RECORDS) {
        trackingRecords = await findTrackingRecordsByAuthorityId(userId, true);
      } else {
        return res.status(404).json('Resource Not Found');
      }

      res.status(200).json(trackingRecords);
      break;
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export default withApiAuth(memberTrackingRecordHandler, findUserByDodId);
