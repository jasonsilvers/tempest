import { User } from '@prisma/client';
import { createMocks } from 'node-mocks-http';
import { userApiHandler } from '../../../pages/api/user';
import mockRepository from '../../utils/mocks/repository';
import * as repo from '../../../prisma/repositories/user';

const userTest = {
  name: 'Bob',
};

test('api/user:POST--Happy Case', async () => {
  mockRepository<User, typeof repo>(repo, 'postUser', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'POST',
    body: userTest,
  });
  await userApiHandler(req, res);

  const expectedUser = { ...userTest, id: 1 };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
});

test('api/user:POST--ID must be null', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { ...userTest, id: 1 },
  });
  await userApiHandler(req, res);

  const expectedUserError = 'ID must be null';

  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual(expectedUserError);
});

test('api/user:GET --Method not allowed', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    // body: {...userTest, id:1}
  });
  await userApiHandler(req, res);

  const expectedUserError = 'Method GET Not Allowed';

  expect(res._getStatusCode()).toBe(405);
  expect(res._getData()).toEqual(expectedUserError);
});
