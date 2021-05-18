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
  TRACKING_RECORD = 'tracking_record',
  TRACKING_ITEM = 'tracking_item',
  MEMBER_TRACKING_ITEM = 'membertrackingitem',
  TRAINEE_RECORDS = 'traineerecords',
  AUHTORITY_RECORDS = 'authorityrecords',
}

export enum EGrant {
  ALL = '*',
}

export enum EPermission {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  UPDATE_OWN = 'updateOwn',
  DELETE = 'delete',
}
export interface ITempestApiError {
  message: string;
}

export const ErrorMessage403 = {
  message: 'You do not have the appropriate permissions',
};
