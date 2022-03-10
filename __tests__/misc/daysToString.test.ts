import { getInterval } from '../../src/utils/daysToString';

test('it should convert interval number to string', () => {
  const interval = getInterval(365);

  expect(interval).toStrictEqual('Annually');
});

test('it should return number of days if interval conversion not found', () => {
  const interval = getInterval(185);

  expect(interval).toStrictEqual('185 days');
});
