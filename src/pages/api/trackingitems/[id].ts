import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import prisma from '../../../prisma/prisma';
import { LoggedInUser } from '../../../repositories/userRepo';

async function trackingItemHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'DELETE') {
    const newItem = await prisma.trackingItem.delete({
      where: {
        id: parseInt(req.query.id as string),
      },
    });

    return res.status(200).json(newItem);
  } else {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

export default trackingItemHandler;
