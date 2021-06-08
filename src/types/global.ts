export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
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
  TRACKING_ITEM = 'tracking_item',
  USER = 'user',
}

export enum EAttribute {
  ALL = '*',
}

export enum EGrant {
  READ = 'read',
  READ_ANY = 'readAny',
  READ_OWN = 'readOwn',
  CREATE = 'create',
  UPDATE = 'update',
  UPDATE_OWN = 'updateOwn',
  DELETE = 'delete',
}

export enum ECategories {
  ALL = 'All',
  DONE = 'Done',
  UPCOMING = 'Upcoming',
  OVERDUE = 'Overdue',
  SIGNATURE_REQUIRED = 'SignatureRequired',
  ARCHIVED = 'Archived',
  DRAFT = 'Draft',
}
export interface ITempestApiError {
  message: string;
}
