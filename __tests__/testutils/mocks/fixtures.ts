import { User } from '@prisma/client';
import { P1_JWT } from '@tron/nextjs-auth-p1';
import { EAction, EResource, ERole } from '../../../src/const/enums';
import { grants as realGrants } from '../../../src/const/grants';

const grants = [
  ...realGrants,
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.PROFILE_PAGE,
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

export const bobJones = {
  id: 123,
  firstName: 'bob',
  lastName: 'jones',
  role: {
    id: 22,
    name: ERole.MEMBER,
  },
  afsc: '12345',
  email: 'bob.jones@email.com',
  rank: 'TSgt/E-6',
  dutyTitle: 'Chief',
  organizationId: 1,
  organization: {
    id: 2,
    name: 'test org 1',
    shortName: 'org 1',
    parentId: 1,
  },
  reportingOrganizationId: 1,
  reportingOrganization: {
    id: 1,
    name: 'test org 1',
    shortName: 'org 1',
    parentId: 1,
  },
} as unknown as User;

export const andrewMonitor = {
  id: 321,
  firstName: 'andrew',
  lastName: 'monitor',
  role: {
    id: 21,
    name: ERole.MONITOR,
  },
  afsc: '12345',
  email: 'bob.jones@email.com',
  rank: 'Capt/O-3',
  dutyTitle: 'Chief',
  organizationId: 1,
  organization: {
    id: 1,
    name: 'test org 1',
    shortName: 'org 1',
    parentId: 1,
  },
  reportingOrganizationId: 2,
  reportingOrganization: {
    id: 2,
    name: 'test org 2',
    shortName: 'org 2',
    parentId: 1,
  },
} as unknown as User;

export const joeAdmin = {
  id: 321,
  firstName: 'joe',
  lastName: 'admin',
  role: {
    id: 2,
    name: ERole.ADMIN,
  },
  afsc: '12345',
  email: 'bob.jones@email.com',
  rank: 'E-6',
  dutyTitle: 'Chief',
  organizationId: 1,
  organization: {
    id: 2,
    name: 'test org 1',
    shortName: 'org 1',
    parentId: 1,
  },
} as unknown as User;

export { grants };
