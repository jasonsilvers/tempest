import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { createOrganizations, getOrganizationAndDown } from '../../../repositories/organizationRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';
import { usersPermissionOnOrg } from '../../../controllers/organizationController';

const organizationPostSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    shortName: Joi.string().required(),
    parentId: Joi.number().optional().allow(null),
  }),
};

const organizationSchema = {
  post: organizationPostSchema,
};

const organizationApiHandler = async (req: NextApiRequestWithAuthorization<LoggedInUser>, res: NextApiResponse) => {
  const { body, method } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = usersPermissionOnOrg(req.user.organizationId, req.user.organizationId, req.user.role.name, ac);

      if (!permission.granted) {
        throw new PermissionError();
      }

      const organizations = await getOrganizationAndDown(req.user.organizationId);
      res.status(200).json({ organizations });
      break;
    }
    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.ORGANIZATION);

      if (!permission.granted) {
        throw new PermissionError();
      }

      if (body.id) {
        res.status(400).json({ message: `ID Must Be null` });
        break;
      }
      const createOrgData = await createOrganizations(body);
      res.status(200);
      res.json(createOrgData);
      break;
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      throw new MethodNotAllowedError(method);
  }
};

export default withTempestHandlers(organizationApiHandler, findUserByEmail, organizationSchema);
