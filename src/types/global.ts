export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
}

export enum EResource {
  RECORD = 'record',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  TRACKING_RECORD = 'tracking_record',
}

export enum EGrant {
  ALL = '*',
}

export enum EPermission {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum EResourceType {
  TRAINEE_RECORDS = 'traineerecords',
  AUHTORITY_RECORDS = 'authorityrecords',
}
