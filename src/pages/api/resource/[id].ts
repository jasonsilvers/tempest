import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError, PermissionError, withErrorHandling } from '../../../middleware/withErrorHandling';
import { deleteResource } from '../../../repositories/resourceRepo';
import { LoggedInUser } from '../../../repositories/userRepo';
import { jwtParser } from '../../../utils/jwtUtils';

interface ITempestResourceIdApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

export const resourcesApiHandler = async (req: ITempestResourceIdApiRequest<LoggedInUser>, res: NextApiResponse) => {
  const {
    method,
    query: { id },
  } = req;

  const jwt = jwtParser(req);

  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }
  const resourceId = parseInt(id);
  if (method === 'DELETE') {
    await deleteResource(resourceId);
    return res.status(200).json({ message: 'ok' });
  }
  throw new MethodNotAllowedError();
};

export default withErrorHandling(resourcesApiHandler);
