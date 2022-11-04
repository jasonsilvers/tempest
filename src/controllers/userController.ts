import { User } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ERole, ITempestApiMessage } from '../const/enums';
import { getAc } from '../middleware/utils';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import {
  deleteAllMemberTrackingItemsForUserId,
  deleteAllMemberTrackingRecordsForUserId,
} from '../repositories/memberTrackingRepo';
import { getRoleById, getRoleByName } from '../repositories/roleRepo';
import { deleteUser, FindUserById, findUserById, LoggedInUser, updateUser } from '../repositories/userRepo';
import { loggedInUserHasPermissionOnUser } from '../utils/userHasPermissionWithinOrg';

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

const setup = async (req: NextApiRequestWithAuthorization<LoggedInUser>) => {
  const { query, body } = req;
  const userId = query.id as string;
  const userIdParam = parseInt(userId);
  const userFromParam: FindUserById = await findUserById(userIdParam);
  if (!userFromParam) {
    throw new NotFoundError();
  }
  const ac = await getAc();

  return { body, userIdParam, userFromParam, ac };
};

const getUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { ac, userFromParam } = await setup(req);

  if (!(await loggedInUserHasPermissionOnUser(req.user, userFromParam))) {
    throw new PermissionError('You do not have permissions to update that user');
  }

  const permission =
    req.user.id !== userFromParam.id
      ? ac.can(req.user.role.name).readAny(EResource.USER)
      : ac.can(req.user.role.name).readOwn(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError('You do not have read permissions for that resource');
  }

  res.status(200).json(userFromParam);
};

const putUserAction = async (
  req: NextApiRequestWithAuthorization<LoggedInUser>,
  res: NextApiResponse<User | ITempestApiMessage>
) => {
  const { userIdParam, ac, userFromParam, body } = await setup(req);
  const userMakingRequest = req.user;

  if (body.roleId) {
    const requestedRoleUpdate = await getRoleById(body.roleId);
    if (requestedRoleUpdate.name === ERole.ADMIN) {
      throw new PermissionError('You cannot update your role to admin');
    }
  }

  if (!(await loggedInUserHasPermissionOnUser(req.user, userFromParam))) {
    throw new PermissionError('You do not have permissions to update that user');
  }

  const permission =
    req.user.id !== userFromParam.id
      ? ac.can(req.user.role.name).updateAny(EResource.USER)
      : ac.can(req.user.role.name).updateOwn(EResource.USER);

  if (!permission.granted) {
    throw new PermissionError('You do not have update permissions for that resource');
  }

  let filteredData = permission.filter(body);

  const organizationIdFromBody = body.organizationId ? parseInt(body.organizationId) : null;

  const canNotUpdateRoleAndOrgAtSameTime =
    userMakingRequest.role.name !== ERole.PROGRAM_MANAGER && userMakingRequest.role.name !== ERole.ADMIN;
  const changingOwnOrganization = userMakingRequest.id === userFromParam.id;
  const userIsUpdatingOrg = organizationIdFromBody !== userFromParam.organizationId;

  // if orgId has changed and not a program admin. Set role to member
  if ((userIsUpdatingOrg && canNotUpdateRoleAndOrgAtSameTime) || changingOwnOrganization) {
    const memberRole = await getRoleByName(ERole.MEMBER);
    filteredData = { ...filteredData, roleId: memberRole.id };
  }

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
