import { NextApiResponse } from 'next';
import { withApiAuth, NextApiRequestWithAuthorization } from '@tron/nextjs-auth-p1';
import { User } from '@prisma/client';
import { findUserByDodId } from '../../../repositories/userRepo';
import { createOrganizations, findOrganizations } from '../../../repositories/organizationRepo';

export const organizationApiHandler = async (req: NextApiRequestWithAuthorization<User>, res: NextApiResponse) => {
  const { body, method } = req;
  switch (method) {
    case 'GET': {
      const findOrgData = await findOrganizations();
      res.status(200);
      res.json(findOrgData);
      break;
    }
    case 'POST': {
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
