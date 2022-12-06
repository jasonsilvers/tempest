import { PersonalProtectionEquipmentItem } from '@prisma/client';
import { NextApiResponse } from 'next';
import {
  getPpeItemsAction,
  ITempestppeItemsApiRequest,
  postPpeItemsAction,
  postPpeItemSchema,
} from '../../../../controllers/ppeItemsController';
import { MethodNotAllowedError } from '../../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../../repositories/userRepo';
import { PPEItemsDTO } from '../../../../types';

export const ppeScema = {
  post: postPpeItemSchema,
};

const ppeItemsHandler = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<PPEItemsDTO | PersonalProtectionEquipmentItem>
) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getPpeItemsAction(req, res);

    case 'POST':
      return postPpeItemsAction(req, res);

    default:
      throw new MethodNotAllowedError();
  }
};

export default withTempestHandlers(ppeItemsHandler, findUserByEmail);
