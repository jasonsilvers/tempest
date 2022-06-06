import { PersonalProtectionEquipmentItem } from '@prisma/client';
import { NextApiResponse } from 'next';
import { ITempestApiMessage } from '../../../const/enums';
import {
  deletePpeItemsAction,
  ITempestppeItemsApiRequest,
  putPpeItemsAction,
  putPpeItemSchema,
} from '../../../controllers/ppeItemsController';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';

export const ppeScema = {
  put: putPpeItemSchema,
};

const ppeItemsIdHandler = async (
  req: ITempestppeItemsApiRequest<LoggedInUser>,
  res: NextApiResponse<PersonalProtectionEquipmentItem | ITempestApiMessage>
) => {
  const { method } = req;

  console.log(method);

  switch (method) {
    case 'PUT':
      return putPpeItemsAction(req, res);

    case 'DELETE':
      return deletePpeItemsAction(req, res);

    default:
      throw new MethodNotAllowedError();
  }
};

export default withTempestHandlers(ppeItemsIdHandler, findUserByEmail);
