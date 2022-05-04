import { Organization } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { Permission } from 'accesscontrol';
import { NextApiResponse } from 'next';
import { EResource, ITempestApiError } from '../const/enums';
import { getAc } from '../middleware/utils';
import { NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import { deleteOrganization, findOrganizationById, updateOrganization } from '../repositories/organizationRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { getIncludesQueryArray } from '../utils/includeQuery';
import { isOrgChildOf } from '../utils/isOrgChildOf';

export interface ITempestOrganizationIdApiRequest<T, B = unknown> extends NextApiRequestWithAuthorization<T, B> {
  query: {
    id: string;
    include: string | string[];
  };
}

enum EOrganizationIdIncludes {
  USERS = 'users',
  CHILDREN = 'children',
}

export const getOrganizationAction = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse<Organization | ITempestApiError>
) => {
  const {
    query: { id, include },
  } = req;

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();
  const bodyOrgId = parseInt(id);

  const organization = await findOrganizationById(bodyOrgId, {
    withChildren: includesQuery.includes(EOrganizationIdIncludes.CHILDREN),
    withUsers: includesQuery.includes(EOrganizationIdIncludes.USERS),
  });

  if (!organization) {
    throw new NotFoundError();
  }

  let permission: Permission;

  if (bodyOrgId !== req.user.organizationId) {
    const isChild = isOrgChildOf(bodyOrgId, req.user.organizationId);
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

export const deleteOrganizationAction = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse<Organization | ITempestApiError>
) => {
  const { query, user } = req;
  const organizationId = query.id;
  const organizationIdParam = parseInt(organizationId);
  const ac = await getAc();

  const permission = ac.can(user.role.name).deleteAny(EResource.ORGANIZATION);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const organizationToDelete = await findOrganizationById(organizationIdParam, { withChildren: true, withUsers: true });

  if (!organizationToDelete) {
    throw new NotFoundError();
  }

  if (organizationToDelete.children.length > 0) {
    return res.status(409).json({ message: 'Unable to delete an organization with sub organizations' });
  }

  if (organizationToDelete.users.length > 0) {
    return res.status(409).json({ message: 'Unable to delete an organization with users associated' });
  }

  await deleteOrganization(organizationIdParam);

  res.status(200).json({ message: 'ok' });
};

export const putOrganizationAction = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse<Organization | ITempestApiError>
) => {
  const { query, body, user } = req;
  const organizationId = query.id;
  const organizationIdParam = parseInt(organizationId);
  const ac = await getAc();

  const permission = ac.can(user.role.name).updateAny(EResource.ORGANIZATION);

  if (!permission.granted) {
    throw new PermissionError();
  }

  const filteredData = permission.filter(body);

  const updatedOrganization = await updateOrganization(organizationIdParam, filteredData);

  res.status(200).json(updatedOrganization);
};
