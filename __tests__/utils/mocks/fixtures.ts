import { P1_JWT } from '@tron/nextjs-auth-p1';
import { grants } from '../../../src/utils/Grants';

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

export { grants };
