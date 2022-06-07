import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError, PermissionError, withErrorHandling } from '../../../middleware/withErrorHandling';
import { deleteGrant, updateGrant } from '../../../repositories/grantsRepo';
import { LoggedInUser } from '../../../repositories/userRepo';
import { jwtParser } from '../../../utils/jwtUtils';

interface ITempestOrganizationIdApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

export const grantsApiHandler = async (req: ITempestOrganizationIdApiRequest<LoggedInUser>, res: NextApiResponse) => {
  const {
    method,
    body,
    query: { id },
  } = req;

  const jwt = jwtParser(req);

  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }
  const grantId = parseInt(id);

  if (method === 'PUT') {
    delete body.id;

    const updatedGrant = await updateGrant(grantId, body);

    return res.status(200).json({ grant: updatedGrant });
  }

  if (method === 'DELETE') {
    await deleteGrant(grantId);
    return res.status(200).json({ message: 'ok' });
  }

  throw new MethodNotAllowedError();
};

export default withErrorHandling(grantsApiHandler);
