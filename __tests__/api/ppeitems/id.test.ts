import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import ppeItemsIdHandler from '../../../src/pages/api/ppeitems/[id]';

jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/ppeItemsRepo.ts');
jest.mock('../../../src/repositories/userRepo.ts');

beforeEach(() => {
  mockMethodAndReturn(findUserByEmail, {
    id: 5,
    firstName: 'joe',
    role: { id: '22', name: 'member' },
    organizationId: '2',
  });

  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('get - should return 401 if no JWT', async () => {
  const { status } = await testNextApi.put(ppeItemsIdHandler, { body: {}, withJwt: false });

  expect(status).toBe(401);
});
