import { mockMethodAndReturn } from '../utils/mocks/repository';
import loginHandler from '../../src/pages/api/login';
import { updateLastLogin } from '../../src/repositories/userRepo';
import { findGrants } from '../../src/repositories/grantsRepo';
import { returnUser } from '../../src/repositories/loginRepo';
import testNextApi from '../utils/NextAPIUtils';
import { grants } from '../utils/mocks/fixtures';

jest.mock('../../src/repositories/userRepo');
jest.mock('../../src/repositories/roleRepo');
jest.mock('../../src/repositories/loginRepo');
jest.mock('../../src/repositories/grantsRepo.ts');

const returnedUser = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

// configure process.env variables before all tests
beforeAll(() => {
  process.env.ERROR_DEBUG = 'FALSE';
  process.env.COMMON_API_URL = 'http://localhost:8089/api/v1';
});

beforeEach(() => {
  mockMethodAndReturn(returnUser, returnedUser);
  mockMethodAndReturn(updateLastLogin, returnedUser);
  mockMethodAndReturn(findGrants, grants);
});

// remove process.env variables after all tests
afterAll(() => {
  process.env.ERROR_DEBUG = 'TRUE';
  delete process.env.COMMON_API_URL;
});

test('login handler returns user when user is found', async () => {
  const { status, data } = await testNextApi.get(loginHandler);

  expect(status).toBe(200);
  expect(data).toEqual(returnedUser);
});

test('login should update last login date', async () => {
  const { status, data } = await testNextApi.get(loginHandler);

  expect(status).toBe(200);
  expect(data).toEqual(returnedUser);
  expect(updateLastLogin).toHaveBeenCalled();
});
