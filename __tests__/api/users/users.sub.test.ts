import { testNextApi } from '../../utils/NextAPIUtils';
import userSubscriptionHandler from '../../../src/pages/api/users/sub';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import verifySignature from '../../../src/utils/Crypto';
import { server } from '../../utils/mocks/msw';
import { rest } from 'msw';
import { findUserById, updateTempestUserFromCommonApi } from '../../../src/repositories/userRepo';
import { getPersonFromCommonApi } from '../../../src/repositories/common/commonRepo';

jest.mock('../../../src/utils/Crypto');
jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/common/commonRepo');
process.env.COMMON_API_URL = 'https://whatever.com';
const COMMON_API_URL = process.env.COMMON_API_URL;

// Establish API mocking before tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'bypass',
  });
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// // Clean up after the tests are finished.
afterAll(() => server.close());

describe('User Subscription Endpoint Tests', () => {
  it('api/user/sub:POST user exists in tempest', async () => {
    const body = { personIds: ['1234'] };
    const tempestUser = { name: 'dave' };
    const commonPerson = { name: 'dave', email: 'dave@himself.me' };

    // mock the verify signature check
    // verify signature is tested in the signatureRequired.test.ts
    mockMethodAndReturn(verifySignature, true);
    mockMethodAndReturn(updateTempestUserFromCommonApi, commonPerson);
    mockMethodAndReturn(getPersonFromCommonApi, commonPerson);
    mockMethodAndReturn(findUserById, tempestUser);

    server.use(
      rest.get(`${COMMON_API_URL}/person/1234`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(commonPerson));
      })
    );

    const { status, data } = await testNextApi.post(userSubscriptionHandler, {
      body,
    });

    // verify that findUserById was called in the loop
    expect(findUserById).toBeCalledTimes(1);
    //verify that the user was updated
    expect(updateTempestUserFromCommonApi).toBeCalledTimes(1);
    expect(updateTempestUserFromCommonApi).toBeCalledWith(commonPerson, tempestUser);
    expect(status).toBe(202);
    expect(data.message).toBe('Got It');
  });

  it('api/user/sub:POST user does not exist in tempest', async () => {
    const body = { personIds: ['1234'] };
    const commonPerson = { name: 'dave', email: 'dave@himself.me' };

    // mock the verify signature check
    // verify signature is tested in the signatureRequired.test.ts
    mockMethodAndReturn(verifySignature, true);
    mockMethodAndReturn(findUserById, null);
    mockMethodAndReturn(getPersonFromCommonApi, commonPerson);
    mockMethodAndReturn(updateTempestUserFromCommonApi, commonPerson);

    server.use(
      rest.get(`${COMMON_API_URL}/person/1234`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(commonPerson));
      })
    );

    const { status, data } = await testNextApi.post(userSubscriptionHandler, {
      body,
    });

    // verify that findUserById was called in the loop
    expect(findUserById).toBeCalledTimes(1);
    //verify that the user was not updated
    expect(updateTempestUserFromCommonApi).toBeCalledTimes(0);
    expect(getPersonFromCommonApi).toBeCalledTimes(0);
    expect(status).toBe(202);
    expect(data.message).toBe('Got It');
  });
});
