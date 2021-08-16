import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import prisma from '../../../prisma/prisma';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';

const trackingItemHandler = async (req: NextApiRequestWithAuthorization<User>, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const trackingItems = await prisma.trackingItem.findMany();

      return res.status(200).json({ trackingItems });
    }
    case 'POST': {
      const newItem = await prisma.trackingItem.create({
        data: req.body,
      });

      return res.status(200).json(newItem);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default trackingItemHandler;
