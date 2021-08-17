import { TrackingItem } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function getTrackingItems() {
  return prisma.trackingItem.findMany();
}

export async function createTrackingItem(newTrackingItem: TrackingItem) {
  return prisma.trackingItem.create({
    data: newTrackingItem,
  });
}

export async function deleteTrackingItem(trackingItemId: number) {
  return prisma.trackingItem.delete({
    where: {
      id: trackingItemId,
    },
  });
}
