import { Grant } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiError } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createGrant, findGrants } from '../../../repositories/grantsRepo';
import { findResources } from '../../../repositories/resourceRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { GrantsDTO } from '../../../types';
import { jwtParser } from '../../../utils/jwtUtils';

const grantsPostSchema = {
  post: {
    body: Joi.object({
      action: Joi.string().required(),
      attributes: Joi.string().required(),
      resource: Joi.string().required(),
      role: Joi.string().required(),
    }),
  },
};

const grantsHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<GrantsDTO | Grant | ITempestApiError>
) => {
  const { body, method } = req;

  if (method === 'GET') {
    const grants = await findGrants();

    return res.status(200).json({ grants });
  }

  if (method === 'POST') {
    const jwt = jwtParser(req);
    const isAdmin =
      jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

    if (!isAdmin) {
      throw new PermissionError();
    }

    const resources = await findResources();

    if (!resources.some((resource) => resource.name === body.resource)) {
      return res.status(409).json({ message: 'unable to create grant for unknown resource' });
    }

    const newGrant = await createGrant(body);
    return res.status(200).json(newGrant);
  }

  throw new MethodNotAllowedError();
};

export default withTempestHandlers(grantsHandler, findUserByEmail, grantsPostSchema);
