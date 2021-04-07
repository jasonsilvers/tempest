import { createMocks } from 'node-mocks-http';
import mockRepository from '../../utils/mocks/repository';
import * as repo from '../../../prisma/repositories/user';
import userQueryHandler from '../../../pages/api/user/[id]';
import { UserWithRole } from '../../../prisma/repositories/user';

const userTest = {
  name: 'Bob',
};

test('api/user/1:GET--Happy Case', async () => {
  const spy = mockRepository<UserWithRole, typeof repo>(repo, 'getUserById', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'GET',
    body: userTest,
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  const expectedUser = { ...userTest, id: 1 };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(1);
});

test('api/user/1:PUT--Happy Case', async () => {
  const spy = mockRepository<UserWithRole, typeof repo>(repo, 'putUser', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: { ...userTest, id: 1 },
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  const expectedUser = { ...userTest, id: 1 };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(spy).toHaveBeenCalledWith({ ...userTest, id: 1 });
  spy.mockClear();
});

test('api/user/1:PUT--Body Null Id', async () => {
  const spy = mockRepository<UserWithRole, typeof repo>(repo, 'putUser', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: userTest,
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual('User must have id to update');
  expect(spy).not.toHaveBeenCalledWith(userTest);
  spy.mockClear();
});

test('api/user/1:PUT--Query and Body ids', async () => {
  const spy = mockRepository<UserWithRole, typeof repo>(repo, 'putUser', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: { ...userTest, id: 2 },
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  expect(spy).toHaveBeenCalledTimes(0);
  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual('User Obj and Query must match for id');
  spy.mockClear();
});

test('api/user/1:POST--Method not allowed', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { ...userTest, id: 1 },
    query: { id: 1 },
  });
  await userQueryHandler(req, res);

  const expectedUserError = 'Method POST Not Allowed';

  expect(res._getStatusCode()).toBe(405);
  expect(res._getData()).toEqual(expectedUserError);
});
