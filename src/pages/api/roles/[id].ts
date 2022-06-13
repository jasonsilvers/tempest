import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError, PermissionError, withErrorHandling } from '../../../middleware/withErrorHandling';
import { deleteRole } from '../../../repositories/roleRepo';
import { LoggedInUser } from '../../../repositories/userRepo';
import { jwtParser } from '../../../utils/jwtUtils';

interface ITempestRoleIdApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
  };
}

export const rolesApiHandler = async (req: ITempestRoleIdApiRequest<LoggedInUser>, res: NextApiResponse) => {
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

  const roleId = parseInt(id);
  if (method === 'DELETE') {
    await deleteRole(roleId);
    return res.status(200).json({ message: 'ok' });
  }
  throw new MethodNotAllowedError();
};

export default withErrorHandling(rolesApiHandler);
