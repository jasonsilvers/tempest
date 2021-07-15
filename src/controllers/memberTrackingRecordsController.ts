import { MemberTrackingRecord } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../middleware/utils';
import { findMemberTrackingRecordById, updateMemberTrackingRecord } from '../repositories/memberTrackingRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { EMtrVerb, EResource, ITempestApiError } from '../types/global';
import { filterObject } from '../utils/FilterObject';

type MemberTrackingRecordsAction = (
  req: NextApiRequestWithAuthorization<LoggedInUser, MemberTrackingRecord>,
  res: NextApiResponse<MemberTrackingRecord | ITempestApiError>
) => void;

export const postMemberTrackingRecordsAction: MemberTrackingRecordsAction = async (req, res) => {
  const {
    query: { slug },
    body,
  } = req;

  const memberTrackingRecordId = parseInt(slug[0]);
  const verb = slug[1];

  return res.status(400).json({ message: 'Not implemented' });

  if (!Object.values(EMtrVerb).includes(verb as EMtrVerb)) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const ac = await getAc();

  const recordFromDb = await findMemberTrackingRecordById(memberTrackingRecordId);

  if (!recordFromDb) {
    return recordNotFound(res);
  }

  const permission =
    req.user.id !== recordFromDb.traineeId
      ? ac.can(req.user.role.name).updateAny(EResource.MEMBER_TRACKING_RECORD)
      : ac.can(req.user.role.name).updateOwn(EResource.MEMBER_TRACKING_RECORD);

  if (!permission.granted) {
    return permissionDenied(res);
  }

  let updatedRecord: typeof recordFromDb;

  if (verb === EMtrVerb.SIGN_TRAINEE) {
    if (req.user.id === recordFromDb.authorityId) {
      return res.status(409).json({ message: 'Cannot sign as both authority and trainee' });
    }

    updatedRecord = {
      ...recordFromDb,
      traineeSignedDate: dayjs().toDate(),
    };
  }

  if (verb === EMtrVerb.SIGN_AUTHORITY) {
    if (req.user.id === recordFromDb.traineeId) {
      return res.status(409).json({ message: 'Cannot sign as both authority and trainee' });
    }
    updatedRecord = {
      ...recordFromDb,
      authoritySignedDate: dayjs().toDate(),
    };
  }

  if (verb === EMtrVerb.UPDATE_COMPLETION) {
    const date = body.completedDate ? dayjs(body.completedDate) : null;

    if (date && date.isAfter(dayjs())) {
      return res.status(409).json({ message: 'Cannot update completion date in the future' });
    }
    updatedRecord = {
      ...recordFromDb,
      completedDate: date ? date.toDate() : null,
      traineeSignedDate: null,
      authoritySignedDate: null,
      authorityId: null,
    };
  }

  const filteredRecord = filterObject(updatedRecord, ['authority', 'trainee']) as MemberTrackingRecord;

  const updatedRecordFromDb = await updateMemberTrackingRecord(memberTrackingRecordId, filteredRecord);

  res.status(200).json(updatedRecordFromDb);
};
