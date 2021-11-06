'use strict';
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
exports.__esModule = true;
exports.grants = void 0;
var enums_1 = require('./enums');
var pageGrants = [
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.PROFILE_PAGE,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_OWN,
    attributes: '*',
    resource: enums_1.EResource.PROFILE_PAGE,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.DASHBOARD_PAGE,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.ADMIN_PAGE,
    role: enums_1.ERole.ADMIN,
  },
];
var memberTrackingItemGrants = [
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_OWN,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.CREATE_OWN,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.DELETE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.DELETE_OWN,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.UPDATE_ANY,
    attributes: 'isActive',
    resource: enums_1.EResource.MEMBER_TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
];
var memberTrackingRecordsGrants = [
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: 'admin',
  },
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.CREATE_OWN,
    attributes: '*, !authorityId, !authoritySignedDate',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.DELETE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.DELETE_OWN,
    attributes: '*, !authorityId',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.UPDATE_ANY,
    attributes: 'authoritySignedDate, authorityId, completedDate',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate, completedDate',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.UPDATE_OWN,
    attributes: 'traineeSignedDate, completedDate',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_OWN,
    attributes: '*',
    resource: enums_1.EResource.MEMBER_TRACKING_RECORD,
    role: enums_1.ERole.MEMBER,
  },
];
var userGrants = [
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.USER,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.UPDATE_OWN,
    attributes: 'organizationId, tags, afsc, rank, address, dutyTitle',
    resource: enums_1.EResource.USER,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.READ_OWN,
    attributes: '*',
    resource: enums_1.EResource.USER,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.UPDATE_ANY,
    attributes: 'tags, afsc, rank, address, dutyTitle',
    resource: enums_1.EResource.USER,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.UPDATE_OWN,
    attributes: 'organizationId, tags, afsc, rank, address, dutyTitle',
    resource: enums_1.EResource.USER,
    role: enums_1.ERole.MONITOR,
  },
];
var organizationGrants = [
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.ORGANIZATION,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_OWN,
    attributes: '*',
    resource: enums_1.EResource.ORGANIZATION,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.ORGANIZATION,
    role: enums_1.ERole.ADMIN,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.ROLE,
    role: enums_1.ERole.ADMIN,
  },
];
var mattermostGrants = [
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.MATTERMOST,
    role: enums_1.ERole.ADMIN,
  },
];
var uploadGrants = [
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.UPLOAD,
    role: enums_1.ERole.ADMIN,
  },
];
var trackingItemGrants = [
  {
    action: enums_1.EAction.DELETE_ANY,
    attributes: '*',
    resource: enums_1.EResource.TRACKING_ITEM,
    role: enums_1.ERole.ADMIN,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
  {
    action: enums_1.EAction.READ_ANY,
    attributes: '*',
    resource: enums_1.EResource.TRACKING_ITEM,
    role: enums_1.ERole.MEMBER,
  },
  {
    action: enums_1.EAction.CREATE_ANY,
    attributes: '*',
    resource: enums_1.EResource.TRACKING_ITEM,
    role: enums_1.ERole.MONITOR,
  },
];
exports.grants = __spreadArray(
  __spreadArray(
    __spreadArray(
      __spreadArray(
        __spreadArray(
          __spreadArray(
            __spreadArray(__spreadArray([], mattermostGrants, true), pageGrants, true),
            memberTrackingItemGrants,
            true
          ),
          userGrants,
          true
        ),
        memberTrackingRecordsGrants,
        true
      ),
      organizationGrants,
      true
    ),
    uploadGrants,
    true
  ),
  trackingItemGrants,
  true
);
