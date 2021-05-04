import memberTrackingRecordHandler from '../../../src/pages/api/membertrackingrecord/[id]';
import { findGrants } from '../../../src/repositories/grantsRepo';
import { findUserByDodId } from '../../../src/repositories/userRepo';
import {
  updateMemberTrackingRecord,
  deleteMemberTrackingRecord,
  findMemberTrackingRecordById,
} from '../../../src/repositories/memberTrackingRepo';
import mockMethod from '../../utils/mocks/repository';
import { grants } from '../../utils/mocks/fixtures';
import testNextApi from '../../utils/NextAPIUtils';
import dayjs from 'dayjs';

jest.mock('../../../src/repositories/userRepo.ts');
jest.mock('../../../src/repositories/grantsRepo.ts');
jest.mock('../../../src/repositories/memberTrackingRepo.ts');

const authorityId = 'a100e2fa-50d0-49a6-b10f-00adde24d0c2';
const traineeId = 'b200e2fa-50d0-49a6-b10f-00adde24d0c2';

export const traineeSigningRecordWithAuthoritySigned = {
  id: 2,
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId,
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  traineeId,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

export const traineeSigningRecordWithoutAuthoritySigned = {
  id: 2,
  authoritySignedDate: null,
  authorityId: null,
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  traineeId,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

export const authoritySigningRecordWithoutTraineeSigned = {
  id: 2,
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  traineeSignedDate: null,
  traineeId,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

export const authoritySigningRecordWithTraineeSigned = {
  id: 2,
  authoritySignedDate: dayjs('04-20-2021').toISOString(),
  authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  traineeSignedDate: dayjs('04-20-2021').toISOString(),
  traineeId,
  completedDate: null,
  successorId: null,
  trackingItemId: 2,
};

afterEach(() => {
  jest.resetAllMocks();
});

test('PUT - should return 401 if no User', async () => {
  const { status, data } = await testNextApi.get(memberTrackingRecordHandler, {
    withJwt: false,
  });

  const errorMessage = {
    error: 'Not Authenticated',
    description: 'You are not authenticated',
  };

  expect(status).toBe(401);
  expect(data).toStrictEqual(errorMessage);
});
test('PUT - should return 403 if user does not have a role that can update', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);
  mockMethod(findMemberTrackingRecordById, {});

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    },
  });

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'You do not have the appropriate permissions',
  });
});
test('PUT - should return 400 if no id in body', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);
  mockMethod(findMemberTrackingRecordById, {});

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    body: {
      id: null,
    },
  });

  expect(status).toBe(400);
  expect(data).toStrictEqual({
    message: 'Body does not include an memberTracking Id',
  });
});
test('PUT - should allow monitor to sign authority if trainee is signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);
  const returnedFromDBMemberTrackingRecord = {
    ...authoritySigningRecordWithTraineeSigned,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);

  const expectedUrlId = 2;
  const exectedFilteredData = {
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  };

  mockMethod(
    updateMemberTrackingRecord,
    authoritySigningRecordWithTraineeSigned
  );

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: authoritySigningRecordWithTraineeSigned,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    exectedFilteredData
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(authoritySigningRecordWithTraineeSigned);
});
test('PUT - should allow monitor to sign authority if trainee is not signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);
  const returnedFromDBMemberTrackingRecord = {
    ...authoritySigningRecordWithoutTraineeSigned,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);

  const expectedUrlId = 2;
  const exectedFilteredData = {
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
  };

  mockMethod(
    updateMemberTrackingRecord,
    authoritySigningRecordWithoutTraineeSigned
  );

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: authoritySigningRecordWithoutTraineeSigned,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    exectedFilteredData
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(authoritySigningRecordWithTraineeSigned);
});
test(
  'PUT - should allow monitor to sign own record as trainee when authority is signed'
);
test(
  'PUT - should allow monitor to sign own record as trainee when authority is not signed'
);

