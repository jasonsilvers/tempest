/**
 * Mock Repository Helper function
 *
 * Creates a spy based on params passed and returns that spy for testing
 *
 * @type E Entity to expect
 *
 * @param method method of mocked module to resolve the data for
 * @param data object to return
 * @returns the method just for ease of use
 */
/*eslint-disable */
// This can be any function
export const mockMethodAndReturn = <E>(method: any, data: Partial<E> | null) => {
  try {
    method.mockResolvedValue(data);
  } catch (e) {
    console.error(`\x1b[47m Please mock the repository that owns ${method?.name} \x1b[0m`);
  }
  return method;
};
/*eslint-enable */

/*eslint-disable */
export function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
  return fn as jest.MockedFunction<T>;
}

/*eslint-disable */
