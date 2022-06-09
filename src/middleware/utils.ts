import { Grant } from '@prisma/client';
import { AccessControl } from 'accesscontrol';
import { EAction } from '../const/enums';
import { findGrants } from '../repositories/grantsRepo';

export function removeInvalidGrantActions(grants: Grant[]) {
  return grants.filter((grant) => Object.values(EAction).some((action) => action === grant.action));
}

export async function getAc() {
  const grants = await findGrants();
  let ac: AccessControl;

  if (grants) {
    try {
      ac = new AccessControl(grants);
    } catch (error) {
      const cleanedGrants = removeInvalidGrantActions(grants);
      ac = new AccessControl(cleanedGrants);
    }

    return ac;
  }

  return null;
}
