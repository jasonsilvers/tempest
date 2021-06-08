import { EAction, EResource, ERole } from '../types/global';

const pageGrants = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.PROFILE,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.PROFILE,
    role: ERole.MEMBER,
  },
  { action: EAction.READ_ANY, attributes: '*', resource: EResource.PROFILE, role: ERole.MEMBER },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.PROFILE,
    role: 'norole',
  },
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.DASHBOARD,
    role: ERole.MONITOR,
  },
];

const memberTrackingItemGrants = [
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
    attributes: 'isActive',
    resource: EResource.MEMBER_TRACKING_ITEM,
    role: ERole.MONITOR,
  },
];

const memberTrackingRecordsGrants = [
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
    action: EAction.DELETE_ANY,
    attributes: '*, !authorityId',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MEMBER,
  },

  {
    action: EAction.UPDATE_ANY,
    attributes: 'authoritySignedDate, authorityId',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: ERole.MONITOR,
  },
  {
    action: EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate',
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
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.MEMBER_TRACKING_RECORD,
    role: 'admin',
  },
];

const userGrants = [
  {
    action: EAction.READ_ANY,
    attributes: '*',
    resource: EResource.USER,
    role: ERole.MONITOR,
  },
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.USER,
    role: ERole.MEMBER,
  },
];

const organizationGrants = [
  {
    action: EAction.READ_OWN,
    attributes: '*',
    resource: EResource.ORGANIZATION,
    role: ERole.MONITOR,
  },
];

export const grants = [
  ...pageGrants,
  ...memberTrackingItemGrants,
  ...userGrants,
  ...memberTrackingRecordsGrants,
  ...organizationGrants,
];
