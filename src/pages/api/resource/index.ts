import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ITempestApiMessage } from '../../../const/enums';
import { getAc } from '../../../middleware/utils';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createResource, findResources } from '../../../repositories/resourceRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { ResourceDTO } from '../../../types';
import { Resource } from '.prisma/client';

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
  res: NextApiResponse<ResourceDTO | Resource | ITempestApiMessage>
) => {
  const { body, method } = req;
  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = ac.can(req.user.role.name).readAny(EResource.ADMIN_PAGE);

      if (!permission.granted) {
        throw new PermissionError();
      }
      const resource = await findResources();

      return res.status(200).json({ resource });
    }

    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.ADMIN_PAGE);

      if (!permission.granted) {
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
