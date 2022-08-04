import { EAction, EResource, ERole } from './enums';

export type Grants = {
  action: EAction;
  attributes: string;
  resource: EResource;
  role: string;
};

const pageGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.PROFILE_PAGE,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.PROFILE_PAGE,
    role: ERole.MEMBER,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.DASHBOARD_PAGE,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.ADMIN_PAGE,
    role: ERole.ADMIN,
  },
];

const memberTrackingItemGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.CREATE_OWN,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.DELETE_OWN,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: 'status',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MONITOR,
  },
];

const memberTrackingRecordsGrants: Grants[] = [
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: 'admin',
  },
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.CREATE_OWN,
    attributes: '*, !authorityId, !authoritySignedDate',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MEMBER,
  },
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.DELETE_OWN,
    attributes: '*, !authorityId',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MEMBER,
  },

  {
    action: EAction.UPDATE_ANY,
    attributes: 'authoritySignedDate, authorityId, completedDate',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate, completedDate',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate, completedDate',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MEMBER,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MEMBER,
  },
];

const userGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.USER,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'organizationId, tags, afsc, rank, address, dutyTitle, firstName, lastName',
    resource: EResource.USER,
    role: ERole.MEMBER,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.USER,
    role: ERole.MEMBER,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: 'tags, afsc, rank, address, dutyTitle, firstName, lastName',
    resource: EResource.USER,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: '*',
    resource: EResource.USER,
    role: ERole.ADMIN,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'organizationId, tags, afsc, rank, address, dutyTitle, firstName, lastName',
    resource: EResource.USER,
    role: ERole.MONITOR,
  },
];

const organizationGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.MEMBER,
  },

  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.ADMIN,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.ADMIN,
  },
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.ADMIN,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.ROLE,
    role: ERole.ADMIN,
  },
];

const mattermostGrants: Grants[] = [
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.MATTERMOST,
    role: ERole.ADMIN,
  },
];

const uploadGrants: Grants[] = [
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.UPLOAD,
    role: ERole.ADMIN,
  },
];

const trackingItemGrants: Grants[] = [
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.ADMIN,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: '*',
    resource: EResource.TRACKING_ITEM,
    role: ERole.ADMIN,
  },
];

const resourceGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.RESOURCE,
    role: ERole.ADMIN,
  },
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.RESOURCE,
    role: ERole.ADMIN,
  },
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.RESOURCE,
    role: ERole.ADMIN,
  },
];

const ppeItemGrants: Grants[] = [
  {
    action: EAction.CREATE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MEMBER,
  },

  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.DELETE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MEMBER,
  },
  {
    action: EAction.CREATE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.DELETE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: '*',
    resource: EResource.PPE_ITEM,
    role: ERole.MEMBER,
  },
];

const jobGrants: Grants[] = [
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.JOB,
    role: ERole.MONITOR,
  },
];

const rolesGrants: Grants[] = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.ROLE,
    role: ERole.ADMIN,
  },
  {
    action: EAction.CREATE_ANY,
    attributes: '*',
    resource: EResource.ROLE,
    role: ERole.ADMIN,
  },
  {
    action: EAction.UPDATE_ANY,
    attributes: '*',
    resource: EResource.ROLE,
    role: ERole.ADMIN,
  },
  {
    action: EAction.DELETE_ANY,
    attributes: '*',
    resource: EResource.ROLE,
    role: ERole.ADMIN,
  },
];

export const grants: Grants[] = [
  ...mattermostGrants,
  ...pageGrants,
  ...memberTrackingItemGrants,
  ...userGrants,
  ...memberTrackingRecordsGrants,
  ...organizationGrants,
  ...uploadGrants,
  ...trackingItemGrants,
  ...resourceGrants,
  ...ppeItemGrants,
  ...jobGrants,
  ...rolesGrants,
];
