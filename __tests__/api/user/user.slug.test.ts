import memberTrackingRecordHandler from '../../../src/pages/api/membertrackingrecord/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import {
  findTrackingRecordsByTraineeId,
  findUserByDodId,
} from '../../../src/repositories/userRepo';
import mockMethod from '../.././utils/mocks/repository';
import { grants } from '../../utils/mocks/fixtures';
import testNextApi from '../../utils/NextAPIUtils';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');

test('should return 200 and member tracking records', async () => {
  // mockMethod(findUserByDodId, { firstName: 'joe', role: {id: '22', name: 'admin'} });
  // mockMethod(findGrants, grants);
  // mockMethod(findTrackingRecordsByTraineeId, [
  //   {
  //     id: 1,
  //     traineeSignedDate: null,
  //     authoritySignedDate: null,
  //     authorityId: null,
  //     traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  //     completedDate: null,
  //     successorId: null,
  //     trackingItemId: 1,
  //   },
  // ]);
  // const { data, status } = await testNextApi.get(memberTrackingRecordHandler, {
  //   urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  // });
  // expect(status).toBe(200);
  // expect(findTrackingRecordsByTraineeId).toBeCalledWith(
  //   'a100e2fa-50d0-49a6-b10f-00adde24d0c2'
  // );
  // expect(data).toStrictEqual([
  //   {
  //     id: 1,
  //     traineeSignedDate: null,
  //     authoritySignedDate: null,
  //     authorityId: null,
  //     traineeId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  //     completedDate: null,
  //     successorId: null,
  //     trackingItemId: 1,
  //   },
  // ]);
});
