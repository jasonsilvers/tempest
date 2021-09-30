import trackingItemQueryHandler from '../../../src/pages/api/trackingitems/[id]';
import { testNextApi } from '../../testutils/NextAPIUtils';
import { grants } from '../../testutils/mocks/fixtures';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { mockMethodAndReturn } from '../../testutils/mocks/repository';
import { deleteTrackingItem } from '../../../src/repositories/trackingItemRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo');
jest.mock('../../../src/repositories/trackingItemRepo.ts');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'admin' },
  });
  mockMethodAndReturn(findGrants, grants);
});

const item = {
  id: 2,
  title: 'Supervisor Safety Training',
  description: 'One time training for new supervisors',
  interval: 0,
};
test('should return correct status for delete', async () => {
  // prisma returns the object deleted

  mockMethodAndReturn(deleteTrackingItem, item);

  const { data, status } = await testNextApi.delete(trackingItemQueryHandler, { urlId: '/1' });

  expect(status).toBe(200);
  expect(deleteTrackingItem).toBeCalledWith(1);
  expect(data).toEqual(item);
});

test('should return 400 if bad uri', async () => {
  const { status } = await testNextApi.delete(trackingItemQueryHandler, { urlId: '/string' });

  expect(status).toBe(400);
  expect(deleteTrackingItem).not.toBeCalled();
});

// should do nothing for method get
test('should return correct status for get', async () => {
  const { status } = await testNextApi.get(trackingItemQueryHandler);

  expect(status).toBe(405);
});

test('should return 401 if not authorized', async () => {
  const { status } = await testNextApi.delete(trackingItemQueryHandler, { urlId: '/1', withJwt: false });

  expect(status).toBe(401);
});
test('should return 403 if incorrect permission - DELETE', async () => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  const { status } = await testNextApi.delete(trackingItemQueryHandler, { urlId: '/1' });

  expect(status).toBe(403);
});
