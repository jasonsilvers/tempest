import { P1_JWT } from '@tron/nextjs-auth-p1';
import { EAction, EResource } from '../../../src/types/global';
import { grants as realGrants } from '../../../src/utils/Grants';

const grants = [
  ...realGrants,
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.PROFILE,
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
  'group-full': ['/Impact Level 2 Authorized', '/Impact Level 4 Authorized', '/Impact Level 5 Authorized'],
  organization: 'Us Air Force',
  name: 'Jake Alfred Jones',
  usercertificate: 'JONES.JAKE.ALFRED.2223332221',
  rank: 'E-6',
  family_name: 'Jones',
  email: 'jj@gmail.com',
  dod_id: '2223332221',
};

export const explodedJwt_admin: P1_JWT = {
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
  organization: 'US Air Force',
  name: 'Jake Alfred Jones',
  usercertificate: 'JONES.JAKE.ALFRED.2223332221',
  rank: 'E-6',
  family_name: 'Jones',
  email: 'jj@gmail.com',
  dod_id: '2223332221',
};

export { grants };
