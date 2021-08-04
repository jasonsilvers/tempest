import prisma from '../../setup/mockedPrisma';
import trackingItemQueryHandler from '../../../src/pages/api/trackingitems/[id]';
import { testNextApi } from '../../utils/NextAPIUtils';
import {} from '../../utils/mocks/fixtures';

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
  const { data, status } = await testNextApi.get(trackingItemQueryHandler);

  expect(status).toBe(405);

  expect(data).toStrictEqual({ message: 'Method GET Not Allowed' });
});
