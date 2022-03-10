import { NextApiRequest } from 'next';
import { jwtParser } from '../../src/utils/jwtUtils';
import { memberJWT, withOutUserCertificateJWT } from '../testutils/mocks/mockJwt';

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

const p1Token = {
  exp: 1599053095,
  iat: 1599052195,
  auth_time: 1599051245,
  jti: '76116e42-9ef8-485b-b091-44bd54199b79',
  iss: 'https://login.dsop.io/auth/realms/baby-yoda',
  aud: 'il4_191f836b-ec50-4819-ba10-1afaa5b99600_mission-widow',
  sub: '1575ab23-2fa4-4503-9a29-ee612e5fe7a0',
  typ: 'ID',
  azp: 'il4_191f836b-ec50-4819-ba10-1afaa5b99600_mission-widow',
  dod_id: '2223332221',
  nonce: 'vtAYRawB2U9DhF0xC12qkNFbnOgca28AqVdt7w6_z6c',
  session_state: '338940c6-7364-4df0-99c2-878ca1fb224c',
  acr: '1',
  email_verified: true,
  'group-simple': ['Impact Level 2 Authorized', 'Impact Level 4 Authorized', 'Impact Level 5 Authorized'],
  preferred_username: 'scarletmember',
  given_name: 'Scarlet',
  activecac: '',
  affiliation: 'USAF',
  'group-full': ['/Impact Level 2 Authorized', '/Impact Level 4 Authorized', '/Impact Level 5 Authorized'],
  organization: 'USAF',
  name: 'Scarlet Alfred Member',
  usercertificate: 'SCARLET.ALFRED.MEMBER.2223332221',
  rank: 'SGT',
  family_name: 'Member',
  email: 'scarlet.member@gmail.com',
};

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
