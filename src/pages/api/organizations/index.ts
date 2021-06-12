import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { findUserByDodId, UserWithRole } from '../../../repositories/userRepo';
import { createOrganizations, findOrganizations } from '../../../repositories/organizationRepo';
import { getAc, permissionDenied } from '../../../middleware/utils';
import { EResource } from '../../../types/global';

const organizationApiHandler = async (req: NextApiRequestWithAuthorization<UserWithRole>, res: NextApiResponse) => {
  const { body, method } = req;

  const ac = await getAc();

  switch (method) {
    case 'GET': {
      const permission = ac.can(req.user.role.name).readAny(EResource.ORGANIZATION);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      const organizations = await findOrganizations();
      res.status(200).json(organizations);
      break;
    }
    case 'POST': {
      const permission = ac.can(req.user.role.name).createAny(EResource.ORGANIZATION);

      if (!permission.granted) {
        return permissionDenied(res);
      }

      if (body.id) {
        res.status(400).end(`ID Must Be null`);
        break;
      }
      const createOrgData = await createOrganizations(body);
      res.status(200);
      res.json(createOrgData);
      break;
    }
    // If this end point is hit with anything other than GET or PUT return a 405 error
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withApiAuth(organizationApiHandler, findUserByDodId);
