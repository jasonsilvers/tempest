import { getCategory, getStatus } from '../../src/utils/status';
import dayjs from 'dayjs';
import { MemberTrackingRecord } from '@prisma/client';
import { ECategorie } from '../../src/const/enums';

test('Should return Done when interval is greater than 60 days completed Date before due Date --Left', () => {
  const completedDate = dayjs().toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.DONE);
});

test('Should return Done when interval is greater than 60 days completed Date before due Date --Right', () => {
  const completedDate = dayjs()
    .subtract(365 - 31, 'days')
    .toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.DONE);
});

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date --Right ', () => {
  const completedDate = dayjs()
    .subtract(365 - 1, 'days')
    .toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.UPCOMING);
});

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date --Left ', () => {
  const completedDate = dayjs()
    .subtract(365 - 30, 'days')
    .toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.UPCOMING);
});

test('Should return Overdue when interval is greater than interval ', () => {
  const completedDate = dayjs().subtract(366, 'days').toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.OVERDUE);
});

test('Should return Overdue when interval is equal to interval ', () => {
  const completedDate = dayjs().subtract(365, 'days').toDate();
  const interval = 365;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.OVERDUE);
});

test('Should return Done when interval is 60 days and completed Date before due Date --Left', () => {
  const completedDate = dayjs().toDate();
  const interval = 60;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.DONE);
});

test('Should return Done when interval is 60 days and completed Date before due Date  --Right', () => {
  const completedDate = dayjs()
    .subtract(60 - 15, 'days')
    .toDate();
  const interval = 60;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.DONE);
});

test('Should return Upcoming when interval is 60 days and completed date is 14 days before due date --Left ', () => {
  const completedDate = dayjs()
    .subtract(60 - 14, 'days')
    .toDate();
  const interval = 60;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.UPCOMING);
});

test('Should return Upcoming when interval is 60 days and completed date is 14 days before due date --Right', () => {
  const completedDate = dayjs()
    .subtract(60 - 1, 'days')
    .toDate();
  const interval = 60;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.UPCOMING);
});

test('Should return Overdue when interval is 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs().subtract(70, 'days').toDate();
  const interval = 60;
  const result = getStatus(completedDate, interval);

  expect(result).toBe(ECategorie.OVERDUE);
});

test('Should return ToDo if no completion date', () => {
  const interval = 60;
  const result = getCategory({ completedDate: null } as MemberTrackingRecord, interval);

  expect(result).toBe(ECategorie.TODO);
});

test('Should return Signature Required if no signed dates', () => {
  const interval = 60;
  const result = getCategory({ completedDate: dayjs().toDate() } as MemberTrackingRecord, interval);

  expect(result).toBe(ECategorie.SIGNATURE_REQUIRED);
});

test('should return Done if one time training is completed', () => {
  const interval = 0;
  const result = getStatus(dayjs().toDate(), interval);

  expect(result).toBe(ECategorie.DONE);
});
