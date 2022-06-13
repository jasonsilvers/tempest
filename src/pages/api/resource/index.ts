import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiMessage } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createResource, findResources } from '../../../repositories/resourceRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { ResourcesDTO } from '../../../types';
import { Resource } from '.prisma/client';
import { jwtParser } from '../../../utils/jwtUtils';

const resourcePostSchema = {
  post: {
    body: Joi.object({
      name: Joi.string().required(),
    }),
  },
};

const resourceHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<ResourcesDTO | Resource | ITempestApiMessage>
) => {
  const { body, method } = req;

  const jwt = jwtParser(req);
  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }

  switch (method) {
    case 'GET': {
      const resources = await findResources();

      return res.status(200).json({ resources });
    }

    case 'POST': {
      const newResource = await createResource(body);
      return res.status(200).json(newResource);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withTempestHandlers(resourceHandler, findUserByEmail, resourcePostSchema);
