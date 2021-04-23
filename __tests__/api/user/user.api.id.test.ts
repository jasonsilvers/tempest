import { createMocks } from 'node-mocks-http';
import mockMethod from '../../utils/mocks/repository';
import {
  findUserById,
  updateUser,
  UserWithRole,
} from '../../../src/repositories/userRepo';
import userQueryHandler from '../../../src/pages/api/user/[id]';
import { apiResolver } from 'next/dist/next-server/server/api-utils';


const userTest = {
  name: 'Bob',
};

jest.mock('../../../src/repositories/userRepo');

test('api/user/1:GET--Happy Case', async () => {
  mockMethod<UserWithRole>(findUserById, { ...userTest, id: '1' });

  const { req, res } = createMocks({
    method: 'GET',
    body: userTest,
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  const expectedUser = { ...userTest, id: '1' };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(findUserById).toHaveBeenCalled();
  expect(findUserById).toHaveBeenCalledTimes(1);
  expect(findUserById).toHaveBeenCalledWith('1');
  jest.clearAllMocks();
});

test('api/user/1:PUT--Happy Case', async () => {
  const spy = mockMethod<UserWithRole>(updateUser, {
    ...userTest,
    id: '1',
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: { ...userTest, id: '1' },
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  const expectedUser = { ...userTest, id: '1' };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(spy).toHaveBeenCalledWith({ ...userTest, id: '1' });
  jest.clearAllMocks();
});

test('api/user/1:PUT--Body Null Id', async () => {
  const spy = mockMethod<UserWithRole>(updateUser, {
    ...userTest,
    id: '1',
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: userTest,
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual('User must have id to update');
  expect(spy).not.toHaveBeenCalled();
});

test('api/user/1:PUT--Query and Body ids', async () => {
  const spy = mockMethod<UserWithRole>(updateUser, {
    ...userTest,
    id: '1',
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: { ...userTest, id: '2' },
    query: { id: '1' },
  });

  await userQueryHandler(req, res);

  expect(spy).toHaveBeenCalledTimes(0);
  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual('User Obj and Query must match for id');
});

test('api/user/1:POST--Method not allowed', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { ...userTest, id: '1' },
    query: { id: '1' },
  });
  await userQueryHandler(req, res);

  const expectedUserError = 'Method POST Not Allowed';

  expect(res._getStatusCode()).toBe(405);
  expect(res._getData()).toEqual(expectedUserError);
});
