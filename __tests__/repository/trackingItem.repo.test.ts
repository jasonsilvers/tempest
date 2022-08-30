import prisma from '../setup/mockedPrisma';
import {
  createTrackingItem,
  deleteTrackingItem,
  findTrackingItemById,
  getTrackingItems,
  updateTrackingItem,
  getGlobalTrackingItemsAndThoseByOrgId,
  findTrackingByIdIncludeCount,
} from '../../src/repositories/trackingItemRepo';
import { TrackingItem } from '@prisma/client';

const dummyTrackingItem = {
  id: 1,
  description: 'dummy description',
  interval: 365,
  title: 'dummy title',
  status: 'ACTIVE',
  location: '',
  organizationId: 1,
  _count: '2',
} as TrackingItem;
const dummyTrackingItem2 = {
  id: 2,
  description: 'dummy description',
  interval: 365,
  title: 'global dummy title',
  status: 'ACTIVE',
  location: '',
  organizationId: 2,
  _count: '2',
} as TrackingItem;

test('should createTrackingItem', async () => {
  prisma.trackingItem.create.mockImplementationOnce(() => ({ ...dummyTrackingItem, id: 1 }));
  const trackingItem = await createTrackingItem(dummyTrackingItem);
  expect(trackingItem).toEqual({ ...dummyTrackingItem, id: 1 });
});

test('should deleteTrackingItem', async () => {
  prisma.trackingItem.delete.mockImplementationOnce(() => true);
  const result = await deleteTrackingItem(1);
  expect(result).toBe(true);
});

test('should getTrackingItems', async () => {
  prisma.trackingItem.findMany.mockImplementationOnce(() => [{ ...dummyTrackingItem, id: 1 }]);
  const trackingItems = await getTrackingItems();
  expect(trackingItems).toEqual([{ ...dummyTrackingItem, id: 1 }]);
});

test('should findTrackingItemById', async () => {
  prisma.trackingItem.findUnique.mockImplementationOnce(() => [{ ...dummyTrackingItem, id: 1 }]);
  const trackingItems = await findTrackingItemById(1);
  expect(trackingItems).toEqual([{ ...dummyTrackingItem, id: 1 }]);
});

test('should update Tracking Item location', async () => {
  const spy = prisma.trackingItem.update.mockImplementationOnce(() => {
    return { ...dummyTrackingItem, location: 'new location' };
  });
  const updatedTrackingItem = await updateTrackingItem(1, { location: 'new location' });
  expect(updatedTrackingItem).toEqual({ ...dummyTrackingItem, location: 'new location' });
  expect(spy).toBeCalledWith({ where: { id: 1 }, data: { location: 'new location' } });
});
test('should find tracking number including memberTrackingItem count', async () => {
  prisma.trackingItem.findUnique.mockImplementationOnce(() => ({ ...dummyTrackingItem, _count: 2 }));
  const trackingItem = await findTrackingByIdIncludeCount(1);
  expect(trackingItem).toEqual({ ...dummyTrackingItem, _count: 2 });
});
test('should find tracking number including memberTrackingItem count', async () => {
  prisma.trackingItem.findMany.mockImplementationOnce(() => [dummyTrackingItem, dummyTrackingItem2]);
  const trackingItem = await getGlobalTrackingItemsAndThoseByOrgId([1, 2]);
  expect(trackingItem).toEqual([dummyTrackingItem, dummyTrackingItem2]);
});
