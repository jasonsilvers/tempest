import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ERole } from '../../../const/enums';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createOrganizations } from '../../../repositories/organizationRepo';
import { findUserByEmail, LoggedInUser, updateUser, updateUserRole } from '../../../repositories/userRepo';

const onboardOrganizationPostSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    shortName: Joi.string().required(),
  }),
};

const onboardOrganizationSchema = {
  post: onboardOrganizationPostSchema,
};

const onboardOrgApiHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { body, method } = req;

  if (method !== 'POST') {
    throw new MethodNotAllowedError(method);
  }
  const createOrgData = await createOrganizations(body);
  updateUser(req.user.id, { roleId: 5, organizationId: createOrgData.id });
  updateUserRole(req.user.id, ERole.PROGRAM_MANAGER);
  res.status(200);
  res.json(createOrgData);
};

export default withTempestHandlers(onboardOrgApiHandler, findUserByEmail, onboardOrganizationSchema);
