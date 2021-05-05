import { NextApiResponse } from 'next';
import {
  withApiAuth,
  NextApiRequestWithAuthorization,
} from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../repositories/userRepo';
import prisma from '../../prisma/prisma';

const trackingHandler = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  const trackingItems = await prisma.trackingItem.findMany();

  res.status(200).json(trackingItems);
};

export default trackingHandler;
