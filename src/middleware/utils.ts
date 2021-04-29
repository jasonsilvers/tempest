import { AccessControl } from 'accesscontrol';
import prisma from '../prisma/prisma';
import { findGrants } from '../repositories/grantsRepo';

export async function getAc() {
  const grants = await findGrants();

  if (grants) {
    return new AccessControl(grants);
  }

  return null;
}
