import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import { grants } from '../../utils/mocks/fixtures';
import { mockMethodAndReturn } from '../../utils/mocks/repository';
import memberTrackingRecordIdHandler from '../../../src/pages/api/membertrackingrecord/[id]';
import testNextApi from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

beforeEach(() => {
  mockMethodAndReturn(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethodAndReturn(findGrants, grants);
});

afterEach(() => {
  jest.resetAllMocks();
});

test('should return 401 if not Authorized', async () => {
  const { status } = await testNextApi.post(memberTrackingRecordIdHandler, {
    withJwt: false,
    body: {},
  });

  expect(status).toBe(401);
});
// test('DELETE - should delete member tracking record', async () => {});
// test('DELETE - should return 404 if record not found', async () => {});
// test('DELETE - should return 403 if incorrect permissions (monitor)', async () => {});
// test('DELETE - should return 403 if incorrect permissions (member)', async () => {});
