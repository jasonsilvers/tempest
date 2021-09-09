import { MemberTrackingRecord } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
const dayjs = require('dayjs');
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../middleware/utils';
import { TempestError } from '../middleware/withErrorHandling';
import {
  findMemberTrackingRecordById,
  MemberTrackingRecordWithUsers,
  updateMemberTrackingRecord,
} from '../repositories/memberTrackingRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { EMtrVerb, EResource, ITempestApiError } from '../types/global';
import { filterObject } from '../utils/FilterObject';

const signTrainee = (userId: string, recordFromDb: MemberTrackingRecordWithUsers) => {
  if (userId === recordFromDb.authorityId) {
    throw new TempestError(409, 'Cannot sign as both authority and trainee');
  }
  // in the future throw error here if userId is not traineeId

  return {
    ...recordFromDb,
    traineeSignedDate: dayjs().toDate(),
  } as MemberTrackingRecordWithUsers;
};

const signAuthority = (userId: string, recordFromDb: MemberTrackingRecordWithUsers) => {
  if (userId === recordFromDb.traineeId) {
    throw new TempestError(409, 'Cannot sign as both authority and trainee');
  }

  return {
    ...recordFromDb,
    authoritySignedDate: dayjs().toDate(),
    authorityId: userId,
  } as MemberTrackingRecordWithUsers;
};

const checkPermission = async (user: LoggedInUser, traineeId) => {
  const ac = await getAc();

  const permission =
    user.id !== traineeId
      ? ac.can(user.role.name).updateAny(EResource.MEMBER_TRACKING_RECORD)
      : ac.can(user.role.name).updateOwn(EResource.MEMBER_TRACKING_RECORD);

  return permission.granted;
};

type MemberTrackingRecordsAction = (
  req: NextApiRequestWithAuthorization<LoggedInUser, MemberTrackingRecord>,
  res: NextApiResponse<MemberTrackingRecord | ITempestApiError>
) => void;

export const memberTrackingRecordPostSchema = {
  body: Joi.object({
    id: Joi.number().optional(),
    traineeSignedDate: Joi.date().optional().allow(null),
    authoritySignedDate: Joi.date().optional().allow(null),
    authorityId: Joi.string().optional().allow(null),
    createdAt: Joi.date().optional(),
    completedDate: Joi.date().optional().allow(null),
    order: Joi.number().optional(),
    traineeId: Joi.string().optional(),
    trackingItemId: Joi.number().required(),
  }),
  query: Joi.object({
    slug: Joi.optional(),
    id: Joi.optional(),
  }),
};

export const postMemberTrackingRecordsAction: MemberTrackingRecordsAction = async (req, res) => {
  const {
    query: { slug },
    body,
  } = req;

  const memberTrackingRecordId = parseInt(slug[0]);
  const verb = slug[1];

  if (!Object.values(EMtrVerb).includes(verb as EMtrVerb)) {
    throw new TempestError(400, 'Bad Request');
  }

  const recordFromDb = await findMemberTrackingRecordById(memberTrackingRecordId);

  if (!recordFromDb) {
    return recordNotFound(res);
  }

  // reduces cognitive complexity score by 1
  const granted = await checkPermission(req.user, recordFromDb.traineeId);
  if (!granted) {
    return permissionDenied(res);
  }

  let updatedRecord: MemberTrackingRecordWithUsers;

  if (verb === EMtrVerb.SIGN_TRAINEE) {
    updatedRecord = signTrainee(req.user.id, recordFromDb);
  }

  if (verb === EMtrVerb.SIGN_AUTHORITY) {
    updatedRecord = signAuthority(req.user.id, recordFromDb);
  }

  if (verb === EMtrVerb.UPDATE_COMPLETION) {
    const date = body.completedDate ? dayjs(body.completedDate) : null;

    if (date && date.isAfter(dayjs())) {
      throw new TempestError(409, 'Cannot update completion date in the future');
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
