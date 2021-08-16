import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findMemberTrackingRecordById } from '../../../repositories/memberTrackingRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../types/global';
import {
  MethodNotAllowedError,
  PermissionError,
  withErrorHandlingAndAuthorization,
} from '../../../middleware/withErrorHandling';

interface ITempestMemberTrackingRecordApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

const INCLUDE_TRACKING_ITEM = true;

async function memberTrackingRecordIdHandler(
  req: ITempestMemberTrackingRecordApiRequest<LoggedInUser>,
  res: NextApiResponse
) {
  const {
    method,
    query: { id },
  } = req;

  const memberTrackingRecordId = parseInt(id);

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const memberTrackingRecord = await findMemberTrackingRecordById(memberTrackingRecordId, INCLUDE_TRACKING_ITEM);

      const permission =
        req.user.id !== memberTrackingRecord.traineeId
          ? ac.can(req.user.role.name).readAny(EResource.USER)
          : ac.can(req.user.role.name).readOwn(EResource.USER);

      if (!permission.granted) {
        throw new PermissionError();
      }

      return res.status(200).json(memberTrackingRecord);
    }

    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withErrorHandlingAndAuthorization(memberTrackingRecordIdHandler, findUserByDodId);
