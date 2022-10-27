import { OrganizationType } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { ERole } from '../../../const/enums';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createOrganizations } from '../../../repositories/organizationRepo';
import { getRoleByName } from '../../../repositories/roleRepo';
import { findUserByEmail, LoggedInUser, updateUser } from '../../../repositories/userRepo';

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
    const programManagerRole = await getRoleByName(ERole.PROGRAM_MANAGER)
    const createdOrgData = await createOrganizations({...body, types: [OrganizationType.CATALOG]});
    updateUser(req.user.id, { roleId: programManagerRole.id, organizationId: createdOrgData.id });
    res.status(200).json(createdOrgData);
  
};

export default withTempestHandlers(onboardOrgApiHandler, findUserByEmail, onboardOrganizationSchema);
