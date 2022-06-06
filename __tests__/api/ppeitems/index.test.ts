import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { findPPEItemsByUserId } from '../../../src/repositories/ppeItemsRepo';
import ppeItemsHandler from '../../../src/pages/api/ppeitems';

jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/ppeItemsRepo.ts');
jest.mock('../../../src/repositories/userRepo.ts');

const testPPEItem = {
  id: 1,
  name: 'Steel Toe',
  provided: true,
  providedDetails: 'random details',
  inUse: false,
  inUseDetails: 'not in use',
};

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

test('member should be able to get all ppe items', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status, data } = await testNextApi.get(ppeItemsHandler, { urlSlug: '?userId=5' });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ppeItems: [testPPEItem] });
});

test('monitor should be able to get all ppe items', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 5,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
    organizationId: '2',
  });
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status, data } = await testNextApi.get(ppeItemsHandler, { urlSlug: '?userId=5' });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ppeItems: [testPPEItem] });
});

test('member or monitor should not be able to get another member/monitors ppeItems', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status } = await testNextApi.get(ppeItemsHandler, { urlSlug: '?userId=3' });

  expect(status).toBe(403);
});

test('get should always include userId in query', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status } = await testNextApi.get(ppeItemsHandler);

  expect(status).toBe(400);
});

test('get - should return 401 if no JWT', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status } = await testNextApi.get(ppeItemsHandler, { withJwt: false });

  expect(status).toBe(401);
});
