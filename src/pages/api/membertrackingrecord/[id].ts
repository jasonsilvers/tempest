import { MemberTrackingRecord } from '@prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { getAc } from '../../../middleware/utils';
import {
  updateMemberTrackingRecord,
  deleteMemberTrackingRecord,
  findMemberTrackingRecordById,
} from '../../../repositories/memberTrackingRecordRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource } from '../../../types/global';
import user from '../user';

interface ITempestApiError {
  message: string;
}

async function authorityTrackingRecordHandler(
  req: NextApiRequestWithAuthorization<UserWithRole, MemberTrackingRecord>,
  res: NextApiResponse<MemberTrackingRecord | ITempestApiError>
) {
  const {
    query: { id },
    method,
    body,
  } = req;

  const ac = await getAc();
  let trackingRecordId: number;

  if (typeof id === 'string') {
    trackingRecordId = parseInt(id);
  }

  switch (method) {
    // Get Method to return a single user by id
    // PUT Method to update a single user
    case 'PUT': {
      const permission = ac
        ?.can(req.user.role.name)
        .update(EResource.TRACKING_RECORD);

      if (!permission?.granted) {
        return res.status(403).json({
          message: 'You do not have the appropriate permissions',
        });
      }

      // If the json body of the User does not have an id then return 400 bad request
      if (!body.id) {
        return res
          .status(400)
          .json({ message: 'Body does not include an memberTracking Id' });
      }

      if (body.authorityId === body.traineeId) {
        return res.status(403).json({
          message: 'You are not able to sign both signature blocks',
        });
      }

      //User should not able to sign for someone else
      if (body.authorityId && body.authorityId !== req.user.id) {
        return res.status(400).json({
          message: 'Unable to update records',
        });
      }

      if (body.traineeId && body.traineeId !== req.user.id) {
        return res.status(400).json({
          message: 'Unable to update records',
        });
      }

      const filteredBody = permission.filter(body);

      try {
        const memberTrackingRecord = await updateMemberTrackingRecord(
          trackingRecordId,
          filteredBody
        );
        res.status(200).json(memberTrackingRecord);
      } catch {
        return res.status(404).json({ message: 'record not found' });
      }

      break;
    }

    case 'DELETE': {
      const permission = ac
        ?.can(req.user.role.name)
        .delete(EResource.TRACKING_RECORD);

      if (!permission?.granted) {
        return res.status(403).json({
          message: 'You do not have the appropriate permissions',
        });
      }

      //get membertracking record from database
      try {
        const memberRecordFromDb = await findMemberTrackingRecordById(
          trackingRecordId
        );

        const filteredMemberRecordFromDb = permission.filter(
          memberRecordFromDb
        );

        if (
          permission.attributes.includes('!authorityId') &&
          memberRecordFromDb.authorityId
        ) {
          return res.status(403).json({
            message: 'Unable to delete record',
          });
        }

        const deletedRecord = await deleteMemberTrackingRecord(
          trackingRecordId
        );

        res.status(200).json({ message: 'record deleted' });
      } catch {
        return res.status(404).json({ message: 'record not found' });
      }

      break;
    }

    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}

export default withApiAuth(authorityTrackingRecordHandler, findUserByDodId);
