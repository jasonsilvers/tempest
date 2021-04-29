import { P1_JWT } from '@tron/nextjs-auth-p1';
import dayjs from 'dayjs';
export const grants = [
  {
    action: 'create:any',
    attributes: '*',
    resource: 'tracking_record',
    role: 'admin',
  },
  {
    action: 'delete:any',
    attributes: '*',
    resource: 'tracking_record',
    role: 'monitor',
  },
  {
    action: 'delete:any',
    attributes: '*, !authorityId',
    resource: 'tracking_record',
    role: 'member',
  },
  {
    action: 'update:any',
    attributes:
      'authoritySignedDate, authorityId, traineeSignedDate, traineeId',
    resource: 'tracking_record',
    role: 'monitor',
  },
  {
    action: 'update:any',
    attributes: 'traineeSignedDate, traineeId',
    resource: 'tracking_record',
    role: 'member',
  },
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
    resource: 'tracking_record',
    role: 'monitor',
  },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'tracking_record',
    role: 'admin',
  },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'tracking_record',
    role: 'norole',
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
  ],
  organization: 'USAF',
  name: 'Jake Alfred Jones',
  usercertificate: 'JONES.JAKE.ALFRED.2223332221',
  rank: 'SGT',
  family_name: 'Jones',
  email: 'jj@gmail.com',
  dod_id: '2223332221',
};
