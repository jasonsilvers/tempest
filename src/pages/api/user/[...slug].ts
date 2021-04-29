import { MemberTrackingRecord } from '@prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  findTrackingRecordsByTraineeId,
  findTrackingRecordsByAuthorityId,
  findUserByDodId,
  UserWithRole,
} from '../../../repositories/userRepo';
import {
  EResource,
  EResourceType,
  ITempestApiError,
} from '../../../types/global';

async function memberTrackingRecordHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<MemberTrackingRecord[] | ITempestApiError>
) {
  const {
    query: { slug },
    method,
  } = req;

  const ac = await getAc();
  const permission = ac
    ?.can(req.user.role.name)
    .read(EResource.TRACKING_RECORD);

  if (!permission?.granted) {
    return res.status(403).json({
      message: 'You do not have the appropriate permissions',
    });
  }

  if (slug.length > 2) {
    return res.status(404).json({ message: 'Resource Not Found' });
  }

  const userId = slug[0];
  const resourceType = slug[1];

  switch (method) {
    // Get Method to return a single training record by id
    case 'GET': {
      let trackingRecords: MemberTrackingRecord[];
      if (resourceType === EResourceType.TRAINEE_RECORDS) {
        trackingRecords = await findTrackingRecordsByTraineeId(userId, true);
      } else if (resourceType === EResourceType.AUHTORITY_RECORDS) {
        trackingRecords = await findTrackingRecordsByAuthorityId(userId, true);
      } else {
        return res.status(404).json({ message: 'Resource Not Found' });
      }

      res.status(200).json(trackingRecords);
      break;
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withApiAuth(memberTrackingRecordHandler, findUserByDodId);
