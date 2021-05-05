import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../../repositories/userRepo';
import prisma from '../../../prisma/prisma';

const trackingHandler = async (
  req: NextApiRequestWithAuthorization<User>,
  res: NextApiResponse
) => {
  if (req.method === 'DELETE') {
    const newItem = await prisma.trackingItem.delete({
      where: {
        id: parseInt(req.query.id as string),
      },
    });

    return res.status(200).json(newItem);
  }
};

export default trackingHandler;
