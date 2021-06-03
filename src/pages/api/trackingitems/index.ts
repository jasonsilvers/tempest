import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import prisma from '../../../prisma/prisma';

const trackingItemHandler = async (req: NextApiRequestWithAuthorization<User>, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const newItem = await prisma.trackingItem.create({
      data: req.body,
    });

    return res.status(200).json(newItem);
  }

  const trackingItems = await prisma.trackingItem.findMany();

  res.status(200).json(trackingItems);
};

export default trackingItemHandler;
