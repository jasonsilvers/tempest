import prisma from '../setup/mockedPrisma';
import { createOrganizations, findOrganizations } from '../../src/repositories/organizationRepo';

const testOrganizations = [
  {
    id: '1',
    name: 'testOrg1',
  },
  {
    id: '2',
    name: 'testOrg2',
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
  const organizationCreate = await createOrganizations({ name: 'Org', parentId: '2', id: '23432' });
  expect(spy).toBeCalledTimes(1);
  expect(organizationCreate).toEqual(newObj);
});
