import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiError } from '../../../const/enums';
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
      id: Joi.number().optional(),
      name: Joi.string().required(),
    }),
  },
};

const resourceHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<ResourcesDTO | Resource | ITempestApiError>
) => {
  const { body, method } = req;

  switch (method) {
    case 'GET': {
      const jwt = jwtParser(req);
      const isAdmin =
        jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

      if (!isAdmin) {
        throw new PermissionError();
      }

      const resources = await findResources();

      return res.status(200).json({ resources });
    }

    case 'POST': {
      const jwt = jwtParser(req);
      const isAdmin =
        jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

      if (!isAdmin) {
        throw new PermissionError();
      }

      const newResource = await createResource(body);
      return res.status(200).json(newResource);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withTempestHandlers(resourceHandler, findUserByEmail, resourcePostSchema);
