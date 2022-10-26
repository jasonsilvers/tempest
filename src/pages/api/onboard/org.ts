import { OrganizationType } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import Joi from 'joi';
import { NextApiResponse } from 'next';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import { createOrganizations, updateOrganization } from '../../../repositories/organizationRepo';
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

    const createOrgData = await createOrganizations(body);
    const newOrgWithCatalog = await updateOrganization(createOrgData.id, {types: [OrganizationType.CATALOG]} )
    updateUser(req.user.id, { roleId: 5, organizationId: createOrgData.id });
    res.status(200);
    res.json(newOrgWithCatalog);
  
};

export default withTempestHandlers(onboardOrgApiHandler, findUserByEmail, onboardOrganizationSchema);
