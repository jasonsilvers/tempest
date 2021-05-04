import { P1_JWT } from '@tron/nextjs-auth-p1';
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

export const explodedJwt: P1_JWT = {
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
    '/tron/roles/admin',
  ],
  organization: 'USAF',
  name: 'Jake Alfred Jones',
  usercertificate: 'JONES.JAKE.ALFRED.2223332221',
  rank: 'SGT',
  family_name: 'Jones',
  email: 'jj@gmail.com',
  dod_id: '2223332221',
};
