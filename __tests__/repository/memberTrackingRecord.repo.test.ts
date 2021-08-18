import prisma from '../setup/mockedPrisma';
import {
  findMemberTrackingRecordById,
  createMemberTrackingRecord,
  updateMemberTrackingRecord,
  deleteMemberTrackingRecord,
  findMemberTrackingItemById,
  findMemberTrackingRecords,
  findMemberTrackingItemByIdAll,
  deleteMemberTrackingItem,
  updateMemberTrackingItem,
  createMemberTrackingItem,
} from '../../src/repositories/memberTrackingRepo';
import { MemberTrackingItem, MemberTrackingRecord } from '@prisma/client';

const dummyTrackingItem = {
  isActive: true,
  userId: '123',
} as MemberTrackingItem;

test('should createMemberTrackingItem', async () => {
  prisma.memberTrackingItem.create.mockImplementationOnce((arg) => ({ trackingItemId: 1, ...arg.data }));
  const trackingItem = await createMemberTrackingItem(dummyTrackingItem);
  expect(trackingItem).toStrictEqual({ trackingItemId: 1, ...dummyTrackingItem });
});

test('should findMemberTrackingItemByIdAll', async () => {
  prisma.memberTrackingItem.findUnique.mockImplementationOnce(() => ({ ...dummyTrackingItem, trackingItemId: 1 }));
  const trackingItems = await findMemberTrackingItemByIdAll('123', 1);
  expect(trackingItems).toStrictEqual({ ...dummyTrackingItem, trackingItemId: 1 });
});

test('should deleteMemberTrackingItem', async () => {
  prisma.memberTrackingItem.delete.mockImplementationOnce(() => Promise.resolve());
  await deleteMemberTrackingItem(1, '123');
});

test('should updateMemberTrackingItem', async () => {
  prisma.memberTrackingItem.update.mockImplementationOnce(({ data }) => ({
    ...data,
  }));
  const trackingItem = await updateMemberTrackingItem(1, '123', { isActive: false, trackingItemId: 1, userId: '123' });
  expect(trackingItem).toStrictEqual({ isActive: false, trackingItemId: 1, userId: '123' });
});

test('should findMemberTrackingItemById with no options', async () => {
  prisma.memberTrackingItem.findUnique.mockImplementationOnce(() => ({ ...dummyTrackingItem, trackingItemId: 1 }));
  const trackingItem = await findMemberTrackingItemById(1, '123');
  expect(trackingItem).toStrictEqual({ ...dummyTrackingItem, trackingItemId: 1 });
});

test('should findMemberTrackingItemById with options', async () => {
  prisma.memberTrackingItem.findUnique.mockImplementationOnce(() => ({ ...dummyTrackingItem, trackingItemId: 1 }));
  const trackingItem = await findMemberTrackingItemById(1, '123', {
    withMemberTrackingRecords: true,
    withTrackingItems: true,
  });
  expect(trackingItem).toStrictEqual({ ...dummyTrackingItem, trackingItemId: 1 });
});

/**
 * Member tracking Record tests
 */

const dummyMemberTrackingRecord = {
  authorityId: '321',
  trackingItemId: 1,
  authoritySignedDate: new Date('2019-01-01'),
  completedDate: new Date('2019-01-01'),
  id: 1,
  order: 1,
  traineeId: '123',
  traineeSignedDate: new Date('2019-01-01'),
} as MemberTrackingRecord;

test('should createMemberTrackingRecord and include trackingItem', async () => {
  prisma.memberTrackingRecord.count.mockImplementationOnce(() => 1);
  prisma.memberTrackingRecord.create.mockImplementationOnce(() => ({ ...dummyMemberTrackingRecord, order: 2 }));
  const memberTrackingRecord = await createMemberTrackingRecord(dummyMemberTrackingRecord);
  expect(memberTrackingRecord).toStrictEqual({ ...dummyMemberTrackingRecord, order: 2 });
});

test('should findMemberTrackingRecordById', async () => {
  prisma.memberTrackingRecord.findUnique.mockImplementationOnce(() => dummyMemberTrackingRecord);
  const memberTrackingRecord = await findMemberTrackingRecordById(1);
  expect(memberTrackingRecord).toStrictEqual(dummyMemberTrackingRecord);
});

test('should findMemberTrackingRecords', async () => {
  prisma.memberTrackingRecord.findMany.mockImplementationOnce(() => [dummyMemberTrackingRecord]);
  const memberTrackingRecords = await findMemberTrackingRecords(1, '123');
  expect(memberTrackingRecords).toStrictEqual([dummyMemberTrackingRecord]);
});

test('should deleteMemberTrackingRecord', async () => {
  prisma.memberTrackingRecord.delete.mockImplementationOnce(() => Promise.resolve());
  await deleteMemberTrackingRecord(1);
});

test('should updateMemberTrackingRecord', async () => {
  prisma.memberTrackingRecord.update.mockImplementationOnce(({ data }) => data);
  const memberTrackingRecord = await updateMemberTrackingRecord(1, dummyMemberTrackingRecord);
  expect(memberTrackingRecord).toStrictEqual(dummyMemberTrackingRecord);
});
