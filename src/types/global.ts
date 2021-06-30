import { Role, Organization, Grant, TrackingItem } from '@prisma/client';
import { LoggedInUser } from '../repositories/userRepo';

export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
  NOROLE = 'norole',
}

export enum EResource {
  AUHTORITY_RECORDS = 'authorityrecords',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  MEMBER_TRACKING_RECORD = 'membertrackingrecord',
  MEMBER_TRACKING_ITEM = 'membertrackingitem',
  ORGANIZATION = 'organization',
  RECORD = 'record',
  TRAINEE_RECORDS = 'traineerecords',
  TRACKING_ITEM = 'trackingitem',
  USER = 'user',
  ROLE = 'role',
}

export enum EAttribute {
  ALL = '*',
}

export enum EAction {
  READ_ANY = 'read:any',
  READ_OWN = 'read:own',
  CREATE_OWN = 'create:own',
  CREATE_ANY = 'create:any',
  UPDATE_OWN = 'update:own',
  UPDATE_ANY = 'update:any',
  DELETE_ANY = 'delete:any',
  DELETE_OWN = 'delete:own',
}

export enum EFuncAction {
  READ = 'read',
  READ_ANY = 'readAny',
  READ_OWN = 'readOwn',
  CREATE = 'create',
  CREATE_OWN = 'createOwn',
  CREATE_ANY = 'createAny',
  UPDATE = 'update',
  UPDATE_OWN = 'updateOwn',
  UPDATE_ANY = 'updateAny',
  DELETE = 'delete',
  DELETE_ANY = 'deleteAny',
  DELETE_OWN = 'deleteOwn',
}

export enum ECategories {
  ALL = 'All',
  DONE = 'Done',
  UPCOMING = 'Upcoming',
  OVERDUE = 'Overdue',
  SIGNATURE_REQUIRED = 'Awaiting_Signature',
  ARCHIVED = 'Archived',
  TODO = 'To_Do',
}
export interface ITempestApiError {
  message: string;
}

export enum EUserIncludes {
  TRACKING_ITEMS = 'trackingitems',
}

export enum EUserResources {
  MEMBER_TRACKING_ITEMS = 'membertrackingitems',
  MEMBER_TRACKING_RECORDS = 'membertrackingrecords',
}

export type UsersDTO = {
  users: LoggedInUser[];
};

export type RolesDTO = {
  roles: Role[];
};

export type OrgsDTO = {
  organizations: Organization[];
};

export type GrantsDTO = {
  grants: Grant[];
};

export type TrackingItemsDTO = {
  trackingItems: TrackingItem[];
};
