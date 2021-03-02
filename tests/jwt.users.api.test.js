import { users } from '../pages/api/users';
import { createMocks } from 'node-mocks-http';
import { AccessControl } from 'accesscontrol';

const usertest = [
  {
    id: 123,
    name: 'me',
  },
];

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: function () {
      return {
        user: {
          findMany: jest.fn(() => {
            return usertest
          }),
          update: jest.fn(),
        },
      };
    },
  };
});

test('api/user:GET', async () => {
  const ac = new AccessControl([
    {
      role: 'admin',
      resource: 'record',
      action: 'create:any',
      attributes: '*, !views',
    },
  ]);
  const { req, res } = createMocks({
    method: 'GET',
    query: {
      id: 1,
    },
    ac,
  });
  await users(req, res);

  console.log(usertest);
  console.log(res._getData())
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(usertest);
});
