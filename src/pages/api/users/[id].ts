import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { Permission } from 'accesscontrol';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { getAc, permissionDenied, recordNotFound } from '../../../middleware/utils';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByDodId, findUserById, updateUser, LoggedInUser } from '../../../repositories/userRepo';
import { EResource, ITempestApiError } from '../../../types/global';
import { isOrgChildOf } from '../../../utils/isOrgChildOf';

async function userWithinOrgOrChildOrg(reqUser: LoggedInUser, user: User) {
  if (
    reqUser.organizationId === user.organizationId ||
    (await isOrgChildOf(user.organizationId, reqUser.organizationId))
  ) {
    return true;
  }

  return false;
}

const userPutSchema = {
  put: {
    body: Joi.object({
      id: Joi.string().optional().allow(null),
      email: Joi.string().email().optional().allow(null),
      roleId: Joi.number().optional().allow(null),
      organizationId: Joi.string().optional().allow(null),
      tags: Joi.array().items(Joi.string()).optional().allow(null),
      rank: Joi.string().optional().allow(null),
      afsc: Joi.string().optional().allow(null),
      dutyTitle: Joi.string().optional().allow(null),
      address: Joi.string().optional().allow(null),
    }),
  },
};

async function userQueryHandler(
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) {
  const { query, method, body } = req;

  // Set userId to 0
  const userId = query.id as string;

  const ac = await getAc();

  const user = await findUserById(userId);

  if (!user) {
    return recordNotFound(res);
  }

  switch (method) {
    // Get Method to return a single user by id
    case 'GET': {
      let permission: Permission;

      if (req.user.id !== userId) {
        if (await userWithinOrgOrChildOrg(req.user, user)) {
          permission = ac.can(req.user.role.name).readAny(EResource.USER);
        } else {
          return permissionDenied(res);
        }
      } else {
        permission = ac.can(req.user.role.name).readOwn(EResource.USER);
      }

      if (!permission.granted) {
        return permissionDenied(res);
      }

      res.status(200).json(user);
      break;
    }

    case 'PUT': {
      const persmission =
        req.user.id !== userId
          ? ac.can(req.user.role.name).updateAny(EResource.USER)
          : ac.can(req.user.role.name).updateOwn(EResource.USER);

      if (!persmission.granted) {
        return permissionDenied(res);
      }

      const filteredData = persmission.filter(body);

      const updatedUser = await updateUser(userId, filteredData);

      res.status(200).json(updatedUser);
      break;
    }

    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      throw new MethodNotAllowedError(method);
  }
}

export default withTempestHandlers(userQueryHandler, findUserByDodId, userPutSchema);
