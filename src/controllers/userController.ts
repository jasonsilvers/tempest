import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { Permission } from 'accesscontrol';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ERole, ITempestApiMessage } from '../const/enums';
import { getAc } from '../middleware/utils';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import {
  deleteAllMemberTrackingItemsForUserId,
  deleteAllMemberTrackingRecordsForUserId,
} from '../repositories/memberTrackingRepo';
import { getRoleByName } from '../repositories/roleRepo';
import { deleteUser, findUserById, LoggedInUser, updateUser } from '../repositories/userRepo';
import { userWithinOrgOrChildOrg } from '../utils/userWithinOrgorChildOrg';

const userSchema = {
  put: {
    body: Joi.object({
      id: Joi.number().optional().allow(null, ''),
      firstName: Joi.string().optional().allow(null, ''),
      lastName: Joi.string().optional().allow(null, ''),
      email: Joi.string().email().optional().allow(null, ''),
      roleId: Joi.number().optional().allow(null, ''),
      organizationId: Joi.number().optional().allow(null, ''),
      tags: Joi.array().items(Joi.string()).optional().allow(null, ''),
      rank: Joi.string().optional().allow(null, ''),
      afsc: Joi.string().optional().allow(null, ''),
      dutyTitle: Joi.string().optional().allow(null, ''),
      address: Joi.string().optional().allow(null, ''),
    }),
  },
};

const setup = async (req: NextApiRequestWithAuthorization<LoggedInUser>) => {
  const { query, body } = req;
  const userId = query.id as string;
  const userIdParam = parseInt(userId);
  const userFromRequest = await findUserById(userIdParam);
  if (!userFromRequest) {
    throw new NotFoundError();
  }
  const ac = await getAc();

  return { body, userIdParam, userFromRequest, ac };
};

const getUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { userIdParam, ac, userFromRequest } = await setup(req);
  let permission: Permission;

  if (req.user.id !== userIdParam) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, userFromRequest.organizationId)) {
      permission = ac.can(req.user.role.name).readAny(EResource.USER);
    } else {
      throw new PermissionError();
    }
  } else {
    permission = ac.can(req.user.role.name).readOwn(EResource.USER);
  }

  if (!permission.granted) {
    throw new PermissionError();
  }

  res.status(200).json(userFromRequest);
};

const putUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { userIdParam, ac, userFromRequest, body } = await setup(req);

  let permission: Permission;

  if (req.user.id !== userIdParam) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, userFromRequest.organizationId)) {
      permission = ac.can(req.user.role.name).updateAny(EResource.USER);
    } else if (req.user.role.name === ERole.ADMIN) {
      permission = ac.can(req.user.role.name).updateAny(EResource.USER);
    } else {
      throw new PermissionError();
    }
  } else {
    permission = ac.can(req.user.role.name).updateOwn(EResource.USER);
  }

  if (!permission.granted) {
    throw new PermissionError();
  }

  let filteredData = permission.filter(body);

  const parsedOrganizationId = body.organizationId ? parseInt(body.organizationId) : null;
  let finalOrganizationId = userFromRequest.organizationId;

  // if check on change of orgId is needed
  if (parsedOrganizationId && parsedOrganizationId !== userFromRequest.organizationId) {
    const memberRole = await getRoleByName(ERole.MEMBER);
    filteredData = { ...filteredData, roleId: memberRole.id };
    finalOrganizationId = parsedOrganizationId;
  }

  const preparedFilteredData = { ...filteredData, organizationId: finalOrganizationId };

  const updatedUser = await updateUser(userIdParam, preparedFilteredData);

  res.status(200).json(updatedUser);
};

const deleteUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { query, user } = req;
  const userId = query.id as string;
  const userIdParam = parseInt(userId);
  const ac = await getAc();

  const permission = ac.can(user.role.name).deleteAny(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const userToDelete = await findUserById(userIdParam);

  if (!userToDelete) {
    throw new NotFoundError();
  }

  await deleteAllMemberTrackingRecordsForUserId(userIdParam);

  await deleteAllMemberTrackingItemsForUserId(userIdParam);

  await deleteUser(userIdParam);

  res.status(200).json({ message: 'ok' });
};

export { userSchema, getUserAction, putUserAction, deleteUserAction };
