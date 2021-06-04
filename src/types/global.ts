export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
}

export enum EResource {
  USER = 'user',
  RECORD = 'record',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  MEMBER_TRACKING_RECORD = 'membertrackingrecord',
  TRACKING_ITEM = 'tracking_item',
  MEMBER_TRACKING_ITEM = 'membertrackingitem',
  TRAINEE_RECORDS = 'traineerecords',
  AUHTORITY_RECORDS = 'authorityrecords',
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
