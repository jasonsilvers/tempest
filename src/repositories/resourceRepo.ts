export const findResources = () => {
  return prisma.resource.findMany();
};

export const createResource = (name: string) => {
  return prisma.resource.create({ data: { name } });
};
