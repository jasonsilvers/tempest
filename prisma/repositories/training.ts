import { TrackingItem } from '@prisma/client';
import prisma from '../prisma';


export const getTrackingItems = async () => {
  const trackingItems = await prisma.trackingItem.findMany();
  return trackingItems??[]
};

/**
 * Get trackingItem method to query the PSQL db though the prisma client
 * for use with the @tron-p1-auth library
 *
 * @param query id
 * @returns MemberTrackingRecord
 */
export const findTrackingItemById = async (query: number) => {
  return await prisma.trackingItem.findUnique({
    where: {
      id: query,
    },
  });
};

/**
 * Get trackingItem method to query the PSQL db though the prisma client
 *
 * @param queryString db by title
 * @returns MemberTrackingRecord
 */
export const findTrackingItembyTitle = async (queryString: string) => {
  return await prisma.trackingItem.findMany({
    where: {
      title: queryString,
    },

  });
};

/**
 * Post trackingItem method to create the PSQL db though the prisma client
 *
 * @param trackingItem
 * @returns TrackingItem
 */
export const createTrackingItem = async (trackingItem: TrackingItem) => {
  return await prisma.trackingItem.create({
    data: trackingItem,
    })
  };

/**
 * Put TrackingItem method to update the PSQL db though the prisma client
 *
 * @param trackingItem
 * @returns TrackingItem
 */
export const updateTrackingItem = async (trackingItem: TrackingItem) => {
  return prisma.trackingItem.update({
    where: { id: trackingItem.id },
    data: trackingItem,
  });
};
