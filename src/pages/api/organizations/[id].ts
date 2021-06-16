import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findOrganizationById } from '../../../repositories/organizationRepo';
import { getAc, permissionDenied, recordNotFound } from '../../../middleware/utils';
import { EResource } from '../../../types/global';
import { getIncludesQueryArray } from '../../../utils/IncludeQuery';
import { Permission } from 'accesscontrol';
import { isOrgChildOf } from '../../../utils/isOrgChildOf';

interface ITempestOrganizationIdApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
    include: string | string[];
  };
}

enum EOrganizationIdIncludes {
  USERS = 'users',
  CHILDREN = 'children',
}

export const organizationIdApiHandler = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse
) => {
  const {
    method,
    query: { id, include },
  } = req;

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();

  const organization = await findOrganizationById(id, {
    withChildren: includesQuery.includes(EOrganizationIdIncludes.CHILDREN),
    withUsers: includesQuery.includes(EOrganizationIdIncludes.USERS),
  });

  if (!organization) {
    return recordNotFound(res);
  }

  switch (method) {
    case 'GET': {
      let permission: Permission;

      if (id !== req.user.organizationId) {
        const isChild = isOrgChildOf(id, req.user.organizationId);
        if (isChild) {
          permission = ac.can(req.user.role.name).readOwn(EResource.ORGANIZATION);
        } else {
          permission = ac.can(req.user.role.name).readAny(EResource.ORGANIZATION);
        }
      } else {
        permission = ac.can(req.user.role.name).readOwn(EResource.ORGANIZATION);
      }

      if (!permission.granted) {
        return permissionDenied(res);
      }

      res.status(200);
      res.json(organization);
      break;
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ messgae: `Method ${method} Not Allowed` });
  }
};

export default withApiAuth(organizationIdApiHandler, findUserByDodId);
