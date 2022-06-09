import prisma from '../setup/mockedPrisma';
import { findResources, createResource, deleteResource } from '../../src/repositories/resourceRepo';

const testResource = [
  { id: 1, name: 'testResource1' },
  { id: 2, name: 'testResource2' },
];

test('shoud find resources', async () => {
  prisma.resource.findMany.mockImplementation(() => testResource);
  const result = await findResources();
  expect(result).toStrictEqual(testResource);
});

test('should create new resource', async () => {
  const newObj = {
    id: 3,
    name: 'testResource3',
  };
  const spy = prisma.resource.create.mockImplementation(() => newObj);
  const createdResourse = await createResource({ name: 'testResource3' });
  expect(spy).toBeCalledTimes(1);
  expect(createdResourse).toEqual(newObj);
});

test('should delete a resource', async () => {
  const spy = prisma.resource.delete.mockImplementationOnce(() => testResource[0]);
  const resource = await deleteResource(1);
  expect(resource).toEqual(testResource[0]);
  expect(spy).toBeCalledWith({ where: { id: 1 } });
});
