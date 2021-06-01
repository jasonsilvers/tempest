import { P1_JWT } from '@tron/nextjs-auth-p1';

const memberTrackingItemGrants = [
  {
    action: 'read:any',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'monitor',
  },
  {
    action: 'read:own',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'member',
  },
  {
    action: 'create:any',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'monitor',
  },
  {
    action: 'create:own',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'member',
  },
  {
    action: 'delete:any',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'monitor',
  },
  {
    action: 'delete:own',
    attributes: '*',
    resource: 'membertrackingitem',
    role: 'member',
  },
  {
    action: 'update:any',
    attributes: 'isActive',
    resource: 'membertrackingitem',
    role: 'monitor',
  },
];

const memberTrackingRecordsGrants = [
  {
    action: 'create:any',
    attributes: '*',
    resource: 'membertrackingrecord',
    role: 'admin',
  },
  {
    action: 'create:any',
    attributes: '*',
    resource: 'membertrackingrecord',
    role: 'monitor',
  },
  {
    action: 'create:own',
    attributes: '*, !authorityId, !authoritySignedDate',
    resource: 'membertrackingrecord',
    role: 'member',
  },
  {
    action: 'delete:any',
    attributes: '*',
    resource: 'membertrackingrecord',
    role: 'monitor',
  },
  {
    action: 'delete:any',
    attributes: '*, !authorityId',
    resource: 'membertrackingrecord',
    role: 'member',
  },

  {
    action: 'update:any',
    attributes: 'authoritySignedDate, authorityId',
    resource: 'membertrackingrecord',
    role: 'monitor',
  },
  {
    action: 'update:own',
    attributes: 'traineeSignedDate',
    resource: 'membertrackingrecord',
    role: 'monitor',
  },
  {
    action: 'update:own',
    attributes: 'traineeSignedDate',
    resource: 'membertrackingrecord',
    role: 'member',
  },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'membertrackingrecord',
    role: 'monitor',
  },
  {
    action: 'read:any',
    attributes: '*',
    resource: 'membertrackingrecord',
    role: 'admin',
  },
];

const userGrants = [
  {
    action: 'read:any',
    attributes: '*',
    resource: 'user',
    role: 'monitor',
  },
  {
    action: 'read:own',
    attributes: '*',
    resource: 'user',
    role: 'member',
  },
];

export const grants = [
  ...memberTrackingItemGrants,
  ...userGrants,
  ...memberTrackingRecordsGrants,
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
    resource: 'profile',
    role: 'norole',
  },
];

export const explodedJwt: P1_JWT = {
  acr: '1',
  email_verified: true,
  'group-simple': ['Impact Level 2 Authorized', 'Impact Level 4 Authorized', 'Impact Level 5 Authorized'],
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
