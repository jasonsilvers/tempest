import { TrackingItem } from '@prisma/client';
import prisma from '../prisma/prisma';

export async function getTrackingItems() {
  return prisma.trackingItem.findMany({ orderBy: { title: 'asc' } });
}

export async function getGlobalTrackingItemsAndThoseByOrgId(orgIds: number[]) {
  return prisma.trackingItem.findMany({
    orderBy: { title: 'asc' },
    where: { OR: [{ organizationId: { in: orgIds } }, { organizationId: null }] },
  });
}

export async function findTrackingItemById(id: number) {
  return prisma.trackingItem.findUnique({ where: { id } });
}

export async function createTrackingItem(newTrackingItem: TrackingItem) {
  return prisma.trackingItem.create({
    data: newTrackingItem,
  });
}
export async function updateTrackingItem(trackingItemId: number, trackingItem: Partial<TrackingItem>) {
  return prisma.trackingItem.update({ where: { id: trackingItemId }, data: trackingItem });
}

export async function deleteTrackingItem(trackingItemId: number) {
  return prisma.trackingItem.delete({
    where: {
      id: trackingItemId,
    },
  });
}
