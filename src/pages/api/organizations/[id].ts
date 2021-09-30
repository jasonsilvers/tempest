import { NextApiResponse } from 'next';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, LoggedInUser } from '../../../repositories/userRepo';
import { findOrganizationById } from '../../../repositories/organizationRepo';
import { getAc } from '../../../middleware/utils';
import { EResource } from '../../../const/enums';
import { getIncludesQueryArray } from '../../../utils/includeQuery';
import { Permission } from 'accesscontrol';
import { isOrgChildOf } from '../../../utils/isOrgChildOf';
import { MethodNotAllowedError, NotFoundError, PermissionError } from '../../../middleware/withErrorHandling';
import { withTempestHandlers } from '../../../middleware/withTempestHandlers';

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

  if (method !== 'GET') {
    throw new MethodNotAllowedError(method);
  }

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();

  const organization = await findOrganizationById(id, {
    withChildren: includesQuery.includes(EOrganizationIdIncludes.CHILDREN),
    withUsers: includesQuery.includes(EOrganizationIdIncludes.USERS),
  });

  if (!organization) {
    throw new NotFoundError();
  }

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
    throw new PermissionError();
  }

  res.status(200);
  res.json(organization);
};

export default withTempestHandlers(organizationIdApiHandler, findUserByDodId);
