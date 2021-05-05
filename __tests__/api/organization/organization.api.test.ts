import mockMethod from '../../utils/mocks/repository';
import {
  createOrganizations,
  findOrganizations,
} from '../../../src/repositories/organizationRepo';
import { organizationApiHandler } from '../../../src/pages/api/organization/index';
import { createMocks } from 'node-mocks-http';

afterAll = () => {
  jest.clearAllMocks();
};

const testOrganizations = [
  {
    id: '1',
    name: 'testOrg1',
  },
  {
    id: '2',
    name: 'testOrg2',
  },
];

jest.mock('../../../src/repositories/userRepo');
jest.mock('../../../src/repositories/organizationRepo');

test('api/organization/GET --Happy Case', async () => {
  mockMethod(findOrganizations, testOrganizations);
  const { req, res } = createMocks({
    method: 'GET',
  });
  await organizationApiHandler(req, res);
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual(testOrganizations);
});

test('api/organization/POST --Happy Case', async () => {
  mockMethod(createOrganizations, { id: '1', name: 'test org 3' });
  const { req, res } = createMocks({
    method: 'POST',
    body: { name: 'test org 3' },
  });
  await organizationApiHandler(req, res);
  expect(res._getStatusCode()).toBe(200);
  expect(JSON.parse(res._getData())).toEqual({ id: '1', name: 'test org 3' });
});

test('api/organization/POST --Sad Case', async () => {
  const { req, res } = createMocks({
    method: 'POST',
    body: { id: '1', name: 'test org 3' },
  });
  await organizationApiHandler(req, res);
  expect(res._getStatusCode()).toBe(400);
  expect(res._getData()).toEqual('ID Must Be null');
});

test('api/organization/:PUT --Not Allowed', async () => {
  const { req, res } = createMocks({
    method: 'PUT',
  });
  await organizationApiHandler(req, res);
  expect(res._getStatusCode()).toBe(405);
  expect(res._getData()).toEqual('Method PUT Not Allowed');
  expect(res._getHeaders()).toEqual({ allow: ['GET', 'POST'] });
});