test('PUT - should NOT allow monitor to sign record as authority and trainee');
test('PUT - should NOT allow ANYONE to sign trainee for someone else');
test('PUT - should NOT allow ANYONE to sign authority for someone else');

test('PUT - should NOT allow anyone to update trainee or authority on record');

test('PUT - should allow member to sign record if authority is signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'b200e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);
  const returnedFromDBMemberTrackingRecord = {
    ...traineeSigningRecordWithAuthoritySigned,
    traineeSignedDate: null,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);

  const expectedUrlId = 2;
  const exectedFilteredData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
  };

  mockMethod(
    updateMemberTrackingRecord,
    traineeSigningRecordWithAuthoritySigned
  );

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: traineeSigningRecordWithAuthoritySigned,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    exectedFilteredData
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(traineeSigningRecordWithAuthoritySigned);
});
test('PUT - should allow member to sign record if authority is not signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'b200e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);
  const returnedFromDBMemberTrackingRecord = {
    ...traineeSigningRecordWithoutAuthoritySigned,
    traineeSignedDate: null,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);

  const expectedUrlId = 2;
  const exectedFilteredData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
  };

  mockMethod(
    updateMemberTrackingRecord,
    traineeSigningRecordWithoutAuthoritySigned
  );

  const { data, status } = await testNextApi.put(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: traineeSigningRecordWithoutAuthoritySigned,
  });

  expect(updateMemberTrackingRecord).toBeCalledWith(
    expectedUrlId,
    exectedFilteredData
  );

  expect(status).toBe(200);
  expect(data).toStrictEqual(traineeSigningRecordWithoutAuthoritySigned);
});

test('DELETE - member can delete membertrackingrecord if authority is not signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };

  const returnedFromDBMemberTrackingRecord = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: null,
    authorityId: null,
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);
  mockMethod(deleteMemberTrackingRecord, expectedReturnedData);

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(deleteMemberTrackingRecord).toBeCalledWith(expectedUrlId);

  expect(status).toBe(200);
});

test('DELETE - member cant delete membertrackingrecord if authority is signed', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'member' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const expectedReturnedData = {
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
  };

  const returnedFromDBMemberTrackingRecord = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, returnedFromDBMemberTrackingRecord);
  mockMethod(deleteMemberTrackingRecord, expectedReturnedData);

  const { status, data } = await testNextApi.delete(
    memberTrackingRecordHandler,
    {
      urlId: expectedUrlId,
    }
  );

  expect(status).toBe(403);
  expect(data).toStrictEqual({
    message: 'Unable to delete record',
  });
});

test('DELETE - should return 404 if membertrackingrecord is not in database', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'monitor' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const body = {
    id: 2,
    traineeSignedDate: dayjs('04-20-2021').toISOString(),
    authoritySignedDate: dayjs('04-20-2021').toISOString(),
    authorityId: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    traineeId: null,
    completedDate: null,
    successorId: null,
    trackingItemId: 2,
  };

  mockMethod(findMemberTrackingRecordById, null);

  const error = async () => {
    throw new Error('There was an error');
  };

  (deleteMemberTrackingRecord as any).mockImplementation(error);

  const { data, status } = await testNextApi.delete(
    memberTrackingRecordHandler,
    {
      urlId: expectedUrlId,
    }
  );

  expect(status).toBe(404);
});

test('DELETE - should return 403 if role is not allowed to delete', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.delete(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(status).toBe(403);
});

test('POST - should not allow', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.post(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
    body: {},
  });

  expect(status).toBe(405);
});

test('GET - should not allow', async () => {
  mockMethod(findUserByDodId, {
    id: 'a100e2fa-50d0-49a6-b10f-00adde24d0c2',
    firstName: 'joe',
    role: { id: '22', name: 'norole' },
  });
  mockMethod(findGrants, grants);

  const expectedUrlId = 2;

  const { status } = await testNextApi.get(memberTrackingRecordHandler, {
    urlId: expectedUrlId,
  });

  expect(status).toBe(405);
});
