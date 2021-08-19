import prisma from '../setup/mockedPrisma';
import { createTrackingItem, deleteTrackingItem, getTrackingItems } from '../../src/repositories/trackingItemRepo';
import { TrackingItem } from '@prisma/client';

const dummyTrackingItem = {
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
