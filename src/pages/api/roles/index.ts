import { Role } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ITempestApiMessage } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createRole, getRoles } from '../../../repositories/roleRepo';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { RolesDTO } from '../../../types';
import { jwtParser } from '../../../utils/jwtUtils';

const rolesPostSchema = {
  post: {
    body: Joi.object({
      name: Joi.string().required(),
    }),
  },
};

const rolesHandler = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<RolesDTO | Role | ITempestApiMessage>
) => {
  const { method, body } = req;

  const jwt = jwtParser(req);
  const isAdmin =
    jwt['group-full'].includes('/tron/roles/admin') || jwt['group-full'].includes('/Product-Teams/Tempest');

  if (!isAdmin) {
    throw new PermissionError();
  }

  switch (method) {
    case 'GET': {
      const roles = await getRoles();
      return res.status(200).json({ roles });
    }

    case 'POST': {
      const newRole = await createRole(body);
      return res.status(200).json(newRole);
    }
    default: {
      throw new MethodNotAllowedError(method);
    }
  }
};

export default withTempestHandlers(rolesHandler, findUserByEmail, rolesPostSchema);
