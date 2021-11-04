import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { Permission } from 'accesscontrol';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ERole, ITempestApiError } from '../const/enums';
import { getAc } from '../middleware/utils';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import { getRoleByName } from '../repositories/roleRepo';
import { deleteUser, findUserById, LoggedInUser, updateUser } from '../repositories/userRepo';
import { userWithinOrgOrChildOrg } from '../utils/userWithinOrgorChildOrg';

const userSchema = {
  put: {
    body: Joi.object({
      id: Joi.string().optional().allow(null, ''),
      email: Joi.string().email().optional().allow(null, ''),
      roleId: Joi.number().optional().allow(null, ''),
      organizationId: Joi.string().optional().allow(null, ''),
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
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError();
  }
  const ac = await getAc();

  return { body, userId, user, ac };
};

const getUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) => {
  const { userId, ac, user } = await setup(req);
  let permission: Permission;

  if (req.user.id !== userId) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, user.organizationId)) {
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

  res.status(200).json(user);
};

const putUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) => {
  const { userId, ac, user, body } = await setup(req);

  let permission: Permission;
  if (req.user.id !== userId) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, user.organizationId)) {
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

  // if check on change of orgId is needed
  if (body.organizationId && body.organizationId !== user.organizationId) {
    const memberRole = await getRoleByName(ERole.MEMBER);
    filteredData = { ...filteredData, roleId: memberRole.id };
  }

  const updatedUser = await updateUser(userId, filteredData);

  res.status(200).json(updatedUser);
};

const deleteUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiError>
) => {
  const { query, user } = req;
  const userId = query.id as string;
  const ac = await getAc();

  const permission = ac.can(user.role.name).deleteAny(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const deletedUser = await deleteUser(userId);

  if (deletedUser) {
    res.status(200).json({ message: 'ok' });
  } else {
    throw new NotFoundError();
  }
};

export { userSchema, getUserAction, putUserAction, deleteUserAction };