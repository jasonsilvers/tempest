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
  TRACKING_ITEM = 'trackingitem',
  USER = 'user',
}

export enum EAttribute {
  ALL = '*',
}

export enum EAction {
  READ = 'read',
  READ_ANY = 'read:any',
  READ_OWN = 'read:own',
  CREATE = 'create',
  CREATE_OWN = 'create:own',
  CREATE_ANY = 'create:any',
  UPDATE = 'update',
  UPDATE_OWN = 'update:own',
  UPDATE_ANY = 'update:any',
  DELETE = 'delete',
  DELETE_ANY = 'delete:any',
  DELETE_OWN = 'delete:own',
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
