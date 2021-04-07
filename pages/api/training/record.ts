import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import {
  getUserByDodId,
  UserWithRole,
} from '../../../prisma/repositories/user';
import prisma from '../../../prisma/prisma';
import { getAcList } from '../../../middleware/utils';
import { Resource } from '../../../types/global';

const canReadRecord = async (user: UserWithRole) => {
  const ac = await getAcList();

  return ac.can(user.role.name).read(Resource.TRAINING_RECORD);
};

const grants = async (
  req: NextApiRequestWithAuthorization<UserWithRole>,
  res: NextApiResponse
) => {
  const permission = await canReadRecord(req.user);

  if (permission.granted) {
    res.statusCode = 200;
    const records = await prisma.trainingRecord.findMany();
    res.json(records);
  } else {
    res.status(403).json('You dont have permission');
  }
};

export default withApiAuth(grants, getUserByDodId);
