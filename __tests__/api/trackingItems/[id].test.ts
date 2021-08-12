import prisma from '../../setup/mockedPrisma';
import trackingItemQueryHandler from '../../../src/pages/api/trackingitems/[id]';
import { testNextApi } from '../../utils/NextAPIUtils';
import { grants } from '../../utils/mocks/fixtures';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { mockMethodAndReturn } from '../../utils/mocks/repository';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/grantsRepo');

const globalUserId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: globalUserId,
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
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
  prisma.trackingItem.delete.mockImplementationOnce(() => item);
  const { data, status } = await testNextApi.delete(trackingItemQueryHandler);

  expect(status).toBe(200);
  expect(data).toEqual(item);
});

// should do nothing for method get
test('should return correct status for get', async () => {
  const { status } = await testNextApi.get(trackingItemQueryHandler);

  expect(status).toBe(405);
});
