import prisma from '../prisma/prisma';
import { Resource } from '.prisma/client';

export const findResources = () => {
  return prisma.resource.findMany({ include: { _count: { select: { grant: true } } } });
};

export const createResource = (newResource: Omit<Resource, 'id'>) => {
  return prisma.resource.create({
    data: newResource,
  });
};

export const deleteResource = (resourceId: number) => {
  return prisma.resource.delete({ where: { id: resourceId } });
};
