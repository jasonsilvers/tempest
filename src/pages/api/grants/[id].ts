import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError, PermissionError, withErrorHandling } from '../../../middleware/withErrorHandling';
import { updateGrant } from '../../../repositories/grantsRepo';
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

  if (method !== 'PUT') {
    throw new MethodNotAllowedError();
  }

  const jwt = jwtParser(req);

  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }

  const bodyGrantId = parseInt(id);

  console.log(bodyGrantId);
  console.log(body);

  delete body.id;

  const updatedGrant = await updateGrant(bodyGrantId, body);

  res.status(200);
  res.json({ grant: updatedGrant });
};

export default withErrorHandling(grantsApiHandler);
