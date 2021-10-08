import { findUserById } from '../../src/repositories/userRepo';
import { userHasPermissionWithinOrg } from '../../src/utils/userHasPermissionWithinOrg';
import { userWithinOrgOrChildOrg } from '../../src/utils/userWithinOrgorChildOrg';
import { mockMethodAndReturn } from '../testutils/mocks/repository';

jest.mock('../../src/utils/userWithinOrgorChildOrg.ts');
jest.mock('../../src/repositories/userRepo.ts');

test('should return true if user has permission to access records for member in org', async () => {
  const monitor = {
    id: '123',
    orgId: '1',
  };

  const member = {
    id: '123',
    orgId: '1',
  };

  const result = await userHasPermissionWithinOrg(monitor, member);

  expect(result).toBe(true);
});

test('should return false if user does not have permission to access records for member in org', async () => {
  const monitor = {
    id: '321',
    orgId: '1',
  };

  const member = {
    id: '123',
    orgId: '1',
  };

  mockMethodAndReturn(userWithinOrgOrChildOrg, false);

  const result = await userHasPermissionWithinOrg(monitor, member);

  expect(result).toBe(false);
});

test('should return true if user does have permission to access records for member in org', async () => {
  const monitor = {
    id: '321',
    orgId: '1',
  };

  const member = {
    id: '123',
    orgId: '1',
  };

  mockMethodAndReturn(userWithinOrgOrChildOrg, true);

  const result = await userHasPermissionWithinOrg(monitor, member);

  expect(result).toBe(true);
});

test('should get users org from DB if organization is null and return', async () => {
  const monitor = {
    id: '321',
    orgId: '1',
  };

  const member = {
    id: '123',
    orgId: null,
  };

  mockMethodAndReturn(userWithinOrgOrChildOrg, false);
  mockMethodAndReturn(findUserById, { organizationId: '1' });

  const result = await userHasPermissionWithinOrg(monitor, member);
  expect(findUserById).toBeCalled();

  expect(result).toBe(false);
});
