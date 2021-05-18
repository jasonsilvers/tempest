import { status } from '../../../src/components/Records/MemberRecordTracker';
import dayjs from 'dayjs';

test('Should return Done when interval is greater than 60 days completed Date before due Date --Left', () => {
  const completedDate = dayjs().toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Done');
});

test('Should return Done when interval is greater than 60 days completed Date before due Date --Right', () => {
  const completedDate = dayjs()
    .subtract(365 - 31, 'days')
    .toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Done');
});

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date --Right ', () => {
  const completedDate = dayjs()
    .subtract(365 - 1, 'days')
    .toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Upcoming');
});

test('Should return Upcoming when interval is greater than 60 days and completed date is 30 days before due date --Left ', () => {
  const completedDate = dayjs()
    .subtract(365 - 30, 'days')
    .toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Upcoming');
});

test('Should return Overdue when interval is greater than interval ', () => {
  const completedDate = dayjs().subtract(366, 'days').toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Overdue');
});

test('Should return Overdue when interval is equal to interval ', () => {
  const completedDate = dayjs().subtract(365, 'days').toDate();
  const interval = 365;
  const result = status(completedDate, interval);

  expect(result).toBe('Overdue');
});

test('Should return Done when interval is 60 days and completed Date before due Date --Left', () => {
  const completedDate = dayjs().toDate();
  const interval = 60;
  const result = status(completedDate, interval);

  expect(result).toBe('Done');
});

test('Should return Done when interval is 60 days and completed Date before due Date  --Right', () => {
  const completedDate = dayjs()
    .subtract(60 - 15, 'days')
    .toDate();
  const interval = 60;
  const result = status(completedDate, interval);

  expect(result).toBe('Done');
});

test('Should return Upcoming when interval is 60 days and completed date is 14 days before due date --Left ', () => {
  const completedDate = dayjs()
    .subtract(60 - 14, 'days')
    .toDate();
  const interval = 60;
  const result = status(completedDate, interval);

  expect(result).toBe('Upcoming');
});

test('Should return Upcoming when interval is 60 days and completed date is 14 days before due date --Right', () => {
  const completedDate = dayjs()
    .subtract(60 - 1, 'days')
    .toDate();
  const interval = 60;
  const result = status(completedDate, interval);

  expect(result).toBe('Upcoming');
});

test('Should return Overdue when interval is 60 days and completed date is 30 days before due date ', () => {
  const completedDate = dayjs().subtract(70, 'days').toDate();
  const interval = 60;
  const result = status(completedDate, interval);

  expect(result).toBe('Overdue');
});
