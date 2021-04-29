export enum ERole {
  ADMIN = 'admin',
  MEMBER = 'member',
  MONITOR = 'monitor',
}

export enum EResource {
  RECORD = 'record',
  DASHBOARD = 'dashboard',
  PROFILE = 'profile',
  TRAINING_RECORD = 'training_record',
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
