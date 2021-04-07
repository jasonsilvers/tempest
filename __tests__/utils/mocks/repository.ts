/**
 * Mock Repository Helper function
 *
 * Creates a spy based on params passed and returns that spy for testing
 *
 * @type E Entity to expect
 * @type R Optional type for intellisense of the method param
 * @type R usage - <E, typeof moduleName>
 *
 * @param repo Module to spyOn
 * @param method method/function name to spyOn
 * @param data object to return
 * @returns jest.spy
 */
const mockRepository = <E, R = any>(
  repo,
  method: Extract<keyof R, string>,
  data: Partial<E>
) => {
  return jest.spyOn(repo, method).mockReturnValue(data);
};

export default mockRepository;
