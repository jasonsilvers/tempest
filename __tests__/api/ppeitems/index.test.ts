import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { createPPEItemForUser, findPPEItemsByUserId } from '../../../src/repositories/ppeItemsRepo';
import ppeItemsHandler from '../../../src/pages/api/tempest/ppeitems';
import { EAction, EResource, ERole } from '../../../src/const/enums';

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

  mockMethodAndReturn(findGrants, [
    ...grants,
    {
      action: EAction.CREATE_ANY,
      attributes: '*',
      resource: EResource.PPE_ITEM,
      role: ERole.ADMIN,
    },
  ]);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('member should be able to get their ppe items', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status, data } = await testNextApi.get(ppeItemsHandler, { urlSlug: '?userId=5' });

  expect(status).toBe(200);
  expect(data).toStrictEqual({ ppeItems: [testPPEItem] });
});

test('monitor should be able to get their ppe items', async () => {
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

test('post - should return 403 if incorreect permissoin', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 3,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
    organizationId: '2',
  });
  const testNewPPEItem = {
    name: 'Steel Toe',
    provided: true,
    providedDetails: 'random details',
    inUse: false,
    inUseDetails: 'not in use',
    userId: 5,
  };
  mockMethodAndReturn(createPPEItemForUser, testPPEItem);
  const { status } = await testNextApi.post(ppeItemsHandler, {
    body: { ...testNewPPEItem },
  });

  expect(status).toBe(403);
});

test('member should be able to add ppe item', async () => {
  const testNewPPEItem = {
    name: 'Steel Toe',
    provided: true,
    providedDetails: 'random details',
    inUse: false,
    inUseDetails: 'not in use',
    userId: 5,
  };
  mockMethodAndReturn(createPPEItemForUser, testPPEItem);
  const { status, data } = await testNextApi.post(ppeItemsHandler, {
    body: { ...testNewPPEItem },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(testPPEItem);
});

test('admin should be able to add ppe item for any user', async () => {
  const testNewPPEItem = {
    name: 'Steel Toe',
    provided: true,
    providedDetails: 'random details',
    inUse: false,
    inUseDetails: 'not in use',
    userId: 5,
  };

  mockMethodAndReturn(findUserByEmail, {
    id: 3,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: '2',
  });
  mockMethodAndReturn(createPPEItemForUser, testPPEItem);
  const { status, data } = await testNextApi.post(ppeItemsHandler, {
    body: { ...testNewPPEItem },
  });

  expect(status).toBe(200);
  expect(data).toStrictEqual(testPPEItem);
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

test('should not allow delete', async () => {
  mockMethodAndReturn(findPPEItemsByUserId, [testPPEItem]);
  const { status } = await testNextApi.delete(ppeItemsHandler);

  expect(status).toBe(405);
});
