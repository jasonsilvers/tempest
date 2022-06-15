import prisma from '../setup/mockedPrisma';
import { getRoleByName, getRoles, createRole, deleteRole } from '../../src/repositories/roleRepo';
import { Role } from '@prisma/client';

const dummyRole = {
  id: 1,
  name: 'dummy',
} as Role;

test('should getRoleByName', async () => {
  prisma.role.findUnique = jest.fn(() => dummyRole);
  const result = await getRoleByName('dummy');
  expect(result).toStrictEqual(dummyRole);
});

test('should getRoles', async () => {
  prisma.role.findMany = jest.fn(() => [dummyRole]);
  const result = await getRoles();
  expect(result).toStrictEqual([dummyRole]);
});

test('should create role', async () => {
  const spy = prisma.role.create.mockImplementation(() => dummyRole);
  const createNewRole = await createRole({ name: 'dummy' });
  expect(spy).toBeCalledTimes(1);
  expect(createNewRole).toStrictEqual(dummyRole);
});

test('should delete a role', async () => {
  const spy = prisma.role.delete.mockImplementation(() => dummyRole);
  const role = await deleteRole(1);
  expect(spy).toBeCalledWith({ where: { id: 1 } });
  expect(role).toBe(dummyRole);
});
