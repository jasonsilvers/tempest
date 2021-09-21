import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { createOrganizations, findOrganizations } from '../../../repositories/organizationRepo';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource } from '../../../types/global';
import { MethodNotAllowedError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';

const organizationPostSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    parentId: Joi.string().optional().allow(null),
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
      const organizations = await findOrganizations();
      res.status(200).json({ organizations });
      break;
    }
    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.ORGANIZATION);

      if (!permission.granted) {
        return permissionDenied(res);
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

export default withTempestHandlers(organizationApiHandler, findUserByDodId, organizationSchema);
