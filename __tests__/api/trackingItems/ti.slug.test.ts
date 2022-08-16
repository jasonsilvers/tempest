import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import trackingItemSlugHandler from '../../../src/pages/api/trackingitems/[...slug]';
import { testNextApi } from '../../testutils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/trackingItemRepo.ts');

const globalUserId = 1;

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('Should not accept GET', async () => {
  const userId = 2;
  mockMethodAndReturn(findUserByEmail, {
    id: userId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });

  const { status } = await testNextApi.get(trackingItemSlugHandler, {
    urlSlug: '6/archive',
  });

  expect(status).toEqual(405);
});

test('should return 400 if url is incorrect', async () => {
  const { status } = await testNextApi.post(trackingItemSlugHandler, {
    body: {},
    urlSlug: '23/doesnotexisst',
  });

  expect(status).toBe(400);
});
