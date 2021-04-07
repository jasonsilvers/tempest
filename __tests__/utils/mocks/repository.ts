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
const mockRepository = <E>(method, data: Partial<E>) => {
  try {
    method.mockResolvedValue(data);
  } catch (e) {
    console.error(
      `\x1b[47m Please mock the repository that owns ${method.name} \x1b[0m`
    );
  }
  return method;
};

export default mockRepository;
