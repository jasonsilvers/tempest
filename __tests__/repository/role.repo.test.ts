import prisma from '../setup/mockedPrisma';
import { getRoleByName, getRoles } from '../../src/repositories/roleRepo';
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
