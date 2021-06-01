import { AccessControl } from 'accesscontrol';
import { NextApiResponse } from 'next';
import { findGrants } from '../repositories/grantsRepo';

export async function getAc() {
  const grants = await findGrants();

  if (grants) {
    return new AccessControl(grants);
  }

  return null;
}

export function permissionDenied(res: NextApiResponse) {
  return res.status(403).json({ message: 'You do not have the appropriate permissions' });
}

export function recordNotFound(res: NextApiResponse) {
  return res.status(404).json({ message: 'Record Not Found' });
}

export function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ message: 'Unauthorized' });
}
