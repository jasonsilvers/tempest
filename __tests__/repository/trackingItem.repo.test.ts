import prisma from '../setup/mockedPrisma';
import {
  createTrackingItem,
  deleteTrackingItem,
  findTrackingItemById,
  getTrackingItems,
  updateTrackingItem,
} from '../../src/repositories/trackingItemRepo';
import { TrackingItem } from '@prisma/client';

const dummyTrackingItem = {
  id: 1,
  description: 'dummy description',
  interval: 365,
  title: 'dummy title',
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
