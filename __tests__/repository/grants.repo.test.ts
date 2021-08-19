import prisma from '../setup/mockedPrisma';
import { grants } from '../utils/mocks/fixtures';
import { findGrants } from '../../src/repositories/grantsRepo';

test('should find grants', async () => {
  prisma.grant.findMany.mockImplementation(() => grants);
  const result = await findGrants();
  expect(result).toStrictEqual(grants);
});
