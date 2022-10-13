import { Organization } from '@prisma/client';
import { NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { AccessControl, Permission } from 'accesscontrol';
import { NextApiResponse } from 'next';
import { EFuncBaseAction, EResource, ITempestApiMessage } from '../const/enums';
import { getAc } from '../middleware/utils';
import { BadRequestError, NotFoundError, PermissionError } from '../middleware/withErrorHandling';
import { deleteOrganization, findOrganizationById, updateOrganization } from '../repositories/organizationRepo';
import { LoggedInUser } from '../repositories/userRepo';
import { getIncludesQueryArray } from '../utils/includeQuery';
import { isOrgChildOf } from '../utils/isOrgChildOf';

export const usersPermissionOnOrg = async (
  requestingOrg: number,
  usersOrg: number,
  usersRole: string,
  ac: AccessControl,
  action: EFuncBaseAction
) => {
  let permission: Permission;

  const ownAction = `${action}Own`;
  const anyAction = `${action}Any`;

  if (requestingOrg !== usersOrg) {
    const isChild = await isOrgChildOf(requestingOrg, usersOrg);

    //WHY! A role should be able to do any action on an org that is a child of the org they are requesting
    //that means that the role just needs own on the organization not any.
    if (isChild) {
      permission = ac.can(usersRole)[ownAction](EResource.ORGANIZATION);
    } else {
      permission = ac.can(usersRole)[anyAction](EResource.ORGANIZATION);
    }
  } else {
    permission = ac.can(usersRole)[ownAction](EResource.ORGANIZATION);
  }

  return permission;
};

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
  res: NextApiResponse<Organization | ITempestApiMessage>
) => {
  const {
    query: { id, include },
  } = req;

  const includesQuery = getIncludesQueryArray(include);

  const ac = await getAc();
  const organizationIdParam = parseInt(id);

  const organization = await findOrganizationById(organizationIdParam, {
    withChildren: includesQuery.includes(EOrganizationIdIncludes.CHILDREN),
    withUsers: includesQuery.includes(EOrganizationIdIncludes.USERS),
  });

  if (!organization) {
    throw new NotFoundError();
  }

  const permission = await usersPermissionOnOrg(
    organizationIdParam,
    req.user.organizationId,
    req.user.role.name,
    ac,
    EFuncBaseAction.READ
  );

  if (!permission.granted) {
    throw new PermissionError();
  }

  res.status(200);
  res.json(organization);
};

export const deleteOrganizationAction = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse<Organization | ITempestApiMessage>
) => {
  const {
    query: { id },
  } = req;
  const organizationIdParam = parseInt(id);
  const ac = await getAc();

  const permission = await usersPermissionOnOrg(
    organizationIdParam,
    req.user.organizationId,
    req.user.role.name,
    ac,
    EFuncBaseAction.DELETE
  );

  if (!permission.granted) {
    throw new PermissionError();
  }

  const organizationToDelete = await findOrganizationById(organizationIdParam, { withChildren: true, withUsers: true });

  if (!organizationToDelete) {
    throw new NotFoundError();
  }

  if (organizationToDelete?.children?.length > 0) {
    return res.status(409).json({ message: 'Unable to delete an organization with sub organizations' });
  }

  if (organizationToDelete?.users?.length > 0) {
    return res.status(409).json({ message: 'Unable to delete an organization with users associated' });
  }

  await deleteOrganization(organizationIdParam);

  res.status(200).json({ message: 'ok' });
};

export const putOrganizationAction = async (
  req: ITempestOrganizationIdApiRequest<LoggedInUser>,
  res: NextApiResponse<Organization | ITempestApiMessage>
) => {
  const {
    query: { id },
    body,
  } = req;

  const queryId = parseInt(id);
  const organizationId = parseInt(body.id);

  if (queryId !== organizationId) {
    throw new BadRequestError();
  }

  const ac = await getAc();

  const permission = await usersPermissionOnOrg(
    organizationId,
    req.user.organizationId,
    req.user.role.name,
    ac,
    EFuncBaseAction.UPDATE
  );

  if (!permission.granted) {
    throw new PermissionError();
  }

  const filteredData = permission.filter(body);

  const updatedOrganization = await updateOrganization(organizationId, filteredData);

  res.status(200).json(updatedOrganization);
};
