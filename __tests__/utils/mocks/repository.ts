import * as userRepo from '../../../prisma/repositories/user';

export const mockUserRepository = (
  method: Extract<keyof typeof userRepo, string>,
  data: Partial<userRepo.UserWithRole>
) => {
  return jest.spyOn(userRepo, method).mockReturnValue(data);
};

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

// jest.mock('../fetches/airmen.js');
// getUnits.mockResolvedValue([airman.squadron]);
