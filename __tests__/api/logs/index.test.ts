import logHandler from '../../../src/pages/api/logs';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { testNextApi } from '../../utils/NextAPIUtils';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { createLog } from '../../../src/repositories/logRepo';

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/roleRepo');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/logRepo');

const user = {
  id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  firstName: 'joe',
  role: { id: '22', name: 'monitor' },
};

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, user);
  mockMethodAndReturn(findGrants, grants);
});

test('Succesfully logs and returns 200', async () => {
  process.env.LOG_LEVEL = 'DEBUG';
  const { status, data } = await testNextApi.post(logHandler, {
    body: {
      logEventType: 'API_ACCESS',
      message: 'Accessed API',
    },
  });

  expect(status).toBe(200);
  expect(data).toEqual({ message: 'ok' });
  process.env.LOG_LEVEL = 'SILENT';
});

test('should return method not allowed if not POST', async () => {
  const { status } = await testNextApi.get(logHandler);

  expect(status).toBe(405);
});
