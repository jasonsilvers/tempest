import { Organization } from '.prisma/client';
import prisma from '../prisma/prisma';

export async function findOrganizations() {
  return await prisma.organization.findMany();
}

export async function createOrganizations(organization: Organization) {
  return await prisma.organization.create({
    data: organization,
  });
}
