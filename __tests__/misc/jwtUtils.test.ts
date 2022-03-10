import { NextApiRequest } from 'next';
import { jwtParser } from '../../src/utils/jwtUtils';
import { memberJWT, p1Token, withOutUserCertificateJWT } from '../testutils/mocks/mockJwt';

const reqWithoutAuth = {
  headers: {
    authorization: undefined,
  },
} as unknown as NextApiRequest;

const reqWithAuthWithoutUserCertificate = {
  headers: {
    authorization: `Bearer ${withOutUserCertificateJWT}`,
  },
} as unknown as NextApiRequest;

const req = {
  headers: {
    authorization: `Bearer ${memberJWT}`,
  },
} as unknown as NextApiRequest;

const reqWithoutToken = {
  headers: {
    authorization: 'Bearer',
  },
} as unknown as NextApiRequest;

it('should decode JWT', () => {
  const decodedJWT = jwtParser(req);
  expect(decodedJWT).toStrictEqual(p1Token);
});

it('should throw error is no authorization header is set', () => {
  const expectedError = new Error('Authorization header not set, please contact P1 Admin');

  try {
    jwtParser(reqWithoutAuth);
  } catch (error) {
    expect(error).toStrictEqual(expectedError);
  }
});

it('should throw error is no authorization header is set', () => {
  const expectedError = new Error('No user certificate, please contact P1 Admin');

  try {
    jwtParser(reqWithAuthWithoutUserCertificate);
  } catch (error) {
    expect(error).toStrictEqual(expectedError);
  }
});

it('should throw error is no authorization header is set', () => {
  const expectedError = new Error('No user certificate, please contact P1 Admin');

  try {
    jwtParser(reqWithoutToken);
  } catch (error) {
    expect(error).toStrictEqual(expectedError);
  }
});
