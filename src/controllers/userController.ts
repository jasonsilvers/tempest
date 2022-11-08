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
import { getRoleById } from '../repositories/roleRepo';
import {
  deleteUser,
  FindUserById,
  findUserById,
  LoggedInUser,
  updateUser,
  updateUserRole,
} from '../repositories/userRepo';
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
      reportingOrganizationId: Joi.number().optional().allow(null, ''),
      tags: Joi.array().items(Joi.string()).optional().allow(null, ''),
      rank: Joi.string().optional().allow(null, ''),
      afsc: Joi.string().optional().allow(null, ''),
      dutyTitle: Joi.string().optional().allow(null, ''),
      address: Joi.string().optional().allow(null, ''),
    }),
  },
};

interface ITempestUserPostRequest extends NextApiRequestWithAuthorization<LoggedInUser> {
  body: Partial<User>;
}

const setup = async (req: ITempestUserPostRequest) => {
  const { query, body } = req;
  const userId = query.id as string;
  const userIdParam = parseInt(userId);
  const userFromParam = await findUserById(userIdParam);
  if (!userFromParam) {
    throw new NotFoundError();
  }
  const ac = await getAc();

  return { body, userIdParam, userFromParam, ac };
};

const resetUsersRoleToMemberIfOrgChanges = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  userFromParam: FindUserById,
  user: Partial<User>
) => {
  const userMakingRequest = req.user;
  const organizationIdFromBody = user.organizationId;

  const canNotUpdateRoleAndOrgAtSameTime =
    userMakingRequest.role.name !== ERole.PROGRAM_MANAGER && userMakingRequest.role.name !== ERole.ADMIN;

  const userIsUpdatingOrg = organizationIdFromBody && organizationIdFromBody !== userFromParam.organizationId;
  const changingOwnOrganization = userIsUpdatingOrg && userMakingRequest.id === userFromParam.id;

  // if orgId has changed and not a program admin. Set role to member
  if ((userIsUpdatingOrg && canNotUpdateRoleAndOrgAtSameTime) || changingOwnOrganization) {
    await updateUserRole(user.id, ERole.MEMBER);
  }
};

const getUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { userIdParam, ac, userFromParam } = await setup(req);
  let permission: Permission;

  if (req.user.id !== userIdParam) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, userFromParam.organizationId)) {
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

  res.status(200).json(userFromParam);
};

const putUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { userIdParam, ac, userFromParam, body } = await setup(req);

  if (body.roleId) {
    const requestedRoleUpdate = await getRoleById(body.roleId);

    if (requestedRoleUpdate.name === ERole.ADMIN) {
      throw new PermissionError();
    }
  }

  let permission: Permission;

  if (req.user.id !== userIdParam) {
    if (await userWithinOrgOrChildOrg(req.user.organizationId, userFromParam.organizationId)) {
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

  await resetUsersRoleToMemberIfOrgChanges(req, userFromParam, body);
  const filteredData = permission.filter(body);

  const updatedUser = await updateUser(userIdParam, filteredData);

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
