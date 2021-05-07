import { AccessControl } from 'accesscontrol';
import { findGrants } from '../repositories/grantsRepo';

export async function getAc() {
  const grants = await findGrants();

  if (grants) {
    return new AccessControl(grants);
  }

  return null;
}
