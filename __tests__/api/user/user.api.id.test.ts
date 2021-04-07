import { createMocks } from 'node-mocks-http';
import mockRepository from '../../utils/mocks/repository';
import * as repo from '../../../prisma/repositories/user';
import userHandler from '../../../pages/api/user/[id]';
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

  await userHandler(req, res);

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
  });

  await userHandler(req, res);

  const expectedUser = { ...userTest, id: 1 };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(spy).toHaveBeenCalledWith({ ...userTest, id: 1 });
});

test('api/user/1:PUT--', async () => {
  const spy = mockRepository<UserWithRole, typeof repo>(repo, 'putUser', {
    ...userTest,
    id: 1,
  });

  const { req, res } = createMocks({
    method: 'PUT',
    body: userTest,
  });

  await userHandler(req, res);

  const expectedUser = { ...userTest, id: 1 };

  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(expectedUser);
  expect(spy).toHaveBeenCalledWith(userTest);
});
