import prisma from '../setup/mockedPrisma';
import {
  createPPEItemForUser,
  deletePPEItemById,
  findPPEItemById,
  findPPEItemsByUserId,
  updatePPEItemById,
} from '../../src/repositories/ppeItemsRepo';

const ppeItem = {
  id: 1,
  name: 'tet ppe item',
  provided: false,
  providedDetails: 'item provided details',
  inUse: false,
  inUseDetails: 'item in use details',
  userId: 2,
};

test('should find ppe items for user', async () => {
  const spy = prisma.personalProtectionEquipmentItem.findMany.mockImplementation(() => [ppeItem]);
  const result = await findPPEItemsByUserId(2);

  expect(spy).toBeCalledWith({ where: { userId: 2 } });

  expect(result).toStrictEqual([ppeItem]);
});

test('should find ppeItem by id', async () => {
  const spy = prisma.personalProtectionEquipmentItem.findUnique.mockImplementation(() => ppeItem);
  const result = await findPPEItemById(1);

  expect(spy).toBeCalledWith({ where: { id: 1 } });

  expect(result).toStrictEqual(ppeItem);
});

test('should create ppe item', async () => {
  const spy = prisma.personalProtectionEquipmentItem.create.mockImplementation(() => ppeItem);
  const result = await createPPEItemForUser(ppeItem);

  expect(spy).toBeCalledWith({ data: ppeItem });

  expect(result).toStrictEqual(ppeItem);
});

test('should update ppe item by id', async () => {
  const spy = prisma.personalProtectionEquipmentItem.update.mockImplementation(() => ppeItem);
  const result = await updatePPEItemById(ppeItem, 1);

  expect(spy).toBeCalledWith({ data: ppeItem, where: { id: 1 } });

  expect(result).toStrictEqual(ppeItem);
});

test('should delete ppe item by id', async () => {
  const spy = prisma.personalProtectionEquipmentItem.delete.mockImplementation(() => ppeItem);
  const result = await deletePPEItemById(1);

  expect(spy).toBeCalledWith({ where: { id: 1 } });

  expect(result).toStrictEqual(ppeItem);
});
