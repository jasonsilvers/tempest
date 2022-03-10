import { NextApiRequest, NextApiResponse } from 'next';
import { main } from '../../../prisma/setupSeed';
import { clear } from '../../../prisma/utils';

import { MethodNotAllowedError, PermissionError, withErrorHandling } from '../../../middleware/withErrorHandling';
import { jwtParser } from '../../../utils/jwtUtils';

const SeedHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  const jwt = jwtParser(req);

  if (method !== 'GET') {
    throw new MethodNotAllowedError();
  }

  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }

  try {
    await clear();
    await main();
  } catch (e) {
    return res.status(500).json({ message: e });
  }

  res.status(200).json({ message: 'ok' });
};

export default withErrorHandling(SeedHandler);
