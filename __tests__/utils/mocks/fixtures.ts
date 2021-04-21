import { P1JWT } from '../../../src/types/global';

export const grants = [
  { action: 'create:any', attributes: '*', resource: 'record', role: 'admin' },
  { action: 'read:any', attributes: '*', resource: 'profile', role: 'member' },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'dashboard',
    role: 'monitor',
  },
  { action: 'read:any', attributes: '*', resource: 'profile', role: 'admin' },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'training_record',
    role: 'monitor',
  },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'training_record',
    role: 'admin',
  },
];

export const explodedJwt: P1JWT = {
  exp: 1599053095,
  iat: 1599052195,
  auth_time: 1599051245,
  jti: '76116e42-9ef8-485b-b091-44bd54199b79',
  iss: 'https://login.dsop.io/auth/realms/baby-yoda',
  aud: 'il4_191f836b-ec50-4819-ba10-1afaa5b99600_mission-widow',
  sub: '1575ab23-2fa4-4503-9a29-ee612e5fe7a0',
  typ: 'ID',
  azp: 'il4_191f836b-ec50-4819-ba10-1afaa5b99600_mission-widow',
  nonce: 'vtAYRawB2U9DhF0xC12qkNFbnOgca28AqVdt7w6_z6c',
  session_state: '338940c6-7364-4df0-99c2-878ca1fb224c',
  acr: '1',
  email_verified: true,
  'group-simple': [
    'Impact Level 2 Authorized',
    'Impact Level 4 Authorized',
    'Impact Level 5 Authorized',
  ],
  preferred_username: 'jake.a.jones',
  given_name: 'Jake',
  activecac: '',
  affiliation: 'USAF',
  'group-full': [
    '/Impact Level 2 Authorized',
    '/Impact Level 4 Authorized',
    '/Impact Level 5 Authorized',
  ],
  organization: 'USAF',
  name: 'Jake Alfred Jones',
  usercertificate: 'JONES.JAKE.ALFRED.2223332221',
  rank: 'SGT',
  family_name: 'Jones',
  email: 'jj@gmail.com',
  dod_id: '2223332221',
};
