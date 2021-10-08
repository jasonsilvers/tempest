import { isOrgChildOf } from '../../src/utils/isOrgChildOf';
import { userWithinOrgOrChildOrg } from '../../src/utils/userWithinOrgorChildOrg';
import { mockMethodAndReturn } from '../testutils/mocks/repository';

jest.mock('../../src/utils/isOrgChildOf.ts');

afterEach(() => {
  jest.resetAllMocks();
});

test('should return true if user is within org of monitor', async () => {
  mockMethodAndReturn(isOrgChildOf, true);
  const result = await userWithinOrgOrChildOrg('1', '2');

  expect(result).toBe(true);
});

test('should return false if user is NOT within org of monitor', async () => {
  mockMethodAndReturn(isOrgChildOf, false);
  const result = await userWithinOrgOrChildOrg('1', '2');

  expect(result).toBe(false);
});
