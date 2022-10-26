import { PersonalProtectionEquipmentItem } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { EResource, ITempestApiMessage } from '../const/enums';
import { getAc } from '../middleware/utils';
import { BadRequestError, NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import {
  createPPEItemForUser,
  deletePPEItemById,
  findPPEItemById,
  findPPEItemsByUserId,
  updatePPEItemById,
} from '../repositories/ppeItemsRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { PPEItemsDTO } from '../types';

export interface ITempestppeItemsApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    userId?: string;
    id?: string;
  };
}

export const postPpeItemSchema = {
  body: Joi.object({
    userId: Joi.number().required(),
    name: Joi.string().required(),
    provided: Joi.boolean().required(),
    inUse: Joi.boolean().required(),
  }),
  query: Joi.object({
    userId: Joi.number(),
  }),
};

export const getPpeItemsAction = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<PPEItemsDTO>
) => {
  const {
    query: { userId },
  } = req;

  if (!userId) {
    throw new BadRequestError();
  }

  const ac = await getAc();

  const userIdFilter = parseInt(userId);

  const permission =
    req.user.id !== userIdFilter
      ? ac.can(req.user.role.name).readAny(EResource.PPE_ITEM)
      : ac.can(req.user.role.name).readOwn(EResource.PPE_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const ppeItems = await findPPEItemsByUserId(userIdFilter);

  return res.status(200).json({ ppeItems });
};

export const postPpeItemsAction = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<PersonalProtectionEquipmentItem>
) => {
  const { body } = req;

  const ac = await getAc();

  const permission =
    req.user.id !== body.userId
      ? ac.can(req.user.role.name).createAny(EResource.PPE_ITEM)
      : ac.can(req.user.role.name).createOwn(EResource.PPE_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const filteredBody = permission.filter(body);

  const ppeItem = await createPPEItemForUser(filteredBody);

  return res.status(200).json(ppeItem);
};

export const putPpeItemSchema = {
  body: Joi.object({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().required(),
    provided: Joi.boolean().required(),
    inUse: Joi.boolean().required(),
  }),
  query: Joi.object({
    id: Joi.number(),
  }),
};

export const putPpeItemsAction = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<PersonalProtectionEquipmentItem>
) => {
  const {
    body,
    query: { id },
  } = req;

  if (!id) {
    throw new BadRequestError();
  }

  const ppeItemIdParam = parseInt(id);

  const ppeItemForUser = await findPPEItemById(ppeItemIdParam);

  if (!ppeItemForUser) {
    throw new NotFoundError();
  }

  const ac = await getAc();

  const permission =
    req.user.id !== ppeItemForUser.userId
      ? ac.can(req.user.role.name).updateAny(EResource.PPE_ITEM)
      : ac.can(req.user.role.name).updateOwn(EResource.PPE_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const filteredBody = permission.filter(body);

  const ppeItem = await updatePPEItemById(filteredBody, ppeItemIdParam);

  return res.status(200).json(ppeItem);
};

export const deletePpeItemsAction = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<ITempestApiMessage>
) => {
  const {
    query: { id },
  } = req;

  if (!id) {
    throw new BadRequestError();
  }

  const ppeItemIdParam = parseInt(id);

  const ppeItemForUser = await findPPEItemById(ppeItemIdParam);

  if (!ppeItemForUser) {
    throw new NotFoundError();
  }

  const ac = await getAc();

  const permission =
    req.user.id !== ppeItemForUser.userId
      ? ac.can(req.user.role.name).deleteAny(EResource.PPE_ITEM)
      : ac.can(req.user.role.name).deleteOwn(EResource.PPE_ITEM);

  if (!permission.granted) {
    throw new PermissionError();
  }

  await deletePPEItemById(ppeItemIdParam);

  return res.status(200).json({ message: 'ok' });
};
