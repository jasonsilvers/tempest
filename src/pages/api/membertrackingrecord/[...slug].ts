import { MemberTrackingRecord } from '.prisma/client';
import {
  NextApiRequestWithAuthorization,
  withApiAuth,
} from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import {
  getAc,
  permissionDenied,
  recordNotFound,
} from '../../../middleware/utils';
import {
  findMemberTrackingRecordById,
  updateMemberTrackingRecord,
} from '../../../repositories/memberTrackingRepo';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';

enum EMtrVerb {
  SIGN_TRAINEE = 'sign_trainee',
  SIGN_AUTHORITY = 'sign_authority',
  UPDATE_COMPLETION = 'update_completion',
}

async function memberTrackingRecordSlugHandler(
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse<MemberTrackingRecord | ITempestApiError>
) {
  const {
    method,
    query: { slug },
  } = req;

  const memberTrackingRecordId = parseInt(slug[0]);
  const verb = slug[1];

  if (!Object.values(EMtrVerb).includes(verb as EMtrVerb)) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const ac = await getAc();

  switch (method) {
    case 'POST': {
      const recordFromDb = await findMemberTrackingRecordById(
        memberTrackingRecordId
      );

      if (!recordFromDb) {
        return recordNotFound(res);
      }

      const permission =
        req.user.id !== recordFromDb.traineeId
          ? ac
              .can(req.user.role.name)
              .updateAny(EResource.MEMBER_TRACKING_RECORD)
          : ac
              .can(req.user.role.name)
              .updateOwn(EResource.MEMBER_TRACKING_RECORD);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      let updatedRecord: MemberTrackingRecord;

      if (verb === EMtrVerb.SIGN_TRAINEE) {
        if (req.user.id === recordFromDb.authorityId) {
          return res
            .status(409)
            .json({ message: 'Cannot sign as both authority and trainee' });
        }

        updatedRecord = {
          ...recordFromDb,
          traineeSignedDate: dayjs().toDate(),
        };
      }

      if (verb === EMtrVerb.SIGN_AUTHORITY) {
        if (req.user.id === recordFromDb.traineeId) {
          return res
            .status(409)
            .json({ message: 'Cannot sign as both authority and trainee' });
        }
        updatedRecord = {
          ...recordFromDb,
          authoritySignedDate: dayjs().toDate(),
        };
      }

      const updatedRecordFromDb = await updateMemberTrackingRecord(
        memberTrackingRecordId,
        updatedRecord
      );

      res.status(200).json(updatedRecordFromDb);
      break;
    }
    default:
      res.status(405).json({ message: `Method ${method} Not Allowed` });
      break;
  }
}

export default withApiAuth(memberTrackingRecordSlugHandler, findUserByDodId);