import { Role, User } from '@prisma/client';
import { getRoleByName } from '../../src/repositories/roleRepo';
import { createUser } from '../../src/repositories/userRepo';
import { withErrorHandling, createNewUserFromJWT } from '../../src/repositories/utils';
import { p1Token, p1TokenBroken } from '../testutils/mocks/mockJwt';
import { mockMethodAndReturn } from '../testutils/mocks/repository';

jest.mock('../../src/repositories/roleRepo.ts');
jest.mock('../../src/repositories/userRepo.ts');

const testFunction = () => {
  throw new Error('error');
};

const returnedUser = {
  id: 1,
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
} as unknown as User;

afterEach = () => {
  jest.clearAllMocks();
};

test('should throw error if async function fails', async () => {
  const methodWithErrorHandling = withErrorHandling(testFunction);

  await expect(methodWithErrorHandling()).rejects.toThrowError('There was an error making the request');
});

test('should create new user from jwt', async () => {
  const dummyRole = {
    id: 1,
    name: 'dummy',
  } as Role;
  mockMethodAndReturn(getRoleByName, dummyRole);

  const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;

  const spy = mockedCreateUser.mockImplementation(() => {
    return Promise.resolve(returnedUser);
  });

  await createNewUserFromJWT(p1Token);
  expect(spy).toBeCalledWith(
    {
      firstName: 'Scarlet',
      email: 'scarlet.member@gmail.com',
      lastName: 'Member',
    },
    dummyRole
  );
});

test('should set first name and last name if null in jwt and throw error if no email', async () => {
  const dummyRole = {
    id: 1,
    name: 'dummy',
  } as Role;
  mockMethodAndReturn(getRoleByName, dummyRole);

  const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;

  mockedCreateUser.mockImplementation(() => {
    return Promise.resolve(returnedUser);
  });

  await expect(createNewUserFromJWT(p1TokenBroken)).rejects.toThrowError(
    'Unable to create user account without a valid email'
  );
});
