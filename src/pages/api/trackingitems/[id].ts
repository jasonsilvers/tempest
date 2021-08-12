import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import prisma from '../../../prisma/prisma';
import { LoggedInUser } from '../../../repositories/userRepo';
import { MethodNotAllowedError, withErrorHandlingAndAuthorization } from '../../../middleware/withErrorHandling';
import { returnUser } from '../../../repositories/loginRepo';

async function trackingItemHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;

  if (req.method !== 'DELETE') {
    throw new MethodNotAllowedError(method);
  }
  const newItem = await prisma.trackingItem.delete({
    where: {
      id: parseInt(req.query.id as string),
    },
  });

  return res.status(200).json(newItem);
}

export default withErrorHandlingAndAuthorization(trackingItemHandler, returnUser);
