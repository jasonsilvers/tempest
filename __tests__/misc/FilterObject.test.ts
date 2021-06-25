import { filterObject } from '../../src/utils/FilterObject';
test('should test the blacklisting util function', () => {
  const x = { a: 1, b: 2, c: 3, d: 4, 5: 'test' };

  expect(filterObject(x, ['a', 5])).toStrictEqual({ b: 2, c: 3, d: 4 });
});
