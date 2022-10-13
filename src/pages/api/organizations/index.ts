import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByEmail, LoggedInUser } from '../../../repositories/userRepo';
import { createOrganizations, findOrganizations, getOrganizationAndDown } from '../../../repositories/organizationRepo';
import { getAc } from '../../../middleware/utils';
import { EFuncBaseAction, EOrganizationsIncludes } from '../../../const/enums';
import { MethodNotAllowedError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';
import Joi from 'joi';
import { usersPermissionOnOrg } from '../../../controllers/organizationController';
import { Organization } from '@prisma/client';
import { getIncludesQueryArray } from '../../../utils/includeQuery';

export interface ITempestOrganizationsApiRequest<T> extends NextApiRequestWithAuthorization<T> {
  query: {
    include: EOrganizationsIncludes | EOrganizationsIncludes[];
    [key: string]: string | string[];
  };
  body: Organization;
}

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

const organizationApiHandler = async (req: ITempestOrganizationsApiRequest<LoggedInUser>, res: NextApiResponse) => {
  const {
    body,
    method,
    query: { include },
  } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = await usersPermissionOnOrg(
        req.user.organizationId,
        req.user.organizationId,
        req.user.role.name,
        ac,
        EFuncBaseAction.READ
      );

      if (!permission.granted) {
        throw new PermissionError();
      }

      let organizations: Organization[];
      const includesQuery = getIncludesQueryArray(include);

      if (includesQuery.includes(EOrganizationsIncludes.ALL)) {
        organizations = await findOrganizations();
      } else {
        organizations = await getOrganizationAndDown(req.user.organizationId);
      }

      res.status(200).json({ organizations });
      break;
    }
    case 'POST': {
      const permission = await usersPermissionOnOrg(
        req.user.organizationId,
        req.user.organizationId,
        req.user.role.name,
        ac,
        EFuncBaseAction.CREATE
      );

      if (!permission.granted) {
        throw new PermissionError();
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
