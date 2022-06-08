import prisma from '../setup/mockedPrisma';
import { grants } from '../testutils/mocks/fixtures';
import { createGrant, deleteGrant, findGrants, updateGrant } from '../../src/repositories/grantsRepo';
import { EAction, EResource, ERole } from '../../src/const/enums';

test('should find grants', async () => {
  prisma.grant.findMany.mockImplementation(() => grants);
  const result = await findGrants();
  expect(result).toStrictEqual(grants);
});

test('should create grant', async () => {
  prisma.grant.create.mockImplementation(() => grants[0]);
  const result = await createGrant(grants[0]);
  expect(result).toStrictEqual(grants[0]);
});

test('should delete grant', async () => {
  prisma.grant.delete.mockImplementation(() => grants[0]);
  const result = await deleteGrant(1);
  expect(result).toStrictEqual(grants[0]);
});

test('should update grants', async () => {
  prisma.grant.update.mockImplementation(() => grants[0]);

  const result = await updateGrant(1, {
    role: ERole.ADMIN,
    resource: EResource.ADMIN_PAGE,
    attributes: '*',
    action: EAction.CREATE_ANY,
  });

  expect(result).toStrictEqual(grants[0]);
});
