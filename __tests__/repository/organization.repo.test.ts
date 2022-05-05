import prisma from '../setup/mockedPrisma';
import {
  createOrganizations,
  deleteOrganization,
  findOrganizationById,
  findOrganizations,
  getOrganizationTree,
  updateOrganization,
} from '../../src/repositories/organizationRepo';

const testOrganizations = [
  {
    id: 1,
    name: 'testOrganization1',
    shortName: 'testorg1',
  },
  {
    id: 2,
    name: 'testOrganization2',
    shortName: 'testorg2',
  },
];

test('Repo Organization for Prisma findMany() Happy Case', async () => {
  prisma.organization.findMany.mockImplementationOnce(() => testOrganizations);
  const organizationResults = await findOrganizations();
  expect(organizationResults).toStrictEqual(testOrganizations);
});

test('Repo Organization for Prisma create() Happy Case', async () => {
  const newObj = {
    id: '3',
    name: 'Org',
  };
  const spy = prisma.organization.create.mockImplementationOnce(() => newObj);
  const organizationCreate = await createOrganizations({ name: 'Org', shortName: 'org', parentId: 2, id: 23432 });
  expect(spy).toBeCalledTimes(1);
  expect(organizationCreate).toEqual(newObj);
});

test('should findOrganizationById', async () => {
  const spy = prisma.organization.findUnique.mockImplementationOnce(() => testOrganizations[0]);
  const organization = await findOrganizationById(1);
  expect(organization).toEqual(testOrganizations[0]);
  expect(spy).toBeCalledTimes(1);
});

test('should return organization and all child organizations', async () => {
  const spy = prisma.$queryRaw.mockImplementationOnce(() => testOrganizations);
  const organizations = await getOrganizationTree(2);
  expect(organizations).toEqual(testOrganizations);
  expect(spy).toBeCalledTimes(1);
});

test('should delete organization', async () => {
  const spy = prisma.organization.delete.mockImplementationOnce(() => testOrganizations[0]);
  const organization = await deleteOrganization(1);
  expect(organization).toEqual(testOrganizations[0]);
  expect(spy).toBeCalledWith({ where: { id: 1 } });
});

test('should update organization with correct date', async () => {
  const spy = prisma.organization.update.mockImplementationOnce(() => {
    return { ...testOrganizations[0], name: 'updatedName' };
  });

  const updatedOrganization = await updateOrganization(1, { shortName: 'updatedName' });

  expect(updatedOrganization).toEqual({ ...testOrganizations[0], name: 'updatedName' });
  expect(spy).toBeCalledWith({ where: { id: 1 }, data: { shortName: 'updatedName' } });
});
