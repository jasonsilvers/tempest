import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByEmail } from '../../../src/repositories/userRepo';
import { grants } from '../../testutils/mocks/fixtures';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { testNextApi } from '../../testutils/NextAPIUtils';
import ppeItemsIdHandler from '../../../src/pages/api/tempest/ppeitems/[id]';
import { EAction, EResource, ERole } from '../../../src/const/enums';
import { deletePPEItemById, findPPEItemById, updatePPEItemById } from '../../../src/repositories/ppeItemsRepo';

jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/ppeItemsRepo.ts');
jest.mock('../../../src/repositories/userRepo.ts');

const testPPEItem = {
  id: 1,
  name: 'Steel Toe',
  provided: true,
  inUse: false,
  userId: 5,
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
      action: EAction.UPDATE_ANY,
      attributes: '*',
      resource: EResource.PPE_ITEM,
      role: ERole.ADMIN,
    },
    {
      action: EAction.DELETE_ANY,
      attributes: '*',
      resource: EResource.PPE_ITEM,
      role: ERole.ADMIN,
    },
  ]);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if no JWT', async () => {
  const { status } = await testNextApi.put(ppeItemsIdHandler, { body: {}, withJwt: false });

  expect(status).toBe(401);
});

test('put - should return bad request', async () => {
  const { status } = await testNextApi.put(ppeItemsIdHandler, { body: {} });
  expect(status).toBe(400);
});

test('put - should update ppe item and return it', async () => {
  const updatedPPEItem = { ...testPPEItem, name: 'test' };
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  const spy = mockMethodAndReturn(updatePPEItemById, updatedPPEItem);
  const { status, data } = await testNextApi.put(ppeItemsIdHandler, { body: { ...updatedPPEItem }, urlId: 5 });

  expect(spy).toBeCalledWith(updatedPPEItem, 5);
  expect(status).toBe(200);

  expect(data).toStrictEqual(updatedPPEItem);
});

test('put - admin should update ppe item and return it', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 4,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: '2',
  });
  const updatedPPEItem = { ...testPPEItem, name: 'test' };
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  const spy = mockMethodAndReturn(updatePPEItemById, updatedPPEItem);

  const { status, data } = await testNextApi.put(ppeItemsIdHandler, { body: { ...updatedPPEItem }, urlId: 5 });
  expect(spy).toBeCalledWith(updatedPPEItem, 5);

  expect(status).toBe(200);

  expect(data).toStrictEqual(updatedPPEItem);
});

test('put - should return 403 ', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 4,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
    organizationId: '2',
  });
  const updatedPPEItem = { ...testPPEItem, name: 'test' };
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  const spy = mockMethodAndReturn(updatePPEItemById, updatedPPEItem);

  const { status } = await testNextApi.put(ppeItemsIdHandler, { body: { ...updatedPPEItem }, urlId: 5 });
  expect(spy).not.toBeCalled();

  expect(status).toBe(403);
});

test('put - should return not found', async () => {
  const updatedPPEItem = { ...testPPEItem, name: 'test' };
  mockMethodAndReturn(findPPEItemById, null);

  const { status } = await testNextApi.put(ppeItemsIdHandler, { body: { ...updatedPPEItem }, urlId: 5 });

  expect(status).toBe(404);
});

test('delete - should return bad request', async () => {
  const { status } = await testNextApi.delete(ppeItemsIdHandler);
  expect(status).toBe(400);
});

test('delete - should remove ppe item', async () => {
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  mockMethodAndReturn(deletePPEItemById, testPPEItem);

  const { status, data } = await testNextApi.delete(ppeItemsIdHandler, { urlId: 5 });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ message: 'ok' });
});

test('delete - should return not found', async () => {
  mockMethodAndReturn(findPPEItemById, null);
  const spy = mockMethodAndReturn(deletePPEItemById, testPPEItem);

  const { status } = await testNextApi.delete(ppeItemsIdHandler, { urlId: 5 });
  expect(spy).not.toBeCalled();

  expect(status).toBe(404);
});

test('delete - admin should delete any ppe item', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 4,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
    organizationId: '2',
  });
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  mockMethodAndReturn(deletePPEItemById, testPPEItem);

  const { status, data } = await testNextApi.delete(ppeItemsIdHandler, { urlId: 5 });

  expect(status).toBe(200);

  expect(data).toStrictEqual({ message: 'ok' });
});

test('delete - return 403', async () => {
  mockMethodAndReturn(findUserByEmail, {
    id: 4,
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
    organizationId: '2',
  });
  mockMethodAndReturn(findPPEItemById, testPPEItem);
  const spy = mockMethodAndReturn(deletePPEItemById, testPPEItem);

  const { status } = await testNextApi.delete(ppeItemsIdHandler, { urlId: 5 });
  expect(spy).not.toBeCalled();

  expect(status).toBe(403);
});

test('should not allow get', async () => {
  const { status } = await testNextApi.get(ppeItemsIdHandler);

  expect(status).toBe(405);
});
